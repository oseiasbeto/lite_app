<template>
    <div ref="scrollContainer" class="relative overflow-y-auto h-full">
        <!-- Indicador flutuante estilo Facebook, não desloca o conteúdo -->
        <PullToRefreshIndicator
            v-if="enablePullToRefresh"
            :distance="pullDistance"
            :threshold="threshold"
            :is-refreshing="isRefreshing"
        />

        <div v-if="!loadingFetch">
            <div v-if="posts?.length">
                <!-- Spacer com a altura total da lista virtual -->
                <div class="relative w-full" :style="{ height: `${totalSize}px` }">
                    <div
                        v-for="virtualRow in virtualItems"
                        :key="posts[virtualRow.index]?._id"
                        :ref="(el) => measureElement(el, virtualRow.index)"
                        :data-index="virtualRow.index"
                        class="absolute top-0 left-0 w-full"
                        :style="{ transform: `translateY(${virtualRow.start}px)` }"
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

            <!--DRAWER-->
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
import { ref, computed, toRef, nextTick } from 'vue';
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
const scrollContainer = ref(null);

const emit = defineEmits(['on-load-more', 'on-refresh']);

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
    }
})

// === Virtualização ===
// estimateSize é só um palpite inicial (px); a altura real de cada PostCard
// (imagem, texto, etc.) é medida depois via measureElement, então alturas
// variáveis funcionam sem problema.
const ESTIMATED_POST_HEIGHT = 420;

const virtualizerOptions = computed(() => ({
    count: props.posts?.length || 0,
    getScrollElement: () => scrollContainer.value,
    estimateSize: () => ESTIMATED_POST_HEIGHT,
    overscan: 4
}));

const virtualizer = useVirtualizer(virtualizerOptions);

const virtualItems = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

let rafId = null;
const pendingMeasurements = new Set();

const measureElement = (el, index) => {
  if (!el) return;

  pendingMeasurements.add(el);

  if (rafId) return; // já tem um frame agendado, não duplica

  rafId = requestAnimationFrame(() => {
    pendingMeasurements.forEach((node) => {
      virtualizer.value.measureElement(node);
    });
    pendingMeasurements.clear();
    rafId = null;
  });
};

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
    scrollContainer,
    () => emitRefreshAndWait(),
    {
        threshold: 70,
        maxPull: 90,
        enabled: toRef(props, 'enablePullToRefresh')
    }
)

const emitRefreshAndWait = () => {
    return new Promise((resolve) => {
        emit('on-refresh', resolve)
    })
}
</script>