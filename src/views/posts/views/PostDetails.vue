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
                    @open-new-comment-drawer="() => { triggerComposer() }" @open-more-options-drawer="" />

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

            <!--modal-->
            <Confirmdialog v-model="modalConfirm.isOpen" :title="modalConfirm.title" :message="modalConfirm.message"
                variant="danger" @confirm="handleDeleteComment" @cancel="closeModalConfirm" />

            <!--DRWER-->
            <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
                <template v-if="drawer?.name === 'newComment' || drawer?.name == 'editComment'">
                    <div class="flex w-full gap-2.5 flex-col p-4">
                        <div class="flex text-x-light-textSecondary dark:text-x-dark-textSecondary items-center gap-2"
                            v-if="drawer?.metadata?.parent">
                            <span class="text-sm">Em resposta a:
                                <span class="text-black dark:text-white">
                                    <span class="text-x-light-blue inline-block truncate max-w-[200px] align-bottom"
                                        v-if="drawer?.metadata?.replyTo?._id !== user?._id">
                                        {{ '@' + drawer?.metadata?.replyTo?.username }}
                                    </span>
                                    <span v-else>si mesmo</span>
                                </span>
                            </span>

                        </div>
                        <textarea ref="drawerTextareaRef" :maxlength="300"
                            class="w-full caret-x-light-blue placeholder:dark:text-[rgb(177,179,182)] bg-transparent resize-none outline-none dark:text-white"
                            v-model="commentContent" placeholder="Escreva o teu comentário"
                            @input="autoGrowDrawerTextarea" @touchmove.stop @scroll.stop @mousedown.stop>
                        </textarea>
                        <div class="flex justify-end">
                            <button :disabled="!canComment || loadingCreateComment"
                                class="px-3 rounded-[30px] py-1.5 float-right w-min bg-x-light-blue text-white font-semibold disabled:opacity-50"
                                @click="handleXTComment">
                                <p class="whitespace-nowrap">{{ drawer?.name == 'editComment' ? 'Editar' : 'Responder'
                                    }}</p>

                            </button>
                        </div>

                    </div>
                </template>

                <template v-if="drawer?.name === 'commentMoreOptions'">

                    <DrawerItem @on-press="() => {
                        copyTextClipboard(drawer?.metadata?.content)
                        closeDrawer()
                    }" title="Copiar texto" :is-active="false">
                        <template #icon>
                            <svg fill="none" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" stroke="none" stroke-width="0" stroke-linecap="butt"
                                    stroke-linejoin="miter" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M8.17 4A3.001 3.001 0 0 1 11 2h2c1.306 0 2.418.835 2.83 2H17a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1.17ZM8 6H7a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6Zm6 0V5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1h4Z">
                                </path>
                            </svg>
                        </template>
                    </DrawerItem>

                    <DrawerItem v-if="!isCommentAuthor" @on-press="handleFollowUser"
                        :title="followButtonText + (drawer?.metadata?.author?.username ? ` @${drawer?.metadata?.author?.username}` : '')"
                        :costumClass="loadingFollowUser ? 'opacity-50 pointer-events-none' : ''">

                        <template #icon>
                            <svg v-if="!isFollowingAuthor" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                                <path d="M19 8v6M22 11h-6" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                                <path d="M17 11l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </template>
                    </DrawerItem>

                    <DrawerItem @on-press="() => {
                        openGoogleTranslate(drawer?.metadata?.content)
                        closeDrawer()
                    }" title="Traduzir" :is-active="false">
                        <template #icon>
                            <svg fill="none" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" stroke="none" stroke-width="0" stroke-linecap="butt"
                                    stroke-linejoin="miter" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M5.002 17.036V5h14v12.036h-3.986a1 1 0 0 0-.639.23l-2.375 1.968-2.344-1.965a1 1 0 0 0-.643-.233H5.002ZM20.002 3h-16a1 1 0 0 0-1 1v14.036a1 1 0 0 0 1 1h4.65l2.704 2.266a1 1 0 0 0 1.28.004l2.74-2.27h4.626a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-7.878 3.663c-1.39 0-2.5 1.135-2.5 2.515a1 1 0 0 0 2 0c0-.294.232-.515.5-.515a.507.507 0 0 1 .489.6.174.174 0 0 1-.027.048 1.1 1.1 0 0 1-.267.226c-.508.345-1.128.923-1.286 1.978a1 1 0 1 0 1.978.297.762.762 0 0 1 .14-.359c.063-.086.155-.169.293-.262.436-.297 1.18-.885 1.18-2.013 0-1.38-1.11-2.515-2.5-2.515ZM12 15.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z">
                                </path>
                            </svg>
                        </template>
                    </DrawerItem>

                    <DrawerItem @on-press="openNewCommentDrawer({
                        parent: drawer?.metadata?.parent || drawer?.metadata,
                        replyTo: drawer?.metadata?.author
                    })" title="Responder" :is-active="false">
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" width="800px" height="800px"
                                viewBox="-0.5 0 28 28" version="1.1">

                                <title>reply</title>
                                <desc>Created with Sketch Beta.</desc>
                                <defs>

                                </defs>
                                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"
                                    sketch:type="MSPage">
                                    <g id="Icon-Set" sketch:type="MSLayerGroup"
                                        transform="translate(-100.000000, -1193.000000)" fill="currentColor">
                                        <path
                                            d="M113,1208 C112.346,1208 109.98,1208.02 109.98,1208.02 L109.98,1213.39 L102.323,1205 L109.98,1196.6 L109.98,1202.01 C109.98,1202.01 112.48,1201.98 113,1202 C120.062,1202.22 124.966,1210.26 124.998,1214.02 C122.84,1211.25 117.17,1208 113,1208 L113,1208 Z M111.983,1200.01 L111.983,1194.11 C112.017,1193.81 111.936,1193.51 111.708,1193.28 C111.312,1192.89 110.67,1192.89 110.274,1193.28 L100.285,1204.24 C100.074,1204.45 99.984,1204.72 99.998,1205 C99.984,1205.27 100.074,1205.55 100.285,1205.76 L110.219,1216.65 C110.403,1216.88 110.67,1217.03 110.981,1217.03 C111.265,1217.03 111.518,1216.91 111.7,1216.72 C111.702,1216.72 111.706,1216.72 111.708,1216.71 C111.936,1216.49 112.017,1216.18 111.983,1215.89 C111.983,1215.89 112,1210.34 112,1210 C118.6,1210 124.569,1214.75 125.754,1221.01 C126.552,1219.17 127,1217.15 127,1215.02 C127,1206.73 120.276,1200.01 111.983,1200.01 L111.983,1200.01 Z"
                                            id="reply" sketch:type="MSShapeGroup">

                                        </path>
                                    </g>
                                </g>
                            </svg>
                        </template>
                    </DrawerItem>

                    <DrawerItem v-if="isCommentAuthor" :is-danger="true"
                        @on-press="openEditCommentDrawer(drawer?.metadata)" title="Editar" :is-active="false">
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24"
                                fill="none">
                                <path
                                    d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H9M15 5H17C18.1046 5 19 5.89543 19 7V9"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path
                                    d="M14.902 20.3343L12.7153 20.7716L13.1526 18.585C13.1914 18.3914 13.2865 18.2136 13.4261 18.074L17.5 14L19.5 12L21.4869 13.9869L19.4869 15.9869L15.413 20.0608C15.2734 20.2004 15.0956 20.2956 14.902 20.3343Z"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </template>
                    </DrawerItem>

                    <DrawerItem v-if="isCommentAuthor" :is-danger="true" @on-press="
                        setModalConfirm({
                            isOpen: true,
                            title: 'Excluir comentário',
                            message: 'Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.',
                            confirmText: 'Eliminar',
                            data: { metadata: drawer?.metadata },
                            actionType: 'deleteComment'
                        })" title="Excluir comentário" :is-active="false">
                        <template #icon>
                            <svg fill="none" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" stroke="none" stroke-width="0" stroke-linecap="butt"
                                    stroke-linejoin="miter" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M7.416 5H3a1 1 0 0 0 0 2h1.064l.938 14.067A1 1 0 0 0 6 22h12a1 1 0 0 0 .998-.933L19.936 7H21a1 1 0 1 0 0-2h-4.416a5 5 0 0 0-9.168 0Zm2.348 0h4.472c-.55-.614-1.348-1-2.236-1-.888 0-1.687.386-2.236 1Zm6.087 2H6.07l.867 13h10.128l.867-13h-2.036a1 1 0 0 1-.044 0ZM10 10a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Z">
                                </path>
                            </svg>
                        </template>
                    </DrawerItem>
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
import Confirmdialog from '@/components/UI/Confirmdialog.vue';

