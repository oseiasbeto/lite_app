<template>
    <div class="flex flex-col h-screen overflow-hidden">
        <div class="sticky z-50 top-0 w-full">
            <ChatHeader :status-text="statusText" @go-to-profile="goToProfile" @go-back="router.back()"
                :user-id="user?._id" :loading="loading" :conversation="conversation" />
        </div>

        <div ref="messagesContainer" @scroll="handleScroll" 
            class="flex-1 pt-4 !overflow-y-scroll bg-white dark:bg-transparent">

            <div v-if="!loadingMessages">
                <div class="flex justify-center" ref="loadTrigger" v-if="cachedMessages?.pagination?.hasMore">
                    <SpinnerSmall />
                </div>

                <div v-if="!cachedMessages?.pagination?.hasMore && conversation?.type === 'direct'"
                    class="flex flex-col items-center justify-center py-8 text-center mb-4">

                    <Avatar :url="conversation?.avatar?.thumbnails?.lg || conversation?.avatar?.url" size="big" />

                    <div class="mt-3 mb-3">
                        <p class="text-lg font-semibold dark:text-white text-[rgb(40,40,41)]">{{
                            conversation?.name
                        }}</p>
                        <p class="dark:text-[#b0b3b8]">{{ statusText }}</p>
                    </div>

                    <div class="flex my-2 justify-between items-center">
                        <button
                            class="flex active:opacity-50 bg-[#f1f2f2] items-center gap-1 py-2 px-6 text-[rgb(40,40,41)] dark:text-inherit dark:bg-[#313131] rounded-full"
                            @click="goToProfile(conversation)">
                            <p>Ir para este perfil</p>
                        </button>
                    </div>
                </div>

                <MessageBox @more-option="openDrawerMessage" @reply-swipe="handleReplySwipe"
                    v-for="(message, index) in cachedMessages?.items || []" :key="message._id" :message="message"
                    :chat-read-by="conversation?.read_by"
                    :user-id="user?._id" :previous-message="cachedMessages?.items[index - 1]"
                    :next-message="cachedMessages?.items[index + 1]" />

                <div v-if="readersExcludingCurrent.length && cachedMessages?.items?.length"
                    class="flex px-4 items-center justify-end gap-1 mt-2">
                    <div class="flex -space-x-2">
                        <img v-for="reader in readersExcludingCurrent.slice(0, 5)" :key="reader.user._id"
                            :src="reader.user.profile_image?.thumbnails?.xs || reader.user.profile_image?.url"
                            :alt="reader.user.name"
                            class="w-[16px] h-[16px] rounded-full border-[.5px] dark:border-[rgb(57,56,57)] object-cover"
                            :title="reader.user.name" />
                    </div>
                </div>
            </div>
            <div class="h-full flex justify-center items-center w-full" v-else>
                <SpinnerSmall />
            </div>
        </div>

        <!-- Botão flutuante de voltar ao fundo (estilo Messenger) -->
        <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-75"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-75">
            <button v-if="showScrollToBottomBtn" type="button" @click="scrollToBottomBtn"
                :style="{ bottom: (inputHeight + 12) + 'px' }"
                class="absolute right-3 z-40 w-9 h-9 rounded-full bg-white dark:bg-[#3a3b3c] shadow-md flex items-center justify-center active:scale-95 transition-transform">
                <span v-if="unreadWhileScrolled > 0"
                    class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#287dff] text-white text-[11px] font-semibold flex items-center justify-center leading-none">
                    {{ unreadWhileScrolled > 9 ? '9+' : unreadWhileScrolled }}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round" class="text-[rgb(40,40,41)] dark:text-white">
                    <path d="M12 4v16M6 14l6 6 6-6" />
                </svg>
            </button>
        </Transition>

        <div ref="inputContainer" class="z-10 dark:bg-dark-bg w-full">
            <MessageForm @voice-message-sent="handleSendVoiceMessage" :show-shadow="showShadowMessageForm"
                @typing-start="handleTypingStart" @typing-stop="handleTypingStop" @message-sent="handleSendMessage"
                @auto-resize="updateInputResize" ref="messageFormRef" :user-id="user._id"
                :disabled="isLoadingSendMessage" :reply-to="replyTo" @close-reply-to="resetReplyTo" />
        </div>

        <!--drawer-->
        <Drawer :is-open="drawer.show" @close="onCloseDrawer">
            <div v-if="drawer.name === 'MESSAGE_MORE_OPTIONS'">
                <div
                    class="flex border-b overflow-x-scroll dark:border-[rgb(57,56,57)] mb-1 gap-1 justify-center pt-3 px-1.5 py-2 items-center">
                    <button @click="handleReactMessage(messageSelected._id, '❤️')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('❤️', messageSelected) }">
                        <img class="shrink-0 w-10" src="../../../assets/imgs/emojis/heart.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😆')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('😆', messageSelected) }">
                        <img class="shrink-0 w-10" src="../../../assets/imgs/emojis/haha.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😡')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('😡', messageSelected) }">
                        <img class="shrink-0 w-10" src="../../../assets/imgs/emojis/angry.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😢')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('😢', messageSelected) }">
                        <img class="shrink-0 w-10" src="../../../assets/imgs/emojis/sad.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😮')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('😮', messageSelected) }">
                        <img class="shrink-0 w-10" src="../../../assets/imgs/emojis/wow.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '👍')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('👍', messageSelected) }">
                        <img class="shrink-0 w-10" src="../../../assets/imgs/emojis/like.png" />
                    </button>
                </div>
                <DrawerItem v-if="messageSelected?.message_type !== 'voice'"
                    @on-press="handleCopyText(messageSelected?.context)" title="Copiar" />
                <DrawerItem @on-press="handleReplyTo(messageSelected)" title="Responder" />
                <DrawerItem @on-press="setModalConfirm({
                    isOpen: true,
                    title: 'Eliminar para ti?',
                    message: 'Esta mensagem vai ser eliminada para ti. Os restantes membros da conversa vão poder continuar a vê-la.',
                    confirmText: 'Eliminar',
                    data: { msgId: messageSelected?._id, convId: convId, userId: user._id },
                    actionType: 'deleteForMe'
                })" title="Eliminar para mim" />
                <DrawerItem v-if="isSentMessageSelected" @on-press="setModalConfirm({
                    isOpen: true,
                    title: 'Eliminar para todos?',
                    message: 'Esta mensagem vai ser eliminada para todos. Os restantes membros da conversa não vão poder continuar a vê-la.',
                    confirmText: 'Eliminar',
                    data: { msgId: messageSelected?._id, convId: convId, userId: user._id },
                    actionType: 'deleteMessage'
                })" title="Eliminar para todos" />
            </div>
        </Drawer>

        <!--modal-->
        <Confirmdialog v-model="modalConfirm.isOpen" :title="modalConfirm.title" :message="modalConfirm.message"
            variant="danger" @confirm="handleConfirm" @cancel="closeModalConfirm" />
    </div>
