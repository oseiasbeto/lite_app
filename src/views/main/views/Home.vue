<template>
    <PostList
        v-if="isActive"
        :enable-pull-to-refresh="enablePullToRefresh"
        :posts="feedPosts?.posts || []" :has-more="feedPosts?.pagination?.hasMore || false"
        :loading-fetch="loadingFeedPosts" :loading-load-more="loadingLoadMore" :show-btn-follow="true"
        :initial-scroll="feedPosts?.pagination?.scrollTop || 0"
        module="feed"
        @on-load-more="handleLoadMore"
        @on-refresh="handleRefresh"
        @on-scroll="setScrollTopFromCache"
    >
        <template #header>
            <div class="relative">
                <CreatePostTrigger module="feed" :user="user" />
            </div>
        </template>
    </PostList>
</template>

<script setup>
import CreatePostTrigger from '@/views/posts/components/CreatePostTrigger.vue';
import PostList from '@/views/posts/components/PostList.vue';
import { ref, onMounted, onActivated, onDeactivated, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const loadingFeedPosts = ref(false)
const loadingLoadMore = ref(false)
const enablePullToRefresh = ref(false)
const isActive = ref(true)

const query = ref({ page: 1, limit: 10, module: 'feed', hasTotal: null })
const module = ref('feed')

const feedPosts = computed(() => {
    const modules = store.getters.modulePosts
    if (modules.length) return modules.find(m => m.module === module.value)
    return []
})

const user = computed(() => store.getters.currentUser)

const setScrollTopFromCache = (scrollTop) => {
    store.commit("UPDATE_PAGINATION_POSTS_FROM_CACHE", { module: module.value, scrollTop })
}

const fetchFeedPosts = async () => {
    await store.dispatch("getFeedPosts", query.value)
}

const handleLoadMore = async () => {
    const pagination = feedPosts.value?.pagination
    const { hasMore, total } = pagination

    loadingLoadMore.value = true

    if (hasMore) {
        query.value.page += 1
        query.value.hasTotal = total
        try {
            await fetchFeedPosts()
        } catch (err) {
            console.error("Erro ao carregar mais postagens:", err?.response?.data?.message)
        } finally {
            loadingLoadMore.value = false
        }
    }
}

const handleRefresh = async (done) => {
    loadingFeedPosts.value = true
    await fetchFeedPosts()
    loadingFeedPosts.value = false
    done()
}

onMounted(async () => {
    try {
        loadingFeedPosts.value = true
        await fetchFeedPosts()
    } catch (err) {
        console.error("Erro ao buscar posts do feed:", err?.response?.data?.message)
    } finally {
        loadingFeedPosts.value = false
        enablePullToRefresh.value = true
    }
})

onDeactivated(() => { isActive.value = false })
onActivated(() => { isActive.value = true })
</script>