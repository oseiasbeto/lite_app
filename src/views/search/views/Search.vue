<template>
    <div class="bg-primary flex items-center w-full py-2 pl-[5px] px-4">
        <button @click="router.back" class="pr-1">
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m15 5-7 7 7 7.005" class="icon_svg-stroke" stroke="#fff" stroke-width="1.5" fill="none"
                    stroke-linecap="round"></path>
            </svg>
        </button>
        <div class="h-[30px] w-full flex items-center relative">
            <span class="absolute text-white/[0.8] left-[8px]">
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm10.45 2.95L16 16l4.95 4.95Z"
                        class="icon_svg-stroke" stroke="currentColor" stroke-width="1.8" fill="none"
                        stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </span>
            <input
                class="h-full pl-[28px] placeholder:text-white/[0.8] bg-white/[0.2] text-white px-2 outline-none w-full bg-b"
                v-model="searchQuery" @input="onSearchInput" placeholder="Pesquisar no 1kole..." />
        </div>
    </div>

    <div class="bg-white dark:bg-transparent">
        <div v-if="searchQuery?.length"
            class="flex px-4 py-1.5 border-b border-[#dee0e1] dark:border-[rgb(57,56,57)] w-full items-center">
            <div class="w-7 h-7 shrink-0">
                <svg class="pr-2 ml-0.5 w-full h-full text-[#666] dark:text-inherit shrink-0" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm10.45 2.95L16 16l4.95 4.95Z"
                        class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                </svg>
            </div>

            <p class="flex-1 text-wrap"><span class="text-[#939599] dark:text-[#b1b3b6]">Pesquisar: </span><strong
                    class="text-[#282829] dark:text-inherit">{{ searchQuery }}</strong></p>
        </div>
        <div v-if="isLoading"></div>
        <div v-if="hasError">{{ hasError }}</div>
        <ul v-else>
            <li class="bg-transparent flex items-center py-2 px-4 border-b border-[#dee0e1] dark:border-[rgb(57,56,57)]"
                @click="goToProfile(user?._id)" v-for="user in results" :key="user._id">
                <Avatar :url="user.profile_image?.thumbnails?.md || user?.profile_image?.url" :alt="user.display_name"
                    size="xl" class="mr-2" />
                <p> <span class="text-[#939599]">Perfil:</span> <span class="text-[#282829] dark:text-inherit"> {{
                    user.display_name }}</span></p>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { debounce } from 'lodash'; // ou implementar manualmente
import Avatar from '@/components/Utils/Avatar.vue';

const router = useRouter()

const store = useStore();
const searchQuery = ref('');

const results = computed(() => store.getters['search/searchResults']);
const isLoading = computed(() => store.getters['search/isLoading']);
const hasError = computed(() => store.getters['search/hasError']);

const onSearchInput = debounce(async () => {
    if (searchQuery.value) {
        await store.dispatch('search/getUsersAutocomplete', { query: searchQuery.value });
    } else {
        store.dispatch('search/clearSearch');
    }
}, 300);

const goToProfile = (userId) => {
    router.push({
        path: '/profile/' + userId
    })
}

// Limpa a lista de pesquisa ao montar o componente
onMounted(() => {
    store.dispatch('search/clearSearch');
});
</script>