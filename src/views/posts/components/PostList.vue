<template>
    <div
        ref="containerRef"
        :class="isEmbedded ? 'relative' : 'relative overflow-y-auto h-[calc(100vh-56px)]'"
        @scroll="isEmbedded ? null : handleScroll"
    >
        <PullToRefreshIndicator
            v-if="enablePullToRefresh && !isEmbedded"
            :distance="pullDistance"
            :threshold="threshold"
            :is-refreshing="isRefreshing"
        />

        <!-- Só usado no modo standalone (ex: Home.vue) -->
        <div ref="headerRef">
            <slot name="header" />
        </div>

        <div v-if="!loadingFetch">
            <div v-if="posts?.length">
                <div :style="{ visibility: isRestoringScroll ? 'hidden' : 'visible' }">
                    <div class="relative w-full" :style="{ height: `${totalSize}px` }">
                        <div
                            v-for="virtualRow in virtualItems"
                            :key="posts[virtualRow.index]?._id"
                            :ref="(el) => measureElement(el, virtualRow.index)"
                            :data-index="virtualRow.index"
                            class="absolute top-0 left-0 w-full"
                            :style="{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }"
                        >
                            <PostCard
                                :show-border-bottom="showBorderBottom"
                                :show-btn-follow="showBtnFollow"
                                :module="module"
                                :data="posts[virtualRow.index]"
                                :user="user || {}"
                                @open-more-options-drawer="openMoreOptionsDrawer"
                            />
                        </div>
                    </div>

                    <div ref="loadTrigger" v-if="hasMore || loadingLoadMore"
                        class="load-more-container py-3.5 flex justify-center">
                        <Spinner/>
                    </div>
                </div>
            </div>

            <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
                <template v-if="drawer?.name === 'moreOptions'">
                    <DrawerItem @on-press="" title="Ver mais"/>
                    <DrawerItem v-if="drawer?.metadata?.post?.author?._id === user?._id" title="Eliminar postagem"/>
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
import { ref, computed, toRef, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useStore } from 'vuex';
import PostCard from './PostCard.vue';
import { useIntersectionObserver } from "@vueuse/core";
import { useVirtualizer } from '@tanstack/vue-virtual';
import PostSkeleton from './PostSkeleton.vue';
import Spinner from '@/components/UI/Spinner.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import PullToRefreshIndicator from '@/components/UI/PullToRefreshIndicator.vue';
import { usePullToRefresh } from '@/composables/usePullToRefresh';

const store = useStore()
const user = computed(() => store.getters.currentUser)

const loadTrigger = ref(null);
const containerRef = ref(null);
const headerRef = ref(null);

const emit = defineEmits(['on-load-more', 'on-refresh', 'on-scroll']);

const props = defineProps({
    posts: { type: Array, required: true },
    module: { type: String, default: "feed" },
    loadingFetch: { type: Boolean, default: false },
    showBorderBottom: { type: Boolean, default: true },
    loadingLoadMore: { type: Boolean, default: false },
    enablePullToRefresh: { type: Boolean, default: false },
    showBtnFollow: { type: Boolean, default: false },
    hasMore: { type: Boolean, default: false },
    initialScroll: { type: Number, default: 0 },
    // Quando informado, o PostList usa ESSE elemento como scroll real
    // (modo embutido), em vez de criar o próprio scroll interno.
    scrollElement: { type: [Object, null], default: null }
})

const isEmbedded = computed(() => !!props.scrollElement);
const effectiveScrollElement = computed(() => props.scrollElement || containerRef.value);

// === Cache global de alturas medidas (sobrevive a remounts) ===
function getSizeCache() {
    if (!window.__postListSizeCache) window.__postListSizeCache = new Map();
    return window.__postListSizeCache;
}
const sizeCache = getSizeCache();
const ESTIMATED_POST_HEIGHT = 420;

const estimateSize = (index) => {
    const post = props.posts[index];
    if (post && sizeCache.has(post._id)) return sizeCache.get(post._id);
    return ESTIMATED_POST_HEIGHT;
};

// === scrollMargin ===
// Modo standalone: altura do slot "header" (ex: CreatePostTrigger).
// Modo embutido: distância real entre o topo do PostList e o topo da área
// scrollável do pai (perfil, reações, tabs, etc — tudo que está acima).
const scrollMargin = ref(0);

