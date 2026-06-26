<template>
  <div :class="[
    'fixed inset-0 z-[9999]',
    isOpen ? 'block bg-opacity-50' : 'hidden bg-opacity-0',
    overlayClass,
  ]" @click.self="close">
    <div ref="DrawerRef" :class="[
      'absolute bottom-0 left-0 right-0 bg-white dark:bg-[#181818]',
      costumClass,
      isOpen ? 'animate-slide-up' : 'animate-slide-down',
    ]">
      <div v-show="title"
        class="flex px-[16px] justify-center border-b dark:border-[#393839] shadow-[0_1px_1px_rgba(0,0,0,.15)] w-full h-12">
        <div class="h-full w-full flex items-center">
          <button @click="close" class="shrink-0 text-inherit">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5"
                fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
            </svg>
          </button>
          <span class="flex-1 dark:text-white text-[rgb(40,40,41)] text-base font-semibold text-center"> {{ title }}
          </span>

          <button class="shrink-0 w-6 h-6"></button>
        </div>
      </div>
      <div class="relative">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useStore } from 'vuex';


const props = defineProps({
  isOpen: Boolean,
  overlayClass: {
    type: String,
    default: "dark:bg-[rgba(36,36,36,.9)] bg-[rgba(36,36,36,0.9)] transition-bg-opacity duration-300"
  },
  title: {
    type: String,
    default: null
  },
  costumClass: String,
})
const store = useStore()
const currentTheme = computed(() => store.getters.currentTheme)

const setThemeColor = (theme) => {
    // Aplicar classe no HTML
    if (theme === 'dark') {
        window?.WTN?.statusBar({
            style: 'light',
            color: '262626',
            overlay: false //Only for android
        });
    } else if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (isDark) {
            window?.WTN?.statusBar({
                style: 'dark',
                color: '262626',
                overlay: false //Only for android
            });
        } else {
            window?.WTN.statusBar({
                style: 'dark',
                color: "FFFFFF",
                overlay: false //Only for android
            });
        }
    } else {
        window?.WTN.statusBar({
            style: 'dark',
            color: "FFFFFF",
            overlay: false //Only for android
        })
    }
}

const emit = defineEmits(['close'])

// Watch para monitorar o isOpen
watch(() => props.isOpen, (newValue) => {
  if (newValue && currentTheme.value == 'light') {
    // Quando o drawer abrir (isOpen = true), troca a cor
    // Você pode definir a cor que desejar aqui
    if (window?.WTN) {
      window.WTN.statusBar({
        style: 'light',
        color: '80ff0000',
        overlay: false
      });
    }
  } else {
    // Quando fechar, restaura a cor baseada no tema atual
    setThemeColor(currentTheme.value);
  }
})

const close = () => {
  emit('close')
}


</script>

<style>
.animate-slide-up {
  animation: slide-up 0.1s ease-in-out;
}

.animate-slide-down {
  animation: slide-down 0.1s ease-in-out;
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