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
import { ref, reactive, computed, toRef, watch, nextTick, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import VirtualizedPostItem from './VirtualizedPostItem.vue';
import { useIntersectionObserver, useScroll, useElementSize } from "@vueuse/core";
import PostSkeleton from './PostSkeleton.vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import PullToRefreshIndicator from '@/components/UI/PullToRefreshIndicator.vue';
import { usePullToRefresh } from '@/composables/usePullToRefresh';
import { useRouter } from 'vue-router';
import { logger } from '@/utils/logger.js';

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

// ── Anti-flash em scroll rápido (mesmo princípio usado por feeds como
// Facebook/Instagram/Twitter): ──────────────────────────────────────────
// 1) Estica o buffer de renderização no sentido do scroll proporcionalmente
//    à velocidade, para os itens já estarem montados/medidos ANTES de
//    entrarem no ecrã (evita o "flash" de espaço vazio).
// 2) A janela de itens montados cresce imediatamente (nunca atrasa quando
//    é preciso mostrar mais), mas só encolhe (desmonta) depois do scroll
//    assentar por um curto período — evita montar/desmontar repetidamente
//    em scrolls rápidos de vai-e-vem, que é a outra causa comum de flicker.
// Isto não altera nenhuma prop/emit nem o comportamento visual final —
// só quando é que cada item é montado/desmontado.
const MAX_EXTRA_BUFFER_PX = 1600   // limite do "extra" de buffer em scroll muito rápido
const VELOCITY_BUFFER_SCALE = 250  // px extra de buffer por cada px/ms de velocidade
const SHRINK_SETTLE_MS = 200       // tempo de scroll "parado" antes de desmontar itens fora da janela

const scrollVelocity = ref(0) // px/ms; positivo = a descer, negativo = a subir
let lastVelocityScrollTop = null
let lastVelocityTime = performance.now()

watch(scrollTop, (newVal) => {
    const now = performance.now()
    if (lastVelocityScrollTop !== null) {
        const dt = now - lastVelocityTime
        if (dt > 0) scrollVelocity.value = (newVal - lastVelocityScrollTop) / dt
    }
    lastVelocityScrollTop = newVal
    lastVelocityTime = now
})

const dynamicExtraBuffer = computed(() =>
    Math.min(MAX_EXTRA_BUFFER_PX, Math.abs(scrollVelocity.value) * VELOCITY_BUFFER_SCALE)
)

// Encontra por busca binária o range de índices visível (+ buffer, já com o
// extra dinâmico aplicado no sentido do scroll)
const visibleRange = computed(() => {
    const list = props.posts
    const off = offsets.value
    const n = list.length

    if (!n) return { start: 0, end: 0 }

    const extra = dynamicExtraBuffer.value
    const topBuffer = scrollVelocity.value < 0 ? BUFFER_PX + extra : BUFFER_PX
    const bottomBuffer = scrollVelocity.value > 0 ? BUFFER_PX + extra : BUFFER_PX

    const top = Math.max(0, scrollTop.value - topBuffer)
    const bottom = scrollTop.value + (containerHeight.value || 0) + bottomBuffer

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

// Janela efetivamente renderizada: cresce de imediato, encolhe com atraso
const committedRange = ref({ start: 0, end: 0 })
let shrinkTimer = null

watch(visibleRange, (newRange) => {
    const current = committedRange.value
    const needsGrow = newRange.start < current.start || newRange.end > current.end

    if (needsGrow) {
        committedRange.value = {
            start: Math.min(current.start, newRange.start),
            end: Math.max(current.end, newRange.end)
        }
    }

    if (shrinkTimer) clearTimeout(shrinkTimer)
    shrinkTimer = setTimeout(() => {
        committedRange.value = newRange
        shrinkTimer = null
    }, SHRINK_SETTLE_MS)
}, { immediate: true })

// Sempre que a LISTA DE DADOS muda de tamanho (novo load, refresh, posts
// eliminados, etc.) sincroniza a janela de imediato, ignorando a histerese —
// esta só deve suavizar mudanças causadas por scroll, nunca esconder/mostrar
// os posts errados por os índices ficarem desalinhados após um prepend
// (ex.: pull-to-refresh a inserir posts novos no topo).
watch(() => props.posts.length, () => {
    committedRange.value = visibleRange.value
    if (shrinkTimer) { clearTimeout(shrinkTimer); shrinkTimer = null }
})

onUnmounted(() => {
    if (shrinkTimer) clearTimeout(shrinkTimer)
})

const visiblePosts = computed(() => {
    const { start, end } = committedRange.value
    const off = offsets.value
    return props.posts.slice(start, end).map((post, i) => ({
        post,
        top: off[start + i]
    }))
})

const onMeasure = ({ id, height }) => {
    if (!id) return

    const oldHeight = heights[id] ?? DEFAULT_ITEM_HEIGHT
    if (oldHeight === height) return // nada mudou, não faz nada

    const index = props.posts.findIndex(p => p._id === id)
    if (index === -1) {
        // post não está mais na lista atual (ex.: já foi removido) — só regista a altura
        heights[id] = height
        return
    }

    // Offset (posição top) do item ANTES de aplicarmos a nova altura.
    // offsets.value ainda reflete o heights antigo neste ponto.
    const itemTop = offsets.value[index]
    const delta = height - oldHeight

    heights[id] = height // aplica a altura real medida (dispara recompute de offsets/totalHeight)

    // === SCROLL ANCHORING MANUAL ===
    // Só compensa quando o item que mudou de altura está ACIMA do ponto de
    // scroll atual (já "passou" pelo usuário). É o único caso em que a
    // mudança de altura desloca visualmente o conteúdo que a pessoa está a
    // ver — por exemplo, uma imagem/vídeo que termina de carregar num post
    // que já ficou acima do viewport, empurrando tudo o que está visível
    // agora para cima ou para baixo.
    //
    // Se o item estiver dentro/abaixo do viewport, NÃO compensamos: nesse
    // caso é normal e esperado que o conteúdo abaixo dele se ajuste (é
    // exatamente como o scroll anchoring nativo do browser se comporta em
    // páginas normais).
    if (itemTop < scrollTop.value && scrollEl.value) {
        nextTick(() => {
            // ajusta o scroll na mesma medida da mudança, para o conteúdo
            // visível permanecer estável — sem "pulo" nem "salto" na tela
            scrollEl.value.scrollTop += delta
        })
    }
}

// ============================================================

const handleDeletePost = async (postId) => {
    if (!postId) return;

    console.log(postId)
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