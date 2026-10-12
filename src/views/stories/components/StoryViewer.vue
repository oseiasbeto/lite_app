<template>
    <Teleport to="body">
        <Transition name="sv">
            <div v-if="viewer.open && group && story" ref="rootEl" class="sv-root" role="dialog" aria-modal="true"
                aria-label="Stories" tabindex="-1">
                <div class="sv-backdrop" :style="{ opacity: backdropOpacity }" />

                <div class="sv-card" :class="{ 'is-dragging': drag.active && drag.moved }" :style="cardStyle">
                    <!-- ============ MÍDIA ============ -->
                    <div :key="story._id" class="sv-media">
                        <div v-if="story.media_type === 'text'" class="sv-text" :style="{ background: textBg }">
                            <p>{{ story.text_content }}</p>
                        </div>

                        <img v-else-if="story.media_type === 'photo'" :src="story.media.url" alt="" draggable="false"
                            @load="mediaReady = true" @error="onMediaError" />

                        <video v-else ref="videoEl" :src="story.media.url" :poster="story.media.thumb" :muted="muted"
                            playsinline preload="auto" @loadeddata="onVideoLoaded" @timeupdate="onVideoTime"
                            @ended="next" @waiting="buffering = true" @playing="buffering = false"
                            @error="onMediaError" />
                    </div>

                    <div class="sv-shade sv-shade--top" />
                    <div class="sv-shade sv-shade--bottom" />

                    <div v-if="(!mediaReady || buffering) && !failed" class="sv-spinner" aria-label="Carregando" />

                    <div v-if="failed" class="sv-error">
                        <p>Não foi possível carregar este story.</p>
                        <button type="button" @click="next">Pular</button>
                    </div>

                    <!-- ============ GESTOS (só a área da mídia) ============ -->
                    <div class="sv-gesture" @pointerdown="onPointerDown" @pointermove="onPointerMove"
                        @pointerup="onPointerUp" @pointercancel="onPointerCancel" />

                    <!-- coração grande ao curtir -->
                    <div v-if="burst" class="sv-burst" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="96" height="96">
                            <path fill="#fe2c55"
                                d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 2.8 4.5 6.4 4.5c2 0 3.7 1.1 5.6 3.2 1.9-2.1 3.6-3.2 5.6-3.2 3.6 0 5.5 3.8 4 7.3C19.5 16.4 12 21 12 21z" />
                        </svg>
                    </div>

                    <!-- ============ TOPO ============ -->
                    <header class="sv-top" :class="{ 'is-hidden': holding }">
                        <div class="sv-progress" role="progressbar" :aria-valuenow="Math.round(progress * 100)"
                            aria-valuemin="0" aria-valuemax="100">
                            <span v-for="(st, i) in group.stories" :key="st._id" class="sv-progress__seg">
                                <span class="sv-progress__fill" :style="{ width: segmentWidth(i) }" />
                            </span>
                        </div>

                        <div class="sv-head">
                            <StoryAvatar :src="group.user.profile_image?.url" :alt="authorName" :size="36"
                                state="none" />
                            <div class="sv-head__meta">
                                <span class="sv-head__name">
                                    {{ isOwn ? 'Seu story' : authorName }}
                                    <svg v-if="group.user.is_verified" viewBox="0 0 24 24" width="14" height="14"
                                        aria-label="Verificado">
                                        <circle cx="12" cy="12" r="10" fill="#20d5ec" />
                                        <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <span class="sv-head__time">{{ timeAgo(story.created_at) }}</span>
                            </div>

                            <button v-if="isVideo" type="button" class="sv-icon" @click="muted = !muted"
                                :aria-label="muted ? 'Ativar som' : 'Silenciar'">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 5L6 9H3v6h3l5 4V5z" />
                                    <path v-if="!muted" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
                                    <path v-else d="M22 9l-6 6M16 9l6 6" />
                                </svg>
                            </button>
                            <button type="button" class="sv-icon" @click="openMenu" aria-label="Mais opções">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                    <circle cx="5" cy="12" r="1.8" />
                                    <circle cx="12" cy="12" r="1.8" />
                                    <circle cx="19" cy="12" r="1.8" />
                                </svg>
                            </button>
                            <button type="button" class="sv-icon" @click="close" aria-label="Fechar">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>
                    </header>

                    <!-- ============ LEGENDA ============ -->
                    <p v-if="story.caption" class="sv-caption" :class="{ 'is-hidden': holding }">{{ story.caption }}</p>

                    <!-- ============ RODAPÉ ============ -->
                    <footer class="sv-bottom" :class="{ 'is-hidden': holding }">
                        <!-- Dono -->
                        <template v-if="isOwn">
                            <button type="button" class="sv-views" @click="openSheet">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span>{{ story.views_count || 0 }}</span>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="sv-views__heart">
                                    <path
                                        d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 2.8 4.5 6.4 4.5c2 0 3.7 1.1 5.6 3.2 1.9-2.1 3.6-3.2 5.6-3.2 3.6 0 5.5 3.8 4 7.3C19.5 16.4 12 21 12 21z" />
                                </svg>
                                <span>{{ story.likes_count || 0 }}</span>
                            </button>
                            <span class="sv-hint">Deslize para cima para ver quem viu</span>
                        </template>

                        <!-- Espectador -->
                        <template v-else>
                            <div v-if="inputFocused && story.allow_replies" class="sv-reactions">
                                <button v-for="emoji in reactions" :key="emoji" type="button"
                                    @pointerdown.prevent="submitReply(emoji)" :aria-label="`Reagir com ${emoji}`">
                                    {{ emoji }}
                                </button>
                            </div>

                            <div class="sv-reply">
                                <input v-if="story.allow_replies" ref="inputEl" v-model="replyText" type="text"
                                    maxlength="500" enterkeyhint="send" :placeholder="`Responder a ${authorName}...`"
                                    class="sv-reply__input" @focus="inputFocused = true" @blur="onInputBlur"
                                    @keydown.enter.prevent="submitReply()" />
                                <p v-else class="sv-reply__off">As respostas estão desativadas</p>

                                <button v-if="replyText.trim()" type="button" class="sv-reply__send"
                                    :disabled="sending" @pointerdown.prevent="submitReply()" aria-label="Enviar resposta">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M3 11.5L21 3l-8.5 18-2.2-7.3L3 11.5z" />
                                    </svg>
                                </button>

                                <button v-else type="button" class="sv-like" :class="{ 'is-liked': story.liked }"
                                    @click="like" :aria-label="story.liked ? 'Descurtir' : 'Curtir'"
                                    :aria-pressed="!!story.liked">
                                    <svg viewBox="0 0 24 24" width="28" height="28"
                                        :fill="story.liked ? '#fe2c55' : 'none'"
                                        :stroke="story.liked ? '#fe2c55' : 'currentColor'" stroke-width="2"
                                        stroke-linejoin="round">
                                        <path
                                            d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 2.8 4.5 6.4 4.5c2 0 3.7 1.1 5.6 3.2 1.9-2.1 3.6-3.2 5.6-3.2 3.6 0 5.5 3.8 4 7.3C19.5 16.4 12 21 12 21z" />
                                    </svg>
                                </button>
                            </div>
                        </template>
                    </footer>

                    <!-- ============ SHEET: quem viu ============ -->
                    <Transition name="sv-sheet">
                        <div v-if="sheetOpen" class="sv-sheet-wrap" @click.self="closeSheet">
                            <div class="sv-sheet" role="dialog" aria-label="Visualizações">
                                <div class="sv-sheet__grab" />
                                <h3 class="sv-sheet__title">
                                    {{ viewersMeta.views_count ?? story.views_count ?? 0 }} visualizações
                                    <span v-if="viewersMeta.likes_count"> · {{ viewersMeta.likes_count }} curtidas</span>
                                </h3>

                                <p v-if="viewersLoading && !viewers.length" class="sv-sheet__empty">Carregando...</p>
                                <p v-else-if="!viewers.length" class="sv-sheet__empty">Ninguém viu ainda.</p>

                                <ul v-else class="sv-sheet__list">
                                    <li v-for="v in viewers" :key="v.user._id" class="sv-viewer">
                                        <StoryAvatar :src="v.user.profile_image?.url"
                                            :alt="v.user.name || v.user.username" :size="44" state="none" />
                                        <div class="sv-viewer__meta">
                                            <span class="sv-viewer__name">{{ v.user.name || '@' + v.user.username
                                                }}</span>
                                            <span class="sv-viewer__time">{{ timeAgo(v.viewed_at) }}</span>
                                        </div>
                                        <svg v-if="v.liked" viewBox="0 0 24 24" width="20" height="20" fill="#fe2c55"
                                            aria-label="Curtiu">
                                            <path
                                                d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 2.8 4.5 6.4 4.5c2 0 3.7 1.1 5.6 3.2 1.9-2.1 3.6-3.2 5.6-3.2 3.6 0 5.5 3.8 4 7.3C19.5 16.4 12 21 12 21z" />
                                        </svg>
                                    </li>
                                    <li v-if="viewersHasMore" class="sv-sheet__more">
                                        <button type="button" @click="loadViewers(true)" :disabled="viewersLoading">
                                            Carregar mais
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Transition>

                    <!-- ============ SHEET: menu ============ -->
                    <Transition name="sv-sheet">
                        <div v-if="menuOpen" class="sv-sheet-wrap" @click.self="closeMenu">
                            <div class="sv-sheet sv-sheet--menu" role="menu">
                                <div class="sv-sheet__grab" />
                                <template v-if="isOwn">
                                    <button v-if="!confirmDelete" type="button" role="menuitem" class="sv-menu-item is-danger"
                                        @click="confirmDelete = true">
                                        Excluir story
                                    </button>
                                    <template v-else>
                                        <p class="sv-menu-text">Este story será removido para todos. Excluir mesmo assim?</p>
                                        <button type="button" role="menuitem" class="sv-menu-item is-danger"
                                            @click="removeStory">Sim, excluir</button>
                                    </template>
                                </template>
                                <template v-else>
                                    <button type="button" role="menuitem" class="sv-menu-item" @click="muteAuthor">
                                        Silenciar stories de {{ authorName }}
                                    </button>
                                </template>
                                <button type="button" role="menuitem" class="sv-menu-item" @click="closeMenu">Cancelar</button>
                            </div>
                        </div>
                    </Transition>

                    <div v-if="toast" class="sv-toast" role="status">{{ toast }}</div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import StoryAvatar from './Storyavatar.vue'
