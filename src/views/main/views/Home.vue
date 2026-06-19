<template>
    <div @scroll="setScrollTopFromCache" class="relative h-[calc(100vh-56px)] overflow-y-scroll" ref="feedView">
        <div class="relative">
            <CreatePostTrigger module="feed" :user="user" />
        </div>
        <div>
            <PostList :posts="feedPosts?.posts || []" :has-more="feedPosts?.pagination?.hasMore || false"
                :loading-fetch="loadingFeedPosts" :loading-load-more="loadingLoadMore" :show-btn-follow="true"
                module="feed" @on-load-more="handleLoadMore" @on-refresh="handleRefresh" />
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

const handleRefresh = async (done) => {
    await fetchFeedPosts()
    await scrollToTopWithBoost()
    done() // libera o indicador de loading
}

const scrollToTopWithBoost = () => {
    return new Promise((resolve) => {
        const el = feedView.value
        if (!el) return resolve()

        // Scroll suave até o topo
        el.scrollTo({ top: 0, behavior: 'smooth' })

        // Espera o scroll chegar ao topo antes de aplicar o boost
        const checkIfReachedTop = setInterval(() => {
            if (el.scrollTop <= 0) {
                clearInterval(checkIfReachedTop)
                applyBoostEffect(el)
                resolve()
            }
        }, 50)

        // Fallback de segurança caso não detecte o scrollTop (alguns navegadores arredondam)
        setTimeout(() => {
            clearInterval(checkIfReachedTop)
            applyBoostEffect(el)
            resolve()
        }, 600)
    })
}

const applyBoostEffect = (el) => {
    el.style.transition = 'transform 0.18s ease-out'
    el.style.transform = 'translateY(8px)'

    setTimeout(() => {
        el.style.transition = 'transform 0.22s ease-in-out'
        el.style.transform = 'translateY(0)'
    }, 180)

    // Limpa os estilos inline depois da animação
    setTimeout(() => {
        el.style.transition = ''
        el.style.transform = ''
    }, 420)
}

onMounted(async () => {
    try {
        loadingFeedPosts.value = true
        await fetchFeedPosts()

        // bannerAd({ adId: "ca-app-pub-3940256099942544/6300978111"})
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