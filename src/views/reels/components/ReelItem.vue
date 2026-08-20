<template>
  <div class="reel-slide" @click="onTap">

    <!-- Vídeo real — só existe no DOM quando o slide está na janela activa/preload -->
    <video v-if="shouldMount" ref="videoEl" class="reel-video" :poster="item?.video?.thumbnail" playsinline
      webkit-playsinline x5-playsinline preload="metadata" @timeupdate="onTimeUpdate" @loadedmetadata="onMetadata"
      @waiting="buffering = true" @playing="buffering = false" @canplay="buffering = false" @ended="onEnded" />

    <!-- Poster estático fora da janela de montagem — custo quase zero -->
    <img v-else :src="item?.video?.thumbnail" loading="lazy" decoding="async" class="reel-poster" alt="" />

    <!-- Gradientes para legibilidade do topo e rodapé, à TikTok -->
    <div class="reel-scrim-top" />
    <div class="reel-scrim-bottom" />

    <!-- Barra de progresso fina no topo -->
    <div class="reel-progress-track">
      <div class="reel-progress-fill" :style="{ width: progressPct + '%' }" />
    </div>

    <!-- Botão de som, sempre visível -->
    <button class="reel-icon-btn reel-mute-btn" :class="{ 'reel-mute-btn--pulse': needsUnmutePrompt }"
      :aria-label="isMuted ? 'Ativar som' : 'Silenciar'" @click.stop="toggleMute">
      <svg v-if="!isMuted" viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path
          d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path
          d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    </button>

    <!-- Aviso discreto a pedir um toque para ativar o som (browser bloqueou autoplay com áudio) -->
    <Transition name="fade">
      <div v-if="needsUnmutePrompt" class="reel-unmute-hint" @click.stop="toggleMute">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
          <path
            d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
        <span>Toca para ativar o som</span>
      </div>
    </Transition>

    <!-- Spinner de buffer -->
    <Transition name="fade">
      <div v-if="active && buffering" class="reel-spinner-wrap">
        <div class="reel-spinner" />
      </div>
    </Transition>

    <!-- Rodapé: autor + legenda -->
    <div class="reel-footer">
      <div class="reel-author">
        <div class="reel-avatar-wrap" @click="goToProfile(item.author.id)">
          <div class="reel-avatar">
            <img v-if="item?.author?.avatar" :src="item?.author?.avatar" alt="" />
            <span v-else>{{ authorInitial }}</span>
          </div>
          <button v-if="!isFollowing" class="reel-avatar-follow" aria-label="Seguir" @click.stop="emitFollow">+</button>
        </div>
        <div @click="goToProfile(item?.author?.id)" class="reel-author-meta">
          <span class="reel-author-name">
            {{ item?.author?.name }}
            <svg v-if="item?.author?.verified" viewBox="0 0 22 22" width="13" height="13" fill="#1d9bf0"
              class="reel-verified">
              <path
                d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
          </span>
        </div>
      </div>
      <p v-if="item?.caption" class="reel-caption" v-html="item?.caption"></p>
      <div v-if="item?.sound?.name" class="reel-sound-tag">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
          <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
        </svg>
        <span>{{ item?.sound?.name }}</span>
      </div>
    </div>

    <!-- Barra lateral de ações -->
    <div class="reel-actions">
      <button class="reel-action" :class="{ 'is-liked': item?.liked }" @click.stop="emitLike">
        <svg viewBox="-0.5 0 25 24" width="30" height="30" fill="currentColor" :class="{ 'like-pop': likePopping }">
          <path v-if="item?.liked"
            d="M16.4045 1.50879C14.785 1.50879 13.2185 2.16259 12 3.30764C10.7815 2.16259 9.215 1.50879 7.5955 1.50879C3.41766 1.50879 0.5 4.62796 0.5 9.09411C0.5 13.7857 4.70617 18.9703 11.2153 22.3022C11.4605 22.428 11.7298 22.4912 11.9995 22.4912C12.2692 22.4912 12.5395 22.428 12.7847 22.3022C19.2938 18.9703 23.5 13.7857 23.5 9.09411C23.5 4.62796 20.5823 1.50879 16.4045 1.50879Z" />
          <path v-else
            d="M16.5 2C14.8335 2 13.2217 2.70703 12 3.93652C10.7783 2.70704 9.1665 2 7.5 2C3.3785 2 0.5 5.08423 0.5 9.5C0.5 14.1284 4.84516 19.4619 11.311 22.7719C11.5267 22.8827 11.7633 22.9379 12 22.9379C12.2367 22.9379 12.4733 22.8827 12.689 22.7719C19.1548 19.4619 23.5 14.1284 23.5 9.5C23.5 5.08423 20.6217 2 16.5 2ZM12 20.8764C6.30767 17.8962 2.5 13.3467 2.5 9.5C2.5 6.15893 4.4625 4 7.5 4C9.5 4 11.25 5.75 12 7.5C12.75 5.75 14.5 4 16.5 4C19.5377 4 21.5 6.15893 21.5 9.5C21.5 13.3467 17.6923 17.8962 12 20.8764Z" />
        </svg>
        <span>{{ formatCount(item?.stats?.likes) }}</span>
      </button>

      <button class="reel-action" @click.stop="emit('comment', item)">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path fill-rule="evenodd"
            d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C13.414 21 14.7492 20.6747 15.9373 20.0956C16.1277 20.0028 16.3428 19.9728 16.5514 20.0101L20.7565 20.7619L19.9927 16.5927C19.954 16.3815 19.9843 16.1633 20.0792 15.9707C20.6685 14.7742 21 13.4273 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92486 5.92488 1 12 1C18.0752 1 23 5.92488 23 12C23 13.6205 22.649 15.1615 22.018 16.549L22.9836 21.8198C23.0427 22.1423 22.94 22.4733 22.7086 22.7056C22.4773 22.938 22.1468 23.0421 21.824 22.9844L16.512 22.0348C15.1341 22.6553 13.6061 23 12 23C5.92488 23 1 18.0752 1 12Z" />
        </svg>
        <span>{{ formatCount(item?.stats?.comments) }}</span>
      </button>

      <button class="reel-action" :class="{ 'is-saved': item.saved }" @click.stop="emit('save', item)">
        <svg viewBox="0 0 24 24" width="28" height="28" :fill="item.saved ? 'currentColor' : 'none'"
          stroke="currentColor" stroke-width="1.8">
          <path d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75V21l-6-3.6L6 21V3.75Z"
            stroke-linejoin="round" />
        </svg>
        <span>{{ formatCount(item?.stats?.saves) }}</span>
      </button>

      <button class="reel-action" @click.stop="emit('share', item)">
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <g id="Communication / Share_Android">
          <path id="Vector" d="M9 13.5L15 16.5M15 7.5L9 10.5M18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21ZM6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12C9 13.6569 7.65685 15 6 15ZM18 9C16.3431 9 15 7.65685 15 6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        </svg>
        <span>{{ formatCount(item?.stats?.shares) }}</span>
      </button>

      <!-- Disco de som giratório — assinatura visual do TikTok -->
      <div class="reel-sound-disc" :class="{ 'is-spinning': isPlaying && !buffering }">
        <img v-if="item?.author?.avatar" :src="item?.author?.avatar" alt="" />
        <span v-else>{{ authorInitial }}</span>
      </div>
    </div>

    <!-- Feedback central: play/pause -->
    <Transition name="fade">
      <div v-if="tapFeedback" class="reel-tap-feedback">
        <svg v-if="!isPlaying" viewBox="0 0 24 24" width="54" height="54" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="54" height="54" fill="white">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      </div>
    </Transition>

    <!-- Coração de duplo-toque -->
    <Transition name="heart">
      <div v-if="heartBurst" class="reel-heart-burst">
        <svg viewBox="0 0 24 24" width="90" height="90" fill="white">
          <path
            d="M16.5 2C14.8335 2 13.2217 2.70703 12 3.93652C10.7783 2.70704 9.1665 2 7.5 2C3.3785 2 0.5 5.08423 0.5 9.5C0.5 14.1284 4.84516 19.4619 11.311 22.7719C11.5267 22.8827 11.7633 22.9379 12 22.9379C12.2367 22.9379 12.4733 22.8827 12.689 22.7719C19.1548 19.4619 23.5 14.1284 23.5 9.5C23.5 5.08423 20.6217 2 16.5 2Z" />
        </svg>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Hls from 'hls.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// ── Desbloqueio de som partilhado por TODOS os slides ──
