<template>
    <div class="flex items-center justify-between">
        <button :disabled="isDisabled" v-if="!isSameUser" @click="$emit('onFollow')" class="text-xs p-2"
            :class="{ 'text-sky-500': hasFollowed }">
        {{ statusFollowTxt }}</button>
        <button v-if="isSameUser" @click="$emit('onFollow')" class="text-xs p-2">Editar</button>
        <button v-if="!isSameUser" @click="$emit('onAsk')" class="text-xs p-2">Perguntar</button>
        <button :disabled="isDisabled" v-if="!isSameUser" @click="$emit('onSubscribe')" class="text-xs p-2" :class="{'text-sky-500': hasSubscribed}">
            {{ hasSubscribed ? 'Inscrito' : 'Subscrever' }}
        </button>
        <button @click="$emit('moreOptions')" class="text-xs p-2">Mais</button>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    profile: {
        type: Object,
        required: true
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    isSameUser: {
        type: Boolean,
        default: false
    },
    statusFollowTxt: {
        type: String,
        default: 'Seguir'
    },
    hasFollowed: {
        type: Boolean,
        default: false
    },
    hasSubscribed: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: true
    }
})



defineEmits(['onFollow', 'onSubscribe', 'onAsk',  'moreOptions'])


</script>