import { logger } from '@/utils/logger';
import api from '../../api'

export default {
    state: {
        media: {
            selected: {},
            list: [],
            post: {}
        },
    },
    mutations: {
        SET_MEDIA(state, {selected, list, post}) {
            state.media = { selected, list, post }
        },
        RESET_MEDIA(state) {
            state.media = {}
        }
    },
    actions: {
        async fetchMedia({ commit }, postId) {
            try {
                const response = await api.get(`/media?postId=${postId}`)
                commit('SET_MEDIA', { media: response.data, postId })
            } catch (error) {
                logger.error('Failed to fetch media:', error)
            }
        }
    },
    getters: {
        currentMedia: (state) => state.media
    }
}