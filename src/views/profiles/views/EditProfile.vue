<template>
    <div class="relative bg-white dark:bg-transparent">
        <div class="relative" v-if="!loading">
            <template v-if="!editForm">
                <Navbar title="Editar perfil" />
                <div class="mt-[44px]">
                    <ul>
                        <li class="flex px-4 border-b text-[#282829] dark:text-inherit justify-between items-center border-[#dee0e1] dark:border-[rgb(57,56,57)] py-2.5"
                            @click="goToEditForm('picture')">
                            <div class="flex items-center  gap-2 flex-row">
                                <Avatar size="sm"
                                    :url="profile?.profile_image?.thumbnails?.xs || profile?.profile_image?.url" />
                                <span>Editar Foto</span>
                            </div>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" fill-rule="evenodd">
                                    <path
                                        d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9a2 2 0 0 1 2.828 0Z"
                                        class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path class="icon_svg-fill_as_stroke" fill="currentColor"
                                        d="m4.429 19.571 2.652-.884-1.768-1.768z"></path>
                                </g>
                            </svg>
                        </li>
                        <li class="flex px-4 border-b justify-between items-center text-[#282829] dark:text-inherit border-[#dee0e1] dark:border-[rgb(57,56,57)] py-2.5 flex-row items-center"
                            @click="goToEditForm('name')">

                            <div class="flex flex-col">
                                <span>Editar Nome</span>
                                <span class="text-[#939598] text-xs">{{ profile?.name }}</span>
                            </div>

                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" fill-rule="evenodd">
                                    <path
                                        d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9a2 2 0 0 1 2.828 0Z"
                                        class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path class="icon_svg-fill_as_stroke" fill="currentColor"
                                        d="m4.429 19.571 2.652-.884-1.768-1.768z"></path>
                                </g>
                            </svg>
                        </li>
                        <li class="flex px-4 border-b justify-between items-center text-[#282829] dark:text-inherit border-[#dee0e1] dark:border-[rgb(57,56,57)] py-2.5"
                            @click="goToEditForm('credentials')">
                            <span>Editar credencial de perfil</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" fill-rule="evenodd">
                                    <path
                                        d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9a2 2 0 0 1 2.828 0Z"
                                        class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path class="icon_svg-fill_as_stroke" fill="currentColor"
                                        d="m4.429 19.571 2.652-.884-1.768-1.768z"></path>
                                </g>
                            </svg>
                        </li>
                        <li class="flex px-4 border-b justify-between items-center text-[#282829] dark:text-inherit border-[#dee0e1] dark:border-[rgb(57,56,57)] py-2.5"
                            @click="goToEditForm('location')">
                            <span>Editar localização</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" fill-rule="evenodd">
                                    <path
                                        d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9a2 2 0 0 1 2.828 0Z"
                                        class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path class="icon_svg-fill_as_stroke" fill="currentColor"
                                        d="m4.429 19.571 2.652-.884-1.768-1.768z"></path>
                                </g>
                            </svg>
                        </li>
                          <li class="flex px-4 border-b justify-between items-center text-[#282829] dark:text-inherit border-[#dee0e1] dark:border-[rgb(57,56,57)] py-2.5"
                            @click="goToEditForm('theme')">
                            <span>Editar tema</span>

                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" fill-rule="evenodd">
                                    <path
                                        d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9a2 2 0 0 1 2.828 0Z"
                                        class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path class="icon_svg-fill_as_stroke" fill="currentColor"
                                        d="m4.429 19.571 2.652-.884-1.768-1.768z"></path>
                                </g>
                            </svg>
                        </li>
                        <li class="flex px-4 border-b justify-between items-center text-[#282829] dark:text-inherit border-[#dee0e1] dark:border-[rgb(57,56,57)] py-2.5"
                            @click="goToEditForm('bio')">
                            <span>Editar biografia</span>

                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" fill-rule="evenodd">
                                    <path
                                        d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9a2 2 0 0 1 2.828 0Z"
                                        class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path class="icon_svg-fill_as_stroke" fill="currentColor"
                                        d="m4.429 19.571 2.652-.884-1.768-1.768z"></path>
                                </g>
                            </svg>
                        </li>
                    </ul>
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
import Navbar from '@/views/main/components/Navbar.vue';
import Avatar from '@/components/Utils/Avatar.vue';

const route = useRoute()
const router = useRouter()
const store = useStore()

const profileId = route.params.profile_id
const editForm = computed(() => route.query?.edit_form || null)
const profile = computed(() => store.getters.currentProfile)
const currentTheme = computed(() => store.getters.currentTheme)

const loading = ref(false)

const goToEditForm = (form) => {
    router.push({ query: { edit_form: form } })
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

// Watch que observa o editForm e aplica a cor adequada
watch(
    () => editForm.value,
    (newVal) => {
        // Se estiver na tela de edição (editForm existe)
        if (newVal) {

            console.log('adicionar')
            // Bloco específico para o modo de edição (igual ao que você forneceu)
            if (currentTheme.value === 'dark' || currentTheme.value === 'system') {
                if (currentTheme.value === 'dark') {
                    window?.WTN?.setNavigationBarColor({ color: '#181818' });
                    window?.WTN?.statusBar({
                        style: 'light',
                        color: '181818',
                        overlay: false
                    });
                } else if (currentTheme.value === 'system') {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (isDark) {
                        window?.WTN?.setNavigationBarColor({ color: '#181818' });
                        window?.WTN?.statusBar({
                            style: 'light', // ou 'dark'? Verifique se deve ser 'light' ou 'dark' para o modo escuro
                            color: '181818',
                            overlay: false
                        });
                    }
                }
            }
        } else {
            // Caso contrário (voltou para a lista de opções), restaura a cor padrão
            setThemeColor(currentTheme.value);
        }
    }
);

</script>