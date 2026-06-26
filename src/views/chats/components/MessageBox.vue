<template>
  <div v-if="!isDeletedForMe" :id="`message-${props.message._id}`" class="relative over" :class="wrapperSpacingClass">

    <!-- Separador de data/hora estilo Messenger -->
    <div v-if="showDateSeparator" class="flex justify-center my-3">
      <span class="text-[11px] font-medium text-grey dark:text-greyDark px-3">
        {{ dateSeparatorText }}
      </span>
    </div>

    <!-- Player de áudio -->
    <div v-if="message.message_type === 'voice' && message.status !== 'is_deleted'"
      class="flex items-center gap-2 min-w-[180px] py-1 px-4">
      <button @click="toggleAudio" type="button"
        class="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
        :class="isSent ? 'bg-white/20' : 'bg-black/10 dark:bg-white/15'">
        <svg v-if="!isPlaying" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </svg>
      </button>

      <div class="flex-1 flex items-center gap-2">
        <input type="range" min="0" :max="audioDuration || 1" step="0.1" v-model.number="audioCurrentTime"
          @input="seekAudio" class="flex-1 h-1 accent-current" />
        <span class="text-xs opacity-80 w-9 text-right">{{ formatAudioTime(isPlaying ? audioCurrentTime : audioDuration)
          }}</span>
      </div>

      <audio ref="audioRef" :src="message.file_url" preload="metadata" @loadedmetadata="onAudioLoaded"
        @timeupdate="onAudioTimeUpdate" @ended="onAudioEnded"></audio>
    </div>

    <!--
      ── Swipe-to-reply wrapper ──────────────────────────────────────────────
      Envolve apenas a linha do balão (avatar + bubble).
      translateX é aplicado ao conteúdo; o ícone de resposta aparece do lado oposto.
    -->
    <div
      class="swipe-row relative overflow-visible"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Ícone de reply (estilo Messenger), fixo, surge por detrás do balão conforme o swipe -->
      <div
        class="absolute inset-y-0 flex items-center pointer-events-none z-0"
        :class="isSent ? 'right-2' : 'left-2'"
        :style="{ opacity: replyIconOpacity, transform: `scale(${replyIconScale})` }"
      >
        <div class="w-8 h-8 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" class="text-grey dark:text-greyDark" aria-hidden="true">
            <path
              d="M6.497 1.035C7.593-.088 9.5.688 9.5 2.257V4.54c1.923.215 3.49 1.246 4.593 2.672C15.328 8.808 16 10.91 16 13v.305c0 .632-.465 1.017-.893 1.127-.422.11-.99.005-1.318-.493-.59-.894-1.2-1.482-1.951-1.859-.611-.307-1.359-.496-2.338-.558v2.23c0 1.57-1.908 2.346-3.003 1.222L.893 9.223a1.75 1.75 0 0 1 .001-2.444l5.603-5.744z">
            </path>
          </svg>
        </div>
      </div>

      <!-- Conteúdo deslocado pelo swipe -->
      <div
        class="swipe-content relative z-10 px-4"
        :style="{ transform: `translateX(${swipeOffset}px)`, transition: isSwipeActive ? 'none' : 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)' }"
      >
        <div class="flex items-end" :class="isSent ? 'justify-end' : 'justify-start'">
          <!-- Avatar: só no último balão do grupo recebido -->
          <div class="flex flex-col justify-end w-6 flex-shrink-0 mb-[1px]" v-if="!isSent && !isEmojiOnly">
            <Avatar class="w-[28px] h-[28px]" v-if="isLastOfGroup" size="xl"
              :url="message?.sender?.profile_image?.thumbnails?.xs || message?.sender?.profile_image?.url" />
          </div>

          <div :class="[
            'flex flex-col relative max-w-[75%] min-w-0',
            isSent ? 'items-end ml-0' : 'items-start ml-2'
          ]">

            <!-- Bloco de resposta -->
            <div v-if="message.reply_to && !isEmojiOnly && message.status !== 'is_deleted'" class="w-full min-w-0 relative"
              style="margin-bottom: -10px;">
              <span class="flex items-center w-full text-[12px] mb-1 font-normal text-grey dark:text-greyDark"
                :class="isSent ? 'justify-end' : 'justify-start'">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true"
                  class="mr-1 flex-shrink-0">
                  <path
                    d="M6.497 1.035C7.593-.088 9.5.688 9.5 2.257V4.54c1.923.215 3.49 1.246 4.593 2.672C15.328 8.808 16 10.91 16 13v.305c0 .632-.465 1.017-.893 1.127-.422.11-.99.005-1.318-.493-.59-.894-1.2-1.482-1.951-1.859-.611-.307-1.359-.496-2.338-.558v2.23c0 1.57-1.908 2.346-3.003 1.222L.893 9.223a1.75 1.75 0 0 1 .001-2.444l5.603-5.744z">
                  </path>
                </svg>
                <span class="truncate">{{ replyLabel }}</span>
              </span>
              <button type="button" @click="scrollToReply" :class="[
                'block max-w-full min-w-0 text-left rounded-[16px] px-3 py-[10px] text-[13px] leading-tight cursor-pointer transition-opacity opacity-90 hover:opacity-100',
                isSent ? 'ml-auto bg-[#287dff]/40' : 'bg-[#e4e6eb] dark:bg-[#4a4a4a]'
              ]" :style="isSent ? 'border-radius: 16px 16px 4px 16px;' : 'border-radius: 16px 16px 16px 4px;'">
                <span class="block truncate opacity-90"
                  :class="isSent ? 'text-white' : 'text-[rgb(40,40,41)] dark:text-white'">
                  {{ replyPreviewText }}
                </span>
              </button>
            </div>

            <!-- Balão principal -->
            <button type="button" @contextmenu.prevent="handleMoreOption(message)"
              :style="!isEmojiOnly && message.status !== 'is_deleted' ? bubbleRadiusStyle : {}" :class="[
                'relative z-[1] text-left transition-transform active:scale-[0.99] max-w-full min-w-0',
                !isEmojiOnly && message.status !== 'is_deleted'
                  ? (isSent
                    ? 'bg-[#287dff] text-white p-[6px_12px]'
                    : 'dark:bg-[#3c3c3c] dark:text-white text-[rgb(40,40,41)] bg-[#f1f2f2] p-[6px_12px]')
                  : '',
                message.status === 'is_deleted'
                  ? 'border border-[#b0b3b8] dark:border-[#555] rounded-[18px] px-3 py-[6px] bg-transparent italic opacity-80'
                  : '',
                isEmojiOnly ? '!bg-transparent m-0 p-0' : '',
                isEmojiOnly && groupedReactions.length ? 'mb-3' : '',
                message.status === 'sending' ? 'pointer-events-none' : '',
                isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-1' : '',
              ]">

              <!-- Mensagem eliminada -->
              <p v-if="message.status === 'is_deleted'" class="text-[13px] text-grey dark:text-greyDark">
                Mensagem eliminada
              </p>

              <!-- Conteúdo normal -->
              <p v-else :class="[
                'break-words [overflow-wrap:anywhere] whitespace-pre-wrap leading-snug min-w-0',
                isEmojiOnly ? 'text-5xl' : 'text-base',
                isEmojiOnly && !isSent ? 'ml-6' : 'ml-0'
              ]">
                {{ message.content }}
              </p>

              <!-- Reações sobrepostas no canto inferior do balão -->
              <div v-if="groupedReactions.length && message.status !== 'is_deleted'"
                class="absolute z-[99] flex items-center bg-white dark:bg-[#2c2c2c] border border-black/5 dark:border-white/10 rounded-full"
                :class="[
                  isSent ? 'right-1' : 'left-1',
                  '-bottom-3',
                  isEmojiOnly ? 'ml-6' : 'ml-0',
                  groupedReactions.length === 1 ? 'w-5 h-5 justify-center p-0' : 'gap-[2px] px-[5px] py-[2px]'
                ]">
                <span v-for="r in groupedReactions" :key="r.emoji" class="leading-none flex items-center gap-[1px]"
                  :class="groupedReactions.length === 1 ? 'text-[12px]' : 'text-[13px]'">
                  <img v-if="getEmojiImage(r.emoji)" :src="'/img/emojis/' + getEmojiImage(r.emoji)" :alt="r.emoji"
                    class="w-[14px] h-[14px] object-contain" />
                  <span v-else>{{ r.emoji }}</span>
                  <span v-if="r.count > 1" class="text-[10px] text-grey dark:text-greyDark font-medium">{{ r.count }}</span>
                </span>
              </div>
            </button>

            <!-- Indicador "A enviar..." (estilo Messenger), por baixo do balão -->
            <span v-if="message.status === 'sending'"
              class="text-[11px] text-grey dark:text-greyDark mt-[2px] px-1">
              A enviar...
            </span>

            <!-- Indicador "Entregue" / "Lido" na última mensagem enviada (estilo Messenger) -->
            <span v-else-if="isSent && isLastSentMessage && !isReadByOther"
              class="text-[11px] text-grey dark:text-greyDark mt-[2px] px-1">
              <p> {{ message.status === 'delivered' ? 'Entregue' : 'Erro' }}</p>
            </span>
          </div>
        </div>
      </div><!-- /swipe-content -->
    </div><!-- /swipe-row -->

  </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'
