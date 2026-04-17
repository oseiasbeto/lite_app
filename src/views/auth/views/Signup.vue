<script setup>
import { ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
import Input from '../components/Input.vue'
import ButtonPrimary from '../components/ButtonPrimary.vue'
import ButtonSecondary from '../components/ButtonSecondary.vue'
import Toast from '@/components/UI/Toast.vue'
import SecondaryButton from '@/components/buttons/SecondaryButton.vue'

const router = useRouter()
const store = useStore()

const step = ref(1)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const verificationCode = ref('')

const nameError = ref({ show: false, message: '' })
const emailError = ref({ show: false, message: '' })
const passwordError = ref({ show: false, message: '' })
const confirmError = ref({ show: false, message: '' })
const codeError = ref({ show: false, message: '' })

const isCheckingEmail = ref(false)
const isRedirectingFromHome = ref(false)
const isSigningUp = ref(false)
const isResendingCode = ref(false)
const isVerifyingCode = ref(false)

const toast = ref({
  show: false,
  message: "",
  type: undefined
})

function validateName() {
  const value = name.value.trim()
  if (!value) {
    nameError.value = { show: true, message: 'O nome é obrigatório.' }
    return false
  }
  if (value.length < 2) {
    nameError.value = { show: true, message: 'O nome deve ter pelo menos 2 caracteres.' }
    return false
  }
  if (value.length > 20) {
    nameError.value = { show: true, message: 'O nome deve ter no máximo 20 caracteres.' }
    return false
  }
  nameError.value = { show: false, message: '' }
  return true
}

function validateEmail() {
  const value = email.value.trim()
  if (!value) {
    emailError.value = { show: true, message: 'O e-mail é obrigatório.' }
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    emailError.value = { show: true, message: 'Insira um e-mail válido.' }
    return false
  }
  emailError.value = { show: false, message: '' }
  return true
}

function validatePassword() {
  const value = password.value.trim()
  if (!value) {
    passwordError.value = { show: true, message: 'A senha é obrigatória.' }
    return false
  }
  if (value.length < 8) {
    passwordError.value = { show: true, message: 'A senha deve ter pelo menos 8 caracteres.' }
    return false
  }
  // Validação adicional: deve conter letra maiúscula, minúscula, número e caractere especial
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    passwordError.value = { show: true, message: 'A senha deve conter letra maiúscula, minúscula, número e caractere especial.' }
    return false
  }
  passwordError.value = { show: false, message: '' }
  return true
}

function validateConfirmPassword() {
  if (password.value !== confirmPassword.value) {
    confirmError.value = { show: true, message: 'As senhas não coincidem.' }
    return false
  }
  confirmError.value = { show: false, message: '' }
  return true
}

function validateCode() {
  const value = verificationCode.value.trim()
  if (!value) {
    codeError.value = { show: true, message: 'O código de verificação é obrigatório.' }
    return false
  }
  if (value.length !== 6 || !/^\d{6}$/.test(value)) {
    codeError.value = { show: true, message: 'O código deve ter exatamente 6 dígitos numéricos.' }
    return false
  }
  codeError.value = { show: false, message: '' }
  return true
}

async function resendVerificationCode() {
  isResendingCode.value = true
  try {
    // Chame API para enviar código (ajuste endpoint)
    //await store.dispatch('resendEmailCode', { email: email.value })
    toast.value.show = true
    toast.value.message = 'Código enviado para o seu e-mail.'

    setTimeout(() => { toast.value.show = false }, 3000)
  } catch (err) {
    toast.value.message = err.response?.data?.message || 'Erro ao enviar código. Tente novamente.'
    toast.value.show = true
    toast.value.type = 'error'
    setTimeout(() => { toast.value.show = false; toast.value.type = undefined }, 3000)
  } finally {
    isResendingCode.value = false
  }
}

