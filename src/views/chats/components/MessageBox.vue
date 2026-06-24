<template>
  <div v-if="!isDeletedForMe" :id="`message-${message._id}`" class="relative" :class="wrapperSpacingClass">

    <!-- Separador de data/hora estilo Messenger -->
    <div v-if="showDateSeparator" class="flex justify-center my-3">
      <span class="text-[11px] font-medium text-grey dark:text-greyDark px-3">
        {{ dateSeparatorText }}
      </span>
    </div>

    <!-- Player de áudio -->
    <div v-if="message.message_type === 'voice' && message.status !== 'is_deleted'" class="flex items-center gap-2 min-w-[180px] py-1">
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

    <div class="flex items-end" :class="isSent ? 'justify-end' : 'justify-start'">
      <!-- Avatar: só no último balão do grupo recebido (igual Messenger) -->
      <div class="flex flex-col justify-end w-6 flex-shrink-0 mb-[1px]" v-if="!isSent && !isEmojiOnly">
        <Avatar class="w-[28px] h-[28px]" v-if="isLastOfGroup" size="xl"
          :url="message?.sender?.profile_image?.thumbnails?.xs || message?.sender?.profile_image?.url" />
      </div>

      <div :class="[
        'flex flex-col relative max-w-[75%] min-w-0',
        isSent ? 'items-end ml-0' : 'items-start ml-2'
      ]">

        <!-- Bloco de resposta: rótulo + balão "fantasma" sobreposto, igual Messenger -->
        <div v-if="message.reply_to && !isEmojiOnly && message.status !== 'is_deleted'" class="w-full min-w-0 relative" style="margin-bottom: -10px;">
          <span
            class="block text-[12px] mb-1 font-normal text-grey dark:text-greyDark"
            :class="[
              isSent ? 'text-right' : 'text-left'
            ]"
          >
            {{ replyLabel }}
          </span>
          <button
            type="button"
            @click="scrollToReply"
            :class="[
              'block max-w-full min-w-0 text-left rounded-[16px] px-3 py-[10px] text-[13px] leading-tight cursor-pointer transition-opacity opacity-90 hover:opacity-100',
              isSent
                ? 'ml-auto bg-[#287dff]/40'
                : 'bg-[#e4e6eb] dark:bg-[#4a4a4a]'
            ]"
            :style="isSent ? 'border-radius: 16px 16px 4px 16px;' : 'border-radius: 16px 16px 16px 4px;'"
          >
            <span class="block truncate opacity-90" :class="isSent ? 'text-white' : 'text-[rgb(40,40,41)] dark:text-white'">
              {{ replyPreviewText }}
            </span>
          </button>
        </div>

        <!-- Balão principal — fica por cima, "tampando" parte do balão de resposta -->
        <button
          type="button"
          @contextmenu.prevent="handleMoreOption(message)"
          :style="!isEmojiOnly ? bubbleRadiusStyle : {}"
          :class="[
            'relative z-[1] p-[6px_12px] text-left transition-transform active:scale-[0.99] max-w-full min-w-0',
            isSent
              ? 'bg-[#287dff] text-white'
              : 'dark:bg-[#3c3c3c] dark:text-white text-[rgb(40,40,41)] bg-[#f1f2f2]',
            isEmojiOnly ? '!bg-transparent m-0 p-0' : '',
            message.status === 'sending'
              ? 'opacity-20 pointer-events-none'
              : 'opacity-100',
            isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-1' : '',
            // Estilo para mensagem deletada
            message.status === 'is_deleted' ? 'italic opacity-70' : ''
          ]">
          
          <!-- Conteúdo principal da mensagem -->
          <p 
            v-if="message.status === 'is_deleted'"
            class="text-[14px] text-grey dark:text-greyDark italic"
          >
            Mensagem eliminada
          </p>
          
          <p 
            v-else
            :class="[
              'break-words [overflow-wrap:anywhere] whitespace-pre-wrap leading-snug min-w-0',
              isEmojiOnly ? 'text-5xl' : 'text-[15px]'
            ]"
          >
            {{ message.content }}
          </p>

          <!-- Espaço das reações de emoji, sobreposto no canto inferior do balão (igual Messenger) -->
          <div
            v-if="groupedReactions.length && message.status !== 'is_deleted'"
            class="absolute z-[99] flex items-center bg-white dark:bg-[#2c2c2c] shadow-sm border border-black/5 dark:border-white/10 rounded-full"
            :class="[
              isSent ? 'right-1' : 'left-1',
              isGroupedWithNext ? '-bottom-[10px]' : '-bottom-3',
              groupedReactions.length === 1 ? 'w-5 h-5 justify-center p-0' : 'gap-[2px] px-[5px] py-[2px]'
            ]"
          >
            <span
              v-for="r in groupedReactions"
              :key="r.emoji"
              class="leading-none flex items-center gap-[1px]"
              :class="groupedReactions.length === 1 ? 'text-[12px]' : 'text-[13px]'"
            >
              <img
                v-if="getEmojiImage(r.emoji)"
                :src="'/img/emojis/' + getEmojiImage(r.emoji)"
                :alt="r.emoji"
                class="w-[14px] h-[14px] object-contain"
              />
              <span v-else>{{ r.emoji }}</span>
              <span v-if="r.count > 1" class="text-[10px] text-grey dark:text-greyDark font-medium">{{ r.count }}</span>
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'

