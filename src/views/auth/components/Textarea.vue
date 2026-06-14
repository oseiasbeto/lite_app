<template>
  <div>
    <div class="relative select-none h-14 w-full">
      <!-- Input -->
      <textarea rows="5" :id="props.label"
      placeholder="Biografia"
        class="peer w-full bg-transparent text-[15px] placeholder:text-[#939598] placeholder:dark:text-[#b1b3b6] border p-2 rounded-[3px] focus:shadow-[rgb(235,240,255)_0px_0px_0px_2px] dark:focus:shadow-[rgb(40,45,65)_0px_0px_0px_2px] dark:border-[rgb(57,56,57)] dark:text-white outline-none transition-all text-[rgb(40,40,41)] focus:!border-[#2e69ff]"
        :class="{ '!border-red-500 !focus:border-red-500': props.error.show }" :placeholder="props.placeholder"
        v-model="inputValue" required />
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