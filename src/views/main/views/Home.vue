<template>
    <div @scroll="setScrollTopFromCache" class="relative h-[calc(100vh-56px)] overflow-y-scroll"
    ref="feedView"
    >
    <div class="pb-1 border-b border-b-gray-50">
        <CreatePostTrigger module="feed" />
    </div>
    <div>
        <PostList  
            :posts="feedPosts?.posts || []" 
            :has-more="feedPosts?.pagination?.hasMore || false"
            :loading-fetch="loadingFeedPosts" 
            :loading-load-more="loadingLoadMore" 
            :show-btn-follow="true"
            module="feed"
            @on-load-more="handleLoadMore" 
            />
    </div>
        
    </div>
</template>

<script setup>
import CreatePostTrigger from '@/views/posts/components/CreatePostTrigger.vue';
import PostList from '@/views/posts/components/PostList.vue';
import { ref, onMounted, onActivated, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const loadingFeedPosts = ref(false)
const loadingLoadMore = ref(false)

const query = ref({
    page: 1,
    limit: 10,
    module: 'feed',
    hasTotal: null
})

const module = ref('feed')
const feedView = ref(null)

const feedPosts = computed(() => {
    const modules = store.getters.modulePosts
    if (modules.length) {
        return modules.find(m => m.module === module.value)
    } else return []
})

const resetQuery = () => {
    query.value = {
        page: 1,
        limit: 10,
        module: 'feed',
        total: null
    }
}

const setScrollTopFromCache = (event) => {
    const scrollTop = event.target.scrollTop
    store.commit("UPDATE_PAGINATION_POSTS_FROM_CACHE", {
        module: module.value,
        scrollTop
    })
}

const fetchFeedPosts = async () => {
    await store.dispatch("getFeedPosts", query.value)
}

const handleLoadMore = async () => {
    const pagination = feedPosts.value?.pagination
    const { hasMore, total } = pagination

    if (hasMore) {
        loadingLoadMore.value = true
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

onMounted(async () => {
    try {
        loadingFeedPosts.value = true
        await fetchFeedPosts()
    } catch (err) {
        console.error("Erro ao buscar posts do feed:", err?.response?.data?.message)
    } finally {
        loadingFeedPosts.value = false
    }

})

onActivated(() => {
    if (feedPosts.value) {
        const { pagination } = feedPosts.value
          
        feedView.value.scrollTop = pagination?.scrollTop || 0
    }
})
</script>