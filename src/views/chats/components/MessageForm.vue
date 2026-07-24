<template>
  <div class="w-full bg-white dark:bg-black" :class="{ 'shadow-[0px_-1px_0px_rgba(0,0,0,.08)]': showShadow }">
    <reply-to-message-card v-if="replyTo?.show" :user-id="userId" :message="replyTo?.message"
      @on-close="closeReplyTo" />

    <!-- ===== UI DE GRAVAÇÃO (estilo Instagram) ===== -->
    <div v-if="isRecording || audioBlob" class="px-3 py-2.5 flex items-center gap-3">
      <button @click="handleCancelRecording" type="button"
        class="w-9 h-9 flex items-center justify-center rounded-full text-[#8e8e8e] hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] active:opacity-60 transition-colors flex-shrink-0">
        <svg aria-label="Clipe de voz" class="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24" role="img"
          viewBox="0 0 24 24" width="24">
          <title>Clipe de voz</title>
          <path d="M19.5 10.671v.897a7.5 7.5 0 0 1-15 0v-.897" fill="none" stroke="currentColor" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="2"></path>
          <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="19.068"
            y2="22"></line>
          <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            x1="8.706" x2="15.104" y1="22" y2="22"></line>
          <path d="M12 15.745a4 4 0 0 1-4-4V6a4 4 0 0 1 8 0v5.745a4 4 0 0 1-4 4Z" fill="none" stroke="currentColor"
            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
      </button>

      <div
        class="flex-1 flex items-center gap-2.5 h-10 px-4 rounded-full border border-[#dbdbdb] dark:border-[#363636] bg-white dark:bg-[#000]">
        <div v-if="isRecording" class="w-2 h-2 rounded-full bg-[#ff3040] animate-pulse flex-shrink-0"></div>
        <span class="text-[13px] font-medium tabular-nums text-[#262626] dark:text-[#f5f5f5] flex-shrink-0">
          {{ formatTime(recordingTime) }}
        </span>
        <span class="text-[13px] text-[#8e8e8e] flex-shrink-0">/ {{ formatTime(maxDuration) }}</span>

        <!-- pseudo-waveform enquanto grava -->
        <div v-if="isRecording" class="flex-1 flex items-center gap-[3px] justify-center overflow-hidden">
          <span v-for="n in 18" :key="n" class="w-[2px] rounded-full animate-pulse bg-[#c7c7c7] dark:bg-[#4a4a4a]"
            :style="{ height: (6 + ((n * 37) % 14)) + 'px', animationDelay: (n * 0.05) + 's' }"></span>
        </div>

        <!-- preview de áudio gravado, antes de enviar -->
        <audio v-if="!isRecording && audioUrl" :src="audioUrl" controls class="h-8 flex-1 min-w-0"></audio>
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
    <form v-else @submit.prevent="send" class="px-3 py-2.5 flex items-end gap-2">

      <!-- Campo de texto em pill, com borda fina estilo Instagram -->
      <div class="flex-1 flex items-end min-h-[40px] rounded-[22px] border border-[#dbdbdb] dark:border-[#363636]
                  bg-white dark:bg-[#000] focus-within:border-[#a8a8a8] dark:focus-within:border-[#5a5a5a]
                  transition-colors pl-4 pr-1.5 py-1">
        <textarea ref="textareaRef" v-model="inputMessage" @input="autoResize" @keydown.enter.shift.exact="allowNewLine"
          @focus="handleFocus" rows="1" placeholder="Enviar mensagem..." class="w-full caret-[#0095f6]
                resize-none text-[15px] overflow-hidden scroll-pt-4 bg-transparent
                 py-1.5
                 leading-snug
                 placeholder-[#8e8e8e]
                 focus:outline-none text-[#262626] dark:text-[#f5f5f5]
                 whitespace-pre-wrap break-words
                 min-h-[24px]" style="line-height: 20px;" />

        <!-- Botão de microfone (só aparece sem texto digitado), dentro do campo estilo Instagram -->
        <button v-if="!inputMessage.trim()" @click.prevent="handleStartRecording" type="button" class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full
                 text-[#262626] dark:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a]
                 active:scale-90 transition-all">
          <svg aria-label="Clipe de voz" class="w-[20px] h-[20px]" fill="currentColor" height="24" role="img"
            viewBox="0 0 24 24" width="24">
            <title>Clipe de voz</title>
            <path d="M19.5 10.671v.897a7.5 7.5 0 0 1-15 0v-.897" fill="none" stroke="currentColor"
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="19.068"
              y2="22"></line>
            <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              x1="8.706" x2="15.104" y1="22" y2="22"></line>
            <path d="M12 15.745a4 4 0 0 1-4-4V6a4 4 0 0 1 8 0v5.745a4 4 0 0 1-4 4Z" fill="none" stroke="currentColor"
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>
      </div>

      <!-- Botão enviar, estilo texto azul do Instagram -->
      <transition enter-active-class="transition ease-out duration-150" enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
        <button v-if="inputMessage.trim()" :disabled="!canSend" type="submit" class="h-10 px-1 flex items-center justify-center flex-shrink-0
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