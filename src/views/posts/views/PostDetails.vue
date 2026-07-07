<template>
    <div class="relative">
        <div @scroll="setScrollTopFromCache" ref="postView" class="h-[calc(100vh-60px)] relative overflow-y-scroll">
            <Navbar title="Postagem" />
            <div class="mt-[53px]" :class="{ 'pb-2': !cacheComments?.pagination?.hasMore }"
                :style="{ paddingBottom: `${composerHeight}px` }" v-if="!loadingFetchPost">
                <!-- Indicador flutuante estilo Facebook, não desloca o conteúdo -->
                <PullToRefreshIndicator v-if="enablePullToRefresh" :distance="pullDistance" :threshold="threshold"
                    :is-refreshing="isRefreshing" :top-position="46" />


                <PostDetailCard :module="module" :data="post" :user="user"
                    @open-new-comment-drawer="() => { triggerComposer() }"
                    @open-more-options-drawer="openMoreOptions" />

                <div>
                    <!--CREATE COMMENT TRIGGER-->
                    <CreateCommentTrigger ref="commentTriggerRef" :user="user" :type="post?.type"
                        :loading="loadingCreateComment" @on-submit="handleInlineComment"
                        @on-height-change="handleComposerHeightChange" />
                </div>

                <!--COMMENTS FILTERS-->
                <div v-if="cacheComments?.comments?.length" class="flex items-center justify-between py-3 px-4">
                    <p class="text-[15px] font-medium dark:text-x-dark-textSecondary text-x-light-textSecondary">
                        Comentários
                    </p>
                    <button @click="openSortByFilterDrawer" class="flex items-center gap-1">
                        <span class="font-medium text-sm dark:text-x-dark-textSecondary text-x-light-textSecondary"> {{
                            sortByText }}</span>
                        <span class="relative">
                            <svg class="dark:text-x-dark-textSecondary text-x-light-textSecondary" width="16"
                                height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="m5 8.5 7 7 7.005-7" class="icon_svg-stroke" stroke="currentColor"
                                    stroke-width="2" fill="none" stroke-linecap="round"></path>
                            </svg>
                        </span>

                    </button>
                </div>


                <!--COMMENTS-->
                <CommentList :comments="cacheComments?.comments || []" :pagination="cacheComments?.pagination || {}"
                    :loading-fetch="loadingFetchComments" :loading-load-more="loadingLoadMoreComments"
                    :active-comment="post?.sortCommentId" :postId="postId" @on-load-more="handleLoadMoreComments"
                    @on-reply="openNewCommentDrawer" @on-more="openMoreOptions" />
            </div>
            <div class="h-full w-full flex items-center justify-center" v-else>
                <SpinnerSmall />
            </div>

            <!--DRWER-->
            <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
                <template v-if="drawer?.name === 'newComment'">
                    <div class="flex w-full gap-2.5 flex-col p-4">
                        <div class="flex text-x-light-textSecondary dark:text-x-dark-textSecondary items-center gap-2"
                            v-if="drawer?.metadata?.parent">
                            <span>Em resposta a:
                                <span class="text-black dark:text-white">
                                    <span class="text-x-light-blue"
                                        v-if="drawer?.metadata?.replyTo?._id !== user?._id">{{ '@' +
                                            drawer?.metadata?.replyTo?.username }}</span>
                                    <span v-else>si mesmo</span>
                                </span>
                            </span>

                        </div>
                        <textarea ref="drawerTextareaRef"
                            :maxlength="300"
                            class="w-full caret-x-light-blue placeholder:dark:text-[rgb(177,179,182)] bg-transparent resize-none outline-none dark:text-white"
                            v-model="commentContent" placeholder="Escreva o teu comentário"
                            @input="autoGrowDrawerTextarea" @touchmove.stop @scroll.stop @mousedown.stop>
                        </textarea>
                        <div class="flex justify-end">
                            <button :disabled="!canComment || loadingCreateComment"
                                class="px-3 rounded-[30px] py-1.5 float-right w-min bg-x-light-blue text-white font-semibold disabled:opacity-70"
                                @click="handleComment">
                                {{ loadingCreateComment ? 'Postando...' : 'Responder' }}
                            </button>
                        </div>

                    </div>
                </template>

                <template v-if="drawer?.name === 'commentMoreOptions'">
                    <DrawerItem @on-press="openNewCommentDrawer({
                        parent: drawer?.metadata,
                        replyTo: drawer?.metadata?.author
                    })" title="Responder" :is-active="false" />
                    <DrawerItem v-if="isCommentAuthor" :is-danger="true" @on-press="" title="Eliminar"
                        :is-active="false" />
                </template>

                <template v-if="drawer?.name === 'sortByFilter'">
                    <DrawerItem @on-press="sortBySelect(option?.value)" v-for="option in sortByOptions"
                        :title="option?.label" :is-active="option.value === queryComments?.sortBy" :key="option?.id" />
                </template>
            </Drawer>
        </div>
    </div>

