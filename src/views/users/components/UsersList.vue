<template>
  <div v-if="users?.length" class="border dark:border-[rgb(57,56,57)] flex flex-col overflow-x-hidden" ref="listContainer">
    <!-- Skeletons enquanto carrega -->
    <div v-if="loading" class="w-full">
      <UserSkeleton v-for="n in 5" :key="n" />
    </div>

    <!-- Lista de usuários -->
    <div class="w-full" v-else>
      <UserItem v-for="user in users" :key="user._id" :user="user" @click="$emit('select', user)" />
    </div>

    <!-- Trigger para carregar mais -->
    <div v-if="hasMore || loadingMore" class="load-more-container flex items-center justify-center h-[34px]">
      <div v-if="!loadingMore">
        <button class="w-full h-full tapHighlight text-[rgba(25,95,170)] dark:text-[#4894fd] text-[13px]" @click="emit('load-more');">Ver mais ></button>
      </div>
      <div v-else>
        <Spinner />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UserSkeleton from './UserSkeleton.vue';
import UserItem from './UserItem.vue';
import Spinner from '@/components/UI/Spinner.vue';

defineProps({
  users: Array,
  loading: {
    type: Boolean,
    default: true
  },
  loadingMore: Boolean,
  hasMore: Boolean,
  ukey: String // mantido apenas para compatibilidade, mas não usado
});

const emit = defineEmits(['select', 'load-more']);

const listContainer = ref(null);

// Método para rolar ao topo (exposto ao pai)
const setScrollTop = (position = 0) => {
  if (listContainer.value) {
    listContainer.value.scrollTop = position;
  }
};

defineExpose({ setScrollTop });
</script>