<template>
  <div class="relative">
    <div v-if="!loading">
      <div v-if="conversations?.length" class="h-[calc(100vh-56px)]">
        <RecycleScroller
          ref="scroller"
          class="h-full"
          :items="conversations"
          :item-size="72"
          key-field="_id"
          @scroll="handleScrollEvent"
          @update="onVirtualUpdate"
        >
          <template #default="{ item }">
            <ChatListItem
              :conversation="item"
              :user-id="userId"
              @click="$emit('select', item)"
              @more-options="handleMoreOptions"
            />
          </template>
        </RecycleScroller>

        <div v-if="loadingMore" class="load-more-container flex justify-center my-5">
          <SpinnerSmall />
        </div>
      </div>
      <div v-else>
        <ChatEmpty />
      </div>
    </div>
    <div v-else>
      <LoadingScreen />
    </div>
  </div>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import ChatListItem from './ChatListItem.vue';
import ChatEmpty from './ChatEmpty.vue';
import { ref } from 'vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';
import LoadingScreen from '@/components/UI/LoadingScreen.vue';

defineProps({
  conversations: Array,
  loading: Boolean,
  loadingMore: Boolean,
  userId: String,
  source: String,
  hasMore: Boolean,
  showBtnFloating: { type: Boolean, default: true }
});

const emit = defineEmits(['select', 'on-scroll', 'more-options', 'load-more']);

const scroller = ref(null);
let lastEndIndex = -1;

// dispara load-more quando o virtual scroller renderiza perto do fim
const onVirtualUpdate = (startIndex, endIndex) => {
  if (endIndex === lastEndIndex) return; // evita disparo duplicado
  lastEndIndex = endIndex;

  const total = scroller.value?.items?.length ?? 0;
  if (endIndex >= total - 1) {
    emit('load-more');
  }
};

const setScrollTop = (position) => {
  // RecycleScroller expõe scrollToPosition nativamente
  scroller.value?.scrollToPosition(position);
};

const handleScrollEvent = (event) => {
  const scrollElement = event.target;
  if (scrollElement) {
    emit('on-scroll', scrollElement.scrollTop);
  }
};

const handleMoreOptions = (conv) => {
  emit('more-options', conv);
};

defineExpose({ setScrollTop });
</script>