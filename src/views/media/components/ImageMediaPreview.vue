<template>
    <div class="flex h-full w-full items-center justify-center bg-black">
        <img class="h-auto w-full object-cover" v-lazy="currentImage?.url">
    </div>
</template>

<script setup>
const props = defineProps({
    currentImage: {
        type: Object,
        required: true
    },
    list: {
        type: Array,
        default: () => []
    }
})
</script>