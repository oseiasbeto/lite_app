<!-- components/User/UserSuggestionsCarousel.vue -->
<template>
    <div v-if="!loadingFetch" class="w-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3" :class="`px-[${startSpacing}]`">
            <h3 class="text-base font-semibold text-x-light-textPrimary dark:text-x-dark-textPrimary">
                {{ title }}
            </h3>
            <RouterLink :to="seeAllRoute"
                class="text-sm font-semibold text-x-light-blue dark:text-x-dark-blue hover:opacity-80 transition-opacity">
                Ver tudo
            </RouterLink>
        </div>
        <!-- Carousel -->
        <div ref="carouselEl" class="flex gap-3 overflow-x-auto scroll-smooth pb-1 no-scrollbar"
            :style="{ paddingLeft: startSpacing, paddingRight: endSpacing }">
            <div v-for="user in filteredUsers" :key="user._id"
                class="flex-shrink-0 w-[153px] h-[222px] snap-start flex flex-col items-center gap-1.5 py-2 px-2 rounded-[12px] border border-x-light-border dark:border-x-dark-border dark:bg-x-dark-surface dark:hover:bg-x-dark-bgSecondary/60 transition-colors cursor-pointer"
                @click="goToProfile(user._id)">

                <div class="flex items-center h-[160px] w-full min-w-0">
                    <div class="flex flex-col items-center w-full min-w-0 px-1">
                        <img :src="user.profile_image?.thumbnails?.md || user?.profile_image?.url" :alt="user.username"
                            class="w-[96px] h-[96px] mb-2.5 rounded-full object-cover border border-x-light-borderPrimary dark:border-x-dark-borderPrimary"
                            loading="lazy" />

                        <div class="flex items-center gap-1 w-full min-w-0">
                            <span
                                class="block w-full min-w-0 text-center text-sm font-semibold truncate text-x-light-textPrimary dark:text-x-dark-textPrimary">
                                {{ user.username }}
                            </span>
                            <svg v-if="user?.is_verified" :class="{ 'w-[12px] h-[12px]': isParentPost }"
                                viewBox="0 0 22 22" aria-label="Verified account" role="img"
                                class="w-[16px] h-[16px] text-x-light-blue ml-[3px]" fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg" data-testid="icon-verified">
                                <g>
                                    <path
                                        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z">
                                    </path>
                                </g>
                            </svg>
                        </div>


                        <span v-if="user.name"
                            class="block w-full min-w-0 text-center text-sm truncate text-x-light-textTertiary dark:text-x-dark-textTertiary">
                            {{ user.name }}
                        </span>
                    </div>
                </div>

                <button v-if="showBtnFollow" type="button" :disabled="isFollowLoading(user._id)"
                    @mouseenter="hoveringId = user._id" @mouseleave="hoveringId = null"
                    class="mt-1 w-full text-xs font-bold h-[32px] rounded-lg transition-colors disabled:opacity-60"
                    :class="isFollowing(user._id)
                        ? ' text-base dark:border-x-dark-border text-x-light-textPrimary dark:text-x-dark-textPrimary bg-x-light-surface dark:bg-x-dark-surface'
                        : 'bg-black text-white dark:bg-white dark:text-black'" @click.stop="onFollowClick(user)">
                    <SpinnerSmall v-if="isFollowLoading(user._id)" class="mx-auto" />

                    <template v-else>
                        <span class="text-sm">
                            {{ isFollowing(user._id) ? (hoveringId === user._id ? 'A seguir' : 'Seguindo') : 'Seguir' }}
                        </span>
                        
                    </template>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

const router = useRouter();
const store = useStore();

const props = defineProps({
    users: { type: Array, required: true },
    loadingFetch: { type: Boolean, default: false },
    showBtnFollow: { type: Boolean, default: true },
    emptyMessage: { type: String, default: 'Nenhuma sugestão no momento.' },
    title: { type: String, default: 'Sugestões para você' },
    seeAllRoute: { type: [String, Object], default: '/people' },
    defaultAvatar: { type: String, default: '/images/default-avatar.png' },
    excludeUserId: { type: String, default: null },
    startSpacing: { type: String, default: '4px' },
    endSpacing: { type: String, default: '4px' },
});

const emit = defineEmits(['on-follow']);

const carouselEl = ref(null);
const hoveringId = ref(null);
const followLoadingIds = reactive(new Set());

const currentUser = computed(() => store.getters.currentUser);

const filteredUsers = computed(() => {
    if (!props.excludeUserId) return props.users;
    return props.users.filter((u) => u._id !== props.excludeUserId);
});

// Bug conhecido do Chrome/Safari: scroll-snap + padding não é considerado
// no primeiro paint, só depois de um evento de scroll real. Forçamos um
// "nudge" de 1px pra obrigar o browser a recalcular o layout do snap.
const fixInitialSnapPadding = () => {
    const el = carouselEl.value;
    if (!el) return;
    requestAnimationFrame(() => {
        el.scrollLeft = 1;
        requestAnimationFrame(() => {
            el.scrollLeft = 0;
        });
    });
};

watch(
    () => [props.loadingFetch, filteredUsers.value.length],
    async () => {
        if (props.loadingFetch || !filteredUsers.value.length) return;
        await nextTick();
        fixInitialSnapPadding();
    },
    { immediate: true }
);

const isFollowing = (userId) => !!currentUser.value?.following?.includes(userId);
const isFollowLoading = (userId) => followLoadingIds.has(userId);

const goToProfile = (userId) => {
    router.push({ path: '/profile/' + userId });
};

const onFollowClick = async (user) => {
    if (isFollowLoading(user._id)) return;
    followLoadingIds.add(user._id);
    try {
        await store.dispatch('followUser', { userId: user._id, currentUserId: user._id });
        emit('on-follow', user);
    } finally {
        followLoadingIds.delete(user._id);
    }
};
</script>

<style scoped>
.no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}
</style>