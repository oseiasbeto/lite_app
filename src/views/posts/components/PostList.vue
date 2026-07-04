<template>
    <div ref="scrollContainer" class="relative">
        <!-- Indicador flutuante estilo Facebook, não desloca o conteúdo -->
        <PullToRefreshIndicator v-if="enablePullToRefresh" :distance="pullDistance" :threshold="threshold"
            :is-refreshing="isRefreshing" />

        <div v-if="!loadingFetch">
            <div v-if="posts?.length">
                <!-- Container com a altura TOTAL simulada, só os itens visíveis (+buffer) são montados -->
                <div class="relative" :style="{ height: totalHeight + 'px' }">
                    <VirtualizedPostItem v-for="{ post, top } in visiblePosts" :key="post._id" :data="post" :top="top"
                        :module="module" :user="user || {}" :show-border-bottom="showBorderBottom"
                        :show-btn-follow="showBtnFollow" @measure="onMeasure"
                        @open-more-options-drawer="openMoreOptionsDrawer" />
                </div>

                <div ref="loadTrigger" v-if="hasMore || loadingLoadMore"
                    class="load-more-container py-3.5 flex justify-center">
                    <Spinner />
                </div>
            </div>

            <!--DRAWER-->
            <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
                <template v-if="drawer?.name === 'moreOptions'">
                    <DrawerItem @on-press="goToViewMore(drawer?.metadata?.post)" title="Ver mais" />
                    <DrawerItem @on-press="handleDeletePost(drawer?.metadata?.post?._id)"
                        v-if="drawer?.metadata?.post?.author?._id === user?._id" title="Eliminar postagem" />
                </template>
            </Drawer>
        </div>
        <div v-else>
            <div v-if="loadingFetch">
                <PostSkeleton v-for="n in 8" :key="n" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, toRef } from 'vue';
import { useStore } from 'vuex';
import PostCard from './PostCard.vue';
import VirtualizedPostItem from './VirtualizedPostItem.vue';
import { useIntersectionObserver, useScroll, useElementSize } from "@vueuse/core";
import PostSkeleton from './PostSkeleton.vue';
import Spinner from '@/components/UI/Spinner.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import PullToRefreshIndicator from '@/components/UI/PullToRefreshIndicator.vue';
import { usePullToRefresh } from '@/composables/usePullToRefresh';
import { useRouter } from 'vue-router';

const store = useStore()
const router = useRouter()

const user = computed(() => store.getters.currentUser)

const loadTrigger = ref(null);
const scrollContainer = ref(null); // fallback: usado quando ninguém passa scrollTarget

const emit = defineEmits(['on-load-more', 'on-refresh', 'post-deleted']);

const props = defineProps({
    posts: {
        type: Array,
        required: true
    },
    module: {
        type: String,
        default: "feed"
    },
    loadingFetch: {
        type: Boolean,
        default: false
    },
    showBorderBottom: {
        type: Boolean,
        default: true
    },
    loadingLoadMore: {
        type: Boolean,
        default: false
    },
    enablePullToRefresh: {
        type: Boolean,
        default: false
    },
    showBtnFollow: {
        type: Boolean,
        default: false
    },
    hasMore: {
        type: Boolean,
        default: false
    },
    // elemento externo que realmente tem o scroll (ex: o container da página).
    // se não for passado, a virtualização cai no fallback (scrollContainer local),
    // e nesse caso é responsabilidade de quem usa o PostList garantir que ele
    // receba altura real do pai (sem nenhum <div> sem altura no meio do caminho).
    scrollTarget: {
        type: Object,
        default: null
    }
})

// usa o elemento externo (scroll real da página) se foi passado,
// senão cai no próprio elemento do componente
const scrollEl = computed(() => props.scrollTarget || scrollContainer.value)

const drawer = ref({
    show: false,
    name: "",
    metadata: {}
})

const openDrawer = (data) => {
    const { show, name, metadata = {} } = data
    drawer.value = { show, name, metadata }
}

const closeDrawer = () => {
    drawer.value = { show: false, name: '', metadata: {} }
}

