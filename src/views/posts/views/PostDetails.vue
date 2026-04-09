<template>
    <div @scroll="setScrollTopFromCache" ref="postView" class="h-screen overflow-y-scroll">

        <div v-if="!loadingFetchPost">
            <!--NODY-->
            <div>
                <PostCard :module="module" :data="post" :show-more="true" :user="user"
                    @open-new-comment-drawer="openNewCommentDrawer" />
                <div>
                    <!--CREATE COMMENT TRIGGER-->
                    <CreateCommentTrigger @on-press="openNewCommentDrawer" :user="user" :type="post?.type" />
                </div>

                <!--COMMENTS FILTERS-->
                <div v-if="cacheComments?.comments?.length"
                    class="flex items-center dark:text-white text-black justify-between border-b dark:border-[rgb(57,56,57)] py-3 px-3">
                    <p class="text-sm font-semibold">Comentários</p>
                    <button @click="openSortByFilterDrawer" class="flex items-center gap-1">
                        <span class="font-semibold text-[13px]"> {{ sortByText }}</span>
                        <span>
                            <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="m5 8.5 7 7 7.005-7" class="icon_svg-stroke" stroke="currentColor"
                                    stroke-width="2" fill="none" stroke-linecap="round"></path>
                            </svg>
                        </span>

                    </button>
                </div>

                <!--COMMENTS-->
                <CommentList :comments="cacheComments?.comments || []" :pagination="cacheComments?.pagination || {}"
                    :loading-fetch="loadingFetchComments" :loading-load-more="loadingLoadMoreComments" :postId="postId"
                    @on-load-more="handleLoadMoreComments" @on-reply="openNewCommentDrawer" />
            </div>
        </div>
        <div v-else>
            <p>Carregando...</p>
        </div>

        <!--DRWER-->
        <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
            <template v-if="drawer?.name === 'newComment'">
                <div class="flex w-full gap-2.5 flex-col p-4">
                    <div class="flex items-center gap-2" v-if="drawer?.metadata?.parent">
                        <span>Respondendo:</span>
                        <div class="flex items-center flex-row gap-1.5">
                            <Avatar
                                :url="drawer?.metadata?.replyTo?.profile_image?.thumbnails?.xs || drawer?.metadata?.replyTo?.profile_image?.url"
                                :alt="drawer?.metadata?.replyTo?.name" size="xs" />
                            <span class="text-[13px] dark:text-white text-black font-semibold">
                                {{ drawer?.metadata?.replyTo?.name ||
                                    drawer?.metadata?.replyTo }}
                            </span>
                        </div>
                    </div>
                    <textarea
                        class="w-full placeholder:dark:text-[rgb(177,179,182)] bg-transparent resize-none outline-none dark:text-white"
                        v-model="commentContent" placeholder="Escreva o teu comentario"></textarea>
                    <div class="flex justify-end">
                        <button :disabled="!canComment"
                            class="px-1.5 py-1 float-right w-min text-[#4894fd] font-semibold disabled:opacity-70 rounded-md"
                            @click="handleComment">Postar</button>
                    </div>

                </div>

            </template>

            <template v-if="drawer?.name === 'sortByFilter'">
                <DrawerItem @on-press="sortBySelect(option?.value)" v-for="option in sortByOptions"
                    :title="option?.label" :is-active="option.value === queryComments?.sortBy" :key="option?.id" />
            </template>
        </Drawer>
    </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useStore } from 'vuex';
import PostCard from '../components/PostCard.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import CreateCommentTrigger from '@/views/comments/components/CreateCommentTrigger.vue';
import CommentList from '@/views/comments/components/CommentList.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import Avatar from '@/components/Utils/Avatar.vue';

const store = useStore()
const route = useRoute()

const postId = ref(route.params.id || null)
const postView = ref(null)
const module = route.query.module || 'feed'

const post = computed(() => store.getters.currentPost)
const user = computed(() => store.getters.currentUser)

const canComment = computed(() => {
    if (commentContent.value.trim().length && !loadingCreateComment.value) return true
    else return false
})

const sortByText = computed(() => {
    switch (queryComments?.value?.sortBy) {
        case 'recents':
            return 'Recomendado';
        case 'relevants':
            return 'Relevantes'
    }
})

const sortByOptions = ref([
    {
        label: 'Recomendado',
        value: 'recents'
    },
    {
        label: 'Relevantes',
        value: 'relevants'
    }
])

const cacheComments = computed(() => {
    const modules = store.getters.comments
    if (modules.length) {
        return modules.find(m => m?.postId === postId.value)
    } else return {
        comments: [],
        pagination: {}
    }
})

const commentContent = ref('')

const loadingFetchPost = ref(false)
const loadingFetchComments = ref(false)
const loadingCreateComment = ref(false)
const loadingLoadMoreComments = ref(false)
const hasError = ref({
    show: true,
    message: ''
})
const drawer = ref({
    show: false,
    name: "",
    metadata: {}
})

