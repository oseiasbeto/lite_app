<template>
    <div @scroll="setScrollTopFromCache" ref="profileView" class="h-screen overflow-y-scroll">
        <div v-if="!hasError?.show">
            <div v-if="!loadingFetchProfile">
                <div class="border-b-[6px] border-[rgb(24,24,24)]">
                    <!--DETAILS USER-->
                    <div class="px-[10px] py-4 pb-2">
                        <ProfileDetailsUser :profile="profile" :user-id="user?._id" />
                    </div>

                    <!--REACTIOS-->
                    <div class="px-[10px] pb-3">
                        <ProfileReactions :profile="profile" :user-id="user?._id" :is-same-user="isSameUser"
                            :has-followed="hasFollowed" :has-subscribed="hasSubscribed"
                            :status-follow-txt="statusFollowTxt" @on-follow="handleFollow(profile?._id)"
                            @on-subscribe="handleSubscribe(profile?._id)" @more-options="openMoreOptionsDrawer"
                            :is-disabled="isFollowing || isSubscribing" />
                    </div>
                </div>

                <!--TABS-->
                <Tabs :tabs="tabs" v-model="currentTab" />

                <!--TAB VIEWS-->
                <template v-if="currentTab === 'posts'">
                    <PostList :posts="profilePosts?.posts || []" :has-more="profilePosts?.pagination?.hasMore || false"
                        :loading-fetch="loadingFetchProfilePosts" :loading-load-more="loadingLoadMorePosts"
                        :module="module" @on-load-more="handleLoadMore" />
                </template>
                <template v-if="currentTab === 'questions'">
                    <p>Perguntas</p>
                </template>
                <template v-if="currentTab === 'answers'">
                    <p>Resposts</p>
                </template>
                <template v-if="currentTab === 'followers'">
                    <p>Seguidores</p>
                </template>
                <template v-if="currentTab === 'following'">
                    <p>Seguindo</p>
                </template>

                <!--DRAWER-->
                <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
                    <template v-if="drawer?.name == 'moreOptions'">
                        <DrawerItem v-if="canSendMessage" @on-press="openConv(profile)" title="Enviar mensagem" />
                    </template>
                </Drawer>
            </div>
            <div v-else>
                <p>Carregando...</p>
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
    
    const convIndex = convModules.findIndex(m => m.source === 'active') || 0

    if (convIndex === -1) {
        await store.dispatch('openDirectMessage', user._id)
            .then((conv) => {
                closeDrawer()
                router.push('/messages/' + conv?._id)
            }).finally(() => {
                loadingOpenConv.value = false
            })
    } else {
        const conv = items[index]
        store.commit("SET_CONVERSATION", {
            ...conv,
            source: 'active'
        })
        loadingOpenConv.value = false
        closeDrawer()
        router.push('/messages/' + conv?._id)
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

onMounted(async () => {
    if (profile.value?._id !== userId.value) {
        loadingFetchProfile.value = true
        await store.dispatch("getProfileByUserId", userId.value)
            .finally(async () => {
                loadingFetchProfile.value = false
                loadingFetchProfilePosts.value = true

                queryPosts.value.isPush = false

                await fetchProfilePosts(userId.value)
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