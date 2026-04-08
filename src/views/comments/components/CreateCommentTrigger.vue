<template>
    <div class="flex p-2 dark:bg-[rgb(32,32,32)] items-center gap-2">
        <div class="shrink-0">
            <Avatar size="md" :url="'https://qph.cf2.quoracdn.net/main-thumb-2924251670-100-qpxhcqvjpdovzaietybdmdbshaxaerfg.jpeg'"/>
        </div>
        
        <div class="flex-1">
            <div @click="$emit('on-press')" class="w-full dark:bg-[rgb(24,24,24)] dark:text-[rgb(177,179,182)] flex items-center h-[36px] px-2 rounded-[30px]">
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