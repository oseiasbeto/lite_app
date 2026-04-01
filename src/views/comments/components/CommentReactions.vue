<template>
    <div class="flex items-center justify-between" :class="{ 'pointer-events-none': loading }">
        <div class="flex gap-1 items-center">
            <button @click="$emit('on-upvote')" class="px-0.5 text-xs py-0.5">U ({{ upvotesCount }})</button>
            <button @click="$emit('on-downvote')" class="px-0.5 text-xs py-0.5">D ({{ downvotesCount }})</button>
            <button @click="$emit('on-reply')" class="px-0.5 text-xs py-0.5">Replies ({{ repliesCount }})</button>
        </div>

        <div>

        </div>
    </div>
</template>

<script setup>
defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    upvotes: {
        type: Array,
        default: []
    },
    upvotesCount: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Array,
        default: []
    },
    downvotesCount: {
        type: Number,
        default: 0
    },
    repliesCount: {
        type: Number,
        default: 0
    },
    sharesCount: {
        type: Number,
        default: 0
    },
})

defineEmits(['on-upvote', 'on-downvote', 'on-reply', 'on-share'])
</script>