import {
    STORY_BACKGROUNDS,
    STORY_QUICK_REACTIONS,
    getStoryDuration,
    timeAgo,
} from '../../../utils/story-utils'

const store = useStore()
const reactions = STORY_QUICK_REACTIONS

/* ------------------------------ estado ------------------------------ */
const rootEl = ref(null)
const videoEl = ref(null)
const inputEl = ref(null)

const progress = ref(0) // 0..1 do story atual
const mediaReady = ref(false)
const buffering = ref(false)
const failed = ref(false)
const muted = ref(false)

const holding = ref(false)
const inputFocused = ref(false)
const sheetOpen = ref(false)
const menuOpen = ref(false)
const confirmDelete = ref(false)

const replyText = ref('')
const sending = ref(false)
const burst = ref(false)
const toast = ref('')

const viewers = ref([])
const viewersMeta = ref({})
const viewersPage = ref(1)
const viewersHasMore = ref(false)
const viewersLoading = ref(false)

const drag = reactive({ active: false, moved: false, startX: 0, startY: 0, dx: 0, dy: 0, t: 0 })

/* ----------------------------- derivados ---------------------------- */
const viewer = computed(() => store.getters.storyViewer)
const groups = computed(() => store.getters.storyGroups)
const group = computed(() => groups.value[viewer.value.groupIndex] || null)
const story = computed(() => group.value?.stories[viewer.value.storyIndex] || null)

