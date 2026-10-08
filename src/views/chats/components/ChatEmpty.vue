<template>
    <div class="flex justify-center px-8 py-16" role="status">
        <div class="flex flex-col items-center text-center">
            <!-- Ícone -->
            <div
                class="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(22,24,35,0.06)] text-[rgba(22,24,35,0.34)] dark:bg-[rgba(255,255,255,0.12)] dark:text-[rgba(255,255,255,0.5)]"
                aria-hidden="true">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    <circle cx="8.5" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
                    <circle cx="15.5" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
                </svg>
            </div>

            <h1 class="mb-2 text-[17px] font-bold leading-tight text-[#161823] dark:text-white">
                {{ title }}
            </h1>

            <p class="max-w-[260px] text-[14px] leading-[1.4] text-[rgba(22,24,35,0.6)] dark:text-[rgba(255,255,255,0.6)]">
                {{ description }}
            </p>

            <!-- Ação opcional: use a prop action-text ou o slot padrão -->
            <div v-if="$slots.default || actionText" class="mt-6">
                <slot>
                    <button type="button"
                        class="h-10 min-w-[140px] rounded bg-[#fe2c55] px-6 text-[15px] font-semibold text-white transition-colors active:bg-[#e0264b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe2c55]"
                        @click="$emit('action')">
                        {{ actionText }}
                    </button>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup>
// Componente para estado vazio da lista de chats
defineProps({
    title: { type: String, default: 'Nenhuma conversa ainda' },
    description: { type: String, default: 'Quando você começar uma conversa, ela aparecerá aqui.' },
    actionText: { type: String, default: '' }
})
defineEmits(['action'])
</script>