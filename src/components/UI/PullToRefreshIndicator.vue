<!-- src/components/UI/PullToRefreshIndicator.vue -->
<template>
  <Transition name="fade-scale">
    <div
      v-if="distance > 0 || isRefreshing"
      class="left-1/2 z-30 -translate-x-1/2 flex items-center justify-center
             w-9 h-9 rounded-full bg-white dark:bg-[#242526]
             shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
      :class="isRefreshing ? 'fixed' : 'absolute'"
      :style="indicatorStyle"
    >
      <!-- Spinner girando enquanto carrega -->
      <svg v-if="isRefreshing" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#e4e6eb" stroke-width="3" class="dark:stroke-[#3a3b3c]" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="#287dff" stroke-width="3" stroke-linecap="round" />
      </svg>

      <!-- Anel de progresso enquanto puxa, sem soltar ainda -->
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" :style="{ transform: `rotate(${rotation}deg)` }">
        <circle cx="12" cy="12" r="9" stroke="#e4e6eb" class="dark:stroke-[#3a3b3c]" stroke-width="3" fill="none" />
        <circle
          cx="12" cy="12" r="9" fill="none"
          stroke="#287dff" stroke-width="3" stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  distance: { type: Number, default: 0 },
  threshold: { type: Number, default: 70 },
  isRefreshing: { type: Boolean, default: false }
})

const circumference = 2 * Math.PI * 9 // raio 9

// Progresso de 0 a 1 conforme se aproxima do threshold
const progress = computed(() => Math.min(props.distance / props.threshold, 1))

const dashOffset = computed(() => circumference * (1 - progress.value))

// Pequeno "bounce" de rotação quando passa do threshold (feedback de soltar)
const rotation = computed(() => progress.value * 360)

// Posição vertical: o círculo acompanha o dedo até o threshold, depois fica fixo (igual Facebook)
const indicatorStyle = computed(() => {
  const top = props.isRefreshing
    ? 14
    : Math.min(props.distance, props.threshold) - 28 // começa "escondido" atrás do header

  return {
    top: `${top}px`,
    opacity: props.isRefreshing ? 1 : Math.min(progress.value * 1.3, 1),
    transition: props.isRefreshing ? 'top 0.2s ease' : 'none'
  }
})
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.6);
}
</style>