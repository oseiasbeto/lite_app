<template>
    <transition
        enter-active-class="transition-transform duration-300 ease-out motion-reduce:transition-none"
        leave-active-class="transition-transform duration-300 ease-in motion-reduce:transition-none"
        enter-from-class="-translate-y-full"
        enter-to-class="translate-y-0"
        leave-from-class="translate-y-0"
        leave-to-class="-translate-y-full"
    >
        <!--Faixa fina e plana no topo, estilo Lite: texto curto, icone pequeno, sem sombra-->
        <div v-if="showBanner"
            role="status"
            aria-live="polite"
            style="padding-top: env(safe-area-inset-top, 0px)"
            class="fixed top-0 left-0 w-full z-[999] flex items-center justify-center gap-1.5 py-1.5 px-4 text-[13px] leading-5 font-medium text-white transition-colors duration-200"
            :class="isOnline ? 'bg-[#31A24C]' : 'bg-[#3A3B3C]'"
        >
            <svg v-if="!isOnline" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="shrink-0">
                <path fill="currentColor"
                    d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z" />
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="shrink-0">
                <path fill="currentColor"
                    d="M12.01 21.49 23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z" />
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