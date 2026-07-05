<template>
    <div @scroll="setScrollTopFromCache" class="relative h-screen overflow-x-hidden overflow-y-scroll" ref="feedView"
        :class="{ 'pb-[50px]': !feedPosts?.pagination?.hasMore }">
        <div class="relative">
            <PostUploadIndicator />
        </div>
        <div>
            <PostList :scroll-target="feedView" :enable-pull-to-refresh="enablePullToRefresh"
                :posts="feedPosts?.posts || []" :has-more="feedPosts?.pagination?.hasMore || false"
                :loading-fetch="loadingFeedPosts" :loading-load-more="loadingLoadMore" :show-btn-follow="true"
                module="feed" @post-deleted="handlePostDeleted" @on-load-more="handleLoadMore"
                @on-refresh="handleRefresh" />

            <!-- BOTÃO FLUTUANTE DO TELEGRAM -->
            <FloatingActionButton v-if="!loadingFeedPosts" :show="showFab" @onPress="goToComposer('feed')">
                <template #icon>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" width="100%" height="100%" class="w-[29px] h-[29px] text-inherit">
                        <path
                            d="M 20 9 L 20 16 C 20 18.209 18.209 20 16 20 L 8 20 C 5.791 20 4 18.209 4 16 L 4 8 C 4 5.791 5.791 4 8 4 L 15 4"
                            stroke-width="1.5"></path>
                        <line stroke-linecap="round" x1="10" y1="14" x2="18.5" y2="5.5" stroke-width="2.25"></line>
                        <line stroke-linecap="round" x1="20.5" y1="3.5" x2="21" y2="3" stroke-width="2.25"></line>
                    </svg>
                </template>
            </FloatingActionButton>
        </div>
    </div>
</template>

<script setup>
import CreatePostTrigger from '@/views/posts/components/CreatePostTrigger.vue';
import PostList from '@/views/posts/components/PostList.vue';
import { ref, onMounted, onActivated, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import FloatingActionButton from '@/components/buttons/FloatingActionButton.vue';
import PostUploadIndicator from '@/views/posts/components/PostUploadIndicator.vue';

const store = useStore()
const router = useRouter()

const loadingFeedPosts = ref(false)
const loadingLoadMore = ref(false)
const enablePullToRefresh = ref(false)

const query = ref({
    page: 1,
    limit: 10,
    module: 'feed',
    hasTotal: null
})

const module = ref('feed')
const feedView = ref(null)

// --- controle do FAB (mostrar/esconder por direção do scroll) ---
const showFab = ref(true)
let lastScrollTop = 0
const SCROLL_THRESHOLD = 5

const feedPosts = computed(() => {
    const modules = store.getters.modulePosts
    if (modules.length) {
        return modules.find(m => m.module === module.value)
    } else return []
})

const user = computed(() => store.getters.currentUser)

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

    // --- lógica de direção do scroll pro FAB ---
    const diff = scrollTop - lastScrollTop

    if (Math.abs(diff) >= SCROLL_THRESHOLD) {
        if (scrollTop <= 50) {
            showFab.value = true
            store.commit("SET_SHOW_BOTTOM_NAV", true)
        } else if (diff > 0) {
            showFab.value = false // rolando pra baixo
            store.commit("SET_SHOW_BOTTOM_NAV", false)
        } else if (diff < 0) {
            showFab.value = true // rolando pra cima
            store.commit("SET_SHOW_BOTTOM_NAV", true)
        }
        lastScrollTop = scrollTop
    }

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

    loadingLoadMore.value = true

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

const handleRefresh = async (done) => {
    loadingFeedPosts.value = true
    query.value.page = 1
    query.value.hasTotal = null
    await store.dispatch("getFeedPosts", { ...query.value, isRefresh: true })
    loadingFeedPosts.value = false
    done() // libera o indicador de loading
}

const handlePostDeleted = (postId) => {
    console.log('Postagem deletada:', postId);

    store.commit("REMOVE_POST_FROM_MODULE", {
        postId,
        moduleName: 'feed'
    })
}

const goToComposer = (module, postType) => {
    router.push({
        path: '/composer',
        query: {
            module: module,
            ...(postType && {
                post_type: postType
            })
        }
    })
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

onActivated(() => {
    if (feedPosts.value) {
        const { pagination } = feedPosts.value

        feedView.value.scrollTop = pagination?.scrollTop || 0
        lastScrollTop = pagination?.scrollTop || 0
    }
})
</script>