import { computed, ref, nextTick } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
  userId: { type: String, required: true },
  chatReadBy: {type: Array, default: []},
  previousMessage: { type: Object, default: null },
  nextMessage: { type: Object, default: null }
})

const emit = defineEmits(['more-option', 'scroll-to-reply', 'reply-swipe'])

const isSent = computed(() => props.message.sender._id === props.userId)
const isDeletedForMe = computed(() => props.message?.deleted_for?.includes(props.userId) || false)

const isEmojiOnly = computed(() => {
  const content = props.message.content?.trim()
  if (!content || /^\d+$/.test(content)) return false
  if (/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?~ ]+$/.test(content)) return false
  const emojiRegex = /^(?:[\p{Emoji}\u200d\uFE0F]+)+$/gu
  if (!emojiRegex.test(content)) return false
  const count = (content.match(/[\p{Emoji}]/gu) || []).length
  return count >= 1 && count <= 3
})

// ── Agrupamento ──────────────────────────────────────────────────────────────
const GROUP_WINDOW_MS = 60 * 1000

const sameSender = (a, b) => a && b && a.sender?._id === b.sender?._id
const diffMs = (a, b) => (!a || !b) ? Infinity : Math.abs(new Date(b.created_at) - new Date(a.created_at))

const isMessageEmojiOnly = (msg) => {
  const content = msg?.content?.trim()
  if (!content || /^\d+$/.test(content)) return false
  if (/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?~ ]+$/.test(content)) return false
  const emojiRegex = /^(?:[\p{Emoji}\u200d\uFE0F]+)+$/gu
  if (!emojiRegex.test(content)) return false
  const count = (content.match(/[\p{Emoji}]/gu) || []).length
  return count >= 1 && count <= 3
}

