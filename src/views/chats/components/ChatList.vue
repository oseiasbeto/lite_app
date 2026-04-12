<template>
    <div class="relative">
      <div v-if="!loading">
        <div v-if="conversations?.length">
          <ChatListItem 
            v-for="item in conversations" 
            :key="item._id" :conversation="item" 
            :user-id="userId"
            @click="$emit('select', item)" 
            @more-options="handleMoreOptions" 
          />

          <!--LOAD MORE-->
          <div ref="loadTrigger" v-if="hasMore || loadingMore" class="load-more-container flex justify-center my-5">
            <SpinnerSmall />
          </div>
        </div>
      </div>
      <div v-else>
        <ChatSkeleton v-for="n in 8" :key="n" />
      </div>
    </div>
</template>

<script setup>
import { useIntersectionObserver } from '@vueuse/core';
import ChatListItem from './ChatListItem.vue';
import ChatSkeleton from './ChatSkeleton.vue';
import { ref } from 'vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

defineProps({
  conversations: Array,
  loading: Boolean,
  loadingMore: Boolean,
  userId: String,
  source: String,
  hasMore: Boolean,
  showBtnFloating: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['select', 'on-scroll', 'more-options', 'load-more']);

const loadTrigger = ref(null);
const virtualChatListScroller = ref(null);

useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      emit('load-more');
    }
  }
);

const setScrollTop = (position) => {
  const scrollElement = virtualChatListScroller.value?.$el;
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

const handleMoreOptions = conv => {
  emit('more-options', conv)
}

// Expõe a função para o componente pai
defineExpose({
  setScrollTop
});
</script>