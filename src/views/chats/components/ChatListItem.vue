<template>
  <div
    @contextmenu.prevent=""
    @click="$emit('click')"
    class="
      relative flex items-center gap-3 px-4 py-[10px] cursor-pointer select-none
      bg-white dark:bg-transparent
      transition-colors duration-150
      hover:bg-[rgba(22,24,35,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)]
      active:bg-[rgba(22,24,35,0.06)] dark:active:bg-[rgba(255,255,255,0.08)]
    "
    :class="isActive ? 'bg-[rgba(22,24,35,0.04)] dark:bg-[rgba(255,255,255,0.06)]' : ''"
  >
    <!-- Avatar + status online -->
    <div class="relative flex-shrink-0">
      <Avatar
        :url="conversation?.avatar?.thumbnails?.md || conversation?.avatar?.url"
        class="w-[52px] h-[52px] rounded-full"
      />

      <!-- Bolinha de status -->
      <span
        v-if="conversation?.is_online"
        class="absolute bottom-0 right-0 block h-[14px] w-[14px] rounded-full bg-[#25D366] ring-[2.5px] ring-white dark:ring-[#121212]"
      ></span>
    </div>

    <!-- Conteúdo principal -->
    <div class="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
      <!-- Linha 1: nome + selo de verificação -->
      <div class="flex items-center gap-1 min-w-0">
        <h3
          class="text-[16px] leading-[20px] font-semibold truncate max-w-[200px] text-[rgba(22,24,35,0.95)] dark:text-[rgba(255,255,255,0.95)]"
        >
          {{ props?.conversation.name }}
        </h3>

        <!-- Selo de verificação -->
        <div v-if="conversation?.is_verified" class="shrink-0 flex items-center">
          <svg fill="none" width="14" viewBox="0 0 24 24" height="14">
            <circle cx="12" cy="12" r="11.5" fill="#20D5EC"></circle>
            <path
              fill="#fff"
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Linha 2: prévia · horário -->
      <div class="flex items-center min-w-0 text-[14px] leading-[18px]">
        <!-- Digitando -->
        <p
          v-if="conversation?.is_typing"
          class="truncate max-w-[220px] font-medium text-[#FE2C55]"
        >
          Escrevendo...
        </p>

        <!-- Última mensagem -->
        <p
          v-else-if="props.conversation?.last_message?.content"
          class="truncate max-w-[200px]"
          :class="
            props?.conversation.unread_count
              ? 'font-semibold text-[rgba(22,24,35,0.95)] dark:text-[rgba(255,255,255,0.95)]'
              : 'text-[rgba(22,24,35,0.5)] dark:text-[rgba(255,255,255,0.5)]'
          "
        >
          {{ previewText }}
        </p>

        <!-- Horário -->
        <span
          v-show="!conversation?.is_typing"
          class="flex-shrink-0 whitespace-nowrap text-[rgba(22,24,35,0.5)] dark:text-[rgba(255,255,255,0.5)]"
        >
          <span class="mx-1">·</span>{{ formatMessageTime(props?.conversation?.last_message?.created_at, new Date(currentTime)) }}
        </span>
      </div>
    </div>

    <!-- Lado direito: badge / leitores / mudo -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- Badge de não lidas -->
      <div v-if="props?.conversation?.unread_count && !conversation?.is_typing" class="flex-shrink-0">
        <div
          class="flex items-center justify-center min-w-[20px] h-5 px-[6px] rounded-full bg-[#FE2C55] text-white text-[12px] font-semibold leading-none"
        >
          <p>{{ props?.conversation.unread_count > 99 ? '99+' : props?.conversation.unread_count }}</p>
        </div>
      </div>

      <!-- Quem leu -->
      <div class="shrink-0" v-else-if="readBy?.length && !conversation?.is_typing">
        <div class="flex -space-x-1.5">
          <img
            v-for="reader in readBy.slice(0, 5)"
            :key="reader.user._id"
            :src="reader.user.profile_image?.thumbnails?.xs || reader.user.profile_image?.url"
            :alt="reader.user.name"
            class="w-[16px] h-[16px] rounded-full object-cover ring-[1.5px] ring-white dark:ring-[#121212]"
            :title="reader.user.name"
          />
        </div>
      </div>

      <!-- Ícone de silenciado -->
      <svg
        v-if="props?.conversation?.muted"
        class="w-4 h-4 flex-shrink-0 text-[rgba(22,24,35,0.34)] dark:text-[rgba(255,255,255,0.34)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7v-3H3v-4h6V5z" />
      </svg>
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
  if (!props?.conversation?._id) return [];

  const filtered = props.conversation?.read_by?.filter(
    i => i.user?._id !== props.userId
  ) || [];

  const map = new Map();
  filtered.forEach(item => {
    if (item.user?._id) {
      // Sobrescreve com a última ocorrência (ou a primeira se preferir)
      map.set(item.user._id, item);
    }
  });
  return Array.from(map.values());
});

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