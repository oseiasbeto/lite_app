import { logger } from '@/utils/logger';
import api from '../../api'

// ─────────────────────────────────────────────────────────────────
// Fila de debounce para likes de reels — MESMO padrão do módulo de
// posts (toggleUpvotePost), porque um "gosto" num reel é, por baixo,
// um upvote no post dono do vídeo (post_id vindo do getReelsFeed).
// Cliques repetidos e rápidos (duplo-toque no vídeo, por ex.) só
// disparam UMA chamada de rede com o efeito líquido, evitando
// bombardear a API se o utilizador tocar várias vezes seguidas.
// ─────────────────────────────────────────────────────────────────
const likeReelQueues = new Map(); // key: `${module}:${reelId}` -> { pendingCount, inFlight, timer }
const LIKE_REEL_DEBOUNCE_MS = 400;

function getLikeQueueEntry(key) {
    if (!likeReelQueues.has(key)) {
        likeReelQueues.set(key, { pendingCount: 0, inFlight: false, timer: null });
    }
    return likeReelQueues.get(key);
}

// Localiza o reel actual no estado (cache do módulo indicado)
function findTargetReel(state, reelId, module) {
    const moduleEntry = state.reels.find(m => m.module === module);
    return moduleEntry?.items?.find(r => r.id === reelId) || null;
}

// Aplica UM toggle local de gosto (optimista). Reusada tanto no
// clique quanto na reversão de erro.
function applyLocalLikeToggle({ commit, state }, { reelId, module, postId }) {
    const targetReel = findTargetReel(state, reelId, module);
    if (!targetReel) {
        logger.warn("Reel não encontrado no estado local");
        return;
    }

    const liked = !targetReel.liked;
    const likes = Math.max(0, (targetReel.stats?.likes || 0) + (liked ? 1 : -1));

    commit("UPDATE_REEL_REACTION", {
        module,
        payload: { reel_id: targetReel.id, liked, likes }
    });
}

async function runLikeFlush(ctx, args) {
    const { reelId, module, postId } = args;
    const key = `${module}:${reelId}`;
    const queue = getLikeQueueEntry(key);

    if (queue.inFlight) return;
    if (queue.pendingCount === 0) return;

    const isNetToggle = queue.pendingCount % 2 === 1;
    queue.pendingCount = 0;

    if (!isNetToggle) return; // cliques em par = estado líquido inalterado

    queue.inFlight = true;
    try {
        // Reaproveita o MESMO endpoint de upvote de posts — um reel é
        // sempre a media de vídeo de um Post, e o "gosto" é o upvote
        // desse post (ver post_id devolvido pelo getReelsFeed).
        await api.put(`/posts/${postId}/toggle-upvote`);
    } catch (error) {
        logger.error("Erro ao persistir gosto do reel na API:", error?.response?.message);
        // reverte exactamente o efeito líquido desta chamada, sobre o estado ACTUAL
        applyLocalLikeToggle(ctx, args);
    } finally {
        queue.inFlight = false;
        runLikeFlush(ctx, args); // reavalia na hora, sem novo debounce
    }
}

function scheduleLikeFlush(ctx, args) {
    const key = `${args.module}:${args.reelId}`;
    const queue = getLikeQueueEntry(key);
    clearTimeout(queue.timer);
    queue.timer = setTimeout(() => runLikeFlush(ctx, args), LIKE_REEL_DEBOUNCE_MS);
}

