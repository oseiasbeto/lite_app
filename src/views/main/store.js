import api from '../../api'
import Cookies from "js-cookie";



export default {
    state: {
        topicList: [],
        isLoadingComponent: false,
        theme: Cookies.get("theme")
    },
    mutations: {
        SET_TOPICLIST(state, payload) {
            state.topicList = payload
        },
        SET_IS_LOADING_COMPONENT(state, payload) {
            state.isLoadingComponent = payload
        },
        SET_CURRENT_THEME(state, payload) {
            console.log(payload)
            state.theme = payload
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
        isLoadingComponent: (state) => state.isLoadingComponent,
        currentTheme: (state) => state.theme
    }
}