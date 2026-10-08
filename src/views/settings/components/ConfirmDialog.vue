<template>
    <Teleport to="body">
        <Transition name="tt-dialog">
            <div v-if="modelValue" class="tt-dialog [--d-bg:#ffffff] [--d-text:#161823] [--d-text-2:rgba(22,24,35,0.6)] [--d-line:rgba(22,24,35,0.12)] [--d-press:rgba(22,24,35,0.06)] dark:[--d-bg:#252525] dark:[--d-text:#ffffff] dark:[--d-text-2:rgba(255,255,255,0.6)] dark:[--d-line:rgba(255,255,255,0.12)] dark:[--d-press:rgba(255,255,255,0.08)]" @click.self="close">
                <div class="tt-dialog__box" role="alertdialog" aria-modal="true" aria-labelledby="tt-dialog-title"
                    :aria-describedby="message ? 'tt-dialog-message' : undefined">
                    <div class="tt-dialog__body">
                        <h2 id="tt-dialog-title" class="tt-dialog__title">{{ title }}</h2>
                        <p v-if="message" id="tt-dialog-message" class="tt-dialog__message">{{ message }}</p>
                    </div>

                    <button type="button" class="tt-dialog__btn tt-dialog__btn--confirm"
                        :class="{ 'is-danger': danger }" :disabled="loading" @click="$emit('confirm')">
                        <span v-if="loading" class="tt-dialog__spinner" aria-hidden="true"></span>
                        <span v-else>{{ confirmText }}</span>
                    </button>

                    <button ref="cancelBtn" type="button" class="tt-dialog__btn tt-dialog__btn--cancel"
                        :disabled="loading" @click="close">
                        {{ cancelText }}
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: 'Confirmar' },
    message: { type: String, default: '' },
    confirmText: { type: String, default: 'Confirmar' },
    cancelText: { type: String, default: 'Cancelar' },
    danger: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const cancelBtn = ref(null)
let previousOverflow = ''

function close() {
    if (props.loading) return
    emit('update:modelValue', false)
    emit('cancel')
}

function onKeydown(e) {
    if (e.key === 'Escape') close()
}

watch(
    () => props.modelValue,
    async (open) => {
        if (open) {
            previousOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', onKeydown)
            await nextTick()
            cancelBtn.value?.focus()
        } else {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', onKeydown)
        }
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (props.modelValue) document.body.style.overflow = previousOverflow
    window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.tt-dialog {
    /* cores claro/escuro vêm das classes Tailwind no elemento raiz */
    --d-red: #fe2c55;

    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.5);
    font-family: 'Proxima Nova', 'TikTokFont', 'Helvetica Neue', Arial, sans-serif;
}

.tt-dialog__box {
    width: 100%;
    max-width: 300px;
    overflow: hidden;
    border-radius: 12px;
    background: var(--d-bg);
    color: var(--d-text);
    text-align: center;
}

.tt-dialog__body {
    padding: 24px 20px 20px;
}

.tt-dialog__title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
}

.tt-dialog__message {
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 1.4;
    color: var(--d-text-2);
}

.tt-dialog__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 48px;
    border: 0;
    border-top: 1px solid var(--d-line);
    background: transparent;
    color: var(--d-text);
    font-size: 16px;
    cursor: pointer;
}

.tt-dialog__btn:active:not(:disabled) {
    background: var(--d-press);
}

.tt-dialog__btn:disabled {
    opacity: 0.5;
    cursor: default;
}

.tt-dialog__btn--confirm {
    font-weight: 700;
}

.tt-dialog__btn--confirm.is-danger {
    color: var(--d-red);
}

.tt-dialog__btn--cancel {
    font-weight: 400;
}

.tt-dialog__btn:focus-visible {
    outline: 2px solid var(--d-red);
    outline-offset: -2px;
}

.tt-dialog__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(254, 44, 85, 0.3);
    border-top-color: var(--d-red);
    border-radius: 50%;
    animation: tt-dialog-spin 0.7s linear infinite;
}

/* Animação de entrada/saída (responde à ação do usuário) */
.tt-dialog-enter-active,
.tt-dialog-leave-active {
    transition: opacity 0.18s ease;
}

.tt-dialog-enter-active .tt-dialog__box,
.tt-dialog-leave-active .tt-dialog__box {
    transition: transform 0.18s ease;
}

.tt-dialog-enter-from,
.tt-dialog-leave-to {
    opacity: 0;
}

.tt-dialog-enter-from .tt-dialog__box,
.tt-dialog-leave-to .tt-dialog__box {
    transform: scale(0.94);
}

@keyframes tt-dialog-spin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .tt-dialog-enter-active,
    .tt-dialog-leave-active,
    .tt-dialog-enter-active .tt-dialog__box,
    .tt-dialog-leave-active .tt-dialog__box {
        transition: none;
    }
}
</style>