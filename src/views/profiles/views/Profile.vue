<template>
    <div @scroll="setScrollTopFromCache" ref="profileView" class="relative h-screen overflow-y-scroll"
        :class="{ 'pb-[56px]': !profilePosts?.pagination?.hasMore }">
        <div
            class="fixed px-4 z-50 flex items-center justify-between top-0 w-full bg-x-light-bg dark:bg-x-dark-bg h-[50px]">
            <div class="flex w-[calc(100%-38px)] items-center">
                <button @click="router.back()"
                    class="p-1 hover:bg-x-light-surfaceHover active:bg-x-light-surfaceActive dark:hover:bg-x-dark-surfaceHover dark:active:bg-x-dark-surfaceActive text-inherit mr-1 rounded-full transition-colors mt-[-4px]">
                    <svg aria-label="Voltar" class="text-inherit" fill="currentColor" height="24" role="img"
                        viewBox="0 0 24 24" width="24">
                        <title>Voltar</title>
                        <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line>
                        <polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polyline>
                    </svg>
                </button>
                <!-- Informações do contato -->
                <div class="ml-1 flex-1 min-w-0">
                    <!-- Title -->
                    <div class="w-full items-center flex">
                        <h2
                            class="text-2xl mb-0.5 font-bold dark:text-white text-[rgb(40,40,41)] truncate leading-tight">
                            {{ profile?.username }}
                        </h2>

                        <svg viewBox="0 0 22 22" v-if="profile?.is_verified"
                            class="ml-[5px] shrink-0 mr-[2px] w-[18px] h-[18px] text-x-light-blue"
                            aria-label="Verified account" role="img" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg" data-testid="icon-verified">
                            <g>
                                <path
                                    d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z">
                                </path>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>

            <div v-if="!loadingFetchProfile">
                <button @click="handleMoreOptions"
                    class="p-1 hover:bg-x-light-surfaceHover active:bg-x-light-surfaceActive dark:hover:bg-x-dark-surfaceHover dark:active:bg-x-dark-surfaceActive text-inherit rounded-full transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24"
                        viewBox="0 0 24 24">

                        <g data-name="Layer 2">

                            <g data-name="more-vertical">

                                <rect width="24" height="24" transform="rotate(-90 12 12)" opacity="0" />

                                <circle cx="12" cy="12" r="2" />

                                <circle cx="12" cy="5" r="2" />

                                <circle cx="12" cy="19" r="2" />

                            </g>

                        </g>

                    </svg>
                </button>
            </div>
        </div>
        <div class="mt-[48px]" v-if="!hasError?.show">
            <div v-if="!loadingFetchProfile">
                <!-- Indicador flutuante estilo Facebook, não desloca o conteúdo -->
                <PullToRefreshIndicator v-if="enablePullToRefresh" :distance="pullDistance" :threshold="threshold"
                    :is-refreshing="isRefreshing" :top-position="54" />


                <div class="px-4 py-4 pb-2">
                    <ProfileDetailsUser @go-to-picture-full-screen="goToPictureFullScreen"
                        @go-to-followers="goToFollowers" @go-to-following="goToFollowing" @go-to-posts="goToPosts"
                        :profile="profile" :user-id="user?._id" />
                </div>

                <div class="px-4 pb-3">
                    <CredentialsHighlights />

                    <!--REACTIOS-->
                    <ProfileReactions :profile="profile" :user-id="user?._id" :is-same-user="isSameUser"
                        :has-followed="hasFollowed" :has-subscribed="hasSubscribed" :status-follow-txt="statusFollowTxt"
                        @on-follow="handleFollow(profile?._id)"
                        @on-edit="router.push('/profile/' + profile?._id + '/edit')"
                        @on-subscribe="handleSubscribe(profile?._id)" @on-send-message="openConv(profile)"
                        @more-options="openMoreOptionsDrawer" :is-disabled="isFollowing || isSubscribing"
                        :send-message-btn-off="!canSendMessage" />
                </div>

                <!-- Sugestões estilo Instagram, exibidas apenas no perfil de outra pessoa -->
                <!-- Sugestões estilo Instagram, exibidas apenas no perfil de outra pessoa -->
                <div v-if="!isSameUser" class="mt-4">
                    <div v-if="suggestionsError" class="px-1 py-2 text-sm text-red-500">
                        {{ suggestionsError }}
                    </div>

                    <UserSuggestionsCarousel v-else :users="suggestedUsers" :loading-fetch="suggestionsLoading"
                        :show-btn-follow="true" title="Sugestões para você" see-all-route="/people"
                        :exclude-user-id="profile?._id" start-spacing="16px" end-spacing="16px" />
                </div>

                <!--TABS-->
                <div class="relative">
                    <Tabs :tabs="tabs" v-model="currentTab" />
                </div>


                <!--TAB VIEWS-->
                <template v-if="currentTab === 'posts'">
                    <PostList :scroll-target="profileView" :posts="profilePosts?.posts || []"
                        :has-more="profilePosts?.pagination?.hasMore || false" :loading-fetch="loadingFetchProfilePosts"
                        :loading-load-more="loadingLoadMorePosts" :module="module" @on-load-more="handleLoadMore"
                        @post-deleted="handlePostDeleted" />
                </template>
                <template v-if="currentTab === 'questions'">
                    <!--Perguntas-->
                </template>
                <template v-if="currentTab === 'answers'">
                    <!--Respostas-->
                </template>
                <template v-if="currentTab === 'followers'">
                    <!--Seguidores-->
                </template>
                <template v-if="currentTab === 'following'">
                    <!--Seguindo-->
                </template>

                <!--DRAWER-->
                <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
                    <template v-if="drawer?.name == 'moreOptions'">
                        <DrawerItem v-if="canSendMessage" @on-press="openConv(profile)" title="Enviar mensagem" />
                    </template>
                </Drawer>
            </div>
            <div v-else>
                <ProfileSkeleton />
            </div>
        </div>
        <div v-else>
            <p>{{ hasError?.message }}</p>
        </div>
    </div>

