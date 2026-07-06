import api from '../../api'
import Cookies from "js-cookie";

let uid = 0
const timers = new Map()

export default {
    state: {
        topicList: [],
        isLoadingComponent: false,
        showBottomNav: true,
        theme: Cookies.get("theme"),
        toasts: []
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
        SET_SHOW_BOTTOM_NAV(state, value) {
            state.showBottomNav = value
        },
        ADD_TOAST(state, toast) {
            state.toasts.push(toast)
        },
        REMOVE_TOAST(state, id) {
            state.toasts = state.toasts.filter((t) => t.id !== id)
            if (timers.has(id)) {
                clearTimeout(timers.get(id))
                timers.delete(id)
            }
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
        showToast({ commit }, {
            message,
            type = 'info',
            duration = 4000,
            onClick = null,
            position = 'bottom',
            offset = 24,
        }) {
            const id = ++uid

            commit('ADD_TOAST', { id, message, type, onClick, position, offset })

            if (duration > 0) {
                const timeoutId = setTimeout(() => {
                    commit('REMOVE_TOAST', id)
                }, duration)
                timers.set(id, timeoutId)
            }

            return id
        },

        removeToast({ commit }, id) {
            commit('REMOVE_TOAST', id)
        },
    },
    getters: {
        topicList: (state) => state.topicList,
        isLoadingComponent: (state) => state.isLoadingComponent,
        currentTheme: (state) => state.theme,
        toasts: (state) => state.toasts,
        showBottomNav: (state) => state.showBottomNav
    }
}