<template>
  <div :class="[
    'fixed inset-0 z-[9999]',
    isOpen ? 'block bg-opacity-50' : 'hidden bg-opacity-0',
    overlayClass,
  ]" @click.self="close">
    <div ref="DrawerRef" :class="[
      'absolute bottom-0 left-0 right-0 dark:bg-[#181818]',
      costumClass,
      isOpen ? 'animate-slide-up' : 'animate-slide-down',
    ]">
      <div v-show="title" class="flex px-[16px] justify-center border-b dark:border-[#393839] shadow-[0_1px_1px_rgba(0,0,0,.15)] w-full h-12">
        <div class="h-full w-full flex items-center">
          <button @click="close" class="shrink-0 text-[#f52936]">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" fill="none"
                fill-rule="evenodd" stroke-linecap="round"></path>
            </svg>
          </button>
          <span class="flex-1 font-semibold text-center"> {{ title }} </span>
        </div>
      </div>
      <div class="relative">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  overlayClass: {
    type: String,
    default: "dark:bg-[rgba(36,36,36,.9)] transition-bg-opacity duration-300"
  },
  title: {
    type: String,
    default: null
  },
  costumClass: String,
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style>
.animate-slide-up {
  animation: slide-up 0.3s ease-in-out;
}

.animate-slide-down {
  animation: slide-down 0.3s ease-in-out;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(100%);
  }
}
</style>