<template>
    <div :class="['px-3 py-3.5 cursor-pointer active:bg-background-tertiary transition-colors', costumClass]"
        @click="onPress">
        <div class="flex items-center">
            <!--icon-->
            <span class="ml-2">
                <slot name="icon"></slot>
            </span>

            <div>
                <p class="text-sm font-medium text-text-primary">{{ title }}  <span v-if="isActive">(v)</span></p>
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