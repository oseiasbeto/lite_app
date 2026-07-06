<template>
  <teleport to="body">
    <!-- Toasts posicionados no TOPO -->
    <div
      v-if="topToasts.length"
      class="fixed left-1/2 z-[9999] flex -translate-x-1/2 flex-col-reverse gap-2"
      :style="{ top: `${topToasts[0].offset}px` }"
    >
      <transition-group name="toast-top">
        <ToastItem
          v-for="toast in topToasts"
          :key="toast.id"
          :toast="toast"
          @click="handleClick(toast)"
          @close="close(toast.id)"
        />
      </transition-group>
    </div>

    <!-- Toasts posicionados no FUNDO (padrão, igual ao X) -->
    <div
      v-if="bottomToasts.length"
      class="fixed left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-2"
      :style="{ bottom: `${bottomToasts[0].offset}px` }"
    >
      <transition-group name="toast-bottom">
        <ToastItem
          v-for="toast in bottomToasts"
          :key="toast.id"
          :toast="toast"
          @click="handleClick(toast)"
          @close="close(toast.id)"
        />
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { computed, h } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const toasts = computed(() => store.getters.toasts)
const topToasts = computed(() => toasts.value.filter((t) => t.position === 'top'))
const bottomToasts = computed(() => toasts.value.filter((t) => t.position !== 'top'))

function handleClick(toast) {
  if (typeof toast.onClick === 'function') {
    toast.onClick(toast)
  }
  close(toast.id)
}

function close(id) {
  store.dispatch('removeToast', id)
}

// Sub-componente inline: um "toast" individual, no estilo pill escuro do X
const ToastItem = {
  props: { toast: { type: Object, required: true } },
  emits: ['click', 'close'],
  setup(props, { emit }) {
    const icons = {
      success: () =>
        h(
          'svg',
          { viewBox: '0 0 20 20', class: 'h-5 w-5 shrink-0 text-[#00ba7c]', fill: 'currentColor' },
          [
            h('path', {
              'fill-rule': 'evenodd',
              'clip-rule': 'evenodd',
              d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.28-9.72a.75.75 0 00-1.06-1.06L9 10.44 7.78 9.22a.75.75 0 00-1.06 1.06l1.75 1.75a.75.75 0 001.06 0l3.75-3.75z',
            }),
          ]
        ),
      error: () =>
        h(
          'svg',
          { viewBox: '0 0 20 20', class: 'h-5 w-5 shrink-0 text-[#f4212e]', fill: 'currentColor' },
          [
            h('path', {
              'fill-rule': 'evenodd',
              'clip-rule': 'evenodd',
              d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z',
            }),
          ]
        ),
      info: () =>
        h(
          'svg',
          { viewBox: '0 0 20 20', class: 'h-5 w-5 shrink-0 text-[#1d9bf0]', fill: 'currentColor' },
          [
            h('path', {
              'fill-rule': 'evenodd',
              'clip-rule': 'evenodd',
              d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
            }),
          ]
        ),
    }

    return () =>
      h(
        'div',
        {
          class: [
            'group flex min-w-[280px] max-w-sm cursor-pointer items-center gap-3',
            'rounded-full border border-white/10 bg-[#16181c] py-3 pl-4 pr-3',
            'text-[15px] font-bold leading-5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)]',
            'transition-transform active:scale-[0.98]',
          ],
          onClick: () => emit('click'),
        },
        [
          icons[props.toast.type] ? icons[props.toast.type]() : icons.info(),
          h('span', { class: 'flex-1' }, props.toast.message),
          h(
            'button',
            {
              class:
                'ml-1 shrink-0 rounded-full p-1 text-white/60 opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100',
              onClick: (e) => {
                e.stopPropagation()
                emit('close')
              },
            },
            [
              h(
                'svg',
                { viewBox: '0 0 20 20', class: 'h-4 w-4', fill: 'currentColor' },
                [
                  h('path', {
                    d: 'M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z',
                  }),
                ]
              ),
            ]
          ),
        ]
      )
  },
}
</script>

<style scoped>
/* Fundo: entra deslizando de baixo para cima (padrão do X) */
.toast-bottom-enter-active,
.toast-bottom-leave-active,
.toast-bottom-move {
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-bottom-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}
.toast-bottom-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.9);
}

/* Topo: entra deslizando de cima para baixo */
.toast-top-enter-active,
.toast-top-leave-active,
.toast-top-move {
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-top-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.9);
}
.toast-top-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.9);
}
</style>