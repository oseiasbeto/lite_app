<!-- components/User/VirtualizedUserList.vue -->
<template>
    <div ref="scrollContainer" class="relative">
        <div v-if="!loadingFetch">
            <div v-if="users?.length" class="relative" :style="{ height: totalHeight + 'px' }">
                <div v-for="{ user, top } in visibleUsers" :key="user._id"
                    class="absolute left-0 w-full"
                    :style="{ transform: `translateY(${top}px)` }">
                    <UserListItem :user="user" :show-btn-follow="showBtnFollow" @click="goToProfile(user._id)" />
                </div>
            </div>

            <div v-else-if="!loadingFetch" class="text-center py-8 text-x-light-textTertiary dark:text-x-dark-textTertiary text-sm">
                {{ emptyMessage }}
            </div>

            <div ref="loadTrigger" v-if="hasMore || loadingLoadMore" class="py-3.5 flex justify-center">
                <SpinnerSmall />
            </div>
        </div>

        <div v-else>
            <UserSkeleton v-for="n in 6" :key="n" />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useIntersectionObserver, useScroll, useElementSize } from '@vueuse/core';
import { useRouter } from 'vue-router';
import UserListItem from './UserListItem.vue';
import UserSkeleton from './UserSkeleton.vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

const router = useRouter();

const props = defineProps({
    users: { type: Array, required: true },
    loadingFetch: { type: Boolean, default: false },
    loadingLoadMore: { type: Boolean, default: false },
    hasMore: { type: Boolean, default: false },
    showBtnFollow: { type: Boolean, default: true },
    itemHeight: { type: Number, default: 64 }, // altura fixa de cada linha (uniforme, ao contrário dos posts)
    emptyMessage: { type: String, default: 'Nenhum usuário encontrado.' },
    scrollTarget: { type: Object, default: null }, // elemento externo com o scroll real, se houver
});

const emit = defineEmits(['on-load-more']);

const scrollContainer = ref(null);
const loadTrigger = ref(null);
const scrollEl = computed(() => props.scrollTarget || scrollContainer.value);

// Como a altura é uniforme, não precisamos medir cada item (ao contrário do
// PostList): a posição de qualquer índice é só index * itemHeight, e o range
// visível sai direto de uma divisão, sem busca binária nem reactive de alturas.
const BUFFER_ITEMS = 6; // itens extras acima/abaixo do viewport

const { y: scrollTop } = useScroll(scrollEl, { throttle: 50 });
const { height: containerHeight } = useElementSize(scrollEl);

const totalHeight = computed(() => props.users.length * props.itemHeight);

const visibleRange = computed(() => {
    const n = props.users.length;
    if (!n) return { start: 0, end: 0 };

    const firstVisible = Math.floor(scrollTop.value / props.itemHeight);
    const visibleCount = Math.ceil((containerHeight.value || 0) / props.itemHeight);

    const start = Math.max(0, firstVisible - BUFFER_ITEMS);
    const end = Math.min(n, firstVisible + visibleCount + BUFFER_ITEMS);

    return { start, end };
});

const visibleUsers = computed(() => {
    const { start, end } = visibleRange.value;
    return props.users.slice(start, end).map((user, i) => ({
        user,
        top: (start + i) * props.itemHeight,
    }));
});

useIntersectionObserver(loadTrigger, ([{ isIntersecting }]) => {
    if (isIntersecting) emit('on-load-more');
});

const goToProfile = (userId) => {
    router.push({ path: '/profile/' + userId });
};
</script>