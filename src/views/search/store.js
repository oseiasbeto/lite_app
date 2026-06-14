import { logger } from '@/utils/logger';
import api from '../../api';

export default {
    namespaced: true, // Recomendado para evitar conflitos

    state: {
        results: [],      // Lista de usuários encontrados
        loading: false,   // Indicador de carregamento
        error: null,      // Mensagem de erro, se houver
        lastQuery: '',    // Última consulta realizada (opcional, para cache)
    },

    mutations: {
        SET_RESULTS(state, users) {
            state.results = users;
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
        },
    },

    actions: {
        /**
         * Busca usuários com base na consulta (autocomplete)
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
                    params: { q: query }
                });

                const { users } = response.data;
                commit('SET_RESULTS', users || []);
                commit('SET_LAST_QUERY', query);
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
         * Limpa os resultados da busca
         */
        clearSearch({ commit }) {
            commit('CLEAR_RESULTS');
            commit('SET_LOADING', false);
            commit('SET_ERROR', null);
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
    },
};