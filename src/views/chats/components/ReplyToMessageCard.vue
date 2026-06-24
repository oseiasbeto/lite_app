<template>
    <div class="flex border-t dark:border-[rgb(57,56,57)] px-4 py-1.5 justify-between">
        <div class="flex flex-col flex-1 min-w-0">
            <p class="text-sm font-semibold dark:text-white text-[rgb(40,40,41)] truncate">Responder {{ isSent ? 'à tua mensagem' : 'a '+ getFirstName(message?.sender?.name) }}</p>

            <p class="text-[13px] truncate ">{{ previewText || '...' }}</p>
        </div>

        <button class="shrink-0" @click="close">
             <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                        fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
                </svg>
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    message: {
        type: Object,
        required: true
    },
    userId: String
})

const emit = defineEmits(['on-close'])

const isSent = computed(() => props.message?.sender?._id === props.userId || false)
const previewText = computed(() => {
    switch (props?.message?.message_type) {
        case 'text':
            return props.message.content
        case 'photo':
            return '📷 Foto'
        case 'video':
            return '🎥 Vídeo'
        case 'voice':
            return '🎤 Mensagem de voz'
    }
})


// Pega apenas o primeiro nome de um nome completo (ex: "Stelvio Catuame" -> "Stelvio")
const getFirstName = (fullName) => {
  if (!fullName) return ''
  return fullName.trim().split(/\s+/)[0]
}


const close = () => {
    emit('on-close')
}
</script>