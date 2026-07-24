<template>
  <div class="flex h-screen w-full flex-col items-center justify-center bg-white relative">
    <!-- Logo -->
    <div class="flex h-[100px] w-[100px] items-center justify-center rounded-[26px] shadow-lg bg-white">
      <div class="relative flex h-[88px] w-[88px] text-black items-center justify-center rounded-[22px]">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="80px" viewBox="0 0 1024.000000 1024.000000"
          preserveAspectRatio="xMidYMid meet">
          <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
            <path
              d="M2516 7511 c-3 -5 -21 -12 -40 -15 -71 -13 -154 -87 -537 -472 -421 -424 -425 -429 -450 -567 -24 -130 20 -263 122 -365 51 -51 78 -69 173 -113 18 -9 66 -14 130 -14 89 0 108 3 160 28 32 15 69 27 82 27 l24 0 0 -948 c0 -724 3 -951 12 -960 17 -17 829 -17 846 0 9 9 12 359 12 1515 0 1615 2 1551 -50 1654 -49 96 -199 219 -266 219 -13 0 -26 5 -29 10 -8 12 -182 13 -189 1z" />
            <path
              d="M3895 7511 c-6 -5 -36 -17 -69 -26 -105 -33 -220 -168 -255 -300 -15 -56 -15 -4074 0 -4130 21 -80 63 -150 130 -216 54 -53 78 -69 125 -84 33 -9 63 -21 68 -26 13 -12 182 -11 204 0 9 6 47 24 84 41 64 29 115 78 910 871 464 463 850 845 859 850 17 9 60 -33 1289 -1254 449 -446 478 -472 580 -503 52 -16 206 -19 215 -4 3 6 13 10 22 10 33 0 128 56 178 105 106 103 158 271 124 400 -31 120 -15 102 -916 1005 -469 470 -853 862 -853 870 0 8 384 400 853 870 901 903 885 885 916 1005 34 129 -18 297 -124 400 -50 49 -145 105 -178 105 -9 0 -19 5 -22 10 -9 15 -163 12 -215 -4 -52 -16 -113 -48 -155 -83 -16 -14 -743 -734 -1614 -1602 -871 -867 -1592 -1577 -1602 -1579 -18 -3 -19 36 -22 1455 -2 963 -6 1472 -13 1498 -6 22 -19 55 -30 74 -10 18 -24 43 -31 55 -28 49 -108 117 -171 146 -37 17 -75 35 -84 41 -22 11 -191 12 -203 0z" />
            <path
              d="M2550 3603 c-65 -7 -167 -52 -218 -97 -56 -49 -120 -143 -136 -199 -29 -106 -38 -157 -28 -170 5 -6 12 -34 15 -60 20 -151 163 -296 338 -342 62 -17 155 -20 164 -5 3 6 17 10 31 10 74 0 239 125 281 213 11 23 28 57 37 76 12 25 16 63 16 138 0 106 -9 138 -75 253 -41 73 -186 163 -291 180 -59 10 -68 10 -134 3z" />
          </g>
        </svg>
      </div>
    </div>

    <!-- Dots -->
    <div class="mt-7 flex gap-2">
      <span v-for="n in totalDots" :key="n" class="h-2 w-2 rounded-full transition-colors duration-300"
        :class="n === activeDot ? 'bg-neutral-900' : 'bg-neutral-300'"></span>
    </div>

    <!-- Rodapé "from Meta" -->
    <div class="absolute bottom-16 flex flex-col items-center gap-1">

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  totalDots: { type: Number, default: 5 },
  autoStart: { type: Boolean, default: true }, // começa a "respirar" os dots assim que monta
  minIntervalMs: { type: Number, default: 180 }, // intervalo em conexão muito rápida
  maxIntervalMs: { type: Number, default: 900 }, // intervalo em conexão muito lenta
  onFinish: { type: Function, default: null } // chamado quando finish() termina a animação
})

const emit = defineEmits(['finish'])

const activeDot = ref(1)
const isFinishing = ref(false)

let timer = null
let currentInterval = props.maxIntervalMs

// --- Estima velocidade da conexão e converte num intervalo de animação ---
function estimateIntervalFromConnection() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection

  if (!conn) return props.minIntervalMs + (props.maxIntervalMs - props.minIntervalMs) / 2 // fallback: velocidade "média"

  // effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
  const byType = {
    'slow-2g': props.maxIntervalMs,
    '2g': props.maxIntervalMs * 0.8,
    '3g': props.maxIntervalMs * 0.45,
    '4g': props.minIntervalMs
  }

  let interval = byType[conn.effectiveType] ?? props.maxIntervalMs * 0.45

  // refina com downlink (Mbps) se disponível, quanto maior, mais rápido
  if (typeof conn.downlink === 'number' && conn.downlink > 0) {
    const speedFactor = Math.min(conn.downlink / 10, 1) // normaliza até ~10 Mbps
    interval = props.maxIntervalMs - speedFactor * (props.maxIntervalMs - props.minIntervalMs)
  }

  return Math.round(Math.min(Math.max(interval, props.minIntervalMs), props.maxIntervalMs))
}

function scheduleNextDot() {
  timer = setTimeout(() => {
    activeDot.value = activeDot.value < props.totalDots ? activeDot.value + 1 : 1
    scheduleNextDot()
  }, currentInterval)
}

// --- Ciclo indeterminado: fica passando pelos dots até finish() ser chamado ---
function start() {
  stop()
  isFinishing.value = false
  currentInterval = estimateIntervalFromConnection()
  scheduleNextDot()
}

function stop() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// --- Chame isto quando a requisição (refresh token) responder ---
function finish() {
  if (isFinishing.value) return
  isFinishing.value = true
  stop()

  // completa rapidamente até o último dot, dando sensação de "concluído"
  const step = () => {
    if (activeDot.value < props.totalDots) {
      activeDot.value++
      timer = setTimeout(step, 80)
    } else {
      if (props.onFinish) props.onFinish()
      emit('finish')
    }
  }
  step()
}

function handleConnectionChange() {
  if (timer && !isFinishing.value) {
    currentInterval = estimateIntervalFromConnection()
  }
}

onMounted(() => {
  window?.WTN.statusBar({
    style: 'dark',
    color: "FFFFFF",
    overlay: false //Only for android
  });
  window?.WTN?.setNavigationBarColor({ color: "#000000" });

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (conn) conn.addEventListener('change', handleConnectionChange)
  if (props.autoStart) start()
})

onUnmounted(() => {
  stop()
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (conn) conn.removeEventListener('change', handleConnectionChange)
})

defineExpose({ start, stop, finish })
</script>