import { computed, ref, nextTick } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
  userId: { type: String, required: true },
  previousMessage: { type: Object, default: null },
  // Passe a próxima mensagem da lista para o agrupamento ficar perfeito
  // (saber se esta é a última mensagem "seguida" do mesmo remetente).
  nextMessage: { type: Object, default: null }
})

const emit = defineEmits(['more-option', 'scroll-to-reply'])

const isSent = computed(() => props.message.sender._id === props.userId)
const isDeletedForMe = computed(() => props.message?.deleted_for?.includes(props.userId) || false)

const isEmojiOnly = computed(() => {
  const content = props.message.content.trim()
  if (!content || /^\d+$/.test(content)) return false
  if (/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?~ ]+$/.test(content)) return false

  const emojiRegex = /^(?:[\p{Emoji}\u200d\uFE0F]+)+$/gu
  if (!emojiRegex.test(content)) return false

  const count = (content.match(/[\p{Emoji}]/gu) || []).length
  return count >= 1 && count <= 3
})

// ----- Agrupamento estilo Messenger -----
// Janela de tempo (ms) dentro da qual mensagens consecutivas do mesmo
// remetente "se juntam" visualmente (sem espaço extra, balão "emendado").
const GROUP_WINDOW_MS = 60 * 1000 // 1 minuto

const sameSender = (a, b) => {
  if (!a || !b) return false
  return (a.sender?._id) === (b.sender?._id)
}

const diffMs = (a, b) => {
  if (!a || !b) return Infinity
  return Math.abs(new Date(b.created_at) - new Date(a.created_at))
}

const isGroupedWithPrevious = computed(() => {
  if (!props.previousMessage) return false
  if (!sameSender(props.previousMessage, props.message)) return false
  return diffMs(props.previousMessage, props.message) <= GROUP_WINDOW_MS
})

const isGroupedWithNext = computed(() => {
  if (!props.nextMessage) return false
  if (!sameSender(props.message, props.nextMessage)) return false
  return diffMs(props.message, props.nextMessage) <= GROUP_WINDOW_MS
})

// Última mensagem do grupo = mostra avatar / horário.
// Sem nextMessage, assume-se sempre "fim do grupo" (mostra tudo, comportamento seguro).
const isLastOfGroup = computed(() => !isGroupedWithNext.value)

// Espaçamento entre balões: quase zero quando agrupado (efeito "colado", igual Messenger)
const wrapperSpacingClass = computed(() => (isGroupedWithPrevious.value ? 'mb-[1px]' : 'mb-2'))

// Cantos do balão — fiel ao Messenger:
// balão "solto": bem arredondado (18px) em todos os cantos
// balão emendado a outro do mesmo grupo: o lado que conecta vira quase reto (4px)
const RADIUS_FULL = '18px'
const RADIUS_TIGHT = '4px'

const bubbleRadiusStyle = computed(() => {
  const groupedWithPrev = isGroupedWithPrevious.value && !props.message.reply_to
  const groupedWithNext = isGroupedWithNext.value

  if (isSent.value) {
    return {
      borderTopLeftRadius: RADIUS_FULL,
      borderBottomLeftRadius: RADIUS_FULL,
      borderTopRightRadius: groupedWithPrev ? RADIUS_TIGHT : RADIUS_FULL,
      borderBottomRightRadius: groupedWithNext ? RADIUS_TIGHT : RADIUS_FULL
    }
  }
  return {
    borderTopRightRadius: RADIUS_FULL,
    borderBottomRightRadius: RADIUS_FULL,
    borderTopLeftRadius: groupedWithPrev ? RADIUS_TIGHT : RADIUS_FULL,
    borderBottomLeftRadius: groupedWithNext ? RADIUS_TIGHT : RADIUS_FULL
  }
})

