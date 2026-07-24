<template>
  <div class="w-full bg-white dark:bg-[#0c1014] " :class="{ 'shadow-[0px_-1px_0px_rgba(0,0,0,.08)]': showShadow }">
    <reply-to-message-card v-if="replyTo?.show" :user-id="userId" :message="replyTo?.message"
      @on-close="closeReplyTo" />

    <!-- ===== UI DE GRAVAÇÃO (estilo Instagram) ===== -->
    <div v-if="isRecording || audioBlob" class="px-3 py-2.5 flex items-center gap-3">
      <button @click="handleCancelRecording" type="button"
        class="w-9 h-9 flex items-center justify-center rounded-full text-[#8e8e8e] hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] active:opacity-60 transition-colors flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>
      </button>

      <div
        class="flex-1 flex items-center gap-2.5 h-10 px-4 rounded-full border border-[#dbdbdb] dark:border-[#363636] bg-white dark:bg-[#000] min-w-0">

        <!-- ===== Estado: gravando ===== -->
        <template v-if="isRecording">
          <div class="w-2 h-2 rounded-full bg-[#ff3040] animate-pulse flex-shrink-0"></div>
          <span class="text-[13px] font-medium tabular-nums text-[#262626] dark:text-[#f5f5f5] flex-shrink-0">
            {{ formatTime(recordingTime) }}
          </span>
          <span class="text-[13px] text-[#8e8e8e] flex-shrink-0">/ {{ formatTime(maxDuration) }}</span>

          <!-- pseudo-waveform ao vivo enquanto grava -->
          <div class="flex-1 flex items-center gap-[3px] justify-center overflow-hidden">
            <span v-for="n in 18" :key="n" class="w-[2px] rounded-full animate-pulse bg-[#c7c7c7] dark:bg-[#4a4a4a]"
              :style="{ height: (6 + ((n * 37) % 14)) + 'px', animationDelay: (n * 0.05) + 's' }"></span>
          </div>
        </template>

        <!-- ===== Estado: preview do áudio gravado (player custom estilo Instagram) ===== -->
        <template v-else-if="audioUrl">
          <!-- elemento de áudio real, invisível, controlado via JS -->
          <audio ref="previewAudioRef" :src="audioUrl" preload="metadata" class="hidden"
            @play="onPreviewPlay" @pause="onPreviewPause" @timeupdate="onPreviewTimeUpdate"
            @loadedmetadata="onPreviewLoadedMetadata" @ended="onPreviewEnded"></audio>

          <button @click="togglePreviewPlay" type="button"
            class="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-[#0095f6] text-white active:scale-90 transition-transform">
            <svg v-if="!isPreviewPlaying" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>

          <!-- waveform clicável para navegar no áudio -->
          <div class="flex-1 flex items-center gap-[2px] h-7 min-w-0 cursor-pointer select-none"
            @click="seekPreviewFromClick">
            <span v-for="(h, n) in waveformBars" :key="n" class="flex-1 rounded-full transition-colors duration-75"
              :class="n <= activeBarIndex ? 'bg-[#0095f6]' : 'bg-[#c7c7c7] dark:bg-[#4a4a4a]'"
              :style="{ height: h + 'px' }"></span>
          </div>

          <span class="text-[12px] tabular-nums text-[#8e8e8e] flex-shrink-0">
            {{ formatTime(Math.floor(isPreviewPlaying || previewCurrentTime ? previewCurrentTime : previewDuration)) }}
          </span>
        </template>
      </div>

      <!-- Enquanto grava: botão de parar -->
      <button v-if="isRecording" @click="stopRecording" type="button"
        class="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#0095f6] text-white rounded-full active:scale-90 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>

      <!-- Depois de gravar: botão de enviar -->
      <button v-else @click="sendVoiceMessage" :disabled="isUploadingVoice" type="button"
        class="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#0095f6] disabled:opacity-40 text-white rounded-full active:scale-90 transition-transform">
        <SpinnerSmall v-if="isUploadingVoice" class="!w-4 !h-4" />
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M21.66,12a2,2,0,0,1-1.14,1.81L5.87,20.75A2.08,2.08,0,0,1,5,21a2,2,0,0,1-1.82-2.82L5.46,13H11a1,1,0,0,0,0-2H5.46L3.18,5.87A2,2,0,0,1,5.86,3.25h0l14.65,6.94A2,2,0,0,1,21.66,12Z"
            style="fill:#fff" />
        </svg>
      </button>
    </div>

    <!-- ===== FORM PADRÃO (estilo Instagram) ===== -->
    <form v-else @submit.prevent="send" class="px-3 py-2.5 flex items-center gap-2">

      <!-- Campo de texto em pill, com borda fina estilo Instagram, min-height 56px -->
      <div class="flex-1 flex items-center min-h-[50px] rounded-[25px]
                  bg-x-light-surface dark:bg-[rgb(36,39,44)] focus-within:border-[#a8a8a8] dark:focus-within:border-[#5a5a5a]
                  transition-colors pl-4 pr-1.5 py-1.5">
        <textarea ref="textareaRef" v-model="inputMessage" @input="autoResize" @keydown.enter.shift.exact="allowNewLine"
          @focus="handleFocus" rows="1" placeholder="Enviar mensagem..." class="w-full caret-[#0095f6]
                resize-none text-[20px] overflow-hidden scroll-pt-4 bg-transparent
                 py-1.5
                 leading-snug
                 placeholder-[#8e8e8e]
                 focus:outline-none text-[#262626] dark:text-[#f5f5f5]
                 whitespace-pre-wrap break-words
                 min-h-[24px]" style="line-height: 20px;" />

        <!-- Botão de microfone (só aparece sem texto digitado), dentro do campo estilo Instagram -->
        <button v-if="!inputMessage.trim()" @click.prevent="handleStartRecording" type="button"
          class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full
                 text-[#262626] dark:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a]
                 active:scale-90 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" stroke="currentColor" stroke-width="1.8" />
            <path d="M19 11a7 7 0 01-14 0M12 18v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- Botão enviar, estilo texto azul do Instagram -->
      <transition enter-active-class="transition ease-out duration-150" enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
        <button v-if="inputMessage.trim()" :disabled="!canSend" type="submit"
          class="h-10 px-1 flex items-center justify-center flex-shrink-0
                 text-[#0095f6] disabled:text-[#0095f6]/40 font-semibold text-[15px]
                 active:opacity-50 transition-opacity">
          Enviar
        </button>
      </transition>
    </form>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import ReplyToMessageCard from './ReplyToMessageCard.vue'
import { useAudioRecorder } from '@/composables/useAudioRecorder'
import { uploadVoiceMessage } from '@/services/cloudinary'
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  replyTo: Object,
  userId: String,
  showShadow: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['message-sent', 'typing-start', 'voice-message-sent', 'typing-stop', 'close-reply-to', 'auto-resize', 'focus'])

const inputMessage = ref('')
const textareaRef = ref(null)


const canSend = computed(() => inputMessage.value.trim() && !props.disabled)

// ALTURA MÁXIMA = 4 LINHAS (≈ 98px com line-height 1.4 + padding)
const MAX_HEIGHT = 98

const isTyping = ref(false)
let typingTimer = null
let startTypingDebounce = null // ← Novo timer para o debounce do start


const autoResize = () => {
  const el = textareaRef.value
  if (!el) return

  // Zera a altura e força um reflow síncrono ANTES de medir o scrollHeight.
  // Sem isso, quando o texto é apagado de uma só vez (ex: Ctrl+A + Delete),
  // alguns navegadores retornam o scrollHeight "preso" no valor anterior
  // (mais alto), fazendo o textarea ficar uma linha maior do que deveria.
  el.style.height = '0px'
  void el.offsetHeight // força o reflow
  const scrollHeight = el.scrollHeight

  emit('auto-resize')

  if (scrollHeight <= MAX_HEIGHT) {
    el.style.height = `${scrollHeight}px`
    el.style.overflowY = 'hidden'
  } else {
    el.style.height = `${MAX_HEIGHT}px`
    el.style.overflowY = 'auto'
  }

  // DEBOUNCE para iniciar digitação - espera 300ms antes de emitir
  clearTimeout(startTypingDebounce)
  startTypingDebounce = setTimeout(() => {
    // Se tem conteúdo E não está atualmente digitando → inicia digitação
    if (inputMessage.value.trim() && !isTyping.value) {
      isTyping.value = true
      emit('typing-start')
      logger.log('Iniciando digitação...')
    }
  }, 300) // Espera 300ms de inatividade antes de emitir typing-start

  // SEMPRE reseta o timer quando digita (isso evita parar após 1 minuto)
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    // Só para de digitar se estiver atualmente no estado de digitação
    if (isTyping.value) {
      isTyping.value = false
      emit('typing-stop')
      logger.log('Parando digitação (timeout)')
    }
    typingTimer = null
  }, 1000) // 1 segundo sem digitar
}

const allowNewLine = () => {
  nextTick(autoResize)
}

const clearInput = () => {
  inputMessage.value = ''
  nextTick(autoResize)
}

const closeReplyTo = () => {
  emit('close-reply-to')
}

const send = async () => {
  if (!canSend.value) return

  const content = inputMessage.value.trim()

  emit('message-sent', content)
  inputMessage.value = ''
  await nextTick()
  autoResize()
  textareaRef.value?.focus()
}
const handleFocus = () => {
  emit('focus')
}

// === NOVO: gravação de voz ===
const {
  isRecording,
  recordingTime,
  audioBlob,
  audioUrl,
  error,
  maxDuration,
  startRecording,
  stopRecording,
  cancelRecording,
  reset
} = useAudioRecorder()

const isUploadingVoice = ref(false)

// === Player customizado do preview de áudio (estilo Instagram) ===
const previewAudioRef = ref(null)
const isPreviewPlaying = ref(false)
const previewCurrentTime = ref(0)
const previewDuration = ref(0)
const WAVEFORM_BARS = 28
const waveformBars = ref([])

// Gera uma "onda" com alturas pseudo-aleatórias, porém estáveis (não recalcula a cada render)
const generateWaveform = () => {
  const bars = []
  for (let i = 0; i < WAVEFORM_BARS; i++) {
    const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453
    const frac = seed - Math.floor(seed)
    bars.push(Math.round(6 + frac * 20)) // altura entre 6px e 26px
  }
  waveformBars.value = bars
}

const activeBarIndex = computed(() => {
  if (!previewDuration.value) return -1
  const ratio = previewCurrentTime.value / previewDuration.value
  return Math.floor(ratio * WAVEFORM_BARS) - 1
})

const togglePreviewPlay = () => {
  const el = previewAudioRef.value
  if (!el) return
  if (isPreviewPlaying.value) {
    el.pause()
  } else {
    el.play().catch(() => {})
  }
}

const onPreviewPlay = () => {
  isPreviewPlaying.value = true
}

const onPreviewPause = () => {
  isPreviewPlaying.value = false
}

const onPreviewTimeUpdate = () => {
  const el = previewAudioRef.value
  if (!el) return
  previewCurrentTime.value = el.currentTime
}

const onPreviewEnded = () => {
  isPreviewPlaying.value = false
  previewCurrentTime.value = 0
  if (previewAudioRef.value) previewAudioRef.value.currentTime = 0
}

// Corrige bug conhecido do Chrome/MediaRecorder: blobs webm/opus reportam
// duration = Infinity até o áudio ser "buscado" uma vez até o fim.
const onPreviewLoadedMetadata = () => {
  const el = previewAudioRef.value
  if (!el) return

  if (el.duration === Infinity || Number.isNaN(el.duration)) {
    const onTimeUpdateOnce = () => {
      el.removeEventListener('timeupdate', onTimeUpdateOnce)
      el.currentTime = 0
      previewDuration.value = Number.isFinite(el.duration) ? el.duration : recordingTime.value
    }
    el.addEventListener('timeupdate', onTimeUpdateOnce)
    el.currentTime = 1e101
  } else {
    previewDuration.value = el.duration
  }
}

const seekPreviewFromClick = (event) => {
  const el = previewAudioRef.value
  if (!el || !previewDuration.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
  el.currentTime = ratio * previewDuration.value
  previewCurrentTime.value = el.currentTime
}

// Sempre que um novo áudio é gravado, prepara o player (waveform + estado zerado)
watch(audioBlob, (val) => {
  if (val) {
    generateWaveform()
    previewCurrentTime.value = 0
    previewDuration.value = 0
    isPreviewPlaying.value = false
  }
})

onUnmounted(() => {
  previewAudioRef.value?.pause()
})

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const handleStartRecording = () => {
  if (props.disabled) return
  startRecording()
}

const handleCancelRecording = () => {
  // Ainda gravando: aborta a gravação em andamento
  if (isRecording.value) {
    cancelRecording()
    return
  }
  // Já parou de gravar (tela de preview): descarta o áudio gravado
  if (previewAudioRef.value) {
    previewAudioRef.value.pause()
  }
  isPreviewPlaying.value = false
  previewCurrentTime.value = 0
  previewDuration.value = 0
  reset()
}

const sendVoiceMessage = async () => {
  if (!audioBlob.value || isUploadingVoice.value) return

  isUploadingVoice.value = true
  try {
    const { url, duration } = await uploadVoiceMessage(audioBlob.value)
    emit('voice-message-sent', { url, duration: duration || recordingTime.value })
    reset()
  } catch (err) {
    logger.error?.(err)
    error.value = 'Falha ao enviar áudio'
  } finally {
    isUploadingVoice.value = false
  }
}

// Expõe as funções pro componente pai
defineExpose({
  clearInput,
  focus: () => textareaRef.value?.focus(), // foco normal (abre teclado)
  blur: () => textareaRef.value?.blur()
})

watch(inputMessage, () => nextTick(autoResize))
onMounted(() => nextTick(autoResize))
</script>