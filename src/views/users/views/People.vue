<template>
    <div class="flex flex-col h-screen">
        <div class="px-4 py-2 pb-3 shrink-0 bg-x-light-bg dark:bg-x-dark-bg">
            <div class="flex items-center w-full pb-2 shrink-0">
                <button @click="router.back"
                    class="p-1 hover:bg-x-light-surfaceHover active:bg-x-light-surfaceActive dark:hover:bg-x-dark-surfaceHover dark:active:bg-x-dark-surfaceActive text-inherit mr-1 rounded-full transition-colors">
                    <svg aria-label="Voltar" class="text-inherit" fill="currentColor" height="24" role="img"
                        viewBox="0 0 24 24" width="24">
                        <title>Voltar</title>
                        <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line>
                        <polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polyline>
                    </svg>
                </button>
                <div class="flex flex-row items-center leading-tight pl-1 flex-1 min-w-0">
                    <span class="font-bold text-xl truncate text-inherit">Encontrar pessoas</span>

                </div>
            </div>

            <div class="h-[30px] w-full flex items-center relative">
                <span class="absolute dark:text-x-dark-textTertiary text-x-light-textTertiary text-inherit left-[8px]">
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm10.45 2.95L16 16l4.95 4.95Z"
                            class="icon_svg-stroke" stroke="currentColor" stroke-width="1.8" fill="none"
                            stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </span>
                <input
                    class="h-full pl-[34px] placeholder 
                    dark:text-x-dark-textTertiary text-base bg-x-light-surfaceHover dark:bg-x-dark-surface text-inherit px-2 outline-none w-full rounded-lg"
                    v-model="searchQuery" @input="onSearchInput" placeholder="Pesquisar" />
            </div>
        </div>


        <!-- Este é o container que REALMENTE tem o scroll — é essa referência
             que precisa ir para o scroll-target do VirtualizedUserList, senão
             ele escuta scroll no lugar errado e a virtualização não funciona -->
        <div ref="scrollContainer" class="bg-white dark:bg-transparent flex-1 overflow-y-auto">
            <!-- Sem texto digitado: sugestões de usuário, estilo "Quem seguir" do X -->
            <template v-if="!searchQuery?.length">

                <div v-if="suggestionsError" class="px-4 py-3 text-sm text-red-500">{{ suggestionsError }}</div>

                <VirtualizedUserList v-else :users="suggestedUsers" :loading-fetch="suggestionsLoading"
                    :loading-load-more="suggestionsLoadingMore" :has-more="suggestionsHasMore" :show-btn-follow="true"
                    :scroll-target="scrollContainer" empty-message="Sem sugestões no momento."
                    @on-load-more="loadMoreSuggestions" />
            </template>

            <!-- Com texto digitado: resultados da busca, mesmo componente virtualizado -->
            <template v-else>
                <div v-if="hasError" class="px-4 py-3 text-sm text-red-500">{{ hasError }}</div>

                <VirtualizedUserList v-else :users="results" :loading-fetch="isLoading"
                    :loading-load-more="searchLoadingMore" :has-more="searchHasMore" :show-btn-follow="false"
                    :scroll-target="scrollContainer" empty-message="Nenhum usuário encontrado."
                    @on-load-more="loadMoreSearchResults" />
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { debounce } from 'lodash';
import VirtualizedUserList from '@/views/users/components/VirtualizedUserList.vue';

const router = useRouter();
const store = useStore();
const searchQuery = ref('');

// Referência do elemento que tem o overflow-y real da tela de busca
const scrollContainer = ref(null);

// === Busca por texto ===
const results = computed(() => store.getters['search/searchResults']);
const isLoading = computed(() => store.getters['search/isLoading']);
const hasError = computed(() => store.getters['search/hasError']);
const searchHasMore = computed(() => store.getters['search/searchHasMore']);
const searchLoadingMore = computed(() => store.getters['search/searchLoadingMore']);

// === Sugestões (antes de digitar) ===
const suggestedUsers = computed(() => store.getters['search/suggestedUsers']);
const suggestionsLoading = computed(() => store.getters['search/suggestionsLoading']);
const suggestionsLoadingMore = computed(() => store.getters['search/suggestionsLoadingMore']);
const suggestionsError = computed(() => store.getters['search/suggestionsError']);
const suggestionsHasMore = computed(() => store.getters['search/suggestionsHasMore']);

const onSearchInput = debounce(async () => {
    if (searchQuery.value) {
        await store.dispatch('search/getUsersAutocomplete', { query: searchQuery.value });
    } else {
        store.dispatch('search/clearSearch');
    }
}, 300);

const loadMoreSearchResults = () => {
    store.dispatch('search/loadMoreSearchResults');
};

const loadMoreSuggestions = () => {
    store.dispatch('search/loadMoreSuggestions');
};

onMounted(() => {
    store.dispatch('search/clearSearch');
    // Carrega sugestões assim que a tela abre, antes do usuário digitar
    store.dispatch('search/getSuggestedUsers');
});

onUnmounted(() => {
    store.dispatch('search/clearSuggestions');
});
</script>