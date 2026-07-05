<template>
    <div class="grid min-h-[10px]">
        <span class="loader"></span>
    </div>
</template>


<style scoped>
.loader {
  --color-1: #000;
  --size: 1px;
  width: calc(28 * var(--size));
  height: calc(28 * var(--size));
  border: calc(3 * var(--size)) solid var(--color-1);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.dark .loader {
  --color-1: #fff !important;  /* branco */
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>