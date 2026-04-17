<script setup>
import { ref } from 'vue'
import Input from '../components/Input.vue'
import ButtonPrimary from '../components/ButtonPrimary.vue'
import ButtonSecondary from '../components/ButtonSecondary.vue'
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Toast from '@/components/UI/Toast.vue';
import SecondaryButton from '@/components/buttons/SecondaryButton.vue';

const identifier = ref('')
const password = ref('')
const identifierError = ref({ show: false, message: '' })
const passwordError = ref({ show: false, message: '' })
const isLoggingIn = ref(false) // Para simular estado de login

const toast = ref({
  show: false,
  message: "",
  type: undefined
})

const router = useRouter() // Para navegação programática
const store = useStore() // Para acessar ações do Vuex

function validateIdentifier() {
  const value = identifier.value.trim()
  if (!value) {
    identifierError.value = { show: true, message: 'O e-mail é obrigatório.' }
    return false
  }

  identifierError.value = { show: false, message: '' }
  return true
}

function validatePassword() {
  const value = password.value.trim()
  if (!value) {
    passwordError.value = { show: true, message: 'A senha é obrigatória.' }
    return false
  }

  // Opcional: força (mas X não valida client-side além de vazio)
  passwordError.value = { show: false, message: '' }
  return true
}

async function handleSignin() {
  if (!validateIdentifier || !validatePassword()) return

  isLoggingIn.value = true
  try {
    await store.dispatch('login', { identifier: identifier.value, password: password.value })

    router.push('/home') // Redireciona para a página inicial após login
  } catch (err) {
    let errorMessage = 'Credenciais inválidas. Tente novamente.'

    identifier.value = ""
    password.value = ""
    toast.value.message = errorMessage
    toast.value.type = 'error'
    toast.value.show = true
    setTimeout(() => {
      toast.value.show = false
      toast.value.type = undefined
    }, 3000) // Esconde o toast após 3 segundos
  } finally {
    isLoggingIn.value = false
  }
}

function handleClose() {
  router.back()
}
</script>

<template>
  <div class="flex flex-col w-full bg-white dark:bg-transparent h-screen relative">

    <div class="sticky px-4 py-4 flex items-center flex-row">
      <div class="flex-1 mr-2">
        <!-- Botão X no topo esquerdo para voltar/fechar -->
        <button @click="handleClose" class="focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="shrink-0">
        <SecondaryButton @on-press="handleSignin" :loading="isLoggingIn"
          :disabled="!identifier.trim() || !password.trim() || identifierError?.show || passwordError?.show"
          text="Entrar" />
      </div>
    </div>

    <!-- Área principal com scroll se necessário -->
    <div class="flex-1 flex overflow-y-scroll flex-col justify-start px-4">

      <!-- Título dinâmico -->
      <h1 class="text-xl text-[rgb(40,40,41)] dark:text-inherit text-left font-bold mb-[18px]">
        Fazer login no 1kole
      </h1>

      <!-- Formulário -->
      <div class="w-full flex flex-col">
        <!-- Campo de identificação -->
        <div class="mb-4">
          <Input @update:model-value="validateIdentifier" v-model="identifier" title="E-mail" label="identifier"
            placeholder="O seu e-mail" :error="identifierError" />
        </div>

        <div class="mb-4">
          <!-- Campo de senha -->
          <Input @update:model-value="validatePassword" v-model="password" title="Senha" label="password"
            type="password" :error="passwordError" placeholder="A sua senha" />
        </div>


        <router-link class="dark:text-[#b1b3b6] whitespace-nowrap max-w-min text-xs" to="/auth/forgot-password" :disabled="isLoggingIn">
          Esqueceu a senha?
        </router-link>
      </div>
    </div>

    <!-- Toast de erro (aparece de baixo com animação) -->
    <Toast :show="toast.show" :type="toast.type" :message="toast.message" />
  </div>
</template>
