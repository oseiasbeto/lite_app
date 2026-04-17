<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'

defineEmits(['onPress'])

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  isParentPost: {
    type: Boolean,
    default: false
  },
  custom: {
    type: String,
    default: "text-base leading-[21px] select-none"
  },
  maxLines: {
    type: Number,
    default: 3
  },
  // Se true: aplica truncamento, se false: mostra todo o conteúdo
  enableTruncate: {
    type: Boolean,
    default: true
  }
})

const contentRef = ref(null)
let resizeObserver = null
let checkTimeout = null

// Função para limpar HTML vazio
const sanitizeContent = (html) => {
  if (!html) return ''
  
  let cleaned = html
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>\s*&nbsp;\s*<\/p>/g, '')
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '')
    .replace(/<p><\/p>/g, '')
    .replace(/\n\s*\n/g, '\n')
    .replace(/<h\d>\s*<\/h\d>/g, '')
    .replace(/<h\d>\s*&nbsp;\s*<\/h\d>/g, '')
    .replace(/<div>\s*<\/div>/g, '')
    .replace(/<div>\s*&nbsp;\s*<\/div>/g, '')
  
  return cleaned
}

const sanitizedContent = computed(() => {
  return sanitizeContent(props.content)
})

// Função para aplicar ou remover o truncamento
const applyTruncate = () => {
  if (!contentRef.value || !contentRef.value.isConnected) return
  
  const element = contentRef.value
  
  if (props.enableTruncate) {
    // Aplica truncamento
    element.style.display = '-webkit-box'
    element.style.webkitLineClamp = String(props.maxLines)
    element.style.webkitBoxOrient = 'vertical'
    element.style.overflow = 'hidden'
  } else {
    // Remove truncamento - mostra tudo
    element.style.display = 'block'
    element.style.webkitLineClamp = 'unset'
    element.style.webkitBoxOrient = 'unset'
    element.style.overflow = 'visible'
  }
}

// Função com debounce para evitar chamadas excessivas
const debouncedApply = () => {
  if (checkTimeout) {
    clearTimeout(checkTimeout)
  }
  checkTimeout = setTimeout(() => {
    applyTruncate()
  }, 100)
}

// Watch para quando a prop enableTruncate mudar
watch(() => props.enableTruncate, () => {
  applyTruncate()
})

// Watch para quando o conteúdo mudar
watch(() => props.content, () => {
  if (contentRef.value && contentRef.value.isConnected) {
    debouncedApply()
  }
}, { flush: 'post' })

// Watch para quando maxLines mudar
watch(() => props.maxLines, () => {
  if (props.enableTruncate && contentRef.value && contentRef.value.isConnected) {
    applyTruncate()
  }
})

onMounted(() => {
  // Pequeno delay para garantir que o DOM está pronto
  setTimeout(() => {
    if (contentRef.value && contentRef.value.isConnected) {
      applyTruncate()
    }
  }, 50)
  
  // Usa ResizeObserver para quando a tela redimensionar
  if (window.ResizeObserver && props.enableTruncate) {
    try {
      resizeObserver = new ResizeObserver((entries) => {
        window.requestAnimationFrame(() => {
          if (entries && entries.length > 0 && contentRef.value && contentRef.value.isConnected && props.enableTruncate) {
            debouncedApply()
          }
        })
      })
      
      if (contentRef.value) {
        resizeObserver.observe(contentRef.value)
      }
    } catch (error) {
      console.warn('ResizeObserver error:', error)
      window.addEventListener('resize', debouncedApply)
    }
  } else if (props.enableTruncate) {
    window.addEventListener('resize', debouncedApply)
  }
})

onBeforeUnmount(() => {
  // Limpa o timeout
  if (checkTimeout) {
    clearTimeout(checkTimeout)
    checkTimeout = null
  }
  
  // Limpa o observer
  if (resizeObserver) {
    try {
      resizeObserver.disconnect()
    } catch (error) {
      // Ignora erros no disconnect
    }
    resizeObserver = null
  }
  
  // Remove event listeners
  window.removeEventListener('resize', debouncedApply)
})
</script>

<template>
  <div @click="$emit('onPress')" class="relative w-full max-w-full">
    <!-- Conteúdo com truncamento condicional -->
    <div ref="contentRef" :class="[
      custom,
      'font-light pb-1.5 content dark:text-[inherit] text-[rgb(40,40,41)] text-sm overflow-hidden break-words whitespace-pre-wrap',
      enableTruncate ? 'line-clamp' : ''
    ]" :style="enableTruncate ? {
        'display': '-webkit-box',
        '-webkit-line-clamp': maxLines,
        '-webkit-box-orient': 'vertical',
        'overflow': 'hidden'
      } : {}" v-html="sanitizedContent"></div>
  </div>
</template>

<style>
.content>h1 {
  font-size: 16px;
  font-weight: 700;
}

.content strong {
  font-weight: 700;
}

.content {
  line-height: 1.5;
}

/* Headings */
.content h1 {
  font-size: 16px;
  font-weight: 700;
}

/* Parágrafos */
.content p {
  margin-bottom: 15px;
  line-height: 1.5;
}

.content p:last-child {
  margin-bottom: 0;
}

.content p:empty {
  display: none;
  margin: 0;
  padding: 0;
  height: 0;
  margin-bottom: 0;
}

/* Listas */
.content ul {
  list-style-type: disc;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.content ol {
  list-style-type: decimal;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.content li {
  margin-bottom: 0.25rem;
  line-height: 1.5;
}

.content li:last-child {
  margin-bottom: 0;
}

.content ul:last-child,
.content ol:last-child {
  margin-bottom: 0;
}

.content ul:only-child,
.content ol:only-child {
  margin-bottom: 0;
}

.content strong {
  font-weight: 700;
}

.content em {
  font-style: italic;
}

.content blockquote {
  border-left: 3px solid #e2e2e2;
  padding-left: 12px;
  color: #636466;
  margin: 0.5rem 0;
}

.content blockquote:first-child {
  margin: auto;
}

.dark .content blockquote {
  border-color: rgb(57, 56, 57);
  color: inherit;
}
</style>