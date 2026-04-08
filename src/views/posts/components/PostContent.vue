<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  custom: {
    type: String,
    default: "text-base leading-[21px] select-none"
  },
  // Novo: número máximo de linhas antes de mostrar "Ler mais" (padrão 3)
  maxLines: {
    type: Number,
    default: 3
  }
})

const isExpanded = ref(false)
const needsTruncate = ref(false)
const contentRef = ref(null)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const checkIfNeedsTruncate = async () => {
  await nextTick()
  if (!contentRef.value) return

  const element = contentRef.value
  const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
  const maxHeight = lineHeight * props.maxLines

  // Se o conteúdo natural for maior que o limite de altura → precisa truncar
  needsTruncate.value = element.scrollHeight > maxHeight + 1 // +1 pra evitar falsos positivos por arredondamento
}

onMounted(() => {
  checkIfNeedsTruncate()
  // Re-verifica se a janela mudar de tamanho (responsivo)
  window.addEventListener('resize', checkIfNeedsTruncate)
})

</script>

<template>
  <div @click.stop class="relative w-full max-w-full">
    <!-- Conteúdo com truncamento condicional -->
    <div
    @click="toggleExpand"
      ref="contentRef"
      :class="[
        custom,
        'font-light dark:text-white text-black text-sm overflow-hidden break-words whitespace-pre-wrap',
        !isExpanded && needsTruncate ? 'line-clamp-[var(--max-lines)]' : ''
      ]"
      :style="{ '--max-lines': maxLines }"
      v-html="props.content"
    ></div>

    <!-- Botão Ler mais / Ler menos (só aparece se precisar) -->
    <button
      v-if="needsTruncate"
      @click="toggleExpand"
      class="mt-1 dark:text-[#b1b3b6] font-medium text-sm focus:outline-none transition-colors"
    >
      {{ isExpanded ? 'Ler menos' : 'Ler mais' }}
    </button>
  </div>
</template>

<style scoped>
/* Garante que o line-clamp funcione com v-html */
.line-clamp-\[var(--max-lines)\] {
  display: -webkit-box;
  -webkit-line-clamp: var(--max-lines);
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>