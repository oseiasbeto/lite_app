import { logger } from '@/utils/logger';
import api from '../../api'

export default {
    state: {
        profile: {}
    },
    mutations: {
        SET_PROFILE(state, payload) {
            state.profile = payload
        },
        UPDATE_PROFILE(state, payload) {
            const { scrollTop, activeTab } = payload

            if (scrollTop) {
                state.profile.scrollTop = scrollTop
            } else if (activeTab) {
                state.profile.activeTab = activeTab
            }
        },
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
    },
    getters: {
        currentProfile: (state) => state.profile
    }
}