<template>
    <div :class="['px-3 py-3.5 cursor-pointer active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive border-b border-x-light-border dark:border-x-dark-border transition-colors', costumClass]"
        @click="onPress">
        <div class="flex items-center">
            <!--icon-->
            <span class="ml-2">
                <slot name="icon"></slot>
            </span>

            <div>
                <p class="text-[15px] font-medium text-inherit dark:text-white">{{ title }}  <span class="text-green-500 font-bold text-lg ml-0.5" v-if="isActive">✓</span></p>
                <p v-show="description" class="text-[13px] mt-0.5 text-x-dark-textSecondary dark:text-x-dark-textSecondary">
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