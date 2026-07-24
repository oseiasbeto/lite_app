<template>
  <div class="w-full bg-white dark:bg-transparent" :class="{ 'shadow-[0px_0px_10px_rgba(0,0,0,.10)]': showShadow }">
    <reply-to-message-card v-if="replyTo?.show" :user-id="userId" :message="replyTo?.message"
      @on-close="closeReplyTo" />
    <!-- ===== UI DE GRAVAÇÃO (substitui o form quando gravando) ===== -->
    <div v-if="isRecording || audioBlob" class="px-4 py-2 pb-1 flex items-center gap-3">
      <button @click="handleCancelRecording" type="button" class="p-2 text-red-500 active:opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>

      <div class="flex-1 flex items-center gap-2">
        <div v-if="isRecording" class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
        <span class="text-sm font-medium dark:text-white text-[rgb(40,40,41)]">
          {{ formatTime(recordingTime) }} / {{ formatTime(maxDuration) }}
        </span>

        <!-- preview de áudio gravado, antes de enviar -->
        <audio v-if="!isRecording && audioUrl" :src="audioUrl" controls class="h-8 flex-1"></audio>
      </div>

      <!-- Enquanto grava: botão de parar -->
      <button v-if="isRecording" @click="stopRecording" type="button"
        class="p-2.5 bg-[#287dff] text-white rounded-full active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>

      <!-- Depois de gravar: botão de enviar -->
      <button v-else @click="sendVoiceMessage" :disabled="isUploadingVoice" type="button"
        class="p-2.5 bg-[#287dff] disabled:opacity-50 text-white rounded-full active:scale-95">
        <SpinnerSmall v-if="isUploadingVoice" class="!w-4 !h-4" />
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M21.66,12a2,2,0,0,1-1.14,1.81L5.87,20.75A2.08,2.08,0,0,1,5,21a2,2,0,0,1-1.82-2.82L5.46,13H11a1,1,0,0,0,0-2H5.46L3.18,5.87A2,2,0,0,1,5.86,3.25h0l14.65,6.94A2,2,0,0,1,21.66,12Z"
            style="fill:#fff" />
        </svg>
      </button>
    </div>
    <form v-else @submit.prevent="send" class="px-4 py-2 pb-1 flex items-center gap-3">

      <!-- Textarea compacto e lindo -->
      <div class="flex-1">
        <textarea ref="textareaRef" v-model="inputMessage" @input="autoResize" @keydown.enter.shift.exact="allowNewLine"
          @focus="handleFocus" rows="1" placeholder="Mensagem..." class="w-full caret-secondary 
                resize-none text-base overflow-hidden scroll-pt-4
                 px-4 py-2.5 dark:bg-[#202020] bg-[#f7f7f8]
                 leading-snug
                 dark:placeholder-[#949494] 
                 placeholder-[#949494]
                 rounded-[25px] placeholder-dark-text-secondary/70
                 focus:outline-none dark:text-white text-[rgb(40,40,41)]
                 whitespace-pre-wrap break-words
                 min-h-[30px]" style="line-height: 20px;" />
      </div>

      <!-- Botão de microfone (só aparece sem texto digitado) -->
      <button v-if="!inputMessage.trim()" @click.prevent="handleStartRecording" type="button"
        class="p-2 text-secondary flex-shrink-0 active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" stroke="currentColor" stroke-width="1.8" />
          <path d="M19 11a7 7 0 01-14 0M12 18v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>


      <!-- Botão enviar -->
      <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
        <button :disabled="!canSend" type="submit" class="p-1.5 bg-x-light-blue disabled:opacity-50
                 text-white rounded-full flex-shrink-0
                 transition-all duration-200 mb-1 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" id="send"
            class="icon glyph">
            <path
              d="M21.66,12a2,2,0,0,1-1.14,1.81L5.87,20.75A2.08,2.08,0,0,1,5,21a2,2,0,0,1-1.82-2.82L5.46,13H11a1,1,0,0,0,0-2H5.46L3.18,5.87A2,2,0,0,1,5.86,3.25h0l14.65,6.94A2,2,0,0,1,21.66,12Z"
              style="fill:#fff" />
          </svg>
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

  el.style.height = 'auto'
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
  cancelRecording()
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