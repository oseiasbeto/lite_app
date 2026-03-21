<!-- src/components/ButtonPrimary.vue -->
<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    class="group font-bold text-base rounded-full transition-all focus:outline-none"
    :class="[
      inline 
        ? 'px-8 py-3 inline-flex items-center justify-center' 
        : 'w-full py-3.5 px-6',
      loading || disabled 
        ? 'opacity-60 cursor-not-allowed' 
        : 'hover:opacity-90 active:opacity-80',
      bgClass,
      textClass
    ]"
  >
    <!-- Conteúdo normal -->
    <span v-if="!loading" class="flex items-center justify-center gap-2">
      <slot></slot>
    </span>

    <!-- Estado de loading -->
    <span v-else class="flex items-center justify-center gap-2">
      <svg
        class="animate-spin h-5 w-5 text-current"
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

  // Mostra estado de loading
  loading: {
    type: Boolean,
    default: false
  },

  // Texto alternativo durante o loading (opcional)
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
  },

  // Permite sobrescrever a cor de fundo (opcional)
  bgClass: {
    type: String,
    default: 'bg-text-primary'
  },

  // Permite sobrescrever a cor do texto (opcional)
  textClass: {
    type: String,
    default: 'text-white'
  }
})

defineEmits(['click'])
</script>