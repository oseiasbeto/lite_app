<template>
    <transition enter-active-class="transition-transform duration-100 ease-out"
        leave-active-class="transition-transform duration-100 ease-in" enter-from-class="translate-y-full"
        enter-to-class="translate-y-0" leave-from-class="translate-y-0" leave-to-class="translate-y-full">
        <ul v-show="showBottomNav"
            class="flex dark:bg-x-dark-bg bg-x-light-bg z-[999] items-center gap-2 w-full h-14 text-text-primary fixed bottom-0 overflow-hidden"
            :class="{ 'pointer-events-none': isDisabled, '!border-border-primary': route.name === 'Post details' }">
            <li class="flex-1 h-full active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive">
                <button @click="router.replace('/home')" :class="{ 'text-primary': route.name == 'Home' }"
                    class="flex relative items-center w-full h-full" to="/feed">

                    <svg v-if="route.name === 'Home'" fill="none" class="mx-auto" width="27" viewBox="0 0 24 24"
                        height="27" aria-hidden="true">
                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                            d="M12.63 1.724a1 1 0 0 0-1.26 0l-8 6.5A1 1 0 0 0 3 9v11a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V9a1 1 0 0 0-.37-.776l-8-6.5Z">
                        </path>
                    </svg>

                    <svg v-else fill="none" width="27" viewBox="0 0 24 24" height="27" aria-hidden="true"
                        class="mx-auto">
                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                            d="M11.37 1.724a1 1 0 0 1 1.26 0l8 6.5A1 1 0 0 1 21 9v11a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-5h-2v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 .37-.776l8-6.5ZM5 9.476V19h4v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5h4V9.476l-7-5.688-7 5.688Z">
                        </path>
                    </svg>
                </button>
            </li>

            <li class="flex-1 h-full active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive">
                <router-link class="flex outline-none text-inherit relative items-center h-full"
                    :class="{ 'text-primary': route.name == 'Chats' }" to="/chats">

                    <svg v-if="route.name === 'Chats'" xmlns="http://www.w3.org/2000/svg"
                        class="w-[24px] h-[24px] mx-auto" width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                        <g id="style=fill">
                            <g id="message">
                                <path id="Subtract" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M22.5618 6.62281C23.5345 3.43985 20.5863 0.43971 17.3938 1.44593L17.3918 1.44656L4.13385 5.55475C0.321194 6.75095 0.276533 12.1486 4.07556 13.422L7.70072 14.6431L7.70334 14.644C8.48677 14.9047 9.10562 15.5095 9.36293 16.2972L9.36535 16.3045L10.5881 19.9219L10.5884 19.923C11.8679 23.7517 17.2516 23.6582 18.4449 19.8408L22.5618 6.62281ZM6.07438 11.4215C5.68183 11.2893 5.47081 10.8639 5.60304 10.4714C5.73527 10.0788 6.16068 9.86779 6.55322 10L10.1769 11.2207L10.1782 11.2211C10.5695 11.3515 10.9363 11.5378 11.2677 11.7723C11.4809 11.9232 11.6795 12.0941 11.8604 12.2829C12.2734 12.7139 12.5941 13.2376 12.7874 13.8276L14.0099 17.4441C14.1425 17.8365 13.9319 18.2622 13.5395 18.3948C13.1471 18.5274 12.7215 18.3169 12.5888 17.9245L11.3652 14.3045L11.3628 14.2972C11.241 13.9242 11.0389 13.5936 10.7774 13.3208C10.6629 13.2013 10.5369 13.0928 10.4011 12.9967C10.1898 12.8471 9.95495 12.7277 9.70325 12.6439L6.07438 11.4215Z"
                                    fill="currentColor" />
                            </g>
                        </g>
                    </svg>
                    <svg v-else class="w-[24px] h-[24px] mx-auto" xmlns="http://www.w3.org/2000/svg" width="100%"
                        height="100%" viewBox="0 0 24 24" fill="none">
                        <g id="style=linear">
                            <g id="message">
                                <path id="vector"
                                    d="M4.31393 12.711L7.94019 13.9325C8.26194 14.0395 8.56301 14.1925 8.83454 14.3847C9.00903 14.5082 9.17132 14.6479 9.31906 14.8021C9.65673 15.1544 9.91837 15.5822 10.0759 16.0645L11.2995 19.6845C12.3451 22.8159 16.75 22.7493 17.7289 19.6179L21.8446 6.40374C22.2437 5.09764 21.8416 3.83567 21.0155 3C20.1841 2.15896 18.9233 1.74972 17.6176 2.1619L4.35842 6.2705C1.24384 7.24767 1.19935 11.6672 4.31393 12.711Z"
                                    stroke="currentColor" stroke-width="2.3" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </g>
                        </g>
                    </svg>
                    <span v-show="unreadMessagesCount > 0"
                        class="min-w-4 h-4 dark:shadow-[rgb(32,32,32),0px_0px_0px_2px] text-[10px] p-0.5 flex items-center justify-center rounded-3xl font-semibold absolute top-[10px] right-[12px] bg-x-light-blue text-[#fff]">
                        <span>{{ unreadMessagesCount }}</span>
                    </span>
                </router-link>
            </li>
            

            <li
                class="flex-1 flex justify-center items-center h-full">
                <button
                @click="goToComposer('feed')"
                    class="w-[44px] h-[40px] rounded-[12px] bg-x-light-surface dark:bg-x-dark-surface text-x-light-textSecondary flex justify-center items-center dark:text-x-dark-textSecondary">
                    <svg aria-label="Criar" role="img" viewBox="0 0 24 24"
                        class="w-[24px] h-[24px] text-inherit"
                       >
                        <title>Criar</title>
                        <path
                            d="M13.25 3.00001C13.25 2.30965 12.6904 1.75001 12 1.75001C11.3096 1.75001 10.75 2.30965 10.75 3.00001V10.75H3C2.30964 10.75 1.75 11.3097 1.75 12C1.75 12.6904 2.30964 13.25 3 13.25H10.75V21C10.75 21.6904 11.3096 22.25 12 22.25C12.6904 22.25 13.25 21.6904 13.25 21V13.25H21C21.6904 13.25 22.25 12.6904 22.25 12C22.25 11.3097 21.6904 10.75 21 10.75H13.25V3.00001Z"
                            fill="currentColor" stroke-width="1.5"></path>
                    </svg>
                </button>
            </li>

            

            <li class="flex-1 h-full active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive">
                <button @click="goToNotification" class="flex relative items-center w-full h-full"
                    :class="{ 'text-primary': route.name == 'Notifications' }">
                    <svg v-if="route.name === 'Notifications'" aria-label="Notificações" role="img" viewBox="0 0 24 24"
                        class="w-[24px] h-[24px] mx-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <title>Notificações</title>
                        <path
                            d="M16.4045 1.50879C14.785 1.50879 13.2185 2.16259 12 3.30764C10.7815 2.16259 9.215 1.50879 7.5955 1.50879C3.41766 1.50879 0.5 4.62796 0.5 9.09411C0.5 13.7857 4.70617 18.9703 11.2153 22.3022C11.4605 22.428 11.7298 22.4912 11.9995 22.4912C12.2692 22.4912 12.5395 22.428 12.7847 22.3022C19.2938 18.9703 23.5 13.7857 23.5 9.09411C23.5 4.62796 20.5823 1.50879 16.4045 1.50879Z"
                            fill="currentColor"></path>
                    </svg>

                    <svg v-else aria-label="Notificações" role="img" viewBox="0 0 24 24"
                        class="w-[24px] h-[24px] mx-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <title>Notificações</title>
                        <path
                            d="M16.4045 1.50879C14.785 1.50879 13.2185 2.16259 12 3.30764C10.7815 2.16259 9.215 1.50879 7.5955 1.50879C3.41766 1.50879 0.5 4.62796 0.5 9.09411C0.5 13.7857 4.70617 18.9703 11.2153 22.3022C11.4605 22.428 11.7298 22.4912 11.9995 22.4912C11.9993 22.4912 11.9997 22.4912 11.9995 22.4912C12.2692 22.4912 12.5395 22.428 12.7847 22.3022C19.2938 18.9703 23.5 13.7857 23.5 9.09411C23.5 4.62796 20.5823 1.50879 16.4045 1.50879ZM12 19.9518C6.65166 17.1137 2.94684 12.6864 2.94684 9.09411C2.94684 5.97251 4.77133 3.95556 7.5955 3.95556C9.825 3.95556 11.0773 5.80961 12 7.26504C12.9227 5.80961 14.175 3.95556 16.4045 3.95556C19.2287 3.95556 21.0532 5.97251 21.0532 9.09411C21.0532 12.6864 17.3483 17.1137 12 19.9518Z"
                            fill="currentColor"></path>
                    </svg>
                    <span v-show="unreadNotificationsCount > 0"
                        class="min-w-4 h-4 dark:shadow-[rgb(32,32,32),0px_0px_0px_2px] text-[10px] p-0.5 flex items-center justify-center rounded-3xl font-semibold absolute top-[10px] right-[12px] bg-x-light-blue text-[#fff]">
                        <span>{{ unreadNotificationsCount }}</span>
                    </span>
                </button>
            </li>

            <li class="flex-1 h-full active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive">
                <button class="flex items-center text-inherit w-full h-full"
                    :class="{ 'text-primary': route.name == 'Profile' }" @click="goToProfile(user)">
                    <svg v-if="route.name === 'Profile'" aria-label="Perfil" role="img" viewBox="0 0 24 24"
                        class="w-[22px] h-[22px] mx-auto">
                        <title>Perfil</title>
                        <path
                            d="M12 0.75C8.82431 0.75 6.25 3.32437 6.25 6.5C6.25 9.67563 8.82431 12.25 12 12.25C15.1757 12.25 17.75 9.67563 17.75 6.5C17.75 3.32437 15.1757 0.75 12 0.75Z"
                            fill="currentColor"></path>
                        <path
                            d="M12 13.75C7.51601 13.75 3.65758 16.4063 1.86595 20.1981C1.12621 21.7637 2.41318 23.25 3.86237 23.25H20.1377C21.5869 23.25 22.8738 21.7637 22.1341 20.1981C20.3425 16.4063 16.484 13.75 12 13.75Z"
                            fill="currentColor"></path>
                    </svg>
                    <svg v-else aria-label="Perfil" role="img" viewBox="0 0 24 24" class="w-[22px] h-[22px] mx-auto"
                        fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <title>Perfil</title>
                        <path clip-rule="evenodd"
                            d="M12 0.75C8.82431 0.75 6.25 3.32437 6.25 6.5C6.25 9.67563 8.82431 12.25 12 12.25C15.1757 12.25 17.75 9.67563 17.75 6.5C17.75 3.32437 15.1757 0.75 12 0.75ZM8.75 6.5C8.75 4.70507 10.205 3.25 12 3.25C13.795 3.25 15.25 4.70507 15.25 6.5C15.25 8.29493 13.795 9.75 12 9.75C10.205 9.75 8.75 8.29493 8.75 6.5Z"
                            fill="currentColor" fill-rule="evenodd"></path>
                        <path
                            d="M12.0003 13.75C6.97423 13.75 2.73384 17.086 1.30779 21.6254C1.10089 22.284 1.46707 22.9856 2.1257 23.1925C2.78432 23.3994 3.48596 23.0333 3.69287 22.3746C4.80482 18.835 8.10976 16.25 12.0003 16.25C15.8909 16.25 19.1958 18.835 20.3078 22.3746C20.5147 23.0333 21.2163 23.3994 21.8749 23.1925C22.5336 22.9856 22.8997 22.284 22.6928 21.6254C21.2668 17.086 17.0264 13.75 12.0003 13.75Z"
                            fill="currentColor"></path>
                    </svg>

                </button>
            </li>
        </ul>
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

const goToComposer = (module, postType) => {
    router.push({
        path: '/composer',
        query: {
            module: module,
            ...(postType && {
                post_type: postType
            })
        }
    })
}

const goToProfile = (u) => {
    if (route?.params?.user_id !== u?._id) {
        router.push(`/profile/${u?._id}`)
    } else {
        router.push(`/profile/${user.value?._id}`)
    }
}

const goToNotification = () => {
    if (route.name === 'Notification') return
    else {
        if (unreadNotificationsCount.value) {
            // resetUnreadNotificationsCount()
        }
        router.push('/notifications')
    }
}
</script>