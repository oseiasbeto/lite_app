<template>
    <div class="h-[calc(100vh-56px)] overflow-y-scroll">
        <!-- Seção de cabeçalho do perfil (ProfileDetailsUser + ProfileReactions) -->
        <div class="border-b-[6px] dark:bg-[#262626] dark:border-[rgb(24,24,24)] bg-white border-[rgb(230,231,232)]">
            <!-- ProfileDetailsUser skeleton -->
            <div class="px-[10px] py-4 pb-2">
                <div class="flex mb-2 items-start gap-1">
                    <!-- Avatar -->
                    <div class="shrink-0 mr-[16px]">
                        <div class="w-20 h-20 rounded-full bg-gray-200 dark:bg-[#3c3c3c] animate-pulse"></div>
                    </div>
                    <!-- Nome e estatísticas -->
                    <div class="flex flex-col flex-1">
                        <div class="h-7 w-48 bg-gray-200 dark:bg-[#3c3c3c] rounded animate-pulse mb-1"></div>
                        <div class="flex mt-4 items-center gap-2">
                            <div class="h-4 w-20 bg-gray-200 dark:bg-[#3c3c3c] rounded animate-pulse"></div>
                            <div class="w-1 h-1 bg-gray-300 dark:bg-[#3c3c3c] rounded-full"></div>
                            <div class="h-4 w-20 bg-gray-200 dark:bg-[#3c3c3c] rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <!-- Bio skeleton -->
                <div class="py-2 space-y-1.5">
                    <div class="h-4 w-full bg-gray-200 dark:bg-[#3c3c3c] rounded animate-pulse"></div>
                    <div class="h-4 w-5/6 bg-gray-200 dark:bg-[#3c3c3c] rounded animate-pulse"></div>
                </div>
            </div>

            <!-- ProfileReactions skeleton (botões) -->
            <div class="px-[10px] pb-3">
                <div class="flex flex-wrap gap-2">
                    <div class="h-9 w-20 bg-gray-200 dark:bg-[#3c3c3c] rounded-full animate-pulse"></div>
                    <div class="h-9 w-20 bg-gray-200 dark:bg-[#3c3c3c] rounded-full animate-pulse"></div>
                    <div class="h-9 w-20 bg-gray-200 dark:bg-[#3c3c3c] rounded-full animate-pulse"></div>
                    <div class="h-9 w-9 bg-gray-200 dark:bg-[#3c3c3c] rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Skeleton component for ProfileView
// Use this while loadingFetchProfile is true
</script>