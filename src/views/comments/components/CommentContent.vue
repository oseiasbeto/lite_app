<template>
    <div>
        <p class="text-[15px] leading-[21px] mt-0.5 font-normal dark:text-white text-[rgb(22,24,35)] overflow-hidden break-words whitespace-pre-wrap" v-html="content"></p>
    </div>
</template>

<script setup>
defineProps({
    content: {
        type: String,
        required: true
    }
})
</script>