<template>
    <div class="flex items-center justify-between">
        <button v-if="!isSameUser" @click="$emit('onFollow')" class="text-xs p-2"
            :class="{ 'text-sky-500': hasFollowed }">
        {{ statusFollowTxt }}</button>
        <button v-if="isSameUser" @click="$emit('onFollow')" class="text-xs p-2">Editar</button>
        <button v-if="!isSameUser" @click="$emit('onAsk')" class="text-xs p-2">Perguntar</button>
        <button v-if="!isSameUser" @click="$emit('onSubscribe')" class="text-xs p-2">Subscrever</button>
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
    userId: {
        type: String,
        required: true
    }
})

const isSameUser = computed(() => props?.profile?._id == props?.userId.toString())
const hasFollowed = computed(() => props?.profile?.followers?.includes(props?.userId.toString()))

const statusFollowTxt = computed(() => {
    if (hasFollowed.value) {
        return 'Seguindo'
    } else {
        const isFollowBack = props?.profile?.following?.includes(props?.userId.toString());
        if (isFollowBack) return 'Seguir de Volta'
        else return '+Seguir'
    }
})

defineEmits(['onFollow', 'onSubscribe', 'onAsk', 'moreOptions'])


</script>