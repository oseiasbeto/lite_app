<template>
    <div :class="['px-3 py-3.5 cursor-pointer dark:active:bg-[rgba(255,255,255,0.04)] border-b dark:border-[#393839] transition-colors', costumClass]"
        @click="onPress">
        <div class="flex items-center">
            <!--icon-->
            <span class="ml-2">
                <slot name="icon"></slot>
            </span>

            <div>
                <p class="text-sm font-medium dark:text-white text-[rgb(40,40,41)]">{{ title }}  <span v-if="isActive">✓</span></p>
                <p v-show="description" class="text-xs text-text-secondary">
                    {{ description }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    costumClass: String,
    description: String
})
const emit = defineEmits(['on-press'])

const onPress = () => {
    emit('on-press')
}
</script>