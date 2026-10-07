<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  autoStart: { type: Boolean, default: true }, // começa assim que monta
  minVisibleMs: { type: Number, default: 700 }, // tempo mínimo na tela (evita "piscar" quando a resposta é instantânea)
  onFinish: { type: Function, default: null }, // chamado quando a animação de saída termina
  theme: { type: String, default: "system" }, // 'light' | 'dark' | 'system'
  nativeBars: { type: Boolean, default: true }, // ajusta status bar / navigation bar do app nativo
  logoSrc: { type: String, default: "" }, // (opcional) logo do app, de preferência PNG/SVG com fundo transparente
});

const emit = defineEmits(["finish"]);

const EXIT_MS = 320; // duração da animação de saída (mantenha igual ao CSS)

const phase = ref("loading"); // 'loading' | 'leaving'

/* -------------------------------------------------------------------------- */
/*  Tema (claro / escuro) + barras nativas do webtonative                      */
/* -------------------------------------------------------------------------- */
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

const resolveDark = () =>
  props.theme === "dark" || (props.theme === "system" && darkQuery.matches);

const applyTheme = () => {
  const dark = resolveDark();
  const wtn = window.WTN;

  if (props.nativeBars) {
    // As barras nativas acompanham a cor do fundo da splash
    wtn?.statusBar?.({
      style: dark ? "light" : "dark",
      color: dark ? "000000" : "FFFFFF",
      overlay: false, // Somente Android
    });
    wtn?.setNavigationBarColor?.({ color: dark ? "#000000" : "#FFFFFF" });
  }

  document.documentElement.classList.toggle("dark", dark);
};

// Aplica já no setup para não piscar o tema errado
applyTheme();

// Se o tema (prop) mudar com a splash na tela, recolore na hora
watch(() => props.theme, applyTheme);

// Só acompanha o sistema quando o tema é 'system'
const onThemeChange = () => {
  if (props.theme === "system") applyTheme();
};

/* -------------------------------------------------------------------------- */
/*  Controle                                                                   */
/* -------------------------------------------------------------------------- */
let sequenceTimer = null;
let startedAt = 0;
let finishRequested = false;

const clearTimers = () => {
  clearTimeout(sequenceTimer);
  sequenceTimer = null;
};

function start() {
  clearTimers();
  finishRequested = false;
  phase.value = "loading";
  startedAt = Date.now();
}

function stop() {
  clearTimers();
}

// Chame quando a requisição (ex.: refresh token) responder
function finish() {
  if (finishRequested) return;
  finishRequested = true;

  const wait = Math.max(0, props.minVisibleMs - (Date.now() - startedAt));
  sequenceTimer = setTimeout(leave, wait);
}

// Animação de saída e só então avisa que terminou
function leave() {
  phase.value = "leaving";
  sequenceTimer = setTimeout(() => {
    props.onFinish?.();
    emit("finish");
  }, EXIT_MS);
}

onMounted(() => {
  darkQuery.addEventListener?.("change", onThemeChange);
  if (props.autoStart) start();
});

onUnmounted(() => {
  stop();
  darkQuery.removeEventListener?.("change", onThemeChange);
});

defineExpose({ start, stop, finish });
</script>

<template>
  <div
    class="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-white dark:bg-black"
    role="status"
    aria-live="polite"
  >
    <span class="sr-only">Carregando…</span>

    <div
      class="splash-content flex flex-col items-center"
      :class="{ 'is-leaving': phase === 'leaving' }"
    >
      <!-- Logo com efeito glitch ciano/vermelho (só aparece se logoSrc for passado) -->
      <div v-if="logoSrc" class="logo mb-10" aria-hidden="true">
        <span
          class="logo-layer logo-cyan"
          :style="{ '--logo': `url(${logoSrc})` }"
        ></span>
        <span
          class="logo-layer logo-red"
          :style="{ '--logo': `url(${logoSrc})` }"
        ></span>
        <img :src="logoSrc" alt="" class="logo-main" draggable="false" />
      </div>

      <!-- Loader: duas bolinhas que se cruzam -->
      <div class="loader" aria-hidden="true">
        <span class="dot dot-cyan mix-blend-multiply dark:mix-blend-screen"></span>
        <span class="dot dot-red mix-blend-multiply dark:mix-blend-screen"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Saída: o conteúdo cresce levemente e some */
.splash-content {
  transition: opacity 0.32s ease, transform 0.32s ease;
}
.splash-content.is-leaving {
  opacity: 0;
  transform: scale(1.06);
}

/* ------------------------------ Loader ------------------------------ */
.loader {
  position: relative;
  width: 44px;
  height: 14px;
}

.dot {
  position: absolute;
  top: 0;
  left: 50%;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 9999px;
  animation: cross 0.6s ease-in-out infinite alternate;
}

.dot-cyan {
  background: #25f4ee;
}

.dot-red {
  background: #fe2c55;
  animation-direction: alternate-reverse;
}

@keyframes cross {
  0% {
    transform: translateX(-15px) scale(1);
  }
  50% {
    transform: translateX(0) scale(0.7);
  }
  100% {
    transform: translateX(15px) scale(1);
  }
}

/* ------------------------------- Logo ------------------------------- */
.logo {
  position: relative;
  width: 96px;
  height: 96px;
}

.logo-main,
.logo-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.logo-main {
  object-fit: contain;
  user-select: none;
}

/* Camadas coloridas usam o próprio logo como máscara */
.logo-layer {
  -webkit-mask: var(--logo) center / contain no-repeat;
  mask: var(--logo) center / contain no-repeat;
}

.logo-cyan {
  background: #25f4ee;
  transform: translate(-2px, -2px);
  animation: glitch-cyan 1.8s steps(1) infinite;
}

.logo-red {
  background: #fe2c55;
  transform: translate(2px, 2px);
  animation: glitch-red 1.8s steps(1) infinite;
}

/* Fica parado a maior parte do tempo e "treme" rapidamente */
@keyframes glitch-cyan {
  0%, 70%, 100% { transform: translate(-2px, -2px); }
  74% { transform: translate(-5px, 1px); }
  78% { transform: translate(-1px, -4px); }
  82% { transform: translate(-3px, 0); }
}

@keyframes glitch-red {
  0%, 70%, 100% { transform: translate(2px, 2px); }
  74% { transform: translate(5px, -1px); }
  78% { transform: translate(1px, 4px); }
  82% { transform: translate(3px, 0); }
}

/* ------------------------- Acessibilidade ------------------------- */
@media (prefers-reduced-motion: reduce) {
  .dot {
    animation-duration: 1.6s;
  }
  .logo-cyan,
  .logo-red {
    animation: none;
  }
  .splash-content {
    transition: opacity 0.2s ease;
  }
  .splash-content.is-leaving {
    transform: none;
  }
}
</style>