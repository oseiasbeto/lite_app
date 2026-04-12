<template>
  <div @contextmenu.prevent="" @click="$emit('click')" class="
      flex items-center px-4 py-3 gap-3.5 cursor-pointer bg-white dark:bg-transparent transition-all duration-200 relative
      border-b dark:border-[rgb(57,56,57)]
    ">
    <!-- Avatar com status online -->
    <div class="relative flex-shrink-0">
      <Avatar :url="conversation?.avatar?.thumbnails?.md || conversation?.avatar?.url" size="lg" alt="" />
    </div>

    <!-- Conteúdo principal -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <!-- Nome do contato -->
        <h3 class="text-[15px] font-semibold dark:text-white truncate max-w-[180px]">
          {{ props?.conversation.name }}
        </h3>

        <!--celo de verificacao-->
        <div v-if="conversation?.is_verified" class="shrink-0 flex-1 justify-start">
          <svg class="ml-[-4px]" fill="none" width="14" viewBox="0 0 24 24" height="14">
            <circle cx="12" cy="12" r="11.5" fill="#0F73FF"></circle>
            <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
              d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
            </path>
          </svg>
        </div>


        <!-- Horário da última mensagem -->
        <div :class="['flex items-center', props?.conversation.unread_count ? 'dark:text-white' : 'dark:text-greyDark text-grey']"
          v-show="!conversation?.is_typing">
          <span class="text-[13px] flex-shrink-0">
            {{ formatMessageTime(props?.conversation?.last_message?.created_at, new Date(currentTime)) }}.
          </span>
          <span class="ml-1">
            <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m9 5 7 7-7 7.005" class="icon_svg-stroke" stroke="currentColor" stroke-width="2" fill="none"
                stroke-linecap="round"></path>
            </svg>
          </span>

        </div>
      </div>

      <div class="flex items-center text-sm justify-between gap-3">
       
        <!-- Última mensagem + ícone de check se for enviada por você -->
        <p v-if="props.conversation?.last_message?.content" class="mt-[2.5px] text-xs truncate max-w-[220px]"
          :class="[props?.conversation.unread_count ? 'dark:text-white' : 'dark:text-greyDark text-grey']">

          {{ previewText }}
        </p>

        <!-- Badge de não lidas (igual Telegram) -->
        <div v-if="props?.conversation?.unread_count && !conversation?.is_typing" class="flex-shrink-0">
          <span
            class="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-semibold mt-0.5 text-white bg-primary rounded-full shadow-sm">
            {{ props?.conversation.unread_count > 99 ? '99+' : props?.conversation.unread_count }}
          </span>
        </div>
        
        <!-- Mute icon (opcional, se tiver silenciado) -->
        <svg v-if="props?.conversation?.muted"
          class="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7v-3H3v-4h6V5z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'
import { formatMessageTime } from '@/utils/format-message-time'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  conversation: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  source: { type: String, default: 'active' },
  userId: { type: String, required: true } // ← adicione isso se ainda não tiver
})

// Variável reativa para o tempo atual
const currentTime = ref(Date.now())

const readBy = computed(() => {
  if (!props?.conversation?._id) return []
  else return props?.conversation?.read_by?.filter(i => i.user?._id !== props.userId) || []
})

const previewText = computed(() => {

  const messageType = props?.conversation?.last_message?.message_type
  const emoji = props?.conversation?.last_message?.reaction
  const senderId = props?.conversation?.last_message?.sender?._id
  const userId = props?.userId

  const itsMe = senderId === userId

  switch (messageType) {
    case 'text':
      return `${itsMe ? 'Tu: ' : ''} ${props?.conversation?.last_message?.content}`
    case 'reaction_message':
      return `${itsMe ? 'Reagiste' : 'Reagiu'} com ${emoji} a uma mensagem`
    default:
      return props?.conversation?.last_message?.content
  }
})

defineEmits(['click', 'more-options'])

onMounted(() => {
  // Atualiza o tempo atual a cada minuto
  const interval = setInterval(() => {
    currentTime.value = Date.now()
  }, 60000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>