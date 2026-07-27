<template>
    <div class="flex flex-col dark:bg-[#0c1014] h-screen overflow-hidden">
        <div class="sticky z-50 top-0 w-full">
            <ChatHeader :status-text="statusText" @go-to-profile="goToProfile" @go-back="router.back()"
                :user-id="user?._id" :loading="loading" :conversation="conversation" />
        </div>

        <div ref="messagesContainer" @scroll="handleScroll"
            class="flex-1 pt-4 overflow-x-hidden !overflow-y-scroll bg-white dark:bg-transparent">

            <div v-if="!loadingMessages">
                <div class="flex justify-center" ref="loadTrigger" v-if="cachedMessages?.pagination?.hasMore">
                    <SpinnerSmall />
                </div>

                <div v-if="!cachedMessages?.pagination?.hasMore && conversation?.type === 'direct'"
                    class="flex flex-col items-center justify-center py-6 pt-2 text-center mb-4">

                    <Avatar :url="conversation?.avatar?.thumbnails?.lg || conversation?.avatar?.url" size="big"
                        class="w-[96px] h-[96px]" />

                    <div class="mt-3 mb-3">
                        <p class="text-xl font-semibold dark:text-white text-[rgb(40,40,41)]">{{
                            conversation?.name
                            }}</p>
                        <p class="dark:text-x-dark-textSecondary">@{{ conversation.name }}</p>
                    </div>

                    <div class="flex my-2 justify-between items-center">
                        <button
                            class="flex text-base active:opacity-50 bg-black text-white dark:bg-[#2b3036cc] dark:text-x-dark-textPrimary items-center font-bold gap-1 py-2 px-4 rounded-lg"
                            @click="goToProfile(conversation)">
                            <p>Ver perfil</p>
                        </button>
                    </div>
                </div>

                <MessageBox @more-option="openDrawerMessage" @reply-swipe="handleReplySwipe"
                    v-for="(message, index) in cachedMessages?.items || []" :key="message._id" :message="message"
                    :chat-read-by="conversation?.read_by" :user-id="user?._id"
                    :previous-message="cachedMessages?.items[index - 1]"
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

                <svg class="text-[rgb(40,40,41)] dark:text-white" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" width="16px" height="16px" viewBox="0 -4.5 20 20"
                    version="1.1">

                    <title>arrow_down [#339]</title>
                    <desc>Created with Sketch.</desc>
                    <defs>

                    </defs>
                    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="Dribbble-Light-Preview" transform="translate(-180.000000, -6684.000000)"
                            fill="currentColor">
                            <g id="icons" transform="translate(56.000000, 160.000000)">
                                <path
                                    d="M144,6525.39 L142.594,6524 L133.987,6532.261 L133.069,6531.38 L133.074,6531.385 L125.427,6524.045 L124,6525.414 C126.113,6527.443 132.014,6533.107 133.987,6535 C135.453,6533.594 134.024,6534.965 144,6525.39"
                                    id="arrow_down-[#339]">

                                </path>
                            </g>
                        </g>
                    </g>
                </svg>
            </button>
        </Transition>

        <!-- ===== Loading enquanto a imagem é enviada automaticamente ===== -->
        <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
            <div v-if="isUploadingImage"
                class="px-4 py-3 flex items-center gap-3 bg-white dark:bg-[#0c1014] border-t dark:border-[rgb(57,56,57)]">
                <SpinnerSmall class="!w-5 !h-5" />
                <span class="text-sm text-grey dark:text-x-dark-textSecondary">A enviar imagem...</span>
            </div>
        </Transition>

        <div ref="inputContainer" class="z-10 dark:bg-dark-bg w-full">
            <MessageForm @voice-message-sent="handleSendVoiceMessage" :show-shadow="showShadowMessageForm"
                @typing-start="handleTypingStart" @typing-stop="handleTypingStop" @message-sent="handleSendMessage"
                @auto-resize="updateInputResize" ref="messageFormRef" :user-id="user._id"
                :disabled="isLoadingSendMessage" :reply-to="replyTo" @close-reply-to="resetReplyTo"
                @media-selected="handleMediaSelected" @open-gif-picker="openGifPicker" />
        </div>

        <!--drawer-->
        <Drawer :is-open="drawer.show" @close="onCloseDrawer">
            <div v-if="drawer.name === 'MESSAGE_MORE_OPTIONS'">
                <div
                    class="flex border-b overflow-x-scroll dark:border-[rgb(57,56,57)] mb-1 gap-1 justify-center pt-3 px-1.5 py-2 items-center">
                    <button @click="handleReactMessage(messageSelected._id, '❤️')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('❤️', messageSelected) }">
                        <img class="shrink-0 w-8" src="../../../assets/imgs/emojis/heart.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😆')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('😆', messageSelected) }">
                        <img class="shrink-0 w-8" src="../../../assets/imgs/emojis/haha.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😡')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('😡', messageSelected) }">
                        <img class="shrink-0 w-8" src="../../../assets/imgs/emojis/angry.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😢')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('😢', messageSelected) }">
                        <img class="shrink-0 w-8" src="../../../assets/imgs/emojis/sad.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😮')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('😮', messageSelected) }">
                        <img class="shrink-0 w-8" src="../../../assets/imgs/emojis/wow.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '👍')"
                        class="px-1 py-1 rounded-[16px] text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-black/10 dark:bg-white/10': isReacted('👍', messageSelected) }">
                        <img class="shrink-0 w-8" src="../../../assets/imgs/emojis/like.png" />
                    </button>
                </div>
                <DrawerItem v-if="messageSelected?.message_type !== 'voice'"
                    @on-press="handleCopyText(messageSelected?.content)" title="Copiar" />
                <DrawerItem @on-press="handleReplyTo(messageSelected)" title="Responder" />
                <DrawerItem @on-press="handleDeleteForMeConfirm" title="Eliminar para mim" />
                <DrawerItem v-if="isSentMessageSelected" @on-press="handleDeleteForAllConfirm"
                    title="Eliminar para todos" />
            </div>

            <div v-if="drawer.name == 'GIFT'" class="flex relative flex-col h-[85vh]">
                <div class="px-4 pt-2 pb-3 sticky top-0 z-10">
                    <svg aria-label="Pesquisar figurinhas" class="text-[#262626] dark:text-[#8e8e8e] absolute top-[20px] left-[28px]" fill="currentColor"
                        height="16" role="img" viewBox="0 0 48 48" width="16">
                        <title>Pesquisar figurinhas</title>
                        <path
                            d="M47.6 44 35.8 32.2C38.4 28.9 40 24.6 40 20 40 9 31 0 20 0S0 9 0 20s9 20 20 20c4.6 0 8.9-1.6 12.2-4.2L44 47.6c.6.6 1.5.6 2.1 0l1.4-1.4c.6-.6.6-1.6.1-2.2zM20 35c-8.3 0-15-6.7-15-15S11.7 5 20 5s15 6.7 15 15-6.7 15-15 15z">
                        </path>
                    </svg>
                    <input v-model="gifQuery" @input="onGifQueryInput" type="text"
                        :maxlength="20"
                        :placeholder="gifPickerTab === 'sticker' ? 'Pesquisar stickers...' : 'Pesquisar GIFs...'"
                        class="w-full h-10 pl-9 px-4 rounded-full bg-x-light-surface dark:bg-[rgb(36,39,44)]
                               text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e] focus:outline-none text-base" />
                </div>

                <div @touchmove.stop @scroll.stop @mousedown.stop class="flex-1 overflow-y-auto px-3 pb-4">
                    <div v-if="isLoadingGifs" class="flex justify-center py-8">
                        <SpinnerSmall />
                    </div>

                    <div v-else-if="!gifResults.length"
                        class="text-center text-sm text-grey dark:text-x-dark-textSecondary py-8">
                        {{ gifPickerTab === 'sticker' ? 'Nenhum sticker encontrado.' : 'Nenhum GIF encontrado.' }}
                    </div>

                    <!--
                        Grid dinâmico (estilo masonry do Instagram): usa CSS columns em vez de
                        um grid de altura fixa, e cada imagem preserva o seu aspect-ratio real
                        (vindo da própria Giphy), em vez de cortar tudo para a mesma altura.
                    -->
                    <div v-else class="columns-2 gap-2">
                        <button v-for="gif in gifResults" :key="gif.id" type="button" @click="selectGif(gif)"
                            class="block w-full mb-2 break-inside-avoid rounded-lg overflow-hidden active:opacity-70 transition-opacity"
                            :class="gifPickerTab === 'sticker' ? '' : 'bg-x-light-surface dark:bg-[rgb(36,39,44)]'">
                            <img :src="gif.previewUrl" :alt="gif.title" class="w-full h-auto block"
                                :style="{ aspectRatio: `${gif.width} / ${gif.height}` }" loading="lazy" />
                        </button>
                    </div>
                </div>

                <!-- Footer com abas GIF / Stickers -->
                <div class="flex border-t dark:border-[rgb(57,56,57)] bg-white dark:bg-[#0c1014] flex-shrink-0">
                    <button type="button" @click="selectGifPickerTab('gif')"
                        class="flex-1 py-3 flex items-center justify-center gap-1.5 text-sm font-semibold border-t-2 transition-colors"
                        :class="gifPickerTab === 'gif'
                            ? 'text-[#0095f6] border-[#0095f6]'
                            : 'text-x-light-textSecondary dark:text-x-dark-textSecondary border-transparent'">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" class="text-inherit">
                            <path
                                d="M19 1H5a4.005 4.005 0 0 0-4 4v14a4.005 4.005 0 0 0 4 4h14a4.005 4.005 0 0 0 4-4V5a4.005 4.005 0 0 0-4-4zm2 18a2.002 2.002 0 0 1-2 2H5a2.002 2.002 0 0 1-2-2V5a2.002 2.002 0 0 1 2-2h14a2.002 2.002 0 0 1 2 2zM7.668 12.984h1.468a1.142 1.142 0 0 1-.409.84 1.533 1.533 0 0 1-1.038.338 1.446 1.446 0 0 1-1.211-.566 2.564 2.564 0 0 1-.46-1.617 2.563 2.563 0 0 1 .441-1.588 1.389 1.389 0 0 1 1.174-.553 1.572 1.572 0 0 1 .913.256 1.315 1.315 0 0 1 .51.72l.034.111h1.71l-.025-.179A2.694 2.694 0 0 0 9.75 8.944a3.334 3.334 0 0 0-2.117-.674A3.186 3.186 0 0 0 5.16 9.282a3.9 3.9 0 0 0-.911 2.71 3.918 3.918 0 0 0 .912 2.73 3.233 3.233 0 0 0 2.504 1.008 3.178 3.178 0 0 0 2.315-.839 3.04 3.04 0 0 0 .857-2.267V11.6H7.668zm7.318 2.572h1.736V12.91h2.766V11.43h-2.766V9.974h3.03v-1.53h-4.766zm-3.082 0h1.737V8.444h-1.737z">
                            </path>
                        </svg>
                        <span>GIFs</span>
                    </button>
                    <button type="button" @click="selectGifPickerTab('sticker')"
                        class="flex-1 py-3 flex items-center justify-center gap-1.5 text-sm font-semibold border-t-2 transition-colors"
                        :class="gifPickerTab === 'sticker'
                            ? 'text-[#0095f6] border-[#0095f6]'
                            : 'text-x-light-textSecondary dark:text-x-dark-textSecondary border-transparent'">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" class="text-inherit">
                            <path
                                d="M16.583 1H7.417A6.425 6.425 0 0 0 1 7.417v9.166A6.425 6.425 0 0 0 7.417 23h5.126v-3.871a6.385 6.385 0 0 1 .232-1.685 5.726 5.726 0 0 1-5.277-1.842 1 1 0 0 1 1.478-1.346 3.888 3.888 0 0 0 5.518.241.93.93 0 0 1 .11-.068 6.384 6.384 0 0 1 4.355-1.717h4.04V7.417A6.425 6.425 0 0 0 16.584 1zM8.237 11.278a1.335 1.335 0 1 1 1.335-1.335 1.335 1.335 0 0 1-1.335 1.335zm7.525 0a1.335 1.335 0 1 1 1.335-1.335 1.335 1.335 0 0 1-1.334 1.335zm-1.22 7.85v3.504a3.068 3.068 0 0 0 .723-.512l6.808-6.664a3.056 3.056 0 0 0 .541-.744h-3.655a4.422 4.422 0 0 0-4.416 4.417z">
                            </path>
                        </svg>
                        <span>Stickers</span>
                    </button>
                </div>
            </div>
        </Drawer>
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
import axios from 'axios';
import { uploadImageMessage } from '@/services/cloudinary';

