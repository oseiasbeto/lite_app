// src/composables/useAudioRecorder.js
import { ref, onUnmounted } from 'vue'

const MAX_DURATION = 60 // segundos

export function useAudioRecorder() {
  const isRecording = ref(false)
  const recordingTime = ref(0)
  const audioBlob = ref(null)
  const audioUrl = ref(null)
  const error = ref(null)

  let mediaRecorder = null
  let chunks = []
  let stream = null
  let timer = null
  let isCancelled = false // ← flag que evita o onstop "ressuscitar" o áudio após o cancelamento

  const startRecording = async () => {
    try {
      error.value = null
      isCancelled = false
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      mediaRecorder = new MediaRecorder(stream, { mimeType })
      chunks = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        // Se foi cancelado, o stop() é apenas para liberar o mediaRecorder/stream —
        // não deve gerar blob nem URL (senão o áudio "reaparece" depois do X).
        if (isCancelled) {
          isCancelled = false
          return
        }
        audioBlob.value = new Blob(chunks, { type: mimeType })
        audioUrl.value = URL.createObjectURL(audioBlob.value)
        stream?.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      isRecording.value = true
      recordingTime.value = 0

      timer = setInterval(() => {
        recordingTime.value++
        if (recordingTime.value >= MAX_DURATION) {
          stopRecording()
        }
      }, 1000)
    } catch (err) {
      error.value = 'Permissão de microfone negada ou indisponível'
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return
    mediaRecorder.stop()
    isRecording.value = false
    clearInterval(timer)
  }

  const cancelRecording = () => {
    isCancelled = true

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    stream?.getTracks().forEach(t => t.stop())
    clearInterval(timer)

    isRecording.value = false
    recordingTime.value = 0
    chunks = []
    audioBlob.value = null
    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }

  const reset = () => {
    audioBlob.value = null
    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
    recordingTime.value = 0
  }

  onUnmounted(() => {
    clearInterval(timer)
    stream?.getTracks().forEach(t => t.stop())
  })

  return {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    maxDuration: MAX_DURATION,
    startRecording,
    stopRecording,
    cancelRecording,
    reset
  }
}