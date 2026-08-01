<template>
  <header
    class="flex h-[52px] border-b dark:border-x-dark-border items-center px-2 bg-x-light-bg dark:bg-[#0c1014] z-50">
    <button @click="$emit('goBack')"
      class="p-2 dark:text-white text-[rgb(40,40,41)] active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive mr-2 rounded-full transition-colors">
      <svg aria-label="Voltar" class="text-inherit" fill="currentColor" height="24" role="img" viewBox="0 0 24 24"
        width="24">
        <title>Voltar</title>
        <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line>
        <polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor"
          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polyline>
      </svg>
    </button>

    <div class="relative">
      <!-- Avatar com clique -->
      <Avatar @click="goToProfile(conversation)"
        :url="conversation?.avatar?.thumbnails?.bg || conversation?.avatar?.url" size="xl"
        class="flex-shrink-0 !w-[32px] !h-[32px]" />

      <!-- Bolinha de status (ativo) -->
      <span v-if="conversation?.is_online"
        class="absolute bottom-0 right-0 bg-[rgba(63,187,70,1.0)] block h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#262626]"></span>
    </div>

    <!-- Informações do contato -->
    <div class="ml-2 flex-1 min-w-0">
      <!-- Nome -->
      <div @click="goToProfile(conversation)" class="w-full flex">
        <h2 class="text-base mb-0.5 font-semibold text-x-light-textPrimary dark:text-white truncate leading-tight">
          {{ loading ? 'Carregando...' : conversation?.name || 'Chat' }}
        </h2>

        <!--celo de verificacao-->
        <div v-if="conversation?.is_verified" class="shrink-0 flex-1 justify-start ml-1">
          <svg viewBox="0 0 22 22"
            aria-label="Verified account" role="img" class="w-[16px] h-[16px] text-x-light-blue"
            fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-testid="icon-verified">
            <g>
              <path
                d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z">
              </path>
            </g>
          </svg>
        </div>
      </div>

      <!--subtitule-->

      <p class="text-[13px] truncate text-x-light-textPrimary dark:text-x-dark-textPrimary mt-[-2px]">
        <!-- Digitando com animação de 3 pontinhos -->
        <span v-if="conversation?.is_typing" class="flex items-center gap-0.5">
          escrevendo
          <span class="flex ml-1 space-x-0.5">
            <span
              class="w-1 h-1 bg-[#dee0e1] dark:bg-[#b0b3b8] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span
              class="w-1 h-1 bg-[#dee0e1] dark:bg-[#b0b3b8] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span class="w-1 h-1 bg-[#dee0e1] dark:bg-[#b0b3b8] rounded-full animate-bounce"></span>
          </span>
        </span>
        <span v-else>{{ statusText }}</span>
      </p>
    </div>

    <!-- Botões da direita (busca e menu) -->
    <div class="flex items-center gap-3">
      <!-- Mais opções (3 pontinhos verticais) -->
      <button @click="goToProfile(conversation)" class="p-2 rounded-full dark:text-white">
        <svg aria-label="Informações da conversa" class="w-[20px] h-[20px] text-inherit" fill="currentColor" height="24"
          role="img" viewBox="0 0 24 24" width="24">
          <title>Informações da conversa</title>
          <circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="2"></circle>
          <circle cx="11.819" cy="7.709" r="1.25"></circle>
          <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            x1="10.569" x2="13.432" y1="16.777" y2="16.777"></line>
          <polyline fill="none" points="10.569 11.05 12 11.05 12 16.777" stroke="currentColor" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="2"></polyline>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'

const props = defineProps({
  userId: { type: String, required: true },
  conversation: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  statusText: { type: String, default: "" }
})

const emit = defineEmits(['goToProfile', 'goBack'])


const goToProfile = (conv) => {
  emit('goToProfile', conv)
}

</script>