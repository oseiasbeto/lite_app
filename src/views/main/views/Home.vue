<template>
    <div class="relative h-screen overflow-hidden">
        <!--Header (fixo, compartilhado pelas duas abas)-->
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
                    <svg aria-label="Pesquisar" role="img" viewBox="0 0 24 24" class="w-[24px] h-[24px] text-inherit">
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

        
        <div v-for="tab in tabs" :key="tab.value" v-show="currentTab === tab.value"
            class="absolute inset-0 top-0">
            <div :ref="el => setScrollRef(tab.value, el)" @scroll="(e) => onScroll(tab.value, e)"
                class="h-screen overflow-x-hidden overflow-y-scroll"
                :class="{ 'pb-[50px]': !getPagination(TAB_MODULE_MAP[tab.value])?.hasMore }">
                <div class="w-full h-[113px] relative"></div>
                <PostList :scroll-target="scrollRefs[tab.value]" :enable-pull-to-refresh="enablePullToRefresh"
                    :posts="postsByModule(TAB_MODULE_MAP[tab.value])"
                    :has-more="getPagination(TAB_MODULE_MAP[tab.value])?.hasMore || false"
                    :loading-fetch="loadingByModule[TAB_MODULE_MAP[tab.value]]"
                    :loading-load-more="loadingLoadMoreByModule[TAB_MODULE_MAP[tab.value]]" :show-btn-follow="true"
                    :module="TAB_MODULE_MAP[tab.value]" @post-deleted="(id) => handlePostDeleted(id, TAB_MODULE_MAP[tab.value])"
                    @on-load-more="() => handleLoadMore(TAB_MODULE_MAP[tab.value])"
                    @on-refresh="(done) => handleRefresh(TAB_MODULE_MAP[tab.value], done)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import PostList from '@/views/posts/components/PostList.vue';
import { ref, reactive, onMounted, onActivated, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const enablePullToRefresh = ref(false)

const TAB_MODULE_MAP = {
    foryou: 'feed',
    following: 'following'
}
const MODULE_TAB_MAP = {
    feed: 'foryou',
    following: 'following'
}

const tabs = ref([
    { label: 'Para você', value: 'foryou' },
    { label: 'Seguindo', value: 'following' }
])

const currentTab = ref('foryou')

// --- estado de paginação POR módulo (igual antes) ---
const queriesByModule = reactive({})

const getQueryFor = (mod) => {
    if (!queriesByModule[mod]) {
        queriesByModule[mod] = { page: 1, limit: 10, module: mod, hasTotal: null }
    }
    return queriesByModule[mod]
}

const resetQueryFor = (mod) => {
    queriesByModule[mod] = { page: 1, limit: 10, module: mod, hasTotal: null }
    return queriesByModule[mod]
}

// --- loading POR módulo (as duas abas podem estar carregando de forma independente) ---
const loadingByModule = reactive({ feed: false, following: false })
const loadingLoadMoreByModule = reactive({ feed: false, following: false })

// --- refs de scroll, um container por aba ---
const scrollRefs = reactive({ foryou: null, following: null })
const setScrollRef = (tabValue, el) => {
    scrollRefs[tabValue] = el
}

// --- controle do header (mostrar/esconder por direção do scroll) ---
const showHeader = ref(true)
const lastScrollTopByModule = reactive({ feed: 0, following: 0 })
const SCROLL_THRESHOLD = 15

const onScroll = (tabValue, event) => {
    const mod = TAB_MODULE_MAP[tabValue]
    const scrollTop = event.target.scrollTop
    const lastScrollTop = lastScrollTopByModule[mod] || 0
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
            showHeader.value = true
            store.commit("SET_SHOW_BOTTOM_NAV", true)
        }
        lastScrollTopByModule[mod] = scrollTop
    }

    // guardamos o scrollTop apenas como fallback, para o caso de esta view
    // inteira ser desmontada e remontada (fora de um <keep-alive> de rota).
    // Enquanto o componente permanece montado, o navegador já preserva o
    // scroll de cada container nativamente — não é necessário restaurar nada.
    store.commit("UPDATE_PAGINATION_POSTS_FROM_CACHE", { module: mod, scrollTop })
}

// --- dados dos posts, direto do store, por módulo ---
const modulePostsFor = (mod) => {
    const modules = store.getters.modulePosts
    return modules.find(m => m.module === mod)
}

const postsByModule = (mod) => modulePostsFor(mod)?.posts || []
const getPagination = (mod) => modulePostsFor(mod)?.pagination

const user = computed(() => store.getters.currentUser)

// --- fetch de posts, igual antes ---
const fetchFeedPosts = async (mod, extra = {}) => {
    const query = getQueryFor(mod)
    await store.dispatch("getFeedPosts", {
        ...query,
        feedType: MODULE_TAB_MAP[mod] || mod,
        ...extra
    })
}

const handleLoadMore = async (mod) => {
    const pagination = getPagination(mod)
    const { hasMore, total } = pagination || {}

    if (hasMore) {
        loadingLoadMoreByModule[mod] = true
        const query = getQueryFor(mod)
        query.page += 1
        query.hasTotal = total

        try {
            await fetchFeedPosts(mod)
        } catch (err) {
            console.error("Erro ao carregar mais postagens:", err?.response?.data?.message)
        } finally {
            loadingLoadMoreByModule[mod] = false
        }
    }
}

const handleRefresh = async (mod, done) => {
    loadingByModule[mod] = true
    resetQueryFor(mod)

    try {
        await fetchFeedPosts(mod, { isRefresh: true })
    } finally {
        loadingByModule[mod] = false
        done()
    }
}

const handlePostDeleted = (postId, mod) => {
    store.commit("REMOVE_POST_FROM_MODULE", {
        postId,
        moduleName: mod
    })
}

// Só busca a aba ativa no mount. A outra aba busca sob demanda,
// na primeira vez que o usuário troca pra ela (ver watch abaixo).
const fetchIfNeeded = async (mod) => {
    const cached = modulePostsFor(mod)
    const needsFetch = !cached || !cached.posts?.length
    if (!needsFetch) return

    loadingByModule[mod] = true
    try {
        await fetchFeedPosts(mod)
    } catch (err) {
        console.error("Erro ao buscar posts do feed:", err?.response?.data?.message)
    } finally {
        loadingByModule[mod] = false
    }
}

import { watch } from 'vue'
import Tabs from '@/components/UI/Tabs.vue';
import Avatar from '@/components/Utils/Avatar.vue';
watch(currentTab, (newTab) => {
    const mod = TAB_MODULE_MAP[newTab]
    fetchIfNeeded(mod)
})

onMounted(async () => {
    await fetchIfNeeded(TAB_MODULE_MAP[currentTab.value])
    enablePullToRefresh.value = true
})

// Fallback: se esta view inteira for desmontada/remontada por fora
// (ex: sem <keep-alive> na rota), restauramos o scroll salvo no store
// pro container da aba ativa no momento da reativação.
onActivated(() => {
    const mod = TAB_MODULE_MAP[currentTab.value]
    const pagination = getPagination(mod)
    const el = scrollRefs[currentTab.value]
    if (el) {
        const top = pagination?.scrollTop || 0
        el.scrollTop = top
        lastScrollTopByModule[mod] = top
    }
})
</script>