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
        }
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
        }
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
    },
    getters: {
        users: (state) => state.users,
        searchUsers: (state) => state.searchUsers,
        chatSuggestions: (state) => state.chatSuggestions,
    }
}