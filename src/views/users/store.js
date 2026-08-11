import { logger } from '@/utils/logger';
import api from '../../api'

export default {
    state: {
        users: {
            items: [],
            pagination: {}
        },
        suggestedUsers: {
            items: [],
            pagination: {}
        },
        chatSuggestions: {
            items: [],
            pagination: {}
        },
        searchUsers: {
            items: [],
            pagination: {}
        },
        // === Seguidores de um usuário ===
        followersResults: [],
        followersLoading: false,
        followersError: null,
        followersUserId: null, // dono da lista carregada (pra loadMore não precisar receber de novo)
        followersPage: 1,
        followersHasMore: false,
        followersLoadingMore: false,

        // === Quem um usuário segue ===
        followingResults: [],
        followingLoading: false,
        followingError: null,
        followingUserId: null,
        followingPage: 1,
        followingHasMore: false,
        followingLoadingMore: false,
    },
    mutations: {
        LOAD_CHAT_SUGGESTIONS(state, { items, pagination, loadMore }) {
            if (!loadMore) {
                state.chatSuggestions.items = items;
                state.chatSuggestions.pagination = pagination;
            } else {
                const chatSuggestions = state.chatSuggestions.items

                // Filtra os novos posts para remover quaisquer que já existam no cache
                const uniqueItems = items.filter(
                    (user) =>
                        !chatSuggestions.some(
                            (existingUser) => existingUser._id === user._id
                        )
                );

                logger.log(items)
                logger.log(uniqueItems)


                state.chatSuggestions.items = [
                    ...chatSuggestions,
                    ...uniqueItems
                ]

                state.chatSuggestions.pagination = pagination
            }
        },
        RESET_USERS(state) {
            state.users = {
                items: [],
                pagination: {
                    page: 1,
                    total: 0,
                    totalPages: 0,
                    hasMore: false
                }
            }
        },
        SET_SEARCH_USERS(state, { items = [], pagination = {} }) {
            state.searchUsers = {
                items: [...items],
                pagination: { ...pagination, hasMore: false } // busca geralmente não tem mais páginas
            }
        },
        RESET_SEARCH_USERS(state) {
            state.searchUsers = {
                items: [],
                pagination: {}
            }
        },
        SET_FOLLOWERS_RESULTS(state, users) {
            state.followersResults = users;
        },
        APPEND_FOLLOWERS_RESULTS(state, users) {
            state.followersResults = [...state.followersResults, ...users];
        },
        SET_FOLLOWERS_LOADING(state, isLoading) {
            state.followersLoading = isLoading;
        },
        SET_FOLLOWERS_LOADING_MORE(state, isLoading) {
            state.followersLoadingMore = isLoading;
        },
        SET_FOLLOWERS_ERROR(state, error) {
            state.followersError = error;
        },
        SET_FOLLOWERS_USER_ID(state, userId) {
            state.followersUserId = userId;
        },
        SET_FOLLOWERS_PAGINATION(state, { page, hasMore }) {
            state.followersPage = page;
            state.followersHasMore = hasMore;
        },
        CLEAR_FOLLOWERS_RESULTS(state) {
            state.followersResults = [];
            state.followersError = null;
            state.followersUserId = null;
            state.followersPage = 1;
            state.followersHasMore = false;
        },

        SET_FOLLOWING_RESULTS(state, users) {
            state.followingResults = users;
        },
        APPEND_FOLLOWING_RESULTS(state, users) {
            state.followingResults = [...state.followingResults, ...users];
        },
        SET_FOLLOWING_LOADING(state, isLoading) {
            state.followingLoading = isLoading;
        },
        SET_FOLLOWING_LOADING_MORE(state, isLoading) {
            state.followingLoadingMore = isLoading;
        },
        SET_FOLLOWING_ERROR(state, error) {
            state.followingError = error;
        },
        SET_FOLLOWING_USER_ID(state, userId) {
            state.followingUserId = userId;
        },
        SET_FOLLOWING_PAGINATION(state, { page, hasMore }) {
            state.followingPage = page;
            state.followingHasMore = hasMore;
        },
        CLEAR_FOLLOWING_RESULTS(state) {
            state.followingResults = [];
            state.followingError = null;
            state.followingUserId = null;
            state.followingPage = 1;
            state.followingHasMore = false;
        },
    },
    actions: {
        // Função para obter conversas
        async loadChatSuggestions({ commit }, { page = 1, limit = 10, loadMore = false, total = 0 }) {
            try {
                // Requisição para obter usuarios
                const response = await api.get('/users/new-message', {
                    params: {
                        page,
                        limit,
                        total: loadMore ? total : undefined
                    }
                });

                // Dados da resposta
                const data = response.data;

                // Itens de conversas
                const items = data.users || [];

                // Configuração de paginação
                const pagination = {
                    page: data.page, // Página atual
                    total: data.total, // Total de itens
                    totalPages: data.totalPages, // Total de páginas
                    hasMore: data.hasMore // Novo campo indicando se há mais páginas    
                };

                // Atualiza o store com as conversas
                commit("LOAD_CHAT_SUGGESTIONS", { items, loadMore, pagination });


            } catch (err) {
                // Log de erro
                logger.error("Failed to fetch users:", err);
                throw err;
            }
        },
        async searchUsers({ commit }, { query, typeSearch }) {
            try {
                // Requisição para obter usuarios
                const response = await api.get('/users/search', {
                    params: {
                        q: query,
                        ...(typeSearch && {
                            type: typeSearch
                        })
                    }
                });

                // Dados da resposta
                const data = response.data;

                // Itens de conversas
                const items = data.users || [];

                // Configuração de paginação
                const pagination = {
                    page: 1, // Página atual
                    total: 0, // Total de itens
                    totalPages: 1, // Total de páginas
                    hasMore: false // Novo campo indicando se há mais páginas    
                };

                // Atualiza o store com as conversas
                commit("SET_SEARCH_USERS", { items, pagination });

                return items
            } catch (err) {
                // Log de erro
                logger.error("Failed to search users:", err);
                throw err;
            }
        },
        async updateUser({ commit }, data) {
            try {
                const response = await api.put('/users', data);

                return response
            } catch (err) {
                // Log de erro
                logger.error("Failed to update user:", err);
                throw err;
            }
        },
        async getFollowers({ commit }, payload) {
            const { userId } = payload;

            if (!userId) {
                commit('CLEAR_FOLLOWERS_RESULTS');
                return;
            }

            commit('SET_FOLLOWERS_LOADING', true);
            commit('SET_FOLLOWERS_ERROR', null);


            try {
                console.log(userId)
                const response = await api.get('/users/' + userId + '/followers',
                    {
                        params: { page: 1, limit: 15 }
                    });

                const { users, pagination } = response.data;
                commit('SET_FOLLOWERS_RESULTS', users || []);
                commit('SET_FOLLOWERS_USER_ID', userId);
                commit('SET_FOLLOWERS_PAGINATION', {
                    page: pagination?.page || 1,
                    hasMore: pagination?.hasMore || false,
                });
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'Erro ao buscar seguidores';
                logger.error('Erro ao buscar seguidores:', errorMsg);
                commit('SET_FOLLOWERS_ERROR', errorMsg);
                commit('SET_FOLLOWERS_RESULTS', []);
                throw err;
            } finally {
                commit('SET_FOLLOWERS_LOADING', false);
            }
        },
        async getFollowing({ commit }, payload) {
            const { userId } = payload;

            if (!userId) {
                commit('CLEAR_FOLLOWING_RESULTS');
                return;
            }

            commit('SET_FOLLOWING_LOADING', true);
            commit('SET_FOLLOWING_ERROR', null);

            try {
                const response = await api.get('/users/' + userId + '/following',
                    {
                        params: { page: 1, limit: 15 }
                    });

                const { users, pagination } = response.data;
                commit('SET_FOLLOWING_RESULTS', users || []);
                commit('SET_FOLLOWING_USER_ID', userId);
                commit('SET_FOLLOWING_PAGINATION', {
                    page: pagination?.page || 1,
                    hasMore: pagination?.hasMore || false,
                });
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'Erro ao buscar usuários seguidos';
                logger.error('Erro ao buscar usuários seguidos:', errorMsg);
                commit('SET_FOLLOWING_ERROR', errorMsg);
                commit('SET_FOLLOWING_RESULTS', []);
                throw err;
            } finally {
                commit('SET_FOLLOWING_LOADING', false);
            }
        },
        async loadMoreFollowers({ commit, state }) {
            if (!state.followersHasMore || state.followersLoadingMore || state.followersLoading) return;
            if (!state.followersUserId) return;

            commit('SET_FOLLOWERS_LOADING_MORE', true);

            try {
                const nextPage = state.followersPage + 1;
                const response = await api.get(`/users/${state.followersUserId}/followers`, {
                    params: { page: nextPage, limit: 15, total: state.followersResults.length ? undefined : 0 }
                });

                const { users, pagination } = response.data;
                commit('APPEND_FOLLOWERS_RESULTS', users || []);
                commit('SET_FOLLOWERS_PAGINATION', {
                    page: pagination?.page || nextPage,
                    hasMore: pagination?.hasMore || false,
                });
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'Erro ao carregar mais seguidores';
                logger.error('Erro ao paginar seguidores:', errorMsg);
                commit('SET_FOLLOWERS_ERROR', errorMsg);
            } finally {
                commit('SET_FOLLOWERS_LOADING_MORE', false);
            }
        },

        async loadMoreFollowing({ commit, state }) {
            if (!state.followingHasMore || state.followingLoadingMore || state.followingLoading) return;
            if (!state.followingUserId) return;

            commit('SET_FOLLOWING_LOADING_MORE', true);

            try {
                const nextPage = state.followingPage + 1;
                const response = await api.get(`/users/${state.followingUserId}/following`, {
                    params: { page: nextPage, limit: 15, total: state.followingResults.length ? undefined : 0 }
                });

                const { users, pagination } = response.data;
                commit('APPEND_FOLLOWING_RESULTS', users || []);
                commit('SET_FOLLOWING_PAGINATION', {
                    page: pagination?.page || nextPage,
                    hasMore: pagination?.hasMore || false,
                });
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'Erro ao carregar mais usuários seguidos';
                logger.error('Erro ao paginar usuários seguidos:', errorMsg);
                commit('SET_FOLLOWING_ERROR', errorMsg);
            } finally {
                commit('SET_FOLLOWING_LOADING_MORE', false);
            }
        },
        clearFollowers({ commit }) {
            commit('CLEAR_FOLLOWERS_RESULTS');
            commit('SET_FOLLOWERS_LOADING', false);
            commit('SET_FOLLOWERS_LOADING_MORE', false);
        },

        clearFollowing({ commit }) {
            commit('CLEAR_FOLLOWING_RESULTS');
            commit('SET_FOLLOWING_LOADING', false);
            commit('SET_FOLLOWING_LOADING_MORE', false);
        }
    },
    getters: {
        users: (state) => state.users,
        searchUsers: (state) => state.searchUsers,
        chatSuggestions: (state) => state.chatSuggestions,
        followersResults: (state) => state.followersResults,
        followersLoading: (state) => state.followersLoading,
        followersLoadingMore: (state) => state.followersLoadingMore,
        followersError: (state) => state.followersError,
        followersHasMore: (state) => state.followersHasMore,
        followingResults: (state) => state.followingResults,
        followingLoading: (state) => state.followingLoading,
        followingLoadingMore: (state) => state.followingLoadingMore,
        followingError: (state) => state.followingError,
        followingHasMore: (state) => state.followingHasMore
    }
}