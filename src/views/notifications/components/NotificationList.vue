<template>
    <div class="relative">
        <!-- ITENS -->
        <div v-if="!loadingFetch">
            <div v-if="notifications?.length">
                <NotificationCard v-for="item in notifications" 
                    @on-mark-read="onMarkRead" 
                    :data="item"
                    :user-id="user?._id"
                />

                <!-- LOAD MORE -->
                <div ref="loadTrigger" v-if="pagination?.hasMore || loadingLoadMore"
                    class="load-more-container py-3.5 flex justify-center">
                    <Spinner/>
                </div>
            </div>
        </div>
        <div v-else>
             <NotificationSkeleton v-for="n in 8" :key="n" />
        </div>
    </div>

</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useIntersectionObserver } from "@vueuse/core";
import Spinner from '@/components/UI/Spinner.vue';
import NotificationCard from './NotificationCard.vue';
import NotificationSkeleton from './NotificationSkeleton.vue';

const store = useStore()

const user = computed(() => store.getters.currentUser)

const loadTrigger = ref(null);
const virtualCommentListScroller = ref(null);

const emit = defineEmits(['on-scroll', 'on-mark-read', 'on-load-more']);

const onMarkRead = (data) => {
    emit('on-mark-read', data)
}

const setScrollTop = (position) => {
    const scrollElement = virtualCommentListScroller.value?.$el;
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
    notifications: {
        type: Array,
        required: true
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