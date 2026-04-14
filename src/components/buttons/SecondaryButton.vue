<template>
    <button :disabled="loading || disabled" @click="$emit('onPress')" class="h-[38px] bg-secondary text-white font-semibold rounded-[30px] w-full p-[0_20px] disabled:opacity-50">
        <span v-if="!loading">{{ text }}</span>
        <Spinner color="bg-white" v-else/>
    </button>
</template>


<script setup>
import Spinner from '../UI/Spinner.vue';

const props = defineProps({
    text: {
        type: String,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    }
})

defineEmits(['onPress'])
</script>