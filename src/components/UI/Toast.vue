<!-- src/components/Toast.vue -->
<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-8 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-8 scale-95"
  >
    <div
      v-if="show"
      class="
       text-nowrap
       max-w-full
        fixed bottom-6 left-1/2 -translate-x-1/2 
      text-white 
        px-6 py-3.5 rounded-full 
        shadow-2xl font-medium text-sm 
        flex items-center justify-center gap-2 
        z-50
      "
      :class="[classColors]"
    >
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    default: "info"
  },
  message: {
    type: String,
    required: true
  }
})

const classColors = computed(() => {
  switch (props?.type) {
    case 'success':
      return 'bg-green-500';
     case 'error':
      return 'bg-red-500'
    default:
      return 'bg-primary'
  }
})

</script>