// src/services/cloudinary.js
import axios from 'axios'

const CLOUD_NAME = 'daujoblcc' //import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = 'social_media_upload' //import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadVoiceMessage = async (audioBlob, onProgress) => {
  const formData = new FormData()
  formData.append('file', audioBlob, 'voice-message.webm')
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('resource_type', 'video') // áudio usa o endpoint "video" no Cloudinary

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
    formData,
    {
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      }
    }
  )

  return {
    url: data.secure_url,
    duration: Math.round(data.duration || 0)
  }
}