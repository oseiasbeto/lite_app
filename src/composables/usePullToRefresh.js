// src/composables/usePullToRefresh.js
import { ref, unref, onMounted, onUnmounted } from 'vue'

function getScrollableParent(el) {
  if (!el) return null
  let node = el
  while (node && node !== document.body) {
    const style = getComputedStyle(node)
    const overflowY = style.overflowY
    const isScrollable = (overflowY === 'auto' || overflowY === 'scroll')
    const hasScrollableContent = node.scrollHeight > node.clientHeight
    if (isScrollable && hasScrollableContent) return node
    node = node.parentElement
  }
  return document.scrollingElement || document.documentElement
}

export function usePullToRefresh(containerRef, onRefresh, options = {}) {
  const {
    threshold = 70,
    maxPull = 90,
    resistance = 2.5,
    enabled = true // pode ser boolean, ref ou computed
  } = options

  const pullDistance = ref(0)
  const isRefreshing = ref(false)
  const isPulling = ref(false)

  let scrollEl = null
  let startY = 0
  let canPull = false

  const isEnabled = () => unref(enabled)

  const isAtTop = () => {
    if (!scrollEl) return false
    return scrollEl.scrollTop <= 1
  }

  const handleTouchStart = (e) => {
    if (!isEnabled() || isRefreshing.value) {
      canPull = false
      return
    }

    scrollEl = getScrollableParent(containerRef.value)

    if (!isAtTop()) {
      canPull = false
      return
    }

    startY = e.touches[0].clientY
    canPull = true
  }

  const handleTouchMove = (e) => {
    if (!isEnabled() || !canPull || isRefreshing.value) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff <= 0 || !isAtTop()) {
      canPull = false
      pullDistance.value = 0
      isPulling.value = false
      containerRef.value?.style.removeProperty('touch-action')
      return
    }

    isPulling.value = true

    const distance = Math.min(diff / resistance, maxPull)
    pullDistance.value = distance

    if (distance > 5) {
      containerRef.value.style.touchAction = 'none'
      if (e.cancelable) e.preventDefault()
    }
  }

  const handleTouchEnd = async () => {
    containerRef.value?.style.removeProperty('touch-action')

    if (!canPull) return

    if (pullDistance.value >= threshold && !isRefreshing.value) {
      isRefreshing.value = true
      pullDistance.value = threshold

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
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (!el) return
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
    el.removeEventListener('touchcancel', handleTouchEnd)
    el.style.removeProperty('touch-action')
  })

  return { pullDistance, isRefreshing, isPulling, threshold }
}