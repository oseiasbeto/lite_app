<template>
  <!-- Estilo TikTok: lista sem caixa/borda, a toda a largura, fundo do próprio tema -->
  <div v-if="users?.length" class="flex flex-col overflow-x-hidden bg-white dark:bg-black" ref="listContainer">
    <!-- Skeletons enquanto carrega -->
    <div v-if="loading" class="w-full">
      <UserSkeleton v-for="n in 5" :key="n" />
    </div>

    <!-- Lista de usuários -->
    <div class="w-full" v-else>
      <UserItem v-for="user in users" :key="user._id" :user="user" @click="$emit('select', user)" />
    </div>

    <!-- Trigger para carregar mais -->
    <div v-if="hasMore || loadingMore" class="load-more-container flex h-[52px] items-center justify-center">
      <div v-if="!loadingMore" class="h-full w-full">
        <button type="button"
          class="tapHighlight flex h-full w-full items-center justify-center gap-1 text-[14px] font-semibold text-black/50 transition active:opacity-60 dark:text-white/50"
          @click="emit('load-more');">
          <span>Ver mais</span>
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
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