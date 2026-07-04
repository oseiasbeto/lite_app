<template>
    <div @scroll="setScrollTopFromCache" class="relative h-screen overflow-x-hidden overflow-y-scroll" ref="feedView"
    :class="{'pb-[40px]': !feedPosts?.pagination?.hasMore}">
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
            <FloatingActionButton :show="showFab" @onPress="goToComposer('feed')">
                <template #icon>
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-[26px] h-[26px] text-inherit">
                        <g>
                            <path fill="currentColor"
                                d="M10.938 4.5H9.9c-1.136 0-1.929 0-2.546.05-.605.05-.953.143-1.216.277-.564.288-1.023.747-1.31 1.31-.135.264-.228.612-.277 1.218C4.5 7.97 4.5 8.765 4.5 9.9v4.2c0 1.136 0 1.929.05 2.546.05.605.143.953.277 1.216.288.565.747 1.023 1.31 1.31.264.135.612.228 1.217.277.617.05 1.41.051 2.546.051h4.2c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277.565-.288 1.023-.746 1.31-1.31.135-.264.228-.612.277-1.217.05-.617.051-1.41.051-2.546v-1.037h2V14.1c0 1.103.001 1.992-.058 2.709-.06.728-.185 1.368-.487 1.96-.48.941-1.245 1.707-2.185 2.186-.593.302-1.233.428-1.961.488-.718.058-1.606.057-2.71.057H9.9c-1.103 0-1.991.001-2.709-.058-.728-.06-1.368-.185-1.96-.487-.941-.48-1.707-1.245-2.186-2.185-.302-.593-.428-1.233-.487-1.961-.059-.718-.058-1.606-.058-2.71V9.9c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96.48-.941 1.245-1.707 2.185-2.186.593-.302 1.233-.428 1.961-.487.718-.059 1.606-.058 2.71-.058h1.037v2z">
                            </path>
                            <path
                                d="M16.293 3.293c1.219-1.219 3.195-1.219 4.414 0 1.219 1.219 1.219 3.195 0 4.414l-5.491 5.491c-.533.533-.89.896-1.31 1.179-.356.24-.742.433-1.148.574-.478.167-.983.234-1.729.341l-2.708.387.387-2.708c.107-.746.174-1.25.34-1.729.142-.405.335-.792.575-1.148.283-.42.646-.777 1.179-1.31l5.491-5.491zm3 1.414c-.438-.438-1.148-.438-1.586 0l-5.491 5.491c-.587.587-.784.79-.934 1.013-.144.214-.26.445-.345.688-.088.254-.131.533-.248 1.354l-.01.067.068-.008c.82-.118 1.1-.161 1.354-.25.243-.084.474-.2.688-.344.223-.15.426-.347 1.013-.934l5.491-5.491c.438-.438.438-1.148 0-1.586z"
                                fill="currentColor"></path>
                        </g>
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