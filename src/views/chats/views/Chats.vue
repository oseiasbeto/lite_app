<template>
    <Navbar title="Mensagens" />

    <!-- Nova mensagem: ícone no canto superior direito, como na Caixa de entrada do TikTok.
         Fica sobre a Navbar (44px). Se a sua Navbar tiver um slot à direita, mova este botão para lá. -->
    <button v-show="!loadingConversations" type="button"
        class="fixed top-0 right-2 h-[44px] w-[44px] z-[60] flex items-center justify-center rounded-full active:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#fe2c55]"
        aria-label="Nova mensagem" @click="router.push('/new-message')">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 3L10.5 13.5" />
            <path d="M21 3l-6.5 18-4-7.5L3 9.5 21 3z" />
        </svg>
    </button>

    <div class="h-[calc(100vh-100px)] mt-[44px] relative overflow-y-scroll">
        <!-- Cabeçalho fixo: stories + busca + filtros -->
        <div class="flex flex-col top-0 w-full z-[10] bg-background-primary">
            <!-- A bandeja recolhe ao rolar a lista (como no TikTok) -->
            <div class="grid transition-[grid-template-rows] duration-200 ease-out"
                :class="trayCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'">
                <div class="overflow-hidden min-h-0" :aria-hidden="trayCollapsed">
                    <StoryTray @create="creatorOpen = true" />
                </div>
            </div>

            <div class="px-5 pt-2 pb-2">
                <label class="relative block">
                    <span class="sr-only">Buscar conversas</span>
                    <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" width="18" height="18"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-3.5-3.5" />
                    </svg>
                    <input v-model.trim="query" type="search" placeholder="Buscar" maxlength="50"
                        class="w-full h-10 rounded-full bg-black/5 dark:bg-white/10 pl-10 pr-4 text-[15px] outline-none" />
                </label>

                <div class="flex gap-2 mt-2.5" role="tablist" aria-label="Filtrar conversas">
                    <button v-for="f in filters" :key="f.value" type="button" role="tab"
                        :aria-selected="filter === f.value"
                        class="h-8 px-4 rounded-full text-[13px] font-semibold transition-colors"
                        :class="filter === f.value
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-black/5 dark:bg-white/10'" @click="filter = f.value">
                        {{ f.label }}
                        <span v-if="f.value === 'unread' && unreadConversationsCount"
                            class="ml-1 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-[#fe2c55] text-white text-[11px]">
                            {{ unreadConversationsCount }}
                        </span>
                    </button>
                </div>
            </div>
        </div>

        <div>
            <ChatList ref="virtualChatListComponent" :conversations="displayedConversations"
                :loading="loadingConversations || (useServerFilter && loadingFiltered)"
                :loading-more="loadingMoreConversations" :user-id="user?._id"
                :show-empty-state="!isFiltering && !loadingConversations && !loadingFiltered"
                :has-more="hasMore" @select="select" source="active"
                @load-more="loadMoreConversations" @on-scroll="handleScroll" @more-options="handleMoreOptions" />

            <p v-if="isFiltering && !loadingConversations && !loadingFiltered && !displayedConversations.length"
                class="px-8 py-16 text-center text-sm opacity-60">
                Nenhuma conversa encontrada.
            </p>

            <Drawer :is-open="drawer.show" @close="onCloseDrawer">
                <div v-if="drawer.name === 'MORE_OPTIONS'">
                    <DrawerItem title="Arquivar" @on-press="handleArchiveChat(chatSelected._id, source)" />
                </div>
            </Drawer>

        </div>
    </div>

    <!-- Stories: visualizador e criador (montados uma única vez; ficam em <body> via Teleport) -->
    <StoryViewer />
    <StoryCreator :open="creatorOpen" @close="creatorOpen = false" />
</template>

<script setup>
import { computed, onMounted, nextTick, onActivated, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import ChatList from '../components/ChatList.vue';
import { useRouter } from 'vue-router';
import { logger } from '@/utils/logger';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import Navbar from '@/views/main/components/Navbar.vue';
import StoryTray from '@/views/stories/components/Storytray.vue';
import StoryViewer from '@/views/stories/components/StoryViewer.vue';
import StoryCreator from '@/views/stories/components/Storycreator.vue';

// Estado de carregamento para mais conversas
const loadingMoreConversations = ref(false);
const loadingConversations = ref(true)
const virtualChatListComponent = ref(null)
const source = ref('active')
const chatSelected = ref(null)

// Stories
const creatorOpen = ref(false)
const trayCollapsed = ref(false)

// Busca e filtros
const query = ref('')
const filter = ref('all')
const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'unread', label: 'Não lidas' },
    { value: 'groups', label: 'Grupos' },
]