const isOwn = computed(() => !!group.value?.is_me)
const isVideo = computed(() => story.value?.media_type === 'video')
const authorName = computed(() => group.value?.user?.name || `@${group.value?.user?.username || ''}`)
const textBg = computed(() => STORY_BACKGROUNDS[story.value?.background] || STORY_BACKGROUNDS.sunset)

const paused = computed(
    () =>
        holding.value ||
        inputFocused.value ||
        sheetOpen.value ||
        menuOpen.value ||
        !mediaReady.value ||
        buffering.value ||
        failed.value ||
        pageHidden.value
)

const pageHidden = ref(false)

const segmentWidth = (i) => {
    const current = viewer.value.storyIndex
    if (i < current) return '100%'
    if (i === current) return `${Math.min(1, progress.value) * 100}%`
    return '0%'
}

const dragY = computed(() => (drag.active && drag.moved && Math.abs(drag.dy) > Math.abs(drag.dx) ? Math.max(0, drag.dy) : 0))
const dragX = computed(() => (drag.active && drag.moved && Math.abs(drag.dx) >= Math.abs(drag.dy) ? drag.dx : 0))

const cardStyle = computed(() => {
    if (!dragY.value && !dragX.value) return {}
    const scale = 1 - Math.min(dragY.value, 320) / 1600
    return { transform: `translate(${dragX.value * 0.35}px, ${dragY.value}px) scale(${scale})` }
})
const backdropOpacity = computed(() => 1 - Math.min(dragY.value, 300) / 450)

