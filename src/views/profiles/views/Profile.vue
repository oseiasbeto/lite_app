<template>
    <Navbar :loading="loadingFetchProfile" :title="profile?.name || 'Perfil'">
        <template v-if="!loadingFetchProfile" #right>
            <button v-if="isSameUser" @click="router.push('/settings')"
                class="p-2 text-text-primary hover:bg-background-secondary rounded-full">
                <svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g stroke="none" fill="none" fill-rule="evenodd">
                        <g id="settings" class="icon_svg-stroke icon_svg-fill" transform="translate(2.000000, 2.000000)"
                            stroke="currentColor" stroke-width="1.5">
                            <path
                                d="M13.125,10 C13.125,11.7260417 11.7260417,13.125 10,13.125 C8.27447917,13.125 6.875,11.7260417 6.875,10 C6.875,8.27447917 8.27447917,6.875 10,6.875 C11.7260417,6.875 13.125,8.27447917 13.125,10 Z"
                                id="Stroke-1"></path>
                            <path
                                d="M20,10 C20,9.61764706 19.9717647,9.24176471 19.9264706,8.87176471 C19.8994118,8.65 19.7429412,8.46470588 19.5317647,8.39235294 L17.0682353,7.55 C16.7329412,7.43529412 16.5747059,7.05235294 16.7305882,6.73470588 L17.8752941,4.40058824 C17.9747059,4.19764706 17.9535294,3.95235294 17.8123529,3.77529412 C17.3441176,3.18823529 16.8117647,2.65588235 16.2247059,2.18764706 C16.0482353,2.04647059 15.8023529,2.02529412 15.5994118,2.12470588 L13.2658824,3.26941176 C12.9476471,3.42588235 12.5647059,3.26705882 12.45,2.93176471 L11.6076471,0.468235294 C11.5358824,0.257058824 11.3505882,0.100588235 11.1282353,0.0735294118 C10.7582353,0.0282352941 10.3829412,0 10,0 C9.61764706,0 9.24176471,0.0282352941 8.87176471,0.0735294118 C8.65,0.100588235 8.46470588,0.257058824 8.39235294,0.468235294 L7.55,2.93176471 C7.43529412,3.26705882 7.05235294,3.42588235 6.73470588,3.26941176 L4.40058824,2.12470588 C4.19823529,2.02529412 3.95235294,2.04647059 3.77529412,2.18764706 C3.18823529,2.65588235 2.65588235,3.18823529 2.18764706,3.77529412 C2.04647059,3.95235294 2.02529412,4.19764706 2.12529412,4.40058824 L3.27,6.73470588 C3.42588235,7.05235294 3.26705882,7.43529412 2.93176471,7.55 L0.468235294,8.39235294 C0.257058824,8.46470588 0.100588235,8.65 0.0735294118,8.87176471 C0.0282352941,9.24176471 0,9.61764706 0,10 C0,10.3823529 0.0282352941,10.7582353 0.0735294118,11.1282353 C0.100588235,11.35 0.257058824,11.5352941 0.468235294,11.6076471 L2.93176471,12.45 C3.26705882,12.5647059 3.42588235,12.9476471 3.27,13.2658824 L2.12529412,15.5994118 C2.02529412,15.8023529 2.04647059,16.0476471 2.18764706,16.2247059 C2.65588235,16.8117647 3.18823529,17.3441176 3.77529412,17.8123529 C3.95235294,17.9535294 4.19764706,17.9747059 4.40058824,17.8752941 L6.73470588,16.7305882 C7.05235294,16.5747059 7.43529412,16.7329412 7.55,17.0682353 L8.39235294,19.5317647 C8.46470588,19.7429412 8.65,19.8994118 8.87176471,19.9264706 C9.24176471,19.9717647 9.61764706,20 10,20 C10.3829412,20 10.7582353,19.9717647 11.1282353,19.9264706 C11.3505882,19.8994118 11.5358824,19.7429412 11.6076471,19.5317647 L12.45,17.0682353 C12.5647059,16.7329412 12.9476471,16.5747059 13.2658824,16.7305882 L15.5994118,17.8752941 C15.8023529,17.9747059 16.0482353,17.9535294 16.2247059,17.8123529 C16.8117647,17.3441176 17.3441176,16.8117647 17.8123529,16.2247059 C17.9535294,16.0482353 17.9747059,15.8023529 17.8752941,15.5994118 L16.7305882,13.2658824 C16.5747059,12.9476471 16.7329412,12.5647059 17.0682353,12.45 L19.5317647,11.6076471 C19.7429412,11.5352941 19.8994118,11.35 19.9264706,11.1282353 C19.9717647,10.7582353 20,10.3823529 20,10 Z"
                                id="Stroke-3"></path>
                        </g>
                    </g>
                </svg>
            </button>
        </template>
    </Navbar>
    <div @scroll="setScrollTopFromCache" ref="profileView" class="relative h-[calc(100vh-100px)] overflow-y-scroll mt-[44px]">
        <div v-if="!hasError?.show">
            <div v-if="!loadingFetchProfile">
                <!-- Indicador flutuante estilo Facebook, não desloca o conteúdo -->
                <PullToRefreshIndicator v-if="enablePullToRefresh" 
                    :distance="pullDistance" 
                    :threshold="threshold"
                    :is-refreshing="isRefreshing"
                    :top-position="54"
                    />
                <div
                    class="border-b-[6px] dark:bg-[#262626] dark:border-[rgb(24,24,24)] bg-white border-[rgb(230,231,232)]">
                    <!--DETAILS USER-->
                    <div class="px-[10px] py-4 pb-2">
                        <ProfileDetailsUser @go-to-picture-full-screen="goToPictureFullScreen" :profile="profile" :user-id="user?._id" />
                    </div>

                    <!--REACTIOS-->
                    <div class="px-[10px] pb-3">
                        <ProfileReactions :profile="profile" :user-id="user?._id" :is-same-user="isSameUser"
                            :has-followed="hasFollowed" :has-subscribed="hasSubscribed"
                            :status-follow-txt="statusFollowTxt" @on-follow="handleFollow(profile?._id)"
                            @on-edit="router.push('/profile/' + profile?._id + '/edit')"
                            @on-subscribe="handleSubscribe(profile?._id)" @on-send-message="openConv(profile)"
                            @more-options="openMoreOptionsDrawer" :is-disabled="isFollowing || isSubscribing"
                            :send-message-btn-off="!canSendMessage" />
                    </div>
                </div>

                <!--J-->
                <CredentialsHighlights />

                <!--TABS-->
                <Tabs :tabs="tabs" v-model="currentTab" />

                <!--TAB VIEWS-->
                <template v-if="currentTab === 'posts'">
                    <PostList :posts="profilePosts?.posts || []" :has-more="profilePosts?.pagination?.hasMore || false"
                        :loading-fetch="loadingFetchProfilePosts" :loading-load-more="loadingLoadMorePosts"
                        :module="module" @on-load-more="handleLoadMore" />
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
import { computed, onMounted, watch, ref } from 'vue';
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
import Navbar from '@/views/main/components/Navbar.vue';
import PullToRefreshIndicator from '@/components/UI/PullToRefreshIndicator.vue';
import { usePullToRefresh } from '@/composables/usePullToRefresh';

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
        return 'Seguindo'
    } else {
        const isFollowBack = profile.value?.following?.includes(user.value?._id.toString());
        if (isFollowBack) return 'Seguir de Volta'
        else return '+Seguir'
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

const setScrollTopFromCache = (event) => {
    const scrollTop = event.target.scrollTop
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

const fetchProfilePosts = async (userId) => {
    await store.dispatch("getProfilePosts", {
        ...queryPosts.value,
        userId
    })
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
        await loadProfile(userId.value)
        resolve()
    })
}

const loadProfile = async (userId) => {
    await store.dispatch("getProfileByUserId", userId)
        .finally(async () => {
            loadingFetchProfile.value = false
            loadingFetchProfilePosts.value = true

            queryPosts.value.isPush = false

            await fetchProfilePosts(userId)
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

onMounted(async () => {
    if (profile.value?._id !== userId.value) {
        loadingFetchProfile.value = true
        await loadProfile(userId.value)
    } else {
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
        if (scrollTop) {
            profileView.value.scrollTop = scrollTop
        }
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