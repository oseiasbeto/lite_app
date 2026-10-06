<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  autoStart: { type: Boolean, default: true }, // começa assim que monta
  minVisibleMs: { type: Number, default: 700 }, // tempo mínimo na tela (evita "piscar" quando a resposta é instantânea)
  onFinish: { type: Function, default: null }, // chamado quando a animação de saída termina
  theme: { type: String, default: "system" }, // 'light' | 'dark' | 'system'
  nativeBars: { type: Boolean, default: true }, // ajusta status bar / navigation bar do app nativo
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

    <div class="splash-content" :class="{ 'is-leaving': phase === 'leaving' }">
      <span
        class="spinner block h-10 w-10 rounded-full border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white"
        aria-hidden="true"
      ></span>
    </div>
  </div>
</template>

<style scoped>
/* Saída: o spinner cresce levemente e some */
.splash-content {
  transition: opacity 0.32s ease, transform 0.32s ease;
}
.splash-content.is-leaving {
  opacity: 0;
  transform: scale(1.06);
}

.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 2s;
  }
  .splash-content {
    transition: opacity 0.2s ease;
  }
  .splash-content.is-leaving {
    transform: none;
  }
}
</style>