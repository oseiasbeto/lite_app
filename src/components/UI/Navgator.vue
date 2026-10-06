<template>
    <transition enter-active-class="transition-transform duration-100 ease-out"
        leave-active-class="transition-transform duration-100 ease-in" enter-from-class="translate-y-full"
        enter-to-class="translate-y-0" leave-from-class="translate-y-0" leave-to-class="translate-y-full">
        <nav v-show="showBottomNav" aria-label="Navegação principal"
            class="fixed inset-x-0 bottom-0 z-[999] w-full border-t border-[#eff3f4] bg-x-light-bg/90 pb-[env(safe-area-inset-bottom,0px)] text-text-primary backdrop-blur-md [-webkit-tap-highlight-color:transparent] dark:border-[#2f3336] dark:bg-x-dark-bg/80"
            :class="{ 'pointer-events-none': isDisabled, '!border-border-primary': route.name === 'Post details' }">
            <ul class="flex h-[52px] w-full items-stretch">

                <!-- Início -->
                <li class="h-full flex-1">
                    <button type="button" @click="router.replace('/home')" aria-label="Início"
                        :aria-current="isActive('Home') ? 'page' : undefined" :class="itemClass">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Home')" viewBox="0 0 24 24" :class="iconClass" fill="currentColor"
                                aria-hidden="true">
                                <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="currentColor" aria-hidden="true">
                                <path d="M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5h-13c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z" />
                            </svg>
                        </span>
                    </button>
                </li>

                <!-- Mensagens -->
                <li class="h-full flex-1">
                    <router-link to="/chats" aria-label="Mensagens"
                        :aria-current="isActive('Chats') ? 'page' : undefined" :class="itemClass">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Chats')" viewBox="0 0 24 24" :class="iconClass" fill="currentColor"
                                aria-hidden="true">
                                <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V8l-10 4.5L1.998 8V5.5zm0 5.2l10 4.5 10-4.5v7.8c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-7.8z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="currentColor" aria-hidden="true">
                                <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z" />
                            </svg>
                            <span v-show="unreadMessagesCount > 0" :class="badgeClass">
                                {{ formatBadge(unreadMessagesCount) }}
                            </span>
                        </span>
                    </router-link>
                </li>

                <!-- Vídeos -->
                <li class="h-full flex-1">
                    <router-link to="/reels" aria-label="Vídeos"
                        :aria-current="isActive('Reels') ? 'page' : undefined" :class="itemClass">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Reels')" viewBox="0 0 24 24" :class="iconClass" fill="currentColor"
                                aria-hidden="true">
                                <path d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4zm4.25 6.134a.75.75 0 0 0-1.125.65v6.432a.75.75 0 0 0 1.125.65l5.5-3.216a.75.75 0 0 0 0-1.3l-5.5-3.216z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="currentColor" aria-hidden="true">
                                <path d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6zm4.25 4.134a.75.75 0 0 0-1.125.65v6.432a.75.75 0 0 0 1.125.65l5.5-3.216a.75.75 0 0 0 0-1.3l-5.5-3.216z" />
                            </svg>
                        </span>
                    </router-link>
                </li>

                <!-- Notificações -->
                <li class="h-full flex-1">
                    <button type="button" @click="goToNotification" aria-label="Notificações"
                        :aria-current="isActive('Notifications') ? 'page' : undefined" :class="itemClass">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Notifications')" viewBox="0 0 24 24" :class="iconClass"
                                fill="currentColor" aria-hidden="true">
                                <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="currentColor" aria-hidden="true">
                                <path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.234l-1.141-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z" />
                            </svg>
                            <span v-show="unreadNotificationsCount > 0" :class="badgeClass">
                                {{ formatBadge(unreadNotificationsCount) }}
                            </span>
                        </span>
                    </button>
                </li>

                <!-- Perfil -->
                <li class="h-full flex-1">
                    <button type="button" @click="goToProfile(user)" aria-label="Perfil"
                        :aria-current="isActive('Profile') ? 'page' : undefined" :class="itemClass">
                        <span :class="iconWrapClass">
                            <svg v-if="isActive('Profile')" viewBox="0 0 24 24" :class="iconClass" fill="currentColor"
                                aria-hidden="true">
                                <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" :class="iconClass" fill="currentColor" aria-hidden="true">
                                <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z" />
                            </svg>
                        </span>
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

// Classes reutilizadas (estilo X: ícones sem texto, mesma cor ativo/inativo)
const itemClass =
    'group flex h-full w-full items-center justify-center text-inherit outline-none'
const iconWrapClass =
    'relative flex h-10 w-10 items-center justify-center rounded-full transition duration-150 ease-out group-active:scale-90 group-active:bg-black/5 dark:group-active:bg-white/10'
const iconClass = 'h-[26px] w-[26px]'
const badgeClass =
    'absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1d9bf0] px-1 text-[11px] font-bold leading-none text-white ring-2 ring-x-light-bg dark:ring-x-dark-bg'

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