/* ------------------------------ timer ------------------------------- */
let raf = null
let lastTs = 0

const tick = (ts) => {
    if (!lastTs) lastTs = ts
    const dt = ts - lastTs
    lastTs = ts

    // vídeo: o progresso vem do próprio <video> (onVideoTime)
    if (!paused.value && !isVideo.value && story.value) {
        progress.value += dt / getStoryDuration(story.value)
        if (progress.value >= 1) {
            progress.value = 1
            next()
        }
    }
    raf = requestAnimationFrame(tick)
}

const startLoop = () => {
    stopLoop()
    lastTs = 0
    raf = requestAnimationFrame(tick)
}
const stopLoop = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = null
}

/* ---------------------------- navegação ----------------------------- */
const setPosition = (groupIndex, storyIndex) =>
    store.commit('SET_STORY_VIEWER_POSITION', { groupIndex, storyIndex })

const firstUnseenIndex = (g) => {
    const idx = g.stories.findIndex((s) => !s.viewed)
    return idx === -1 ? 0 : idx
}

const close = () => store.dispatch('closeStoryViewer')

const nextGroup = () => {
    const gi = viewer.value.groupIndex
    if (gi >= groups.value.length - 1) return close()
    setPosition(gi + 1, firstUnseenIndex(groups.value[gi + 1]))
}

const prevGroup = () => {
    const gi = viewer.value.groupIndex
    if (gi <= 0) return restart()
    setPosition(gi - 1, 0)
}

const next = () => {
    if (!group.value) return
    if (viewer.value.storyIndex < group.value.stories.length - 1) {
        setPosition(viewer.value.groupIndex, viewer.value.storyIndex + 1)
    } else {
        nextGroup()
    }
}

const prev = () => {
    if (viewer.value.storyIndex > 0) {
        setPosition(viewer.value.groupIndex, viewer.value.storyIndex - 1)
    } else if (progress.value > 0.15 || viewer.value.groupIndex === 0) {
        restart()
    } else {
        prevGroup()
    }
}

const restart = () => {
    progress.value = 0
    lastTs = 0
    if (videoEl.value) videoEl.value.currentTime = 0
}

/* --------------------------- vídeo / mídia -------------------------- */
const onVideoLoaded = () => {
    mediaReady.value = true
    syncVideo()
}

const onVideoTime = () => {
    const v = videoEl.value
    if (!v || !v.duration) return
    progress.value = v.currentTime / v.duration
}

const onMediaError = () => {
    failed.value = true
}

