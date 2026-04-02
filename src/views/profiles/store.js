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
        async followUser({ commit }, userId) {
            try {
                const response = await api.put(`/users/${userId}/follow`);
                const { userStatusFollow, profileStatusFollow } = response.data

                commit("UPDATE_PROFILE_STATUS_FOLLOW", profileStatusFollow)
                commit("UPDATE_USER_STATUS_FOLLOW", userStatusFollow)
            } catch (err) {
                logger.error("Erro ao seguir/dexiar de seguir o usuario:", err?.response?.data?.message || err);
                throw err
            }
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