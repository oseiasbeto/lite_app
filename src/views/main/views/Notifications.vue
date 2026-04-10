<template>
    <div class="relative h-[calc(100vh-56px)] overflow-y-scroll" ref="feedView">
        <NotificationList :notifications="notifications?.items || []" :pagination="notifications?.pagination || {}"
            @on-mark-read="handleMarkRead" @on-load-more="handleLoadMore" :loading-fetch="loadingFetching"
            :loading-load-more="loadingLoadMore" />
    </div>

</template>

<script setup>
import NotificationList from '@/views/notifications/components/NotificationList.vue';
import { computed, onActivated, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore()
const router = useRouter()

const loadingFetching = ref(false)
const loadingLoadMore = ref(false)

const query = ref({
    page: 1,
    limit: 10,
    hasTotal: null
})

const notifications = computed(() => store.getters.notifications)
const unreadNotificationsCount = computed(() => store.getters.unreadNotificationsCount)

const fetchNotifications = async () => {
    await store.dispatch("getNotifications", query.value)
}

const handleMarkRead = async (data) => {

    if (!data?.is_read) {
        await store.dispatch("markNotificationAsRead", data?._id)
    }

    const { type, post, comment } = data

    if (type == 'new_comment') {
        store.commit("SET_POST", {
            ...post,
            sortCommentId: comment?._id
        })
        router.push({
            path: '/post/' + post?._id,
            query: {
                module: 'feed'
            }
        })
    } else if (type == 'reply_to_comment') {
        store.commit("SET_POST", {
            ...post,
            sortCommentId: comment?.parent
        })
        router.push({
            path: '/post/' + post?._id,
            query: {
                module: 'feed'
            }
        })
    }
}

const handleLoadMore = async () => {
    const pagination = notifications.value?.pagination
    const { hasMore, totalDocuments } = pagination

    if (hasMore) {
        loadingLoadMore.value = true
        query.value.page += 1
        query.value.hasTotal = totalDocuments
        await fetchNotifications()
            .finally(() => {
                loadingLoadMore.value = false
            })
    }
}

onMounted(async () => {
    loadingFetching.value = false
    await fetchNotifications()
        .finally(async () => {
            loadingFetching.value = false
        })
})

onActivated(async () => {
    if (unreadNotificationsCount.value) {
        await store.dispatch("updateUnreadNotificationsCount", 0)
    }
})
</script>