<template>
  <div class="w-screen bg-white dark:bg-[#181818] h-screen flex justify-center items-center">
    <!-- Spinner com entrada e saída -->
    <div class="scale-[1.4]">
      <Spinner />
    </div>

    <!-- Loader com entrada e saída -->
  </div>
</template>

<script setup>
import Spinner from './Spinner.vue';
</script>