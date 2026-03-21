<!-- src/components/ButtonSecondary.vue -->
<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    class="group font-bold text-base rounded-full transition-all focus:outline-none"
    :class="[
      inline 
        ? 'px-6 py-3 inline-flex items-center justify-center' 
        : 'w-full py-3.5 px-6',
      loading || disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-white/10 active:bg-white/5',
      'border border-border-primary text-text-primary'
    ]"
  >
    <!-- Conteúdo normal -->
    <span v-if="!loading" class="flex items-center justify-center">
      <slot></slot>
    </span>

    <!-- Estado de loading (opcional – menos comum em botões secundários, mas incluído) -->
    <span v-else class="flex items-center justify-center gap-2">
      <svg
        class="animate-spin h-4 w-4 text-text-primary/70"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span v-if="loadingText">{{ loadingText }}</span>
      <span v-else>Carregando...</span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  // Controla se o botão está desabilitado
  disabled: {
    type: Boolean,
    default: false
  },

  // Mostra estado de loading (opcional)
  loading: {
    type: Boolean,
    default: false
  },

  // Texto durante loading (opcional)
  loadingText: {
    type: String,
    default: ''
  },

  // Tipo do botão HTML
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },

  // Modo inline (não ocupa largura total)
  inline: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>