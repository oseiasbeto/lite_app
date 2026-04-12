<template>
    <div class="flex p-2 dark:bg-[rgb(32,32,32)] bg-[rgb(241,242,242)] items-center gap-2">
        <div class="shrink-0">
            <Avatar size="md" :url="user?.profile_image?.thumbnails?.md || user?.profile_image?.url"/>
        </div>
        
        <div class="flex-1">
            <div @click="$emit('on-press')" class="w-full bg-white text-[rgb(147,149,152)] dark:bg-[rgb(24,24,24)] dark:text-[rgb(177,179,182)] flex items-center h-[36px] px-2 rounded-[30px]">
                <p class="text-[15px] ml-1">Adicione {{ type == 'post' ? ' um comentario' : 'uma resposta' }}...</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';

const emit = defineEmits(['on-press'])

defineProps({
    user: {
        type: Object,
        required: true
    },
    type: {
        type: String,
        default: 'post'
    }
})
</script>