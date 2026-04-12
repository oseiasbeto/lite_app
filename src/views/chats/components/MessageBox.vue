<template>
  <div v-if="!isDeletedForMe" class="relative mb-2">
    <div class="flex">
      <div class="flex flex-col justify-end" v-if="!isSent">
        <Avatar size="s" style="top: -2px;"
          :url="message?.sender?.profile_image?.thumbnails?.xs || message?.sender?.profile_image?.url" />
      </div>
      <div :class="[
        'flex relative flex-1',
        isSent ? 'justify-end ml-0' : 'justify-start ml-2'
      ]">
        <div @contextmenu.prevent="handleMoreOption(message)" :class="[
          'relative p-[5px_12px]',
          // Removido overflow-hidden fixo → controlado condicionalmente
          isSent
            ? 'bg-[#287dff] text-white rounded-[15.5px_15.5px_0px]'
            : 'dark:bg-[#3c3c3c] dark:text-white text-[rgb(40,40,41)] bg-[#f1f2f2] rounded-[16.5px_15.5px_15.5px_0px]',
          isEmojiOnly
            ? 'bg-transparent m-0 p-0 rounded-none'
            : 'max-w-[75%]',
          message.status === 'sending'
            ? 'opacity-20 pointer-events-none'
            : 'opacity-100'
        ]">
          <!-- Quote / Mensagem respondida -->
          <div v-if="message.reply_to && !isEmojiOnly"
            class="mb-1.5 -mx-[14px] px-[14px] pt-1 pb-1.5 border-l-4 text-[13px] leading-tight" :class="[
              isSent
                ? 'border-l-blue-300/80 bg-white/10'
                : 'border-primary/80 bg-background-primary/20'
            ]">
            <div class="font-semibold mb-1 truncate opacity-95">
              {{ replySenderName }}
            </div>
            <div class="opacity-80 line-clamp-2">
              {{ replyPreviewText }}
            </div>
          </div>

          <!-- Conteúdo principal da mensagem -->
          <p :class="[
            'break-words whitespace-pre-wrap leading-snug',
            isEmojiOnly ? 'text-5xl' : 'text-[15px]'
          ]">
            {{ message.content }}
          </p>
        </div>

        <div v-if="!isSent" class="absolute text-[#f1f2f2] dark:text-[#3C3C3C] bottom-0 left-[-6px]">
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg"
            class="Message___StyledSvg-sc-512a4315-1 fYSXik">
            <path
              d="M-3.05176e-05 10.5019C-3.05176e-05 10.777 0.222986 11 0.49809 11H5.99997V0C5.99997 4.06498 4.64357 7.63316 0.640783 9.52185C0.25977 9.70162 -3.05176e-05 10.0768 -3.05176e-05 10.4981V10.4981L-2.69413e-05 10.5L-3.05176e-05 10.5019V10.5019Z"
              fill="currentColor"></path>
          </svg>
        </div>
        <div v-else class="absolute bottom-0 right-[-6px]" style="transform: scaleX(-1)">
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg"
            class="Message___StyledSvg-sc-512a4315-1 fmwFbZ">
            <path
              d="M-3.05176e-05 10.5019C-3.05176e-05 10.777 0.222986 11 0.49809 11H5.99997V0C5.99997 4.06498 4.64357 7.63316 0.640783 9.52185C0.25977 9.70162 -3.05176e-05 10.0768 -3.05176e-05 10.4981V10.4981L-2.69413e-05 10.5L-3.05176e-05 10.5019V10.5019Z"
              fill="#287dff"></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="flex mt-1" :class="isSent ? 'justify-end' : 'justify-start'">
      <span class="text-xs dark:text-greyDark text-grey font-medium">
        {{ formatarData(message.created_at) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'
import { computed } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
  userId: { type: String, required: true },
  previousMessage: Object
})

const emit = defineEmits(['more-option'])

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

const showDateSeparator = computed(() => {
  if (!props.previousMessage) return true

  const current = new Date(props.message.created_at)
  const prev = new Date(props.previousMessage.created_at)

  return (
    current.getFullYear() !== prev.getFullYear() ||
    current.getMonth() !== prev.getMonth() ||
    current.getDate() !== prev.getDate()
  )
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
  if (msg.status === 'sending') return
  emit('more-option', msg)
}

const replySenderName = computed(() => {
  if (!props.message.reply_to) return ''
  const sender = props.message.reply_to.sender || {}
  return sender._id === props.userId ? 'Você' : (sender.name || sender.username || 'Alguém')
})

const replyPreviewText = computed(() => {
  if (!props.message.reply_to?.content) return ''
  const text = props.message.reply_to.content.trim()
  return text.length > 90 ? text.substring(0, 87) + '...' : text
})

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
</script>