const syncVideo = async () => {
    const v = videoEl.value
    if (!v) return
    if (paused.value) {
        v.pause()
        return
    }
    try {
        await v.play()
    } catch {
        // autoplay bloqueado com som → tenta mudo
        muted.value = true
        v.muted = true
        v.play().catch(() => { })
    }
}

watch(paused, () => {
    if (isVideo.value) syncVideo()
})

watch(muted, (value) => {
    if (videoEl.value) videoEl.value.muted = value
})

// Pré-carrega a próxima mídia para a troca ser instantânea
const preloadNext = () => {
    const g = group.value
    if (!g) return
    const nextStory =
        g.stories[viewer.value.storyIndex + 1] || groups.value[viewer.value.groupIndex + 1]?.stories[0]
    const src = nextStory?.media_type === 'photo' ? nextStory.media.url : nextStory?.media?.thumb
    if (src) {
        const img = new Image()
        img.src = src
    }
}

/* ------------------------ mudança de story -------------------------- */
watch(
    () => [viewer.value.open, story.value?._id],
    ([open, id]) => {
        if (!open || !id) return

        progress.value = 0
        lastTs = 0
        mediaReady.value = story.value.media_type === 'text'
        buffering.value = false
        failed.value = false
        replyText.value = ''
        sheetOpen.value = false
        menuOpen.value = false
        confirmDelete.value = false
        viewers.value = []
        viewersMeta.value = {}

        if (!isOwn.value && !story.value.viewed) {
            store.dispatch('markStoryViewed', id)
        }
        preloadNext()
    },
    { immediate: true }
)

watch(
    () => viewer.value.open,
    async (open) => {
        document.body.style.overflow = open ? 'hidden' : ''
        if (open) {
            startLoop()
            await nextTick()
            rootEl.value?.focus()
        } else {
            stopLoop()
            holding.value = false
            inputFocused.value = false
        }
    },
    { immediate: true }
)

/* ------------------------------ gestos ------------------------------ */
let holdTimer = null
const HOLD_MS = 180

const onPointerDown = (e) => {
    if (e.button > 0) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.active = true
    drag.moved = false
    drag.startX = e.clientX
    drag.startY = e.clientY
    drag.dx = 0
    drag.dy = 0
    drag.t = Date.now()
    holdTimer = setTimeout(() => {
        if (!drag.moved) holding.value = true
    }, HOLD_MS)
}

const onPointerMove = (e) => {
    if (!drag.active) return
    drag.dx = e.clientX - drag.startX
    drag.dy = e.clientY - drag.startY
    if (!drag.moved && (Math.abs(drag.dx) > 10 || Math.abs(drag.dy) > 10)) {
        drag.moved = true
        clearTimeout(holdTimer)
        holding.value = true // pausa enquanto arrasta
    }
}

const resetDrag = () => {
    drag.active = false
    drag.moved = false
    drag.dx = 0
    drag.dy = 0
}

const onPointerUp = (e) => {
    if (!drag.active) return
    clearTimeout(holdTimer)

    const { dx, dy, moved } = drag
    const elapsed = Date.now() - drag.t
    const rect = e.currentTarget.getBoundingClientRect()

    holding.value = false
    resetDrag()

    if (moved) {
        if (Math.abs(dy) > Math.abs(dx)) {
            if (dy > 110) return close()
            if (dy < -90 && isOwn.value) return openSheet()
        } else if (Math.abs(dx) > 90) {
            return dx < 0 ? nextGroup() : prevGroup()
        }
        return
    }

    if (elapsed >= HOLD_MS) return // toque longo: só retoma

    const x = (e.clientX - rect.left) / rect.width
    if (x < 0.3) prev()
    else next()
}

const onPointerCancel = () => {
    clearTimeout(holdTimer)
    holding.value = false
    resetDrag()
}

/* ------------------------------ ações ------------------------------- */
let toastTimer = null
const showToast = (message) => {
    toast.value = message
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.value = ''), 2200)
}

