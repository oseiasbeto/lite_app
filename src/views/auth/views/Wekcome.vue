<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { login as loginGoogle } from "webtonative/SocialLogin/google";

const store = useStore();
const router = useRouter();

const isGoogleLoading = ref(false);
let loadingTimer = null;

/* -------------------------------------------------------------------------- */
/*  Tema (claro / escuro) + barras nativas do webtonative                      */
/* -------------------------------------------------------------------------- */
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const isDark = ref(darkQuery.matches);
const wtn = window.WTN;

const applyTheme = (dark) => {
  isDark.value = dark;
};

// Aplica já no setup para não piscar o tema errado
applyTheme(isDark.value);

const onThemeChange = (e) => applyTheme(e.matches);

/* -------------------------------------------------------------------------- */
/*  Login com Google                                                           */
/* -------------------------------------------------------------------------- */
const stopLoading = () => {
  clearTimeout(loadingTimer);
  isGoogleLoading.value = false;
};

const signInWithGoogle = () => {
  if (isGoogleLoading.value) return;

  isGoogleLoading.value = true;

  // Segurança: se o usuário fechar a janela do Google sem concluir,
  // o callback pode nunca ser chamado e o botão ficaria travado.
  clearTimeout(loadingTimer);
  loadingTimer = setTimeout(stopLoading, 20000);

  loginGoogle({
    callback: async function (value) {
      try {
        await store.dispatch("loginWithGoogle", value);
        await router.push("/home"); // Redireciona para a página inicial após o login
      } catch (error) {
        // Garante que o spinner some caso o login falhe
        stopLoading();
      }
    },
  });
};

/* -------------------------------------------------------------------------- */
/*  Cordas interativas (física de Verlet em canvas)                            */
/* -------------------------------------------------------------------------- */
const containerRef = ref(null);
const canvasRef = ref(null);

const SEGMENTS = 28; // pontos por corda
const GRAVITY = 0.45;
const DAMPING = 0.993;
const ITERATIONS = 9; // precisão das restrições (mais = cordas mais firmes)
const STEP = 1000 / 60; // passo fixo da simulação (ms)
const GRAB_RADIUS = 56; // raio para "agarrar" uma corda
const PUSH_RADIUS = 84; // raio de influência ao arrastar o dedo
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Paleta das cordas [r, g, b]
const PALETTE = [
  [255, 59, 107], // rosa
  [255, 138, 0], // laranja
  [255, 214, 10], // amarelo
  [46, 230, 166], // verde-água
  [10, 132, 255], // azul
  [123, 92, 255], // violeta
  [255, 95, 210], // magenta
  [0, 200, 255], // ciano
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const rgb = (c, k = 1) =>
  `rgb(${Math.min(255, Math.round(c[0] * k))},${Math.min(255, Math.round(c[1] * k))},${Math.min(
    255,
    Math.round(c[2] * k)
  )})`;

let ctx = null;
let width = 0;
let height = 0;
let dpr = 1;
let ropes = [];
let rafId = 0;
let lastTime = 0;
let acc = 0;
let time = 0;
let resizeObserver = null;

const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false, grab: null };

const makePoint = (x, y, pinned) => ({ x, y, px: x, py: y, pinned });

const buildRope = ({
  x1,
  y1,
  x2,
  y2,
  bend = 0,
  sag = 0,
  pinEnd = false,
  hanging = false,
  lineWidth,
  color,
}) => {
  const points = [];
  const kick = (Math.random() - 0.5) * 2.6; // balanço inicial (entrada animada)

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const x = x1 + (x2 - x1) * t + Math.sin(t * Math.PI) * bend;
    const y = y1 + (y2 - y1) * t + 4 * sag * t * (1 - t);
    const p = makePoint(x, y, i === 0 || (pinEnd && i === SEGMENTS));
    p.px = x - kick * t;
    points.push(p);
  }

  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  return {
    points,
    rest: length / SEGMENTS,
    lineWidth,
    hanging,
    base: rgb(color),
    deep: rgb(color, 0.55),
    phase: Math.random() * Math.PI * 2,
  };
};

