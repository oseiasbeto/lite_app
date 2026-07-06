<template>
  <div class="gap-2 flex bg-white dark:bg-transparent pt-1.5 pb-0.5 flex-col px-4 border-b dark:border-[rgb(57,56,57)]">
    <div class="flex flex-row gap-2">
      <!-- Avatar skeleton -->
      <div class="shrink-0">
        <div class="skeleton-shimmer rounded-full w-10 h-10"></div>
      </div>

      <div class="flex-1">
        <!-- Author + time skeleton -->
        <div class="flex items-center gap-2 mb-1">
          <div class="skeleton-shimmer h-4 w-24 rounded-md"></div>
        </div>

        <!-- Content skeleton -->
        <div class="space-y-1 mt-1">
          <div class="skeleton-shimmer h-4 w-full rounded-md"></div>
          <div class="skeleton-shimmer h-4 w-5/6 rounded-md"></div>
        </div>

        <!-- Reactions footer skeleton -->
        <div class="flex items-center gap-4 mt-2 mb-1">
          <div class="skeleton-shimmer h-5 w-12 rounded-md"></div>
          <div class="skeleton-shimmer h-5 w-12 rounded-md"></div>
          <div class="skeleton-shimmer h-5 w-12 rounded-md"></div>
        </div>
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
</style>