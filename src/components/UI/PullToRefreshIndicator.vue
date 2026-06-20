<!-- src/components/UI/PullToRefreshIndicator.vue -->
<template>
  <Transition name="fade-scale">
    <div
      v-if="distance > 0 || isRefreshing"
      class="left-1/2 z-30 -translate-x-1/2 flex items-center justify-center
             w-10 h-10 rounded-full bg-white dark:bg-[#242526]
             shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.12)]
             ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
      :class="isRefreshing ? 'fixed' : 'absolute'"
      :style="indicatorStyle"
    >
      <!-- Spinner girando enquanto carrega: só o arco, sem trilho cinzento -->
      <svg v-if="isRefreshing" class="fb-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5"
          stroke="#1877f2"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </svg>

      <!-- Seta enquanto puxa: vira 180° quando passa do threshold (pronto pra soltar) -->
      <svg
        v-else
        width="24" height="24" viewBox="0 0 24 24" fill="none"
        :style="{ transform: `rotate(${arrowRotation}deg)`, transition: 'transform 0.2s ease' }"
      >
        <path
          d="M12 4v13M12 17l-5.5-5.5M12 17l5.5-5.5"
          :stroke="reachedThreshold ? '#1877f2' : '#8a8d91'"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="transition: stroke 0.2s ease"
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

// Progresso de 0 a 1 conforme se aproxima do threshold
const progress = computed(() => Math.min(props.distance / props.threshold, 1))

const reachedThreshold = computed(() => props.distance >= props.threshold)

// Seta aponta pra baixo enquanto puxa, e vira pra cima quando já passou do threshold
const arrowRotation = computed(() => (reachedThreshold.value ? 180 : 0))

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

/* Rotação contínua e suave, igual ao spinner do Facebook (sem trilho cinzento) */
.fb-spin {
  animation: fb-spin-rotate 0.85s linear infinite;
  transform-origin: center;
}

@keyframes fb-spin-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>