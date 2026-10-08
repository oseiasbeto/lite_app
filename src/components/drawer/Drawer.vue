<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div v-if="isOpen" :class="['fixed inset-0 z-[999]', overlayClass]" aria-hidden="true" @click.self="close" />
    </Transition>

    <Transition name="drawer-slide" @after-leave="onAfterLeave">
      <div v-if="isOpen" ref="drawerRef" role="dialog" aria-modal="true" :aria-label="title || 'Painel'" :class="[
        'fixed bottom-0 left-0 right-0 z-[999] flex max-h-[90vh] max-h-[90dvh] flex-col overflow-hidden',
        'rounded-t-[14px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] dark:bg-x-dark-surface',
        'mx-auto w-full sm:max-w-[520px]',
        costumClass,
      ]" :style="dragStyle" @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd" @touchcancel="onTouchEnd">

        <!-- Alça de arrastar -->
        <div class="flex shrink-0 cursor-grab justify-center pb-1.5 pt-2.5 active:cursor-grabbing"
          @mousedown="onMouseDown">
          <span class="h-1 w-9 rounded-full bg-black/15 dark:bg-white/25"></span>
        </div>

        <!-- Título + fechar -->
        <div v-show="title"
          class="relative flex h-12 w-full shrink-0 items-center justify-center border-b border-black/[0.06] px-14 dark:border-white/10">
          <span class="truncate text-[16px] font-semibold text-[rgb(22,24,35)] dark:text-white">
            {{ title }}
          </span>
          <button type="button" aria-label="Fechar"
            class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[rgb(22,24,35)]/60 transition-colors hover:bg-black/5 active:bg-black/10 dark:text-white/60 dark:hover:bg-white/10 dark:active:bg-white/15"
            @click="close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Conteúdo -->
        <div ref="contentRef"
          class="relative overflow-y-auto overscroll-contain pb-[max(env(safe-area-inset-bottom),12px)]">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, ref, reactive, onBeforeUnmount } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  overlayClass: {
    type: String,
    default: "bg-[rgba(0,0,0,0.5)] dark:bg-[rgba(0,0,0,0.65)]"
  },
  title: {
    type: String,
    default: null
  },
  costumClass: String,
})

const emit = defineEmits(['close'])

// ── Drag to close (touch + mouse) ──────────────────────────────
const drawerRef = ref(null)
const contentRef = ref(null)
const dragState = reactive({
  dragging: false,
  releasing: false,
  startY: 0,
  deltaY: 0,
})

const CLOSE_THRESHOLD = 90 // px arrastados pra fechar
let releaseTimer = null

const dragStyle = computed(() => {
  if (dragState.dragging && dragState.deltaY > 0) {
    return { transform: `translateY(${dragState.deltaY}px)`, transition: 'none' }
  }
  // Volta suavemente à posição quando solta sem fechar
  if (dragState.releasing) {
    return { transform: 'translateY(0)', transition: 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)' }
  }
  return {}
})

const startDrag = (clientY) => {
  clearTimeout(releaseTimer)
  dragState.releasing = false
  dragState.dragging = true
  dragState.startY = clientY
  dragState.deltaY = 0
}

const moveDrag = (clientY) => {
  if (!dragState.dragging) return
  const delta = clientY - dragState.startY
  dragState.deltaY = delta > 0 ? delta : 0
}

const endDrag = () => {
  if (!dragState.dragging) return
  dragState.dragging = false
  if (dragState.deltaY > CLOSE_THRESHOLD) {
    close()
  } else if (dragState.deltaY > 0) {
    dragState.releasing = true
    releaseTimer = setTimeout(() => { dragState.releasing = false }, 240)
  }
  dragState.deltaY = 0
}

// Só arrasta o painel se o conteúdo estiver no topo (não briga com o scroll da lista)
const onTouchStart = (e) => {
  if (contentRef.value && contentRef.value.contains(e.target) && contentRef.value.scrollTop > 0) return
  startDrag(e.touches[0].clientY)
}
const onTouchMove = (e) => moveDrag(e.touches[0].clientY)
const onTouchEnd = () => endDrag()

const onMouseDown = (e) => {
  startDrag(e.clientY)
  const onMouseMove = (ev) => moveDrag(ev.clientY)
  const onMouseUp = () => {
    endDrag()
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const onAfterLeave = () => {
  dragState.deltaY = 0
  dragState.releasing = false
}

// Fecha com Esc
const onKeydown = (e) => {
  if (e.key === 'Escape') close()
}

// Watch para monitorar o isOpen
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  clearTimeout(releaseTimer)
  window.removeEventListener('keydown', onKeydown)
  if (props.isOpen) document.body.style.overflow = ''
})

const close = () => {
  emit('close')
}
</script>

<style>
/* Backdrop: fade simples */
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

/* Painel: slide com easing tipo iOS */
.drawer-slide-enter-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-slide-leave-active {
  transition: transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {

  .drawer-backdrop-enter-active,
  .drawer-backdrop-leave-active,
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition-duration: 0.01s;
  }
}
</style>