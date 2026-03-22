import api from '../../api'

export default {
    state: {
        topicList: []
    },
    mutations: {
         SET_TOPICLIST(state, payload) {
            state.topicList = payload
        },
    },
    actions: {
        async getTopicList({ commit }) {
            try {
                const response = await api.get('/topics');
                const { topics } = response.data

                commit("SET_TOPICLIST", topics)
            } catch (error) {
                console.error(error);
            }
        },
    },
    getters: {
        topicList: (state) => state.topicList,
    }
}