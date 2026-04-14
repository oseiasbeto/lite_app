<template>
  <div class="flex items-center gap-1">
    <span :class="color" class="dot" style="animation-delay: 0s"></span>
    <span :class="color" class="dot" style="animation-delay: 0.2s"></span>
    <span :class="color" class="dot" style="animation-delay: 0.4s"></span>
  </div>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'dark:bg-[rgb(230,231,232)] bg-[rgb(99,100,102)]'
  }
})
</script>

<style scoped>

.dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  animation: dotPulse 1.4s infinite ease-in-out;
}

/* 🔥 Animação aqui dentro */
@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.3);
    opacity: 0;
  }
  40% {
    transform: scale(1);
    opacity: 0.5;
  }
}
</style>