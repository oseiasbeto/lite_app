<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div v-if="isOpen" :class="['fixed inset-0 z-[9999]', overlayClass]" @click.self="close" />
    </Transition>

    <Transition name="drawer-slide" @after-leave="onAfterLeave">
      <div v-if="isOpen" ref="drawerRef" :class="[
        'fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-[#181818] rounded-t-2xl overflow-hidden',
        'max-h-[85vh] flex flex-col',
        costumClass,
      ]" :style="dragStyle" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">

        <!-- Alça de arrastar -->
        <div class="flex justify-center pt-2 pb-1 shrink-0 cursor-grab active:cursor-grabbing" @mousedown="onMouseDown">
          <span class="w-9 h-[5px] rounded-full bg-[rgb(207,217,222)] dark:bg-[rgb(83,100,113)]"></span>
        </div>

        <div v-show="title"
          class="flex px-[16px] justify-center border-b dark:border-[#393839] shadow-[0_1px_1px_rgba(0,0,0,.15)] w-full h-12 shrink-0">
          <div class="h-full w-full flex items-center">
            <span class="flex-1 dark:text-white text-[rgb(40,40,41)] text-base font-semibold text-center"> {{ title }}
            </span>
          </div>
        </div>
        <div class="relative overflow-y-auto">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, ref, reactive } from 'vue';
import { useStore } from 'vuex';


const props = defineProps({
  isOpen: Boolean,
  overlayClass: {
    type: String,
    default: "dark:bg-[rgba(36,36,36,.9)] bg-[rgba(36,36,36,0.9)]"
  },
  title: {
    type: String,
    default: null
  },
  costumClass: String,
})
const store = useStore()
const currentTheme = computed(() => store.getters.currentTheme)

const setThemeColor = (theme) => {
    // Aplicar classe no HTML
    if (theme === 'dark') {
        window?.WTN?.statusBar({
            style: 'light',
            color: '000000',
            overlay: false //Only for android
        });
    } else if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (isDark) {
            window?.WTN?.statusBar({
                style: 'dark',
                color: '0',
                overlay: false //Only for android
            });
        } else {
            window?.WTN.statusBar({
                style: 'dark',
                color: "FFFFFF",
                overlay: false //Only for android
            });
        }
    } else {
        window?.WTN.statusBar({
            style: 'dark',
            color: "FFFFFF",
            overlay: false //Only for android
        })
    }
}

const emit = defineEmits(['close'])

// ── Drag to close (touch + mouse) ──────────────────────────────
const drawerRef = ref(null)
const dragState = reactive({
  dragging: false,
  startY: 0,
  deltaY: 0,
})

const CLOSE_THRESHOLD = 90 // px arrastados pra fechar

const dragStyle = computed(() => {
  if (!dragState.dragging || dragState.deltaY <= 0) return {}
  return {
    transform: `translateY(${dragState.deltaY}px)`,
    transition: 'none',
  }
})

const startDrag = (clientY) => {
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
  }
  dragState.deltaY = 0
}

const onTouchStart = (e) => startDrag(e.touches[0].clientY)
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
}

// Watch para monitorar o isOpen
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }

  if (newValue && currentTheme.value == 'light') {
    // Quando o drawer abrir (isOpen = true), troca a cor
    if (window?.WTN) {
      window.WTN.statusBar({
        style: 'light',
        color: '000000',
        overlay: false
      });
    }
  } else {
    // Quando fechar, restaura a cor baseada no tema atual
    setThemeColor(currentTheme.value);
  }
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
</style>