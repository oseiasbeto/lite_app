import { logger } from '@/utils/logger';
import api from '../../api'

const followQueues = new Map(); // key: userId (do usuário-alvo) -> { pendingCount, inFlight, timer }
const FOLLOW_DEBOUNCE_MS = 400;

function getFollowQueueEntry(userId) {
    if (!followQueues.has(userId)) {
        followQueues.set(userId, { pendingCount: 0, inFlight: false, timer: null });
    }
    return followQueues.get(userId);
}

/**
 * REGISTRO DE PATCHERS
 * Cada função aqui sabe como encontrar o usuário-alvo em UM lugar do estado
 * (perfil, item de uma lista, etc.) e aplicar o delta de followers nele.
 * `delta` é sempre +1 (seguiu) ou -1 (deixou de seguir).
 *
 * Adicione uma entrada por lista que exibe usuários (feed, sugestões, busca).
 * Se a lista não guarda um array `followers` completo (o comum), só ajuste
 * `followers_count` e, se existir, um flag booleano tipo `is_following`.
 */
function buildFollowPatchers({ commit, state, rootState }) {
    return [
        // --- Perfil individual (state.profile) ---
        function patchProfile(userId, delta, loggedUserId) {
            if (!state.profile || state.profile._id !== userId) return;

            const followers = [...(state.profile.followers || [])];
            const idx = followers.indexOf(loggedUserId);
            if (delta === 1 && idx === -1) followers.push(loggedUserId);
            if (delta === -1 && idx !== -1) followers.splice(idx, 1);

            commit("UPDATE_PROFILE_STATUS_FOLLOW", {
                following: state.profile.following,
                following_count: state.profile.following_count,
                followers,
                followers_count: (state.profile.followers_count || 0) + delta
            });
        },

        // --- EXEMPLO: lista de sugestões (ajuste o module/mutation reais) ---
        // function patchSuggestions(userId, delta) {
        //     const list = state.suggestions; // ou rootState.suggestions.items, etc.
        //     const item = list?.find(u => u._id === userId);
        //     if (!item) return;
        //     commit("suggestions/UPDATE_USER_FOLLOWERS_COUNT", {
        //         userId,
        //         followers_count: (item.followers_count || 0) + delta,
        //         is_following: delta === 1
        //     }, { root: true });
        // },

        // --- EXEMPLO: resultados de busca ---
        // function patchSearchResults(userId, delta) {
        //     const list = rootState.search?.results;
        //     const item = list?.find(u => u._id === userId);
        //     if (!item) return;
        //     commit("search/UPDATE_USER_FOLLOWERS_COUNT", {
        //         userId,
        //         followers_count: (item.followers_count || 0) + delta,
        //         is_following: delta === 1
        //     }, { root: true });
        // },
    ];
}

// Aplica UM toggle local (otimista) em todos os locais registrados.
// Reusada tanto no clique quanto na reversão de erro (o toggle é auto-inverso).
function applyLocalFollowToggle(ctx, { userId, currentUserId }) {
    const { commit, rootState } = ctx;
    const loggedUser = rootState.auth.user;
    if (!loggedUser) return;

    // `currentUserId` (passado explicitamente pelo componente) tem prioridade
    // sobre o id derivado de rootState.auth.user — útil quando o componente
    // não tem garantia de que o auth store já está hidratado nesse momento.
    const loggedUserId = currentUserId ?? loggedUser._id ?? loggedUser.id;
    const hasFollowed = (loggedUser.following || []).includes(userId);
    const delta = hasFollowed ? -1 : 1;

    // 1. Atualiza o usuário logado (following/following_count) — sempre no root da auth
    const newFollowing = hasFollowed
        ? loggedUser.following.filter(id => id !== userId)
        : [...(loggedUser.following || []), userId];

    commit("UPDATE_USER_STATUS_FOLLOW", {
        following: newFollowing,
        following_count: (loggedUser.following_count || 0) + delta,
        followers: loggedUser.followers,
        followers_count: loggedUser.followers_count
    });

    // 2. Atualiza o usuário-alvo (followers/followers_count) em TODOS os lugares
    //    onde ele aparece no estado, usando o mesmo delta pra todos.
    const patchers = buildFollowPatchers(ctx);
    for (const patch of patchers) {
        patch(userId, delta, loggedUserId);
    }
}

