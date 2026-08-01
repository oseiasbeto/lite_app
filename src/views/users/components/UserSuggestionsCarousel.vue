<!-- components/User/UserSuggestionsCarousel.vue -->
<template>
    <div class="w-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3"
        :class="`px-[${startSpacing}]`"
        >
            <h3 class="text-sm font-semibold text-x-light-textPrimary dark:text-x-dark-textPrimary">
                {{ title }}
            </h3>
            <RouterLink :to="seeAllRoute"
                class="text-xs font-semibold text-x-light-brand dark:text-x-dark-brand hover:opacity-80 transition-opacity">
                Ver tudo
            </RouterLink>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loadingFetch" class="flex gap-3 overflow-hidden px-1">
            <div v-for="n in 6" :key="n"
                class="flex-shrink-0 w-[153px] bg-x-light-surface dark:bg-x-dark-surface flex flex-col items-center gap-2 py-2">
                <div class="w-[96px] h-[96px] rounded-full bg-x-light-bgSecondary dark:bg-x-dark-bgSecondary animate-pulse" />
                <div class="w-20 h-2.5 rounded bg-x-light-bgSecondary dark:bg-x-dark-bgSecondary animate-pulse" />
                <div class="w-14 h-2 rounded bg-x-light-bgSecondary dark:bg-x-dark-bgSecondary animate-pulse" />
                <div class="w-16 h-6 rounded-md bg-x-light-bgSecondary dark:bg-x-dark-bgSecondary animate-pulse mt-1" />
            </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!filteredUsers.length"
            class="text-center py-6 text-x-light-textTertiary dark:text-x-dark-textTertiary text-sm">
            {{ emptyMessage }}
        </div>

        <!-- Carousel -->
        <div v-else ref="carouselEl"
            class="flex gap-3 overflow-x-auto scroll-smooth pb-1 no-scrollbar"
            :style="{ paddingLeft: startSpacing, paddingRight: endSpacing }">
            <div v-for="user in filteredUsers" :key="user._id"
                class="flex-shrink-0 w-[153px] h-[222px] snap-start flex flex-col items-center gap-1.5 py-2 px-2 rounded-[12px] border border-x-light-border dark:border-x-dark-border bg-x-light-surface dark:bg-x-dark-surface dark:hover:bg-x-dark-bgSecondary/60 transition-colors cursor-pointer"
                @click="goToProfile(user._id)">

                <div class="flex items-center h-[160px] w-full min-w-0">
                    <div class="flex flex-col items-center w-full min-w-0 px-1">
                        <img :src="user.profile_image?.thumbnails?.md || user?.profile_image?.url" :alt="user.username"
                            class="w-[96px] h-[96px] mb-2.5 rounded-full object-cover border border-x-light-borderPrimary dark:border-x-dark-borderPrimary"
                            loading="lazy" />

                        <span
                            class="block w-full min-w-0 text-center text-sm font-semibold truncate text-x-light-textPrimary dark:text-x-dark-textPrimary">
                            {{ user.username }}
                        </span>

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
                        ? 'border border-x-light-border dark:border-x-dark-border text-x-light-textPrimary dark:text-x-dark-textPrimary bg-x-light-surface dark:bg-x-dark-surface'
                        : 'bg-black text-white dark:bg-white dark:text-black'"
                    @click.stop="onFollowClick(user)">
                    <SpinnerSmall v-if="isFollowLoading(user._id)" class="mx-auto" />
                    <template v-else>
                        {{ isFollowing(user._id) ? (hoveringId === user._id ? 'A seguir' : 'Seguindo') : 'Seguir' }}
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