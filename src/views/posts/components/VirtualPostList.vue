<template>
    <div class="h-screen flex flex-col">
        <DynamicScroller :items="posts" :min-item-size="120" :class="!loadingFetch ? 'scroller' : 'overflow-hidden'"
            key-field="_id" @scroll="handleScrollEvent" ref="virtualPostListScroller">

            <!-- HEADER FORA do scroll -->
            <template #before>
                <slot name="before-content"></slot>
                <!-- Loading -->
                <div v-if="loadingFetch">
                    <PostSkeleton v-for="n in 8" :key="n" />
                </div>
            </template>

            <!-- ITENS -->
            <template #default="{ item, active }">
                <DynamicScrollerItem :item="item" :active="active" class="scroller-item">
                    <PostCard 
                    :module="module" 
                    :data="item" 
                    :user-id="user?._id" 
                    />
                </DynamicScrollerItem>
            </template>

            <template #after>
                <!-- LOAD MORE -->
                <div ref="loadTrigger" v-if="hasMore || loadingLoadMore"
                    class="load-more-container py-2 flex justify-center">

                    <p>Carregando...</p>
                </div>
            </template>

        </DynamicScroller>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import PostCard from './PostCard.vue';
import { useIntersectionObserver } from "@vueuse/core";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import PostSkeleton from './PostSkeleton.vue';

const store = useStore()

const user = computed(() => store.getters.currentUser)

const loadTrigger = ref(null);
const virtualPostListScroller = ref(null);

const emit = defineEmits(['on-scroll', 'on-load-more']);

const setScrollTop = (position) => {
    const scrollElement = virtualPostListScroller.value?.$el;
    if (scrollElement) {

        scrollElement.scrollTop = position;
    }
};

const handleScrollEvent = (event) => {
    const scrollElement = event.target;

    if (scrollElement) {
        emit('on-scroll', scrollElement.scrollTop)
    }
};

defineProps({
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
    loadingLoadMore: {
        type: Boolean,
        default: false
    },
    hasMore: {
        type: Boolean,
        default: false
    }
})

defineExpose({
    setScrollTop
});

useIntersectionObserver(
    loadTrigger,
    ([{ isIntersecting }]) => {
        if (isIntersecting) {
            emit('on-load-more');
        }
    }
);
</script>