<template>
  <!-- Estilo TikTok: linha limpa, sem borda por baixo, avatar maior -->
  <div @click="$emit('click')"
    class="flex tapHighlight items-center px-4 py-3 cursor-pointer transition-colors duration-150 active:bg-black/5 dark:active:bg-white/10">
    <!-- Avatar com status online -->
    <div class="relative flex-shrink-0">
      <Avatar :url="user?.profile_image?.url || '/default-avatar.png'" size="md" class="!w-[48px] !h-[48px]" alt="" />
      <!-- Bolinha de status -->
      <span v-if="user?.is_online"
        class="absolute bottom-0 right-0 bg-[#25f4ee] block h-3 w-3 rounded-full ring-2 ring-white dark:ring-black"></span>
    </div>

    <!-- Conteúdo -->
    <div class="flex-1 ml-3 min-w-0">
      <div class="flex items-center w-full">
        <!-- Nome -->
        <h3 class="text-[15px] font-semibold text-black dark:text-white truncate leading-5">
          {{ user.name || user.username }}
        </h3>

        <!--celo de verificacao-->
        <div v-if="user?.is_verified" class="shrink-0 flex-1 justify-start">
          <svg class="ml-1 mt-0.5" fill="none" width="14" viewBox="0 0 24 24" height="14">
            <circle cx="12" cy="12" r="11.5" fill="#20D5EC"></circle>
            <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
              d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
            </path>
          </svg>
        </div>
      </div>
      <!-- Bio -->
      <div class="w-full">
        <p v-if="user?.bio" class="text-[13px] leading-[18px] text-black/50 dark:text-white/50 truncate">
          {{ user.bio }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
//import { computed } from 'vue'
import Avatar from '@/components/Utils/Avatar.vue'

defineEmits(['click'])

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})
</script>

<style scoped></style>