// Os browsers só permitem tocar áudio depois de um gesto do utilizador
// (toque, clique, tecla) em qualquer ponto da página — não é algo que
// se contorne com JS. Assim que esse primeiro gesto acontecer (mesmo
// que seja só um deslizar para o próximo vídeo), marcamos o áudio como
// "desbloqueado" para a sessão inteira e tentamos logo pôr o vídeo
// activo a tocar com som, sem o utilizador ter de tocar no ícone de mute.
const audioUnlockListeners = []
let audioUnlocked = false
const pendingUnlockCallbacks = new Set()

function registerAudioUnlockCallback(cb) {
  pendingUnlockCallbacks.add(cb)
  if (audioUnlockListeners.length === 0) {
    const unlock = () => {
      audioUnlocked = true
      audioUnlockListeners.forEach(({ type, handler }) =>
        window.removeEventListener(type, handler, true)
      )
      audioUnlockListeners.length = 0
      pendingUnlockCallbacks.forEach((fn) => fn())
      pendingUnlockCallbacks.clear()
    }
    for (const type of ['pointerdown', 'touchstart', 'keydown']) {
      window.addEventListener(type, unlock, { capture: true, once: true })
      audioUnlockListeners.push({ type, handler: unlock })
    }
  }
}

function unregisterAudioUnlockCallback(cb) {
  pendingUnlockCallbacks.delete(cb)
}