// Decide se envia a chamada de rede, e encadeia a próxima verificação ao terminar.
async function runFollowFlush(ctx, args) {
    const { userId, onError } = args;
    const queue = getFollowQueueEntry(userId);

    if (queue.inFlight) return;
    if (queue.pendingCount === 0) return;

    const isNetToggle = queue.pendingCount % 2 === 1;
    queue.pendingCount = 0;

    if (!isNetToggle) return; // cliques em par = estado líquido inalterado, sem chamada

    queue.inFlight = true;
    try {
        await api.put(`/users/${userId}/follow`);
        // sucesso: estado local já está correto (a resposta do backend é só um espelho
        // do mesmo toggle que já aplicamos otimisticamente)
    } catch (error) {
        logger.error("Erro ao seguir/deixar de seguir o usuário:", error?.response?.data?.message || error);
        // reverte exatamente o efeito líquido desta chamada, sobre o estado ATUAL
        applyLocalFollowToggle(ctx, args);
        onError?.(error); // opcional: hook pra mostrar um toast na UI, sem quebrar o fluxo
    } finally {
        queue.inFlight = false;
        runFollowFlush(ctx, args); // reavalia na hora, sem novo debounce
    }
}

function scheduleFollowFlush(ctx, args) {
    const queue = getFollowQueueEntry(args.userId);
    clearTimeout(queue.timer);
    queue.timer = setTimeout(() => runFollowFlush(ctx, args), FOLLOW_DEBOUNCE_MS);
}

export default {
    state: {
        profile: {}
    },
    mutations: {
        SET_PROFILE(state, payload) {
            state.profile = payload
        },
        UPDATE_PROFILE(state, payload) {
            const { scrollTop, name, location, bio, credentials, activeTab } = payload

            if (scrollTop) {
                state.profile.scrollTop = scrollTop
            } else if (name) {
                state.profile.name = name
            } else if (location) {
                state.profile.location = location
            } else if (bio) {
                state.profile.bio = bio
            } else if (credentials) {
                state.profile.credentials = credentials
            } else if (activeTab) {
                state.profile.activeTab = activeTab
            }
        },
        UPDATE_PROFILE_STATUS_FOLLOW(state, payload) {
            const { following, following_count, followers, followers_count } = payload

            state.profile.following = following
            state.profile.following_count = following_count
            state.profile.followers = followers
            state.profile.followers_count = followers_count
        },
        UPDATE_PROFILE_STATUS_SUBSCRIPTIONS(state, payload) {
            const { subscriptions, subscriptions_count } = payload

            state.profile.subscriptions = subscriptions
            state.profile.subscriptions_count = subscriptions_count
        }
    },
    actions: {
        async getProfileByUserId({ commit }, userId) {
            try {
                const response = await api.get('/users/' + userId);
                const { user } = response.data

                commit("SET_PROFILE", user)
            } catch (err) {
                logger.error("Erro ao buscar o perfil pelo id:", error?.response?.data?.message || error);
                throw err
            }
        },
        async updateProfile({ commit }, payload) {
            try {
                const { name, picture, location, theme, bio, credentials } = payload

                const response = await api.put('/users', { name, picture, location, theme, bio, credentials });
                const { user } = response.data

                commit("SET_PROFILE", user)
            } catch (err) {
                logger.error("Erro ao atualizar o perfil:", err?.response?.data?.message || err);
                throw err
            }
        },
        followUser({ commit, state, rootState }, payload) {
            const { userId, currentUserId, onError } = typeof payload === "string"
                ? { userId: payload, currentUserId: undefined, onError: undefined }
                : (payload || {});

            if (!userId) {
                logger.error("followUser chamado sem userId válido");
                return;
            }

            const args = { userId, currentUserId, onError, commit, state, rootState };
            const queue = getFollowQueueEntry(userId);

            // 1. UI: alterna na hora, sempre, em todos os locais registrados
            applyLocalFollowToggle({ commit, state, rootState }, args);

            // 2. Conta o clique e (re)agenda a avaliação com debounce
            queue.pendingCount++;
            scheduleFollowFlush({ commit, state, rootState }, args);
        },
        async subscribeUser({ commit }, userId) {
            try {
                const response = await api.put(`/users/${userId}/subscribe`);
                const { profileStatusSubscriptions } = response.data

                commit("UPDATE_PROFILE_STATUS_SUBSCRIPTIONS", profileStatusSubscriptions)
            } catch (err) {
                logger.error("Erro ao subscrever um usuario:", err?.response?.data?.message || err);
                throw err
            }
        }
    },
    getters: {
        currentProfile: (state) => state.profile
    }
}