export default {
    state: {
        // Cache por módulo — o mesmo reel pode aparecer em vários sítios
        // (ex.: aba principal de Reels e a grelha de reels do perfil),
        // cada um com a sua própria paginação/posição, tal como o store
        // de posts já faz para feed/profile.
        //
        // Cada entrada: { module, feedType, items: [], pagination: {
        //   page, total, totalPages, hasMore, activeIndex }, fallback }
        reels: [],
        reelsSeed: {}, // reel único (deep link / partilha directa)
    },
    mutations: {
        SET_REELS_FROM_MODULE(state, payload) {
            const { module, feedType, items, pagination, fallback } = payload;
            const index = state.reels.findIndex(m => m.module === module);

            const entry = {
                module,
                feedType,
                items: items || [],
                pagination: {
                    page: pagination?.page || 1,
                    total: pagination?.total || 0,
                    totalPages: pagination?.totalPages || 0,
                    hasMore: !!pagination?.hasMore,
                    activeIndex: 0,
                },
                fallback: fallback || null,
            };

            if (index === -1) {
                state.reels.push(entry);
            } else {
                // preserva a posição em que o utilizador estava, se já existir
                entry.pagination.activeIndex = state.reels[index].pagination?.activeIndex || 0;
                state.reels.splice(index, 1, entry);
            }
        },
        PUSH_REELS_TO_MODULE(state, payload) {
            const { module, feedType, items, pagination, fallback } = payload;
            const index = state.reels.findIndex(m => m.module === module);

            if (!items?.length) return;

            if (index === -1) {
                state.reels.push({
                    module,
                    feedType,
                    items,
                    pagination: {
                        page: pagination?.page || 1,
                        total: pagination?.total || 0,
                        totalPages: pagination?.totalPages || 0,
                        hasMore: !!pagination?.hasMore,
                        activeIndex: 0,
                    },
                    fallback: fallback || null,
                });
                return;
            }

            const cachedModule = state.reels[index];

            // remove duplicados (mesma media pode reaparecer entre páginas
            // se novos posts forem publicados enquanto o utilizador pagina)
            const uniqueNewItems = items.filter(
                (newItem) => !cachedModule.items.some((existing) => existing.id === newItem.id)
            );

            cachedModule.items = [...cachedModule.items, ...uniqueNewItems];
            cachedModule.feedType = feedType;
            cachedModule.pagination.page = pagination?.page ?? cachedModule.pagination.page;
            cachedModule.pagination.total = pagination?.total ?? cachedModule.pagination.total;
            cachedModule.pagination.totalPages = pagination?.totalPages ?? cachedModule.pagination.totalPages;
            cachedModule.pagination.hasMore = !!pagination?.hasMore;
            cachedModule.fallback = fallback ?? cachedModule.fallback;
        },
        RESET_REELS_MODULE(state, module) {
            const index = state.reels.findIndex(m => m.module === module);
            if (index !== -1) state.reels.splice(index, 1);
        },
        UPDATE_REELS_ACTIVE_INDEX(state, { module, index }) {
            const moduleEntry = state.reels.find(m => m.module === module);
            if (!moduleEntry) return;
            moduleEntry.pagination.activeIndex = index;
        },
        SET_REELS_SEED(state, seedItem) {
            console.log(seedItem)
            state.reelsSeed = seedItem
        },
        UPDATE_REEL_REACTION(state, { module, payload }) {
            const { reel_id, liked, likes } = payload;

            const applyToReel = (reel) => {
                reel.liked = liked;
                reel.stats.likes = likes;
            };

            // Sincroniza em QUALQUER módulo cacheado onde este reel apareça
            // (evita likes dessincronizados entre aba principal e perfil)
            state.reels.forEach((moduleEntry) => {
                const reel = moduleEntry?.items?.find(r => r.id === reel_id);
                if (reel) applyToReel(reel);
            });

            if (state.reel?.id === reel_id) applyToReel(state.reel);
        },
        UPDATE_REEL_SAVE(state, { reel_id, saved }) {
            state.reels.forEach((moduleEntry) => {
                const reel = moduleEntry?.items?.find(r => r.id === reel_id);
                if (reel) reel.saved = saved;
            });
            if (state.reel?.id === reel_id) state.reel.saved = saved;
        },
        UPDATE_REEL_FOLLOW(state, { author_id, is_following }) {
            state.reels.forEach((moduleEntry) => {
                moduleEntry?.items?.forEach((reel) => {
                    if (reel.author?.id === author_id) reel.author.isFollowing = is_following;
                });
            });
            if (state.reel?.author?.id === author_id) state.reel.author.isFollowing = is_following;
        },
        INC_REEL_COMMENTS_COUNT(state, { reel_id, by = 1 }) {
            state.reels.forEach((moduleEntry) => {
                const reel = moduleEntry?.items?.find(r => r.id === reel_id);
                if (reel) reel.stats.comments = Math.max(0, (reel.stats.comments || 0) + by);
            });
            if (state.reel?.id === reel_id) {
                state.reel.stats.comments = Math.max(0, (state.reel.stats.comments || 0) + by);
            }
        },
        SET_REEL(state, payload) {
            state.reel = payload;
        },
        REMOVE_REEL_FROM_MODULE(state, { module, reelId }) {
            const moduleEntry = state.reels.find(m => m.module === module);
            if (!moduleEntry?.items?.length) return;
            moduleEntry.items = moduleEntry.items.filter(r => r.id !== reelId);
        },
    },
    actions: {
        // query: { isRefresh, module, feedType ('foryou'|'following'), hasTotal, page, limit }
        async getReelsFeed({ commit }, query) {
            try {
                const { isRefresh = false, module, feedType, hasTotal, page: currentPage, limit } = query;

                const response = await api.get('/posts/reels', {
                    params: {
                        page: currentPage,
                        limit,
                        total: hasTotal,
                        type: feedType || 'foryou',
                    },
                });

                const { items, page, totalPages, total, hasMore, fallback } = response.data;

                const payload = {
                    module,
                    feedType,
                    items,
                    pagination: { page, total, totalPages, hasMore },
                    fallback,
                };

                if (isRefresh) {
                    commit('SET_REELS_FROM_MODULE', payload);
                } else {
                    commit('PUSH_REELS_TO_MODULE', payload);
                }

                return { items, hasMore, fallback };
            } catch (error) {
                logger.error('Erro ao buscar reels:', error?.response?.data?.message || error);
                throw error;
            }
        },

        async getReelById({ commit }, reelId) {
            try {
                // Ajusta a rota se o teu endpoint de reel único tiver outro path
                const response = await api.get(`/reels/${reelId}`);
                commit('SET_REEL', response.data.reel);
                return response.data.reel;
            } catch (error) {
                logger.error('Erro ao buscar reel:', error?.response?.data?.message || error);
                throw error;
            }
        },

        // Gosto — optimista + debounce, reaproveitando o toggle-upvote do post dono do vídeo
        toggleLikeReel(ctx, { reelId, module, postId }) {
            const args = { reelId, module, postId };
            const key = `${module}:${reelId}`;
            const queue = getLikeQueueEntry(key);

            try {
                applyLocalLikeToggle(ctx, args);
                queue.pendingCount++;
                scheduleLikeFlush(ctx, args);
            } catch (error) {
                logger.error('Erro ao processar gosto do reel:', error?.message);
            }
        },

        // Guardar/remover dos guardados. Sem debounce (acção mais rara que o
        // gosto) — optimista com reversão em caso de falha.
        // ⚠️ Endpoint assumido como /posts/:id/toggle-bookmark — ajusta se a
        // tua rota de "guardar post" tiver outro nome.
        async toggleSaveReel({ commit }, { reelId, postId }) {
            const wasSaved = false; // valor pré-toggle não é conhecido aqui sem consultar o estado;
            try {
                commit('UPDATE_REEL_SAVE', { reel_id: reelId, saved: true });
                const response = await api.put(`/posts/${postId}/toggle-bookmark`);
                const saved = response?.data?.saved;
                if (typeof saved === 'boolean') {
                    commit('UPDATE_REEL_SAVE', { reel_id: reelId, saved });
                }
            } catch (error) {
                logger.error('Erro ao guardar reel:', error?.response?.data?.message || error);
                commit('UPDATE_REEL_SAVE', { reel_id: reelId, saved: wasSaved });
            }
        },

        // Seguir/deixar de seguir o autor directamente a partir do reel.
        // ⚠️ Endpoint assumido — ajusta para a tua rota real de follow/unfollow.
        async toggleFollowReel({ commit }, { authorId }) {
            try {
                const response = await api.put(`/users/${authorId}/toggle-follow`);
                const isFollowing = response?.data?.isFollowing;
                commit('UPDATE_REEL_FOLLOW', {
                    author_id: authorId,
                    is_following: typeof isFollowing === 'boolean' ? isFollowing : true,
                });
            } catch (error) {
                logger.error('Erro ao seguir autor do reel:', error?.response?.data?.message || error);
            }
        },

        // Chamada localmente (sem API) quando o utilizador comenta a partir
        // do painel de comentários do reel — o POST do comentário em si
        // deve continuar a passar pela action de comentários já existente;
        // isto só sincroniza o contador mostrado no feed de reels.
        incrementReelComments({ commit }, { reelId, by = 1 }) {
            commit('INC_REEL_COMMENTS_COUNT', { reel_id: reelId, by });
        },

        setReelsActiveIndex({ commit }, { module, index }) {
            commit('UPDATE_REELS_ACTIVE_INDEX', { module, index });
        },

        resetReelsModule({ commit }, module) {
            commit('RESET_REELS_MODULE', module);
        },
    },
    getters: {
        reelsModules: (state) => state.reels,
        reelsByModule: (state) => (module) => state.reels.find(m => m.module === module) || null,
        currentReel: (state) => state.reel,
        reelsSeed: (state) => state.reelsSeed
    },
};