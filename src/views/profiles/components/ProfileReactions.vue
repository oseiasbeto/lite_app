<template>
    <div class="flex items-center justify-between">
        <button v-if="!isSameUser" @click="$emit('onFollow')" class="p-2">+Seguir</button>
        <button v-if="isSameUser" @click="$emit('onFollow')" class="p-2">Editar</button>
        <button v-if="!isSameUser" @click="$emit('onSubscribe')" class="p-2">Subscrever</button>
        <button @click="$emit('moreOptions')" class="p-2">Mais</button>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    profile: {
        type: Object,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
})

const isSameUser = computed(() => props?.profile?._id == props?.userId)

defineEmits(['onFollow', 'onSubscribe', 'moreOptions'])


</script>