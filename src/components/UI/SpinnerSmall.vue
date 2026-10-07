<template>
    <div class="grid min-h-[10px]" role="status" aria-label="A carregar">
        <span class="loader">
            <i class="dot dot-a"></i>
            <i class="dot dot-b"></i>
        </span>
    </div>
</template>

<style scoped>
.loader {
  --color-1: currentColor;
  --size: 1px;
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: calc(24 * var(--size));
  height: calc(24 * var(--size));
  animation: orbit 1.1s linear infinite;
}

.dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(8 * var(--size));
  height: calc(8 * var(--size));
  margin: calc(-4 * var(--size)) 0 0 calc(-4 * var(--size));
  border-radius: 50%;
  background: var(--color-1);
}

/* Um ponto em cima, outro em baixo; pulsam alternadamente */
.dot-a {
  animation: pulse-a 1.1s ease-in-out infinite;
}

.dot-b {
  opacity: 0.55;
  animation: pulse-b 1.1s ease-in-out infinite;
}

@keyframes orbit {
  to { transform: rotate(360deg); }
}

@keyframes pulse-a {
  0%, 100% { transform: translateY(calc(-7 * var(--size))) scale(1); }
  50%      { transform: translateY(calc(-7 * var(--size))) scale(0.55); }
}

@keyframes pulse-b {
  0%, 100% { transform: translateY(calc(7 * var(--size))) scale(0.55); }
  50%      { transform: translateY(calc(7 * var(--size))) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .loader { animation-duration: 2.4s; }
  .dot-a, .dot-b { animation: none; }
}
</style>