const like = async () => {
    if (!story.value) return
    try {
        const liked = await store.dispatch('toggleStoryLike', story.value._id)
        if (liked) {
            burst.value = true
            setTimeout(() => (burst.value = false), 750)
        }
    } catch {
        showToast('Não foi possível curtir')
    }
}

const onInputBlur = () => {
    // pequeno atraso para o toque nas reações/enviar ser processado antes de despausar
    setTimeout(() => (inputFocused.value = false), 120)
}

const submitReply = async (text = replyText.value) => {
    const content = (text || '').trim()
    if (!content || sending.value || !story.value) return

    sending.value = true
    try {
        await store.dispatch('sendStoryReply', { storyId: story.value._id, content })
        replyText.value = ''
        inputEl.value?.blur()
        showToast('Resposta enviada')
    } catch (error) {
        showToast(error?.response?.data?.message || 'Não foi possível enviar')
    } finally {
        sending.value = false
    }
}

const openSheet = async () => {
    if (!isOwn.value) return
    sheetOpen.value = true
    viewersPage.value = 1
    viewers.value = []
    await loadViewers(false)
}
const closeSheet = () => (sheetOpen.value = false)

const loadViewers = async (more) => {
    if (!story.value || viewersLoading.value) return
    viewersLoading.value = true
    try {
        const page = more ? viewersPage.value + 1 : 1
        const data = await store.dispatch('fetchStoryViewers', { storyId: story.value._id, page })
        viewers.value = more ? [...viewers.value, ...data.items] : data.items
        viewersPage.value = page
        viewersHasMore.value = !!data.pagination?.hasMore
        viewersMeta.value = { views_count: data.views_count, likes_count: data.likes_count }
    } catch {
        showToast('Não foi possível carregar')
    } finally {
        viewersLoading.value = false
    }
}

const openMenu = () => {
    confirmDelete.value = false
    menuOpen.value = true
}
const closeMenu = () => {
    menuOpen.value = false
    confirmDelete.value = false
}

const removeStory = async () => {
    if (!story.value) return
    const ownerId = group.value.user._id
    try {
        await store.dispatch('deleteStory', story.value._id)
        menuOpen.value = false
        confirmDelete.value = false

        const gi = viewer.value.groupIndex
        const g = groups.value[gi]
        if (!g) return close()
        if (String(g.user._id) !== String(ownerId)) return setPosition(gi, 0)
        setPosition(gi, Math.min(viewer.value.storyIndex, g.stories.length - 1))
    } catch {
        showToast('Não foi possível excluir')
    }
}

const muteAuthor = async () => {
    const name = authorName.value
    try {
        await store.dispatch('toggleMuteStoryUser', group.value.user._id)
        menuOpen.value = false
        showToast(`Stories de ${name} silenciados`)
        close()
    } catch {
        showToast('Não foi possível silenciar')
    }
}

/* --------------------------- teclado / aba -------------------------- */
const onKeydown = (e) => {
    if (!viewer.value.open) return
    if (inputFocused.value && e.key !== 'Escape') return

    if (e.key === 'Escape') {
        if (sheetOpen.value) return closeSheet()
        if (menuOpen.value) return closeMenu()
        return close()
    }
    if (e.key === 'ArrowRight') next()
    else if (e.key === 'ArrowLeft') prev()
    else if (e.key === ' ') {
        e.preventDefault()
        holding.value = !holding.value
    }
}

const onVisibility = () => {
    pageHidden.value = document.hidden
}

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
    stopLoop()
    clearTimeout(holdTimer)
    clearTimeout(toastTimer)
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
    document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.sv-root {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    color: #fff;
    overscroll-behavior: contain;
}

.sv-backdrop {
    position: absolute;
    inset: 0;
    background: #000;
}

.sv-card {
    position: relative;
    height: 100%;
    width: 100%;
    max-width: calc(100dvh * 9 / 16);
    max-height: 100dvh;
    overflow: hidden;
    background: #000;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.sv-card.is-dragging {
    transition: none;
}

@media (min-width: 640px) {
    .sv-card {
        height: min(100dvh, 920px);
        border-radius: 18px;
    }
}