</template>

<script setup>
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import MessageForm from '../components/MessageForm.vue';
import { useStore } from 'vuex';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import ChatHeader from '../components/ChatHeader.vue';
import MessageBox from '../components/MessageBox.vue';
import { getSocket } from '@/services/socket';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';
import { useIntersectionObserver } from "@vueuse/core";
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import Avatar from '@/components/Utils/Avatar.vue';
import Confirmdialog from '@/components/UI/Confirmdialog.vue';

const route = useRoute()
const store = useStore()
const socket = getSocket();
const router = useRouter()

const loading = ref(true)
const loadingMessages = ref(true)
const loadingMoreMessages = ref(false)
const isLoadingSendMessage = ref(false)
const messageSelected = ref(null)
const messagesContainer = ref(null)
const replyTo = ref({ show: false, message: null })

const modalConfirm = ref({
    isOpen: false, title: '', message: '', data: {}, confirmText: '', actionType: ''
})

const drawer = ref({ show: false, name: '', data: {} })

const inputContainer = ref(null);
const inputHeight = ref(0);
const loadTrigger = ref(null)
const messageFormRef = ref(false)
const previousScrollHeight = ref(0)
const previousScrollTop = ref(0)
const showShadowMessageForm = ref(false)

// ── Scroll-to-bottom btn
// Distância base ao fundo (estilo Messenger) + extra quando a barra de
// "responder a" está visível, pois esta acrescenta altura acima do input.
const SCROLL_BOTTOM_THRESHOLD = 400

const showScrollToBottomBtn = ref(false)
const unreadWhileScrolled = ref(0)

const convId = route.params.convId;