const openMoreOptionsDrawer = (post) => {
    openDrawer({
        show: true,
        name: "moreOptions",
        metadata: {
            post,
            title: 'Postagem'
        }
    })
}

useIntersectionObserver(
    loadTrigger,
    ([{ isIntersecting }]) => {
        if (isIntersecting) {
            emit('on-load-more');
        }
    }
);

// === Pull to refresh, só ativo se enablePullToRefresh for true ===
const { pullDistance, isRefreshing, threshold } = usePullToRefresh(
    scrollEl,
    () => emitRefreshAndWait(),
    {
        threshold: 70,
        maxPull: 90,
        enabled: toRef(props, 'enablePullToRefresh')
    }
)

// ============================================================
// VIRTUALIZAÇÃO (renderiza só os posts próximos do viewport)
// ============================================================

const DEFAULT_ITEM_HEIGHT = 420   // estimativa até o item ser medido de verdade
const BUFFER_PX = 900             // "colchão" acima/abaixo do viewport, evita flicker no scroll rápido

// Alturas reais medidas por post (id -> px)
const heights = reactive({})

// Posição de scroll e altura do container reativas (com throttle p/ não travar em dispositivos fracos)
// IMPORTANTE: escuta scrollEl (o elemento que REALMENTE tem overflow/scroll),
// não um div interno sem altura definida — senão scrollTop nunca muda.
const { y: scrollTop } = useScroll(scrollEl, { throttle: 50 })
const { height: containerHeight } = useElementSize(scrollEl)

// Offset (posição top) acumulado de cada post
const offsets = computed(() => {
    const arr = []
    let acc = 0
    for (const post of props.posts) {
        arr.push(acc)
        acc += heights[post._id] || DEFAULT_ITEM_HEIGHT
    }
    arr.push(acc)
    return arr
})

const totalHeight = computed(() => offsets.value[offsets.value.length - 1] || 0)

// Encontra por busca binária o range de índices visível (+ buffer)
const visibleRange = computed(() => {
    const list = props.posts
    const off = offsets.value
    const n = list.length

    if (!n) return { start: 0, end: 0 }

    const top = Math.max(0, scrollTop.value - BUFFER_PX)
    const bottom = scrollTop.value + (containerHeight.value || 0) + BUFFER_PX

    let lo = 0, hi = n - 1, start = 0
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (off[mid] < top) lo = mid + 1
        else hi = mid - 1
    }
    start = Math.max(0, lo - 1)

    lo = 0; hi = n - 1
    let end = n
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (off[mid] < bottom) lo = mid + 1
        else hi = mid - 1
    }
    end = Math.min(n, lo + 1)

    return { start, end }
})

const visiblePosts = computed(() => {
    const { start, end } = visibleRange.value
    const off = offsets.value
    return props.posts.slice(start, end).map((post, i) => ({
        post,
        top: off[start + i]
    }))
})

const onMeasure = ({ id, height }) => {
    if (!id) return
    if (heights[id] !== height) {
        heights[id] = height
    }
}

// ============================================================

const handleDeletePost = async (postId) => {
    if (!postId) return;

    try {
        // Fecha o drawer antes de deletar
        closeDrawer();

        // Dispara ação para deletar a postagem
        await store.dispatch('deletePost', postId);

        // Emite evento para o componente pai saber que uma postagem foi deletada
        emit('post-deleted', postId);

        // Mostra mensagem de sucesso (opcional)
        // Toast.success('Postagem eliminada com sucesso');
    } catch (error) {
        logger.error("Erro ao eliminar postagem:", error?.response?.data?.message || error);
        // Toast.error('Erro ao eliminar postagem');
    }
}

const goToViewMore = (post) => {
    closeDrawer()
    store.commit("SET_POST", post)
    router.push({
        path: '/post/' + post?._id,
        query: {
            module: props.module
        }
    })
}


const emitRefreshAndWait = () => {
    return new Promise((resolve) => {
        emit('on-refresh', resolve)
    })
}
</script>