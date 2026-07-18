<template>
    <div ref="container" class="relative flex h-full w-full select-none items-center justify-center overflow-hidden bg-black [-webkit-tap-highlight-color:transparent]"
        @click.stop="onPlayerTap">

        <!-- Fechar -->
        <button @click="router.back()" aria-label="Fechar"
            class="absolute left-2.5 top-2.5 z-[999] flex h-9 w-9 items-center justify-center rounded-full bg-black/35 [-webkit-tap-highlight-color:transparent]">
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m5.5 5.5 13 13m-13 0 13-13" stroke="#fff" stroke-width="1.8" fill="none"
                    fill-rule="evenodd" stroke-linecap="round"></path>
            </svg>
        </button>

        <div class="relative z-[1] flex h-full w-full items-center justify-center">
            <video ref="videoRef" class="block h-full w-full object-contain" preload="metadata"
                :poster="currentVideo?.thumbnail" playsinline webkit-playsinline @timeupdate="onTimeUpdate"
                @loadedmetadata="onMetadata" @waiting="isBuffering = true" @playing="isBuffering = false"
                @canplay="isBuffering = false" @ended="onEnded">
            </video>
        </div>

        <!-- Som (persistente, estilo Threads/X: não some com os controles) -->
        <button v-if="hasLoaded" @click.stop="toggleMute" :aria-label="isMuted ? 'Ativar som' : 'Silenciar'"
            class="absolute right-2.5 top-2.5 z-[25] flex h-8 w-8 items-center justify-center rounded-full bg-black/40 [-webkit-tap-highlight-color:transparent]">
            <svg v-if="!isMuted" viewBox="0 0 24 24" fill="white" width="16" height="16">
                <path
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="white" width="16" height="16">
                <path
                    d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
        </button>

        <!-- Overlay inicial (thumb + play central), estilo X -->
        <Transition enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-200 ease-out" leave-to-class="opacity-0">
            <div v-if="!hasLoaded" class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center"
                @click.stop="startVideo()">
                <div v-if="currentVideo?.thumbnail" class="absolute inset-0">
                    <img :src="currentVideo.thumbnail" loading="eager" decoding="async"
                        class="h-full w-full object-contain" />
                    <div class="absolute inset-0 bg-black/25"></div>
                </div>
                <div aria-label="Reproduzir"
                    class="z-[2] flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/60 shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-black/80">
                    <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                <span v-if="posterDurationLabel"
                    class="absolute bottom-3.5 right-3.5 z-[3] rounded bg-black/70 px-1.5 py-0.5 text-xs font-semibold tracking-wide text-white">
                    {{ posterDurationLabel }}
                </span>
            </div>
        </Transition>

        <!-- Spinner de buffer -->
        <Transition enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-200 ease-out" leave-to-class="opacity-0">
            <div v-if="isBuffering && hasLoaded" class="absolute inset-0 z-[15] flex items-center justify-center"
                @click.stop>
                <div class="h-9 w-9 animate-spin rounded-full border-[3px] border-white/20 border-t-white"></div>
            </div>
        </Transition>

        <!-- Cabeçalho do autor -->
        <div v-if="post?.author"
            class="pointer-events-none absolute bottom-[158px] left-4 right-4 z-[21] flex items-center gap-2.5">
            <Avatar :url="post?.author?.profile_image?.thumbnails?.sm || post?.author?.profile_image?.url"
                class="h-[38px] w-[38px] shrink-0 rounded-full border-2 border-white/85 object-cover" />
            <div class="flex min-w-0 flex-col gap-px">
                <div class="flex min-w-0 items-center gap-1">
                    <span
                        class="truncate font-sans text-sm font-semibold leading-tight text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">{{
                            post.author.name }}</span>
                    <svg v-if="post.author.is_verified" viewBox="0 0 22 22" fill="currentColor"
                        aria-label="Conta verificada"
                        class="h-[15px] w-[15px] shrink-0 text-[#1d9bf0] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                        <path
                            d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                    </svg>
                </div>
                <span v-if="post.author.username"
                    class="font-sans text-xs text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">@{{
                        post.author.username }}</span>
            </div>
        </div>

        <p v-if="post?.content" v-html="post.content"
            class="absolute bottom-[122px] left-4 right-4 z-[21] m-0 line-clamp-3 font-sans text-[13px] leading-snug text-white/90 [text-shadow:0_1px_5px_rgba(0,0,0,0.7)]" />

        <!-- Barra de reações -->
        <div class="absolute inset-x-0 bottom-4 z-[19] flex items-center gap-7 px-4 transition-opacity duration-300"
            :class="showControls ? 'pointer-events-none opacity-0' : 'opacity-100'">
            <button aria-label="Gosto" @click.stop="toggleSingleLike"
                class="flex items-center gap-1.5 border-none bg-transparent p-0 [-webkit-tap-highlight-color:transparent]"
                :class="singleLiked ? 'text-[#f91880]' : 'text-white'">
                <svg viewBox="-0.5 0 25 24" width="22" height="22" fill="currentColor"
                    class="drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition-transform duration-150 active:scale-90"
                    :class="singleLiked ? 'animate-[like-pop_0.4s_cubic-bezier(0.17,0.89,0.32,1.49)]' : ''">
                    <path v-if="singleLiked"
                        d="M16.4045 1.50879C14.785 1.50879 13.2185 2.16259 12 3.30764C10.7815 2.16259 9.215 1.50879 7.5955 1.50879C3.41766 1.50879 0.5 4.62796 0.5 9.09411C0.5 13.7857 4.70617 18.9703 11.2153 22.3022C11.4605 22.428 11.7298 22.4912 11.9995 22.4912C12.2692 22.4912 12.5395 22.428 12.7847 22.3022C19.2938 18.9703 23.5 13.7857 23.5 9.09411C23.5 4.62796 20.5823 1.50879 16.4045 1.50879Z" />
                    <path v-else
                        d="M16.5 2C14.8335 2 13.2217 2.70703 12 3.93652C10.7783 2.70704 9.1665 2 7.5 2C3.3785 2 0.5 5.08423 0.5 9.5C0.5 14.1284 4.84516 19.4619 11.311 22.7719C11.5267 22.8827 11.7633 22.9379 12 22.9379C12.2367 22.9379 12.4733 22.8827 12.689 22.7719C19.1548 19.4619 23.5 14.1284 23.5 9.5C23.5 5.08423 20.6217 2 16.5 2ZM12 20.8764C6.30767 17.8962 2.5 13.3467 2.5 9.5C2.5 6.15893 4.4625 4 7.5 4C9.5 4 11.25 5.75 12 7.5C12.75 5.75 14.5 4 16.5 4C19.5377 4 21.5 6.15893 21.5 9.5C21.5 13.3467 17.6923 17.8962 12 20.8764Z" />
                </svg>
                <span v-if="singleLikeCount" class="font-sans text-xs font-semibold [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">{{
                    singleLikeCount }}</span>
            </button>

            <button aria-label="Comentar" @click.stop="emit('on-comment', { post })"
                class="flex items-center gap-1.5 border-none bg-transparent p-0 text-white [-webkit-tap-highlight-color:transparent]">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"
                    class="drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]">
                    <path fill-rule="evenodd"
                        d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C13.414 21 14.7492 20.6747 15.9373 20.0956C16.1277 20.0028 16.3428 19.9728 16.5514 20.0101L20.7565 20.7619L19.9927 16.5927C19.954 16.3815 19.9843 16.1633 20.0792 15.9707C20.6685 14.7742 21 13.4273 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92486 5.92488 1 12 1C18.0752 1 23 5.92488 23 12C23 13.6205 22.649 15.1615 22.018 16.549L22.9836 21.8198C23.0427 22.1423 22.94 22.4733 22.7086 22.7056C22.4773 22.938 22.1468 23.0421 21.824 22.9844L16.512 22.0348C15.1341 22.6553 13.6061 23 12 23C5.92488 23 1 18.0752 1 12Z" />
                </svg>
                <span v-if="post?.commentsCount" class="font-sans text-xs font-semibold [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">{{
                    post.commentsCount }}</span>
            </button>

            <button aria-label="Partilhar" @click.stop="emit('on-share', { post })"
                class="flex items-center gap-1.5 border-none bg-transparent p-0 text-white [-webkit-tap-highlight-color:transparent]">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"
                    class="drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]">
                    <path fill-rule="evenodd"
                        d="M7.2474 1.49853C4.18324 -0.187039 0.600262 2.64309 1.53038 6.01431L3.18181 12L1.53038 17.9857C0.600277 21.3569 4.18324 24.1871 7.2474 22.5015L20.8245 15.0329C23.2153 13.7177 23.2153 10.2823 20.8244 8.96712L7.2474 1.49853ZM3.45835 5.48239C2.99873 3.81649 4.76927 2.41796 6.28345 3.25089L19.8605 10.7195C20.0016 10.7971 20.123 10.8923 20.2247 11H4.98064L3.45835 5.48239ZM4.98064 13L3.45835 18.5176C2.99873 20.1835 4.76927 21.5821 6.28345 20.7491L19.8605 13.2805C20.0016 13.2029 20.123 13.1078 20.2247 13H4.98064Z" />
                </svg>
                <span v-if="post?.sharesCount" class="font-sans text-xs font-semibold [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">{{
                    post.sharesCount }}</span>
            </button>
        </div>

        <!-- Controles (barra inferior estilo X: progresso + play/tempo/volume/fullscreen) -->
        <Transition enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-[400ms] ease-out" leave-to-class="opacity-0">
            <div v-if="hasLoaded && showControls" class="absolute inset-x-0 bottom-0 z-20 pt-10"
                style="background: linear-gradient(transparent, rgba(0,0,0,0.72) 60%)" @click.stop>

                <!-- Barra de progresso -->
                <div ref="progressTrack" class="relative mx-3 mb-0.5 flex h-5 cursor-pointer items-center [touch-action:none]"
                    @pointerdown.stop="onScrubStart" @click.stop>
                    <div class="absolute inset-x-0 h-[3px] rounded bg-white/20"></div>
                    <div class="absolute left-0 h-[3px] rounded bg-white/35 transition-[width] duration-300 ease-linear"
                        :style="{ width: bufferedPercent + '%' }" />
                    <div class="absolute left-0 h-[3px] rounded bg-white" :style="{ width: progressPercent + '%' }" />
                    <div class="absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.45)] transition-transform duration-100"
                        :style="{ left: progressPercent + '%' }" />
                </div>

                <!-- Linha de botões -->
                <div class="flex items-center gap-1 px-1.5 pb-2">
                    <button @click.stop="togglePlay" :aria-label="isPlaying ? 'Pausar' : 'Reproduzir'"
                        class="flex h-10 w-10 shrink-0 items-center justify-center border-none bg-transparent p-0 [-webkit-tap-highlight-color:transparent] active:[&>svg]:scale-90">
                        <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="white" width="20" height="20"
                            class="drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-transform duration-100">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="white" width="20" height="20"
                            class="drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-transform duration-100">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    </button>

                    <button @click.stop="toggleMute" :aria-label="isMuted ? 'Ativar som' : 'Silenciar'"
                        class="flex h-10 w-10 shrink-0 items-center justify-center border-none bg-transparent p-0 [-webkit-tap-highlight-color:transparent] active:[&>svg]:scale-90">
                        <svg v-if="!isMuted" viewBox="0 0 24 24" fill="white" width="18" height="18"
                            class="drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                            <path
                                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="white" width="18" height="18"
                            class="drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                            <path
                                d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                        </svg>
                    </button>

                    <span
                        class="whitespace-nowrap pl-0.5 font-sans text-xs font-medium tracking-wide text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                        {{ formatTime(currentTime) }}<span class="mx-0.5 opacity-60">/</span>{{ formatTime(duration) }}
                    </span>

                    <div class="flex-1"></div>

                    <button @click.stop="toggleFullscreen" aria-label="Ecrã inteiro"
                        class="flex h-10 w-10 shrink-0 items-center justify-center border-none bg-transparent p-0 [-webkit-tap-highlight-color:transparent] active:[&>svg]:scale-90">
                        <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="white" width="18" height="18"
                            class="drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                            <path
                                d="M3 9h2V5h4V3H3v6zm2 6H3v6h6v-2H5v-4zm14 4h-4v2h6v-6h-2v4zM15 3v2h4v4h2V3h-6z" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="white" width="18" height="18"
                            class="drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                            <path
                                d="M5 16h4v4h2v-6H5v2zm4-8H5v2h6V4H9v4zm6 12h2v-4h4v-2h-6v6zm2-12V4h-2v6h6V8h-4z" />
                        </svg>
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Feedback do toque (play/pause central) -->
        <Transition enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-200 ease-out" leave-to-class="opacity-0">
            <div v-if="showTapFeedback" aria-hidden="true"
                class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="white" width="52" height="52"
                    class="opacity-90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                    <path d="M8 5v14l11-7z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="white" width="52" height="52"
                    class="opacity-90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import Hls from 'hls.js'