const props = defineProps({
  item: { type: Object, required: true },
  active: { type: Boolean, default: false },     // slide centrado no ecrã: deve reproduzir
  shouldMount: { type: Boolean, default: false }, // dentro da janela de virtualização (activo ou vizinho)
  // Por omissão o vídeo NÃO começa mudo — só cai para mudo se o browser
  // bloquear o autoplay com som (ver attemptPlay/onReady mais abaixo).
  muted: { type: Boolean, default: false },
  isFollowing: { type: Boolean, default: true }
})

const emit = defineEmits(['ended', 'like', 'comment', 'share', 'save', 'follow', 'update:muted'])

const videoEl = ref(null)
const buffering = ref(false)
const isPlaying = ref(false)
const isMuted = ref(props.muted)
const currentTime = ref(0)
const duration = ref(0)
const progressPct = ref(0)
const sourceReady = ref(false)
const needsUnmutePrompt = ref(false)

const tapFeedback = ref(false)
const heartBurst = ref(false)
const likePopping = ref(false)

let hlsInstance = null
let lastTapAt = 0
let tapTimer = null
let feedbackTimer = null
let heartTimer = null
let attaching = false // evita chamadas concorrentes/duplicadas de attachSource



const authorInitial = computed(() => (props.item.author?.name || '?').trim().charAt(0).toUpperCase())

function formatCount(n) {
  if (!n) return ''
  if (n < 1000) return String(n)
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + 'mil'
  return (n / 1_000_000).toFixed(1) + 'M'
}

function emitLike() {
  likePopping.value = false
  requestAnimationFrame(() => { likePopping.value = true })
  emit('like', props.item)
}

function emitFollow() {
  emit('follow', props.item)
}

// ── Gesto: toque simples = play/pause · duplo toque = gosto ──
function onTap() {
  const now = Date.now()
  const delta = now - lastTapAt
  lastTapAt = now

  if (delta < 280) {
    clearTimeout(tapTimer)
    triggerHeartBurst()
    if (!props.item.liked) emitLike()
    return
  }

  tapTimer = setTimeout(() => {
    togglePlay()
  }, 280)
}

function triggerHeartBurst() {
  heartBurst.value = false
  requestAnimationFrame(() => { heartBurst.value = true })
  clearTimeout(heartTimer)
  heartTimer = setTimeout(() => { heartBurst.value = false }, 700)
}

function togglePlay() {
  const el = videoEl.value
  if (!el || !sourceReady.value) return
  if (isPlaying.value) el.pause()
  else el.play().catch((err) => console.error('[reel] togglePlay falhou', err))
  flashTapFeedback()
}

function flashTapFeedback() {
  tapFeedback.value = true
  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { tapFeedback.value = false }, 420)
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (videoEl.value) videoEl.value.muted = isMuted.value
  if (!isMuted.value) {
    audioUnlocked = true
    needsUnmutePrompt.value = false
  }
  emit('update:muted', isMuted.value)
}

