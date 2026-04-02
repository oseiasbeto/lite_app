import api from '../../api'

import clearSessionIdFromCookies from "@/utils/clear-session-id-from-cookies"; // Remove o session_id dos cookies.
import setSessionIdFromCookies from "@/utils/set-session-id-from-cookies"; // Armazena o session_id nos cookies.

// Importa a função para conectar ao WebSocket (Socket.IO).
import { connectSocket, disconnectSocket } from "@/services/socket";
import { logger } from '@/utils/logger';

export default {
    state: {
        user: null,
        token: null,
        sessionId: null,
        newSession: false,
        newUser: false
    },
    mutations: {
        SET_AUTH(state, { user, new_user = false, new_session = false, access_token, session_id }) {
            state.user = user
            state.token = access_token
            state.sessionId = session_id
            state.newSession = new_session
            state.newUser = new_user

            setSessionIdFromCookies(session_id);

            // Conecta ao WebSocket e informa ao backend que o usuário está online.
            const socket = connectSocket(access_token);
            socket.emit("setUserOnline", user._id);
        },
        LOGOUT(state) {
            state.user = null
            state.token = null
            state.sessionId = null

            clearSessionIdFromCookies()
            disconnectSocket()
        },
        UPDATE_USER(state, payload) {
            state.user = payload
        },
        UPDATE_USER_STATUS_FOLLOW(state, payload) {
            const { following, following_count, followers, followers_count } = payload

            state.user.following = following
            state.user.following_count = following_count
            state.user.followers = followers
            state.user.followers_count = followers_count
        },
        UPDATE_USER_UNREAD_MESSAGES_COUNT(state, count) {
            state.user.unread_messages_count = count
        }
    },
    actions: {
        async refreshToken({ commit }, sessionId) {
            try {
                const res = await api.post("/auth/sessions/refresh-access-token", {
                    session_id: sessionId,
                });

                const user = res.data.user;
                const accessToken = res.data.access_token;

                commit('SET_AUTH', {
                    user,
                    access_token: accessToken,
                    session_id: sessionId
                })
                return res
            } catch (err) {
                if (err.response?.status === 401) {
                    // Se a resposta indicar que o token não é mais válido, limpa o session_id.
                    clearSessionIdFromCookies();
                    disconnectSocket();
                }
                logger.error(err.message);
                throw err;
            }
        },
        async login({ commit }, { identifier, password }) {
            try {
                const res = await api.post("/auth/login", { identifier, password });
                const { user, access_token, session_id } = res.data;

                commit('SET_AUTH', { user, new_session: true, access_token, session_id })
                return res
            } catch (err) {
                logger.error('Erro ao fazer login:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        },
        async register({ commit }, { name, email }) {
            try {
                const res = await api.post("/auth/register", { name, email });
                return res
            } catch (err) {
                logger.error('Erro ao criar uma conta:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        },
        async completeRegistration({ commit }, { email, password }) {
            try {
                const res = await api.put("/auth/register/complete", { email, password });
                const { user, access_token, session_id } = res.data;

                commit('SET_AUTH', { user, new_user: true, new_session: true, access_token, session_id })
                return res
            } catch (err) {
                logger.error('Erro ao completar o registo da conta:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        },
        async verifyEmail({ commit }, { email, code }) {
            try {
                const res = await api.post("/auth/verify-email", { email, code });
                return res
            } catch (err) {
                logger.error('Erro ao verificar conta:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        },
        async verifyResetPasswordCode({ commit }, { email, code }) {
            try {
                const res = await api.post("/auth/verify-reset-password-code", { email, code });

                return res
            } catch (err) {
                logger.error('Erro ao verificar otp:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        },
        async forgotPassword({ commit }, email) {
            try {
                const res = await api.post("/auth/forgot-password", { email });
                return res
            } catch (err) {
                logger.error('Erro ao recuperar senha:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        },
        async resetPassword({ commit }, { email, code, newPassword }) {
            try {
                const res = await api.put("/auth/reset-password", { email, code, newPassword });

                return res
            } catch (err) {
                logger.error('Erro ao redefinir a senha:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        },
        async updateUnreadMessagesCount({ commit }, count) {
            try {
                const res = await api.put("/users/unread-messages-count", { count });
                commit("UPDATE_USER_UNREAD_MESSAGES_COUNT", count)
                return res
            } catch (err) {
                logger.error('Erro ao actualizar o contador de mensagens:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        }
    },
    getters: {
        accessToken: (state) => state.token,
        isNewSession: (state) => state.newSession,
        isNewUser: (state) => state.newUser,
        currentUser: (state) => state.user,
        unreadMessagesCount: (state) => state.user.unread_messages_count
    }
}