<template>
  <div class="flex border-b dark:dark:bg-[rgba(36,37,38,1.0)]  dark:border-[rgb(57,56,57)] items-center px-2 py-2 transition-all duration-200">
    <!-- Avatar Skeleton -->
    <div class="relative flex-shrink-0">
      <div 
        class="rounded-full bg-[rgb(230,231,232)] animate-pulse animate-pulse dark:bg-[#404143] relative overflow-hidden"
        :style="{ width: avatarSize, height: avatarSize }"
      >
        <div v-if="shimmer" class="bg-[rgb(230,231,232)] animate-pulse dark:bg-[#404143] absolute inset-0"></div>
      </div>
    </div>

    <!-- Conteúdo Skeleton -->
    <div class="flex-1 ml-2 leading-4 min-w-0 space-y-2">
      <div class="flex items-center w-full gap-[1px]">
        <div 
          class="h-3.5 bg-[rgb(230,231,232)] animate-pulse dark:bg-[#404143] rounded relative overflow-hidden"
          :style="{ width: nameWidth }"
        >
          <div v-if="shimmer" class="bg-[rgb(230,231,232)] dark:bg-[#404143] animate-pulse absolute inset-0"></div>
        </div>
        <div v-if="showVerified" class="w-[14px] h-[14px] bg-[rgb(230,231,232)] animate-pulse dark:bg-[#404143] rounded-full ml-[4px] mt-0.5 relative overflow-hidden">
         
        </div>
      </div>
      
      <div class="w-full">
        <div 
          class="h-2.5 bg-[rgb(230,231,232)] animate-pulse dark:bg-[#404143] rounded relative overflow-hidden"
          :style="{ width: bioWidth }"
        >
          <div v-if="shimmer" class="bg-[rgb(230,231,232)] dark:bg-[#404143] animate-pulse absolute inset-0"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  shimmer: {
    type: Boolean,
    default: true
  },
  avatarSize: {
    type: String,
    default: '32px'
  },
  nameWidth: {
    type: String,
    default: '130px'
  },
  bioWidth: {
    type: String,
    default: '90%'
  },
  showVerified: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>