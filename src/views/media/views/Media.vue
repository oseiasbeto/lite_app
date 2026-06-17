<template>
    <div class="h-screen relative w-full bg-black">
        <!--start body media-->
        <ImageMediaPreview v-if="currentMedia?.selected?.type !== 'video'" :current-image="currentMedia?.selected"
            :list="currentMedia?.list" :post="currentMedia?.post" :user-id="user?._id" :module="module" />

        <VideoMediaPlayer v-else :current-video="currentMedia?.selected" :list="currentMedia?.list" />
        <!--end body media-->

    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useStore } from 'vuex';
import ImageMediaPreview from '../components/ImageMediaPreview.vue';
import VideoMediaPlayer from '../components/VideoMediaPlayer.vue';
import { useRoute } from 'vue-router';

const store = useStore()
const route = useRoute()

const currentMedia = computed(() => store.getters.currentMedia)
const user = computed(() => store.getters.currentUser)
const currentTheme = computed(() => store.getters.currentTheme)

const module = ref(route.query?.module || 'feed')

const setThemeColor = (theme) => {
    // Salvar preferência
    if (savedTheme.value !== theme) {
        Cookies.set('theme', theme)
        savedTheme.value = theme
    }

    // Aplicar classe no HTML
    if (savedTheme.value === 'dark') {
        window?.WTN?.setNavigationBarColor({ color: "#262626" });
        window?.WTN?.statusBar({
            style: 'light',
            color: '262626',
            overlay: false //Only for android
        });
        // Aplicar tema escuro  
        document.documentElement.classList.add('dark');
    } else if (savedTheme.value === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (isDark) {
            window?.WTN?.setNavigationBarColor({ color: "#262626" });
            window?.WTN?.statusBar({
                style: 'dark',
                color: '262626',
                overlay: false //Only for android
            });

            document.documentElement.classList.add('dark');
        } else {
            window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" });
            window?.WTN.statusBar({
                style: 'dark',
                color: "FFFFFF",
                overlay: false //Only for android
            });

            document.documentElement.classList.remove('dark');
        }
    } else {
        window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" });
        window?.WTN.statusBar({
            style: 'dark',
            color: "FFFFFF",
            overlay: false //Only for android
        });
        // Aplicar tema claro
        document.documentElement.classList.remove('dark');
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

onBeforeRouteLeave((to, from, next) => {
    setThemeColor(currentTheme.value)
    next()
})
</script>