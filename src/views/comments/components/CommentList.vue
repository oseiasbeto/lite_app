<template>
    <div class="relative">
        <!-- ITENS -->
        <div v-if="!loadingFetch">
            <div v-if="comments?.length">
                <CommentCard v-for="item in comments" @on-reply="onReply" :postId="postId" 
                    :data="item"
                    :user-id="user?._id" :key="item?._id" 
                    :active="activeComment === item?._id"
                    />

                <!-- LOAD MORE -->
                <div ref="loadTrigger" v-if="pagination?.hasMore || loadingLoadMore"
                    class="load-more-container py-3.5 flex justify-center">
                    <Spinner/>
                </div>
            </div>
        </div>
        <div v-else>
             <CommentSkeleton v-for="n in 8" :key="n" />
        </div>
    </div>

</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import CommentCard from './CommentCard.vue';
import { useIntersectionObserver } from "@vueuse/core";
import CommentSkeleton from './CommentSkeleton.vue';
import Spinner from '@/components/UI/Spinner.vue';

const store = useStore()

const user = computed(() => store.getters.currentUser)

const loadTrigger = ref(null);
const updateKey = ref(0)
const virtualCommentListScroller = ref(null);

const emit = defineEmits(['on-scroll', 'on-reply', 'on-load-more']);

const onReply = (data) => {
    emit('on-reply', data)
}

const setScrollTop = (position) => {
    const scrollElement = virtualCommentListScroller.value?.$el;
    if (scrollElement) {

        scrollElement.scrollTop = position;
    }
};

const forceUpdate = () => {
    updateKey.value++
}

const handleScrollEvent = (event) => {
    console.log("aki")
    const scrollElement = event.target;

    if (scrollElement) {
        emit('on-scroll', scrollElement.scrollTop)
    }
};

defineProps({
    comments: {
        type: Array,
        required: true
    },
    postId: {
        type: String,
        required: true
    },
    activeComment: {
        type: String,
        default: null
    },
    loadingFetch: {
        type: Boolean,
        default: false
    },
    loadingLoadMore: {
        type: Boolean,
        default: false
    },
    pagination: {
        type: Object,
        required: true
    }
})

defineExpose({
    setScrollTop,
    forceUpdate
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