<template>
    <div class="flex items-center justify-between">
        <button @click="$emit('onFollow')" class="p-2">+Seguir</button>
        <button @click="$emit('onSubscribe')" class="p-2">Subscrever</button>
        <button @click="$emit('moreOptions')" class="p-2">Mais</button>
    </div>
</template>

<script setup>


defineEmits(['onFollow', 'onSubscribe', 'moreOptions'])
const props = defineProps({
    user: {
        type: Object,
        required: true
    }
})
</script>