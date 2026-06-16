<template>
    <div ref="container" class="video-media-player">

        <!-- Thumbnail blur background -->
        <div
            v-if="currentVideo?.thumbnail"
            class="bg-blur"
            :style="{ backgroundImage: `url(${currentVideo.thumbnail})` }"
        />

        <!-- Video wrapper centralizado -->
        <div class="video-wrapper">
            <video
                ref="videoRef"
                class="video-el"
                :poster="currentVideo?.thumbnail"
                playsinline
                webkit-playsinline
            ></video>
        </div>

        <!-- Overlay de play antes de carregar -->
        <Transition name="fade">
            <div v-if="!hasLoaded" class="play-overlay" @click.stop="startVideo">
               

                <!-- Thumbnail info -->
                <div v-if="currentVideo?.thumbnail" class="thumb-img-wrap">
                    <img :src="currentVideo.thumbnail" class="thumb-img" />
                </div>
            </div>
        </Transition>

        <!-- Loading spinner -->
        <Transition name="fade">
            <div v-if="isLoading" class="loading-overlay">
                <div class="spinner"></div>
            </div>
        </Transition>

        <!-- Lista de videos se houver mais de 1 -->
        <div v-if="list?.length > 1" class="video-list">
            <div
                v-for="(vid, i) in list"
                :key="vid._id"
                class="video-list-item"
                :class="{ active: currentIndex === i }"
                @click="switchVideo(i)"
            >
                <img v-if="vid.thumbnail" :src="vid.thumbnail" class="list-thumb" />
                <div v-else class="list-thumb-placeholder">
                    <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                        <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                </div>
                <span class="list-duration">{{ formatDuration(vid.duration) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick, computed } from 'vue'
import Hls from 'hls.js'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import { useIntersectionObserver } from '@vueuse/core'

const props = defineProps({
    currentVideo: {
        type: Object,
        required: true
    },
    list: {
        type: Array,
        default: () => []
    }
})

const videoRef = ref(null)
const container = ref(null)

const hasLoaded = ref(false)
const isLoading = ref(false)
const currentIndex = ref(0)

let hls = null
let player = null

// Encontra índice atual no array de lista
const resolveIndex = () => {
    if (!props.list?.length) return 0
    const idx = props.list.findIndex(v => v._id === props.currentVideo?._id)
    return idx >= 0 ? idx : 0
}

currentIndex.value = resolveIndex()

async function startVideo(videoObj = null) {
    const target = videoObj || props.currentVideo
    if (!target?.url) return

    // Destroy instâncias anteriores
    destroyPlayer()

    isLoading.value = true
    hasLoaded.value = false

    await nextTick()

    const videoEl = videoRef.value

    if (Hls.isSupported() && target.format === 'm3u8') {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false })
        hls.loadSource(target.url)
        hls.attachMedia(videoEl)

        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            await initPlyr(videoEl)
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                isLoading.value = false
            }
        })
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari nativo
        videoEl.src = target.url
        await initPlyr(videoEl)
    } else {
        videoEl.src = target.url
        await initPlyr(videoEl)
    }
}

async function initPlyr(videoEl) {
    await nextTick()

    player = new Plyr(videoEl, {
        autoplay: true,
        muted: false,
        controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'fullscreen'],
        resetOnEnd: false,
        invertTime: false,
        toggleInvert: false,
        hideControls: true,
        clickToPlay: true,
    })

    player.on('ready', () => {
        isLoading.value = false
        hasLoaded.value = true
        player.play().catch(() => {
            // Autoplay bloqueado pelo browser — muta e tenta novamente
            player.muted = true
            player.play()
        })
    })

    player.on('waiting', () => { isLoading.value = true })
    player.on('playing', () => { isLoading.value = false })
    player.on('canplay', () => { isLoading.value = false })
}

function destroyPlayer() {
    if (player) {
        try { player.destroy() } catch (_) {}
        player = null
    }
    if (hls) {
        try { hls.destroy() } catch (_) {}
        hls = null
    }
    hasLoaded.value = false
    isLoading.value = false
}

function switchVideo(index) {
    currentIndex.value = index
    startVideo(props.list[index])
}

// Formata segundos → mm:ss ou hh:mm:ss
const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const total = Math.floor(seconds)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
}

// Pausa ao sair do viewport
useIntersectionObserver(
    container,
    ([{ isIntersecting }]) => {
        if (!player) return
        if (!isIntersecting && player.playing) {
            player.pause()
        }
    },
    { threshold: 0.4 }
)

// Troca de vídeo quando prop muda externamente
watch(() => props.currentVideo?._id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        currentIndex.value = resolveIndex()
        startVideo()
    }
}, { immediate: true })

onBeforeUnmount(() => {
    destroyPlayer()
})
</script>

<style scoped>
.video-media-player {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* Fundo desfocado com thumbnail */
.bg-blur {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    filter: blur(24px) brightness(0.3) saturate(1.4);
    transform: scale(1.1);
    z-index: 0;
}

.video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.video-el {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

/* Overlay de play inicial */
.play-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.thumb-img-wrap {
    position: absolute;
    inset: 0;
    z-index: -1;
}

.thumb-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.play-btn {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255,255,255,0.25);
    transition: transform 0.15s ease, background 0.15s ease;
    z-index: 2;
}

.play-btn:hover {
    background: rgba(0,0,0,0.85);
    transform: scale(1.08);
}

/* Loading */
.loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 15;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.35);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Lista lateral de vídeos */
.video-list {
    position: absolute;
    bottom: 80px;
    right: 12px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 60vh;
    overflow-y: auto;
}

.video-list-item {
    position: relative;
    width: 64px;
    cursor: pointer;
    border-radius: 6px;
    overflow: hidden;
    border: 2px solid transparent;
    transition: border-color 0.2s;
}

.video-list-item.active {
    border-color: #fff;
}

.list-thumb {
    width: 64px;
    height: 64px;
    object-fit: cover;
    display: block;
}

.list-thumb-placeholder {
    width: 64px;
    height: 64px;
    background: #222;
    display: flex;
    align-items: center;
    justify-content: center;
}

.list-duration {
    position: absolute;
    bottom: 3px;
    right: 3px;
    font-size: 10px;
    color: #fff;
    background: rgba(0,0,0,0.7);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: monospace;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Override Plyr para tema escuro no mobile */
:deep(.plyr) {
    width: 100%;
    height: 100%;
}

:deep(.plyr__controls) {
    background: linear-gradient(transparent, rgba(0,0,0,0.75));
    padding: 20px 12px 10px;
}

:deep(.plyr--video .plyr__control:hover) {
    background: rgba(255,255,255,0.15);
}

:deep(.plyr__progress input[type=range]) {
    color: #fff;
}

:deep(.plyr__volume input[type=range]) {
    color: #fff;
}
</style>