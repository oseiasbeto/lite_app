<template>
    <transition
        enter-active-class="transition-transform duration-300 ease-out"
        leave-active-class="transition-transform duration-300 ease-in"
        enter-from-class="-translate-y-full"
        enter-to-class="translate-y-0"
        leave-from-class="translate-y-0"
        leave-to-class="-translate-y-full"
    >
        <div v-if="showBanner"
            style="padding-top: env(safe-area-inset-top, 0px)"
            class="fixed top-0 left-0 w-full z-[999] flex items-center justify-center gap-2 py-2.5 px-4 text-[13px] font-medium text-white"
            :class="isOnline ? 'bg-emerald-600' : 'bg-[#1c1c1c]'"
        >
            <svg v-if="!isOnline" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="shrink-0">
                <path fill="currentColor"
                    d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="shrink-0">
                <path fill="currentColor" d="M9 16.17 4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span>{{ isOnline ? 'Conexão restabelecida' : 'Sem conexão com a internet' }}</span>
        </div>
    </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNetworkStatus } from '@/composables/useNetworkStatus'

const { isOnline } = useNetworkStatus()

const showBanner = ref(false)
const wasOffline = ref(false)
let hideTimeout = null

defineExpose({ isOnline })

watch(isOnline, (online) => {
    clearTimeout(hideTimeout)

    if (!online) {
        wasOffline.value = true
        showBanner.value = true
        return
    }

    // só mostra "reconectado" se realmente esteve offline antes
    // (evita aparecer no primeiro carregamento do app já online)
    if (wasOffline.value) {
        showBanner.value = true
        hideTimeout = setTimeout(() => {
            showBanner.value = false
            wasOffline.value = false
        }, 2500)
    }
})
</script>