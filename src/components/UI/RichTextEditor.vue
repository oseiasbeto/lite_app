<template>
  <div class="overflow-hidden">
    <!-- Container principal do editor -->
    <editor-content :editor="editor" class="quora-editor-content" :class="{ 'no-min-height': noMinHeight }" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { watch, onBeforeUnmount, ref } from 'vue'


// Suporte ao v-model
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  noMinHeight: {
    type: Boolean,
    default: false,
  },
  disableUploadImage: {
    type: Boolean,
    default: false
  },
  disableUploadVideo: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Diz alguma coisa...'
  }
})

const emit = defineEmits(['update:modelValue'])

// Configuração do editor
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      document: {
        content: 'block+',
      },
    }),

    Placeholder.configure({
      placeholder: props.placeholder,
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
    }),
  ],
  editorProps: {
    attributes: {
      class: 'quora-editor focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    // Sanitiza o conteúdo antes de emitir
    let content = editor.getHTML();
    if (isContentEmpty(content)) {
      content = '';
    }
    emit('update:modelValue', content);
  },
  immediatelyRender: false,
})

// Sincroniza o conteúdo externo com o editor
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      editor.value.commands.setContent(newValue, false)
    }
  }
)

// Atualiza o placeholder se a prop mudar
watch(
  () => props.placeholder,
  (newPlaceholder) => {
    if (editor.value && editor.value.extensionManager) {
      const placeholderExtension = editor.value.extensionManager.extensions.find(
        ext => ext.name === 'placeholder'
      )
      if (placeholderExtension && placeholderExtension.options) {
        placeholderExtension.options.placeholder = newPlaceholder
        editor.value.view.updateState(editor.value.state)
      }
    }
  }
)
const isContentEmpty = (htmlContent) => {
  if (!htmlContent || htmlContent.trim() === '') return true;

  // Remove tags HTML e verifica se sobrou algum texto
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';

  // Verifica se existe texto significativo (não apenas espaços, quebras, etc)
  const hasText = textContent.trim().length > 0;

  // Verifica se existem elementos não vazios (como imagens, etc)
  const hasNonTextContent = tempDiv.querySelectorAll('img, video, iframe, hr').length > 0;

  return !hasText && !hasNonTextContent;
};

// Limpeza ao desmontar o componente
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

defineExpose({ editor });
</script>

<style scoped>
/* Apenas estilos específicos do editor que o Tailwind não cobre bem */
.quora-editor-content :deep(.quora-editor) {
  min-height: 250px;
  padding-top: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 21px;
  color: rgb(40, 40, 41);
}

.quora-editor-content.no-min-height :deep(.quora-editor) {
  min-height: auto;
}

/* Estilo do placeholder */
.quora-editor-content :deep(.quora-editor.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #a0aec0;
  pointer-events: none;
  height: 0;
  font-style: normal;
}

.quora-editor-content :deep(.quora-editor .is-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #949494;
  pointer-events: none;
  height: 0;
  font-style: normal;
}

/* Estilos visuais para os elementos dentro do editor */
.quora-editor-content :deep(p) {
  margin-bottom: 15px;
}

.quora-editor-content :deep(p:first-child) {
  margin-top: 0;
}

.quora-editor-content :deep(ul),
.quora-editor-content :deep(ol) {
  padding-left: 2em;
  margin-bottom: 1.2em;
}

.quora-editor-content :deep(ul) {
  list-style: disc;
}

.quora-editor-content :deep(ol) {
  list-style: decimal;
}

.quora-editor-content :deep(blockquote) {
  border-left: 2px solid #e2e2e2;
  padding-left: 15px;
  color: #636466;
}

.quora-editor-content :deep(blockquote p) {
  margin-bottom: 0.5em;
}

.quora-editor-content :deep(h1) {
  font-size: 20px;
  font-weight: 600;
}

.quora-editor-content :deep(hr) {
  margin: 2em 0;
  border: none;
  border-top: 2px solid #e2e8f0;
}

.quora-editor-content :deep(code) {
  background-color: #edf2f7;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.quora-editor-content :deep(pre) {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1.2em;
}

.quora-editor-content :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.dark .quora-editor-content :deep(.quora-editor) {
  color: inherit !important;
}
</style>