const isMessageDeletedForMe = (msg) => !!(msg?.deleted_for?.includes(props.userId))
const isMessageDeletedForEveryone = (msg) => msg?.status === 'is_deleted'

const breaksGrouping = (msg) =>
  !msg ||
  isMessageEmojiOnly(msg) ||
  isMessageDeletedForEveryone(msg) ||
  isMessageDeletedForMe(msg)

const isGroupedWithPrevious = computed(() =>
  !!props.previousMessage &&
  !breaksGrouping(props.previousMessage) &&
  !breaksGrouping(props.message) &&
  sameSender(props.previousMessage, props.message) &&
  diffMs(props.previousMessage, props.message) <= GROUP_WINDOW_MS
)

const isGroupedWithNext = computed(() =>
  !!props.nextMessage &&
  !breaksGrouping(props.message) &&
  !breaksGrouping(props.nextMessage) &&
  sameSender(props.message, props.nextMessage) &&
  diffMs(props.message, props.nextMessage) <= GROUP_WINDOW_MS
)

const isLastOfGroup = computed(() => !isGroupedWithNext.value)

// É a última mensagem enviada por mim na conversa → mostra "Entregue" (estilo Messenger)
const isLastSentMessage = computed(() =>
  isSent.value &&
  !props.nextMessage &&
  props.message.status !== 'is_deleted'
)

// Verifica se alguém, além de mim, já leu a mensagem (read_by vindo do backend/socket)
const isReadByOther = computed(() =>
  (props.chatReadBy || []).some(r => {
    const readerId = r?.user?._id || r?.user || r?._id
    return readerId && readerId !== props.userId
  })
)

const previousHasReactions = computed(() =>
  !!(props.previousMessage?.reactions?.length)
)

const wrapperSpacingClass = computed(() => {
  if (!isGroupedWithPrevious.value) return 'mt-[10px]'
  return previousHasReactions.value ? 'mt-[18px]' : 'mt-[2px]'
})

// ── Cantos do balão ──────────────────────────────────────────────────────────
const RADIUS_FULL = '18px'
const RADIUS_TIGHT = '4px'

const bubbleRadiusStyle = computed(() => {
  const withPrev = isGroupedWithPrevious.value && !props.message.reply_to
  const withNext = isGroupedWithNext.value

  if (isSent.value) {
    return {
      borderTopLeftRadius: RADIUS_FULL,
      borderBottomLeftRadius: RADIUS_FULL,
      borderTopRightRadius: withPrev ? RADIUS_TIGHT : RADIUS_FULL,
      borderBottomRightRadius: withNext ? RADIUS_TIGHT : RADIUS_FULL,
    }
  }
  return {
    borderTopRightRadius: RADIUS_FULL,
    borderBottomRightRadius: RADIUS_FULL,
    borderTopLeftRadius: withPrev ? RADIUS_TIGHT : RADIUS_FULL,
    borderBottomLeftRadius: withNext ? RADIUS_TIGHT : RADIUS_FULL,
  }
})