const queryComments = ref({
    page: 1,
    limit: 5,
    sortBy: 'recents',
    type: 'push',
    hasTotal: null
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

    resetCommentForm()
}

const resetCommentForm = () => {
    commentContent.value = ""
}

const resetQueryComments = () => {
    queryComments.value = {
        page: 1,
        limit: 5,
        sortBy: 'recents',
        type: 'push',
        hasTotal: null
    }
}

const resetHasError = () => {
    hasError.value = {
        show: false,
        name: "",
        metadata: {}
    }
}

const openNewCommentDrawer = (metadata) => {
    openDrawer({
        show: true,
        name: "newComment",
        metadata: {
            ...metadata,
            title: metadata?.parent ? 'Responder' : "Comentar"
        }
    })
}
const openSortByFilterDrawer = () => {
    openDrawer({
        show: true,
        name: "sortByFilter",
        metadata: {
            title: "Ordenar comentários"
        }
    })
}

const sortBySelect = async (sortBy) => {
    closeDrawer()

    if (queryComments.value?.sortBy === sortBy) return
    else {
        queryComments.value.sortBy = sortBy
        queryComments.value.type = 'set'
        queryComments.value.page = 1

        loadingFetchComments.value = true
        store.commit("RESET_COMMENTS_FROM_CACHE", postId.value)
        store.commit("UPDATE_PAGINATION_COMMENTS_FROM_CACHE", {
            postId: postId.value,
            sortBy: sortBy
        })
        await fetchComments(postId.value).finally(() => loadingFetchComments.value = false)
    }
}

const setScrollTopFromCache = (event) => {
    const scrollTop = event.target.scrollTop
    store.commit("UPDATE_PAGINATION_COMMENTS_FROM_CACHE", {
        postId: postId.value,
        scrollTop
    })
}

const handleLoadMoreComments = async () => {
    const pagination = cacheComments.value?.pagination
    const { hasMore, totalComments } = pagination

    if (hasMore) {
        loadingLoadMoreComments.value = true
        queryComments.value.page += 1
        queryComments.value.type = 'push'
        queryComments.value.hasTotal = totalComments

        await fetchComments(postId.value)
            .finally(() => {
                loadingLoadMoreComments.value = false
            })
    }
}

const handleComment = async () => {
    if (!canComment.value) return

    loadingCreateComment.value = true

    const data = {
        content: commentContent.value,
        media: [],
        postId: postId.value || route.params.id,
        ...(drawer.value?.metadata?.parent, {
            parentId: drawer?.value?.metadata?.parent?._id || drawer?.value?.metadata?.parent,
            replyTo: drawer?.value?.metadata?.replyTo?._id || drawer?.value?.metadata?.replyTo
        })
    }

    await store.dispatch("createComment", data)
        .then(() => {
            //[TODO] coloque um toast dando a entender que ja se criou
        })
        .catch(() => {
            //[TODO] coloque um toast que exiba o motivo do erro
        })
        .finally(() => {
            loadingCreateComment.value = false
            closeDrawer()
        })
}

const fetchComments = async (postId) => {
    await store.dispatch("getCommentsByPostId", {
        query: queryComments.value,
        postId
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
    if (!post.value?._id) {
        loadingFetchPost.value = true

        await store.dispatch("getPostById", { postId: postId.value })
            .then(async () => {
                await fetchComments(postId.value)
            })
            .finally(() => {
                loadingFetchPost.value = false
            })
    } else {
        if (post.value?.showCommentFormDrawer) {
            setTimeout(() => {
                openNewCommentDrawer()
            }, 1000)
        }

        if (!cacheComments.value?.comments?.length) {
            await fetchComments(post?.value?._id)
        }
    }
})

watch(() => route.params.id, async (newId, oldId) => {
    if (!newId || newId === oldId) return

    loadingFetchComments.value = true

    postId.value = newId

    if (post.value?._id !== postId.value) {
        loadingFetchPost.value = true

        await store.dispatch("getPostById", { postId: postId.value })
            .finally(() => {
                loadingFetchPost.value = false
            })
    }

    if (cacheComments.value?.comments.length) {
        const { pagination } = cacheComments.value

        const { hasMore, page, sortBy, scrollTop, limit, totalComments } = pagination

        queryComments.value.page = page
        queryComments.value.hasMore = hasMore
        queryComments.value.limit = limit
        queryComments.value.hasTotal = totalComments
        queryComments.value.sortBy = sortBy ? sortBy : 'recents'
        loadingFetchComments.value = false

        postView.value.scrollTop = scrollTop || 0

        if (post.value?.showCommentFormDrawer) {
            setTimeout(() => {
                openNewCommentDrawer()
            }, 1000)
        }
    } else {
        resetQueryComments()
        queryComments.value.type = 'set'
        await fetchComments(postId.value)
            .finally(() => {
                loadingFetchComments.value = false
                if (post.value?.showCommentFormDrawer) {
                    setTimeout(() => {
                        openNewCommentDrawer()
                    }, 1000)
                }
            })
    }

})
</script>