</template>

<script setup>
import { computed, onMounted, watch, nextTick, ref } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useStore } from 'vuex';
import PostDetailCard from '../components/PostDetailCard.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import CreateCommentTrigger from '@/views/comments/components/CreateCommentTrigger.vue';
import CommentList from '@/views/comments/components/CommentList.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import Navbar from '@/views/main/components/Navbar.vue';
import PullToRefreshIndicator from '@/components/UI/PullToRefreshIndicator.vue';
import { usePullToRefresh } from '@/composables/usePullToRefresh';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

const store = useStore()
const route = useRoute()

const postId = ref(route.params.id || null)
const postView = ref(null)
const module = route.query.module || 'feed'

const commentTriggerRef = ref(null)
// altura do composer inline (usada como padding-bottom pra nada ficar escondido atrás dele)
const composerHeight = ref(54)

const post = computed(() => store.getters.currentPost)
const user = computed(() => store.getters.currentUser)

const canComment = computed(() => {
    if (commentContent.value.trim().length && !loadingCreateComment.value) return true
    else return false
})

// altura do composer inline muda conforme a textarea cresce/diminui
const handleComposerHeightChange = (height) => {
    composerHeight.value = height
}


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
    sortCommentId: null,
    type: 'push',
    hasTotal: null
})

const enablePullToRefresh = ref(true)

const openDrawer = (data) => {
    const { show, name, metadata = {} } = data

    drawer.value = {
        show,
        name,
        metadata
    }
}

// ============ COMPUTED PARA VERIFICAR AUTOR DO COMENTÁRIO ============
const isCommentAuthor = computed(() => {
    // Verifica se o drawer está aberto com o nome 'commentMoreOptions'
    if (drawer.value?.name !== 'commentMoreOptions') return false

    // Pega o autor do comentário do metadata
    const commentAuthor = drawer.value?.metadata?.author

    // Se não tiver autor, retorna false
    if (!commentAuthor) return false

    // Compara o ID do autor do comentário com o ID do usuário atual
    // Supondo que o author pode ser um objeto ou string ID
    const authorId = commentAuthor?._id || commentAuthor
    const currentUserId = user.value?._id

    return authorId?.toString() === currentUserId?.toString()
})

// === Pull to refresh, só ativo se enablePullToRefresh for true ===
const { pullDistance, isRefreshing, threshold } = usePullToRefresh(
    postView,
    () => emitRefreshAndWait(),
    {
        threshold: 70,
        maxPull: 90,
        enabled: enablePullToRefresh.value
    }
)

const emitRefreshAndWait = () => {
    return new Promise(async (resolve) => {
        await loadPost(postId.value)
        resolve()
    })
}

