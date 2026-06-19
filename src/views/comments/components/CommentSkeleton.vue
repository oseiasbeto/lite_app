<template>
  <div class="gap-2 flex bg-white dark:bg-transparent pt-1.5 pb-0.5 flex-col px-[10px] border-b dark:border-[rgb(57,56,57)]">
    <div class="flex flex-row gap-2">
      <!-- Avatar skeleton -->
      <div class="shrink-0">
        <div class="bg-[rgb(230,231,232)] dark:bg-[#3c3c3c] rounded-full w-10 h-10 animate-pulse"></div>
      </div>

      <div class="flex-1">
        <!-- Author + time skeleton -->
        <div class="flex items-center gap-2 mb-1">
          <div class="bg-[rgb(230,231,232)] dark:bg-[#3c3c3c] h-4 w-24 rounded-md animate-pulse"></div>
         
        </div>

        <!-- Content skeleton -->
        <div class="space-y-1 mt-1">
          <div class="bg-[rgb(230,231,232)] dark:bg-[#3c3c3c] h-4 w-full rounded-md animate-pulse"></div>
          <div class="bg-[rgb(230,231,232)] dark:bg-[#3c3c3c] h-4 w-5/6 rounded-md animate-pulse"></div>
        </div>

        <!-- Reactions footer skeleton -->
        <div class="flex items-center gap-4 mt-2 mb-1">
          <div class="bg-[rgb(230,231,232)] dark:bg-[#3c3c3c] h-5 w-12 rounded-md animate-pulse"></div>
          <div class="bg-[rgb(230,231,232)] dark:bg-[#3c3c3c] h-5 w-12 rounded-md animate-pulse"></div>
          <div class="bg-[rgb(230,231,232)] dark:bg-[#3c3c3c] h-5 w-12 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Skeleton component for CommentCard – no logic needed
</script>