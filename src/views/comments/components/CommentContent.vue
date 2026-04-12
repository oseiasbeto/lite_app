<template>
    <div>
        <p class="text-[15px] font-light pb-1 dark:text-white text-[rgb(40,40,41)] text-sm overflow-hidden break-words whitespace-pre-wrap" v-html="content"></p>
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