<template>
    <transition enter-active-class="transition-transform duration-100 ease-out"
        leave-active-class="transition-transform duration-100 ease-in" enter-from-class="translate-y-full"
        enter-to-class="translate-y-0" leave-from-class="translate-y-0" leave-to-class="translate-y-full">
        <!--Barra solida (branca / preta) com linha fina no topo, como a do TikTok-->
        <!-- Sempre visível (não some ao fazer scroll); só fica oculta na própria tela de criação -->
        <nav v-show="!isComposer" aria-label="Navegação principal"
            class="fixed inset-x-0 bottom-0 z-[999] w-full border-t pb-[env(safe-area-inset-bottom,0px)] text-text-primary backdrop-blur-md [-webkit-tap-highlight-color:transparent]"
            :class="[
                isReelsActive
                    ? 'border-white/10 bg-black'
                    : 'border-black/10 bg-white/95 dark:border-white/10 dark:bg-black/95',
                { 'pointer-events-none': isDisabled, '!border-border-primary': route.name === 'Post details' }
            ]">
            <ul class="flex h-[52px] w-full items-stretch">

                <!-- Início -->
                <li class="h-full flex-1">
                    <button type="button" @click="router.replace('/home')" aria-label="Início"
                        :aria-current="isActive('Home') ? 'page' : undefined" :class="itemClass(isActive('Home'))">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Home')" viewBox="0 0 24 24" :class="iconClass" fill="currentColor"
                                aria-hidden="true">
                                <path
                                    d="M11.1 2.6a1.4 1.4 0 0 1 1.8 0l8 6.7c.5.4.8 1 .8 1.7V20a2 2 0 0 1-2 2h-4.5v-6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 16v6H4.5a2 2 0 0 1-2-2v-9c0-.7.3-1.3.8-1.7l7.8-6.7z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path
                                    d="M11.1 2.6a1.4 1.4 0 0 1 1.8 0l8 6.7c.5.4.8 1 .8 1.7V20a2 2 0 0 1-2 2h-4.5v-6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 16v6H4.5a2 2 0 0 1-2-2v-9c0-.7.3-1.3.8-1.7l7.8-6.7z" />
                            </svg>
                        </span>
                        <span :class="labelClass(isActive('Home'))">Início</span>
                    </button>
                </li>

                <!-- Mensagens -->
                <li class="h-full flex-1">
                    <router-link to="/chats" aria-label="Mensagens"
                        :aria-current="isActive('Chats') ? 'page' : undefined" :class="itemClass(isActive('Chats'))">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Chats')" viewBox="0 0 24 24" :class="iconClass" fill="currentColor"
                                aria-hidden="true">
                                <path
                                    d="M12 3C6.98 3 3 6.58 3 11c0 2.4 1.15 4.55 3 6l-.9 3.6a.6.6 0 0 0 .86.67L9.8 18.9c.7.14 1.45.2 2.2.2 5.02 0 9-3.58 9-8s-3.98-8-9-8z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path
                                    d="M12 3C6.98 3 3 6.58 3 11c0 2.4 1.15 4.55 3 6l-.9 3.6a.6.6 0 0 0 .86.67L9.8 18.9c.7.14 1.45.2 2.2.2 5.02 0 9-3.58 9-8s-3.98-8-9-8z" />
                            </svg>
                            <span v-show="unreadMessagesCount > 0" :class="badgeClass">
                                {{ formatBadge(unreadMessagesCount) }}
                            </span>
                        </span>
                        <span :class="labelClass(isActive('Chats'))">Mensagens</span>
                    </router-link>
                </li>

                <!-- Criar publicação (botão central estilo TikTok) -->
                <li class="h-full flex-1">
                    <router-link to="/composer?module=feed" aria-label="Criar publicação"
                        class="group flex h-full w-full items-center justify-center outline-none">
                        <span class="relative h-[30px] w-[46px] transition duration-150 ease-out group-active:scale-90">
                            <span class="absolute inset-y-0 left-0 w-[38px] rounded-[9px] bg-[#25F4EE]"></span>
                            <span class="absolute inset-y-0 right-0 w-[38px] rounded-[9px] bg-[#FE2C55]"></span>
                            <span :class="createCenterClass"
                                class="absolute inset-y-0 left-[4px] right-[4px] flex items-center justify-center rounded-[8px]">
                                <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor"
                                    stroke-width="3" stroke-linecap="round" aria-hidden="true">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </span>
                        </span>
                    </router-link>
                </li>

                <!-- Notificações -->
                <li class="h-full flex-1">
                    <button type="button" @click="goToNotification" aria-label="Notificações"
                        :aria-current="isActive('Notifications') ? 'page' : undefined"
                        :class="itemClass(isActive('Notifications'))">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Notifications')" viewBox="0 0 24 24" :class="iconClass"
                                fill="currentColor" aria-hidden="true">
                                <path
                                    d="M12 2.5A6.5 6.5 0 0 0 5.5 9v4.1l-1.6 3.1a1 1 0 0 0 .9 1.4h14.4a1 1 0 0 0 .9-1.4l-1.6-3.1V9A6.5 6.5 0 0 0 12 2.5z" />
                                <path d="M9.5 19.5h5a2.5 2.5 0 0 1-5 0z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path
                                    d="M12 2.5A6.5 6.5 0 0 0 5.5 9v4.1l-1.6 3.1a1 1 0 0 0 .9 1.4h14.4a1 1 0 0 0 .9-1.4l-1.6-3.1V9A6.5 6.5 0 0 0 12 2.5z" />
                                <path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" />
                            </svg>
                            <span v-show="unreadNotificationsCount > 0" :class="badgeClass">
                                {{ formatBadge(unreadNotificationsCount) }}
                            </span>
                        </span>
                        <span :class="labelClass(isActive('Notifications'))">Notificações</span>
                    </button>
                </li>

                <!-- Perfil -->
                <li class="h-full flex-1">
                    <button type="button" @click="goToProfile(user)" aria-label="Perfil"
                        :aria-current="isActive('Profile') ? 'page' : undefined"
                        :class="itemClass(isActive('Profile'))">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Profile')" viewBox="0 0 24 24" :class="iconClass" fill="currentColor"
                                aria-hidden="true">
                                <circle cx="12" cy="7.5" r="4" />
                                <path d="M4 21c0-4.1 3.6-6.5 8-6.5s8 2.4 8 6.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <circle cx="12" cy="7.5" r="4" />
                                <path d="M4.5 20.5c.4-3.3 3.4-5.5 7.5-5.5s7.1 2.2 7.5 5.5" />
                            </svg>
                        </span>
                        <span :class="labelClass(isActive('Profile'))">Perfil</span>
                    </button>
                </li>
            </ul>
        </nav>
    </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute()
