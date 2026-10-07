<template>
  <div class="reels-feed" ref="scrollEl" @scroll.passive="onScroll">

    <button v-if="showClose" class="reels-close-btn" aria-label="Fechar" @click="emit('close')">
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path d="m5.5 5.5 13 13m-13 0 13-13" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" />
      </svg>
    </button>

    <div v-for="(item, index) in items" :key="item.id" :ref="el => setSlideRef(el, index)" :data-index="index"
      class="reels-slide-wrap">
      <ReelItem :item="item" :active="index === activeIndex" :should-mount="withinWindow(index)" v-model:muted="muted"
        :is-following="store?.state?.auth?.user?._id == item?.author?.id || store?.state?.auth?.user?.following?.includes(item?.author?.id)"
        @ended="onEnded(index)" @like="onLike" @comment="onComment" @share="onShare" @save="onSave"
        @follow="onFollow" />
    </div>

    <div v-if="loading" class="reels-loading" :class="{ 'is-initial': !items.length }">
      <div class="reels-loading-spinner" role="status" aria-label="A carregar">
        <span class="reels-dot reels-dot--cyan"></span>
        <span class="reels-dot reels-dot--red"></span>
      </div>
    </div>

    <div v-if="!loading && !items.length" class="reels-empty">
      <slot name="empty">Sem reels para mostrar.</slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import ReelItem from './ReelItem.vue'
import { useStore } from 'vuex'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: true },
  initialIndex: { type: Number, default: 0 },
  showClose: { type: Boolean, default: false },
  prefetchThreshold: { type: Number, default: 3 },
  startMuted: { type: Boolean, default: true }
})

const emit = defineEmits(['reach-end', 'like', 'comment', 'share', 'save', 'follow', 'close', 'active-change'])

const scrollEl = ref(null)
const slideRefs = ref([])
const activeIndex = ref(props.initialIndex)
const muted = ref(props.startMuted)

const WINDOW_RADIUS = 1
function withinWindow(index) {
  return Math.abs(index - activeIndex.value) <= WINDOW_RADIUS
}
const store = useStore()

function setSlideRef(el, index) {
  if (el) slideRefs.value[index] = el
}

let observer = null
let reachEndFired = false

function initObserver() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const idx = Number(entry.target.dataset.index)
          if (idx !== activeIndex.value) {
            activeIndex.value = idx
            emit('active-change', idx)
          }
          maybeReachEnd(idx)
        }
      }
    },
    { root: scrollEl.value, threshold: [0.6] }
  )
  slideRefs.value.forEach((el) => el && observer.observe(el))
}

function maybeReachEnd(idx) {
  if (!props.hasMore || props.loading) return
  const remaining = props.items.length - 1 - idx
  if (remaining <= props.prefetchThreshold) {
    if (!reachEndFired) {
      reachEndFired = true
      emit('reach-end')
    }
  } else {
    reachEndFired = false
  }
}

function onEnded(index) {
  if (index !== activeIndex.value) return
  goToIndex(index + 1)
}

function goToIndex(index) {
  const target = slideRefs.value[index]
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onKeydown(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); goToIndex(activeIndex.value + 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); goToIndex(activeIndex.value - 1) }
}

// Scroll nativo — não faz nenhum trabalho pesado, apenas existe como
// hook caso o consumidor precise de saber que houve movimento (analytics, etc.)
let scrollRaf = null
function onScroll() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => { scrollRaf = null })
}

function onLike(item) { emit('like', item) }
function onComment(item) { emit('comment', item) }
function onShare(item) { emit('share', item) }
function onSave(item) { emit('save', item) }
function onFollow(item) { emit('follow', item) }

watch(
  () => props.items.length,
  async () => { await nextTick(); initObserver() }
)

onMounted(async () => {
  await nextTick()
  if (props.initialIndex > 0) {
    slideRefs.value[props.initialIndex]?.scrollIntoView({ block: 'start' })
  }
  initObserver()
  window.addEventListener('keydown', onKeydown)
  if (props.items.length && props.items.length - 1 - activeIndex.value <= props.prefetchThreshold) {
    maybeReachEnd(activeIndex.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('keydown', onKeydown)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
})

defineExpose({ goToIndex, activeIndex })
</script>

<style scoped>
.reels-feed {
  position: relative;
  height: 100%;
  width: 100%;
  background: #000;
  overflow-y: scroll;
  overscroll-behavior-y: contain;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.reels-feed::-webkit-scrollbar {
  display: none;
}

.reels-slide-wrap {
  position: relative;
  height: 100%;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  content-visibility: auto;
  contain-intrinsic-size: 100vh;
}

/* Botão de fechar discreto, sem fundo */
.reels-close-btn {
  position: fixed;
  left: 8px;
  top: calc(env(safe-area-inset-top, 0px) + 8px);
  z-index: 999;
  height: 36px;
  width: 36px;
  border: none;
  border-radius: 999px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.5));
}

.reels-loading {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 28px;
  z-index: 30;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

/* Primeira carga (sem vídeos): loader no centro do ecrã */
.reels-loading.is-initial {
  top: 0;
  bottom: 0;
  align-items: center;
}

.reels-loading-spinner {
  position: relative;
  width: 44px;
  height: 14px;
}

.reels-dot {
  position: absolute;
  top: 0;
  left: 50%;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 999px;
  mix-blend-mode: screen;
  animation: reels-cross 0.6s ease-in-out infinite alternate;
}

.reels-dot--cyan {
  background: #25f4ee;
}

.reels-dot--red {
  background: #fe2c55;
  animation-direction: alternate-reverse;
}

@keyframes reels-cross {
  0%   { transform: translateX(-15px) scale(1); }
  50%  { transform: translateX(0) scale(0.7); }
  100% { transform: translateX(15px) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .reels-dot { animation-duration: 1.6s; }
}

.reels-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}
</style>