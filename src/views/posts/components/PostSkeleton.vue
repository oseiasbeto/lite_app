<template>
  <div class="flex w-full flex-row mb-1.5">
    <!-- COLUNA DO AVATAR -->
    <div class="p-[10px] shrink-0">
      <div class="w-10 h-10 rounded-full skeleton-shimmer"></div>
    </div>

    <!-- COLUNA DO CONTEÚDO -->
    <div class="flex-1 flex flex-col pr-4">
      <div class="pt-[10px] pb-[8px] space-y-2">
        <div class="h-3 w-32 rounded skeleton-shimmer"></div>
        <div class="h-2 w-20 rounded skeleton-shimmer"></div>
      </div>

      <div class="space-y-2 pb-[8px]">
        <div class="h-3 w-full rounded skeleton-shimmer"></div>
        <div class="h-3 w-5/6 rounded skeleton-shimmer"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Skeleton loader simples ajustado à nova estrutura do PostCard
</script>

<style scoped>
.skeleton-shimmer {
  position: relative !important;
  overflow: hidden !important;
  background-color: rgb(239, 243, 244) !important;
  animation: none !important; /* garante que nenhum pulse residual sobreviva */
}

.dark .skeleton-shimmer {
  background-color: rgb(51, 54, 57) !important;
}

.skeleton-shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
  transform: translateX(-100%);
}

.dark .skeleton-shimmer::after {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>