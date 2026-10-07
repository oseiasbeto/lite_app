<!-- src/components/UI/PullToRefreshIndicator.vue -->
<template>
  <Transition name="fade-scale">
    <div
      v-if="distance > 0 || isRefreshing"
      role="status"
      aria-live="polite"
      :aria-label="isRefreshing ? 'A atualizar' : 'Puxe para atualizar'"
      class="left-1/2 z-30 -translate-x-1/2 flex items-center justify-center w-10 h-10
             text-neutral-500 dark:text-neutral-400"
      :class="isRefreshing ? 'fixed' : 'absolute'"
      :style="indicatorStyle"
    >
      <!--
        Estilo TikTok: sem circulo de fundo nem sombra, so um spinner cinza fino de 12 tracos.
        Ao puxar, os tracos vao aparecendo um a um conforme o progresso;
        ao atualizar, gira em passos de 30° com a cauda a desvanecer.
      -->
      <svg
        width="26" height="26" viewBox="0 0 24 24" fill="none"
        :class="{ 'tt-spin': isRefreshing }"
        aria-hidden="true"
      >
        <line
          v-for="i in 12"
          :key="i"
          x1="12" y1="2.5" x2="12" y2="6.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          :transform="`rotate(${(i - 1) * 30} 12 12)`"
          :opacity="spokeOpacity(i - 1)"
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
  isRefreshing: { type: Boolean, default: false },
  topPosition: { type: Number, default: 14 }
})

// Progresso de 0 a 1 conforme se aproxima do threshold
const progress = computed(() => Math.min(props.distance / props.threshold, 1))

const reachedThreshold = computed(() => props.distance >= props.threshold)

// Opacidade de cada traco:
// - a atualizar: gradiente de 0.2 a 1 (cria a "cauda" que da a sensacao de rotacao)
// - a puxar: o traco acende conforme o progresso; ao passar do threshold ficam todos fortes
function spokeOpacity(index) {
  if (props.isRefreshing) {
    return 0.2 + (index / 11) * 0.8
  }
  const lit = Math.min(Math.max(progress.value * 12 - index, 0), 1)
  return reachedThreshold.value ? 1 : lit * 0.85
}

// Posição vertical: começa em topPosition e vai até topPosition + threshold
const indicatorStyle = computed(() => {
  let top
  if (props.isRefreshing) {
    // Quando está atualizando: fica fixo em topPosition + um pequeno offset
    top = props.topPosition + 10
  } else {
    // Quando está puxando: começa em topPosition e sobe conforme puxa
    // O valor mínimo é topPosition (quando distance = 0)
    // O valor máximo é topPosition + (threshold - 28) quando atinge o threshold
    const maxOffset = Math.max(0, props.threshold - 28)
    const currentOffset = Math.min(props.distance, props.threshold) - 28
    top = props.topPosition + Math.min(currentOffset, maxOffset)
  }

  // O `top` só deve "seguir o dedo" sem transição enquanto está sendo
  // puxado de fato. Quando `distance` volta a 0 (soltou/cancelou o pull),
  // isso coincide exatamente com a animação de saída — então o `top`
  // também precisa animar em conjunto, senão ele salta instantaneamente
  // enquanto o fade/scale ainda está em transição, dando aquela travada.
  const isSettling = props.isRefreshing || props.distance === 0

  return {
    top: `${top}px`,
    opacity: props.isRefreshing ? 1 : Math.min(progress.value * 1.3, 1),
    transition: isSettling ? 'top 0.2s ease' : 'none'
  }
})
</script>

<style scoped>
.fade-scale-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-scale-leave-active {
  transition: opacity 0.22s cubic-bezier(0.4, 0, 1, 1), transform 0.22s cubic-bezier(0.4, 0, 1, 1);
}
.fade-scale-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.6);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -14px) scale(0.5);
}

/* Rotação em 12 passos, como o spinner de tracos do TikTok / iOS */
.tt-spin {
  animation: tt-spin-rotate 0.9s steps(12, end) infinite;
  transform-origin: center;
}

@keyframes tt-spin-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Quem prefere menos movimento: spinner mais lento e sem transicoes de entrada/saida */
@media (prefers-reduced-motion: reduce) {
  .tt-spin {
    animation-duration: 2.4s;
  }
  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: none;
  }
}
</style>