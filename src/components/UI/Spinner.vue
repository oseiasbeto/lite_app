<template>
    <div class="grid min-h-[10px]">
        <span class="loader"></span>
    </div>
</template>

<style scoped>
.loader {
  --color-1: #000;        /* padrão = preto */
  --size: 1px;

  width: calc(38 * var(--size));
  height: calc(38 * var(--size));
  border-radius: 50%;
  position: relative;
  animation: rotate 0.8s linear infinite;
}

.loader::before {
  content: '';
  box-sizing: border-box;
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: calc(5 * var(--size)) solid var(--color-1);
  animation: prixClipFix 2s linear infinite;
}

/* Modo escuro – sobrescreve a variável */
.dark .loader {
  --color-1: #fff !important;  /* branco */
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes prixClipFix {
  0%   { clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0); }
  25%  { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0); }
  50%  { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%); }
  75%  { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%); }
  100% { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0); }
}
</style>