import { useIntersectionObserver } from '@vueuse/core'
import { useRouter } from 'vue-router'
import Avatar from '@/components/Utils/Avatar.vue'

const router = useRouter()

// ─── Props ────────────────────────────────────────────────
const props = defineProps({
    currentVideo: { type: Object, required: true },
    list: { type: Array, default: () => [] },
    post: { type: Object, default: () => ({}) },
    // Necessário para saber se o utilizador atual já deu "gosto" no post
    userId: { type: String, default: null }
})

// Eventos de reação, emitidos para o componente pai tratar (chamada à API, etc.)
const emit = defineEmits(['on-like', 'on-comment', 'on-share'])

// Config HLS reutilizada — buffer enxuto para não acumular memória
// enquanto o utilizador percorre muitos vídeos verticalmente.
const HLS_CONFIG = {
    enableWorker: true,
    lowLatencyMode: false,
    maxBufferLength: 20,
    maxMaxBufferLength: 40,
    backBufferLength: 10,
}

const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const t = Math.floor(s)
    const h = Math.floor(t / 3600)
    const m = Math.floor((t % 3600) / 60)
    const sec = t % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
}

// ═══════════════════════════════════════════════════════════
//  Lógica do player standalone
// ═══════════════════════════════════════════════════════════
const videoRef = ref(null)
const container = ref(null)
const progressTrack = ref(null)

