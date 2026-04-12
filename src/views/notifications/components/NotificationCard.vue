<template>
    <div :class="{'dark:bg-[#1a2035] bg-[#edf1f5]': !data?.is_read}"  @click="$emit('onMarkRead', data)" class="p-4 border-b dark:bg-transparent bg-white dark:border-[rgb(57,56,57)]">
        <div class="flex">
            <div class="shrink-0">
                <Avatar size="md" :url="data?.sender?.profile_image?.thumbnails?.md || data?.sender?.profile_image?.url"/>
            </div>
            <div class="px-4">
                <div class="mb-1">
                    <span class="text-[13px]">{{ formattedTime(data.updated_at) }}</span>
                </div>
                <div>
                    <span class="font-bold dark:text-white text-[rgb(40,40,41)]">{{ data?.sender?.name }}</span>
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
import formattedTime from '@/utils/formatted-time';

defineEmits(['onMarkRead'])

defineProps({
    data: {
        type: Object,
        required: true
    }
})
</script>