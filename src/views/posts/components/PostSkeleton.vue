<template>
  <div class="flex flex-row mb-1.5 border-b border-x-light-border dark:border-x-dark-border">
    <!-- COLUNA DO AVATAR -->
    <div class="p-[10px] shrink-0">
      <div class="w-10 h-10 rounded-full bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive animate-pulse"></div>
    </div>

    <!-- COLUNA DO CONTEÚDO -->
    <div class="flex-1 flex flex-col pr-4">
      <!-- DETALHES DO AUTOR (com os paddings novos) -->
      <div class="pt-[10px] pb-[8px] space-y-2">
        <div class="h-3 w-32 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse"></div>
        <div class="h-2 w-20 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse"></div>
      </div>

      <!-- TEXTO DO CONTEÚDO -->
      <div class="space-y-2 pb-[8px]">
        <div class="h-3 w-full bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse"></div>
        <div class="h-3 w-5/6 bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive rounded animate-pulse"></div>
       
      </div>
    </div>
  </div>
</template>

<script setup>
// Skeleton loader simples ajustado à nova estrutura do PostCard
</script>