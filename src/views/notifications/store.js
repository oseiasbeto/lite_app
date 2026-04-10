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
        PUSH_NOTIFICATIONS_FROM_CACHE(state, payload) {
            const cachedNotifications = state.notifications;
            const notifications = payload?.notifications || []
            const { page, totalPages, totalDocuments, hasMore } = payload?.pagination || {}

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
            cachedNotifications.pagination.totalDocuments = totalDocuments;
            cachedNotifications.pagination.hasMore = hasMore
        },
        PUSH_NOTIFICATION_FROM_NOTIFICATIONS(state, payload) {
            const cachedNotifications = state.notifications;
            const notifications = cachedNotifications.items || []

            if (!notifications.length) return

            notifications.unshift(payload)
        },
        MARK_NOTIFICATION_AS_READ(state, notificationId) {
            const cachedNotifications = state.notifications;
            const notifications = cachedNotifications.items || []

            const notificationIndex = notifications.findIndex(
                (notification) => notification?._id === notificationId
            );

            if (notificationIndex !== -1) {
                notifications[notificationIndex].is_read = true;
            }
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

                commit("PUSH_NOTIFICATIONS_FROM_CACHE", payload)
            } catch (error) {
                logger.error(error);
            }
        },
        async markNotificationAsRead({ commit }, notificationId) {
            try {
                await api.put(`/notifications/mark-as-notification/${notificationId}`);
                commit("MARK_NOTIFICATION_AS_READ", notificationId);
            } catch (error) {
                logger.error(error);
            }
        }
    },
    getters: {
        notifications: (state) => state.notifications,
    }
}