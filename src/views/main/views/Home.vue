<template>
    <div @scroll="setScrollTopFromCache" class="relative h-screen overflow-x-hidden overflow-y-scroll" ref="feedView"
        :class="{ 'pb-[50px]': !feedPosts?.pagination?.hasMore }">
        <div>
            <!--Header-->
            <div class="w-full h-[113px] relative"></div>
            <div class="fixed top-0 z-[11] w-full bg-white dark:bg-x-dark-bg transition-transform duration-300 ease-in-out will-change-transform"
                :class="showHeader ? 'translate-y-0' : '-translate-y-full'">
                <div class="px-[10px] flex justify-between items-center">
                    <Avatar size="sm" :url="user?.profile_image?.thumbnails?.md || user?.profile_image?.url" />
                    <!--LOGO-->
                    <div class="text-inherit">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="60px"
                            viewBox="0 0 1024.000000 1024.000000" preserveAspectRatio="xMidYMid meet">

                            <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)" fill="currentColor"
                                stroke="none">
                                <path
                                    d="M2516 7511 c-3 -5 -21 -12 -40 -15 -71 -13 -154 -87 -537 -472 -421 -424 -425 -429 -450 -567 -24 -130 20 -263 122 -365 51 -51 78 -69 173 -113 18 -9 66 -14 130 -14 89 0 108 3 160 28 32 15 69 27 82 27 l24 0 0 -948 c0 -724 3 -951 12 -960 17 -17 829 -17 846 0 9 9 12 359 12 1515 0 1615 2 1551 -50 1654 -49 96 -199 219 -266 219 -13 0 -26 5 -29 10 -8 12 -182 13 -189 1z" />
                                <path
                                    d="M3895 7511 c-6 -5 -36 -17 -69 -26 -105 -33 -220 -168 -255 -300 -15 -56 -15 -4074 0 -4130 21 -80 63 -150 130 -216 54 -53 78 -69 125 -84 33 -9 63 -21 68 -26 13 -12 182 -11 204 0 9 6 47 24 84 41 64 29 115 78 910 871 464 463 850 845 859 850 17 9 60 -33 1289 -1254 449 -446 478 -472 580 -503 52 -16 206 -19 215 -4 3 6 13 10 22 10 33 0 128 56 178 105 106 103 158 271 124 400 -31 120 -15 102 -916 1005 -469 470 -853 862 -853 870 0 8 384 400 853 870 901 903 885 885 916 1005 34 129 -18 297 -124 400 -50 49 -145 105 -178 105 -9 0 -19 5 -22 10 -9 15 -163 12 -215 -4 -52 -16 -113 -48 -155 -83 -16 -14 -743 -734 -1614 -1602 -871 -867 -1592 -1577 -1602 -1579 -18 -3 -19 36 -22 1455 -2 963 -6 1472 -13 1498 -6 22 -19 55 -30 74 -10 18 -24 43 -31 55 -28 49 -108 117 -171 146 -37 17 -75 35 -84 41 -22 11 -191 12 -203 0z" />
                                <path
                                    d="M2550 3603 c-65 -7 -167 -52 -218 -97 -56 -49 -120 -143 -136 -199 -29 -106 -38 -157 -28 -170 5 -6 12 -34 15 -60 20 -151 163 -296 338 -342 62 -17 155 -20 164 -5 3 6 17 10 31 10 74 0 239 125 281 213 11 23 28 57 37 76 12 25 16 63 16 138 0 106 -9 138 -75 253 -41 73 -186 163 -291 180 -59 10 -68 10 -134 3z" />
                            </g>
                        </svg>
                    </div>

                    <!--SEARCH-->
                    <router-link to="/search"
                        class="flex active:text-x-light-textPrimary active:dark:text-x-dark-textPrimary transition-colors items-center justify-center w-[48px] h-[48px] text-x-light-textSecondary dark:text-x-dark-textSecondary">
                        <svg aria-label="Pesquisar" role="img" viewBox="0 0 24 24"
                            class="w-[24px] h-[24px] text-inherit">
                            <title>Pesquisar</title>
                            <path clip-rule="evenodd"
                                d="M11.2607 1.01074C5.59982 1.01074 1.01074 5.59982 1.01074 11.2607C1.01074 16.9217 5.59982 21.5107 11.2607 21.5107C13.6407 21.5107 15.8312 20.6996 17.5709 19.3387L20.8554 22.6231C21.3435 23.1113 22.135 23.1113 22.6231 22.6231C23.1113 22.135 23.1113 21.3435 22.6231 20.8554L19.3387 17.5709C20.6996 15.8312 21.5107 13.6407 21.5107 11.2607C21.5107 5.59982 16.9217 1.01074 11.2607 1.01074ZM3.51074 11.2607C3.51074 6.98053 6.98054 3.51074 11.2607 3.51074C15.5409 3.51074 19.0107 6.98053 19.0107 11.2607C19.0107 15.541 15.5409 19.0107 11.2607 19.0107C6.98054 19.0107 3.51074 15.541 3.51074 11.2607Z"
                                fill="currentColor" fill-rule="evenodd"></path>
                        </svg>
                    </router-link>
                </div>
                
                <!--TABS-->
                <Tabs :tabs="tabs" v-model="currentTab" />
            </div>

            <PostList :scroll-target="feedView" :enable-pull-to-refresh="enablePullToRefresh"
                :posts="feedPosts?.posts || []" :has-more="feedPosts?.pagination?.hasMore || false"
                :loading-fetch="loadingFeedPosts" :loading-load-more="loadingLoadMore" :show-btn-follow="true"
                :module="module" @post-deleted="handlePostDeleted" @on-load-more="handleLoadMore"
                @on-refresh="handleRefresh" />
        </div>
    </div>
</template>