const drawer = ref({
    show: false,
    name: '',
    data: {}
})

// Acesso ao store Vuex
const store = useStore()
const router = useRouter()

const user = computed(() => store.getters.currentUser)
const unreadMessagesCount = computed(() => store.getters?.unreadMessagesCount || 0);

const modules = computed(() => {
    return store.getters.conversations;
})

const conversations = computed(() => {
    return modules.value.find(m => m.source === source.value) || null
})

// Estado da rede
const networkStatus = computed(() => {
    return store.getters.networkStatus
})

const isOnline = computed(() => {
    return networkStatus.value === 'online' ? true : false
})

// --- Busca e filtros -----------------------------------------------------
// Online: o servidor filtra (acha conversas de qualquer página).
// Offline: filtra no cliente só o que já está carregado.
const loadingFiltered = ref(false)
const debouncedQuery = ref('')
const FILTER_LIMIT = 10
let debounceTimer = null

watch(query, (v) => {
    clearTimeout(debounceTimer)
    if (!v) { debouncedQuery.value = ''; return }   // limpar é imediato
    debounceTimer = setTimeout(() => { debouncedQuery.value = v }, 300)
})
onBeforeUnmount(() => clearTimeout(debounceTimer))

// unread_count chega do back-end como número por conversa
const unreadOf = (conv) => {
    const map = conv?.unread_count
    if (map && typeof map === 'object') return Number(map[user.value?._id] ?? 0)
    return Number(map ?? conv?.unread ?? 0)
}

const isFiltering = computed(() => filter.value !== 'all' || !!debouncedQuery.value)
const useServerFilter = computed(() => isFiltering.value && isOnline.value)
const filterKey = computed(() => `${source.value}|${filter.value}|${debouncedQuery.value}`)

const filteredModule = computed(() => store.getters.filteredConversations)
const serverMatches = computed(() =>
    filteredModule.value?.key === filterKey.value ? filteredModule.value : null
)

const clientFilter = (items) => {
    const q = debouncedQuery.value.toLowerCase()
    return items.filter((c) => {
        if (filter.value === 'unread' && unreadOf(c) <= 0) return false
        if (filter.value === 'groups' && c.type !== 'group' && c.type !== 'channel') return false
        if (q && !String(c.name || '').toLowerCase().includes(q)) return false
        return true
    })
}

const displayedConversations = computed(() => {
    const base = conversations.value?.items || []
    if (!isFiltering.value) return base

    if (useServerFilter.value) {
        // Sobrepõe a versão "viva" (sockets) à devolvida pelo servidor
        const live = new Map(base.map(c => [c._id, c]))
        return (serverMatches.value?.items || []).map(c => live.get(c._id) || c)
    }
    return clientFilter(base)
})

const hasMore = computed(() =>
    isFiltering.value
        ? !!(useServerFilter.value && serverMatches.value?.pagination?.hasMore)
        : !!conversations.value?.pagination?.hasMore
)

// Badge de "Não lidas": exato quando tudo está carregado; senão usa o total do servidor ajustado
const unreadConversationsCount = computed(() => {
    const m = conversations.value
    const local = (m?.items || []).filter(c => unreadOf(c) > 0).length
    if (!m?.pagination?.hasMore || m?.unreadConversations === undefined) return local
    return Math.max(local, m.unreadConversations + local - (m.unreadLocalAtFetch || 0))
})

const fetchFiltered = async ({ page = 1, loadMore = false, silent = false } = {}) => {
    const key = filterKey.value
    if (!silent && !loadMore) loadingFiltered.value = true
    try {
        await store.dispatch('loadFilteredConversations', {
            page,
            limit: FILTER_LIMIT,
            filter: filter.value,
            q: debouncedQuery.value,
            status: source.value,
            loadMore
        })
    } catch (e) {
        // já logado na action
    } finally {
        if (key === filterKey.value) loadingFiltered.value = false
    }
}