const user = computed(() => store.getters.currentUser || null)
const isSentMessageSelected = computed(() => messageSelected.value?.sender?._id === user.value?._id || false)
const conversation = computed(() => store.getters.currentConversation)
const messages = computed(() => store.getters.messages)
const cachedMessages = computed(() => {
    return messages.value.find(module => module.byId === conversation.value?._id) || null
})

const receiver = computed(() => {
    const conv = conversation.value;
    if (!conv || conv.type !== 'direct') return null;
    const participant = conv.participants?.find(p => p?.user?._id !== user.value?._id);
    return participant?.user || null;
});

const readersExcludingCurrent = computed(() => {
    const readers = conversation.value?.read_by || [];
    const currentUserId = user.value?._id;
    const filtered = readers.filter(item => item.user?._id !== currentUserId);
    const map = new Map();
    filtered.forEach(item => { if (item.user?._id) map.set(item.user._id, item); });
    return Array.from(map.values());
});

const networkStatus = computed(() => store.getters.networkStatus)
const isOnline = computed(() => networkStatus.value === 'online')

const statusText = computed(() => {
    const conv = conversation.value;
    if (!conv || conv.type !== 'direct') return '';
    if (conv.is_online) return 'Activo(a) agora';
    if (!conv.last_seen) return 'Visto recentemente';

    const now = currentTime.value;
    const last = new Date(conv.last_seen).getTime();
    const diff = now - last;

    if (diff < 60000) return 'Activo há pouco';
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Activo há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    if (hours >= 72) {
        const date = new Date(last);
        return `Visto em ${date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    }
    if (hours < 24) return `Activo há ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `Visto há ${days} dia${days > 1 ? 's' : ''}`;
});

const currentTime = ref(Date.now());
let statusTimer = null;

const startStatusTimer = () => {
    if (statusTimer) clearInterval(statusTimer);
    statusTimer = setInterval(() => { currentTime.value = Date.now(); }, 60000);
};

const stopStatusTimer = () => {
    if (statusTimer) { clearInterval(statusTimer); statusTimer = null; }
};

const refreshStatusTimer = () => {
    const conv = conversation.value;
    if (!conv || conv.type !== 'direct' || conv.is_online) {
        stopStatusTimer();
    } else {
        if (!statusTimer) { currentTime.value = Date.now(); startStatusTimer(); }
    }
};

const isReacted = (emoji, message) =>
    message?.reactions?.find(r => r.emoji === emoji && r?.user?._id === user.value?._id)

const getMessageFromCache = (byId) =>
    messages.value.find(m => m.byId == byId) || null

const scrollToBottom = async (smooth = true) => {
    await nextTick();
    const el = messagesContainer.value;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
};

// ── Scroll para o fim ao clicar no botão flutuante ───────────────────────────
// Se a distância ao fundo for maior que 2.5× a altura do viewport, salta
// imediatamente (sem animação) para não fazer o utilizador esperar.
const scrollToBottomBtn = () => {
    const el = messagesContainer.value
    if (!el) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.offsetHeight
    const threshold = (window.visualViewport?.height ?? window.innerHeight) * 2.5
    const behavior = distanceFromBottom > threshold ? 'auto' : 'smooth'

    el.scrollTo({ top: el.scrollHeight, behavior })
    unreadWhileScrolled.value = 0
}

const loadMoreMessages = async () => {
    if (loadingMoreMessages.value || !cachedMessages.value?.pagination?.hasMore || !isOnline.value) return
    const container = messagesContainer.value
    if (!container) return

    previousScrollHeight.value = container.scrollHeight
    previousScrollTop.value = container.scrollTop

    loadingMoreMessages.value = true
    const page = cachedMessages.value?.pagination?.page + 1 || 2;
    const total = cachedMessages.value?.pagination?.total || null;
    const convId = cachedMessages.value?.byId || null

    await store.dispatch("loadMessages", ({ page, limit: 10, convId, loadMore: true, total }))
        .finally(async () => {
            loadingMoreMessages.value = false
            await nextTick()
            const newScrollHeight = container.scrollHeight
            container.scrollTop = previousScrollTop.value + (newScrollHeight - previousScrollHeight.value)
        })
}

const resetDrawer = () => { drawer.value = { show: false, name: '', data: {} } }

const onCloseDrawer = () => {
    resetDrawer()
    setTimeout(() => { messageSelected.value = null }, 300);
}

const resetReplyTo = () => {
    replyTo.value.show = false
    replyTo.value.message = null
}

const goToProfile = (conv) => {
    const participant = conv.participants?.find(p => p?.user?._id !== user?.value?._id)
    const profile = participant?.user
    if (!profile?._id) return
    router.push('/profile/' + profile?._id)
}

const openDrawerMessage = (msg) => {
    if (!isOnline.value) return
    messageSelected.value = msg
    drawer.value.show = true
    drawer.value.name = 'MESSAGE_MORE_OPTIONS'
}


let inputResizeObserver = null

const updateInputHeight = () => {
    if (!inputContainer.value) return;
    const newHeight = inputContainer.value.getBoundingClientRect().height;
    if (newHeight === inputHeight.value) return;

    const container = messagesContainer.value
    const tolerance = 250
    // Mede a distância ao fundo ANTES de mudar o padding, para decidir se
    // devemos manter o utilizador "colado" ao fundo depois da mudança.
    const wasNearBottom = container
        ? container.scrollHeight - container.scrollTop <= container.offsetHeight + tolerance
        : true

    inputHeight.value = newHeight

    if (wasNearBottom) {
        // Reajusta no mesmo "tick" de layout para não deixar um espaço vazio
        // visível entre a última mensagem e o form enquanto o padding muda.
        nextTick(() => scrollToBottom(false))
    }
};

const setModalConfirm = (data) => {
    modalConfirm.value = data
    if (drawer.value.show) onCloseDrawer()
}

const closeModalConfirm = () => {
    modalConfirm.value = { isOpen: false, title: '', message: '', data: {}, confirmText: '', actionType: '' }
}

const handleScroll = () => { checkScrollPosition() }

const checkScrollPosition = () => {
    const container = messagesContainer.value
    if (!container) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.offsetHeight

    showShadowMessageForm.value = distanceFromBottom > 5
    showScrollToBottomBtn.value = distanceFromBottom > SCROLL_BOTTOM_THRESHOLD

    // Ao chegar ao fundo, limpa o badge de não lidas
    if (distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD) {
        unreadWhileScrolled.value = 0
    }
}

const handleTypingStart = () => {
    if (conversation.value?.type !== 'direct' || !receiver.value?.is_online) return

    socket.emit('typing_start', {
        convId: conversation.value?._id,
        reciverId: receiver.value?._id,
        source: conversation?.value?.source || 'active'
    })
}

const handleTypingStop = () => {
    if (conversation.value?.type !== 'direct' || !receiver.value?.is_online) return
    socket.emit('typing_stop', {
        convId: conversation.value?._id,
        reciverId: receiver.value?._id,
        source: conversation?.value?.source || 'active'
    })
}

const handleDeleteMessageForMe = async (convId, source, msgId, userId) =>
    store.dispatch("deleteMessageForMe", { convId, source, msgId, userId })

const handleDeleteMessage = async (convId, source, msgId) =>
    store.dispatch("deleteMessage", { convId, source, msgId })

const handleConfirm = async () => {
    if (!modalConfirm.value?.isOpen) return
    const el = modalConfirm.value
    const { msgId, userId } = el.data
    const source = conversation?.value?.source

    try {
        switch (el.actionType) {
            case 'deleteForMe':
                await handleDeleteMessageForMe(conversation.value?._id, source, msgId, userId); break
            case 'deleteMessage':
                await handleDeleteMessage(conversation.value?._id, source, msgId); break
        }
    } catch (err) {
        console.error('Erro ao executar ação de confirmação:', err)
    } finally {
        closeModalConfirm()
    }
}

const handleCopyText = (text) => {
    if (text) {
        const { clipboard } = window.WTN
        clipboard.set({ data: text })
    }
    onCloseDrawer()
}

const handleReplyTo = (msg) => {
    replyTo.value.show = true
    replyTo.value.message = msg
    onCloseDrawer()
    messageFormRef.value.focus()
}

const handleReplySwipe = (msg) => {
    if (!msg || msg.status === 'is_deleted' || msg.status === 'sending') return
    replyTo.value.show = true
    replyTo.value.message = msg
    messageFormRef.value?.focus()
    if (navigator?.vibrate) navigator.vibrate([10, 30, 10])
}

const handleSendMessage = async (message) => {
    const tempId = Math.random().toString(36).substring(2, 10);
    const newMessage = {
        content: message,
        conversation: conversation.value,
        created_at: Date.now(),
        read_by: [],
        message_type: 'text',
        sender: {
            profile_image: user?.value?.profile_image,
            _id: user?.value?._id,
            name: user?.value?.name,
            username: user?.value?.username,
        },
        ...(replyTo.value?.show && { reply_to: replyTo.value.message }),
        status: "sending",
        updated_at: Date.now(),
        _id: tempId
    }

    store.commit("ADD_MESSAGE_REALTIME", { convId: conversation.value?._id, source: conversation?.value?.source || 'active', message: newMessage })

    store.commit("ADD_OR_UPDATE_CONVERSATION", {
        conversation: {
            ...conversation.value,
            last_message: {
                sender: user.value,
                created_at: Date.now(),
                content: newMessage?.content || '',
                message_type: 'text'
            }, 
            read_by: []
        },
        userId: user.value?._id,
        senderId: newMessage.sender?._id,
        source: conversation.value?.source || 'active'
    });
    store.commit('UPDATE_UNREAD_COUNT_ON_CONVERSATION', { convId: conversation?.value?._id, source: conversation?.value?.source, count: 0 })
    scrollToBottom();
    if (replyTo.value?.show) resetReplyTo()

    await store.dispatch("sendMessage", ({
        tempId, convId: conversation.value?._id,
        ...(newMessage?.reply_to && { replyToId: newMessage?.reply_to?._id || null }),
        source: conversation?.value?.source, content: message
    }))
};

const handleSendVoiceMessage = async ({ url, duration }) => {
    const tempId = Math.random().toString(36).substring(2, 10)
    const newMessage = {
        content: '', conversation: conversation.value, created_at: Date.now(), read_by: [],
        message_type: 'voice', file_url: url, file_duration: duration,
        sender: {
            profile_image: user?.value?.profile_image,
            _id: user?.value?._id,
            name: user?.value?.name,
            username: user?.value?.username
        },
        ...(replyTo.value?.show && { reply_to: replyTo.value.message }),
        status: 'sending', updated_at: Date.now(), _id: tempId
    }

    store.commit("ADD_MESSAGE_REALTIME", { convId: conversation.value?._id, source: conversation?.value?.source || 'active', message: newMessage })
    store.commit("ADD_OR_UPDATE_CONVERSATION", {
        conversation: { ...conversation.value, last_message: { 
            created_at: Date.now(), content: '🎤 Mensagem de voz', message_type: 'voice' }, read_by: [] },
        userId: user.value?._id, senderId: newMessage.sender?._id, source: conversation.value?.source || 'active'
    })
    store.commit('UPDATE_UNREAD_COUNT_ON_CONVERSATION', { convId: conversation?.value?._id, source: conversation?.value?.source, count: 0 })
    scrollToBottom()
    if (replyTo.value?.show) resetReplyTo()

    await store.dispatch("sendMessage", ({
        tempId, convId: conversation.value?._id,
        ...(newMessage?.reply_to && { replyToId: newMessage?.reply_to?._id || null }),
        source: conversation?.value?.source, content: '', message_type: 'voice', file_url: url, file_duration: duration
    }))
}

const handleReactMessage = async (messageId, emoji) => {
    const source = conversation?.value?.source
    const convId = conversation.value?._id
    const sender = {
        _id: user.value?._id, name: user.value?.name, is_online: user.value?.is_online,
        username: user.value?.username, profile_image: user.value?.profile_image, is_verified: user.value?.is_verified
    }
    store.commit("REACT_MESSAGE", { convId, msgId: messageId, emoji, source, sender })

    const tolerance = 50
    const isBottom = messagesContainer.value?.scrollHeight - messagesContainer.value?.scrollTop <= messagesContainer.value?.offsetHeight + tolerance
    if (isBottom) scrollToBottom(false)

    resetDrawer()
    await store.dispatch("reactMessage", { convId, msgId: messageId, emoji })
}

let isLoadingMore = false
useIntersectionObserver(
    loadTrigger,
    ([{ isIntersecting }]) => {
        if (isIntersecting && cachedMessages.value?.pagination?.hasMore && !isLoadingMore) {
            isLoadingMore = true
            loadMoreMessages().finally(() => { isLoadingMore = false })
        }
    },
    { threshold: 0.1 }
)

watch(() => route.params.convId, async (newId, oldId) => {
    if (!newId || newId === oldId) return;
    loadingMoreMessages.value = false
    messageFormRef.value.clearInput()
    resetReplyTo()
    unreadWhileScrolled.value = 0

    const cachedMessages = getMessageFromCache(newId)
    if (cachedMessages) {
        await nextTick(); scrollToBottom(false)
    } else {
        loadingMessages.value = true
        await store.dispatch("loadMessages", ({ page: 1, limit: 10, convId: newId, hasMore: false }))
            .finally(() => { loading.value = false; loadingMessages.value = false; scrollToBottom(false) })
    }

    if (conversation?.value?.unread_count) {
        await store.dispatch("markAsRead", { convId: conversation?.value?._id, source: conversation?.value?.source })
    }
})

watch(() => conversation.value?._id, () => { refreshStatusTimer(); }, { immediate: true });
watch(() => conversation.value?.is_online, () => { refreshStatusTimer(); }, { immediate: true });

onBeforeRouteLeave((to, from, next) => {
    if (drawer.value.show) { resetDrawer(); next(false) }
    else if (modalConfirm.value?.isOpen) { closeModalConfirm(); next(false) }
    else next()
})

const updateInputResize = () => {
    const tolerance = 250
    const isBottom = messagesContainer.value?.scrollHeight - messagesContainer.value?.scrollTop <= messagesContainer.value?.offsetHeight + tolerance
    if (isBottom) scrollToBottom(false)
}

const viewportHandler = () => {
    const tolerance = 250
    const isBottom = messagesContainer.value.scrollHeight - messagesContainer.value.scrollTop <= messagesContainer.value.offsetHeight + tolerance
    if (isBottom) scrollToBottom(false)
};

onMounted(async () => {
    if (!conversation.value?._id) {
        await store.dispatch("getConversation", convId).then(async () => {
            await store.dispatch("loadMessages", ({ page: 1, limit: 10, convId: conversation.value?._id, hasMore: false }))
                .finally(() => { loading.value = false; loadingMessages.value = false })
            await nextTick(); scrollToBottom(false);
        }).finally(async () => {
            loadingMessages.value = false; loading.value = false
            if (conversation?.value?.unread_count) {
                await store.dispatch("markAsRead", { convId: conversation?.value?._id, source: conversation?.value?.source })
            }
        })
    } else {
        if (conversation?.value?.unread_count) {
            await store.dispatch("markAsRead", { convId: conversation?.value?._id, source: conversation?.value?.source })
        }
        loading.value = false
        if (!cachedMessages.value) {
            await store.dispatch("loadMessages", ({ page: 1, limit: 10, convId: conversation.value?._id, hasMore: false }))
                .finally(() => { loading.value = false; loadingMessages.value = false })
        } else {
            loadingMessages.value = false; loading.value = false
        }
    }

    await nextTick()
    updateInputHeight()

    // Observa mudanças de altura do form (escrever, multilinha, barra de "responder a")
    // e mantém o botão de scroll-to-bottom sempre colado acima dele.
    if (inputContainer.value && typeof ResizeObserver !== 'undefined') {
        inputResizeObserver = new ResizeObserver(() => updateInputHeight())
        inputResizeObserver.observe(inputContainer.value)
    }

    window.visualViewport?.addEventListener('resize', viewportHandler);
    scrollToBottom(false);

    if (socket) {
        socket.on('new_message', async (msg) => {
            if (msg.conversation?._id === conversation.value._id && msg.sender?._id !== user.value?._id) {
                // Se o utilizador está scrollado para cima, incrementa o badge em vez de saltar
                if (showScrollToBottomBtn.value) {
                    unreadWhileScrolled.value++
                } else {
                    await scrollToBottom();
                }
            }
        });
        socket.on("conversation_as_read", (data) => {
            if (user.value?._id === data.user?._id) return
            setTimeout(() => {
                const tolerance = 300
                const isBottom = messagesContainer.value?.scrollHeight - messagesContainer.value?.scrollTop <= messagesContainer.value?.offsetHeight + tolerance
                if (isBottom) scrollToBottom(true)
            }, 300);
        })
    }
})

onUnmounted(() => {
    socket.off('new_message');
    socket.off('conversation_as_read');
    socket.off('typing_start');
    socket.off('typing_stop');
    window.visualViewport?.removeEventListener('resize', viewportHandler);
    inputResizeObserver?.disconnect();
    stopStatusTimer();
})
</script>