</template>

<script setup>
import { computed, onMounted, onActivated, onUnmounted, watch, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import ProfileDetailsUser from '../components/ProfileDetailsUser.vue';
import ProfileReactions from '../components/ProfileReactions.vue';
import Tabs from '@/components/UI/Tabs.vue';
import PostList from '@/views/posts/components/PostList.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import CredentialsHighlights from '../components/CredentialsHighlights.vue';
import ProfileSkeleton from '../components/ProfileSkeleton.vue';
import PullToRefreshIndicator from '@/components/UI/PullToRefreshIndicator.vue';
import UserSuggestionsCarousel from '@/views/users/components/UserSuggestionsCarousel.vue';
import { usePullToRefresh } from '@/composables/usePullToRefresh';

// IMPORTANTE: o "name" precisa bater com o que estiver no :include do <keep-alive>
defineOptions({
    name: 'Profile'
})

const store = useStore()
const route = useRoute()
const router = useRouter()

const user = computed(() => store.getters?.currentUser || null)
const profile = computed(() => store.getters?.currentProfile || null)
const userId = computed(() => route.params.profile_id)
const isSameUser = computed(() => profile.value?._id?.toString() == user.value?._id?.toString())
const hasFollowed = computed(() => profile.value?.followers?.includes(user.value?._id.toString()))
const hasSubscribed = computed(() => profile.value?.subscriptions?.includes(user.value?._id.toString()))
const statusFollowTxt = computed(() => {
    if (hasFollowed.value) {
        return 'A seguir'
    } else {
        const isFollowBack = profile.value?.following?.includes(user.value?._id.toString());
        if (isFollowBack) return 'Seguir tambem'
        else return 'Seguir'
    }
})

const canSendMessage = computed(() => {
    if (isSameUser.value) return false
    else {
        const settings = profile.value?.settings
        const messagePrivacy = settings?.privacy?.message

        if (messagePrivacy === 'everybody') return true
        else if (messagePrivacy === 'followers') {
            if (hasFollowed.value) return true
            else return false
        } else if (messagePrivacy === 'nobody') return false
    }
})

// Computed para acessar as conversas do store Vuex
const conversations = computed(() => {
    // Acessa as conversas do store Vuex
    return store.getters.conversations;
})

// === Sugestões estilo Instagram, exibidas no perfil de outra pessoa ===
// Reaproveita o mesmo módulo "search" que já é usado na tela de busca (Search.vue)
const suggestedUsers = computed(() => store.getters['search/suggestedUsers'])
const suggestionsLoading = computed(() => store.getters['search/suggestionsLoading'])
const suggestionsError = computed(() => store.getters['search/suggestionsError'])

const loadingFetchProfile = ref(false)
const loadingLoadMorePosts = ref(false)
const loadingFetchProfilePosts = ref(false)
const isFollowing = ref(false)
const isSubscribing = ref(false)
const loadingOpenConv = ref(false)
const enablePullToRefresh = ref(true)

const hasError = ref({
    show: false,
    message: ""
})

const profileView = ref(null)
const currentTab = ref('posts')
const module = ref('profile')

const queryPosts = ref({
    page: 1,
    limit: 10,
    type: 'post',
    isPush: true,
    module: module.value,
    hasTotal: null
})

const drawer = ref({
    show: false,
    name: "",
    metadata: {}
})

const openDrawer = (data) => {
    const { show, name, metadata = {} } = data

    drawer.value = {
        show,
        name,
        metadata
    }
}

const closeDrawer = () => {
    drawer.value = {
        show: false,
        name: '',
        metadata: {}
    }
}

const tabs = ref([
    { label: 'Postagens', value: 'posts' },
    { label: 'Perguntas', value: 'questions' },
    { label: 'Respostas', value: 'answers' },
    { label: 'Seguidores', value: 'followers' },
    { label: 'Seguindo', value: 'following' },
])


const profilePosts = computed(() => {
    const modules = store.getters.modulePosts
    if (modules.length) {
        return modules.find(m => m.module === module.value)
    } else return []
})

const resetQueryPosts = () => {
    queryPosts.value = {
        page: 1,
        limit: 10,
        type: 'post',
        module: module.value,
        hasTotal: null
    }
}

let lastScrollTop = 0
const SCROLL_THRESHOLD = 5

const setScrollTopFromCache = (event) => {
    const scrollTop = event.target.scrollTop
    // --- lógica de direção do scroll pro FAB ---
    const diff = scrollTop - lastScrollTop

    if (Math.abs(diff) >= SCROLL_THRESHOLD) {
        if (scrollTop <= 50) {
            //showFab.value = true
            store.commit("SET_SHOW_BOTTOM_NAV", true)
        } else if (diff > 0) {
            //showFab.value = false // rolando pra baixo
            store.commit("SET_SHOW_BOTTOM_NAV", false)
        } else if (diff < 0) {
            //showFab.value = true // rolando pra cima
            store.commit("SET_SHOW_BOTTOM_NAV", true)
        }
        lastScrollTop = scrollTop
    }
    store.commit("UPDATE_PROFILE", {
        scrollTop
    })
}

const goToPictureFullScreen = () => {
    router.push(`/profile/${route.params.profile_id}/picture-fullscreen`)
}

const openMoreOptionsDrawer = () => {
    openDrawer({
        show: true,
        name: 'moreOptions'
    })
}

const fetchProfilePosts = async (userId, isRefresh = false) => {

    if (isRefresh) {
        resetQueryPosts()
    }

    await store.dispatch("getProfilePosts", {
        ...queryPosts.value,
        userId,
        isRefresh
    })
}

// Busca as sugestões de usuário pra exibir no carrossel.
// Só faz sentido sugerir gente pra seguir quando é o perfil de outra pessoa.
const fetchSuggestedUsers = async () => {
    if (isSameUser.value) return
    await store.dispatch('search/getSuggestedUsers')
}

const openConv = async (user) => {
    if (loadingOpenConv.value) return
    loadingOpenConv.value = true

    const convModules = conversations.value

    const moduleIndex = convModules.findIndex(m => m.source === 'active') || 0

    if (moduleIndex === -1) {
        store.commit("SET_IS_LOADING_COMPONENT", true)
        await store.dispatch('openDirectMessage', user._id)
            .then((conv) => {
                closeDrawer()
                router.push('/messages/' + conv?._id)
            }).finally(() => {
                loadingOpenConv.value = false
            })
    } else {
        const module = convModules[moduleIndex]
        const convIndex = module?.items?.findIndex(c => c.participants?.map(p => p.user?._id).includes(user._id))

        if (convIndex !== -1) {
            const conv = module.items[convIndex]
            store.commit("SET_CONVERSATION", {
                ...conv,
                source: 'active'
            })
            loadingOpenConv.value = false
            closeDrawer()
            router.push('/messages/' + conv?._id)
        } else {
            store.commit("SET_IS_LOADING_COMPONENT", true)
            await store.dispatch('openDirectMessage', user._id)
                .then((conv) => {
                    closeDrawer()
                    router.push('/messages/' + conv?._id)
                }).finally(() => {
                    loadingOpenConv.value = false
                })
        }

    }
}

const handleLoadMore = async () => {
    const pagination = profilePosts.value?.pagination
    const { hasMore, total } = pagination

    if (hasMore) {
        loadingLoadMorePosts.value = true
        queryPosts.value.isPush = true
        queryPosts.value.page += 1
        queryPosts.value.hasTotal = total
        await fetchProfilePosts(profile?.value?._id)
            .finally(() => {
                loadingLoadMorePosts.value = false
            })
    }
}

const handleFollow = async (userId) => {
    isFollowing.value = true
    await store.dispatch("followUser", userId)
        .finally(() => {
            isFollowing.value = false
        })
}

const handleSubscribe = async (userId) => {
    isSubscribing.value = true
    await store.dispatch("subscribeUser", userId)
        .finally(() => {
            isSubscribing.value = false
        })
}

// Handler para quando uma postagem é deletada
const handlePostDeleted = (postId) => {
    // Atualiza a lista localmente se necessário
    // O Vuex já vai atualizar automaticamente via mutation
    console.log('Postagem deletada:', postId);

    store.commit("REMOVE_POST_FROM_MODULE", {
        postId,
        moduleName: module.value
    })
    store.commit("REMOVE_POST_FROM_MODULE", {
        postId,
        moduleName: 'feed'
    })
}

onBeforeRouteLeave((to, from, next) => {
    if (drawer.value?.show) {
        closeDrawer()
        next(false)
    } else {
        next();
    }
});

// === Pull to refresh, só ativo se enablePullToRefresh for true ===
const { pullDistance, isRefreshing, threshold } = usePullToRefresh(
    profileView,
    () => emitRefreshAndWait(),
    {
        threshold: 70,
        maxPull: 90,
        enabled: enablePullToRefresh.value
    }
)

const emitRefreshAndWait = () => {
    return new Promise(async (resolve) => {
        await loadProfile(userId.value, true)
        resolve()
    })
}

const handleMoreOptions = () => {
    if (isSameUser.value) {
        router.push('/settings')
    } else {
        openMoreOptionsDrawer()
    }
}

const goToFollowers = () => {
    if (profile?.value?.followers?.length === 0) return

    router.push({
        name: 'ProfileFollow',
        params: { user_id: profile?.value?._id },
        query: { type: 'followers' }
    })
}

const goToFollowing = () => {
    if (profile?.value?.following?.length === 0) return
    
    router.push({
        name: 'ProfileFollow',
        params: { user_id: profile?.value?._id },
        query: { type: 'following' }
    })
}

const goToPosts = () => {
    // Implementation for navigating to posts
}

const loadProfile = async (userId, isRefresh = false) => {
    await store.dispatch("getProfileByUserId", userId)
        .finally(async () => {
            loadingFetchProfile.value = false
            loadingFetchProfilePosts.value = true

            queryPosts.value.isPush = false

            await fetchProfilePosts(userId, isRefresh)
                .finally(() => {
                    loadingFetchProfilePosts.value = false
                })
        })
        .catch(err => {
            const errMessage = err?.response?.data?.message || 'Houve um erro'

            hasError.value = {
                show: true,
                message: errMessage
            }
        })
}

// onMounted cuida só do carregamento inicial, quando o componente é criado do zero
onMounted(async () => {
    if (profile.value?._id !== userId.value) {
        loadingFetchProfile.value = true
        await loadProfile(userId.value)
    }
    // Busca as sugestões só depois do profile carregado, pra "isSameUser" já estar correto
    fetchSuggestedUsers()
})

// onActivated cuida de restaurar página/tab/scroll quando a tela reaparece
// via keep-alive, MAS só quando o perfil em cache já é o mesmo que a rota pede
onActivated(() => {
    if (profile.value?._id === userId.value) {
        const pagination = profilePosts.value?.pagination || null

        if (pagination) {
            const { page, total } = pagination
            queryPosts.value.isPush = true
            queryPosts.value.page = page
            queryPosts.value.hasTotal = total
        }

        const activeTab = profile?.value?.activeTab

        if (activeTab) {
            currentTab.value = activeTab
        }

        const scrollTop = profile?.value?.scrollTop
        if (scrollTop && profileView.value) {
            profileView.value.scrollTop = scrollTop
        }
    }

    // Reforça a busca de sugestões ao reativar via keep-alive, já que o
    // onUnmounted (ex: ao sair pra Search.vue) limpa o estado de sugestões
    fetchSuggestedUsers()
})

onUnmounted(() => {
    store.dispatch('search/clearSuggestions')
})

// Reage à troca de perfil (navegação entre /profile/:id diferentes)
// enquanto o componente está "vivo" dentro do keep-alive
watch(userId, async (newId, oldId) => {
    if (route.name !== 'Profile') return
    if (!newId || newId === oldId) return
    if (profile.value?._id === newId) return

    currentTab.value = 'posts'
    resetQueryPosts()

    // limpa as sugestões do perfil anterior imediatamente,
    // pra não "vazar" dado antigo enquanto o perfil novo carrega
    store.dispatch('search/clearSuggestions')

    loadingFetchProfile.value = true
    hasError.value = { show: false, message: "" }

    await loadProfile(newId)

    fetchSuggestedUsers()

    if (profileView.value) {
        profileView.value.scrollTop = 0
    }
})

watch(() => currentTab.value, async (newTab, oldTab) => {
    if (!newTab || newTab === oldTab) return

    if (newTab === 'posts') {
        loadingFetchProfilePosts.value = true
        resetQueryPosts()
        queryPosts.value.isPush = false

        await fetchProfilePosts(userId.value)
            .finally(() => {
                loadingFetchProfilePosts.value = false
                store.commit("UPDATE_PROFILE", {
                    activeTab: newTab
                })
            })
    }
},)
</script>