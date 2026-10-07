<template>
  <div class="flex flex-col px-4 pt-4 bg-transparent">
    <div class="relative flex flex-row gap-3">
      <!-- Avatar skeleton -->
      <div class="shrink-0">
        <div class="skeleton-shimmer rounded-full w-10 h-10"></div>
      </div>

      <div class="flex-1 min-w-0 pr-12">
        <!-- Nome -->
        <div class="skeleton-shimmer h-3 w-20 rounded-full mb-2"></div>

        <!-- Conteudo -->
        <div class="space-y-1.5">
          <div class="skeleton-shimmer h-3.5 w-full rounded-full"></div>
          <div class="skeleton-shimmer h-3.5 w-4/6 rounded-full"></div>
        </div>

        <!-- Rodape: data + Responder -->
        <div class="flex items-center gap-4 mt-3">
          <div class="skeleton-shimmer h-3 w-10 rounded-full"></div>
          <div class="skeleton-shimmer h-3 w-14 rounded-full"></div>
        </div>
      </div>

      <!-- Coluna do coracao -->
      <div class="absolute right-0 top-0 w-10 flex flex-col items-center gap-1.5 pt-0.5">
        <div class="skeleton-shimmer h-5 w-5 rounded-full"></div>
        <div class="skeleton-shimmer h-2.5 w-4 rounded-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Skeleton component for CommentCard – no logic needed
</script>

<style scoped>
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background-color: rgb(239, 243, 244); /* x-light-surfaceActive fallback */
}

.dark .skeleton-shimmer {
  background-color: rgb(51, 54, 57); /* x-dark-surfaceActive fallback */
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

@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer::after {
    animation: none;
  }
}
</style>