const closeDrawer = () => {
    drawer.value = {
        show: false,
        name: '',
        metadata: {}
    }

    resetCommentForm()
    resetDrawerTextarea()

    if (post.value?.showCommentFormDrawer) {
        store.commit("SET_POST", {
            ...post.value,
            showCommentFormDrawer: undefined
        })
    }
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

const drawerTextareaRef = ref(null)

// Função para ajustar altura automaticamente com limite máximo
function autoGrowDrawerTextarea() {
    const el = drawerTextareaRef.value
    if (!el) return

    el.style.height = 'auto'
    const maxHeight = 160 // em px, ajuste conforme necessário
    const newHeight = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${newHeight}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
}


// Também precisamos resetar a altura quando fechar o drawer, opcional
function resetDrawerTextarea() {
    const el = drawerTextareaRef.value
    if (el) {
        el.style.height = 'auto'
        el.style.overflowY = 'hidden'
    }
    commentContent.value = ''
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

const openMoreOptions = (metadata) => {
    openDrawer({
        show: true,
        name: "commentMoreOptions",
        metadata: {
            ...metadata,
            title: 'Comentário'
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

        if (post.value?.sortCommentId) {
            store.commit("SET_POST", {
                ...post.value,
                sortCommentId: null
            })
        }

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

function triggerComposer() {
    if (commentTriggerRef.value) {
        commentTriggerRef.value.expand(); // abre o composer e foca no textarea
    }
}

// comentário principal, feito direto pelo composer inline (sem drawer)
const handleInlineComment = async (content) => {
    if (!content?.trim() || loadingCreateComment.value) return

    loadingCreateComment.value = true
    store.commit("SET_IS_LOADING_COMPONENT", true)

    const data = {
        content,
        media: [],
        postId: postId.value || route.params.id
    }

    await store.dispatch("createComment", data)
        .then(() => {

            commentTriggerRef.value?.reset()
            //[TODO] coloque um toast dando a entender que ja se criou

            setTimeout(() => {
                store.dispatch("showToast", {
                    position: "top",
                    message: "Comentário postado com sucesso!",
                    type: "success"
                })
            }, 200)
        })
        .catch(() => {

            //[TODO] coloque um toast que exiba o motivo do erro
        })
        .finally(() => {
            store.commit("SET_IS_LOADING_COMPONENT", false)
            loadingCreateComment.value = false
        })
}

const handleComment = async () => {
    if (!canComment.value) return

    store.commit("SET_IS_LOADING_COMPONENT", true)

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
            setTimeout(() => {
                store.dispatch("showToast", {
                    position: "top",
                    message: "Resposta postada com sucesso!",
                    type: "success"
                })
            }, 200)
        })
        .catch(() => {
            //[TODO] coloque um toast que exiba o motivo do erro
        })
        .finally(() => {
            closeDrawer()
            store.commit("SET_IS_LOADING_COMPONENT", false)
            loadingCreateComment.value = false

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


const loadPost = async (postId) => {
    await store.dispatch("getPostById", { postId })
        .then(async () => {
            loadingFetchComments.value = true
            await fetchComments(postId)
                .finally(() => {
                    loadingFetchComments.value = false
                })
        })
        .finally(() => {
            loadingFetchPost.value = false
        })
}


onMounted(async () => {

    if (!post.value?._id) {
        loadingFetchPost.value = true
        await loadPost(postId.value)
        enablePullToRefresh.value = true
    } else {
        if (post.value?.showCommentFormDrawer) {
            setTimeout(() => {
                triggerComposer()
            }, 1000)
        }

        const sortCommentId = post.value?.sortCommentId

        if (sortCommentId) {
            queryComments.value.sortCommentId = sortCommentId
            queryComments.value.page = 1

            loadingFetchComments.value = true
            store.commit("RESET_COMMENTS_FROM_CACHE", postId.value)

            await fetchComments(post?.value?._id)
                .finally(() => {
                    loadingFetchComments.value = false
                    queryComments.value.sortCommentId = null
                })
        } else {
            if (!cacheComments.value?.comments?.length) {
                await fetchComments(post?.value?._id)
            }
        }

    }
})

watch(() => route.params.id, async (newId, oldId) => {
    if (!newId || newId === oldId) return

    commentTriggerRef.value?.reset()

    postId.value = newId

    if (post.value?._id !== postId.value) {
        loadingFetchPost.value = true

        await store.dispatch("getPostById", { postId: postId.value })
            .finally(() => {
                loadingFetchPost.value = false
            })
    }

    const sortCommentId = post.value?.sortCommentId

    if (sortCommentId) {
        queryComments.value.sortCommentId = sortCommentId
        queryComments.value.page = 1

        loadingFetchComments.value = true
        store.commit("RESET_COMMENTS_FROM_CACHE", postId.value)

        await fetchComments(post?.value?._id)
            .finally(() => {
                loadingFetchComments.value = false
                queryComments.value.sortCommentId = null
            })
    } else {
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
                    triggerComposer()
                }, 1000)
            }
        } else {
            resetQueryComments()
            queryComments.value.type = 'set'
            loadingFetchComments.value = true
            await fetchComments(postId.value)
                .finally(() => {
                    loadingFetchComments.value = false
                    if (post.value?.showCommentFormDrawer) {
                        setTimeout(() => {
                            triggerComposer()
                        }, 1000)
                    }
                })
        }
    }
})

// Watch para quando o drawer de novo comentário for aberto
watch(() => drawer.value?.name, (newName) => {
    if (newName === 'newComment') {
        nextTick(() => {
            const el = drawerTextareaRef.value
            if (el) {
                el.focus()
                // Garantir que a altura seja ajustada após o foco
                autoGrowDrawerTextarea()
            }
        })
    }
}, { immediate: true })
</script>