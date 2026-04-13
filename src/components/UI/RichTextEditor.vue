<template>
  <div class="overflow-hidden">
    <!-- Barra de ferramentas com toggle -->
    <div class="flex flex-row items-center overflow-hidden border-b border-gray-200">
      <button @click="toggleToolbar"
        class="bg-transparent border-none mr-2"
        :title="showToolbar ? 'Ocultar formatação' : 'Mostrar formatação'">
        <svg v-if="showToolbar" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="m5 8.5 7 7 7.005-7" class="icon_svg-stroke" stroke="#666" stroke-width="1.5" fill="none"
            stroke-linecap="round"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path class="icon_svg-fill_as_stroke"
            d="m10.526 17.352-1.002-3.031H5.162l-1.018 3.031H2L6.205 5.5h2.382l4.214 11.852h-2.275zM7.281 7.759l-1.626 4.887h3.376l-1.61-4.887h-.14zm10.415 8.14c1.232 0 2.152-.797 2.152-1.84v-.715l-2.029.131c-1.142.074-1.676.485-1.676 1.216 0 .756.649 1.207 1.552 1.207zm-.6 1.602c-1.733 0-2.973-1.051-2.973-2.694 0-1.626 1.224-2.563 3.409-2.694l2.316-.14v-.756c0-.879-.591-1.372-1.692-1.372-.936 0-1.577.329-1.766.936h-1.922c.164-1.585 1.651-2.595 3.786-2.595 2.308 0 3.606 1.125 3.606 3.031v6.136h-1.963V16.12h-.14c-.501.871-1.487 1.38-2.661 1.38z"
            fill="#666" fill-rule="evenodd"></path>
        </svg>
      </button>
      <button v-if="!showToolbar" @click="$emit('upload-image')"
        class="bg-transparent border-none ml-1 mr-2 py-2"
        title="Subir imagem">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24"
          viewBox="0 0 24 24">
          <defs>
            <path d="M5 4.5v14H2V.5h16.5v4H5z" id="a"></path>
          </defs>
          <g fill="#666" fill-rule="evenodd" class="icon_svg-fill_as_stroke">
            <g fill-rule="nonzero">
              <path
                d="M8 7a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-12A.5.5 0 0 0 20 7H8zm0-1.25h12a1.75 1.75 0 0 1 1.75 1.75v12A1.75 1.75 0 0 1 20 21.25H8a1.75 1.75 0 0 1-1.75-1.75v-12A1.75 1.75 0 0 1 8 5.75zM17.5 9a1 1 0 1 0 0 2 1 1 0 1 0 0-2zm0-1.25a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 1 1 0-4.5z">
              </path>
              <path
                d="M7.511 16.316V20h13v-3.682c-1.73-.926-2.81-1.389-3.241-1.389-.647 0-2.606 1.388-3.257 1.389s-2.609-2.299-3.252-2.299c-.429 0-1.512.766-3.25 2.298zm6.674-1.353.867-.443c1.296-.69 1.629-.842 2.217-.842.732 0 1.874.489 3.831 1.537a1.25 1.25 0 0 1 .66 1.102V20a1.25 1.25 0 0 1-1.25 1.25h-13A1.25 1.25 0 0 1 6.261 20v-3.684a1.25 1.25 0 0 1 .423-.938c2.065-1.82 3.183-2.61 4.077-2.61.523 0 .911.21 1.443.613.271.205.489.392 1.007.849l.866.732.041.031.067-.03z">
              </path>
            </g>
            <mask id="b" fill="#fff">
              <use xlink:href="#a"></use>
            </mask>
            <path
              d="M4.5 3.5A.5.5 0 0 0 4 4v12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5h-12zm0-1.25h12A1.75 1.75 0 0 1 18.25 4v12a1.75 1.75 0 0 1-1.75 1.75h-12A1.75 1.75 0 0 1 2.75 16V4A1.75 1.75 0 0 1 4.5 2.25z"
              fill-rule="nonzero" mask="url(#b)"></path>
          </g>
        </svg>
      </button>

      <!-- Toolbar expansível -->
      <div v-show="showToolbar && editor" class="flex flex-nowrap overflow-x-auto gap-1 px-2 pt-0">
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="[
          'bg-transparent border-none text-sm font-medium mr-2 py-2 rounded-md cursor-pointer',
          editor && editor.isActive('heading', { level: 1 }) ? 'dark:text-white text-[rgb(40,40,41)]' : ''
        ]" title="Título H1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 20h-3.15v-6.686h-5.7V20H3V4h3.15v6.098h5.7V4H15v16Zm3.397 0v-8.031l-1.897 1.91V11.78L18.397 10H20.5v10h-2.103Z"
              fill="currentColor" class="icon_svg-fill_as_stroke"></path>
          </svg>
        </button>

        <button @click="editor.chain().focus().toggleBold().run()" :class="[
          'bg-transparent border-none text-sm font-medium mr-2 py-2 rounded-md cursor-pointer',
          editor && editor.isActive('bold') ? 'dark:text-white text-[rgb(40,40,41)]' : ''
        ]" title="Negrito (Ctrl+B)">
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.78 20H6V4h6.602c2.929 0 4.676 1.52 4.676 3.992 0 1.696-1.182 3.17-2.73 3.415v.2c1.998.154 3.452 1.75 3.452 3.813 0 2.806-1.998 4.58-5.22 4.58ZM9.16 6.561v4.07h2.374c1.706 0 2.637-.743 2.637-2.03 0-1.275-.868-2.04-2.375-2.04H9.16Zm0 10.878h2.814c1.82 0 2.804-.81 2.804-2.307 0-1.463-1.015-2.24-2.877-2.24H9.16v4.547Z"
              class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="evenodd"></path>
          </svg>
        </button>

        <button @click="editor.chain().focus().toggleItalic().run()" :class="[
          'bg-transparent border-none text-sm font-medium mr-2 py-2 rounded-md cursor-pointer',
          editor && editor.isActive('italic') ? 'dark:text-white text-[rgb(40,40,41)]' : ''
        ]" title="Itálico (Ctrl+I)">
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="m13.903 6.712-2.081 10.325a6.896 6.896 0 0 0-.086.798c0 .41.129.687.386.832.258.144.723.231 1.395.262L13.324 20H6.5l.236-1.071c.773-.03 1.327-.152 1.663-.365.336-.213.569-.638.698-1.276l2.081-10.325c.057-.395.086-.661.086-.798 0-.41-.129-.687-.386-.832-.258-.144-.723-.231-1.395-.262L9.676 4H16.5l-.236 1.071c-.773.03-1.327.152-1.663.365-.336.213-.569.638-.698 1.276Z"
              class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="evenodd"></path>
          </svg>
        </button>

        <button @click="editor.chain().focus().toggleOrderedList().run()" :class="[
          'bg-transparent border-none text-sm font-medium mr-2 py-2 rounded-md cursor-pointer',
          editor && editor.isActive('orderedList') ? 'dark:text-white text-[rgb(40,40,41)]' : ''
        ]" title="Lista numerada">
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.5 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5zm0 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 8 12v-.5a.5.5 0 0 1 .5-.5zm0 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V17a.5.5 0 0 1 .5-.5zM5.308 8.123h.738V4.6H5.31l-.911.627v.686l.864-.595h.044zM4 11.145v.012h.684v-.014c0-.325.234-.55.576-.55.322 0 .552.2.552.484 0 .23-.125.412-.62.896l-1.15 1.125v.515h2.541V13H5.04v-.043l.674-.643c.61-.573.818-.903.818-1.286 0-.606-.513-1.028-1.248-1.028C4.522 10 4 10.464 4 11.145zm.908 6.44h.437c.396 0 .637.19.637.498 0 .3-.256.508-.625.508-.378 0-.63-.188-.651-.486H4c.032.664.564 1.099 1.35 1.099.803 0 1.384-.447 1.384-1.065 0-.464-.302-.786-.786-.84v-.044a.794.794 0 0 0 .65-.805c0-.554-.52-.95-1.243-.95-.77 0-1.265.42-1.29 1.086h.682c.02-.305.247-.498.588-.498.345 0 .564.181.564.464 0 .288-.227.484-.561.484h-.43v.549z"
              class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="evenodd"></path>
          </svg>
        </button>

        <button @click="editor.chain().focus().toggleBulletList().run()" :class="[
          'bg-transparent border-none text-sm font-medium mr-2 py-2 rounded-md cursor-pointer',
          editor && editor.isActive('bulletList') ? 'dark:text-white text-[rgb(40,40,41)]' : ''
        ]" title="Lista com marcadores">
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.5 5.75h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5zm0 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5zm0 5.5h11a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5zM4.5 5.5h1A.5.5 0 0 1 6 6v1a.5.5 0 0 1-.5.5h-1A.5.5 0 0 1 4 7V6a.5.5 0 0 1 .5-.5zm0 5.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm0 5.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1A.5.5 0 0 1 4 18v-1a.5.5 0 0 1 .5-.5z"
              class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="evenodd"></path>
          </svg>
        </button>

        <button @click="editor.chain().focus().toggleBlockquote().run()" :class="[
          'bg-transparent border-none text-sm font-medium mr-2 py-2 rounded-md cursor-pointer',
          editor && editor.isActive('blockquote') ? 'dark:text-white text-[rgb(40,40,41)]' : ''
        ]" title="Citação">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path class="icon_svg-fill_as_stroke"
              d="m10.287 9.586.005-.191a3.896 3.896 0 1 0-7.792.001 3.896 3.896 0 0 0 3.896 3.896 3.88 3.88 0 0 0 1.376-.25c-.089.875-.302 1.643-.765 2.26-1.042 1.386-2.377 2.014-3.413 2.244-.277.062-.455.254-.44.534.015.268.251.415.515.42l.036-.001C4.993 18.431 6.5 17.5 8 16c1.472-1.472 2.313-3.784 2.287-6.414zm-1.403 7.297c-1.746 1.746-3.49 2.777-5.097 2.863l-.14.003c-.885-.015-1.688-.621-1.742-1.604-.048-.913.562-1.63 1.418-1.821.991-.22 1.954-.803 2.685-1.775a5.18 5.18 0 0 1-4.757-5.155 5.146 5.146 0 0 1 10.292 0l-.004.213c.021 2.918-.926 5.548-2.653 7.275zm12.653-7.297.005-.191a3.896 3.896 0 1 0-7.792.001 3.896 3.896 0 0 0 3.896 3.896 3.88 3.88 0 0 0 1.376-.25c-.089.875-.302 1.643-.765 2.26-1.042 1.386-2.377 2.014-3.413 2.244-.277.062-.455.254-.44.534.015.268.251.415.515.42l.036-.001C16.243 18.43 17.75 17.5 19.25 16c1.472-1.472 2.313-3.784 2.287-6.414zm-1.403 7.297c-1.746 1.746-3.49 2.777-5.097 2.863l-.14.003c-.885-.015-1.688-.621-1.742-1.604-.048-.913.562-1.63 1.418-1.821.991-.22 1.954-.803 2.685-1.775a5.18 5.18 0 0 1-4.757-5.155 5.146 5.146 0 0 1 10.292 0l-.004.213c.021 2.918-.926 5.548-2.653 7.275z">
            </path>
          </svg>
        </button>

        <button @click="editor.chain().focus().setHorizontalRule().run()"
          class="bg-transparent border-none text-sm font-medium mr-2 py-2 rounded-md cursor-pointer"
          title="Linha horizontal">
          —
        </button>
      </div>
    </div>

    <!-- Container principal do editor -->
    <editor-content :editor="editor" class="quora-editor-content" :class="{ 'no-min-height': noMinHeight }" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { watch, onBeforeUnmount, ref } from 'vue'

// Estado para controlar visibilidade da toolbar
const showToolbar = ref(false)

// Suporte ao v-model
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  noMinHeight : {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: 'Diz alguma coisa...'
  }
})

const emit = defineEmits(['update:modelValue', 'upload-image'])

// Função para toggle da toolbar
const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value
}

// Configuração do editor
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
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
    emit('update:modelValue', editor.getHTML())
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

// Limpeza ao desmontar o componente
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
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
  margin-bottom: 1.2em;
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
  color: #4a5568;
  font-style: italic;
}

.quora-editor-content :deep(blockquote p) {
  margin-bottom: 0.5em;
}

.quora-editor-content :deep(h1) {
  font-size: 2em;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.3em;
}

.quora-editor-content :deep(h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.quora-editor-content :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1.2em;
  margin-bottom: 0.5em;
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
</style>