import { useConfirmModal } from '@/composables/useConfirmModal'
const { showConfirm, state, close } = useConfirmModal()

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
    const wasGiftDrawer = drawer.value.name === 'GIFT'

    resetDrawer()

    if (wasGiftDrawer) resetGifPicker()

    if (messageSelected.value) {
        setTimeout(() => { messageSelected.value = null }, 300);
    }
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
    onCloseDrawer()

    // Verifica se a API moderna está disponível e o contexto é seguro (HTTPS ou localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Texto copiado com sucesso (API moderna).');
                store.dispatch("showToast", {
                    message: 'Texto copiado com sucesso!',
                    type: 'success',
                    position: 'top'
                })
            })
            .catch(err => {
                console.error('Falha ao copiar (API moderna):', err);
                // Se falhar, tenta o fallback
                return fallbackCopiarTexto(text);
            });
    }

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
        content: '',
        conversation: conversation.value,
        created_at: Date.now(),
        read_by: [],
        message_type: 'voice',
        file_url: url,
        file_duration: duration,
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
        conversation: {
            ...conversation.value, last_message: {
                created_at: Date.now(), content: '🎤 Mensagem de voz', message_type: 'voice'
            }, read_by: []
        },
        userId: user.value?._id, senderId: newMessage.sender?._id, source: conversation.value?.source || 'active'
    })
    store.commit('UPDATE_UNREAD_COUNT_ON_CONVERSATION', { convId: conversation?.value?._id, source: conversation?.value?.source, count: 0 })
    scrollToBottom()
    if (replyTo.value?.show) resetReplyTo()

    await store.dispatch("sendMessage", ({
        tempId, convId: conversation.value?._id,
        ...(newMessage?.reply_to && { replyToId: newMessage?.reply_to?._id || null }),
        source: conversation?.value?.source,
        content: '',
        message_type: 'voice',
        file_url: url,
        file_duration: duration
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
    showScrollToBottomBtn.value = false

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


const handleDeleteForMeConfirm = async () => {
    const msgId = messageSelected.value?._id
    const userId = user.value?._id
    const targetConvId = conversation.value?._id
    const source = conversation?.value?.source

    onCloseDrawer()

    try {
        const confirmed = await showConfirm({
            title: 'Eliminar para ti?',
            message: 'Esta mensagem vai ser eliminada para ti. Os restantes membros da conversa vão poder continuar a vê-la.',
            variant: 'danger',
            confirmLabel: 'Eliminar',
        })

        if (confirmed) {
            close()
            await handleDeleteMessageForMe(targetConvId, source, msgId, userId)
        }
    } catch (err) {
        console.log('Operação cancelada')
    }
}

const handleDeleteForAllConfirm = async () => {
    const msgId = messageSelected.value?._id
    const targetConvId = conversation.value?._id
    const source = conversation?.value?.source

    onCloseDrawer()

    try {
        const confirmed = await showConfirm({
            title: 'Eliminar para todos?',
            message: 'Esta mensagem vai ser eliminada para todos. Os restantes membros da conversa não vão poder continuar a vê-la.',
            variant: 'danger',
            confirmLabel: 'Eliminar',
        })

        if (confirmed) {
            close()
            await handleDeleteMessage(targetConvId, source, msgId)
        }
    } catch (err) {
        console.log('Operação cancelada')
    }
}

// ── NOVO: Mídia (imagem) ──────────────────────────────────────────────────────
// Toda a validação vive aqui, no pai. O MessageForm apenas emite o File bruto.
// Sem preview/confirmação: ao selecionar, valida e sobe automaticamente.
const isUploadingImage = ref(false)

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024 // 15MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']

const handleMediaSelected = async (file) => {
    // Evita disparar um segundo envio enquanto o anterior ainda está a subir
    if (isUploadingImage.value) return

    // 1) Tem de existir e ser realmente um ficheiro
    if (!file || !(file instanceof File)) {
        store.dispatch("showToast", { message: 'Ficheiro inválido.', type: 'error', position: 'top' })
        return
    }

    // 2) Tem de ser IMAGEM — valida o MIME real do ficheiro, não a extensão do nome
    const isImageMime = !!file.type && (ALLOWED_IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/'))
    if (!isImageMime) {
        store.dispatch("showToast", { message: 'Só é permitido enviar imagens.', type: 'error', position: 'top' })
        return
    }

    // 3) Limite de tamanho
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        store.dispatch("showToast", { message: 'Imagem demasiado grande (máx. 15MB).', type: 'error', position: 'top' })
        return
    }

    // 4) Apenas UMA mídia por envio: como sobe automaticamente e é bloqueado
    //    enquanto isUploadingImage está true, nunca há duas em simultâneo.
    await uploadAndSendImage(file)
}

const uploadAndSendImage = async (file) => {
    isUploadingImage.value = true
    try {
        const { url } = await uploadImageMessage(file)

        const tempId = Math.random().toString(36).substring(2, 10)
        const newMessage = {
            content: '',
            conversation: conversation.value,
            created_at: Date.now(),
            read_by: [],
            message_type: 'image',
            file_url: url,
            sender: {
                profile_image: user?.value?.profile_image,
                _id: user?.value?._id,
                name: user?.value?.name,
                username: user?.value?.username,
            },
            ...(replyTo.value?.show && { reply_to: replyTo.value.message }),
            status: 'sending',
            updated_at: Date.now(),
            _id: tempId
        }

        store.commit("ADD_MESSAGE_REALTIME", { convId: conversation.value?._id, source: conversation?.value?.source || 'active', message: newMessage })
        store.commit("ADD_OR_UPDATE_CONVERSATION", {
            conversation: {
                ...conversation.value,
                last_message: { created_at: Date.now(), content: '📷 Imagem', message_type: 'image' },
                read_by: []
            },
            userId: user.value?._id, senderId: newMessage.sender?._id, source: conversation.value?.source || 'active'
        })
        store.commit('UPDATE_UNREAD_COUNT_ON_CONVERSATION', { convId: conversation?.value?._id, source: conversation?.value?.source, count: 0 })
        scrollToBottom()
        if (replyTo.value?.show) resetReplyTo()

        await store.dispatch("sendMessage", ({
            tempId, convId: conversation.value?._id,
            ...(newMessage?.reply_to && { replyToId: newMessage?.reply_to?._id || null }),
            source: conversation?.value?.source,
            content: '',
            message_type: 'image',
            file_url: url
        }))
    } catch (err) {
        console.error('Erro ao enviar imagem:', err)
        store.dispatch("showToast", { message: 'Falha ao enviar imagem.', type: 'error', position: 'top' })
    } finally {
        isUploadingImage.value = false
    }
}

// ── NOVO: GIFs & Stickers (Giphy API pública, via axios) ──────────────────────
// Nota: 'dc6zaTOxFJmzC' é a chave pública de demonstração oficial da Giphy,
// documentada nos próprios exemplos da API (https://developers.giphy.com/docs/api/endpoint#search).
// É limitada em rate/qualidade — para produção o ideal é criar uma chave própria
// gratuita em https://developers.giphy.com.
const GIPHY_API_KEY = 'Gc7131jiJuvI7IdN0HZ1D7nh0ow5BU6g'

// Aba activa do picker: 'gif' ou 'sticker'. A Giphy tem endpoints próprios
// para cada um (/v1/gifs/... e /v1/stickers/...), por isso o path muda
// dinamicamente consoante a aba seleccionada.
const gifPickerTab = ref('gif')
const giphyBasePath = computed(() => gifPickerTab.value === 'sticker' ? 'stickers' : 'gifs')

const gifQuery = ref('')
const gifResults = ref([])
const isLoadingGifs = ref(false)
let gifSearchDebounce = null

// Mapeia os resultados da Giphy guardando também a largura/altura originais
// (width/height), usadas depois para dar aspect-ratio dinâmico a cada item
// no grid, em vez de uma altura fixa igual para todos.
const mapGiphyResults = (data) =>
    (data || []).map(g => {
        const img = g.images?.fixed_width || g.images?.fixed_width_small || g.images?.original
        const width = Number(img?.width) || 1
        const height = Number(img?.height) || 1
        return {
            id: g.id,
            title: g.title || (gifPickerTab.value === 'sticker' ? 'Sticker' : 'GIF'),
            previewUrl: img?.url,
            fullUrl: g.images?.original?.url || g.images?.downsized_large?.url,
            width,
            height
        }
    }).filter(g => g.previewUrl && g.fullUrl)

const fetchTrendingGifs = async () => {
    isLoadingGifs.value = true
    try {
        const { data } = await axios.get(`https://api.giphy.com/v1/${giphyBasePath.value}/trending`, {
            params: { api_key: GIPHY_API_KEY, limit: 24, rating: 'pg-13' }
        })
        gifResults.value = mapGiphyResults(data?.data)
    } catch (err) {
        console.error('Erro ao carregar itens em alta:', err)
        gifResults.value = []
        store.dispatch("showToast", { message: 'Não foi possível carregar os resultados.', type: 'error', position: 'top' })
    } finally {
        isLoadingGifs.value = false
    }
}

const searchGifs = async (query) => {
    isLoadingGifs.value = true
    try {
        const { data } = await axios.get(`https://api.giphy.com/v1/${giphyBasePath.value}/search`, {
            params: { api_key: GIPHY_API_KEY, q: query, limit: 24, rating: 'pg-13', lang: 'pt' }
        })
        gifResults.value = mapGiphyResults(data?.data)
    } catch (err) {
        console.error('Erro ao pesquisar:', err)
        gifResults.value = []
        store.dispatch("showToast", { message: 'Não foi possível pesquisar.', type: 'error', position: 'top' })
    } finally {
        isLoadingGifs.value = false
    }
}

const onGifQueryInput = () => {
    clearTimeout(gifSearchDebounce)
    gifSearchDebounce = setTimeout(() => {
        const q = gifQuery.value.trim()
        q ? searchGifs(q) : fetchTrendingGifs()
    }, 400)
}

// Repõe tudo relacionado ao picker de GIF/Sticker ao estado inicial:
// cancela qualquer pesquisa pendente (debounce), limpa o texto pesquisado,
// os resultados, o estado de loading e volta a aba para "GIFs".
// Chamado sempre que o drawer 'GIFT' é fechado, para a próxima abertura
// começar sempre "do zero" (tal como acontece no Instagram).
const resetGifPicker = () => {
    clearTimeout(gifSearchDebounce)
    gifSearchDebounce = null
    gifQuery.value = ''
    gifResults.value = []
    isLoadingGifs.value = false
    gifPickerTab.value = 'gif'
}

// Troca entre a aba "GIFs" e "Stickers": recarrega os resultados de acordo
// com a pesquisa actual (se houver) ou os itens em alta.
const selectGifPickerTab = (tab) => {
    if (gifPickerTab.value === tab || isLoadingGifs.value) return
    gifPickerTab.value = tab
    gifResults.value = []

    const q = gifQuery.value.trim()
    q ? searchGifs(q) : fetchTrendingGifs()
}

const openGifPicker = () => {
    if (drawer.value.show) resetDrawer()
    drawer.value.show = true
    drawer.value.name = 'GIFT'
    if (!gifResults.value.length) {
        const q = gifQuery.value.trim()
        q ? searchGifs(q) : fetchTrendingGifs()
    }
}

const selectGif = async (gif) => {
    // IMPORTANTE: ler a aba activa ANTES de fechar o drawer — onCloseDrawer
    // agora chama resetGifPicker(), que volta gifPickerTab para 'gif'.
    // Se líssemos isto depois do onCloseDrawer(), um sticker seria sempre
    // enviado como 'gif'.
    const isSticker = gifPickerTab.value === 'sticker'
    const messageType = isSticker ? 'sticker' : 'gif'
    const lastMessagePreview = isSticker ? '🧩 Sticker' : '🎞️ GIF'

    onCloseDrawer()

    const tempId = Math.random().toString(36).substring(2, 10)
    const newMessage = {
        content: '',
        conversation: conversation.value,
        created_at: Date.now(),
        read_by: [],
        message_type: messageType,
        file_url: gif.fullUrl,
        file_width: gif.width,
        file_height: gif.height,
        sender: {
            profile_image: user?.value?.profile_image,
            _id: user?.value?._id,
            name: user?.value?.name,
            username: user?.value?.username,
        },
        ...(replyTo.value?.show && { reply_to: replyTo.value.message }),
        status: 'sending',
        updated_at: Date.now(),
        _id: tempId
    }

    store.commit("ADD_MESSAGE_REALTIME", { convId: conversation.value?._id, source: conversation?.value?.source || 'active', message: newMessage })
    store.commit("ADD_OR_UPDATE_CONVERSATION", {
        conversation: {
            ...conversation.value,
            last_message: { created_at: Date.now(), content: lastMessagePreview, message_type: messageType },
            read_by: []
        },
        userId: user.value?._id, senderId: newMessage.sender?._id, source: conversation.value?.source || 'active'
    })
    store.commit('UPDATE_UNREAD_COUNT_ON_CONVERSATION', { convId: conversation?.value?._id, source: conversation?.value?.source, count: 0 })
    scrollToBottom()
    if (replyTo.value?.show) resetReplyTo()

    await store.dispatch("sendMessage", ({
        tempId, convId: conversation.value?._id,
        ...(newMessage?.reply_to && { replyToId: newMessage?.reply_to?._id || null }),
        source: conversation?.value?.source,
        content: '',
        message_type: messageType,
        file_url: gif.fullUrl,
        file_width: gif.width,
        file_height: gif.height
    }))
}


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