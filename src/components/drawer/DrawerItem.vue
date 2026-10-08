<template>
    <div role="button" tabindex="0" :aria-pressed="isActive"
        :class="['relative flex min-h-[56px] cursor-pointer select-none items-center px-4 py-3 transition-colors',
            'active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive',
            'after:absolute after:bottom-0 after:left-4 after:right-0 after:h-px after:bg-black/[0.06] last:after:hidden dark:after:bg-white/10',
            costumClass]" @click="onPress" @keydown.enter.prevent="onPress" @keydown.space.prevent="onPress">

        <!--icon-->
        <span v-if="$slots.icon"
            class="mr-3.5 flex h-6 w-6 shrink-0 items-center justify-center text-[rgb(22,24,35)] dark:text-white [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain">
            <slot name="icon"></slot>
        </span>

        <div class="min-w-0 flex-1">
            <p class="min-w-0 truncate text-[16px] leading-[22px] text-[rgb(22,24,35)] dark:text-white"
                :class="isActive ? 'font-semibold' : 'font-medium'">
                {{ title }}
            </p>
            <p v-show="description"
                class="mt-0.5 line-clamp-2 text-[13px] leading-[18px] text-[rgb(22,24,35)]/55 dark:text-white/55">
                {{ description }}
            </p>
        </div>

        <!--selecionado-->
        <span v-if="isActive"
            class="ml-3 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#FE2C55] text-white"
            aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
        </span>
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