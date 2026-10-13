<template>
    <div class="grid min-h-[10px]" role="status" aria-label="A carregar">
        <span class="loader">
            <i class="dot dot-a"></i>
            <i class="dot dot-b"></i>
        </span>
    </div>
</template>

<style scoped>
/* Loader estilo TikTok: duas bolinhas (ciano e vermelha) que giram em torno
   uma da outra, trocando de lugar; onde se cruzam, as cores se misturam. */
.loader {
  --color-1: #25F4EE; /* ciano TikTok */
  --color-2: #FE2C55; /* vermelho TikTok */
  --size: 1px;
  --travel: calc(14 * var(--size));
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: calc(32 * var(--size));
  height: calc(14 * var(--size));
  isolation: isolate; /* a mistura de cores acontece só entre as bolinhas */
}

.dot {
  position: absolute;
  top: 50%;
  left: calc(2 * var(--size));
  width: calc(12 * var(--size));
  height: calc(12 * var(--size));
  margin-top: calc(-6 * var(--size));
  border-radius: 50%;
  mix-blend-mode: multiply;
  animation: swap 1s ease-in-out infinite;
}

.dot-a { background: var(--color-1); }

/* A vermelha faz o mesmo percurso, meio ciclo depois (sentido oposto) */
.dot-b {
  background: var(--color-2);
  animation-delay: -0.5s;
}

/* Vai e volta na horizontal: na ida cresce (passa à frente), na volta encolhe (passa atrás) */
@keyframes swap {
  0%   { transform: translateX(0) scale(1); }
  25%  { transform: translateX(calc(var(--travel) / 2)) scale(1.25); }
  50%  { transform: translateX(var(--travel)) scale(1); }
  75%  { transform: translateX(calc(var(--travel) / 2)) scale(0.7); }
  100% { transform: translateX(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .dot { animation-duration: 2.4s; }
}
</style>