<template>
    <div class="relative overflow-hidden">
        <VirtualPostList 
            :posts="feedPosts?.posts || []" 
            :has-more="feedPosts?.pagination?.hasMore || false"
            :loading-fetch="loadingFeedPosts" 
            :loading-load-more="loadingLoadMore" 
            module="feed"
            @on-load-more="handleLoadMore">
            <template #before-content>
                <CreatePostTrigger module="feed" />
            </template>
        </VirtualPostList>
    </div>
</template>

<script setup>
import CreatePostTrigger from '@/views/posts/components/CreatePostTrigger.vue';
import VirtualPostList from '@/views/posts/components/VirtualPostList.vue';
import { ref, onMounted, computed } from 'vue';
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
</script>