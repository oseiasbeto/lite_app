<template>
    <Teleport to="body">
        <div class="tt-cropper" role="dialog" aria-modal="true" aria-label="Ajustar foto de perfil">
            <!-- Topo -->
            <header class="tt-cropper__top">
                <button type="button" class="tt-cropper__link" @click="$emit('cancel')">Cancelar</button>
                <h2 class="tt-cropper__title">Ajustar foto</h2>
                <button type="button" class="tt-cropper__link tt-cropper__link--primary" :disabled="!ready || busy"
                    @click="confirm">
                    <span v-if="busy" class="tt-cropper__spinner"></span>
                    <span v-else>Concluir</span>
                </button>
            </header>

            <!-- Área de recorte -->
            <div ref="stage" class="tt-cropper__stage" @pointerdown="onPointerDown" @pointermove="onPointerMove"
                @pointerup="onPointerUp" @pointercancel="onPointerUp" @wheel.prevent="onWheel">
                <img ref="img" :src="src" alt="" draggable="false" class="tt-cropper__img" :style="imgStyle"
                    @load="onImageLoad" />

                <!-- Máscara circular + grade -->
                <div class="tt-cropper__mask" :style="{ width: cropSize + 'px', height: cropSize + 'px' }">
                    <span class="tt-cropper__grid tt-cropper__grid--v1"></span>
                    <span class="tt-cropper__grid tt-cropper__grid--v2"></span>
                    <span class="tt-cropper__grid tt-cropper__grid--h1"></span>
                    <span class="tt-cropper__grid tt-cropper__grid--h2"></span>
                </div>
            </div>

            <!-- Controles -->
            <footer class="tt-cropper__bottom">
                <p class="tt-cropper__hint">Arraste e use dois dedos para ajustar</p>
                <div class="tt-cropper__zoom">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    <input type="range" min="1" max="5" step="0.01" :value="zoom" aria-label="Zoom"
                        @input="setZoom(parseFloat($event.target.value))" />
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5M8 11h6M11 8v6" />
                    </svg>
                </div>
            </footer>
        </div>
    </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
    src: { type: String, required: true },
    outputSize: { type: Number, default: 800 },
    fileName: { type: String, default: 'profile.jpg' },
    quality: { type: Number, default: 0.92 }
})
const emit = defineEmits(['cancel', 'done'])

const stage = ref(null)
const img = ref(null)

const ready = ref(false)
const busy = ref(false)

const naturalW = ref(0)
const naturalH = ref(0)
const stageW = ref(0)
const stageH = ref(0)

const zoom = ref(1)   // 1 = imagem cobre exatamente o círculo
const tx = ref(0)     // deslocamento do centro da imagem em relação ao centro do palco
const ty = ref(0)

const cropSize = computed(() => Math.round(Math.min(stageW.value, stageH.value) * 0.82))
const minScale = computed(() =>
    naturalW.value && naturalH.value ? cropSize.value / Math.min(naturalW.value, naturalH.value) : 1
)
const scale = computed(() => minScale.value * zoom.value)