// ── Separador de data/hora ───────────────────────────────────────────────────
const SEPARATOR_GAP_MS = 30 * 60 * 1000

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate()

const showDateSeparator = computed(() => {
  if (!props.previousMessage) return true
  const cur = new Date(props.message.created_at)
  const prev = new Date(props.previousMessage.created_at)
  if (!isSameDay(cur, prev)) return true
  return diffMs(props.previousMessage, props.message) > SEPARATOR_GAP_MS
})

const dateSeparatorText = computed(() => {
  const date = new Date(props.message.created_at)
  const now = new Date()
  const hh = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)

  if (isSameDay(date, now)) return `Hoje, ${hh}:${mm}`
  if (isSameDay(date, yesterday)) return `Ontem, ${hh}:${mm}`

  const sameYear = date.getFullYear() === now.getFullYear()
  const base = `${date.getDate()} de ${meses[date.getMonth()]}${sameYear ? '' : ' de ' + date.getFullYear()}`
  return `${base}, ${hh}:${mm}`
})

// ── Contexto / ações ─────────────────────────────────────────────────────────
const handleMoreOption = (msg) => {
  if (msg.status === 'sending' || msg.status === 'is_deleted') return
  emit('more-option', msg)
}

const getFirstName = (fullName) => (fullName || '').trim().split(/\s+/)[0]

const replyLabel = computed(() => {
  if (!props.message.reply_to) return ''
  const repliedSender = props.message.reply_to.sender || {}
  const repliedIsMe = repliedSender._id === props.userId
  const repliedFirst = getFirstName(repliedSender.name || repliedSender.username || 'Alguém')

  if (isSent.value) {
    return repliedIsMe ? 'Respondeste a ti mesmo' : `Respondeste a ${repliedFirst}`
  }
  const senderFirst = getFirstName(props.message.sender?.name || props.message.sender?.username || 'Alguém')
  return repliedIsMe ? `${senderFirst} respondeu a si` : `${senderFirst} respondeu a ${repliedFirst}`
})

const replyPreviewText = computed(() => {
  const text = props.message.reply_to?.content?.trim() || ''
  return text.length > 90 ? text.substring(0, 87) + '...' : text
})

// ── Reações ──────────────────────────────────────────────────────────────────
const getEmojiImage = (emoji) => ({
  '❤️': 'heart.png',
  '👍': 'like.png',
  '😡': 'angry.png',
  '😮': 'wow.png',
  '😆': 'haha.png',
  '😢': 'sad.png',
}[emoji] || null)

const groupedReactions = computed(() => {
  if (!props.message.reactions?.length) return []
  const map = new Map()
  props.message.reactions.forEach(r => {
    if (!map.has(r.emoji)) map.set(r.emoji, { emoji: r.emoji, count: 0 })
    map.get(r.emoji).count++
  })
  return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6)
})

// ── Scroll para mensagem respondida ─────────────────────────────────────────
const isHighlighted = ref(false)

const scrollToReply = () => {
  const replyId = props.message.reply_to?._id
  if (!replyId) return
  emit('scroll-to-reply', replyId)
  nextTick(() => {
    const target = document.getElementById(`message-${replyId}`)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.dispatchEvent(new CustomEvent('highlight-message'))
  })
}

if (typeof window !== 'undefined') {
  nextTick(() => {
    const el = document.getElementById(`message-${props.message._id}`)
    if (!el) return
    el.addEventListener('highlight-message', () => {
      isHighlighted.value = true
      setTimeout(() => { isHighlighted.value = false }, 1500)
    })
  })
}

// ── Swipe-to-reply ───────────────────────────────────────────────────────────
// Mensagens enviadas (isSent) → arrastar para a ESQUERDA  (offset negativo)
// Mensagens recebidas          → arrastar para a DIREITA  (offset positivo)
//
// Threshold para activar o reply: 60px de deslocamento.
// O ícone aparece do lado oposto ao balão e cresce à medida que se arrasta.
// O estado "triggered" é recalculado a cada touchmove (liga E desliga), por isso
// se o utilizador arrastar e voltar atrás antes de soltar, o reply é cancelado.

const SWIPE_THRESHOLD = 60      // px para disparar o reply
const SWIPE_MAX      = 72      // px máximo de deslocamento (elástico a partir daqui)
const SWIPE_ELASTIC  = 0.3     // resistência após o threshold

