<template>
  <!--start navbar-->
  <header class="flex h-[53px] fixed w-full top-0 items-center px-2 dark:bg-x-dark-bg bg-x-light-bg  z-50">
    <button @click="router.back()"
      class="p-1 hover:bg-x-light-surfaceHover active:bg-x-light-surfaceActive dark:hover:bg-x-dark-surfaceHover dark:active:bg-x-dark-surfaceActive text-inherit mr-1 rounded-full transition-colors mt-[-4px]">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 12H19M5 12L11 6M5 12L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </button>
    <!-- Informações do contato -->
    <div class="ml-3 flex-1 min-w-0">
      <!-- Title -->
      <div class="w-full flex">
        <h2 class="text-xl mb-0.5 font-semibold dark:text-white text-[rgb(40,40,41)] truncate leading-tight">
          {{ loading ? '' : title || '' }}
        </h2>
      </div>
    </div>

    <!-- Botões da direita (busca e menu) -->
    <div class="flex items-center gap-3">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: false },
  loading: { type: Boolean, default: false }
})

const router = useRouter()
</script>