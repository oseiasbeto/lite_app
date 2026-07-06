<template>
    <!--FADE/BG atrás do composer: transparente no topo, sólido do meio pra baixo.
        A altura acompanha o tamanho do composer (cresce junto com a textarea).-->
    <div
        class="fixed bottom-0 w-full z-[10] pointer-events-none bg-gradient-to-t from-x-light-bg dark:from-x-dark-bg from-40% to-transparent transition-[height] duration-150"
        :style="{ height: `${fadeHeight}px` }">
    </div>

    <div ref="composerRef" class="fixed bottom-0 w-full z-[11] px-1.5 pb-[12px] pt-2">
        <div class="w-full bg-x-light-surface dark:bg-x-dark-surface border dark:border-x-dark-border border-x-light-border transition-[border-radius] px-3 py-2 duration-150"
            :class="isExpanded ? 'rounded-[22px]' : 'rounded-[22px] h-[50px] flex items-center'">

            <!--ESTADO FECHADO: linha padrão de trigger-->
            <div v-if="!isExpanded" @click="expand" class="flex items-center w-full h-full cursor-text">
                <div class="shrink-0">
                    <Avatar size="md" :url="user?.profile_image?.thumbnails?.md || user?.profile_image?.url" />
                </div>
                <p class="text-[15px] ml-2 text-x-light-textSecondary dark:text-x-dark-textSecondary">
                    Postar {{ type == 'post' ? ' o seu comentário' : 'a sua resposta' }}
                </p>
            </div>

            <!--ESTADO ABERTO: avatar + textarea auto-expansível + botão enviar (seta)-->
            <div v-else class="flex items-end gap-2">
                <div class="shrink-0">
                    <Avatar size="md" :url="user?.profile_image?.thumbnails?.md || user?.profile_image?.url" />
                </div>

                <textarea
                    ref="textareaRef"
                    v-model="content"
                    rows="1"
                    class="flex-1 resize-none bg-transparent outline-none text-[15px] leading-5 max-h-[160px] overflow-y-auto py-2 placeholder:text-x-light-textSecondary dark:placeholder:text-x-dark-textSecondary"
                    :placeholder="type == 'post' ? 'Escreva o seu comentário' : 'Escreva a sua resposta'"
                    @input="autoGrow"
                    @keydown.esc="collapse"
                    @keydown.enter.ctrl="submit"
                    @keydown.enter.meta="submit"
                ></textarea>

                <button
                    v-if="content.trim().length > 0"
                    @click="submit"
                    :disabled="!canSubmit || loading"
                    class="shrink-0 h-8 w-8 mb-[3px] rounded-full flex items-center justify-center transition-colors bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
                >
                    <svg viewBox="0 0 24 24" class="h-[18px] w-[18px] text-inherit" fill="none">
                        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.5"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, computed, onMounted } from 'vue';
import Avatar from '@/components/Utils/Avatar.vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

const props = defineProps({
    user: {
        type: Object,
        required: true
    },
    type: {
        type: String,
        default: 'post'
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['on-press', 'on-submit', 'on-expand', 'on-collapse', 'on-height-change'])

const isExpanded = ref(false)
const content = ref('')
const textareaRef = ref(null)
const composerRef = ref(null)
const fadeHeight = ref(90)

const canSubmit = computed(() => content.value.trim().length > 0 && !props.loading)

function expand() {
    if (isExpanded.value) return

    isExpanded.value = true
    emit('on-expand')

    nextTick(() => {
        textareaRef.value?.focus()
        autoGrow()
    })
}

function collapse() {
    isExpanded.value = false
    content.value = ''
    emit('on-collapse')
    nextTick(measure)
}

function autoGrow() {
    const el = textareaRef.value
    if (!el) return

    // reseta pra recalcular o scrollHeight real, depois aplica limitado ao max-h
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`

    measure()
}

function measure() {
    nextTick(() => {
        const h = composerRef.value?.offsetHeight || 90
        fadeHeight.value = h + 40
        emit('on-height-change', h)
    })
}

function submit() {
    if (!canSubmit.value) return
    emit('on-submit', content.value.trim())
}

// Chamado pelo pai (via ref) depois que o comentário foi criado com sucesso
function reset() {
    content.value = ''
    collapse()
}

defineExpose({ reset, expand, collapse })

onMounted(measure)
</script>