<template>
    <div :class="['px-3 py-3.5 cursor-pointer active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive transition-colors', costumClass]"
        @click="onPress">
        <div class="flex items-center">
            <!--icon-->
            <span class="ml-2 text-x-light-textSecondary dark:text-x-dark-textPrimary shrink-0 w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain">
                <slot name="icon"></slot>
            </span>

            <div class="flex-1 min-w-0 ml-2">
                <div class="flex items-center gap-1">
                    <p class="text-base min-w-0 truncate font-medium text-x-light-textSecondary dark:text-x-dark-textPrimary">
                        {{ title }}
                    </p>
                    <span class="text-green-500 font-bold text-lg shrink-0" v-if="isActive">✓</span>
                </div>
                <p v-show="description" class="text-[13px] mt-0.5 text-x-light-textTertiary dark:text-x-dark-textSecondary truncate">
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