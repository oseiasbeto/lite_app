import { ref, computed, watch } from 'vue'

export function useReels(options = {}) {
  const {
    fetchPage = defaultMockFetchPage,
    pageSize = 6,
    feedType: initialFeedType = 'foryou',
    seedItem = null   // <-- 1. adicionado aqui
  } = options

  const items = ref(seedItem ? [seedItem] : [])   // <-- 2. injeta na criação
  const loading = ref(false)
  const hasMore = ref(true)
  const error = ref(null)
  const page = ref(0)
  const feedType = ref(initialFeedType)
  const fallback = ref(null)

  // 3. controla ids já presentes, pra não duplicar o seed quando a
  // API devolver o mesmo vídeo na paginação normal
  const seenIds = new Set(seedItem ? [seedItem.id] : [])

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    error.value = null
    try {
      const result = await fetchPage(page.value, pageSize, feedType.value)
      const rawItems = Array.isArray(result) ? result : result?.items || []

      console.log(result)
      const apiHasMore = Array.isArray(result) ? null : result?.hasMore
      const apiFallback = Array.isArray(result) ? null : result?.fallback

      if (apiFallback !== undefined) fallback.value = apiFallback

      // 4. filtra o que já está na lista (ex: o próprio seed)
      const newItems = rawItems.filter((it) => !seenIds.has(it.id))
      newItems.forEach((it) => seenIds.add(it.id))

      if (!rawItems.length) {
        hasMore.value = false
      } else {
        items.value = items.value.concat(newItems)
        page.value += 1
        hasMore.value = apiHasMore !== null ? !!apiHasMore : rawItems.length >= pageSize
      }
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  function setFeedType(type) {
    if (type === feedType.value) return
    feedType.value = type
    reset()
    loadMore()
  }

  function reset() {
    items.value = []
    seenIds.clear()   // <-- 5. limpa também o controle de ids
    page.value = 0
    hasMore.value = true
    fallback.value = null
    error.value = null
  }

  function findItem(idOrItem) {
    const id = typeof idOrItem === 'string' ? idOrItem : idOrItem.id
    return items.value.find((it) => it.id === id)
  }

  function toggleLike(idOrItem) {
    const item = findItem(idOrItem)
    if (!item) return
    item.liked = !item.liked
    item.stats.likes += item.liked ? 1 : -1
  }

  function toggleSave(idOrItem) {
    const item = findItem(idOrItem)
    if (!item) return
    item.saved = !item.saved
  }

  function toggleFollow(idOrItem) {
    const item = findItem(idOrItem)
    if (!item?.author) return
    item.author.isFollowing = !item.author.isFollowing
  }

  function incrementComments(idOrItem, by = 1) {
    const item = findItem(idOrItem)
    if (!item) return
    item.stats.comments += by
  }

  const isEmpty = computed(() => !loading.value && !items.value.length)

  return {
    items,
    loading,
    hasMore,
    error,
    fallback,
    feedType,
    isEmpty,
    loadMore,
    setFeedType,
    reset,
    toggleLike,
    toggleSave,
    toggleFollow,
    incrementComments
  }
}

// (SAMPLE_VIDEOS, SAMPLE_NAMES e defaultMockFetchPage continuam exatamente iguais)