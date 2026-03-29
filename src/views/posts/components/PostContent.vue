<template>
    <div>
        <p v-html="content"></p>
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