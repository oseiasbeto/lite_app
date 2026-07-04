<template>
  <!-- Botão Flutuante do Telegram -->
  <transition enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-16 opacity-0 scale-75"
    enter-to-class="transform translate-y-0 opacity-100 scale-100" leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-16 opacity-0 scale-75">
    <button v-if="show" 
      @click="$emit('onPress')" 
      class="fixed bottom-20 right-6 z-50 flex items-center justify-center
             w-14 h-14 
             bg-black text-white dark:bg-white dark:text-black
              rounded-full 
             focus:outline-none"
             >
      <!-- Ícone de lápis (exato do Telegram) -->
      <slot name="icon"></slot>
    </button>
  </transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: true
  }
})

defineEmits(['onPress'])
</script>