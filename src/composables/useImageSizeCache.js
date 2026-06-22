// Cache global que sobrevive a remounts
function getGlobalImageCache() {
  if (!window.__imgSizeCache) window.__imgSizeCache = new Map()
  return window.__imgSizeCache
}

export function useImageSizeCache() {
  const cache = getGlobalImageCache()

  const isCached = (url) => cache.has(url)

  const getSize = (url) => {
    if (!cache.has(url)) return {}
    const { w, h } = cache.get(url)
    return { aspectRatio: `${w} / ${h}` }
  }

  const onLoaded = (url, event) => {
    if (cache.has(url)) return          // já temos — não re-mede
    const img = event.target
    if (img.naturalWidth && img.naturalHeight) {
      cache.set(url, { w: img.naturalWidth, h: img.naturalHeight })
    }
  }

  return { getSize, onLoaded, isCached }
}