<template>
    <div @click="$emit('onMarkRead', data)" class="px-[10px] border-b dark:border-[rgb(57,56,57)] py-2">
        <div class="flex items-center gap-1">
            <div class="shrink-0">
                <Avatar size="md" url="''"/>
            </div>
            <div class="flex-1">
                <div>
                    <span class="font-semibold">{{ data?.sender?.name }}</span>
                </div>
                <div>
                    <p>{{ data.message }}</p>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';

defineEmits(['onMarkRead'])

defineProps({
    data: {
        type: Object,
        required: true
    }
})
</script>