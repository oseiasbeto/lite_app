<template>
    <div class="h-[calc(100vh-56px)] overflow-y-scroll">
        <!-- Seção de cabeçalho do perfil (ProfileDetailsUser + ProfileReactions) -->
        <div class="relative">
            <!-- ProfileDetailsUser skeleton -->
            <div class="px-[10px] py-4 pb-2">
                <div class="flex mb-2 items-start gap-1">
                    <!-- Avatar -->
                    <div class="shrink-0 mr-[16px]">
                        <div class="w-20 h-20 rounded-full bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive animate-pulse"></div>
                    </div>
                    <!-- Nome e estatísticas -->
                    <div class="flex flex-col flex-1">
                        <div class="h-7 w-48 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse mb-1"></div>
                        <div class="flex mt-4 items-center gap-2">
                            <div class="h-4 w-20 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse"></div>
                            <div class="w-1 h-1 bg-gray-300 dark:bg-x-dark-surfaceActive rounded-full"></div>
                            <div class="h-4 w-20 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <!-- Bio skeleton -->
                <div class="py-2 space-y-1.5">
                    <div class="h-4 w-full bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse"></div>
                    <div class="h-4 w-5/6 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse"></div>
                </div>
            </div>

            <!-- ProfileReactions skeleton (botões) -->
            <div class="px-[10px] pb-3">
                <div class="flex flex-wrap gap-2">
                    <div class="h-9 w-20 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded-full animate-pulse"></div>
                    <div class="h-9 w-20 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded-full animate-pulse"></div>
                    <div class="h-9 w-20 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded-full animate-pulse"></div>
                    <div class="h-9 w-9 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Skeleton component for ProfileView
// Use this while loadingFetchProfile is true
</script>