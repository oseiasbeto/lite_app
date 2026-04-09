<template>
  <div>
    <div class="relative select-none h-14 w-full">
      <!-- Input -->
      <textarea
        rows="5"
        :id="props.label"
        class="peer w-full h-full pt-3 px-3 text-sm border border-border-secondary rounded-[4px] focus:border-secondary focus:border-2 outline-none transition-all text-gray-700 placeholder-transparent peer-valid:pt-4 pr-10"
        :placeholder="props.title"
        :class="{ '!border-red-500 !focus:border-red-500': props.error.show }"
        v-model="inputValue"
        required
      />

      <!-- Label flutuante -->
      <label
        :for="props.label"
        class="absolute pointer-events-none left-3 top-4 text-gray-500 text-base transition-all 
          peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-secondary 
          peer-valid:top-2 peer-valid:text-xs peer-valid:text-gray-500"
        :class="{ 'peer-valid:!text-red-500 peer-focus:!text-red-500': props.error.show }"
      >
        {{ props.title }}
      </label>
    </div>

    <!-- Mensagem de erro -->
    <div v-if="props.error.show" class="text-red-500 text-[13px] mt-0.5">
      {{ props.error.message }}
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ""
    }
  },
  label: {
    type: String,
    required: true
  }
})

const inputValue = defineModel()


const emit = defineEmits(['update:modelValue'])

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>