<script setup>
import PostList from '@/views/posts/components/PostList.vue';
import { ref, onMounted, reactive, onActivated, nextTick, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Tabs from '@/components/UI/Tabs.vue';
import Avatar from '@/components/Utils/Avatar.vue';

const store = useStore()
const router = useRouter()

const loadingFeedPosts = ref(false)
const loadingLoadMore = ref(false)
const enablePullToRefresh = ref(false)

const TAB_MODULE_MAP = {
    foryou: 'feed',
    following: 'following'
}
const MODULE_TAB_MAP = {
    feed: 'foryou',
    following: 'following'
}

const module = computed(() => TAB_MODULE_MAP[currentTab.value] || 'feed')

const getQueryFor = (mod) => {
    if (!queriesByModule[mod]) {
        queriesByModule[mod] = {
            page: 1,
            limit: 10,
            module: mod,
            hasTotal: null
        }
    }
    return queriesByModule[mod]
}

const resetQueryFor = (mod) => {
    queriesByModule[mod] = {
        page: 1,
        limit: 10,
        module: mod,
        hasTotal: null
    }
    return queriesByModule[mod]
}

// Uma query de paginação independente POR módulo/aba
const queriesByModule = reactive({})

const feedView = ref(null)
const currentTab = ref('foryou')

const tabs = ref([
    { label: 'Para você', value: 'foryou' },
    { label: 'Seguindo', value: 'following' }
])

// --- controle do FAB (mostrar/esconder por direção do scroll) ---
const showHeader = ref(true)
let lastScrollTop = 0
const SCROLL_THRESHOLD = 15

const feedPosts = computed(() => {
    const modules = store.getters.modulePosts
    if (modules.length) {
        return modules.find(m => m.module === module.value)
    } else return []
})


const user = computed(() => store.getters.currentUser)

const setScrollTopFromCache = (event) => {
    const scrollTop = event.target.scrollTop

    // --- lógica de direção do scroll pro FAB ---
    const diff = scrollTop - lastScrollTop

    if (Math.abs(diff) >= SCROLL_THRESHOLD) {
        if (scrollTop <= 50) {
            showHeader.value = true
            store.commit("SET_SHOW_BOTTOM_NAV", true)
        } else if (diff > 0) {
            if (diff > 19) {
                showHeader.value = false
            }
            store.commit("SET_SHOW_BOTTOM_NAV", false)
        } else if (diff < 0) {
            showHeader.value = true // rolando pra cima
            store.commit("SET_SHOW_BOTTOM_NAV", true)
        }
        lastScrollTop = scrollTop
    }

    store.commit("UPDATE_PAGINATION_POSTS_FROM_CACHE", {
        module: module.value,
        scrollTop
    })
}

// Busca posts pro módulo indicado (extra permite passar isRefresh, etc.)
const fetchFeedPosts = async (mod, extra = {}) => {
    const query = getQueryFor(mod)
    await store.dispatch("getFeedPosts", {
        ...query,
        feedType: MODULE_TAB_MAP[mod] || mod,
        ...extra
    })
}

const handleLoadMore = async () => {
    const currentModule = module.value
    const pagination = feedPosts.value?.pagination
    const { hasMore, total } = pagination || {}

    if (hasMore) {
        loadingLoadMore.value = true
        const query = getQueryFor(currentModule)
        query.page += 1
        query.hasTotal = total

        try {
            await fetchFeedPosts(currentModule)
        } catch (err) {
            console.error("Erro ao carregar mais postagens:", err?.response?.data?.message)
        } finally {
            loadingLoadMore.value = false
        }
    }
}

const handleRefresh = async (done) => {
    const currentModule = module.value
    loadingFeedPosts.value = true
    resetQueryFor(currentModule)

    try {
        await fetchFeedPosts(currentModule, { isRefresh: true })
    } finally {
        loadingFeedPosts.value = false
        done() // libera o indicador de loading
    }
}

const handlePostDeleted = async (postId) => {
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

// --- Troca de aba ---
// 1) Salva o scroll atual no cache do módulo que está saindo.
// 2) Ativa o módulo novo (o computed `module` muda sozinho via currentTab).
// 3) Restaura, do cache, o scroll salvo do módulo que está entrando.
// 4) Se ainda não tiver posts cacheados pra esse módulo, busca a 1ª página.
watch(currentTab, async (newTab, oldTab) => {
    const oldModule = TAB_MODULE_MAP[oldTab] || 'feed'

    if (feedView.value) {
        store.commit("UPDATE_PAGINATION_POSTS_FROM_CACHE", {
            module: oldModule,
            scrollTop: feedView.value.scrollTop
        })
    }

    const newModule = TAB_MODULE_MAP[newTab] || 'feed'
    const cachedModuleData = store.getters.modulePosts.find(m => m.module === newModule)

    // Espera o DOM re-renderizar com os posts do módulo novo (mesmo que
    // ainda vazio) antes de mexer no scrollTop, senão o valor é aplicado
    // sobre o conteúdo antigo.
    await nextTick()
    if (feedView.value) {
        const restoredScrollTop = cachedModuleData?.pagination?.scrollTop || 0
        feedView.value.scrollTop = restoredScrollTop
        lastScrollTop = restoredScrollTop
    }

    if (!cachedModuleData || !cachedModuleData.posts?.length) {
        loadingFeedPosts.value = true
        try {
            await fetchFeedPosts(newModule)
        } catch (err) {
            console.log(err)
            console.error("Erro ao buscar posts do feed:", err?.response?.data?.message)
        } finally {
            loadingFeedPosts.value = false
        }
    }
})

onMounted(async () => {
    try {
        loadingFeedPosts.value = true
        await fetchFeedPosts(module.value)   // ou simplesmente 'feed'
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