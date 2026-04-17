<template>
  <div>
    <div class="relative select-none w-full">
      <!-- Label flutuante -->
      <label :for="props.label" class="text-[13px] font-bold left-3 top-4 text-[rgb(40,40,41)] dark:text-inherit">
        {{ props.title }}
      </label>

      <div class="h-[45px] mt-1 relative">
        <!-- Input -->
        <input :autocomplete="props.type === 'password' ? 'new-password' : 'off'"
          :type="showPassword ? 'text' : props.type" :id="props.label"
          class="peer w-full bg-transparent h-full text-[15px] placeholder:text-[#939598] placeholder:dark:text-[#b1b3b6] border p-2 rounded-[3px] focus:shadow-[rgb(235,240,255)_0px_0px_0px_2px] dark:focus:shadow-[rgb(40,45,65)_0px_0px_0px_2px] dark:border-[rgb(57,56,57)] dark:text-white outline-none transition-all text-[rgb(40,40,41)] focus:!border-[#2e69ff]"
          :placeholder="props.placeholder"
          :class="{ '!border-red-500 !focus:border-red-500': props.error.show, 'pr-10': props?.type == 'password' }"
          v-model="inputValue" required />

        <!-- Botão de mostrar/esconder senha (apenas para type="password") -->
        <button v-if="props.type === 'password'" type="button" @click="showPassword = !showPassword"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-[#b1b3b6]"
          tabindex="-1">
          <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>

          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>

    </div>

    <!-- Mensagem de erro -->
    <div v-if="props.error.show" class="text-warning flex items-center gap-1 text-[13px] mt-1">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <g id="error" stroke="none" fill="none" fill-rule="evenodd" transform="translate(3.000000, 3.000000)">
          <path
            d="M9,12 C9.55228475,12 10,12.4477153 10,13 C10,13.5522847 9.55228475,14 9,14 C8.44771525,14 8,13.5522847 8,13 C8,12.4477153 8.44771525,12 9,12 Z"
            class="icon_svg-fill_as_stroke" fill="currentColor" fill-rule="nonzero"></path>
          <path
            d="M9,9.5 L9,4.5 L9,9.5 Z M9,18 C4.029,18 0,13.971 0,9 C0,4.029 4.029,0 9,0 C13.971,0 18,4.029 18,9 C18,13.971 13.971,18 9,18 Z"
            class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
        </g>
      </svg>
      <p> {{ props.error.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    required: true
  }
})

const inputValue = defineModel()
const showPassword = ref(false) // Estado local para controlar visibilidade da senha

const emit = defineEmits(['update:modelValue'])

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>