watch([filter, debouncedQuery], async () => {
    if (!isFiltering.value) {
        loadingFiltered.value = false
        store.commit('RESET_FILTERED_CONVERSATIONS')
    } else if (isOnline.value) {
        await fetchFiltered()
    }
    await nextTick()
    virtualChatListComponent.value?.setScrollTop?.(0)
})

// Voltou a ficar online com filtro ativo → busca no servidor
watch(isOnline, (online) => {
    if (online && isFiltering.value) fetchFiltered()
})

const resetDrawer = () => {
    drawer.value = {
        show: false,
        name: '',
        data: {}
    }
}

const onCloseDrawer = () => {
    resetDrawer()
    setTimeout(() => {
        chatSelected.value = null
    }, 300);
}

const select = (conversation) => {

    // Lógica para selecionar uma conversa
    store.commit("SET_CONVERSATION", {
        ...conversation,
        source: source.value
    })
    router.push('/messages/' + conversation?._id)
};

const handleMoreOptions = (conv) => {
    if (!isOnline.value) return

    chatSelected.value = conv
    drawer.value.show = true
    drawer.value.name = 'MORE_OPTIONS'
}

const handleScroll = async (value) => {
    // Recolhe/expande a bandeja de stories (histerese evita tremor no limiar)
    const y = typeof value === 'number' ? value : (value?.target?.scrollTop ?? 0)
    if (!trayCollapsed.value && y > 90) trayCollapsed.value = true
    else if (trayCollapsed.value && y < 10) trayCollapsed.value = false

    // Não grava o scroll da lista normal enquanto estiver filtrando
    if (!isOnline.value || isFiltering.value) return

    store.commit("UPDATE_SCROLLTOP_ON_CONVERSATION", {
        value,
        source: source.value
    })
}

const handleArchiveChat = async (convId, source) => {
    if (!isOnline.value) return

    onCloseDrawer()

    if (!convId || !source) return

    await store.dispatch("toggleArchiveConversation", {
        convId,
        source,
        userId: user.value?._id
    })

    if (isFiltering.value && isOnline.value) fetchFiltered({ silent: true })
}

// Função para carregar mais conversas
const loadMoreConversations = async () => {
    if (!isOnline.value) return

    // Dentro de filtro/busca: pagina o resultado do servidor
    if (isFiltering.value) {
        const pg = serverMatches.value?.pagination
        if (!pg?.hasMore || loadingMoreConversations.value) return
        loadingMoreConversations.value = true
        await fetchFiltered({ page: pg.page + 1, loadMore: true })
        loadingMoreConversations.value = false
        return
    }

    if (loadingMoreConversations.value) return;

    // Indica carregamento
    loadingMoreConversations.value = true;

    // Calcula a próxima página
    const nextPage = conversations?.value?.pagination?.page + 1 || 2;
    const total = conversations?.value?.pagination?.total || 0;
    const limit = 10

    // Busca mais conversas
    await store.dispatch("loadConversations", ({
        page: nextPage,
        limit,
        total,
        loadMore: true
    }))

    // Finaliza o carregamento
    loadingMoreConversations.value = false;
};

const setScrollPosition = async (position) => {
    await nextTick(); // Espera a atualização do DOM
    if (virtualChatListComponent.value?.setScrollTop) {
        virtualChatListComponent.value.setScrollTop(position);
    } else {
        logger.error('setScrollTop method not available on postListComponent');
    }
}

onActivated(async () => {
    if (!isFiltering.value) setScrollPosition(conversations.value?.scrollTop)

    if (unreadMessagesCount.value) {
        await store.dispatch("updateUnreadMessagesCount", 0)
    }

    if (isOnline.value) {
        // Atualiza stories sem mostrar esqueleto (a tela volta do cache do keep-alive)
        store.dispatch('loadStories', { silent: true })
        if (isFiltering.value) fetchFiltered({ silent: true })
    }
})

// Carrega as conversas ao montar o componente
onMounted(async () => {
    const unreadCount = unreadMessagesCount.value

    if (unreadCount) {
        await store.dispatch("updateUnreadMessagesCount", 0)
    }

    // Stories em paralelo com as conversas
    store.dispatch('initStorySockets')
    store.dispatch('loadStories')

    await store.dispatch("loadConversations", ({
        page: 1,
        limit: 10
    }))
        .then(() => {
            store.commit("RESET_ALL_MESSAGES")
        })
        .finally(() => {
            loadingConversations.value = false
        })
});
</script>