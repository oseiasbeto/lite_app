<template>
    <div>
        <div v-if="author?._id" class="flex gap-1 flex-row items-center">
            <div class="flex-1 text-[13px]">
                <div>
                    <span class="dark:text-white text-black font-bold">{{ author?.name }}</span>
                    <span> · </span>
                    <span>{{ formattedDate(createdAt) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import formattedDate from '@/utils/formatted-date';

defineProps({
    author: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date
    },
    userId: {
        type: String,
        required: true
    }
})
</script>