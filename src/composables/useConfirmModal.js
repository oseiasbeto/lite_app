import { ref, readonly } from 'vue'

const state = ref({
  visible: false,
  title: '',
  message: '',
  variant: 'default',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  showCancel: true,
})

let resolvePromise = null
let rejectPromise = null

export function useConfirmModal() {
  const showConfirm = (options) => {
    return new Promise((resolve, reject) => {
      // Preenche o estado com as opções fornecidas
      state.value = {
        visible: true,
        title: options.title || 'Tem certeza?',
        message: options.message || '',
        variant: options.variant || 'default',
        confirmLabel: options.confirmLabel || 'Confirmar',
        cancelLabel: options.cancelLabel || 'Cancelar',
        showCancel: options.showCancel !== undefined ? options.showCancel : true,
      }

      resolvePromise = resolve
      rejectPromise = reject
    })
  }

  const confirm = () => {
    state.value.visible = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
      rejectPromise = null
    }
  }

  const cancel = () => {
    state.value.visible = false
    if (rejectPromise) {
      rejectPromise(new Error('Cancelado pelo usuário'))
      resolvePromise = null
      rejectPromise = null
    } else if (resolvePromise) {
      // Caso prefira resolver com false em vez de rejeitar
      resolvePromise(false)
      resolvePromise = null
      rejectPromise = null
    }
  }

  const close = () => {
    state.value.visible = false
    if (rejectPromise) {
      rejectPromise(new Error('Fechado sem interação'))
      resolvePromise = null
      rejectPromise = null
    }
  }

  return {
    state: readonly(state), // expõe apenas leitura
    showConfirm,
    confirm,
    cancel,
    close,
  }
}