const imgStyle = computed(() => ({
    width: naturalW.value + 'px',
    height: naturalH.value + 'px',
    transform: `translate(-50%, -50%) translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
    opacity: ready.value ? 1 : 0
}))

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

function clampPosition() {
    const w = naturalW.value * scale.value
    const h = naturalH.value * scale.value
    const maxX = Math.max(0, (w - cropSize.value) / 2)
    const maxY = Math.max(0, (h - cropSize.value) / 2)
    tx.value = clamp(tx.value, -maxX, maxX)
    ty.value = clamp(ty.value, -maxY, maxY)
}

function setZoom(value) {
    zoom.value = clamp(value, 1, 5)
    clampPosition()
}

function measureStage() {
    if (!stage.value) return
    const rect = stage.value.getBoundingClientRect()
    stageW.value = rect.width
    stageH.value = rect.height
    clampPosition()
}

function onImageLoad() {
    naturalW.value = img.value.naturalWidth
    naturalH.value = img.value.naturalHeight
    measureStage()
    zoom.value = 1
    tx.value = 0
    ty.value = 0
    ready.value = true
}

/* ---------- Gestos (arrastar + pinça) ---------- */
const pointers = new Map()
let lastPinchDist = 0

function onPointerDown(e) {
    stage.value.setPointerCapture?.(e.pointerId)
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) lastPinchDist = pinchDistance()
}

function onPointerMove(e) {
    if (!pointers.has(e.pointerId)) return
    const prev = pointers.get(e.pointerId)
    const next = { x: e.clientX, y: e.clientY }
    pointers.set(e.pointerId, next)

    if (pointers.size === 1) {
        tx.value += next.x - prev.x
        ty.value += next.y - prev.y
        clampPosition()
    } else if (pointers.size === 2) {
        const dist = pinchDistance()
        if (lastPinchDist > 0) setZoom(zoom.value * (dist / lastPinchDist))
        lastPinchDist = dist
    }
}

function onPointerUp(e) {
    pointers.delete(e.pointerId)
    lastPinchDist = pointers.size === 2 ? pinchDistance() : 0
}

function pinchDistance() {
    const [a, b] = [...pointers.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
}

function onWheel(e) {
    setZoom(zoom.value * (e.deltaY < 0 ? 1.06 : 0.94))
}

/* ---------- Gerar o recorte ---------- */
function confirm() {
    if (!ready.value || busy.value) return
    busy.value = true

    const w = naturalW.value * scale.value
    const h = naturalH.value * scale.value
    const sSize = cropSize.value / scale.value
    const sx = (w / 2 - cropSize.value / 2 - tx.value) / scale.value
    const sy = (h / 2 - cropSize.value / 2 - ty.value) / scale.value

    const canvas = document.createElement('canvas')
    canvas.width = props.outputSize
    canvas.height = props.outputSize
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img.value, sx, sy, sSize, sSize, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
        (blob) => {
            busy.value = false
            if (!blob) return
            const file = new File([blob], props.fileName.replace(/\.[^.]+$/, '') + '.jpg', {
                type: 'image/jpeg'
            })
            emit('done', file)
        },
        'image/jpeg',
        props.quality
    )
}

/* ---------- Ciclo de vida ---------- */
let resizeObserver = null
let previousOverflow = ''

onMounted(() => {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    measureStage()
    resizeObserver = new ResizeObserver(measureStage)
    resizeObserver.observe(stage.value)
})

onBeforeUnmount(() => {
    document.body.style.overflow = previousOverflow
    resizeObserver?.disconnect()
})
</script>

<style scoped>
.tt-cropper {
    --tt-red: #fe2c55;
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    background: #000;
    color: #fff;
    font-family: 'Proxima Nova', 'TikTokFont', 'Helvetica Neue', Arial, sans-serif;
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    user-select: none;
    -webkit-user-select: none;
}

.tt-cropper__top {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    height: 52px;
    padding: 0 16px;
}

.tt-cropper__title {
    font-size: 17px;
    font-weight: 700;
    margin: 0;
}

.tt-cropper__link {
    background: none;
    border: 0;
    padding: 8px 0;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    justify-self: start;
}

.tt-cropper__link--primary {
    justify-self: end;
    color: var(--tt-red);
    font-weight: 700;
    min-width: 64px;
    text-align: right;
}

.tt-cropper__link:disabled {
    opacity: 0.4;
    cursor: default;
}

.tt-cropper__stage {
    position: relative;
    flex: 1;
    overflow: hidden;
    touch-action: none;
    cursor: grab;
}

.tt-cropper__stage:active {
    cursor: grabbing;
}

.tt-cropper__img {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: none;
    transform-origin: center center;
    pointer-events: none;
    transition: opacity 0.2s ease;
    will-change: transform;
}

/* O "buraco" circular é feito com uma sombra gigante ao redor */
.tt-cropper__mask {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.68);
    pointer-events: none;
    overflow: hidden;
}

.tt-cropper__grid {
    position: absolute;
    background: rgba(255, 255, 255, 0.28);
}

.tt-cropper__grid--v1,
.tt-cropper__grid--v2 {
    top: 0;
    bottom: 0;
    width: 1px;
}

.tt-cropper__grid--h1,
.tt-cropper__grid--h2 {
    left: 0;
    right: 0;
    height: 1px;
}

.tt-cropper__grid--v1 { left: 33.33%; }
.tt-cropper__grid--v2 { left: 66.66%; }
.tt-cropper__grid--h1 { top: 33.33%; }
.tt-cropper__grid--h2 { top: 66.66%; }

.tt-cropper__bottom {
    padding: 16px 24px 24px;
}

.tt-cropper__hint {
    margin: 0 0 14px;
    text-align: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
}

.tt-cropper__zoom {
    display: flex;
    align-items: center;
    gap: 14px;
    color: rgba(255, 255, 255, 0.75);
}

.tt-cropper__zoom input[type='range'] {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.25);
    outline: none;
}

.tt-cropper__zoom input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 0;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.tt-cropper__zoom input[type='range']::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 0;
}

.tt-cropper__zoom input[type='range']:focus-visible::-webkit-slider-thumb {
    outline: 2px solid var(--tt-red);
    outline-offset: 2px;
}

.tt-cropper__link:focus-visible {
    outline: 2px solid var(--tt-red);
    outline-offset: 2px;
    border-radius: 4px;
}

.tt-cropper__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(254, 44, 85, 0.3);
    border-top-color: var(--tt-red);
    border-radius: 50%;
    animation: tt-spin 0.7s linear infinite;
}

@keyframes tt-spin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .tt-cropper__img { transition: none; }
    .tt-cropper__spinner { animation-duration: 1.5s; }
}
</style>