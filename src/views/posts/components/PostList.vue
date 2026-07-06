<template>
    <div ref="scrollContainer" class="relative">
        <!-- Indicador flutuante estilo Facebook, não desloca o conteúdo -->
        <PullToRefreshIndicator v-if="enablePullToRefresh" :distance="pullDistance" :threshold="threshold"
            :is-refreshing="isRefreshing" />

        <div v-if="!loadingFetch">
            <div v-if="posts?.length">
                <!-- Container com a altura TOTAL simulada, só os itens visíveis (+buffer) são montados -->
                <div class="relative" :style="{ height: totalHeight + 'px' }">
                    <VirtualizedPostItem v-for="{ post, top, estimatedHeight } in visiblePosts" :key="post._id"
                        :data="post" :top="top" :estimated-height="estimatedHeight" :module="module"
                        :user="user || {}" :show-border-bottom="showBorderBottom" :show-btn-follow="showBtnFollow"
                        @measure="onMeasure" @open-more-options-drawer="openMoreOptionsDrawer" />
                </div>

                <div ref="loadTrigger" v-if="hasMore || loadingLoadMore"
                    class="load-more-container py-3.5 flex justify-center">
                    <SpinnerSmall />
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
import { ref, reactive, computed, toRef, watch, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import VirtualizedPostItem from './VirtualizedPostItem.vue';
import { useIntersectionObserver, useElementSize } from "@vueuse/core";
import PostSkeleton from './PostSkeleton.vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';
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
const BUFFER_PX = 900             // "colchão" base acima/abaixo do viewport

// Alturas reais medidas por post (id -> px)
const heights = reactive({})

// --- scrollTop sincronizado via rAF, direto do DOM ---
// Em vez de depender de um listener de evento de scroll (que passa pelo
// agendamento de reatividade do Vue e sempre carrega pelo menos 1 tick de
// atraso), lemos scrollEl.scrollTop a cada frame de animação. Isso elimina
// a maior fonte do atraso entre "o navegador já rolou pra lá" e "o Vue decidiu
// montar o item que devia estar lá" — que é a causa raiz do flash branco.
const scrollTop = ref(0)
let rafId = null

const syncScrollTop = () => {
    if (scrollEl.value) {
        scrollTop.value = scrollEl.value.scrollTop
    }
    rafId = requestAnimationFrame(syncScrollTop)
}

onMounted(() => {
    rafId = requestAnimationFrame(syncScrollTop)
})

onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
})

const { height: containerHeight } = useElementSize(scrollEl)

// --- buffer direcional e dinâmico ---
// Cresce com a velocidade do scroll e estica mais no sentido pra onde o
// usuário está indo (rolando pra baixo = mais buffer embaixo, e vice-versa).
// Isso faz os itens já estarem montados e prontos antes de entrarem na tela,
// mesmo em fling rápido — sem precisar limitar a velocidade real do scroll
// (o que quebraria o momentum nativo, principalmente no iOS).
let lastScrollSample = 0
let lastScrollTime = performance.now()
const bufferTop = ref(BUFFER_PX)
const bufferBottom = ref(BUFFER_PX)

watch(scrollTop, (y) => {
    const now = performance.now()
    const dt = Math.max(now - lastScrollTime, 1)
    const rawVelocity = (y - lastScrollSample) / dt // px/ms, com sinal (+ desce, - sobe)
    const speed = Math.abs(rawVelocity)

    const extra = speed > 1.5
        ? Math.min(speed * 500, BUFFER_PX * 3) // teto: até 4x o buffer base
        : 0

    if (rawVelocity > 0) {
        // rolando pra baixo: estica o buffer de baixo, mantém o de cima na base
        bufferBottom.value = BUFFER_PX + extra
        bufferTop.value = BUFFER_PX
    } else if (rawVelocity < 0) {
        // rolando pra cima: estica o buffer de cima
        bufferTop.value = BUFFER_PX + extra
        bufferBottom.value = BUFFER_PX
    } else {
        bufferTop.value = BUFFER_PX
        bufferBottom.value = BUFFER_PX
    }

    lastScrollSample = y
    lastScrollTime = now
})

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

// Encontra por busca binária o range de índices visível (+ buffer direcional)
const visibleRange = computed(() => {
    const list = props.posts
    const off = offsets.value
    const n = list.length

    if (!n) return { start: 0, end: 0 }

    const top = Math.max(0, scrollTop.value - bufferTop.value)
    const bottom = scrollTop.value + (containerHeight.value || 0) + bufferBottom.value

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
        top: off[start + i],
        estimatedHeight: heights[post._id] || DEFAULT_ITEM_HEIGHT
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