const measureScrollMargin = () => {
    if (isEmbedded.value) {
        const el = containerRef.value;
        const scrollEl = effectiveScrollElement.value;
        if (!el || !scrollEl) return;

        const elRect = el.getBoundingClientRect();
        const scrollRect = scrollEl.getBoundingClientRect();
        scrollMargin.value = (elRect.top - scrollRect.top) + scrollEl.scrollTop;
    } else if (headerRef.value) {
        scrollMargin.value = headerRef.value.offsetHeight;
    } else {
        scrollMargin.value = 0;
    }
};

const virtualizerOptions = computed(() => ({
    count: props.posts?.length || 0,
    getScrollElement: () => effectiveScrollElement.value,
    estimateSize,
    overscan: 4,
    scrollMargin: scrollMargin.value
}));

const virtualizer = useVirtualizer(virtualizerOptions);
const virtualItems = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

// Mede em lote (1 frame) e atualiza cache global
let rafId = null;
const pendingMeasurements = new Map();

const measureElement = (el, index) => {
    if (!el) return;
    pendingMeasurements.set(el, index);
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
        pendingMeasurements.forEach((idx, node) => {
            virtualizer.value.measureElement(node);
            const post = props.posts[idx];
            if (post) {
                const height = node.getBoundingClientRect().height;
                if (height > 0) sizeCache.set(post._id, height);
            }
        });
        pendingMeasurements.clear();
        rafId = null;
    });
};

const handleScroll = (event) => {
    emit('on-scroll', event.target.scrollTop);
};

const drawer = ref({ show: false, name: "", metadata: {} })
const openDrawer = (data) => {
    const { show, name, metadata = {} } = data
    drawer.value = { show, name, metadata }
}
const closeDrawer = () => { drawer.value = { show: false, name: '', metadata: {} } }
const openMoreOptionsDrawer = (post) => {
    openDrawer({ show: true, name: "moreOptions", metadata: { post, title: 'Postagem' } })
}

useIntersectionObserver(loadTrigger, ([{ isIntersecting }]) => {
    if (isIntersecting) emit('on-load-more');
});

// Pull-to-refresh interno só roda no modo standalone.
// No modo embutido, o componente pai (ex: Profile.vue) já cuida disso.
const { pullDistance, isRefreshing, threshold } = usePullToRefresh(
    containerRef,
    () => emitRefreshAndWait(),
    {
        threshold: 70,
        maxPull: 90,
        enabled: computed(() => props.enablePullToRefresh && !isEmbedded.value)
    }
)

const emitRefreshAndWait = () => new Promise((resolve) => emit('on-refresh', resolve))

const isRestoringScroll = ref(props.initialScroll > 0);

const restoreInitialScroll = () => {
    measureScrollMargin();

    if (props.initialScroll > 0) {
        virtualizer.value.scrollToOffset(props.initialScroll, { align: 'start' });
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            isRestoringScroll.value = false;
        });
    });
};

let headerResizeObserver = null;

onMounted(() => {
    nextTick(() => {
        if (isEmbedded.value) {
            // No modo embutido, o scrollElement (passado pelo pai) pode ainda
            // não estar disponível no primeiro tick — espera ficar pronto.
            if (effectiveScrollElement.value) {
                restoreInitialScroll();
            }
        } else {
            restoreInitialScroll();

            if (headerRef.value && window.ResizeObserver) {
                headerResizeObserver = new ResizeObserver(() => measureScrollMargin());
                headerResizeObserver.observe(headerRef.value);
            }
        }
    });
});

// Reage caso o scrollElement só fique disponível depois do mount
// (comum quando ele vem de um ref do componente pai)
watch(effectiveScrollElement, (el, oldEl) => {
    if (isEmbedded.value && el && !oldEl) {
        nextTick(() => restoreInitialScroll());
    }
});

onBeforeUnmount(() => {
    headerResizeObserver?.disconnect();
});

// Expõe utilitários para o componente pai recalcular/controlar o scroll
defineExpose({
    recalculateScrollMargin: measureScrollMargin,
    scrollToOffset: (offset, options = { align: 'start' }) => {
        measureScrollMargin();
        virtualizer.value.scrollToOffset(offset, options);
    }
});
</script>