import { logger } from '@/utils/logger';
import api from '../../api'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const CLOUD_NAME = 'daujoblcc';
const UPLOAD_PRESET = 'social_media_upload';

async function uploadSingleMedia(media, onProgress) {
    const formData = new FormData();
    formData.append('file', media.file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    formData.append('folder', media.type === 'video' ? 'videos' : 'images');

    if (media.type === 'video') {
        formData.append('resource_type', 'video');
        formData.append('public_id', `video_${Date.now()}`);
    }

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        formData,
        {
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
            },
        }
    );

    if (!response.data) throw new Error('Erro ao carregar mídia');

    const hlsUrl = media.type === 'video'
        ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_hd/${response.data.public_id}.m3u8`
        : null;

    const thumbnailUrl = media.type === 'video'
        ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${response.data.width},h_${response.data.height},c_fill,q_auto,f_jpg,so_2/${response.data.public_id}.jpg`
        : null;

    return {
        public_id: response.data.public_id,
        url: media.type === 'video'
            ? hlsUrl
            : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_80,w_1200/${response.data.public_id}`,
        thumbnail: thumbnailUrl,
        type: media.type,
        format: media.type === 'video' ? 'm3u8' : response.data.format,
        width: response.data.width,
        height: response.data.height,
    }
}

const upvotePostQueues = new Map(); // key: `${module}:${postId}` -> { pendingCount, inFlight, timer }
const UPVOTE_POST_DEBOUNCE_MS = 400;

function getPostQueueEntry(key) {
    if (!upvotePostQueues.has(key)) {
        upvotePostQueues.set(key, { pendingCount: 0, inFlight: false, timer: null });
    }
    return upvotePostQueues.get(key);
}

// Localiza o post atual no estado (lista do módulo, com fallback pro post individual)
function findTargetPost(state, postId, module) {
    const moduleEntry = state.posts.find(m => m.module === module);
    const post = moduleEntry?.posts?.find(p => p._id === postId);
    const singlePost = state.post;

    return post || singlePost || null;
}

// Aplica UM toggle local (otimista). Reusada tanto no clique quanto na reversão de erro.
function applyLocalPostToggle({ commit, state }, { postId, module, userId }) {
    const targetPost = findTargetPost(state, postId, module);
    if (!targetPost) {
        logger.warn("Post não encontrado no estado local");
        return;
    }

    const updatedUpvotes = [...(targetPost.upvotes || [])];
    let updatedUpvotesCount = targetPost.upvotes_count || 0;

    const userIndex = updatedUpvotes.indexOf(userId);
    if (userIndex !== -1) {
        updatedUpvotes.splice(userIndex, 1);
        updatedUpvotesCount -= 1;
    } else {
        updatedUpvotes.push(userId);
        updatedUpvotesCount += 1;
    }

    commit("UPDATE_REACTIONS_POST", {
        module,
        payload: {
            post_id: targetPost._id,
            upvotes: updatedUpvotes,
            upvotes_count: updatedUpvotesCount,
            downvotes: targetPost.downvotes || [],
            downvotes_count: targetPost.downvotes_count || 0,
            comments_count: targetPost.comments_count || 0,
            shares_count: targetPost.shares_count || 0
        }
    });
}

// Decide se envia a chamada de rede e encadeia a próxima verificação ao terminar.
async function runPostFlush(ctx, args) {
    const { postId, module } = args;
    const key = `${module}:${postId}`;
    const queue = getPostQueueEntry(key);

    if (queue.inFlight) return;
    if (queue.pendingCount === 0) return;

    const isNetToggle = queue.pendingCount % 2 === 1;
    queue.pendingCount = 0;

    if (!isNetToggle) return; // cliques em par = estado líquido inalterado

    queue.inFlight = true;
    try {
        await api.put(`/posts/${postId}/toggle-upvote`);
    } catch (error) {
        logger.error("Erro ao persistir upvote na API:", error?.response?.message);
        // reverte exatamente o efeito líquido desta chamada, sobre o estado ATUAL
        applyLocalPostToggle(ctx, args);
    } finally {
        queue.inFlight = false;
        runPostFlush(ctx, args); // reavalia na hora, sem novo debounce
    }
}

function schedulePostFlush(ctx, args) {
    const key = `${args.module}:${args.postId}`;
    const queue = getPostQueueEntry(key);
    clearTimeout(queue.timer);
    queue.timer = setTimeout(() => runPostFlush(ctx, args), UPVOTE_POST_DEBOUNCE_MS);
}

export default {
    state: {
        posts: [],
        post: {},
        parentPost: {},
        uploadingPost: null,
    },
    mutations: {
        START_BACKGROUND_POST(state, { id, hasMedia }) {
            state.uploadingPost = {
                id,
                progress: hasMedia ? 0 : 100,
                status: hasMedia ? 'uploading' : 'publishing',
                error: null,
            };
        },
        SET_BACKGROUND_POST_PROGRESS(state, { id, progress }) {
            if (state.uploadingPost?.id !== id) return;
            state.uploadingPost.progress = progress;
        },
        SET_BACKGROUND_POST_STATUS(state, { id, status, error = null }) {
            if (state.uploadingPost?.id !== id) return;
            state.uploadingPost.status = status;
            state.uploadingPost.error = error;
        },
        CLEAR_BACKGROUND_POST(state, { id } = {}) {
            if (id && state.uploadingPost?.id !== id) return;
            state.uploadingPost = null;
        },
        PUSH_MODULE_FROM_POSTS(state, payload) {
            const posts = state.posts;

            if (!posts) return;

            const byModule = payload?.module || null

            const index = posts.findIndex(p => p.module === byModule)

            if (index === -1) {
                posts.push(payload);
            } else {
                const cachedModule = state.posts[index];
                const posts = payload?.posts || []
                const { page, totalPages, hasMore } = payload?.pagination || {}

                if (!posts.length) return

                // Filtra os novos posts para remover quaisquer que já existam no cache
                const uniqueNewPosts = posts.filter(
                    (newPost) =>
                        !cachedModule.posts.some(
                            (existingPost) => existingPost._id === newPost._id
                        )
                );

                cachedModule.posts = [...cachedModule.posts, ...uniqueNewPosts];
                cachedModule.pagination.page = page;
                cachedModule.pagination.totalPages = totalPages;
                cachedModule.pagination.hasMore = hasMore
            }
        },
        SET_POSTS_FROM_MODULE(state, payload) {
            const posts = state.posts;

            if (!posts) return;

            const byModule = payload?.module || null

            const index = posts.findIndex(p => p.module === byModule)

            if (index !== -1) {
                const cachedModule = state.posts[index];
                const posts = payload?.posts || []
                const { page, totalPages, hasMore } = payload?.pagination || {}

                cachedModule.posts = posts;
                cachedModule.pagination.page = page;
                cachedModule.pagination.totalPages = totalPages;
                cachedModule.pagination.hasMore = hasMore
            } else {
                posts.push(payload);
            }
        },
        SET_POST(state, payload) {
            state.post = payload
        },
        SET_PARENT_POST(state, payload) {
            state.parentPost = payload
        },
        DELETE_POST(state, postId) {
            // Remove a postagem do array
            state.posts = state.posts.filter(post => post._id !== postId);

            // Se tiver paginação, também remove do cache de páginas
            if (state.pagePosts) {
                // Remove de todas as páginas
                Object.keys(state.pagePosts).forEach(pageKey => {
                    state.pagePosts[pageKey] = state.pagePosts[pageKey].filter(
                        post => post._id !== postId
                    );
                });
            }
        },

        // Nova mutation específica para remover de um módulo específico
        REMOVE_POST_FROM_MODULE(state, { moduleName, postId }) {
            if (!moduleName || !postId) return;

            const moduleIndex = state.posts.findIndex(m => m.module === moduleName);

            if (moduleIndex !== -1) {
                const module = state.posts[moduleIndex];
                if (module?.posts?.length) {
                    module.posts = module.posts.filter(post => post._id !== postId);
                }
            }
        },

        RESET_PARENT_POST(state) {
            state.parentPost = {}
        },
        UPDATE_REACTIONS_POST(state, { module, payload }) {
            if (!module || !payload) return

            const {
                post_id,
                upvotes,
                upvotes_count,
                downvotes,
                comments_count,
                shares_count,
                downvotes_count
            } = payload

            const modulePosts = state.posts.find(m => m.module === module)

            if (modulePosts?.posts?.length) {
                const post = modulePosts.posts.find(p => p?._id === post_id)

                if (post) {
                    post.upvotes = upvotes
                    post.upvotes_count = upvotes_count
                    post.downvotes = downvotes
                    post.downvotes_count = downvotes_count
                    post.comments_count = comments_count
                    post.shares_count = shares_count
                }

                if (module !== 'feed') {
                    const moduleFeedPosts = state.posts.find(m => m.module === 'feed')

                    if (moduleFeedPosts?.posts?.length) {
                        const post = moduleFeedPosts.posts.find(p => p?._id === post_id)

                        if (post) {
                            post.upvotes = upvotes
                            post.upvotes_count = upvotes_count
                            post.downvotes = downvotes
                            post.downvotes_count = downvotes_count
                            post.comments_count = comments_count
                            post.shares_count = shares_count
                        }
                    }
                } else if (module !== 'profile') {
                    const moduleProfilePosts = state.posts.find(m => m.module === 'profile')

                    if (moduleProfilePosts?.posts?.length) {
                        const post = moduleProfilePosts.posts.find(p => p?._id === post_id)

                        if (post) {
                            post.upvotes = upvotes
                            post.upvotes_count = upvotes_count
                            post.downvotes = downvotes
                            post.downvotes_count = downvotes_count
                            post.comments_count = comments_count
                            post.shares_count = shares_count
                        }
                    }
                }
            }

            const post = state.post

            if (post?._id === post_id) {
                post.upvotes = upvotes
                post.upvotes_count = upvotes_count
                post.downvotes = downvotes
                post.downvotes_count = downvotes_count
                post.comments_count = comments_count
                post.shares_count = shares_count
            }
        },
        UPDATE_PAGINATION_POSTS_FROM_CACHE(state, payload) {
            const modulePosts = state.posts;

            if (!modulePosts?.length) return;

            const module = payload?.module || null

            const index = modulePosts.findIndex(m => m.module === module)

            if (index !== -1) {
                const { scrollTop } = payload

                state.posts[index].pagination = {
                    ...state.posts[index].pagination,
                    ...(scrollTop && {
                        scrollTop
                    })
                }
            }
        },
        INC_COMMENTS_COUNT_FROM_POST(state, postId) {
            const post = state.post

            if (post && post?._id === postId) {
                post.comments_count += 1
            }
        }
    },
    actions: {
        async createPost({ commit }, data) {
            try {
                const response = await api.post('/posts', data);
                const { new_post } = response.data

                commit("SET_POST", new_post)

                return new_post
            } catch (error) {
                logger.error(error);
            }
        },
        async getPostById({ commit }, { postId, type = 'post' }) {
            try {
                const response = await api.get('/posts/' + postId);
                const { post } = response.data

                if (type == 'post') {
                    commit("SET_POST", post)
                } else if (type == 'parentPost') {
                    commit("SET_PARENT_POST", post)
                }


                return post
            } catch (err) {
                logger.error(err);
                throw err
            }
        },
        async deletePost({ commit, state }, postId) {
            try {
                // Faz a requisição para deletar
                const response = await api.delete(`/posts/${postId}`);

                if (response.data.success) {
                    // Commit das mutations para remover a postagem
                    commit('DELETE_POST', postId);

                    // Se tiver profile com posts, remove também
                    if (state.profile && state.profile.posts) {
                        state.profile.posts = state.profile.posts.filter(
                            post => post._id !== postId
                        );
                        commit('UPDATE_PROFILE', {
                            posts: state.profile.posts
                        });
                    }

                    // Decrementa contador de posts do perfil se existir
                    if (state.profile && state.profile.posts_count !== undefined) {
                        commit('UPDATE_PROFILE', {
                            posts_count: Math.max(0, state.profile.posts_count - 1)
                        });
                    }
                }

                return response.data;
            } catch (error) {
                logger.error("Erro ao deletar postagem:", error?.response?.data?.message || error);
                throw error;
            }
        },
        async getFeedPosts({ commit }, query) {
            try {
                const { isRefresh = false, module, hasTotal, page: currentPage, limit } = query

                const response = await api.get('/posts/feed', {
                    params: {
                        page: currentPage,
                        total: hasTotal,
                        limit: limit
                    }
                });

                const { posts, page, totalPages, total, hasMore } = response.data

                const payload = {
                    module,
                    posts,
                    isRefresh,
                    pagination: {
                        page,
                        total,
                        hasMore,
                        totalPages,
                    }
                }

                if (isRefresh) {
                    commit("SET_POSTS_FROM_MODULE", payload)
                } else {
                    commit("PUSH_MODULE_FROM_POSTS", payload)
                }

            } catch (error) {
                logger.error(error);
            }
        },
        async getProfilePosts({ commit }, query) {
            try {
                const { isRefresh = false, module, userId, isPush = true, type = 'post', hasTotal, page: currentPage, limit } = query

                const response = await api.get('/posts/user/' + userId, {
                    params: {
                        page: currentPage,
                        type,
                        total: hasTotal,
                        limit: limit
                    }
                });

                const { posts, page, totalPages, total, hasMore } = response.data

                const payload = {
                    module,
                    posts,
                    isRefresh,
                    pagination: {
                        page,
                        total,
                        hasMore,
                        totalPages,
                    }
                }


                if (isPush && posts?.length && !isRefresh) {
                    commit("PUSH_MODULE_FROM_POSTS", payload)
                } else {
                    commit("SET_POSTS_FROM_MODULE", payload)
                }

            } catch (err) {
                logger.error("Erro ao carregar mais postagens:", err?.response?.data?.message || err);
                throw err
            }
        },
        toggleUpvotePost(ctx, { postId, module, userId }) {
            const args = { postId, module, userId };
            const key = `${module}:${postId}`;
            const queue = getPostQueueEntry(key);

            try {
                // 1. UI: alterna na hora, sempre
                applyLocalPostToggle(ctx, args);

                // 2. Conta o clique e (re)agenda a avaliação com debounce
                queue.pendingCount++;
                schedulePostFlush(ctx, args);
            } catch (error) {
                logger.error("Erro ao processar toggle de upvote:", error?.message);
            }
        },
        async toggleDownvotePost({ commit }, { postId, module, userId }) {
            try {
                const response = await api.put(`/posts/${postId}/toggle-downvote`);

                const { post } = response.data
                const { upvotes, upvotes_count, downvotes, comments_count, shares_count, downvotes_count } = post

                const payload = {
                    post_id: post?._id,
                    upvotes,
                    upvotes_count,
                    downvotes,
                    comments_count,
                    shares_count,
                    downvotes_count
                }

                commit("UPDATE_REACTIONS_POST", {
                    payload,
                    module
                })
            } catch (error) {
                logger.error("Erro ao adicionar/remover voto positivo na postagem:", error?.response?.message);
            }
        },
        async submitPostWithMedia({ commit, dispatch }, payload) {
            const { content, mediaFiles = [], sharedPost, isAnonymous, topics, audience, module } = payload;
            const id = uuidv4();

            commit('START_BACKGROUND_POST', { id, hasMedia: mediaFiles.length > 0 });

            try {
                const uploadedMedia = [];

                for (let i = 0; i < mediaFiles.length; i++) {
                    const media = mediaFiles[i];
                    const uploaded = await uploadSingleMedia(media, (fileProgress) => {
                        // progresso combinado: cada ficheiro vale uma fração igual do total
                        const overall = Math.round(((i + fileProgress / 100) / mediaFiles.length) * 100);
                        commit('SET_BACKGROUND_POST_PROGRESS', { id, progress: Math.min(overall, 99) });
                    });
                    uploadedMedia.push(uploaded);
                }

                commit('SET_BACKGROUND_POST_STATUS', { id, status: 'publishing' });

                const postData = {
                    content,
                    media: uploadedMedia,
                    sharedPost: sharedPost || null,
                    isAnonymous,
                    topics: topics || [],
                    audience,
                    module,
                };

                // Reaproveita a tua action existente de criação de post.
                const newPost = await dispatch('createPost', postData);

                commit('SET_BACKGROUND_POST_PROGRESS', { id, progress: 100 });
                commit('SET_BACKGROUND_POST_STATUS', { id, status: 'success' });

                // Some o indicador passado um curto período, para o utilizador ver o "concluído".
                setTimeout(() => commit('CLEAR_BACKGROUND_POST', { id }), 2000);

                return newPost;
            } catch (err) {
                commit('SET_BACKGROUND_POST_STATUS', {
                    id,
                    status: 'error',
                    error: err?.message || 'Erro ao publicar o post.',
                });
                // Deixa o erro visível por mais tempo antes de limpar.
                setTimeout(() => commit('CLEAR_BACKGROUND_POST', { id }), 5000);
                throw err;
            }
        },
    },
    getters: {
        currentPost: (state) => state.post,
        parentPost: (state) => state.parentPost,
        uploadingPost: (state) => state.uploadingPost,
        modulePosts: (state) => state.posts,
    }
}