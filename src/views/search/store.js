import { logger } from '@/utils/logger';
import api from '../../api';

export default {
    namespaced: true, // Recomendado para evitar conflitos

    state: {
        results: [],      // Lista de usuários encontrados
        loading: false,   // Indicador de carregamento
        error: null,      // Mensagem de erro, se houver
        lastQuery: '',    // Última consulta realizada (opcional, para cache)

        // === Paginação da busca (scroll infinito) ===
        searchPage: 1,
        searchHasMore: false,
        searchLoadingMore: false,

        // === Sugestões de usuário (estilo "Quem seguir", antes de digitar) ===
        suggestions: [],
        suggestionsLoading: false,     // carregamento inicial (lista vazia)
        suggestionsLoadingMore: false, // carregamento de mais páginas
        suggestionsError: null,
        suggestionsPage: 1,
        suggestionsHasMore: false,
    },

    mutations: {
        SET_RESULTS(state, users) {
            state.results = users;
        },
        APPEND_RESULTS(state, users) {
            state.results = [...state.results, ...users];
        },
        SET_LOADING(state, isLoading) {
            state.loading = isLoading;
        },
        SET_ERROR(state, error) {
            state.error = error;
        },
        SET_LAST_QUERY(state, query) {
            state.lastQuery = query;
        },
        CLEAR_RESULTS(state) {
            state.results = [];
            state.error = null;
            state.lastQuery = '';
            state.searchPage = 1;
            state.searchHasMore = false;
        },

        SET_SEARCH_PAGINATION(state, { page, hasMore }) {
            state.searchPage = page;
            state.searchHasMore = hasMore;
        },
        SET_SEARCH_LOADING_MORE(state, isLoading) {
            state.searchLoadingMore = isLoading;
        },

        SET_SUGGESTIONS(state, users) {
            state.suggestions = users;
        },
        APPEND_SUGGESTIONS(state, users) {
            state.suggestions = [...state.suggestions, ...users];
        },
        SET_SUGGESTIONS_LOADING(state, isLoading) {
            state.suggestionsLoading = isLoading;
        },
        SET_SUGGESTIONS_LOADING_MORE(state, isLoading) {
            state.suggestionsLoadingMore = isLoading;
        },
        SET_SUGGESTIONS_ERROR(state, error) {
            state.suggestionsError = error;
        },
        SET_SUGGESTIONS_PAGINATION(state, { page, hasMore }) {
            state.suggestionsPage = page;
            state.suggestionsHasMore = hasMore;
        },
        CLEAR_SUGGESTIONS(state) {
            state.suggestions = [];
            state.suggestionsError = null;
            state.suggestionsPage = 1;
            state.suggestionsHasMore = false;
        },
    },

    actions: {
        /**
         * Busca usuários com base na consulta (autocomplete) — página 1
         * @param {Object} context - Contexto do Vuex
         * @param {Object} payload - { query: string }
         */
        async getUsersAutocomplete({ commit, state }, payload) {
            const { query } = payload;

            // Evita buscas desnecessárias
            if (!query || query.trim().length === 0) {
                commit('CLEAR_RESULTS');
                return;
            }

            // Opcional: cancelar requisição anterior? Pode ser implementado com AbortController

            commit('SET_LOADING', true);
            commit('SET_ERROR', null);

            try {
                const response = await api.get('/users/search', {
                    params: { q: query, page: 1, limit: 10 }
                });

                const { users, pagination } = response.data;
                commit('SET_RESULTS', users || []);
                commit('SET_LAST_QUERY', query);
                commit('SET_SEARCH_PAGINATION', {
                    page: pagination?.page || 1,
                    hasMore: pagination?.hasMore || false,
                });
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'Erro na busca';
                logger.error('Erro no autocomplete de usuários:', errorMsg);
                commit('SET_ERROR', errorMsg);
                commit('SET_RESULTS', []); // Limpa resultados em caso de erro
                throw err;
            } finally {
                commit('SET_LOADING', false);
            }
        },

        /**
         * Carrega a próxima página dos resultados da busca atual (scroll infinito)
         */
        async loadMoreSearchResults({ commit, state }) {
            if (!state.searchHasMore || state.searchLoadingMore || state.loading) return;
            if (!state.lastQuery) return;

            commit('SET_SEARCH_LOADING_MORE', true);

            try {
                const nextPage = state.searchPage + 1;
                const response = await api.get('/users/search', {
                    params: { q: state.lastQuery, page: nextPage, limit: 10, total: state.results.length ? undefined : 0 }
                });

                const { users, pagination } = response.data;
                commit('APPEND_RESULTS', users || []);
                commit('SET_SEARCH_PAGINATION', {
                    page: pagination?.page || nextPage,
                    hasMore: pagination?.hasMore || false,
                });
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'Erro ao carregar mais resultados';
                logger.error('Erro ao paginar busca de usuários:', errorMsg);
                // não limpa os resultados já existentes, só registra o erro
                commit('SET_ERROR', errorMsg);
            } finally {
                commit('SET_SEARCH_LOADING_MORE', false);
            }
        },

        /**
         * Busca sugestões de usuário (estilo "Quem seguir") — página 1
         */
        async getSuggestedUsers({ commit, state }) {
            commit('SET_SUGGESTIONS_LOADING', true);
            commit('SET_SUGGESTIONS_ERROR', null);

            try {
                const response = await api.get('/users/suggestions', {
                    params: { page: 1, limit: 10 }
                });

                const { users, pagination } = response.data;
                commit('SET_SUGGESTIONS', users || []);
                commit('SET_SUGGESTIONS_PAGINATION', {
                    page: pagination?.page || 1,
                    hasMore: pagination?.hasMore || false,
                });
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'Erro ao buscar sugestões';
                logger.error('Erro ao buscar sugestões de usuários:', errorMsg);
                commit('SET_SUGGESTIONS_ERROR', errorMsg);
                commit('SET_SUGGESTIONS', []);
            } finally {
                commit('SET_SUGGESTIONS_LOADING', false);
            }
        },

        /**
         * Carrega mais sugestões de usuário (scroll infinito)
         */
        async loadMoreSuggestions({ commit, state }) {
            if (!state.suggestionsHasMore || state.suggestionsLoadingMore || state.suggestionsLoading) return;

            commit('SET_SUGGESTIONS_LOADING_MORE', true);

            try {
                const nextPage = state.suggestionsPage + 1;
                const response = await api.get('/users/suggestions', {
                    params: { page: nextPage, limit: 10, total: state.suggestions.length ? undefined : 0 }
                });

                const { users, pagination } = response.data;
                commit('APPEND_SUGGESTIONS', users || []);
                commit('SET_SUGGESTIONS_PAGINATION', {
                    page: pagination?.page || nextPage,
                    hasMore: pagination?.hasMore || false,
                });
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'Erro ao carregar mais sugestões';
                logger.error('Erro ao paginar sugestões de usuários:', errorMsg);
                commit('SET_SUGGESTIONS_ERROR', errorMsg);
            } finally {
                commit('SET_SUGGESTIONS_LOADING_MORE', false);
            }
        },

        /**
         * Limpa os resultados da busca
         */
        clearSearch({ commit }) {
            commit('CLEAR_RESULTS');
            commit('SET_LOADING', false);
            commit('SET_ERROR', null);
        },

        /**
         * Limpa as sugestões (ex.: ao sair da tela de busca)
         */
        clearSuggestions({ commit }) {
            commit('CLEAR_SUGGESTIONS');
            commit('SET_SUGGESTIONS_LOADING', false);
            commit('SET_SUGGESTIONS_LOADING_MORE', false);
        },
    },

    getters: {
        /**
         * Retorna a lista de usuários encontrados
         */
        searchResults: (state) => state.results,

        /**
         * Indica se há carregamento em andamento
         */
        isLoading: (state) => state.loading,

        /**
         * Retorna a mensagem de erro, se existir
         */
        hasError: (state) => state.error,

        /**
         * Última consulta bem-sucedida
         */
        lastQuery: (state) => state.lastQuery,

        searchHasMore: (state) => state.searchHasMore,
        searchLoadingMore: (state) => state.searchLoadingMore,

        suggestedUsers: (state) => state.suggestions,
        suggestionsLoading: (state) => state.suggestionsLoading,
        suggestionsLoadingMore: (state) => state.suggestionsLoadingMore,
        suggestionsError: (state) => state.suggestionsError,
        suggestionsHasMore: (state) => state.suggestionsHasMore,
    },
};