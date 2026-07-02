<template>
  <!-- Botão Flutuante do Telegram -->
  <transition enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-16 opacity-0 scale-75"
    enter-to-class="transform translate-y-0 opacity-100 scale-100" leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-16 opacity-0 scale-75">
    <button v-if="showFab" 
      @click="$emit('onPress')" 
      class="fixed bottom-20 right-6 z-50 flex items-center justify-center
             w-14 h-14 
             bg-x-light-blue hover:bg-x-light-blueHover dark:bg-x-dark-blue dark:hover:bg-x-dark-blueHover dark:bg-x-dark-primary
             hover:bg-x-primary-hover dark:hover:bg-x-dark-primary-hover
             text-white rounded-full 
             focus:outline-none"
             
             >
      <!-- Ícone de lápis (exato do Telegram) -->
      <slot name="icon"></slot>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineEmits(['onPress'])

const showFab = ref(true)
let scrollContainer = null

const handleScroll = () => {
  if (!scrollContainer) return
  const scrolled = scrollContainer.scrollTop > 100
  showFab.value = !scrolled
}

onMounted(() => {
  // Detecta automaticamente o container com rolagem (DynamicScroller, div com overflow, etc.)
  scrollContainer = document.querySelector('.scroller')
    || document.querySelector('.vue-recycle-scroller')
    || document.querySelector('[class*="overflow"]')
    || window

  if (scrollContainer && scrollContainer !== window) {
    scrollContainer.addEventListener('scroll', handleScroll)
  } else {
    window.addEventListener('scroll', handleScroll)
  }

  // Valor inicial
  handleScroll()
})

onUnmounted(() => {
  if (scrollContainer && scrollContainer !== window) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  } else {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>