<template>
    <div class="media-cell w-full rounded-2xl overflow-hidden cursor-pointer group"
        :style="{ aspectRatio: ratio }"
        @click="$emit('open', video)">

        <!-- Thumbnail -->
        <img v-if="video.thumbnail" :src="video.thumbnail" :alt="'Video thumbnail'"
            class="w-full h-full object-cover" />
        <div v-else class="w-full h-full bg-[rgb(30,30,30)] flex items-center justify-center">
            <svg class="w-12 h-12 text-[rgb(120,120,120)]" fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
        </div>

        <!-- Dark overlay sutil, escurece um pouco mais no hover (igual X) -->
        <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-200" />

        <!-- Play button estilo X: círculo escuro translúcido, cresce levemente no hover -->
        <div class="absolute inset-0 flex items-center justify-center">
            <div
                class="w-12 h-12 rounded-full bg-black/65 flex items-center justify-center shadow-lg transition-transform duration-150 group-hover:scale-105 group-active:scale-95">
                <svg viewBox="0 0 24 24" fill="white" width="28" height="28" class="ml-1">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </div>
        </div>

        <!-- Duration badge: canto inferior ESQUERDO, pill arredondado, igual X -->
        <div v-if="video.duration"
            class="absolute bottom-2 left-2 bg-black/75 text-white text-xs font-semibold px-1.5 py-0.5 rounded-md leading-none">
            {{ formatDuration(video.duration) }}
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    video: {
        type: Object,
        required: true
    },
    isParentPost: {
        type: Boolean,
        default: false
    }
})

defineEmits(['open'])

// Mesmos limites de proporção usados nas imagens (evita vídeo "espaguete" vertical
// ou faixa horizontal gigante, igual o comportamento do X)
const MIN_RATIO = 0.5      // limite retrato (1:2)
const MAX_RATIO = 1.7778   // limite paisagem (16:9)

const ratio = computed(() => {
    const w = props.video?.width
    const h = props.video?.height
    if (!w || !h) return MAX_RATIO // fallback se não vier metadata

    const r = w / h
    const clamped = Math.min(MAX_RATIO, Math.max(MIN_RATIO, r))

    // Post citado (parentPost) fica mais compacto, igual o comportamento das imagens ali
    return props.isParentPost ? Math.max(clamped, 1.3) : clamped
})

const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'

    const totalSeconds = Math.floor(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
}
</script>

<style scoped>
.media-cell {
    position: relative;
    background-color: rgb(230, 231, 232);
    border: 1px solid rgb(239, 243, 244);
}

.dark .media-cell {
    background-color: rgb(24, 24, 24);
    border-color: rgb(47, 51, 54);
}
</style>