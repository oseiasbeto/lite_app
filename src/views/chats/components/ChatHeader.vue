<template>
  <header
    class="flex h-[44px] items-center px-2 backdrop-blur-sm dark:bg-[rgba(32,32,32,0.8)] bg-[rgba(255,255,255,0.8)] border-b dark:border-[rgb(57,56,57)] z-50">
    <button @click="$emit('goBack')"
      class="p-1 dark:text-white hover:bg-background-secondary mr-1 rounded-full transition-colors">
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="m15 5-7 7 7 7.005" class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" fill="none"
          stroke-linecap="round"></path>
      </svg>
    </button>

    <!-- Avatar -->
    <Avatar @click="goToProfile(conversation)"
      :url="conversation?.avatar?.thumbnails?.md || conversation?.avatar?.url" size="xl" class="flex-shrink-0" />

    <!-- Informações do contato -->
    <div class="ml-3 flex-1 min-w-0">
      <!-- Nome -->
      <div @click="goToProfile(conversation)" class="w-full flex">
        <h2 class="text-[15px] mb-0.5 font-semibold dark:text-white truncate leading-tight">
          {{ loading ? 'Carregando...' : conversation?.name || 'Chat' }}
        </h2>

        <!--celo de verificacao-->
        <div v-if="conversation?.is_verified" class="shrink-0 flex-1 justify-start">
          <svg class="ml-[5px] mt-0.5" fill="none" width="14" viewBox="0 0 24 24" height="14">
            <circle cx="12" cy="12" r="11.5" fill="#0F73FF"></circle>
            <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
              d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
            </path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Botões da direita (busca e menu) -->
    <div class="flex items-center gap-3">
      <!-- Mais opções (3 pontinhos verticais) -->
      <button @click="goToProfile(conversation)" class="p-2 rounded-full dark:text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
            class="icon_svg-stroke" stroke-width="1.5" stroke="currentColor" fill="none"></path>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  userId: { type: String, required: true },
  conversation: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const router = useRouter()

const goToProfile = (conv) => {
  const { participants } = conv
  const participant = participants.find(p => p?.user?._id !== props?.userId)

  const profile = participant?.user

  if (!profile?._id) return
  router.push('/profile/' + profile?._id)
}

defineEmits(['goBack'])
</script>