const buildRopes = () => {
  ropes = [];
  const zone = Math.min(height * 0.64, 580); // área onde as cordas vivem
  const top = -10;
  const colors = shuffle(PALETTE);
  let c = 0;
  const nextColor = () => colors[c++ % colors.length];

  // Cordas penduradas (uma ponta presa no topo)
  const hangCount = width < 520 ? 9 : 15;
  for (let i = 0; i < hangCount; i++) {
    const slot = width / hangCount;
    const x = (i + 0.5) * slot + (Math.random() - 0.5) * slot * 0.9;
    const length = zone * (0.4 + Math.random() * 0.6);

    ropes.push(
      buildRope({
        x1: x,
        y1: top,
        x2: x + (Math.random() - 0.5) * 36,
        y2: length,
        bend: (Math.random() - 0.5) * 30,
        hanging: true,
        lineWidth: 5 + Math.random() * 6,
        color: nextColor(),
      })
    );
  }

  // Festões (as duas pontas presas no topo, formando uma curva)
  const swagCount = 3;
  for (let i = 0; i < swagCount; i++) {
    const x1 = -width * 0.1 + Math.random() * width * 0.4;
    const x2 = width * 0.6 + Math.random() * width * 0.5;

    ropes.push(
      buildRope({
        x1,
        y1: top,
        x2,
        y2: top,
        sag: zone * (0.3 + Math.random() * 0.55),
        pinEnd: true,
        lineWidth: 6 + Math.random() * 5,
        color: nextColor(),
      })
    );
  }

  // As mais grossas ficam na frente
  ropes.sort((a, b) => a.lineWidth - b.lineWidth);
};

const simulate = () => {
  time += STEP / 1000;
  const wind = reduceMotion ? 0 : 0.03;

  // 1) Integração de Verlet
  for (const rope of ropes) {
    const pts = rope.points;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p.pinned) continue;

      const vx = (p.x - p.px) * DAMPING;
      const vy = (p.y - p.py) * DAMPING;
      p.px = p.x;
      p.py = p.y;

      const sway = Math.sin(time * 1.15 + rope.phase + i * 0.16) * wind * (i / SEGMENTS);
      p.x += vx + sway;
      p.y += vy + GRAVITY;
    }
  }

  // 2) Interação: o dedo (ou mouse) empurra as cordas por onde passa
  if (pointer.active && !pointer.grab) {
    const speed = Math.hypot(pointer.vx, pointer.vy);
    if (speed > 0.2) {
      const r2 = PUSH_RADIUS * PUSH_RADIUS;
      for (const rope of ropes) {
        for (const p of rope.points) {
          if (p.pinned) continue;
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const f = 1 - Math.sqrt(d2) / PUSH_RADIUS;
            p.x += pointer.vx * f * 0.55;
            p.y += pointer.vy * f * 0.55;
          }
        }
      }
    }
  }
  pointer.vx *= 0.5;
  pointer.vy *= 0.5;

  // 3) Corda agarrada acompanha o dedo
  if (pointer.grab) {
    pointer.grab.x += (pointer.x - pointer.grab.x) * 0.6;
    pointer.grab.y += (pointer.y - pointer.grab.y) * 0.6;
    pointer.grab.px = pointer.grab.x;
    pointer.grab.py = pointer.grab.y;
  }

  // 4) Restrições de distância entre pontos
  for (let it = 0; it < ITERATIONS; it++) {
    for (const rope of ropes) {
      const pts = rope.points;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const wa = a.pinned ? 0 : 1;
        const wb = b.pinned ? 0 : 1;
        const wsum = wa + wb;
        if (!wsum) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const diff = (dist - rope.rest) / dist;
        const ox = dx * diff;
        const oy = dy * diff;

        a.x += (ox * wa) / wsum;
        a.y += (oy * wa) / wsum;
        b.x -= (ox * wb) / wsum;
        b.y -= (oy * wb) / wsum;
      }
    }
  }
};

