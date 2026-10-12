import { logger } from '@/utils/logger';
import { getSocket } from '@/services/socket';
import api from '../../api'

// ─────────────────────────────────────────────────────────────────
// Módulo de stories — mesmo padrão do módulo de reels/posts:
// as chamadas à API vivem nas próprias actions (sem service à parte),
// com actualizações optimistas e reversão em caso de erro.
// ─────────────────────────────────────────────────────────────────

let socketsBound = false;
let refreshTimer = null;

const sameId = (a, b) => String(a) === String(b);

// Procura um story em todos os grupos
function findStory(state, storyId) {
    for (const group of state.groups) {
        const story = group.stories.find(s => sameId(s._id, storyId));
        if (story) return { group, story };
    }
    return null;
}

export default {
    state: {
        // Cada grupo: { user, is_me, stories: [], latest_at, has_unseen }
        // Ordem: o meu primeiro → não vistos → mais recentes (vem do backend)
        groups: [],
        loading: false,
        loaded: false,
        viewer: { open: false, groupIndex: 0, storyIndex: 0 },
    },

    mutations: {
        SET_STORY_GROUPS(state, groups) {
            state.groups = groups || [];
            state.loaded = true;
        },
        SET_STORIES_LOADING(state, value) {
            state.loading = value;
        },

        OPEN_STORY_VIEWER(state, { groupIndex, storyIndex }) {
            state.viewer = { open: true, groupIndex, storyIndex };
        },
        SET_STORY_VIEWER_POSITION(state, { groupIndex, storyIndex }) {
            state.viewer.groupIndex = groupIndex;
            state.viewer.storyIndex = storyIndex;
        },
        CLOSE_STORY_VIEWER(state) {
            state.viewer = { open: false, groupIndex: 0, storyIndex: 0 };
        },

        MARK_STORY_VIEWED(state, storyId) {
            const found = findStory(state, storyId);
            if (!found) return;
            found.story.viewed = true;
            found.group.has_unseen = found.group.stories.some(s => !s.viewed);
        },
        SET_STORY_LIKED(state, { storyId, liked }) {
            const found = findStory(state, storyId);
            if (found) found.story.liked = liked;
        },
        UPDATE_STORY_COUNTS(state, { storyId, views_count, likes_count }) {
            const found = findStory(state, storyId);
            if (!found) return;
            if (views_count !== undefined) found.story.views_count = views_count;
            if (likes_count !== undefined) found.story.likes_count = likes_count;
        },
        ADD_MY_STORY(state, { story, user }) {
            let group = state.groups.find(g => g.is_me);

            if (!group) {
                group = {
                    user: {
                        _id: user._id,
                        name: user.name,
                        username: user.username,
                        profile_image: user.profile_image,
                        is_verified: user.is_verified,
                    },
                    is_me: true,
                    stories: [],
                    latest_at: story.created_at,
                    has_unseen: false,
                };
                state.groups.unshift(group);
            }

            group.stories.push(story);
            group.latest_at = story.created_at;
        },
        REMOVE_STORY(state, storyId) {
            const found = findStory(state, storyId);
            if (found) {
                found.group.stories = found.group.stories.filter(s => !sameId(s._id, storyId));
                found.group.has_unseen = found.group.stories.some(s => !s.viewed);
            }
            // grupo sem stories deixa de existir
            state.groups = state.groups.filter(g => g.stories.length > 0);
        },
    },

    actions: {
        // ── Feed ────────────────────────────────────────────────────
        // options: { silent } — silent=true não mostra esqueleto (refresh em segundo plano)
        async loadStories({ commit, state }, { silent = false } = {}) {
            if (state.loading) return;
            if (!silent) commit('SET_STORIES_LOADING', true);

            try {
                const response = await api.get('/stories');
                commit('SET_STORY_GROUPS', response.data.items);
            } catch (error) {
                logger.error('Erro ao buscar stories:', error?.response?.data?.message || error);
                if (!state.loaded) commit('SET_STORY_GROUPS', []);
            } finally {
                commit('SET_STORIES_LOADING', false);
            }
        },

        // ── Viewer ──────────────────────────────────────────────────
        // Abre no grupo do utilizador, começando no primeiro story não visto
        openStoryViewer({ commit, state }, { userId, storyId = null }) {
            const groupIndex = state.groups.findIndex(g => sameId(g.user._id, userId));
            if (groupIndex === -1) return;

            const stories = state.groups[groupIndex].stories;
            let storyIndex = 0;

            if (storyId) {
                storyIndex = Math.max(0, stories.findIndex(s => sameId(s._id, storyId)));
            } else {
                const firstUnseen = stories.findIndex(s => !s.viewed);
                storyIndex = firstUnseen === -1 ? 0 : firstUnseen;
            }

            commit('OPEN_STORY_VIEWER', { groupIndex, storyIndex });
        },

        closeStoryViewer({ commit }) {
            commit('CLOSE_STORY_VIEWER');
        },

        // Optimista: marca localmente e avisa o servidor em segundo plano
        markStoryViewed({ commit }, storyId) {
            commit('MARK_STORY_VIEWED', storyId);
            api.post(`/stories/${storyId}/view`).catch((error) => {
                logger.warn('Erro ao registar visualização do story:', error?.response?.data?.message);
            });
        },

        // ── Interacções ─────────────────────────────────────────────
        async toggleStoryLike({ commit, state }, storyId) {
            const found = findStory(state, storyId);
            if (!found) return;

            const previous = !!found.story.liked;
            commit('SET_STORY_LIKED', { storyId, liked: !previous });

            try {
                const response = await api.post(`/stories/${storyId}/like`);
                const liked = !!response.data.liked;
                commit('SET_STORY_LIKED', { storyId, liked });
                return liked;
            } catch (error) {
                logger.error('Erro ao curtir story:', error?.response?.data?.message || error);
                commit('SET_STORY_LIKED', { storyId, liked: previous });
                throw error;
            }
        },

        // A resposta vira uma mensagem directa (message_type: 'story_reply')
        async sendStoryReply(_, { storyId, content }) {
            try {
                await api.post(`/stories/${storyId}/reply`, { content });
            } catch (error) {
                logger.error('Erro ao responder story:', error?.response?.data?.message || error);
                throw error;
            }
        },

        async fetchStoryViewers(_, { storyId, page = 1 }) {
            try {
                const response = await api.get(`/stories/${storyId}/viewers`, { params: { page } });
                return response.data;
            } catch (error) {
                logger.error('Erro ao buscar visualizações do story:', error?.response?.data?.message || error);
                throw error;
            }
        },

        async toggleMuteStoryUser({ dispatch }, userId) {
            try {
                const response = await api.post(`/stories/mute/${userId}`);
                await dispatch('loadStories', { silent: true });
                return response.data;
            } catch (error) {
                logger.error('Erro ao silenciar stories:', error?.response?.data?.message || error);
                throw error;
            }
        },

        // ── Publicar / excluir ──────────────────────────────────────
        async publishStory({ commit, rootGetters }, payload) {
            try {
                const response = await api.post('/stories', payload);
                commit('ADD_MY_STORY', { story: response.data.data, user: rootGetters.currentUser });
                return response.data.data;
            } catch (error) {
                logger.error('Erro ao publicar story:', error?.response?.data?.message || error);
                throw error;
            }
        },

        async deleteStory({ commit }, storyId) {
            try {
                await api.delete(`/stories/${storyId}`);
                commit('REMOVE_STORY', storyId);
            } catch (error) {
                logger.error('Erro ao excluir story:', error?.response?.data?.message || error);
                throw error;
            }
        },

        // Arquivo do autor (inclui expirados). Não guarda em cache.
        async getStoryArchive(_, { page = 1 } = {}) {
            try {
                const response = await api.get('/stories/me/archive', { params: { page } });
                return response.data;
            } catch (error) {
                logger.error('Erro ao buscar arquivo de stories:', error?.response?.data?.message || error);
                throw error;
            }
        },

        // ── Upload ──────────────────────────────────────────────────
        // Upload directo para o Cloudinary (unsigned preset) com progresso.
        // Env: VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.
        // Se já tens outro serviço de upload, troca só o corpo desta action
        // mantendo o retorno { url, public_id, thumb, width, height, duration, size }.
        uploadStoryMedia(_, { file, onProgress }) {
            return new Promise((resolve, reject) => {
                const isVideo = file.type.startsWith('video/');
                const cloud = 'daujoblcc' //import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const preset = 'social_media_upload';

                if (!cloud || !preset) {
                    reject(new Error('Upload não configurado'));
                    return;
                }

                const form = new FormData();
                form.append('file', file);
                form.append('upload_preset', preset);
                form.append('folder', 'stories');

                const xhr = new XMLHttpRequest();
                xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud}/${isVideo ? 'video' : 'image'}/upload`);

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
                };

                xhr.onload = () => {
                    if (xhr.status < 200 || xhr.status >= 300) {
                        logger.error('Erro no upload do story:', xhr.responseText);
                        reject(new Error('Falha no upload'));
                        return;
                    }

                    const res = JSON.parse(xhr.responseText);
                    const url = res.secure_url;
                    const thumb = isVideo
                        ? url.replace('/upload/', '/upload/so_0,w_480,c_fill,ar_9:16/').replace(/\.[a-z0-9]+$/i, '.jpg')
                        : url.replace('/upload/', '/upload/w_480,c_fill,ar_9:16,q_auto/');

                    resolve({
                        url,
                        public_id: res.public_id,
                        thumb,
                        width: res.width,
                        height: res.height,
                        duration: res.duration || 0,
                        size: res.bytes,
                    });
                };

                xhr.onerror = () => reject(new Error('Sem conexão. Tenta novamente.'));
                xhr.send(form);
            });
        },

        // ── Tempo real ──────────────────────────────────────────────
        // Chamar uma vez (ex.: na tela de Mensagens ou no App.vue)
        initStorySockets({ commit, dispatch }) {
            if (socketsBound) return;

            const socket = getSocket?.();
            if (!socket) return; // tenta de novo na próxima chamada
            socketsBound = true;

            // vários eventos seguidos viram um único refresh
            const scheduleRefresh = () => {
                clearTimeout(refreshTimer);
                refreshTimer = setTimeout(() => dispatch('loadStories', { silent: true }), 600);
            };

            socket.on('new_story', scheduleRefresh);
            socket.on('story_deleted', ({ story_id }) => commit('REMOVE_STORY', story_id));
            socket.on('story_viewed', ({ story_id, views_count }) =>
                commit('UPDATE_STORY_COUNTS', { storyId: story_id, views_count })
            );
            socket.on('story_liked', ({ story_id, likes_count, views_count }) =>
                commit('UPDATE_STORY_COUNTS', { storyId: story_id, likes_count, views_count })
            );
        },
    },

    getters: {
        storyGroups: (state) => state.groups,
        storiesLoading: (state) => state.loading,
        storiesLoaded: (state) => state.loaded,
        storyViewer: (state) => state.viewer,
        myStoryGroup: (state) => state.groups.find(g => g.is_me) || null,
        friendsStoryGroups: (state) => state.groups.filter(g => !g.is_me),

        // 'unseen' | 'seen' | 'none' — para o anel no avatar (ChatList, perfil…)
        storyRingState: (state) => (userId) => {
            const group = state.groups.find(g => sameId(g.user._id, userId));
            if (!group || !group.stories.length) return 'none';
            if (group.is_me) return 'seen';
            return group.stories.some(s => !s.viewed) ? 'unseen' : 'seen';
        },
    },
};