const router = useRouter()
const store = useStore()

const user = computed(() => store.getters.currentUser)
const unreadNotificationsCount = computed(() => store.getters?.unreadNotificationsCount || 0);
const unreadMessagesCount = computed(() => store.getters?.unreadMessagesCount || 0);

defineProps({
    isDisabled: {
        type: Boolean,
        default: false
    },
    // Mantida para compatibilidade com o componente pai; a barra já não some ao scroll
    showBottomNav: {
        type: Boolean,
        default: true
    }
})

// --- Apenas apresentação ---
const isActive = (name) => route.name === name

// O separador "Vídeos" fica ativo em qualquer rota /reels (o nome da rota pode variar)
const isReelsActive = computed(() => route.path?.startsWith('/reels'))

// A barra só fica oculta na tela de criação de publicação
const isComposer = computed(() => route.path?.startsWith('/composer'))

// Estilo TikTok: ícone + rótulo pequeno; ativo pleno, inativo mais apagado.
// Em /reels a barra fica sempre escura, independentemente do tema do sistema.
const itemClass = (active) => {
    const color = isReelsActive.value
        ? (active ? 'text-white' : 'text-white/55')
        : (active ? 'text-black dark:text-white' : 'text-black/55 dark:text-white/55')
    return 'group flex h-full w-full flex-col items-center justify-center gap-0.5 outline-none ' + color
}
const labelClass = (active) =>
    'text-[10px] leading-3 ' + (active ? 'font-semibold' : 'font-medium')
const iconWrapClass =
    'relative flex h-7 w-7 items-center justify-center transition duration-150 ease-out group-active:scale-90'
const iconClass = 'h-[24px] w-[24px]'
// Miolo do botão criar: contrasta com o fundo da barra (branco no escuro, preto no claro)
const createCenterClass = computed(() =>
    isReelsActive.value
        ? 'bg-white text-black'
        : 'bg-black text-white dark:bg-white dark:text-black'
)
// Badge vermelho TikTok no canto do ícone (o anel acompanha o fundo da barra)
const badgeClass = computed(() =>
    'absolute -right-2 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#FE2C55] px-1 text-[10px] font-bold leading-none text-white ring-2 ' +
    (isReelsActive.value ? 'ring-black' : 'ring-white dark:ring-black')
)

// Contador compacto no badge (99+)
const formatBadge = (n) => (n > 99 ? '99+' : n)

const goToProfile = (u) => {
    if (route?.params?.user_id !== u?._id) {
        router.push(`/profile/${u?._id}`)
    } else {
        router.push(`/profile/${user.value?._id}`)
    }
}

const goToNotification = () => {
    if (route.name === 'Notifications') return
    router.push('/notifications')
}
</script>