<!-- src/views/profile/components/ProfileImageFullscreen.vue -->
<template>
    <div class="flex h-full w-full items-center justify-center bg-black">
        <!-- Header com botão voltar -->
    
        <!-- Swiper com zoom -->
        <swiper :initial-slide="0" :slides-per-view="1" :space-between="0" direction="horizontal"
            :centered-slides="true" :modules="modules" :zoom="{ maxRatio: 4, minRatio: 1 }"
            :keyboard="{ enabled: true }" class="swiper-fullscreen" @click="toggleHeader">
            <swiper-slide class="swiper-slide-fullscreen">
                <div class="swiper-zoom-container">
                    <img :src="profileImage" class="slide-img" draggable="false" alt="Foto de perfil" />
                </div>
            </swiper-slide>
        </swiper>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Zoom, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/zoom';

const store = useStore();
const router = useRouter();
const modules = [Zoom, Keyboard];

const profile = computed(() => store.getters?.currentProfile || null);
const currentTheme = computed(() => store.getters.currentTheme)

// URL da imagem do perfil
const profileImage = computed(() => {
    return profile.value?.profile_image?.thumbnails?.lg ||
        profile.value?.profile_image?.url ||
        '';
});

// Controla visibilidade do header/footer
const showHeader = ref(true);
const swiperInstance = ref(null);


// Alterna header/footer (exceto quando está com zoom)
const toggleHeader = () => {
    const zoom = swiperInstance.value?.zoom;
    if (zoom && zoom.scale > 1) return;
    showHeader.value = !showHeader.value;
};

// Fecha o fullscreen
const close = () => {
    router.back();
};

const setThemeColor = (theme) => {
    // Aplicar classe no HTML
    if (theme === 'dark') {
        window?.WTN?.setNavigationBarColor({ color: "#262626" });
        window?.WTN?.statusBar({
            style: 'light',
            color: '262626',
            overlay: false //Only for android
        });
    } else if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (isDark) {
            window?.WTN?.setNavigationBarColor({ color: "#262626" });
            window?.WTN?.statusBar({
                style: 'dark',
                color: '262626',
                overlay: false //Only for android
            });
        } else {
            window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" });
            window?.WTN.statusBar({
                style: 'dark',
                color: "FFFFFF",
                overlay: false //Only for android
            });
        }
    } else {
        window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" });
        window?.WTN.statusBar({
            style: 'dark',
            color: "FFFFFF",
            overlay: false //Only for android
        })
    }
}

onMounted(() => {
    window?.WTN?.setNavigationBarColor({ color: "#000000" });
    window?.WTN?.statusBar({
        style: 'light',
        color: '000000',
        overlay: false //Only for android
    });
})

onUnmounted(() => {
    setThemeColor(currentTheme.value)
})

</script>

<style scoped>
.swiper-fullscreen {
    position: fixed;
    inset: 0;
    width: 100dvw;
    height: 100dvh;
    background: #000;
    z-index: 9999;
}

.swiper-slide-fullscreen {
    width: 100dvw !important;
    height: 100dvh !important;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* O swiper-zoom-container precisa ocupar tudo para centralizar */
.swiper-zoom-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slide-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
}

/* Animações para o header/footer */
.fixed {
    transition: opacity 0.3s ease;
}
</style>