const draw = () => {
  ctx.clearRect(0, 0, width, height);
  ctx.lineJoin = "round";

  const dark = isDark.value;
  const shadow = dark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.18)";

  for (const rope of ropes) {
    const pts = rope.points;
    const lw = rope.lineWidth;

    // Caminho suave passando pelo meio dos segmentos
    const path = new Path2D();
    path.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      path.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    path.lineTo(last.x, last.y);

    // 1) Sombra projetada
    ctx.save();
    ctx.translate(0, lw * 0.35 + 2);
    ctx.lineCap = "round";
    ctx.lineWidth = lw + 1;
    ctx.strokeStyle = shadow;
    ctx.stroke(path);
    ctx.restore();

    // 2) Corpo da corda
    ctx.lineCap = "round";
    ctx.lineWidth = lw;
    ctx.strokeStyle = rope.base;
    ctx.stroke(path);

    // 3) Trançado (listras diagonais que dão aparência de fio)
    ctx.save();
    ctx.lineCap = "butt";
    ctx.setLineDash([lw * 0.45, lw * 0.85]);
    ctx.lineWidth = lw;
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.stroke(path);
    ctx.restore();

    // 4) Brilho
    ctx.save();
    ctx.translate(-lw * 0.16, -lw * 0.2);
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1, lw * 0.26);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.stroke(path);
    ctx.restore();

    // 5) Ponteira arredondada na ponta solta
    if (rope.hanging) {
      const r = lw * 0.85;
      ctx.beginPath();
      ctx.arc(last.x, last.y, r, 0, Math.PI * 2);
      ctx.fillStyle = rope.base;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rope.deep;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(last.x - r * 0.3, last.y - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fill();
    }
  }
};

const loop = (now) => {
  rafId = requestAnimationFrame(loop);
  if (!lastTime) lastTime = now;

  acc += Math.min(now - lastTime, 64);
  lastTime = now;

  while (acc >= STEP) {
    simulate();
    acc -= STEP;
  }
  draw();
};

const startLoop = () => {
  if (rafId) return;
  lastTime = 0;
  rafId = requestAnimationFrame(loop);
};

const stopLoop = () => {
  cancelAnimationFrame(rafId);
  rafId = 0;
};

const onVisibilityChange = () => {
  if (document.hidden) stopLoop();
  else startLoop();
};

const resize = () => {
  const el = containerRef.value;
  const canvas = canvasRef.value;
  if (!el || !canvas || !ctx) return;

  const w = el.clientWidth;
  const h = el.clientHeight;

  // Só recria as cordas se a tela mudou de verdade (evita reset com a barra do navegador)
  const rebuild = !ropes.length || Math.abs(w - width) > 1 || Math.abs(h - height) > 120;

  width = w;
  height = h;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (rebuild) buildRopes();
};

/* ---- Eventos de toque / mouse ---- */
const toLocal = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
};

const releaseGrab = () => {
  const g = pointer.grab;
  if (!g) return;
  g.pinned = false;
  // Mantém o impulso do gesto para a corda "voar" ao soltar
  g.px = g.x - pointer.vx;
  g.py = g.y - pointer.vy;
  pointer.grab = null;
};

const onPointerDown = (e) => {
  const { x, y } = toLocal(e);
  pointer.x = x;
  pointer.y = y;
  pointer.vx = 0;
  pointer.vy = 0;
  pointer.active = true;
  canvasRef.value.setPointerCapture?.(e.pointerId);

  let best = null;
  let bestD = GRAB_RADIUS * GRAB_RADIUS;
  for (const rope of ropes) {
    for (const p of rope.points) {
      if (p.pinned) continue;
      const d2 = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d2 < bestD) {
        bestD = d2;
        best = p;
      }
    }
  }

  if (best) {
    best.pinned = true;
    pointer.grab = best;
  }
};

const onPointerMove = (e) => {
  const { x, y } = toLocal(e);

  if (pointer.active) {
    pointer.vx = Math.max(-40, Math.min(40, pointer.vx + (x - pointer.x)));
    pointer.vy = Math.max(-40, Math.min(40, pointer.vy + (y - pointer.y)));
  } else {
    pointer.vx = 0;
    pointer.vy = 0;
  }

  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
};

const onPointerUp = (e) => {
  releaseGrab();
  if (e.pointerType !== "mouse") pointer.active = false;
};

const onPointerLeave = () => {
  releaseGrab();
  pointer.active = false;
};

onMounted(() => {
  ctx = canvasRef.value.getContext("2d");
  resize();

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(containerRef.value);

  darkQuery.addEventListener?.("change", onThemeChange);
  document.addEventListener("visibilitychange", onVisibilityChange);

  startLoop();
});

onBeforeUnmount(() => {
  stopLoop();
  clearTimeout(loadingTimer);
  resizeObserver?.disconnect();
  darkQuery.removeEventListener?.("change", onThemeChange);
  document.removeEventListener("visibilitychange", onVisibilityChange);
});
</script>

