import { logger } from '@/utils/logger';
import api from '../../api'

export default {
    state: {
        notifications: {
            items: [],
            pagination: {}
        },
        notification: {}
    },
    mutations: {
        PUSH_NOTIFICATIOS_FROM_CACHE(state, payload) {
            const cachedNotifications = state.notifications;
            const notifications = payload?.notifications || []
            const { page, totalPages, hasMore } = payload?.pagination || {}

            if (!notifications.length) return
            
            const uniqueNotifications = notifications.filter(
                (newNotification) =>
                    !cachedNotifications.items.some(
                        (existingNotification) => existingNotification?._id === newNotification?._id
                    )
            );

            cachedNotifications.items = [...cachedNotifications.items, ...uniqueNotifications];
            cachedNotifications.pagination.page = page;
            cachedNotifications.pagination.totalPages = totalPages;
            cachedNotifications.pagination.hasMore = hasMore
        }
    },
    actions: {
        async getNotifications({ commit }, query) {
            try {
                const { hasTotal, page: currentPage, limit } = query

                const response = await api.get('/notifications', {
                    params: {
                        page: currentPage,
                        total: hasTotal,
                        limit
                    }
                });

                const { notifications, pagination } = response.data

                const payload = {
                    notifications,
                    pagination
                }

                commit("PUSH_NOTIFICATIOS_FROM_CACHE", payload)
            } catch (error) {
                logger.error(error);
            }
        },
    },
    getters: {
        notifications: (state) => state.notifications,
    }
}