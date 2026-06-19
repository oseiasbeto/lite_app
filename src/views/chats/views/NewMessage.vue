<template>
    <div class="relative bg-white dark:bg-transparent">
        <Navbar @go-back="router.back" title="Nova mensagem" :is-fixed="false" />
        <div class="h-[calc(100vh-44px)] overflow-y-auto mt-[44px]">

            <div class="pt-4 mb-1">
                <SearchUsersForm :disabled="loadingChatSuggestions" ref="searchUserFormComponent"
                    @search="handleSearch" />
            </div>
            <div class="px-4 pb-8">
                <div>
                    <div>
                        <div v-if="!isSearching && chatSuggestions?.items?.length" class="pt-4 mb-1 text-sm">
                            <p class="text-[11px]">Sugestões:</p>
                        </div>
                    </div>
                    <UsersList ref="UsersListComponent"
                        :users="isSearching ? searchUsers.items || [] : chatSuggestions.items || []"
                        :loading="loadingChatSuggestions" :loading-more="loadingMoreUsers"
                        :has-more="isSearching ? searchUsers?.pagination?.hasMore : chatSuggestions?.pagination?.hasMore"
                        @load-more="loadMoreChatSuggetions" @select="select">
                    </UsersList>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed, onMounted, onActivated, onDeactivated, ref } from 'vue';
import { useStore } from 'vuex';
import UsersList from '../../users/components/UsersList.vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es'
import SearchUsersForm from '@/views/search/components/SearchUsersForm.vue';
import Navbar from '@/views/main/components/Navbar.vue';

const loadingChatSuggestions = ref(true)
const loadingMoreUsers = ref(false)
const loadingSearchUsers = ref(false)
const loadingOpenConv = ref(false)
const searchUserFormComponent = ref(null)
const ukey = ref("")
const isSearching = ref(false)
const UsersListComponent = ref(null)

const store = useStore()
const router = useRouter()

const chatSuggestions = computed(() => store.getters.chatSuggestions)
const searchUsers = computed(() => store.getters.searchUsers)

// Computed para acessar as conversas do store Vuex
const conversations = computed(() => {
    // Acessa as conversas do store Vuex
    return store.getters.conversations;
})

// Estado da rede
const networkStatus = computed(() => {
    return store.getters.networkStatus
})

const isOnline = computed(() => {
    return networkStatus.value === 'online' ? true : false
})

const select = async (user) => {
    if (loadingOpenConv.value) return

    store.commit("SET_IS_LOADING_COMPONENT", true)

    const convModules = conversations.value

    const convIndex = convModules.findIndex(m => m.source === 'active') || 0

    if (convIndex === -1) return

    const items = conversations.value[convIndex].items;

    // Verifica se a conversa já existe
    const index = items.findIndex(conv => conv.name === user.name);

    if (index !== -1) {
        const conv = items[index]
        store.commit("SET_CONVERSATION", {
            ...conv,
            source: 'active'
        })
        router.push('/messages/' + conv?._id)
    } else {
        loadingOpenConv.value = true

        if (!isOnline.value) return
        else {
            const isChat = user?.source === 'chat' ? true : false
            await store.dispatch('openDirectMessage', isChat ? user.user?._id : user._id)
                .then((conv) => {
                    router.push('/messages/' + conv?._id)
                }).finally(() => {
                    loadingOpenConv.value = false
                })
        }

    }
}

const focusSearchUsersForm = () => {
    searchUserFormComponent?.value?.focusInput()
}

const resetComponent = () => {
    isSearching.value = false
    searchUserFormComponent?.value?.clearSearch()
    ukey.value = ""
    store.commit("RESET_SEARCH_USERS")
}

const handleSearch = debounce(async (q) => {
    if (!q.trim()) {
        loadingSearchUsers.value = false
        isSearching.value = false
        store.commit("RESET_SEARCH_USERS")
    } else {
        if (!isOnline.value) return
        loadingSearchUsers.value = true
        isSearching.value = true
        await store.dispatch("searchUsers", { query: q, typeSearch: 'new_message' })
            .finally(() => {
                loadingSearchUsers.value = false
            })
    }
}, 300)

const loadMoreChatSuggetions = async () => {
    if (loadingMoreUsers.value || !isOnline.value) return;

    // Indica carregamento
    loadingMoreUsers.value = true;

    // Calcula a próxima página
    const nextPage = chatSuggestions?.value?.pagination?.page + 1;

    const total = chatSuggestions?.value?.pagination?.total || 0;
    const limit = 5

    // Busca mais conversas
    await store.dispatch("loadChatSuggestions", ({
        page: nextPage,
        limit,
        total,
        loadMore: true
    }));

    // Finaliza o carregamento
    loadingMoreUsers.value = false;
};

onActivated(() => {
    focusSearchUsersForm()
    UsersListComponent?.value?.setScrollTop(0)
})
onDeactivated(() => {
    resetComponent()
})
onMounted(async () => {
    if (!isOnline.value) return

    await store.dispatch("loadChatSuggestions", {
        page: 1,
        limit: 5
    }).finally(() => {
        loadingChatSuggestions.value = false
    })
})
</script>