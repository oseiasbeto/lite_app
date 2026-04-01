<template>
    <div @scroll="setScrollTopFromCache" ref="profileView" class="h-screen overflow-y-scroll">
        <div v-if="!hasError?.show">
            <div v-if="!loadingFetchProfile">
                <div>
                    <!--DETAILS USER-->
                    <div class="border-b p-2 border-gray-50">
                        <ProfileDetailsUser :profile="profile" :user-id="user?._id" />
                    </div>

                    <!--REACTIOS-->
                    <div class="border-b p-2 border-gray-50">
                        <ProfileReactions :profile="profile" :user-id="user?._id" @on-follow="handleFollow" />
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
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import ProfileDetailsUser from '../components/ProfileDetailsUser.vue';
import ProfileReactions from '../components/ProfileReactions.vue';
import Tabs from '@/components/UI/Tabs.vue';
import PostList from '@/views/posts/components/PostList.vue';

const store = useStore()
const route = useRoute()

const user = computed(() => store.getters?.currentUser || null)
const profile = computed(() => store.getters?.currentProfile || null)
const userId = computed(() => route.params.profile_id)

const loadingFetchProfile = ref(false)
const loadingLoadMorePosts = ref(false)
const loadingFetchProfilePosts = ref(false)

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

const fetchProfilePosts = async (userId) => {
    await store.dispatch("getProfilePosts", {
        ...queryPosts.value,
        userId
    })
}

const setScrollTopFromCache = (event) => {
    const scrollTop = event.target.scrollTop
    store.commit("UPDATE_PROFILE", {
        scrollTop
    })
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

const handleFollow = async () => {

}

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