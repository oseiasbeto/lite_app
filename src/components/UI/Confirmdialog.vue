<template>
  <TransitionRoot appear :show="state.visible" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="transition-opacity duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" aria-hidden="true" />
      </TransitionChild>

      <!-- Centering wrapper -->
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="transition duration-200 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="transition duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="w-full max-w-sm bg-white dark:bg-x-dark-surface rounded-2xl shadow-xl overflow-hidden">
            <div class="px-6 pt-6 pb-5 text-center space-y-2">
              <DialogTitle class="text-base font-bold text-inherit dark:text-white leading-snug">
                {{ state.title }}
              </DialogTitle>
              <DialogDescription class="text-sm text-x-light-textSecondary dark:text-x-dark-textSecondary leading-relaxed">
                {{ state.message }}
              </DialogDescription>
            </div>

            <div class="h-px bg-x-light-border dark:bg-x-dark-border" />

            <div class="flex" :class="state.showCancel ? 'divide-x divide-x-light-border dark:divide-x-dark-border' : ''">
              <button
                v-if="state.showCancel"
                class="flex-1 py-4 text-sm active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive font-semibold text-x-light-textSecondary dark:text-x-dark-textSecondary transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-gray-300"
                @click="cancel"
              >
                {{ state.cancelLabel }}
              </button>
              <button
                class="flex-1 py-4 text-sm active:bg-x-light-surfaceActive dark:active:bg-x-dark-surfaceActive font-bold"
                :class="confirmButtonClass"
                @click="confirm"
              >
                {{ state.confirmLabel }}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { computed } from 'vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from '@headlessui/vue'
import { useConfirmModal } from '@/composables/useConfirmModal'

const { state, confirm, cancel, close } = useConfirmModal()

const confirmButtonClass = computed(() => ({
  'text-blue-600 focus-visible:ring-blue-400':   state.value.variant === 'default',
  'text-red-600 focus-visible:ring-red-400':      state.value.variant === 'danger',
  'text-amber-600 focus-visible:ring-amber-400': state.value.variant === 'warning',
  'text-green-600 focus-visible:ring-green-400': state.value.variant === 'success',
}))
</script>