<template>
    <NotificationList :notifications="notifications?.items || []" :pagination="notifications?.pagination || {}"
        @on-mark-read="handleMarkRead" :loading-fetch="loadingFetching" :loading-load-more="loadingLoadMore" />
</template>

<script setup>
import NotificationList from '@/views/notifications/components/NotificationList.vue';
import { computed, onMounted, ref } from 'vue';
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

const fetchNotifications = async () => {
    await store.dispatch("getNotifications", query.value)
}

const handleMarkRead = (data) => {
    const { type, post, comment } = data

    switch (type) {
        case 'new_comment':
            store.commit("SET_POST", {
                ...post,
                commentId: comment?._id
            })
            router.push({
                path: '/post/' + post?._id,
                query: {
                    module: 'feed'
                }
            })
            break;

        default:
            break;
    }
}

onMounted(async () => {
    loadingFetching.value = false
    await fetchNotifications()
        .finally(() => {
            loadingFetching.value = false
        })
})
</script>