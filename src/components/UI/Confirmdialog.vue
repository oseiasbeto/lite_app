<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" class="relative z-50" @close="onCancel">

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
          <DialogPanel class="w-full max-w-sm bg-white dark:bg-[#181818] rounded-2xl shadow-xl overflow-hidden">

            <!-- Text -->
            <div class="px-6 pt-6 pb-5 text-center space-y-2">
              <DialogTitle class="text-base font-bold text-inherit dark:text-white text-[rgb(40,40,41)] leading-snug">
                {{ title }}
              </DialogTitle>
              <DialogDescription class="text-sm text-inherit dark:text-[#b0b3b8] leading-relaxed">
                {{ message }}
              </DialogDescription>
            </div>

            <!-- Divider -->
            <div class="h-px bg-[rgb(222,224,225)] dark:bg-[rgb(57,56,57)]" />

            <!-- Actions -->
            <div class="flex" :class="showCancel ? 'divide-x divide-gray-100 dark:divide-[rgb(57,56,57)]' : ''">
              <button
                v-if="showCancel"
                class="flex-1 py-4 text-sm font-semibold text-gray-500 tapHighlight transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-gray-300"
                @click="onCancel"
              >
                {{ cancelLabel }}
              </button>
              <button
                class="flex-1 py-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2"
                :class="confirmButtonClass"
                @click="onConfirm"
              >
                {{ confirmLabel }}
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

const props = defineProps({
  modelValue:   { type: Boolean, required: true },
  title:        { type: String,  required: true },
  message:      { type: String,  required: true },
  variant:      { type: String,  default: 'default', validator: (v) => ['default', 'danger', 'warning', 'success'].includes(v) },
  confirmLabel: { type: String,  default: 'Confirmar' },
  cancelLabel:  { type: String,  default: 'Cancelar' },
  showCancel:   { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

const confirmButtonClass = computed(() => ({
  'text-blue-600 tapHighlight focus-visible:ring-blue-400':   props.variant === 'default',
  'text-red-600 tapHighlight focus-visible:ring-red-400':      props.variant === 'danger',
  'text-amber-600 tapHighlight focus-visible:ring-amber-400': props.variant === 'warning',
  'text-green-600 tapHighlight focus-visible:ring-green-400': props.variant === 'success',
}))
</script>