<template>
  <div ref="containerRef"
    class="relative min-h-[100dvh] select-none overflow-hidden bg-white text-black dark:bg-black dark:text-white">
    <!-- Cordas -->
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full touch-none" aria-hidden="true"
      @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp"
      @pointerleave="onPointerLeave" />

    <!-- Degradê: as cordas desaparecem suavemente atrás do texto -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-white from-35% via-white/90 to-transparent dark:from-black dark:via-black/90" />

    <!-- Conteúdo (deixa o toque passar para as cordas, exceto no botão) -->
    <div
      class="pointer-events-none relative z-10 flex min-h-[100dvh] flex-col justify-end px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div class="hero-in mb-9">
        <svg class="mb-5 ml-[-10px]" xmlns="http://www.w3.org/2000/svg" version="1.0" width="64px"
          viewBox="0 0 1024.000000 1024.000000" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
            <path
              d="M2516 7511 c-3 -5 -21 -12 -40 -15 -71 -13 -154 -87 -537 -472 -421 -424 -425 -429 -450 -567 -24 -130 20 -263 122 -365 51 -51 78 -69 173 -113 18 -9 66 -14 130 -14 89 0 108 3 160 28 32 15 69 27 82 27 l24 0 0 -948 c0 -724 3 -951 12 -960 17 -17 829 -17 846 0 9 9 12 359 12 1515 0 1615 2 1551 -50 1654 -49 96 -199 219 -266 219 -13 0 -26 5 -29 10 -8 12 -182 13 -189 1z" />
            <path
              d="M3895 7511 c-6 -5 -36 -17 -69 -26 -105 -33 -220 -168 -255 -300 -15 -56 -15 -4074 0 -4130 21 -80 63 -150 130 -216 54 -53 78 -69 125 -84 33 -9 63 -21 68 -26 13 -12 182 -11 204 0 9 6 47 24 84 41 64 29 115 78 910 871 464 463 850 845 859 850 17 9 60 -33 1289 -1254 449 -446 478 -472 580 -503 52 -16 206 -19 215 -4 3 6 13 10 22 10 33 0 128 56 178 105 106 103 158 271 124 400 -31 120 -15 102 -916 1005 -469 470 -853 862 -853 870 0 8 384 400 853 870 901 903 885 885 916 1005 34 129 -18 297 -124 400 -50 49 -145 105 -178 105 -9 0 -19 5 -22 10 -9 15 -163 12 -215 -4 -52 -16 -113 -48 -155 -83 -16 -14 -743 -734 -1614 -1602 -871 -867 -1592 -1577 -1602 -1579 -18 -3 -19 36 -22 1455 -2 963 -6 1472 -13 1498 -6 22 -19 55 -30 74 -10 18 -24 43 -31 55 -28 49 -108 117 -171 146 -37 17 -75 35 -84 41 -22 11 -191 12 -203 0z" />
            <path
              d="M2550 3603 c-65 -7 -167 -52 -218 -97 -56 -49 -120 -143 -136 -199 -29 -106 -38 -157 -28 -170 5 -6 12 -34 15 -60 20 -151 163 -296 338 -342 62 -17 155 -20 164 -5 3 6 17 10 31 10 74 0 239 125 281 213 11 23 28 57 37 76 12 25 16 63 16 138 0 106 -9 138 -75 253 -41 73 -186 163 -291 180 -59 10 -68 10 -134 3z" />
          </g>
        </svg>

        <h1 class="mb-3 text-[40px] font-extrabold leading-[1.05] tracking-tight">
          Acontecendo<br />agora
        </h1>
        <p class="max-w-[30ch] text-[17px] leading-snug text-neutral-600 dark:text-neutral-400">
          Fala com os teus amigos, partilha momentos e fica perto de quem importa.
        </p>
      </div>

      <!-- Único botão: Google -->
      <button type="button"
        class="cta-in pointer-events-auto flex h-14 w-full items-center justify-center gap-3 rounded-full bg-black text-[17px] font-semibold text-white shadow-lg shadow-black/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:shadow-white/10"
        :disabled="isGoogleLoading" :aria-busy="isGoogleLoading" @click="signInWithGoogle">
        <svg v-if="isGoogleLoading" class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span v-else class="flex h-7 w-7 items-center justify-center rounded-full bg-white">
          <svg width="17" height="17" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
        </span>
        <span>{{ isGoogleLoading ? "Entrando..." : "Continuar com o Google" }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Uma única entrada orquestrada: texto e botão sobem juntos, o botão logo depois */
.hero-in {
  animation: rise 0.8s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.cta-in {
  animation: rise 0.8s 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {

  .hero-in,
  .cta-in {
    animation: none;
  }
}
</style>