/* mídia */
.sv-media,
.sv-text {
    position: absolute;
    inset: 0;
}

.sv-media img,
.sv-media video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
}

.sv-text {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 28px;
}

.sv-text p {
    margin: 0;
    font-size: 28px;
    line-height: 1.25;
    font-weight: 700;
    text-align: center;
    overflow-wrap: anywhere;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.sv-shade {
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
}

.sv-shade--top {
    top: 0;
    height: 150px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.55), transparent);
}

.sv-shade--bottom {
    bottom: 0;
    height: 200px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
}

.sv-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 38px;
    height: 38px;
    margin: -19px 0 0 -19px;
    border-radius: 9999px;
    border: 3px solid rgba(255, 255, 255, 0.25);
    border-top-color: #fff;
    animation: sv-spin 0.8s linear infinite;
    pointer-events: none;
}

.sv-error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.75);
    text-align: center;
    padding: 24px;
    z-index: 3;
}

.sv-error button {
    background: #fff;
    color: #000;
    border: 0;
    border-radius: 9999px;
    padding: 8px 20px;
    font-weight: 600;
    cursor: pointer;
}

/* gestos: não cobre topo nem rodapé */
.sv-gesture {
    position: absolute;
    top: 96px;
    bottom: 120px;
    left: 0;
    right: 0;
    z-index: 2;
    touch-action: none;
}

.sv-burst {
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -48px 0 0 -48px;
    z-index: 4;
    pointer-events: none;
    animation: sv-pop 0.75s ease-out forwards;
    filter: drop-shadow(0 6px 18px rgba(254, 44, 85, 0.5));
}

/* topo */
.sv-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 5;
    padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 0;
    transition: opacity 0.18s ease;
}

.is-hidden {
    opacity: 0;
    pointer-events: none;
}

.sv-progress {
    display: flex;
    gap: 3px;
}

.sv-progress__seg {
    flex: 1;
    height: 2.5px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.32);
    overflow: hidden;
}

.sv-progress__fill {
    display: block;
    height: 100%;
    background: #fff;
}

.sv-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
}

.sv-head__meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.sv-head__name {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sv-head__time {
    font-size: 12px;
    opacity: 0.75;
}

.sv-icon {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 0;
    color: #fff;
    cursor: pointer;
    border-radius: 9999px;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
}

.sv-icon:focus-visible,
.sv-like:focus-visible,
.sv-views:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
}

/* legenda */
.sv-caption {
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 84px);
    z-index: 5;
    margin: 0;
    font-size: 15px;
    line-height: 1.35;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
    max-height: 5.4em;
    overflow: hidden;
    transition: opacity 0.18s ease;
    pointer-events: none;
}

/* rodapé */
.sv-bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    padding: 0 14px calc(env(safe-area-inset-bottom, 0px) + 14px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: opacity 0.18s ease;
}

.sv-reply {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sv-reply__input {
    flex: 1;
    min-width: 0;
    height: 46px;
    border-radius: 9999px;
    border: 1.5px solid rgba(255, 255, 255, 0.55);
    background: rgba(0, 0, 0, 0.25);
    color: #fff;
    padding: 0 18px;
    font-size: 15px;
    outline: none;
    backdrop-filter: blur(6px);
}

.sv-reply__input::placeholder {
    color: rgba(255, 255, 255, 0.75);
}

.sv-reply__input:focus {
    border-color: #fff;
}

.sv-reply__off {
    flex: 1;
    margin: 0;
    font-size: 13px;
    opacity: 0.75;
    text-align: center;
}

.sv-reply__send,
.sv-like {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 0;
    color: #fff;
}

.sv-reply__send {
    background: #fe2c55;
}

.sv-reply__send:disabled {
    opacity: 0.6;
}

.sv-like {
    background: none;
    transition: transform 0.15s ease;
}

.sv-like:active {
    transform: scale(0.85);
}

.sv-like.is-liked {
    animation: sv-bump 0.3s ease;
}

.sv-reactions {
    display: flex;
    justify-content: space-between;
    padding: 0 6px;
}

.sv-reactions button {
    font-size: 30px;
    background: none;
    border: 0;
    cursor: pointer;
    padding: 4px;
    transition: transform 0.12s ease;
}

.sv-reactions button:active {
    transform: scale(1.3);
}

.sv-views {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
    border: 0;
    border-radius: 9999px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    backdrop-filter: blur(6px);
}

.sv-views__heart {
    margin-left: 8px;
    color: #fe2c55;
}

.sv-hint {
    font-size: 12px;
    opacity: 0.65;
}

/* sheets */
.sv-sheet-wrap {
    position: absolute;
    inset: 0;
    z-index: 8;
    display: flex;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.45);
}

