<template>
    <div class="flex items-center gap-1">
        <div class="shrink-0">
            <Avatar size="xs" :url="''"/>
        </div>
        
        <div class="flex-1">
            <div @click="$emit('on-press')" class="w-full bg-black py-2 px-1 rounded-[30px]">
                <p class="text-xs">Escrever {{ type == 'post' ? 'o comentario' : 'a resposta' }}</p>
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