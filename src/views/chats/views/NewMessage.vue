<template>
    <div class="relative bg-white dark:bg-transparent">
        <Navbar @go-back="handleBack" :title="navTitle" :is-fixed="false" />

        <div ref="scrollerRef" class="h-[calc(100vh-44px)] overflow-y-auto mt-[44px]"
            :class="groupMode ? 'pb-32' : ''" @scroll.passive="onScroll">

            <!-- ===================== GRUPO · PASSO 2: nome + revisão ===================== -->
            <template v-if="groupMode && groupStep === 'name'">
                <div class="px-4 pt-8 flex flex-col items-center">
                    <!-- Pilha de avatares -->
                    <div class="flex -space-x-4">
                        <Avatar v-for="m in selected.slice(0, 3)" :key="m.id" :url="m.avatar"
                            class="w-[64px] h-[64px] rounded-full ring-[3px] ring-white dark:ring-[#121212]" />
                    </div>

                    <input v-model="groupName" type="text" :maxlength="MAX_GROUP_NAME"
                        placeholder="Nome do grupo (opcional)" autocomplete="off"
                        class="mt-6 w-full h-11 rounded-xl bg-black/5 dark:bg-white/10 px-4 text-[15px] outline-none" />
                    <p class="mt-1 self-end text-[12px] opacity-50">{{ groupName.length }}/{{ MAX_GROUP_NAME }}</p>
                </div>

                <div class="px-4 pt-4 pb-1 flex items-center justify-between">
                    <p class="text-[13px] font-semibold opacity-60">Membros</p>
                    <p class="text-[12px] opacity-60">{{ totalMembers }}/{{ MAX_MEMBERS }}</p>
                </div>

                <ul>
                    <!-- Você (criador) -->
                    <li class="flex items-center gap-3 px-4 py-[10px]">
                        <Avatar :url="meMember.avatar" class="w-[44px] h-[44px] rounded-full" />
                        <div class="flex-1 min-w-0">
                            <p class="text-[15px] font-semibold truncate">Tu</p>
                            <p class="text-[13px] opacity-50">Criador do grupo</p>
                        </div>
                    </li>

                    <li v-for="m in selected" :key="m.id" class="flex items-center gap-3 px-4 py-[10px]">
                        <Avatar :url="m.avatar" class="w-[44px] h-[44px] rounded-full" />
                        <div class="flex-1 min-w-0">
                            <p class="text-[15px] font-semibold truncate">{{ m.name }}</p>
                            <p v-if="m.username" class="text-[13px] opacity-50 truncate">@{{ m.username }}</p>
                        </div>
                        <button type="button" :aria-label="`Remover ${m.name}`"
                            class="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 active:opacity-60"
                            @click="removeMember(m.id)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        </button>
                    </li>
                </ul>

                <p v-if="selected.length < MIN_OTHER_MEMBERS" class="px-4 pt-3 text-[13px] opacity-60">
                    Adicione pelo menos {{ MIN_OTHER_MEMBERS }} pessoas para criar o grupo.
                </p>
                <p v-if="errorMsg" class="px-4 pt-3 text-[13px] text-[#fe2c55]">{{ errorMsg }}</p>
            </template>

            <!-- ===================== ESCOLHA DE PESSOAS (conversa direta ou grupo) ===================== -->
            <template v-else>
                <!-- Cabeçalho fixo: busca + (grupo) selecionados -->
                <div class="sticky top-0 z-[5] bg-background-primary px-4 pt-3 pb-2">
                    <label class="relative block">
                        <span class="sr-only">Buscar pessoas</span>
                        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" width="18" height="18"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M20 20l-3.5-3.5" />
                        </svg>
                        <input ref="searchInputRef" v-model.trim="query" type="search" placeholder="Buscar"
                            maxlength="50" autocomplete="off" autocapitalize="off" enterkeyhint="search"
                            :disabled="loadingChatSuggestions"
                            class="w-full h-10 rounded-full bg-black/5 dark:bg-white/10 pl-10 pr-4 text-[15px] outline-none disabled:opacity-60" />
                    </label>

                    <template v-if="groupMode">
                        <!-- Selecionados -->
                        <div v-if="selected.length"
                            class="flex gap-3 overflow-x-auto pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div v-for="m in selected" :key="m.id"
                                class="relative flex flex-col items-center w-[56px] shrink-0">
                                <Avatar :url="m.avatar" class="w-[44px] h-[44px] rounded-full" />
                                <button type="button" :aria-label="`Remover ${m.name}`"
                                    class="absolute -top-1 right-1 w-[18px] h-[18px] rounded-full bg-black/70 text-white flex items-center justify-center active:opacity-60"
                                    @click="removeMember(m.id)">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="3.5" stroke-linecap="round" aria-hidden="true">
                                        <path d="M6 6l12 12M18 6L6 18" />
                                    </svg>
                                </button>
                                <span class="mt-1 text-[11px] w-full truncate text-center">{{ firstName(m.name) }}</span>
                            </div>
                        </div>

                        <!-- Contador -->
                        <div class="flex items-center justify-between pt-2 text-[12px]">
                            <span class="opacity-60">
                                {{ selected.length < MIN_OTHER_MEMBERS
                                    ? `Selecione pelo menos ${MIN_OTHER_MEMBERS} pessoas`
                                    : 'Pronto para continuar' }}
                            </span>
                            <span :class="isFull ? 'text-[#fe2c55] font-semibold' : 'opacity-60'">
                                {{ isFull ? 'Limite atingido · ' : '' }}{{ totalMembers }}/{{ MAX_MEMBERS }}
                            </span>
                        </div>
                    </template>
                </div>

                <!-- ============ Conversa direta (fluxo original com UsersList) ============ -->
                <template v-if="!groupMode">
                    <button v-if="!isSearching" type="button"
                        class="w-full flex items-center gap-3 px-4 py-[10px] text-left transition-colors active:bg-[rgba(22,24,35,0.06)] dark:active:bg-[rgba(255,255,255,0.08)]"
                        @click="enterGroupMode">
                        <span
                            class="w-[52px] h-[52px] rounded-full bg-[#fe2c55]/10 text-[#fe2c55] flex items-center justify-center shrink-0">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <circle cx="9" cy="8" r="3.2" />
                                <path d="M3 19c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5" />
                                <path d="M16 5.2a3 3 0 010 5.6M18 13.8c1.8.7 3 2.2 3 4.2" />
                            </svg>
                        </span>
                        <span class="flex-1 min-w-0">
                            <span class="block text-[16px] leading-[20px] font-semibold">Criar chat em grupo</span>
                            <span class="block text-[14px] leading-[18px] opacity-50">Até {{ MAX_MEMBERS }} membros</span>
                        </span>
                        <svg class="opacity-40 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            aria-hidden="true">
                            <path d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div class="px-4 pb-8">
                        <div>
                            <div>
                                <div v-if="!isSearching && chatSuggestions?.items?.length" class="pt-4 mb-1 text-sm">
                                    <p class="text-[13px] font-semibold opacity-60">Sugestões</p>
                                </div>
                            </div>
                            <UsersList ref="UsersListComponent"
                                :users="isSearching ? searchUsers.items || [] : chatSuggestions.items || []"
                                :loading="loadingChatSuggestions" :loading-more="loadingMoreUsers"
                                :has-more="false"
                                @load-more="loadMoreChatSuggetions" @select="select">
                            </UsersList>
                        </div>
                    </div>
                </template>

                <!-- ============ Grupo · passo 1: seleção múltipla ============ -->
                <template v-else>
                    <p v-if="!isSearching && groupCandidates.length"
                        class="px-4 pt-2 pb-1 text-[13px] font-semibold opacity-60">Sugestões</p>

                    <!-- Esqueleto -->
                    <ul v-if="loadingChatSuggestions || (isSearching && loadingSearchUsers)" aria-hidden="true">
                        <li v-for="n in 6" :key="n" class="flex items-center gap-3 px-4 py-[10px] animate-pulse">
                            <span class="w-[44px] h-[44px] rounded-full bg-black/10 dark:bg-white/10"></span>
                            <span class="flex-1 space-y-2">
                                <span class="block h-3 w-1/3 rounded bg-black/10 dark:bg-white/10"></span>
                                <span class="block h-3 w-1/4 rounded bg-black/5 dark:bg-white/5"></span>
                            </span>
                        </li>
                    </ul>

                    <ul v-else>
                        <li v-for="u in groupCandidates" :key="u.id">
                            <button type="button" role="checkbox" :aria-checked="selectedIds.has(u.id)"
                                :disabled="isFull && !selectedIds.has(u.id)"
                                class="w-full flex items-center gap-3 px-4 py-[10px] text-left transition-colors active:bg-[rgba(22,24,35,0.06)] dark:active:bg-[rgba(255,255,255,0.08)] disabled:opacity-40"
                                @click="toggleMember(u)">
                                <Avatar :url="u.avatar" class="w-[44px] h-[44px] rounded-full shrink-0" />
                                <span class="flex-1 min-w-0">
                                    <span class="flex items-center gap-1 min-w-0">
                                        <span class="text-[15px] leading-[20px] font-semibold truncate">{{ u.name }}</span>
                                        <svg v-if="u.verified" class="shrink-0" fill="none" width="14" viewBox="0 0 24 24"
                                            height="14" aria-label="Verificado">
                                            <circle cx="12" cy="12" r="11.5" fill="#20D5EC"></circle>
                                            <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
                                                d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
                                            </path>
                                        </svg>
                                    </span>
                                    <span v-if="u.username"
                                        class="block text-[13px] leading-[18px] opacity-50 truncate">@{{ u.username }}</span>
                                </span>
                                <span
                                    class="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                                    :class="selectedIds.has(u.id) ? 'bg-[#fe2c55] border-[#fe2c55]' : 'border-black/20 dark:border-white/30'">
                                    <svg v-if="selectedIds.has(u.id)" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"
                                        stroke-linejoin="round" aria-hidden="true">
                                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                                    </svg>
                                </span>
                            </button>
                        </li>
                    </ul>

                    <p v-if="loadingMoreUsers" class="px-4 py-4 text-center text-[13px] opacity-50">A carregar...</p>

                    <p v-if="!loadingChatSuggestions && !loadingSearchUsers && !groupCandidates.length"
                        class="px-8 py-16 text-center text-sm opacity-60">
                        {{ isSearching ? 'Nenhum usuário encontrado.' : 'Sem sugestões por agora. Use a busca para encontrar pessoas.' }}
                    </p>
                </template>
            </template>
        </div>

        <!-- ===================== Barra inferior (modo grupo) ===================== -->
        <div v-if="groupMode"
            class="fixed bottom-0 inset-x-0 z-[50] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-white dark:bg-[#121212] border-t border-black/5 dark:border-white/10">
            <p v-if="!isOnline" class="mb-2 text-center text-[12px] text-[#fe2c55]">
                Sem ligação. Conecte-se para criar o grupo.
            </p>

            <button v-if="groupStep === 'select'" type="button" :disabled="selected.length < MIN_OTHER_MEMBERS"
                class="w-full h-11 rounded-full bg-[#fe2c55] text-white text-[15px] font-semibold transition-opacity active:opacity-80 disabled:opacity-40"
                @click="goToNameStep">
                Seguinte
            </button>

            <button v-else type="button" :disabled="!canCreate"
                class="w-full h-11 rounded-full bg-[#fe2c55] text-white text-[15px] font-semibold transition-opacity active:opacity-80 disabled:opacity-40"
                @click="createGroup">
                {{ creating ? 'A criar...' : 'Criar grupo' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onActivated, onDeactivated, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es'
import UsersList from '../../users/components/UsersList.vue';
import Navbar from '@/views/main/components/Navbar.vue';
import Avatar from '@/components/Utils/Avatar.vue';

// Limites do grupo (o back-end valida os mesmos valores)
const MAX_MEMBERS = 50          // total, contando com quem cria
const MIN_OTHER_MEMBERS = 2     // além de quem cria
const MAX_SELECTED = MAX_MEMBERS - 1
const MAX_GROUP_NAME = 50

const loadingChatSuggestions = ref(true)
const loadingMoreUsers = ref(false)
const loadingSearchUsers = ref(false)
const loadingOpenConv = ref(false)
const searchInputRef = ref(null)
const scrollerRef = ref(null)
const query = ref("")
const isSearching = ref(false)
const UsersListComponent = ref(null)

// Estado do modo grupo
const groupMode = ref(false)
const groupStep = ref('select')   // 'select' | 'name'
const selected = ref([])          // [{ id, name, username, avatar, verified }]
const groupName = ref('')
const creating = ref(false)
const errorMsg = ref('')

const store = useStore()
const router = useRouter()

const me = computed(() => store.getters.currentUser)
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

// --- Normalização de usuários (sugestões de chat vêm em { source:'chat', user }) ---
const toMember = (item) => {
    const base = item?.source === 'chat' ? (item.user || item) : item
    const img = base?.profile_image
    return {
        id: String(base?._id ?? ''),
        name: base?.name || item?.name || 'Usuário',
        username: base?.username || '',
        avatar: img?.thumbnails?.md || img?.url || '',
        verified: !!base?.is_verified
    }
}

const firstName = (name) => String(name || '').trim().split(/\s+/)[0]

const meMember = computed(() => toMember(me.value))

// --- Conversa direta (fluxo original, com correções de estado preso) -----------------
const select = async (user) => {
    if (loadingOpenConv.value) return

    const isChat = user?.source === 'chat'
    const targetId = String((isChat ? user.user?._id : user._id) ?? '')
    const targetName = toMember(user).name

    const activeModule = conversations.value.find(m => m.source === 'active')
    const items = activeModule?.items || []

    // Já existe conversa direta com essa pessoa? Compara pelo outro participante
    // (não só pelo nome, para um grupo com o mesmo nome não ser aberto por engano).
    const existing = items.find(conv =>
        conv.type !== 'group' && conv.type !== 'channel' &&
        (String(conv.xyz_id) === targetId || (!conv.xyz_id && conv.name === targetName))
    )

    if (existing) {
        store.commit("SET_IS_LOADING_COMPONENT", true)
        store.commit("SET_CONVERSATION", {
            ...existing,
            source: 'active'
        })
        router.push('/messages/' + existing?._id)
        return
    }

    // Abrir uma conversa nova precisa de rede
    if (!isOnline.value) return

    loadingOpenConv.value = true
    store.commit("SET_IS_LOADING_COMPONENT", true)

    try {
        const conv = await store.dispatch('openDirectMessage', targetId)
        router.push('/messages/' + conv?._id)
    } catch (e) {
        store.commit("SET_IS_LOADING_COMPONENT", false)
    } finally {
        loadingOpenConv.value = false
    }
}

// --- Modo grupo ------------------------------------------------------------------------
const groupCandidates = computed(() => {
    const source = isSearching.value ? searchUsers.value?.items : chatSuggestions.value?.items
    const myId = String(me.value?._id ?? '')
    const seen = new Set()

    return (source || []).map(toMember).filter((m) => {
        if (!m.id || m.id === myId || seen.has(m.id)) return false
        seen.add(m.id)
        return true
    })
})

const selectedIds = computed(() => new Set(selected.value.map(m => m.id)))
const totalMembers = computed(() => selected.value.length + 1)
const isFull = computed(() => selected.value.length >= MAX_SELECTED)

const canCreate = computed(() =>
    !creating.value &&
    isOnline.value &&
    selected.value.length >= MIN_OTHER_MEMBERS &&
    selected.value.length <= MAX_SELECTED
)

const navTitle = computed(() => {
    if (!groupMode.value) return 'Nova mensagem'
    return groupStep.value === 'name' ? 'Novo grupo' : 'Adicionar membros'
})

const toggleMember = (member) => {
    if (selectedIds.value.has(member.id)) {
        selected.value = selected.value.filter(m => m.id !== member.id)
        return
    }
    if (isFull.value) return
    selected.value = [...selected.value, member]
}

const removeMember = (id) => {
    if (creating.value) return
    selected.value = selected.value.filter(m => m.id !== id)
}

const scrollToTop = async () => {
    await nextTick()
    if (scrollerRef.value) scrollerRef.value.scrollTop = 0
}

const enterGroupMode = () => {
    groupMode.value = true
    groupStep.value = 'select'
    errorMsg.value = ''
}

const exitGroupMode = () => {
    groupMode.value = false
    groupStep.value = 'select'
    selected.value = []
    groupName.value = ''
    errorMsg.value = ''
}

const goToNameStep = () => {
    if (selected.value.length < MIN_OTHER_MEMBERS) return
    groupStep.value = 'name'
    scrollToTop()
}

const handleBack = () => {
    if (creating.value) return

    if (groupMode.value && groupStep.value === 'name') {
        groupStep.value = 'select'
        return
    }
    if (groupMode.value) {
        exitGroupMode()
        return
    }
    router.back()
}

const createGroup = async () => {
    if (!canCreate.value) return

    creating.value = true
    errorMsg.value = ''

    try {
        store.commit("SET_IS_LOADING_COMPONENT", true)

        const conv = await store.dispatch('createGroupConversation', {
            name: groupName.value.trim(),
            members: selected.value.map(m => m.id)
        })

        await router.push('/messages/' + conv?._id)
    } catch (e) {
        store.commit("SET_IS_LOADING_COMPONENT", false)
        errorMsg.value = e?.response?.data?.message || 'Não foi possível criar o grupo. Tente novamente.'
    } finally {
        creating.value = false
    }
}

// --- Busca ---------------------------------------------------------------------------
const focusSearchInput = () => {
    searchInputRef?.value?.focus()
}

const resetComponent = () => {
    handleSearch.cancel()
    isSearching.value = false
    query.value = ""
    exitGroupMode()
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

watch(query, (q) => handleSearch(q))

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

// Paginação da lista de grupo (a lista direta continua paginando pelo UsersList)
const onScroll = (e) => {
    if (!groupMode.value || groupStep.value !== 'select' || isSearching.value) return
    if (!chatSuggestions.value?.pagination?.hasMore) return

    const el = e.target
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 240) loadMoreChatSuggetions()
}

// Se a lista ainda não ocupa a tela (poucas sugestões), carrega mais até encher
const fillViewport = async () => {
    await nextTick()
    const el = scrollerRef.value

    if (!el || !groupMode.value || groupStep.value !== 'select' || isSearching.value) return
    if (loadingChatSuggestions.value || loadingMoreUsers.value) return
    if (!chatSuggestions.value?.pagination?.hasMore) return

    if (el.scrollHeight <= el.clientHeight + 80) loadMoreChatSuggetions()
}

watch([groupCandidates, groupMode, groupStep, loadingChatSuggestions], fillViewport)

onActivated(() => {
    focusSearchInput()
    UsersListComponent?.value?.setScrollTop(0)
})
onDeactivated(() => {
    resetComponent()
})
onMounted(async () => {
    if (!isOnline.value) return

    await store.dispatch("loadChatSuggestions", {
        page: 1,
        limit: 20
    }).finally(() => {
        loadingChatSuggestions.value = false
    })
})
</script>