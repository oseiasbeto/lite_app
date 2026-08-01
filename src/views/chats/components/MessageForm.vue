<template>
  <div class="w-full bg-white dark:bg-[#0c1014] " :class="{ 'shadow-[0px_-1px_0px_rgba(0,0,0,.08)]': showShadow }">
    <reply-to-message-card v-if="replyTo?.show" :user-id="userId" :message="replyTo?.message"
      @on-close="closeReplyTo" />

    <!-- ===== UI DE GRAVAÇÃO (estilo Instagram) ===== -->
    <div v-if="isRecording || audioBlob" class="px-4 py-3.5 flex items-center gap-3">
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
          <audio ref="previewAudioRef" :src="audioUrl" preload="metadata" class="hidden" @play="onPreviewPlay"
            @pause="onPreviewPause" @timeupdate="onPreviewTimeUpdate" @loadedmetadata="onPreviewLoadedMetadata"
            @ended="onPreviewEnded"></audio>

          <button @click="togglePreviewPlay" type="button"
            class="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-[#0095f6] text-white active:scale-90 transition-transform">
            <svg v-if="!isPreviewPlaying" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="white">
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
    <form v-else @submit.prevent="send" class="px-4 py-3.5 flex items-center gap-2">

      <!-- Campo de texto em pill, com borda fina estilo Instagram, min-height 56px -->
      <div class="flex-1 flex items-center min-h-[50px] rounded-[25px]
                  bg-x-light-surface dark:bg-[rgb(36,39,44)] focus-within:border-[#a8a8a8] dark:focus-within:border-[#5a5a5a]
                  transition-colors pl-1.5 pr-1.5 py-1.5 min-w-0" :class="{ 'pl-3': replyTo?.show }">

        <!--
          Botão de câmara (estilo Instagram) — agora DENTRO da pill, antes do
          textarea, junto aos demais botões. flex-shrink-0 para nunca perder
          espaço para o textarea encolher.
        -->
        <button v-if="!replyTo?.show" @click.prevent="handleOpenCamera" type="button" :disabled="props.disabled" class="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full mr-1.5

                 text-[#f5f5f5] bg-black
                 active:scale-90 transition-all disabled:opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" width="22" height="22" viewBox="0 -2 28 28">
            <path
              d="m13.846 9.692c2.293.004 4.15 1.862 4.154 4.154v.004c0 2.294-1.86 4.154-4.154 4.154s-4.154-1.86-4.154-4.154c0-1.148.466-2.187 1.218-2.939.728-.753 1.747-1.22 2.876-1.22h.063-.003zm10.154-6h.055c1.002 0 1.908.414 2.554 1.081l.001.001c.668.647 1.082 1.553 1.082 2.555v.058-.003 12.924c-.001 2.039-1.653 3.691-3.692 3.692h-20.308c-2.039-.001-3.691-1.653-3.692-3.692v-12.923c0-.016 0-.036 0-.055 0-1.002.414-1.908 1.081-2.554l.001-.001c.647-.668 1.553-1.082 2.555-1.082h.058-.003 3.23l.735-1.962c.212-.507.557-.922.993-1.213l.01-.006c.411-.311.929-.501 1.49-.512h.002 7.385c.564.011 1.081.201 1.499.517l-.006-.005c.445.297.791.712.996 1.201l.007.018.735 1.962zm-10.154 16.616c.027 0 .059.001.091.001 1.755 0 3.341-.727 4.472-1.896l.002-.002c1.171-1.133 1.897-2.719 1.897-4.474 0-.032 0-.064-.001-.096v.005c0-.027.001-.06.001-.092 0-1.755-.727-3.341-1.896-4.472l-.002-.002c-1.167-1.172-2.781-1.897-4.565-1.897s-3.398.725-4.565 1.896c-1.171 1.133-1.897 2.719-1.897 4.474 0 .032 0 .064.001.096v-.005c0 .028-.001.061-.001.094 0 1.755.726 3.34 1.894 4.471l.002.002c1.133 1.171 2.719 1.897 4.474 1.897.033 0 .065 0 .097-.001h-.005z" />
          </svg>
        </button>

        <!--
          min-w-0 é o que realmente resolve a "quebra": um filho flex sem essa
          propriedade tenta manter a sua largura de conteúdo mínima (min-content),
          o que — com mais um botão a competir por espaço na mesma linha —
          empurrava o layout e fazia o textarea/pill quebrar ou distorcer.
          Com min-w-0, o textarea aceita encolher normalmente conforme os
          botões ao lado ocupam espaço.
        -->
        <textarea ref="textareaRef" v-model="inputMessage" @input="autoResize" @keydown.enter.shift.exact="allowNewLine"
          @focus="handleFocus" rows="1" :placeholder="replyTo?.show ? 'Responder' : 'Enviar mensagem...'" class="w-full min-w-0 caret-[#0095f6]
                resize-none text-[18px] overflow-hidden scroll-pt-4 bg-transparent
                 py-1.5
                  leading-tight
                 placeholder-[#8e8e8e]
                 dark:placeholder-[rgb(168,171,178)]
                 focus:outline-none text-[#262626] dark:text-[#f5f5f5]
                 whitespace-pre-wrap break-words
                 min-h-[24px]" style="line-height: 20px;" />

        <!-- Input de ficheiro escondido, usado pelo botão de mídia -->
        <input ref="mediaInputRef" type="file" accept="image/*" class="hidden" @change="onMediaFileChange" />

        <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="onCameraFileChange" />

        <!-- Botão de microfone (só aparece sem texto digitado), dentro do campo estilo Instagram -->
        <button v-if="!inputMessage.trim() && !replyTo?.show" @click.prevent="handleStartRecording" type="button" class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full
                 text-[#262626] dark:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#0c1014]
                 active:scale-90 transition-all">
          <svg aria-label="Clipe de voz" class="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24" role="img"
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

        <!-- Botão de mídia/imagem (só aparece sem texto digitado) -->
        <button v-if="!inputMessage.trim() && !replyTo?.show" @click.prevent="handleOpenMediaPicker" type="button"
          class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full
                 text-[#262626] dark:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#0c1014]
                 active:scale-90 transition-all">
          <svg aria-label="Adicionar foto ou vídeo" class="text-inherit" fill="currentColor" height="22" role="img"
            viewBox="0 0 24 24" width="24">
            <title>Adicionar foto ou vídeo</title>
            <path d="M6.549 5.013A1.557 1.557 0 1 0 8.106 6.57a1.557 1.557 0 0 0-1.557-1.557Z" fill-rule="evenodd">
            </path>
            <path
              d="m2 18.605 3.901-3.9a.908.908 0 0 1 1.284 0l2.807 2.806a.908.908 0 0 0 1.283 0l5.534-5.534a.908.908 0 0 1 1.283 0l3.905 3.905"
              fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path>
            <path
              d="M18.44 2.004A3.56 3.56 0 0 1 22 5.564h0v12.873a3.56 3.56 0 0 1-3.56 3.56H5.568a3.56 3.56 0 0 1-3.56-3.56V5.563a3.56 3.56 0 0 1 3.56-3.56Z"
              fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>

        <!-- Botão de GIF (só aparece sem texto digitado) -->
        <button v-if="!inputMessage.trim() && !replyTo?.show" @click.prevent="handleOpenGifPicker" type="button" class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full
                 text-[#262626] dark:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#0c1014]
                 active:scale-90 transition-all">
          <svg aria-label="Escolher um GIF ou uma figurinha" class="text-inherit" fill="currentColor" height="22"
            role="img" viewBox="0 0 24 24" width="22">
            <title>Escolher um GIF ou uma figurinha</title>
            <path
              d="M13.11 22H7.416A5.417 5.417 0 0 1 2 16.583V7.417A5.417 5.417 0 0 1 7.417 2h9.166A5.417 5.417 0 0 1 22 7.417v5.836a2.083 2.083 0 0 1-.626 1.488l-6.808 6.664A2.083 2.083 0 0 1 13.11 22Z"
              fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            <circle cx="8.238" cy="9.943" r="1.335"></circle>
            <circle cx="15.762" cy="9.943" r="1.335"></circle>
            <path d="M15.174 15.23a4.887 4.887 0 0 1-6.937-.301" fill="none" stroke="currentColor"
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            <path
              d="M22 10.833v1.629a1.25 1.25 0 0 1-1.25 1.25h-1.79a5.417 5.417 0 0 0-5.417 5.417v1.62a1.25 1.25 0 0 1-1.25 1.25H9.897"
              fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>




      </div>

      <!-- Botão enviar, estilo texto azul do Instagram -->
      <transition enter-active-class="transition ease-out duration-150" enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
        <button v-if="inputMessage.trim() || replyTo?.show" :disabled="!canSend" type="submit" class="h-10 px-1 flex items-center justify-center flex-shrink-0
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

const emit = defineEmits([
  'message-sent', 'typing-start', 'voice-message-sent', 'typing-stop',
  'close-reply-to', 'auto-resize', 'focus',
  'media-selected', 'open-gif-picker', 'open-camera'
])

const inputMessage = ref('')
const textareaRef = ref(null)


const canSend = computed(() => inputMessage.value.trim() && !props.disabled)

// ALTURA MÁXIMA = 4 LINHAS (≈ 98px com line-height 1.4 + padding)
const MAX_HEIGHT = 98

// Altura "de repouso" (campo vazio, 1 linha) — capturada UMA VEZ, na primeira
// medição real do textarea (ver autoResize). Guardá-la evita que, depois de
// escrever e apagar tudo, o campo volte para um valor de scrollHeight
// ligeiramente diferente do original (drift de arredondamento do browser
// entre reflows), o que fazia o input "crescer" uns pixels e distorcer o
// design quando estava só com o placeholder.
let restHeight = null

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

  const hasContent = !!inputMessage.value.trim()

  // Captura a altura de repouso (campo vazio) só na primeira vez que ela for
  // medida — normalmente logo no mount, com o textarea ainda vazio.
  if (!hasContent && restHeight === null) {
    restHeight = scrollHeight
  }

  // Sem conteúdo → usa SEMPRE o valor fixo capturado (restHeight), nunca uma
  // nova medição do scrollHeight. Isto garante que o campo volta exatamente
  // ao tamanho inicial ao apagar o texto, sem "crescer" uns pixels.
  const targetHeight = hasContent
    ? Math.min(scrollHeight, MAX_HEIGHT)
    : (restHeight ?? scrollHeight)

  el.style.height = `${targetHeight}px`
  el.style.overflowY = hasContent && scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden'

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
    el.play().catch(() => { })
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

// === NOVO: seleção de mídia (imagem) e gif ===
// Este componente NÃO valida o ficheiro (tipo/tamanho/quantidade) — apenas
// captura o File bruto escolhido pelo utilizador e emite para o componente pai,
// que é o responsável por toda a validação e pelo fluxo de envio.
const mediaInputRef = ref(null)
const cameraInputRef = ref(null)

const handleOpenMediaPicker = () => {
  if (props.disabled) return
  mediaInputRef.value?.click()
}

const onMediaFileChange = (e) => {
  const file = e.target.files?.[0] || null
  // Reseta o input para permitir selecionar o MESMO ficheiro outra vez no futuro
  e.target.value = ''
  if (!file) return
  emit('media-selected', file)
}

const handleOpenGifPicker = () => {
  if (props.disabled) return
  emit('open-gif-picker')
}

// === NOVO: botão de câmara (estilo Instagram) ===
// Apenas emite o evento para o componente pai — toda a lógica de abrir a
// câmara, capturar foto/vídeo e enviar fica por conta de quem escuta este
// evento (o Chat.vue, tal como já acontece com 'open-gif-picker').
const handleOpenCamera = () => {
  if (props.disabled) return
  cameraInputRef.value?.click()
}

const onCameraFileChange = (e) => {
  const file = e.target.files?.[0] || null
  e.target.value = ''
  if (!file) return
  // Reaproveita exatamente a mesma validação/upload que a galeria já usa
  emit('media-selected', file)
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