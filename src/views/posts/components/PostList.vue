<template>
    <div class="relative">
        <div v-if="!loadingFetch">
            <div v-if="posts?.length">
                <PostCard v-for="item in posts" :key="item?._id" :module="module" :data="item" :user-id="user?._id" />

                <div ref="loadTrigger" v-if="hasMore || loadingLoadMore"
                    class="load-more-container py-2 flex justify-center">

                    <p>Carregando...</p>
                </div>
            </div>
        </div>
        <div v-else>
            <div v-if="loadingFetch">
                <PostSkeleton v-for="n in 8" :key="n" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import PostCard from './PostCard.vue';
import { useIntersectionObserver } from "@vueuse/core";
import PostSkeleton from './PostSkeleton.vue';

const store = useStore()

const user = computed(() => store.getters.currentUser)

const loadTrigger = ref(null);

const emit = defineEmits(['on-load-more']);

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

useIntersectionObserver(
    loadTrigger,
    ([{ isIntersecting }]) => {
        if (isIntersecting) {
            emit('on-load-more');
        }
    }
);
</script>