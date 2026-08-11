<template>
    <div class="flex flex-col h-screen">
        <div class="bg-primary flex items-center w-full py-2 px-4 shrink-0">
            <button @click="router.back" class="p-1 hover:bg-x-light-surfaceHover active:bg-x-light-surfaceActive dark:hover:bg-x-dark-surfaceHover dark:active:bg-x-dark-surfaceActive text-inherit mr-1 rounded-full transition-colors">
                <svg aria-label="Voltar" class="text-inherit" fill="currentColor" height="24" role="img"
                    viewBox="0 0 24 24" width="24">
                    <title>Voltar</title>
                    <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line>
                    <polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor"
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polyline>
                </svg>
            </button>
            <div class="flex flex-col leading-tight pl-1 flex-1 min-w-0">
                <span class="font-bold text-xl truncate text-inherit">{{ username }}</span>
                <span class="text-sm text-x-light-textTertiary dark:text-x-dark-textTertiary">
                    {{ type === "followers" ? "Seguidores" : "Seguindo" }}
                </span>
            </div>
        </div>

        <!-- Filtro local: não bate na API de novo, só filtra o que já foi carregado,
             igual o comportamento da lista de seguidores/seguindo do Instagram -->
        <div class="px-4 py-2 border-b border-[#dee0e1] dark:border-[rgb(57,56,57)] shrink-0">
            <div class="h-[34px] w-full flex items-center relative">
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
                    v-model="filterQuery"
                    :placeholder="type === 'followers' ? 'Pesquisar seguidores' : 'Pesquisar seguindo'" />
            </div>
        </div>

        <div ref="scrollContainer" class="bg-white dark:bg-transparent flex-1 overflow-y-auto">
            <div v-if="error" class="px-4 py-3 text-sm text-red-500">{{ error }}</div>

            <VirtualizedUserList v-else :users="filteredUsers" :loading-fetch="loading" :loading-load-more="loadingMore"
                :has-more="filterQuery ? false : hasMore" :show-btn-follow="true" :scroll-target="scrollContainer"
                :empty-message="emptyMessage" @on-load-more="loadMore" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import VirtualizedUserList from "@/views/users/components/VirtualizedUserList.vue";

const props = defineProps({
    // "followers" ou "following"
    type: {
        type: String,
        required: true,
        validator: (v) => ["followers", "following"].includes(v),
    },
    // ObjectId do Mongo do dono do perfil (não o username)
    userId: {
        type: String,
        required: true,
    },
    // Só pra exibir no cabeçalho
    username: {
        type: String,
        default: "",
    },
});

const router = useRouter();
const store = useStore();
const scrollContainer = ref(null);
const filterQuery = ref("");

const users = computed(() => store.getters[`${props.type}Results`]);
const loading = computed(() => store.getters[`${props.type}Loading`]);
const loadingMore = computed(() => store.getters[`${props.type}LoadingMore`]);
const hasMore = computed(() => store.getters[`${props.type}HasMore`]);
const error = computed(() => store.getters[`${props.type}Error`]);

const emptyMessage = computed(() =>
    props.type === "followers" ? "Ainda não há seguidores." : "Ainda não segue ninguém."
);

// Filtra client-side pelo que já foi carregado, por username ou nome de exibição
const filteredUsers = computed(() => {
    if (!filterQuery.value) return users.value;
    const q = filterQuery.value.toLowerCase();
    return users.value.filter(
        (u) => u.username?.toLowerCase().includes(q) || u.display_name?.toLowerCase().includes(q)
    );
});

const fetchAction = computed(() => (props.type === "followers" ? "getFollowers" : "getFollowing"));
const loadMoreAction = computed(() =>
    props.type === "followers" ? "loadMoreFollowers" : "loadMoreFollowing"
);
const clearAction = computed(() => (props.type === "followers" ? "clearFollowers" : "clearFollowing"));

const loadMore = () => {
    store.dispatch(loadMoreAction.value);
};

const load = () => {
    store.dispatch(fetchAction.value, { userId: props.userId });
};

onMounted(load);

// Se o usuário navegar de um perfil pra outro sem desmontar o componente
// (ex: trocando de aba dentro do mesmo layout), recarrega a lista certa.
watch(
    () => props.userId,
    (newId, oldId) => {
        if (newId !== oldId) {
            filterQuery.value = "";
            load();
        }
    }
);

onUnmounted(() => {
    store.dispatch(clearAction.value);
});
</script>