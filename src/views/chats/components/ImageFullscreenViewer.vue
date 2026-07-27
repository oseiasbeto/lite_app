<!-- src/components/chat/ImageFullscreenViewer.vue -->
<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] bg-black">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <button v-if="showHeader" type="button" @click="close"
          class="absolute top-4 left-4 z-[10000] w-10 h-10 rounded-full bg-black/40 flex items-center justify-center active:opacity-60">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M6 18L18 6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </button>
      </Transition>

      <swiper :initial-slide="0" :slides-per-view="1" :space-between="0" direction="horizontal"
        :centered-slides="true" :modules="modules" :zoom="{ maxRatio: 4, minRatio: 1 }"
        :keyboard="{ enabled: true }" class="swiper-fullscreen" @click="toggleHeader" @swiper="onSwiperInit">
        <swiper-slide class="swiper-slide-fullscreen">
          <div class="swiper-zoom-container">
            <img :src="imageUrl" class="slide-img" draggable="false" alt="Imagem" />
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Zoom, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/zoom'

const props = defineProps({
  imageUrl: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const modules = [Zoom, Keyboard]
const showHeader = ref(true)
const swiperInstance = ref(null)

const onSwiperInit = (swiper) => { swiperInstance.value = swiper }

const toggleHeader = () => {
  const zoom = swiperInstance.value?.zoom
  if (zoom && zoom.scale > 1) return
  showHeader.value = !showHeader.value
}

const close = () => emit('close')

// Fecha também com a tecla Esc (desktop)
const onKeydown = (e) => { if (e.key === 'Escape') close() }
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.swiper-fullscreen {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
  background: #000;
  z-index: 9999;
}

.swiper-slide-fullscreen {
  width: 100dvw !important;
  height: 100dvh !important;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.swiper-zoom-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
</style>