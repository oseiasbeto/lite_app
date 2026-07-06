<template>
    <!--FADE/BG atrás do trigger: transparente no topo, sólido do meio pra baixo-->
    <div class="fixed bottom-0 w-full h-[90px] z-[10] pointer-events-none
        bg-gradient-to-t from-x-light-bg dark:from-x-dark-bg from-40% to-transparent">
    </div>
    <div class="flex px-1.5 fixed bottom-[12px] w-full z-[11] items-center gap-2">
        <div class="flex-1">
            <div @click="$emit('on-press')"
                class="w-full bg-x-light-surface dark:bg-x-dark-surface text-x-light-textSecondary dark:text-x-dark-textSecondary border dark:border-x-dark-border border-x-light-border flex items-center h-[50px] px-2 rounded-[30px]">
                <div class="shrink-0">
                    <Avatar size="md" :url="user?.profile_image?.thumbnails?.md || user?.profile_image?.url" />
                </div>
                <p class="text-[15px] ml-2">Postar {{ type == 'post' ? ' o seu comentário' : 'a sua resposta' }}</p>
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