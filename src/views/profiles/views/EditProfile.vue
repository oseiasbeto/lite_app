<template>
    <div class="relative bg-white dark:bg-transparent">
        <div class="relative" v-if="!loading">
            <template v-if="!editForm">
                <!--start header (mesma estrutura do cabeçalho de "Novo post")-->
                <header
                    class="sticky top-0 z-[100] grid h-14 w-full shrink-0 grid-cols-[48px_1fr_48px] items-center border-b border-black/5 bg-white px-1 dark:border-white/10 dark:bg-black">
                    <button type="button"
                        class="flex h-10 w-10 items-center justify-center rounded-full text-inherit hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/15"
                        aria-label="Voltar" @click="goBack">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="m15 5-7 7 7 7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    <h1 class="text-center text-[17px] font-bold">Editar perfil</h1>
                    <span></span>
                </header>
                <!--end header-->

                <div class="pb-[max(env(safe-area-inset-bottom),24px)]">

                    <!-- Foto de perfil -->
                    <div class="flex flex-col items-center px-4 pb-6 pt-8">
                        <button type="button" class="group relative flex flex-col items-center"
                            aria-label="Alterar foto de perfil" @click="goToEditForm('picture')">
                            <span
                                class="relative flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                                <span class="origin-center scale-[2.4]">
                                    <Avatar size="sm"
                                        :url="profile?.profile_image?.url || profile?.profile_image?.thumbnails?.xs" />
                                </span>
                                <!-- Película escura + câmara -->
                                <span
                                    class="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-active:bg-black/50">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white"
                                        stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                                        <path
                                            d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.1a1 1 0 0 0 .8-.4l.8-1.2A1 1 0 0 1 10.1 4h3.8a1 1 0 0 1 .9.4l.8 1.2a1 1 0 0 0 .8.4h1.1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
                                        <circle cx="12" cy="12.5" r="3.2" />
                                    </svg>
                                </span>
                            </span>
                            <span class="mt-3 text-[15px] font-semibold text-[rgb(22,24,35)] dark:text-white">
                                Alterar foto
                            </span>
                        </button>
                    </div>

                    <!-- Secções -->
                    <section v-for="section in sections" :key="section.title">
                        <h2
                            class="px-4 pb-2 pt-5 text-[13px] font-semibold text-[rgb(22,24,35)]/55 dark:text-white/55">
                            {{ section.title }}
                        </h2>
                        <ul class="border-y border-black/[0.06] dark:border-white/10">
                            <li v-for="item in section.items" :key="item.form" role="button" tabindex="0"
                                class="relative flex min-h-[56px] cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 text-[rgb(22,24,35)] transition-colors active:bg-black/[0.04] dark:text-white dark:active:bg-white/[0.06] after:absolute after:bottom-0 after:left-4 after:right-0 after:h-px after:bg-black/[0.06] last:after:hidden dark:after:bg-white/10"
                                @click="goToEditForm(item.form)" @keydown.enter.prevent="goToEditForm(item.form)">
                                <span class="shrink-0 text-[16px] font-medium">{{ item.label }}</span>

                                <span class="flex min-w-0 items-center gap-1">
                                    <span v-if="item.value"
                                        class="truncate text-[15px] text-[rgb(22,24,35)]/55 dark:text-white/55">
                                        {{ item.value }}
                                    </span>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        class="shrink-0 text-[rgb(22,24,35)]/30 dark:text-white/30">
                                        <path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </span>
                            </li>
                        </ul>
                    </section>
                </div>
            </template>
            <template v-else>
                <EditProfileForm />
            </template>
        </div>
        <div v-else>
            <LoadingScreen />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import EditProfileForm from './EditProfileForm.vue';
import LoadingScreen from '@/components/UI/LoadingScreen.vue';
import Avatar from '@/components/Utils/Avatar.vue';

const route = useRoute()
const router = useRouter()
const store = useStore()

const profileId = route.params.profile_id
const editForm = computed(() => route.query?.edit_form || null)
const profile = computed(() => store.getters.currentProfile)
const currentTheme = computed(() => store.getters.currentTheme)

const loading = ref(false)

// Apenas apresentação: cada item aciona o mesmo goToEditForm de antes
const sections = computed(() => [
    {
        title: 'Sobre ti',
        items: [
            { form: 'name', label: 'Nome', value: profile.value?.name },
            { form: 'bio', label: 'Biografia' },
            { form: 'location', label: 'Localização' },
        ],
    },
    {
        title: 'Conta e aparência',
        items: [
            { form: 'credentials', label: 'Credencial de perfil' },
            { form: 'theme', label: 'Tema' },
        ],
    },
])

const goToEditForm = (form) => {
    router.push({ query: { edit_form: form } })
}

const goBack = () => {
    router.back()
}

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

onMounted(async () => {
    if (!profile.value || profile.value._id !== profileId) {
        loading.value = true
        await store.dispatch('getProfileByUserId', profileId)
            .finally(() => {
                loading.value = false
            })
    }
})
</script>