const hasLoaded = ref(false)
const isBuffering = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const bufferedPercent = ref(0)
const progressPercent = ref(0)
const currentIndex = ref(0)

const showControls = ref(false)
const showTapFeedback = ref(false)

// ── Reações ──────────────────────────────
const singleLiked = ref(!!props.post?.upvotes?.includes(props.userId))
const singleLikeCount = ref(props.post?.upvotesCount || 0)

watch(() => [props.post?.upvotes, props.userId], () => {
    singleLiked.value = !!props.post?.upvotes?.includes(props.userId)
})
watch(() => props.post?.upvotesCount, (v) => { singleLikeCount.value = v || 0 })

const toggleSingleLike = () => {
    singleLiked.value = !singleLiked.value
    singleLikeCount.value += singleLiked.value ? 1 : -1
    emit('on-like', { post: props.post, liked: singleLiked.value })
}

let hls = null
let controlsTimer = null
let scrubbing = false

const posterDurationLabel = computed(() => {
    const d = props.currentVideo?.duration || duration.value
    return d ? fmt(d) : ''
})

const resolveIndex = () => {
    if (!props.list?.length) return 0
    const idx = props.list.findIndex(v => v._id === props.currentVideo?._id)
    return idx >= 0 ? idx : 0
}
currentIndex.value = resolveIndex()

