<template>
    <div>
        <p @click="$emit('onPress')" v-html="content"></p>
    </div>
</template>

<script setup>
defineProps({
    content: {
        type: String,
        required: true
    },
    showMore: {
        type: Boolean,
        default: false
    }
})

defineEmits(['onPress'])
</script>