async function handleNext() {
  let valid = true

  if (step.value === 1) {
    valid = validateName() && validateEmail()
    if (!valid) return
    isCheckingEmail.value = true
    try {
      await store.dispatch("register", {
        name: name.value,
        email: email.value
      })
      step.value = 2
    } catch (err) {
      email.value = ""
      name.value = ""
      toast.value.message = err.response?.data?.message || 'Este e-mail já está em uso.'
      toast.value.show = true
      toast.value.type = 'error'
      setTimeout(() => { toast.value.show = false; toast.value.type = undefined }, 3000)
    } finally {
      isCheckingEmail.value = false
    }

  } else if (step.value === 2) {
    valid = validateCode()
    if (!valid) return

    isVerifyingCode.value = true
    try {
      // Verifica código e finaliza registro
      const payload = {
        email: email.value.trim(),
        code: verificationCode.value
      }
      await store.dispatch('verifyEmail', payload)
      step.value = 3
    } catch (err) {
      verificationCode.value = ''
      toast.value.message = err.response?.data?.message || 'Código inválido ou expirado.'
      toast.value.show = true
      toast.value.type = 'error'
      setTimeout(() => { toast.value.show = false; toast.value.type = undefined }, 3000)
    } finally {
      isVerifyingCode.value = false
    }
  } else if (step.value === 3) {
    valid = validatePassword() && validateConfirmPassword()
    if (!valid) return
    isSigningUp.value = true
    try {
      await store.dispatch("completeRegistration", {
        email: email.value,
        password: password.value
      }) // Envia código ao registrar no step 3

      // Sucesso
      isRedirectingFromHome.value = true
      router.push('/home')

    } catch (err) {
      password.value = ""
      confirmPassword.value = ""
      toast.value.message = err.response?.data?.message || 'Erro ao criar conta.'
      toast.value.show = true
      toast.value.type = 'error'
      setTimeout(() => { toast.value.show = false; toast.value.type = undefined }, 3000)
    } finally {
      isSigningUp.value = false
    }
  }
}

function handleBack() {
  if (step.value > 1) {
    step.value--
  } else {
    router.back()
  }
}

function handleClose() {
  router.back()
}

onBeforeRouteLeave((to, from, next) => {
  if (step.value > 1 && step.value < 3) {
    step.value -= 1;
    next(false);
  } else {
    next();
  }
});
</script>

<template>
  <div class="flex flex-col w-full bg-white dark:bg-transparent h-screen text-text-primary relative">
    <!-- Botão X para fechar -->
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
        <SecondaryButton v-if="step == 1" @on-press="handleNext"
          :disabled="!name.trim() || !email.trim() || nameError?.show || emailError?.show" :loading="isCheckingEmail"
          text="Próximo" />
        <SecondaryButton v-if="step == 2" @on-press="handleNext" :loading="isVerifyingCode"
          :disabled="!verificationCode.trim() || isVerifyingCode || codeError?.show" text="Próximo" />
        <SecondaryButton v-if="step == 3" @on-press="handleNext" :disabled="!password.trim() || !confirmPassword.trim() || passwordError?.show || confirmError?.show"
            :loading="isSigningUp" text="Registrar" />
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="flex-1 flex flex-col px-4">

      <!-- Título dinâmico -->
      <h1 class="text-xl text-[rgb(40,40,41)] dark:text-inherit text-left font-bold mb-[18px]">
        {{ step === 1 ? 'Criar sua conta' : step === 2 ? 'Confirme o seu e-mail' : 'Crie uma senha segura' }}
      </h1>

      <!-- Formulário -->
      <div class="w-full max-w-sm flex flex-col gap-5">
        <template v-if="step === 1">
          <div class="mb-1">
            <Input @update:model-value="validateName" placeholder="Como você gostaria de ser chamado?" v-model="name"
              title="Nome" label="name" :error="nameError" />
          </div>

          <Input @update:model-value="validateEmail" placeholder="O seu e-mail" v-model="email" title="E-mail"
            label="email" type="email" :error="emailError" />

        </template>

        <template v-else-if="step === 2">
          <div class="py-1 dark:text-[#d5d6d6]">
            <p>Insira o código que enviamos para </p>
            <p>{{ email }}</p>
          </div>

          <!-- Campo de código -->
          <Input @update:model-value="validateCode" v-model="verificationCode" label="code" :error="codeError" />

          <!-- Botão Resend (com loading) -->
          <button class="dark:text-[#d5d6d6]" @click="resendVerificationCode" :loading="isResendingCode"
            :disabled="isResendingCode">
            Reenviar código
          </button>
        </template>

        <template v-else-if="step === 3">
          <div class="mb-1">
            <Input @update:model-value="validatePassword" v-model="password" title="Senha" label="password"
              type="password" :error="passwordError" />
          </div>

          <div class="mb-1">
            <Input @update:model-value="validateConfirmPassword" v-model="confirmPassword" title="Confirme a senha"
              label="confirm" type="password" :error="confirmError" />
          </div>
        </template>
      </div>
    </div>

    <!-- Toast -->
    <Toast :show="toast.show" :message="toast.message" :type="toast.type" />
  </div>
</template>