<template>
    <!-- ═══════════════════════════════════════════════════════
         MODO REEL: lista com mais de 1 vídeo → Swiper vertical
         ═══════════════════════════════════════════════════════ -->
    <div v-if="list?.length > 1" ref="container" class="reel-container">
        <Swiper direction="vertical" :slides-per-view="1" :space-between="0" :modules="swiperModules"
            class="reel-swiper" :initial-slide="currentIndex" @swiper="onSwiper" @slide-change="onSlideChange">
            <SwiperSlide v-for="(vid, i) in list" :key="vid._id" class="reel-slide">
                <ReelSlide :video="vid" :post="post" :active="currentIndex === i"
                    :preload="Math.abs(currentIndex - i) <= 1" />
            </SwiperSlide>
        </Swiper>
    </div>

    <!-- ═══════════════════════════════════════════════════
         MODO SINGLE: apenas 1 vídeo → player standalone
         ═══════════════════════════════════════════════════ -->
    <div v-else ref="container" class="video-media-player" @click.stop="onPlayerTap">
        <button @click="router.back()" class="w-[38px] z-[999] absolute top-[10px] left-[10px] px-[2.5px] h-[38px] flex justify-center items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="#fff" stroke-width="1.5"
                    fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
            </svg>
        </button>

        <div class="video-wrapper">
            <video ref="videoRef" class="video-el" :poster="currentVideo?.thumbnail" playsinline webkit-playsinline
                @timeupdate="onTimeUpdate" @loadedmetadata="onMetadata" @waiting="isBuffering = true"
                @playing="isBuffering = false" @canplay="isBuffering = false" @ended="onEnded"></video>
        </div>

        <Transition name="fade">
            <div v-if="!hasLoaded" class="play-overlay" @click.stop="startVideo()">
                <div v-if="currentVideo?.thumbnail" class="thumb-img-wrap">
                    <img :src="currentVideo.thumbnail" class="thumb-img" />
                </div>
            </div>
        </Transition>

        <Transition name="fade">
            <div v-if="isBuffering && hasLoaded" class="loading-overlay" @click.stop>
                <div class="spinner"></div>
            </div>
        </Transition>

        <Transition name="controls-fade">
            <div v-if="hasLoaded && showControls" class="controls" @click.stop>
                <div class="progress-track" ref="progressTrack" @pointerdown.stop="onScrubStart" @click.stop>
                    <div class="progress-buffer" :style="{ width: bufferedPercent + '%' }" />
                    <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
                    <div class="progress-thumb" :style="{ left: progressPercent + '%' }" />
                </div>
                <div class="controls-row">
                    <button class="ctrl-btn" @click.stop="togglePlay" :aria-label="isPlaying ? 'Pausar' : 'Reproduzir'">
                        <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="white" width="22" height="22">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="white" width="22" height="22">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    </button>
                    <span class="time-label">
                        {{ formatTime(currentTime) }}<span class="time-sep">/</span>{{ formatTime(duration) }}
                    </span>
                    <div class="ctrl-spacer"></div>
                    <button class="ctrl-btn" @click.stop="toggleMute"
                        :aria-label="isMuted ? 'Ativar som' : 'Silenciar'">
                        <svg v-if="!isMuted" viewBox="0 0 24 24" fill="white" width="22" height="22">
                            <path
                                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="white" width="22" height="22">
                            <path
                                d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                        </svg>
                    </button>
                </div>
            </div>
        </Transition>

        <Transition name="fade">
            <div v-if="showTapFeedback" class="tap-feedback" aria-hidden="true">
                <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="white" width="56" height="56">
                    <path d="M8 5v14l11-7z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="white" width="56" height="56">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick, defineComponent, h, onMounted, onUnmounted } from 'vue'
import Hls from 'hls.js'
import { useIntersectionObserver } from '@vueuse/core'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Virtual } from 'swiper/modules'
import 'swiper/css'
import { useRouter } from 'vue-router'


