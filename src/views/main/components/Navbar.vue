<template>
    <!--start navbar-->
  <header
    class="flex h-[44px] fixed w-full top-0 items-center px-2 backdrop-blur-sm dark:bg-[rgba(32,32,32,0.8)] bg-[rgba(255,255,255,0.8)] border-b dark:border-[rgb(57,56,57)] z-50">
    <button @click="router.back()"
      class="p-1 dark:text-white text-[rgb(40,40,41)] mr-1 rounded-full transition-colors">
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="m15 5-7 7 7 7.005" class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" fill="none"
          stroke-linecap="round"></path>
      </svg>
    </button>
    <!-- Informações do contato -->
    <div class="ml-3 flex-1 min-w-0">
      <!-- Title -->
      <div class="w-full flex">
        <h2 class="text-[15px] mb-0.5 font-semibold dark:text-white text-[rgb(40,40,41)] truncate leading-tight">
          {{ loading ? '...' : title || '' }}
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