const store = useStore()
const route = useRoute()

const postId = ref(route.params.id || null)
const postView = ref(null)
const module = route.query.module || 'feed'

const commentTriggerRef = ref(null)
// altura do composer inline (usada como padding-bottom pra nada ficar escondido atrás dele)
const composerHeight = ref(54)
const loadingDeleteComment = ref(false)

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


const openGoogleTranslate = (text) => {
    if (!text) return
    const url = `https://translate.google.com/?sl=auto&tl=pt&text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    closeDrawer()
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

const modalConfirm = ref({
    isOpen: false, title: '', message: '', data: {}, confirmText: '', actionType: ''
})

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

const closeModalConfirm = () => {
    modalConfirm.value = { isOpen: false, title: '', message: '', data: {}, confirmText: '', actionType: '' }
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

// ============ SISTEMA DE SEGUIR AUTOR DO COMENTÁRIO ============
const loadingFollowUser = ref(false)
// guarda o resultado da última ação de seguir/deixar de seguir, pra alimentar o watch do toast
const followActionState = ref(null) // { success: boolean, isFollowing: boolean, username: string }

const isFollowingAuthor = computed(() => {
    if (drawer.value?.name !== 'commentMoreOptions') return false

    const author = drawer.value?.metadata?.author
    const authorId = author?._id || author
    if (!authorId) return false

    //  Suposição: user.following é um array de IDs (string) ou de objetos { _id }.
    // Se no seu store o "seguindo" vier de outro getter/estrutura, ajuste esta linha.
    const following = user.value?.following || []
    return following.some(item => {
        const followingId = item?._id || item
        return followingId?.toString() === authorId?.toString()
    })
})

const followButtonText = computed(() => {
    if (loadingFollowUser.value) {
        return isFollowingAuthor.value ? 'Deixando de seguir...' : 'Seguindo...'
    }
    return isFollowingAuthor.value ? 'Deixar de seguir' : 'Seguir'
})

const handleFollowUser = async () => {
    // captura os dados ANTES de fechar o drawer, senão o metadata é resetado
    // e perdemos authorId/username/estado atual de "seguindo"
    const metadata = drawer.value?.metadata
    const author = metadata?.author
    const authorId = author?._id || author
    const username = author?.username
    const wasFollowing = isFollowingAuthor.value

    if (!authorId || loadingFollowUser.value) return

    loadingFollowUser.value = true
    closeDrawer()

    await store.dispatch('followUser', { userId: authorId, currentUserId: user.value?._id })
        .then(() => {
            followActionState.value = {
                success: true,
                isFollowing: !wasFollowing,
                username
            }
        })
        .catch(() => {
            followActionState.value = {
                success: false,
                isFollowing: wasFollowing,
                username
            }
        })
        .finally(() => {
            loadingFollowUser.value = false
        })
}

// ============ WATCH: exibe o toast após concluir a ação de seguir ============
watch(followActionState, (result) => {
    if (!result) return

    if (result.success) {
        store.dispatch("showToast", {
            position: "top",
            message: result.isFollowing
                ? `Agora você está seguindo${result.username ? ` @${result.username}` : ''}!`
                : `Você deixou de seguir${result.username ? ` @${result.username}` : ''}.`,
            type: "success"
        })
    } else {
        store.dispatch("showToast", {
            position: "top",
            message: "Não foi possível concluir a ação. Tente novamente.",
            type: "error"
        })
    }
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
    const maxHeight = 100 // em px, ajuste conforme necessário
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

const openEditCommentDrawer = (metadata) => {
    console.log(metadata)
    commentContent.value = metadata?.content || ''
    openDrawer({
        show: true,
        name: 'editComment',
        metadata: {
            ...metadata,
            replyTo: metadata?.reply_to,
            title: 'Editar comentário'
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

const handleXTComment = async () => {
    if (drawer?.value?.name !== 'editComment') await handleComment()
    else await handleEditComment()
}

const handleComment = async () => {
    if (!canComment.value) return

    store.commit("SET_IS_LOADING_COMPONENT", true)

    loadingCreateComment.value = true

    const data = {
        content: commentContent.value,
        media: [],
        postId: postId.value || route.params.id,
        ...(drawer.value?.metadata?.parent && {
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

function copyTextClipboard(texto) {
    // Verifica se a API moderna está disponível e o contexto é seguro (HTTPS ou localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(texto)
            .then(() => {
                console.log('Texto copiado com sucesso (API moderna).');
                store.dispatch("showToast", {
                    message: 'Texto copiado com sucesso!',
                    type: 'success',
                    position: 'top'
                })
            })
            .catch(err => {
                console.error('Falha ao copiar (API moderna):', err);
                // Se falhar, tenta o fallback
                return fallbackCopiarTexto(texto);
            });
    }
}

const setModalConfirm = (data) => {
    modalConfirm.value = data
    if (drawer.value.show) closeDrawer()
}

// ============ EXCLUIR ============
const handleDeleteComment = async () => {

    const metadata = modalConfirm.value?.data?.metadata
    if (!metadata?._id || loadingDeleteComment.value) return

    loadingDeleteComment.value = true

    const commentId = metadata._id
    const parentId = metadata?.parent?._id || metadata?.parent || null
    const targetPostId = metadata?.post || postId.value

    await store.dispatch('deleteCommentSTX', { postId: targetPostId, commentId, parentId })
        .then(() => {
            store.dispatch("showToast", {
                position: "top",
                message: "Comentário excluído com sucesso!",
                type: "success"
            })
        })
        .catch(() => {
            store.dispatch("showToast", {
                position: "top",
                message: "Não foi possível excluir o comentário. Tente novamente.",
                type: "error"
            })
        })
        .finally(() => {
            closeDrawer()
            loadingDeleteComment.value = false
        })
    console.log("eliminando commentario")
}

const handleEditComment = async () => {
    if (!canComment.value) return

    const metadata = drawer.value?.metadata
    const commentId = metadata?._id
    if (!commentId) return

    loadingCreateComment.value = true

    const parentId = metadata?.parent?._id || metadata?.parent || null
    const targetPostId = metadata?.post || postId.value
    const content = commentContent.value.trim()

    store.commit("SET_IS_LOADING_COMPONENT", true)

    await store.dispatch('editComment', { postId: targetPostId, commentId, parentId, content })
        .then(() => {
            store.dispatch("showToast", {
                position: "top",
                message: "Comentário editado com sucesso!",
                type: "success"
            })
        })
        .catch(() => {
            store.dispatch("showToast", {
                position: "top",
                message: "Não foi possível editar o comentário. Tente novamente.",
                type: "error"
            })
        })
        .finally(() => {
            closeDrawer()
            loadingCreateComment.value = false
            store.commit("SET_IS_LOADING_COMPONENT", false)
        })
}

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

watch(() => drawer.value?.name, (newName) => {
    if (newName === 'newComment' || newName === 'editComment') {
        nextTick(() => {
            const el = drawerTextareaRef.value
            if (el) { el.focus(); autoGrowDrawerTextarea() }
        })
    }
}, { immediate: true })
</script>