const router = useRouter()

// ─── Props ────────────────────────────────────────────────
const props = defineProps({
    currentVideo: { type: Object, required: true },
    list: { type: Array, default: () => [] },
    post: { type: Object, default: () => ({}) }
})

// ─── Swiper ───────────────────────────────────────────────
const swiperModules = [Virtual]
const swiperRef = ref(null)

const onSwiper = (swiper) => { swiperRef.value = swiper }
const onSlideChange = (swiper) => { currentIndex.value = swiper.activeIndex }

// ═══════════════════════════════════════════════════════════
//  ReelSlide — componente interno renderizado em cada slide
// ═══════════════════════════════════════════════════════════
const ReelSlide = defineComponent({
    name: 'ReelSlide',
    props: {
        video: { type: Object, required: true },
        post: { type: Object, default: () => ({}) },
        active: { type: Boolean, default: false },
        preload: { type: Boolean, default: false }
    },
    setup(props) {
        const slideEl = ref(null)
        const videoEl = ref(null)
        const trackEl = ref(null)

        const hasLoaded = ref(false)
        const isBuffering = ref(false)
        const isPlaying = ref(false)
        const isMuted = ref(false)
        const currentTime = ref(0)
        const duration = ref(0)
        const bufferedPct = ref(0)
        const progressPct = ref(0)
        const showControls = ref(false)
        const showTapFeedback = ref(false)

        let hls = null
        let controlTimer = null
        let scrubbing = false

        // ── Helpers de tempo ─────────────────────────
        const fmt = (s) => {
            if (!s || isNaN(s)) return '0:00'
            const t = Math.floor(s)
            const h = Math.floor(t / 3600)
            const m = Math.floor((t % 3600) / 60)
            const sec = t % 60
            if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
            return `${m}:${String(sec).padStart(2, '0')}`
        }

        // ── Controles auto-hide ───────────────────────
        const showCtrlsTemp = () => {
            showControls.value = true
            clearTimeout(controlTimer)
            controlTimer = setTimeout(() => {
                if (isPlaying.value) showControls.value = false
            }, 3000)
        }

        const flashFeedback = () => {
            showTapFeedback.value = true
            setTimeout(() => { showTapFeedback.value = false }, 500)
        }

        // ── Play/Pause ────────────────────────────────
        const play = () => {
            videoEl.value?.play().catch(() => {
                videoEl.value.muted = true
                isMuted.value = true
                videoEl.value.play()
            })
        }

        const togglePlay = () => {
            if (!videoEl.value) return
            if (isPlaying.value) videoEl.value.pause()
            else play()
            flashFeedback()
            showCtrlsTemp()
        }

        const toggleMute = () => {
            if (!videoEl.value) return
            videoEl.value.muted = !videoEl.value.muted
            isMuted.value = videoEl.value.muted
        }

        // ── Eventos do vídeo ──────────────────────────
        const onTimeUpdate = () => {
            const el = videoEl.value
            if (!el || scrubbing) return
            currentTime.value = el.currentTime
            const dur = el.duration || 0
            progressPct.value = dur ? (el.currentTime / dur) * 100 : 0
            if (el.buffered.length) {
                bufferedPct.value = dur ? (el.buffered.end(el.buffered.length - 1) / dur) * 100 : 0
            }
            isPlaying.value = !el.paused
        }
        const onMetadata = () => { duration.value = videoEl.value?.duration || 0 }
        const onEnded = () => { isPlaying.value = false; showControls.value = true }
        const onWaiting = () => { isBuffering.value = true }
        const onPlaying = () => { isBuffering.value = false }
        const onCanPlay = () => { isBuffering.value = false }

        // ── Scrubber ──────────────────────────────────
        const onScrubStart = (e) => {
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

        const updateScrub = (e) => {
            const track = trackEl.value
            const el = videoEl.value
            if (!track || !el) return
            const rect = track.getBoundingClientRect()
            const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
            const dur = el.duration || 0
            progressPct.value = ratio * 100
            el.currentTime = ratio * dur
            currentTime.value = el.currentTime
            showCtrlsTemp()
        }

        // ── Tap no slide ──────────────────────────────
        const onSlideTap = () => {
            if (!hasLoaded.value) return
            if (!showControls.value) showCtrlsTemp()
            else togglePlay()
        }

        // ── HLS / vídeo src ───────────────────────────
        const destroyHls = () => {
            if (hls) { try { hls.destroy() } catch (_) { } hls = null }
            const el = videoEl.value
            if (el) { el.pause(); el.removeAttribute('src'); el.load() }
            hasLoaded.value = false
            isBuffering.value = false
            isPlaying.value = false
        }

        const loadVideo = () => {
            const target = props.video
            if (!target?.url) return
            destroyHls()
            isBuffering.value = true

            const afterManifest = () => {
                isBuffering.value = false
                hasLoaded.value = true
                showCtrlsTemp()
                play()
            }

            const el = videoEl.value
            if (!el) return

            if (Hls.isSupported() && target.format === 'm3u8') {
                hls = new Hls({ enableWorker: true, lowLatencyMode: false })
                hls.loadSource(target.url)
                hls.attachMedia(el)
                hls.on(Hls.Events.MANIFEST_PARSED, afterManifest)
                hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) isBuffering.value = false })
            } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
                el.src = target.url
                el.addEventListener('loadedmetadata', afterManifest, { once: true })
            } else {
                el.src = target.url
                el.addEventListener('loadedmetadata', afterManifest, { once: true })
            }
        }

        // ── Reage a active ────────────────────────────
        watch(() => props.active, (val) => {
            if (val) {
                if (!hasLoaded.value) loadVideo()
                else play()
            } else {
                videoEl.value?.pause()
                isPlaying.value = false
            }
        })

        // ── IntersectionObserver ──────────────────────
        const { stop } = useIntersectionObserver(slideEl, ([{ isIntersecting }]) => {
            const el = videoEl.value
            if (!el) return
            if (!isIntersecting && !el.paused) {
                el.pause(); isPlaying.value = false
            }
        }, { threshold: 0.5 })

        onMounted(() => { if (props.active) loadVideo() })
        onUnmounted(() => { destroyHls(); clearTimeout(controlTimer); stop() })

        // ── Render ────────────────────────────────────
        return () => {
            const video = props.video
            const post = props.post

            return h('div', {
                ref: slideEl,
                class: 'reel-slide-inner',
                onClick: onSlideTap
            }, [
                // BG blur
                video.thumbnail
                    ? h('div', { class: 'bg-blur', style: { backgroundImage: `url(${video.thumbnail})` } })
                    : null,

                // Vídeo
                h('div', { class: 'video-wrapper' }, [
                    h('video', {
                        ref: videoEl,
                        class: 'video-el',
                        poster: video.thumbnail,
                        playsinline: true,
                        'webkit-playsinline': true,
                        onTimeupdate: onTimeUpdate,
                        onLoadedmetadata: onMetadata,
                        onWaiting: onWaiting,
                        onPlaying: onPlaying,
                        onCanplay: onCanPlay,
                        onEnded: onEnded
                    })
                ]),

                // Overlay thumb + play (antes de carregar)
                !hasLoaded.value
                    ? h('div', { class: 'play-overlay', onClick: (e) => { e.stopPropagation(); loadVideo() } }, [
                        video.thumbnail
                            ? h('div', { class: 'thumb-img-wrap' }, [
                                h('img', { src: video.thumbnail, class: 'thumb-img' })
                            ])
                            : null,
                        h('div', { class: 'center-play-btn', 'aria-label': 'Reproduzir' }, [
                            h('svg', { viewBox: '0 0 24 24', fill: 'white', width: 36, height: 36 }, [
                                h('path', { d: 'M8 5v14l11-7z' })
                            ])
                        ])
                    ])
                    : null,

                // Spinner de buffer
                (isBuffering.value && hasLoaded.value)
                    ? h('div', { class: 'loading-overlay' }, [h('div', { class: 'spinner' })])
                    : null,

                // Tap feedback
                showTapFeedback.value
                    ? h('div', { class: 'tap-feedback', 'aria-hidden': 'true' }, [
                        !isPlaying.value
                            ? h('svg', { viewBox: '0 0 24 24', fill: 'white', width: 56, height: 56 }, [h('path', { d: 'M8 5v14l11-7z' })])
                            : h('svg', { viewBox: '0 0 24 24', fill: 'white', width: 56, height: 56 }, [h('path', { d: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' })])
                    ])
                    : null,

                // Info do post (bottom-left)
                h('div', { class: ['post-info', showControls.value ? 'hidden' : ''] }, [
                    post?.author
                        ? h('div', { class: 'post-author' }, [
                            post.author.avatar
                                ? h('img', { src: post.author.avatar, class: 'author-avatar' })
                                : h('div', { class: 'author-avatar-placeholder' }, post.author.name?.charAt(0) || '?'),
                            h('div', { class: 'author-meta' }, [
                                h('span', { class: 'author-name' }, post.author.name),
                                post.author.handle
                                    ? h('span', { class: 'author-handle' }, `@${post.author.handle}`)
                                    : null
                            ])
                        ])
                        : null,
                    post?.caption
                        ? h('p', { class: 'post-caption' }, post.caption)
                        : null,
                    // Contador de slides
                    h('div', { class: 'slide-counter' }, `${props.active ? '▶ ' : ''}${video.title || ''}`)
                ]),

                // Controles
                (hasLoaded.value && showControls.value)
                    ? h('div', { class: 'controls', onClick: (e) => e.stopPropagation() }, [
                        // Progress
                        h('div', {
                            ref: trackEl,
                            class: 'progress-track',
                            onPointerdown: (e) => { e.stopPropagation(); onScrubStart(e) },
                            onClick: (e) => e.stopPropagation()
                        }, [
                            h('div', { class: 'progress-buffer', style: { width: bufferedPct.value + '%' } }),
                            h('div', { class: 'progress-fill', style: { width: progressPct.value + '%' } }),
                            h('div', { class: 'progress-thumb', style: { left: progressPct.value + '%' } })
                        ]),
                        // Linha de botões
                        h('div', { class: 'controls-row' }, [
                            // Play/Pause
                            h('button', { class: 'ctrl-btn', 'aria-label': isPlaying.value ? 'Pausar' : 'Reproduzir', onClick: (e) => { e.stopPropagation(); togglePlay() } }, [
                                !isPlaying.value
                                    ? h('svg', { viewBox: '0 0 24 24', fill: 'white', width: 22, height: 22 }, [h('path', { d: 'M8 5v14l11-7z' })])
                                    : h('svg', { viewBox: '0 0 24 24', fill: 'white', width: 22, height: 22 }, [h('path', { d: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' })])
                            ]),
                            // Tempo
                            h('span', { class: 'time-label' }, [
                                fmt(currentTime.value),
                                h('span', { class: 'time-sep' }, '/'),
                                fmt(duration.value)
                            ]),
                            h('div', { class: 'ctrl-spacer' }),
                            // Mute
                            h('button', { class: 'ctrl-btn', 'aria-label': isMuted.value ? 'Ativar som' : 'Silenciar', onClick: (e) => { e.stopPropagation(); toggleMute() } }, [
                                !isMuted.value
                                    ? h('svg', { viewBox: '0 0 24 24', fill: 'white', width: 22, height: 22 }, [h('path', { d: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' })])
                                    : h('svg', { viewBox: '0 0 24 24', fill: 'white', width: 22, height: 22 }, [h('path', { d: 'M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z' })])
                            ])
                        ])
                    ])
                    : null
            ])
        }
    }
})

// ═══════════════════════════════════════════════════════════
//  Lógica do player standalone (modo single)
// ═══════════════════════════════════════════════════════════
const videoRef = ref(null)
const container = ref(null)
const progressTrack = ref(null)

const hasLoaded = ref(false)
const isBuffering = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const bufferedPercent = ref(0)
const progressPercent = ref(0)
const currentIndex = ref(0)

const showControls = ref(false)
const showTapFeedback = ref(false)

let hls = null
let controlsTimer = null
let scrubbing = false

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

const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const t = Math.floor(s)
    const h = Math.floor(t / 3600)
    const m = Math.floor((t % 3600) / 60)
    const sec = t % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
}

const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const total = Math.floor(seconds)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
}

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
        hls = new Hls({ enableWorker: true, lowLatencyMode: false })
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
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   REEL CONTAINER (modo lista)
   ═══════════════════════════════════════════════════════════ */
.reel-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    overflow: hidden;
}

.reel-swiper {
    width: 100%;
    height: 100%;
}

:deep(.reel-slide) {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

:deep(.reel-slide-inner) {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

/* ═══════════════════════════════════════════════════════════
   PLAYER STANDALONE (modo single)
   ═══════════════════════════════════════════════════════════ */
.video-media-player {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

/* ── Compartilhados: bg-blur, video-wrapper, video-el ── */
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

/* ── Overlay de play inicial ── */
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
}

.thumb-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.center-play-btn {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255, 255, 255, 0.2);
    z-index: 2;
    transition: transform 0.15s ease, background 0.15s ease;
}

.center-play-btn:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.06);
}

/* ── Spinner ── */
.loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 15;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.spinner {
    width: 38px;
    height: 38px;
    border: 3px solid rgba(255, 255, 255, 0.18);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ── Tap feedback ── */
.tap-feedback {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.tap-feedback svg {
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.5));
    opacity: 0.92;
}

/* ── Info do post ── */
.post-info {
    position: absolute;
    bottom: 72px;
    left: 0;
    right: 80px;
    z-index: 18;
    padding: 0 16px 12px;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.post-info.hidden {
    opacity: 0;
}

.post-author {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.author-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.85);
    flex-shrink: 0;
}

.author-avatar-placeholder {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
    border: 2px solid rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
}

.author-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.author-name {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
    line-height: 1.2;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.author-handle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.72);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.post-caption {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.7);
    line-height: 1.45;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.slide-counter {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

/* ── Controles ── */
.controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    padding-top: 40px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.72) 60%);
}

.progress-track {
    position: relative;
    height: 20px;
    display: flex;
    align-items: center;
    margin: 0 12px 2px;
    cursor: pointer;
    touch-action: none;
}

.progress-track::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.22);
    border-radius: 2px;
}

.progress-buffer {
    position: absolute;
    left: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.35);
    border-radius: 2px;
    pointer-events: none;
    transition: width 0.3s linear;
}

.progress-fill {
    position: absolute;
    left: 0;
    height: 3px;
    background: #fff;
    border-radius: 2px;
    pointer-events: none;
}

.progress-thumb {
    position: absolute;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
    transition: transform 0.1s ease;
}

.progress-track:active .progress-thumb {
    transform: translateX(-50%) scale(1.3);
}

.controls-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 6px 8px;
}

.ctrl-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
}

.ctrl-btn:active svg {
    transform: scale(0.88);
}

.ctrl-btn svg {
    transition: transform 0.1s ease;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
}

.ctrl-spacer {
    flex: 1;
}

.time-label {
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    letter-spacing: 0.01em;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
    padding-left: 2px;
    white-space: nowrap;
}

.time-sep {
    opacity: 0.6;
    margin: 0 2px;
}

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.controls-fade-enter-active {
    transition: opacity 0.2s ease;
}

.controls-fade-leave-active {
    transition: opacity 0.4s ease;
}

.controls-fade-enter-from,
.controls-fade-leave-to {
    opacity: 0;
}
</style>