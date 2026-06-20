// src/composables/useVirtualList.js
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useVirtualList(containerRef, items, options = {}) {
  const {
    estimatedItemHeight = 420,
    overscan = 3,
    getItemKey = (item, index) => item?._id ?? index
  } = options

  const heightsCache = new Map()
  const resizeObservers = new Map()

  const scrollTop = ref(0)
  const viewportHeight = ref(0)

  const getHeight = (key) => heightsCache.get(key) ?? estimatedItemHeight

  // Offsets acumulados de cada item (posição Y de cada um na lista)
  const offsets = computed(() => {
    const arr = []
    let acc = 0
    for (let i = 0; i < items.value.length; i++) {
      const key = getItemKey(items.value[i], i)
      arr.push(acc)
      acc += getHeight(key)
    }
    return arr
  })

  const totalHeight = computed(() => {
    const len = items.value.length
    if (!len) return 0
    const lastKey = getItemKey(items.value[len - 1], len - 1)
    return offsets.value[len - 1] + getHeight(lastKey)
  })

  // Busca binária: acha o primeiro item visível na posição de scroll atual
  const findStartIndex = (top) => {
    const arr = offsets.value
    if (!arr.length) return 0
    let lo = 0, hi = arr.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (arr[mid] < top) lo = mid + 1
      else hi = mid
    }
    return Math.max(0, lo - 1)
  }

  const visibleRange = computed(() => {
    if (!items.value.length) return { start: 0, end: 0 }

    const start = Math.max(0, findStartIndex(scrollTop.value) - overscan)

    let end = start
    let accHeight = offsets.value[start] ?? 0
    const limit = scrollTop.value + viewportHeight.value

    while (end < items.value.length && accHeight < limit) {
      const key = getItemKey(items.value[end], end)
      accHeight += getHeight(key)
      end++
    }

    end = Math.min(items.value.length, end + overscan)
    return { start, end }
  })

  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end).map((item, i) => {
      const index = start + i
      return {
        item,
        index,
        key: getItemKey(item, index),
        offset: offsets.value[index] ?? 0
      }
    })
  })

  let rafId = null
  const handleScroll = () => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      scrollTop.value = containerRef.value?.scrollTop || 0
      rafId = null
    })
  }

  // Mede a altura real de cada item renderizado (necessário pois os posts têm tamanhos diferentes)
  const measureItem = (key, el) => {
    if (!el) return

    const updateHeight = () => {
      const height = el.offsetHeight
      if (height > 0 && heightsCache.get(key) !== height) {
        heightsCache.set(key, height)
      }
    }

    updateHeight()

    if (resizeObservers.has(key)) {
      resizeObservers.get(key).disconnect()
    }

    const ro = new ResizeObserver(updateHeight)
    ro.observe(el)
    resizeObservers.set(key, ro)
  }

  const unmeasureItem = (key) => {
    const ro = resizeObservers.get(key)
    if (ro) {
      ro.disconnect()
      resizeObservers.delete(key)
    }
  }

  let containerResizeObserver = null

  const updateViewportHeight = () => {
    viewportHeight.value = containerRef.value?.clientHeight || 0
  }

  onMounted(() => {
    const el = containerRef.value
    if (!el) return

    updateViewportHeight()
    scrollTop.value = el.scrollTop

    el.addEventListener('scroll', handleScroll, { passive: true })

    containerResizeObserver = new ResizeObserver(updateViewportHeight)
    containerResizeObserver.observe(el)
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (el) el.removeEventListener('scroll', handleScroll)
    if (rafId) cancelAnimationFrame(rafId)
    containerResizeObserver?.disconnect()
    resizeObservers.forEach(ro => ro.disconnect())
    resizeObservers.clear()
  })

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    viewportHeight,
    measureItem,
    unmeasureItem
  }
}