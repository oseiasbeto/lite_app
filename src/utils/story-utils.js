// utils/storyUtils.js

// Mesmas chaves do enum Story.BACKGROUNDS no backend
export const STORY_BACKGROUNDS = {
  sunset: 'linear-gradient(160deg, #ff512f 0%, #dd2476 100%)',
  ocean: 'linear-gradient(160deg, #2193b0 0%, #6dd5ed 100%)',
  grape: 'linear-gradient(160deg, #654ea3 0%, #eaafc8 100%)',
  forest: 'linear-gradient(160deg, #134e5e 0%, #71b280 100%)',
  fire: 'linear-gradient(160deg, #f12711 0%, #f5af19 100%)',
  night: 'linear-gradient(160deg, #0f2027 0%, #2c5364 100%)',
  candy: 'linear-gradient(160deg, #ee9ca7 0%, #ffdde1 100%)',
  mono: 'linear-gradient(160deg, #1a1a1a 0%, #3a3a3a 100%)',
}

export const STORY_PHOTO_DURATION = 5000 // ms
export const STORY_MAX_VIDEO_SECONDS = 60
export const STORY_MAX_VIDEO_BYTES = 100 * 1024 * 1024
export const STORY_MAX_PHOTO_BYTES = 20 * 1024 * 1024

export const STORY_QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👏']

// Duração de exibição (ms) para stories que não são vídeo
export const getStoryDuration = (story) => {
  if (story?.media_type === 'text') {
    const len = story.text_content?.length || 0
    return Math.min(9000, 4000 + len * 40)
  }
  return STORY_PHOTO_DURATION
}

export const timeAgo = (date) => {
  if (!date) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (seconds < 60) return 'agora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} d`
}

// Reduz fotos antes do upload (economiza dados móveis e acelera a publicação)
export const compressImage = async (file, { maxWidth = 1080, maxHeight = 1920, quality = 0.85 } = {}) => {
  if (file.type === 'image/gif') {
    return { file, width: null, height: null }
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    bitmap = await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const srcW = bitmap.width || bitmap.naturalWidth
  const srcH = bitmap.height || bitmap.naturalHeight
  const ratio = Math.min(1, maxWidth / srcW, maxHeight / srcH)
  const width = Math.round(srcW * ratio)
  const height = Math.round(srcH * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) return { file, width: srcW, height: srcH }

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return { file: new File([blob], name, { type: 'image/jpeg' }), width, height }
}

// Lê duração e dimensões de um vídeo sem enviá-lo
export const readVideoMeta = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const meta = { duration: video.duration, width: video.videoWidth, height: video.videoHeight }
      URL.revokeObjectURL(url)
      resolve(meta)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler o vídeo'))
    }
    video.src = url
  })