const swipeOffset     = ref(0)
const isSwipeActive   = ref(false)
const swipeTriggered  = ref(false)
const touchStartX     = ref(0)
const touchStartY     = ref(0)
const isHorizontal    = ref(false) // evita interferir com scroll vertical

// Opacidade e escala do ícone de reply (0 → 1 conforme se arrasta)
const replyIconOpacity = computed(() => {
  const abs = Math.abs(swipeOffset.value)
  return Math.min(abs / SWIPE_THRESHOLD, 1)
})

const replyIconScale = computed(() => {
  const abs = Math.abs(swipeOffset.value)
  const progress = Math.min(abs / SWIPE_THRESHOLD, 1)
  // cresce de 0.4 até 1, com um pequeno overshoot quando ultrapassa o threshold
  const base = 0.4 + progress * 0.6
  return swipeTriggered.value ? Math.min(base * 1.1, 1.15) : base
})

const onTouchStart = (e) => {
  if (props.message.status === 'is_deleted' || props.message.status === 'sending') return
  const t = e.touches[0]
  touchStartX.value = t.clientX
  touchStartY.value = t.clientY
  isSwipeActive.value = true
  isHorizontal.value = false
  swipeTriggered.value = false
}

const onTouchMove = (e) => {
  if (!isSwipeActive.value) return
  const t = e.touches[0]
  const dx = t.clientX - touchStartX.value
  const dy = t.clientY - touchStartY.value

  // Determina na primeira movimentação se é gesto horizontal ou vertical
  if (!isHorizontal.value && Math.abs(dx) < 5 && Math.abs(dy) < 5) return
  if (!isHorizontal.value) {
    isHorizontal.value = Math.abs(dx) > Math.abs(dy)
    if (!isHorizontal.value) { isSwipeActive.value = false; return }
  }

  // Direção correta por tipo de mensagem
  // isSent → só aceita arrasto para a esquerda (dx < 0)
  // recebida → só aceita arrasto para a direita (dx > 0)
  const isCorrectDirection = isSent.value ? dx < 0 : dx > 0
  if (!isCorrectDirection) {
    swipeOffset.value = 0
    swipeTriggered.value = false
    return
  }

  const raw = isSent.value ? Math.abs(dx) : dx

  let offset
  if (raw <= SWIPE_THRESHOLD) {
    offset = raw
  } else {
    // Resistência elástica após threshold
    offset = SWIPE_THRESHOLD + (raw - SWIPE_THRESHOLD) * SWIPE_ELASTIC
    offset = Math.min(offset, SWIPE_MAX)
  }

  swipeOffset.value = isSent.value ? -offset : offset

  // Recalcula o estado "triggered" em tempo real (liga E desliga conforme o gesto).
  // Isto garante que, se o utilizador voltar para trás antes de soltar, o reply é cancelado.
  const nowTriggered = Math.abs(swipeOffset.value) >= SWIPE_THRESHOLD
  if (nowTriggered && !swipeTriggered.value && navigator?.vibrate) {
    navigator.vibrate(10) // haptic só na borda de subida (entrou na zona de trigger)
  }
  swipeTriggered.value = nowTriggered
}

const onTouchEnd = () => {
  if (!isSwipeActive.value) return
  isSwipeActive.value = false

  // Só dispara o reply se, no instante de soltar o dedo, ainda estiver acima do threshold
  if (swipeTriggered.value) {
    emit('reply-swipe', props.message)
  }

  // Volta ao lugar com animação spring
  swipeOffset.value = 0
  swipeTriggered.value = false
  isHorizontal.value = false
}

// ── Áudio ────────────────────────────────────────────────────────────────────
const audioRef = ref(null)
const isPlaying = ref(false)
const audioDuration = ref(props.message.file_duration || 0)
const audioCurrentTime = ref(0)

const toggleAudio = () => {
  const el = audioRef.value
  if (!el) return
  isPlaying.value ? el.pause() : el.play()
  isPlaying.value = !isPlaying.value
}

const onAudioLoaded = () => { if (audioRef.value?.duration && isFinite(audioRef.value.duration)) audioDuration.value = audioRef.value.duration }
const onAudioTimeUpdate = () => { audioCurrentTime.value = audioRef.value?.currentTime || 0 }
const onAudioEnded = () => { isPlaying.value = false; audioCurrentTime.value = 0 }
const seekAudio = () => { if (audioRef.value) audioRef.value.currentTime = audioCurrentTime.value }

const formatAudioTime = (seconds) => {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
</script>