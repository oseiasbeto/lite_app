// src/composables/usePullToRefresh.js
import { ref, onMounted, onUnmounted } from 'vue'

export function usePullToRefresh(containerRef, onRefresh, options = {}) {
  const {
    threshold = 70,
    maxPull = 90,
    resistance = 2.5   // um pouco mais "pesado", igual Facebook
  } = options

  const pullDistance = ref(0)
  const isRefreshing = ref(false)
  const isPulling = ref(false)

  let startY = 0
  let canPull = false

  const isAtTop = () => {
    const el = containerRef.value
    if (!el) return false
    return el.scrollTop <= 0
  }

  const handleTouchStart = (e) => {
    if (isRefreshing.value) return
    if (!isAtTop()) {
      canPull = false
      return
    }
    startY = e.touches[0].clientY
    canPull = true
  }

  const handleTouchMove = (e) => {
    if (!canPull || isRefreshing.value) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff <= 0) {
      pullDistance.value = 0
      isPulling.value = false
      return
    }

    // Se rolou pra baixo no meio do gesto, cancela
    if (!isAtTop()) {
      canPull = false
      pullDistance.value = 0
      isPulling.value = false
      return
    }

    isPulling.value = true

    // Efeito de resistência (elástico), igual apps nativos
    const distance = Math.min(diff / resistance, maxPull)
    pullDistance.value = distance

    // Evita o scroll nativo da página enquanto puxa
    if (distance > 5) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = async () => {
    if (!canPull) return

    if (pullDistance.value >= threshold && !isRefreshing.value) {
      isRefreshing.value = true
      pullDistance.value = threshold // mantém o indicador fixo enquanto carrega

      try {
        await onRefresh()
      } finally {
        isRefreshing.value = false
        pullDistance.value = 0
        isPulling.value = false
      }
    } else {
      pullDistance.value = 0
      isPulling.value = false
    }

    canPull = false
  }

  onMounted(() => {
    const el = containerRef.value
    if (!el) return
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (!el) return
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    pullDistance,
    isRefreshing,
    isPulling,
    threshold
  }
}