function showControlsTemporarily() {
    showControls.value = true
    clearTimeout(controlsTimer)
    controlsTimer = setTimeout(() => {
        if (isPlaying.value) showControls.value = false
    }, 3000)
}

function onPlayerTap() {
    if (!hasLoaded.value) return
    if (!showControls.value) showControlsTemporarily()
    else togglePlay()
}

function flashTapFeedback() {
    showTapFeedback.value = true
    setTimeout(() => { showTapFeedback.value = false }, 500)
}

function togglePlay() {
    const el = videoRef.value
    if (!el) return
    if (isPlaying.value) el.pause()
    else el.play().catch(() => { el.muted = true; isMuted.value = true; el.play() })
    flashTapFeedback()
    showControlsTemporarily()
}

function toggleMute() {
    const el = videoRef.value
    if (!el) return
    el.muted = !el.muted
    isMuted.value = el.muted
}

function toggleFullscreen() {
    const el = container.value
    if (!el) return
    if (!document.fullscreenElement) {
        el.requestFullscreen?.().catch(() => {})
    } else {
        document.exitFullscreen?.().catch(() => {})
    }
}

function onFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement
}
document.addEventListener('fullscreenchange', onFullscreenChange)

function onTimeUpdate() {
    const el = videoRef.value
    if (!el || scrubbing) return
    currentTime.value = el.currentTime
    const dur = el.duration || 0
    progressPercent.value = dur ? (el.currentTime / dur) * 100 : 0
    if (el.buffered.length) {
        bufferedPercent.value = dur ? (el.buffered.end(el.buffered.length - 1) / dur) * 100 : 0
    }
    isPlaying.value = !el.paused
}