function onTimeUpdate() {
  const el = videoEl.value
  if (!el) return
  currentTime.value = el.currentTime
  duration.value = el.duration || 0
  progressPct.value = duration.value ? (currentTime.value / duration.value) * 100 : 0
  isPlaying.value = !el.paused
}

function onMetadata() {
  duration.value = videoEl.value?.duration || 0
}

function onEnded() {
  isPlaying.value = false
  emit('ended', props.item)
}

async function attachSource() {
  const el = videoEl.value
  const video = props.item.video
  if (!el || !video?.url) return
  if (attaching || sourceReady.value) return // ← evita instâncias/listeners duplicados
  attaching = true

  try {
    // Detecta HLS pelo campo `format` OU pela extensão do URL —
    // não depende só do backend mandar o campo certo.
    const isHls = video.format === 'm3u8' || /\.m3u8(\?|$)/i.test(video.url)

    if (isHls) {
      try {
        if (Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            maxBufferLength: 15,
            maxMaxBufferLength: 30,
            backBufferLength: 0
          })
          hlsInstance.loadSource(video.url)
          hlsInstance.attachMedia(el)
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, onReady)
          hlsInstance.on(Hls.Events.ERROR, (_, data) => {
            console.error('[hls.js] erro', data)
            if (data.fatal) buffering.value = false
          })
          return
        } else {
          console.warn('[reel] Hls.isSupported() === false neste browser')
        }
      } catch (err) {
        console.error('[reel] falha ao importar/instanciar hls.js', err)
      }
    }

    // Fallback: MP4 directo ou qualquer outro formato
    el.src = video.url
    el.addEventListener('loadedmetadata', onReady, { once: true })
  } finally {
    attaching = false
  }
}

// Tenta reproduzir com som; só cai para mudo se o browser recusar o
// autoplay com áudio (é uma política de segurança do próprio browser,
// não algo que se possa contornar por JavaScript). Depois de o
// utilizador ter ativado o som uma vez nesta sessão, o browser costuma
// permitir autoplay com som nos vídeos seguintes.
async function attemptPlay(el) {
  const wantsSound = !isMuted.value

  if (wantsSound || audioUnlocked) {
    el.muted = false
    try {
      await el.play()
      isMuted.value = false
      needsUnmutePrompt.value = false
      return
    } catch (err) {
      // Browser bloqueou autoplay com som — cai para mudo e fica à
      // espera do primeiro gesto do utilizador (ver registerAudioUnlockCallback).
    }
  }

  el.muted = true
  isMuted.value = true
  try {
    await el.play()
    needsUnmutePrompt.value = !audioUnlocked
  } catch (err) {
    console.error('[reel] play() falhou mesmo mutado', err)
  }

  if (!audioUnlocked) {
    registerAudioUnlockCallback(retryWithSound)
  }
}

// Chamado assim que o utilizador faz o primeiro gesto em qualquer ponto
// da página — volta a tentar pôr este slide (se continuar activo) a
// tocar com som, sem precisar de tocar especificamente no ícone de mute.
function retryWithSound() {
  const el = videoEl.value
  if (!el || !props.active || !sourceReady.value) return
  el.muted = false
  el.play()
    .then(() => {
      isMuted.value = false
      needsUnmutePrompt.value = false
    })
    .catch((err) => console.error('[reel] retryWithSound falhou', err))
}

function onReady() {
  sourceReady.value = true
  const el = videoEl.value
  if (!el) return

  if (props.active) {
    attemptPlay(el)
  } else {
    el.pause()
  }
}

function detachSource() {
  attaching = false
  unregisterAudioUnlockCallback(retryWithSound)
  if (hlsInstance) { try { hlsInstance.destroy() } catch (_) { } hlsInstance = null }
  const el = videoEl.value
  if (el) { el.pause(); el.removeAttribute('src'); el.load() }
  sourceReady.value = false
  isPlaying.value = false
  buffering.value = false
  needsUnmutePrompt.value = false
}

const goToProfile = (userId) => {
    router.push({
        path: '/profile/' + userId
    })
}

watch(() => props.active, (isActive) => {
  const el = videoEl.value
  if (!el || !sourceReady.value) return
  if (isActive) {
    attemptPlay(el)
  } else {
    el.pause()
    needsUnmutePrompt.value = false
    unregisterAudioUnlockCallback(retryWithSound)
  }
})

watch(() => props.muted, (v) => {
  isMuted.value = v
  if (videoEl.value) videoEl.value.muted = v
  if (!v) audioUnlocked = true
})

