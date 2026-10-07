<template>
    <transition enter-active-class="transition-transform duration-100 ease-out"
        leave-active-class="transition-transform duration-100 ease-in" enter-from-class="translate-y-full"
        enter-to-class="translate-y-0" leave-from-class="translate-y-0" leave-to-class="translate-y-full">
        <!--Barra solida (branca / preta) com linha fina no topo, como a do TikTok-->
        <nav v-show="showBottomNav" aria-label="Navegação principal"
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

                <!-- Vídeos / Reels (planeta com anel, maior, legenda alinhada) -->
                <li class="h-full flex-1">
                    <router-link to="/reels" aria-label="Vídeos" :aria-current="isReelsActive ? 'page' : undefined"
                        :class="itemClass(isReelsActive)">
                        <span :class="iconWrapClass">
                            <svg viewBox="0 0 24 24" class="h-[28px] w-[28px] shrink-0" fill="none"
                                stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                                aria-hidden="true">
                                <defs>
                                    <!-- Abre um espaço no planeta onde o anel da frente passa -->
                                    <mask id="planet-ring-gap" maskUnits="userSpaceOnUse" x="-4" y="-4" width="32"
                                        height="32">
                                        <rect x="-4" y="-4" width="32" height="32" fill="white" stroke="none" />
                                        <path d="M1.5 12A10.5 3.5 0 0 0 22.5 12" fill="none" stroke="black"
                                            stroke-width="4.4" stroke-linecap="butt" />
                                    </mask>
                                </defs>

                                <g transform="rotate(-22 12 12)">
                                    <!-- Anel: parte de trás (só as pontas visíveis fora do planeta) -->
                                    <path d="M1.5 12A10.5 3.5 0 0 1 6.83 8.95" />
                                    <path d="M17.17 8.95A10.5 3.5 0 0 1 22.5 12" />

                                    <!-- Planeta (preenchido quando a rota é /reels) -->
                                    <circle cx="12" cy="12" r="6" mask="url(#planet-ring-gap)"
                                        :fill="isReelsActive ? 'currentColor' : 'none'" />

                                    <!-- Anel: parte da frente -->
                                    <path d="M1.5 12A10.5 3.5 0 0 0 22.5 12" />
                                </g>

                                <!-- Estrela de brilho -->
                                <path d="M5 2.8l.65 1.55L7.2 5l-1.55.65L5 7.2l-.65-1.55L2.8 5l1.55-.65z"
                                    fill="currentColor" stroke="none" />
                            </svg>
                        </span>
                        <span :class="labelClass(isReelsActive)">Mundo</span>
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
    showBottomNav: {
        type: Boolean,
        default: true
    }
})

// --- Apenas apresentação ---
const isActive = (name) => route.name === name

// O separador "Vídeos" fica ativo em qualquer rota /reels (o nome da rota pode variar)
const isReelsActive = computed(() => route.path?.startsWith('/reels'))

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