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
                    <svg class="mx-auto" v-if="route.name === 'Home'" xmlns="http://www.w3.org/2000/svg" width="27"
                        height="27" viewBox="0 0 24 24" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M20.479 7.57827L15.093 3.12502C13.2787 1.62499 10.7213 1.62499 8.90703 3.12502L3.52097 7.57827C2.55059 8.38059 2 9.59705 2 10.8663V17.8109C2 20.066 3.73415 22 6 22H8C9.10457 22 10 21.1046 10 20V16.7478C10 15.4803 10.9521 14.5587 12 14.5587C13.0479 14.5587 14 15.4803 14 16.7478V20C14 21.1046 14.8954 22 16 22H18C20.2659 22 22 20.066 22 17.8109V10.8663C22 9.59706 21.4494 8.38059 20.479 7.57827Z"
                            fill="currentColor" />
                    </svg>

                    <svg class="mx-auto" v-else xmlns="http://www.w3.org/2000/svg" width="27" height="27"
                        viewBox="0 0 24 24" fill="none">
                        <path
                            d="M21 17.8109V10.8663C21 9.88216 20.5726 8.95316 19.8418 8.34896L14.4558 3.89571C13.0113 2.70143 10.9887 2.70143 9.54424 3.89571L4.15818 8.34896C3.42742 8.95316 3 9.88216 3 10.8663V17.8109C3 19.5722 4.34315 21 6 21H8C8.55228 21 9 20.5523 9 20V16.7478C9 14.9865 10.3431 13.5587 12 13.5587C13.6569 13.5587 15 14.9865 15 16.7478V20C15 20.5523 15.4477 21 16 21H18C19.6569 21 21 19.5722 21 17.8109Z"
                            stroke="currentColor" stroke-width="2" />
                    </svg>
                </button>
            </li>

            <li class="flex-1 h-full active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive">
                <router-link class="flex outline-none text-inherit relative items-center h-full"
                    :class="{ 'text-primary': route.name == 'Chats' }" to="/chats">
                    <svg v-if="route.name === 'Chats'" aria-label="Mensagens" role="img" viewBox="0 0 22 22"
                        class="w-[23px] h-[23px] mx-auto">
                        <title>Mensagens</title>
                        <path
                            d="M5.85195 21.4694L19.3245 14.0577C20.3799 13.477 21.1437 12.4247 21.2273 11.2231C21.3235 9.84073 20.6427 8.59809 19.4491 7.94169L5.99304 0.539493C4.62004 -0.215795 2.90086 -0.199435 1.63504 0.724303C0.58005 1.49419 0 2.65449 0 3.88663C0 4.24341 0.0481501 4.60548 0.1483 4.96612L1.33112 9.25543C1.44906 9.68303 1.83808 9.97933 2.28172 9.97933H14.3338C14.8788 9.97933 15.3199 10.4208 15.3199 10.9654C15.3199 11.5099 14.8788 11.9515 14.3338 11.9515H2.28172C1.83808 11.9515 1.44906 12.2477 1.33112 12.6754L0.19476 16.7962C-0.22893 18.3326 0.20275 20.0322 1.43072 21.0482C2.70569 22.103 4.40849 22.2628 5.85195 21.4694Z"
                            fill="currentColor"></path>
                    </svg>

                    <svg v-else aria-label="Mensagens" role="img" viewBox="0 0 24 24" class="w-[23px] h-[23px] mx-auto"
                        style="">
                        <title>Mensagens</title>
                        <path clip-rule="evenodd"
                            d="M1.28991 6.08111C0.300992 2.49678 4.11016 -0.512612 7.36803 1.27936L20.9452 8.74811C23.5084 10.1583 23.5084 13.8418 20.9452 15.252L7.36803 22.7208C4.11015 24.5127 0.30101 21.5033 1.28991 17.919L2.92272 12.0001L1.28991 6.08111ZM5.17174 13.2501L3.70006 18.584C3.29928 20.0367 4.84259 21.2564 6.16295 20.5303L19.3973 13.2501H5.17174ZM6.16295 3.46979C4.84258 2.74374 3.29928 3.96344 3.70006 5.41607L5.17174 10.7501H19.3973L6.16295 3.46979Z"
                            fill="currentColor" fill-rule="evenodd"></path>
                    </svg>
                    <span v-show="unreadMessagesCount > 0"
                        class="min-w-4 h-4 dark:shadow-[rgb(32,32,32),0px_0px_0px_2px] text-[10px] p-0.5 flex items-center justify-center rounded-3xl font-semibold absolute top-[10px] right-[12px] bg-x-light-blue text-[#fff]">
                        <span>{{ unreadMessagesCount }}</span>
                    </span>
                </router-link>
            </li>


            <li class="flex-1 flex justify-center items-center h-full">
                <button @click="goToComposer('feed')"
                    class="w-[44px] h-[40px] rounded-[12px] bg-x-light-surface dark:bg-x-dark-surface text-x-light-textSecondary flex justify-center items-center dark:text-x-dark-textSecondary">
                    <svg aria-label="Criar" role="img" viewBox="0 0 24 24" class="w-[24px] h-[24px] text-inherit">
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