function onMetadata() { duration.value = videoRef.value?.duration || 0 }
function onEnded() { isPlaying.value = false; showControls.value = true }

function onScrubStart(e) {
    scrubbing = true
    updateScrub(e)
    const onMove = (ev) => updateScrub(ev)
    const onUp = () => {
        scrubbing = false
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
}

function updateScrub(e) {
    const track = progressTrack.value
    const el = videoRef.value
    if (!track || !el) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const dur = el.duration || 0
    progressPercent.value = ratio * 100
    el.currentTime = ratio * dur
    currentTime.value = el.currentTime
    showControlsTemporarily()
}

const formatTime = (s) => fmt(s)

async function startVideo(videoObj = null) {
    const target = videoObj || props.currentVideo
    if (!target?.url) return
    destroyHls()
    isBuffering.value = true
    hasLoaded.value = false
    isPlaying.value = false
    currentTime.value = 0
    progressPercent.value = 0
    bufferedPercent.value = 0
    duration.value = 0
    await nextTick()
    const videoEl = videoRef.value

    const afterManifest = () => {
        isBuffering.value = false
        hasLoaded.value = true
        showControlsTemporarily()
        videoEl.play().catch(() => { videoEl.muted = true; isMuted.value = true; videoEl.play() })
    }

    if (Hls.isSupported() && target.format === 'm3u8') {
        hls = new Hls(HLS_CONFIG)
        hls.loadSource(target.url)
        hls.attachMedia(videoEl)
        hls.on(Hls.Events.MANIFEST_PARSED, afterManifest)
        hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) isBuffering.value = false })
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = target.url
        videoEl.addEventListener('loadedmetadata', afterManifest, { once: true })
    } else {
        videoEl.src = target.url
        videoEl.addEventListener('loadedmetadata', afterManifest, { once: true })
    }
}

function destroyHls() {
    if (hls) { try { hls.destroy() } catch (_) { } hls = null }
    const el = videoRef.value
    if (el) { el.pause(); el.removeAttribute('src'); el.load() }
    hasLoaded.value = false
    isBuffering.value = false
    isPlaying.value = false
}

useIntersectionObserver(container, ([{ isIntersecting }]) => {
    const el = videoRef.value
    if (!el) return
    if (!isIntersecting && !el.paused) { el.pause(); isPlaying.value = false }
}, { threshold: 0.4 })

watch(() => props.currentVideo?._id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        currentIndex.value = resolveIndex()
        startVideo()
    }
}, { immediate: true })

onBeforeUnmount(() => {
    destroyHls()
    clearTimeout(controlsTimer)
    document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<style scoped>
@keyframes like-pop {
    0% { transform: scale(1); }
    35% { transform: scale(1.35); }
    100% { transform: scale(1); }
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>