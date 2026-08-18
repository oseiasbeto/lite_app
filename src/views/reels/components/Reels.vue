<template>
  <div class="reels-feed" ref="scrollEl" @scroll.passive="onScroll">

    <button v-if="showClose" class="reels-close-btn" aria-label="Fechar" @click="emit('close')">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="m5.5 5.5 13 13m-13 0 13-13" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      </svg>
    </button>

    <div
      v-for="(item, index) in items"
      :key="item.id"
      :ref="el => setSlideRef(el, index)"
      :data-index="index"
      class="reels-slide-wrap"
    >
      <ReelItem
        :item="item"
        :active="index === activeIndex"
        :should-mount="withinWindow(index)"
        v-model:muted="muted"
        :is-following="store?.state?.auth?.user?._id == item?.author?.id || store?.state?.auth?.user?.following?.includes(item?.author?.id)"
        @ended="onEnded(index)"
        @like="onLike"
        @comment="onComment"
        @share="onShare"
        @save="onSave"
        @follow="onFollow"
      />
    </div>

    <div v-if="loading" class="reels-loading">
      <div class="reels-loading-spinner" />
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
.reels-feed::-webkit-scrollbar { display: none; }

.reels-slide-wrap {
  position: relative;
  height: 100%;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  content-visibility: auto;
  contain-intrinsic-size: 100vh;
}

.reels-close-btn {
  position: fixed;
  left: 10px;
  top: 10px;
  z-index: 999;
  height: 36px;
  width: 36px;
  border: none;
  border-radius: 999px;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.reels-loading {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 24px;
  z-index: 30;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.reels-loading-spinner {
  height: 32px;
  width: 32px;
  border-radius: 999px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  animation: reels-spin 0.8s linear infinite;
}
@keyframes reels-spin { to { transform: rotate(360deg); } }

.reels-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
}
</style>