// ----- Separador de data/hora -----
const SEPARATOR_GAP_MS = 30 * 60 * 1000 // 30 minutos

const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

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
  const horas = date.getHours().toString().padStart(2, '0')
  const minutos = date.getMinutes().toString().padStart(2, '0')

  const isToday = isSameDay(date, now)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = isSameDay(date, yesterday)

  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez']

  if (isToday) return `Hoje, ${horas}:${minutos}`
  if (isYesterday) return `Ontem, ${horas}:${minutos}`

  const sameYear = date.getFullYear() === now.getFullYear()
  const dataBase = `${date.getDate()} de ${meses[date.getMonth()]}${sameYear ? '' : ' de ' + date.getFullYear()}`
  return `${dataBase}, ${horas}:${minutos}`
})

const formatarData = (data) => {
  const date = new Date(data);
  const dia = date.getDate();
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const mes = meses[date.getMonth()];
  const horas = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');

  return `${dia} de ${mes}, ${horas}:${minutos}`;
}

const handleMoreOption = (msg) => {
  if (msg.status === 'sending' || msg.status === 'is_deleted') return
  emit('more-option', msg)
}

// Pega apenas o primeiro nome de um nome completo (ex: "Stelvio Catuame" -> "Stelvio")
const getFirstName = (fullName) => {
  if (!fullName) return ''
  return fullName.trim().split(/\s+/)[0]
}

// Rótulo acima do balão de resposta, igual ao "You replied to Fabia" do Messenger
const replyLabel = computed(() => {
  if (!props.message.reply_to) return ''
  const repliedSender = props.message.reply_to.sender || {}
  const repliedIsMe = repliedSender._id === props.userId
  const repliedFirstName = getFirstName(repliedSender.name || repliedSender.username || 'Alguém')

  if (isSent.value) {
    // eu enviei esta mensagem, respondendo a alguém
    return repliedIsMe ? 'Respondeste a ti mesmo' : `Respondeste a ${repliedFirstName}`
  }
  // a outra pessoa enviou, respondendo a alguém
  const senderFirstName = getFirstName(props.message.sender?.name || props.message.sender?.username || 'Alguém')
  return repliedIsMe ? `${senderFirstName} respondeu a si` : `${senderFirstName} respondeu a ${repliedFirstName}`
})

const replyPreviewText = computed(() => {
  if (!props.message.reply_to?.content) return ''
  const text = props.message.reply_to.content.trim()
  return text.length > 90 ? text.substring(0, 87) + '...' : text
})

// Mapeamento de emoji unicode para os caminhos das imagens
const getEmojiImage = (emoji) => {
  const imageMap = {
    '❤️': 'heart.png',
    '👍': 'like.png',
    '😡': 'angry.png',
    '😮': 'wow.png',
    '😆': 'haha.png',
    '😢': 'sad.png'
  }
  
  const fileName = imageMap[emoji]
  if (!fileName) return null
  return fileName
}

const groupedReactions = computed(() => {
  if (!props.message.reactions?.length) return []

  const map = new Map()

  props.message.reactions.forEach(r => {
    const emoji = r.emoji
    if (!map.has(emoji)) {
      map.set(emoji, { emoji, count: 0 })
    }
    map.get(emoji).count++
  })

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

// ----- Scroll até a mensagem respondida (estilo Messenger) -----
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

const audioRef = ref(null)
const isPlaying = ref(false)
const audioDuration = ref(props.message.file_duration || 0)
const audioCurrentTime = ref(0)

const toggleAudio = () => {
  const el = audioRef.value
  if (!el) return
  if (isPlaying.value) {
    el.pause()
  } else {
    el.play()
  }
  isPlaying.value = !isPlaying.value
}

const onAudioLoaded = () => {
  if (audioRef.value?.duration && isFinite(audioRef.value.duration)) {
    audioDuration.value = audioRef.value.duration
  }
}

const onAudioTimeUpdate = () => {
  audioCurrentTime.value = audioRef.value?.currentTime || 0
}

const onAudioEnded = () => {
  isPlaying.value = false
  audioCurrentTime.value = 0
}

const seekAudio = () => {
  if (audioRef.value) audioRef.value.currentTime = audioCurrentTime.value
}

const formatAudioTime = (seconds) => {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
</script>