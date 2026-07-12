<!-- components/User/UserSkeleton.vue -->
<template>
    <div class="flex items-center px-4 h-16 box-border">
        <!-- Avatar Skeleton -->
        <div class="flex-shrink-0">
            <div class="rounded-full bg-[rgb(230,231,232)] dark:bg-[#404143] animate-pulse relative overflow-hidden"
                :style="{ width: avatarSize, height: avatarSize }">
                <div v-if="shimmer" class="skeleton-shimmer absolute inset-0"></div>
            </div>
        </div>

        <!-- Conteúdo Skeleton -->
        <div class="flex-1 ml-2 min-w-0 space-y-2">
            <div class="flex items-center w-full gap-[4px]">
                <div class="h-3.5 bg-[rgb(230,231,232)] dark:bg-[#404143] rounded relative overflow-hidden animate-pulse"
                    :style="{ width: nameWidth }">
                    <div v-if="shimmer" class="skeleton-shimmer absolute inset-0"></div>
                </div>
                <div v-if="showVerified" class="w-[14px] h-[14px] bg-[rgb(230,231,232)] dark:bg-[#404143] rounded-full animate-pulse shrink-0"></div>
            </div>

            <div class="h-2.5 bg-[rgb(230,231,232)] dark:bg-[#404143] rounded relative overflow-hidden animate-pulse"
                :style="{ width: usernameWidth }">
                <div v-if="shimmer" class="skeleton-shimmer absolute inset-0"></div>
            </div>
        </div>

        <!-- Botão de seguir Skeleton -->
        <div v-if="showFollowButton" class="shrink-0 h-7 rounded-full bg-[rgb(230,231,232)] dark:bg-[#404143] animate-pulse relative overflow-hidden"
            :style="{ width: followButtonWidth }">
            <div v-if="shimmer" class="skeleton-shimmer absolute inset-0"></div>
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
        default: '40px' // igual ao tamanho real do Avatar "xl" usado no UserListItem
    },
    nameWidth: {
        type: String,
        default: '130px'
    },
    usernameWidth: {
        type: String,
        default: '80px' // linha do @username, mais curta que o nome
    },
    showVerified: {
        type: Boolean,
        default: false
    },
    showFollowButton: {
        type: Boolean,
        default: false // ligado só quando a lista real também mostra o botão
    },
    followButtonWidth: {
        type: String,
        default: '92px' // mesmo min-width do botão real em UserListItem
    }
});
</script>
<style scoped>
.skeleton-shimmer {
  position: relative !important;
  overflow: hidden !important;
  background-color: rgb(239, 243, 244) !important;
  animation: pulse-fade 2s ease-in-out infinite !important;
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
    100deg,
    transparent 20%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 80%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.dark .skeleton-shimmer::after {
  background: linear-gradient(
    100deg,
    transparent 20%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 80%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: 150% 0;
  }
  100% {
    background-position: -50% 0;
  }
}

@keyframes pulse-fade {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}
</style>