watch(() => props.shouldMount, async (mounted) => {
  if (mounted) { await nextTick(); attachSource() }
  else detachSource()
})

onMounted(async () => {
  if (props.shouldMount) { await nextTick(); attachSource() }
})

onBeforeUnmount(() => {
  clearTimeout(tapTimer)
  clearTimeout(feedbackTimer)
  clearTimeout(heartTimer)
  unregisterAudioUnlockCallback(retryWithSound)
  detachSource()
})
</script>

<style scoped>
.reel-slide {
  position: relative;
  height: 100%;
  width: 100%;
  background: #000;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.reel-video,
.reel-poster {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: contain;
  background: #000;
}

.reel-scrim-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 90px;
  z-index: 18;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35), transparent);
  pointer-events: none;
}

.reel-scrim-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 42%;
  z-index: 18;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.35) 45%, transparent 100%);
  pointer-events: none;
}

.reel-progress-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 22;
}

.reel-progress-fill {
  height: 100%;
  background: #fff;
  transition: width 150ms linear;
}

.reel-icon-btn {
  border: none;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  cursor: pointer;
}

.reel-mute-btn {
  position: absolute;
  top: 16px;
  right: 12px;
  z-index: 26;
  height: 30px;
  width: 30px;
  transition: transform 150ms ease;
}

.reel-mute-btn--pulse {
  animation: mute-pulse 1.4s ease-in-out infinite;
}

@keyframes mute-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}

.reel-unmute-hint {
  position: absolute;
  top: 54px;
  right: 12px;
  z-index: 26;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

.reel-spinner-wrap {
  position: absolute;
  inset: 0;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reel-spinner {
  height: 36px;
  width: 36px;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.reel-footer {
  position: absolute;
  left: 12px;
  right: 78px;
  bottom: 16px;
  z-index: 21;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.reel-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reel-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.reel-avatar {
  height: 40px;
  width: 40px;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #444;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
}

.reel-avatar img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.reel-avatar-follow {
  position: absolute;
  left: 50%;
  bottom: -8px;
  transform: translateX(-50%);
  height: 18px;
  width: 18px;
  border-radius: 999px;
  border: none;
  background: #f91880;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 0 2px #000;
  padding: 0;
}

.reel-author-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.reel-author-name {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 15.5px;
  font-weight: 600;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reel-verified {
  flex-shrink: 0;
}

.reel-caption {
  margin: 0;
  color: #fff;
  font-size: 14px;
  line-height: 1.35;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.7);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reel-sound-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 12.5px;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.reel-actions {
  position: absolute;
  right: 8px;
  bottom: 16px;
  z-index: 21;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.reel-action {
  border: none;
  background: transparent;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  cursor: pointer;
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.55));
}

.reel-action span {
  font-size: 11.5px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.reel-action.is-liked {
  color: #f91880;
}

.reel-action.is-saved {
  color: #ffd400;
}

.like-pop {
  animation: like-pop 0.4s cubic-bezier(0.17, 0.89, 0.32, 1.49);
}

@keyframes like-pop {
  0% {
    transform: scale(1);
  }

  35% {
    transform: scale(1.35);
  }

  100% {
    transform: scale(1);
  }
}

.reel-sound-disc {
  margin-top: 4px;
  height: 34px;
  width: 34px;
  border-radius: 999px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.85);
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.55));
}

.reel-sound-disc img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.reel-sound-disc.is-spinning {
  animation: disc-spin 4s linear infinite;
}

@keyframes disc-spin {
  to {
    transform: rotate(360deg);
  }
}

.reel-tap-feedback {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.reel-tap-feedback svg {
  opacity: 0.9;
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.5));
}

.reel-heart-burst {
  position: absolute;
  inset: 0;
  z-index: 24;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.reel-heart-burst svg {
  filter: drop-shadow(0 2px 14px rgba(0, 0, 0, 0.5));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.heart-enter-active {
  transition: transform 300ms cubic-bezier(0.17, 0.89, 0.32, 1.49), opacity 300ms ease-out;
}

.heart-leave-active {
  transition: transform 300ms ease-in, opacity 300ms ease-in;
}

.heart-enter-from {
  transform: scale(0.3);
  opacity: 0;
}

.heart-leave-to {
  transform: scale(1.15);
  opacity: 0;
}
</style>