.sv-sheet {
    width: 100%;
    max-height: 70%;
    overflow-y: auto;
    background: #fff;
    color: #111;
    border-radius: 20px 20px 0 0;
    padding: 8px 16px calc(env(safe-area-inset-bottom, 0px) + 16px);
    touch-action: pan-y;
}

.sv-sheet--menu {
    display: flex;
    flex-direction: column;
}

.sv-sheet__grab {
    width: 38px;
    height: 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.18);
    margin: 4px auto 12px;
}

.sv-sheet__title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 700;
}

.sv-sheet__title span {
    font-weight: 500;
    opacity: 0.6;
}

.sv-sheet__empty {
    margin: 24px 0;
    text-align: center;
    opacity: 0.6;
    font-size: 14px;
}

.sv-sheet__list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.sv-viewer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
}

.sv-viewer__meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.sv-viewer__name {
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.sv-viewer__time {
    font-size: 12px;
    opacity: 0.55;
}

.sv-sheet__more {
    text-align: center;
    padding: 8px 0;
}

.sv-sheet__more button {
    background: none;
    border: 0;
    color: #fe2c55;
    font-weight: 600;
    cursor: pointer;
}

.sv-menu-item {
    width: 100%;
    text-align: left;
    background: none;
    border: 0;
    padding: 15px 4px;
    font-size: 16px;
    cursor: pointer;
    color: #111;
    border-top: 1px solid rgba(0, 0, 0, 0.07);
}

.sv-menu-item.is-danger {
    color: #fe2c55;
    font-weight: 600;
}

.sv-menu-text {
    margin: 4px 4px 12px;
    font-size: 14px;
    opacity: 0.7;
}

.sv-toast {
    position: absolute;
    left: 50%;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 96px);
    transform: translateX(-50%);
    z-index: 9;
    background: rgba(0, 0, 0, 0.8);
    padding: 9px 16px;
    border-radius: 9999px;
    font-size: 13px;
    white-space: nowrap;
}

/* transições (respondem a uma ação do usuário: abrir/fechar) */
.sv-enter-active,
.sv-leave-active {
    transition: opacity 0.18s ease;
}

.sv-enter-from,
.sv-leave-to {
    opacity: 0;
}

.sv-sheet-enter-active,
.sv-sheet-leave-active {
    transition: background 0.2s ease;
}

.sv-sheet-enter-active .sv-sheet,
.sv-sheet-leave-active .sv-sheet {
    transition: transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.sv-sheet-enter-from,
.sv-sheet-leave-to {
    background: rgba(0, 0, 0, 0);
}

.sv-sheet-enter-from .sv-sheet,
.sv-sheet-leave-to .sv-sheet {
    transform: translateY(100%);
}

@keyframes sv-spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes sv-pop {
    0% {
        transform: scale(0.3);
        opacity: 0;
    }

    30% {
        transform: scale(1.15);
        opacity: 1;
    }

    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

@keyframes sv-bump {
    50% {
        transform: scale(1.25);
    }
}

@media (prefers-reduced-motion: reduce) {

    .sv-card,
    .sv-sheet,
    .sv-burst,
    .sv-like.is-liked {
        transition: none;
        animation: none;
    }

    .sv-spinner {
        animation-duration: 2s;
    }
}
</style>