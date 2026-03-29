<template>
    <div>
        <div class="flex gap-1 flex-row items-center">
            <div class="shrink-0">
                <Avatar size="xs" url=""/>
            </div>
            <div class="flex-1">
                <span class="text-sm">{{ author?.name }}</span>
                <span></span>
            </div>
        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';

defineProps({
    author: {
        type: Object,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
})
</script>