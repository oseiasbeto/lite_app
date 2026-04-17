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
const newPassword = ref('')
const confirmPassword = ref('')
const verificationCode = ref('')

const emailError = ref({ show: false, message: '' })
const newPasswordError = ref({ show: false, message: '' })
const confirmError = ref({ show: false, message: '' })
const codeError = ref({ show: false, message: '' })

const isCheckingEmail = ref(false)
const isRedirectingFromLogin = ref(false)
const isResetingPassword = ref(false)
const isResendingCode = ref(false)
const isVerifyingCode = ref(false)

const toast = ref({
    show: false,
    message: "",
    type: undefined
})


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
    const value = newPassword.value.trim()
    if (!value) {
        newPasswordError.value = { show: true, message: 'Nova senha é obrigatória.' }
        return false
    }
    if (value.length < 8) {
        newPasswordError.value = { show: true, message: 'A nova senha deve ter pelo menos 8 caracteres.' }
        return false
    }
    // Validação adicional: deve conter letra maiúscula, minúscula, número e caractere especial
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        newPasswordError.value = { show: true, message: 'A senha deve conter letra maiúscula, minúscula, número e caractere especial.' }
        return false
    }
    newPasswordError.value = { show: false, message: '' }
    return true
}

function validateConfirmPassword() {
    if (newPassword.value !== confirmPassword.value) {
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
        valid = validateEmail()
        if (!valid) return
        isCheckingEmail.value = true
        try {
            await store.dispatch("forgotPassword", email.value)
            step.value = 2
        } catch (err) {
            email.value = ""
            name.value = ""
            toast.value.message = err.response?.data?.message || 'Erro ao verificar o e-mail'
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
            await store.dispatch('verifyResetPasswordCode', payload)
            step.value = 3
        } catch (err) {
            verificationCode.value = ""
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
        isResetingPassword.value = true
        try {
            await store.dispatch("resetPassword", {
                code: verificationCode.value,
                email: email.value,
                newPassword: newPassword.value
            })

            // Sucesso
            toast.value.message = 'Senha redifinida!'
            toast.value.show = true
            isRedirectingFromLogin.value = true
            setTimeout(() => {
                router.push({ name: 'SignIn' })
            }, 2000)

        } catch (err) {
            newPassword.value = ""
            confirmPassword.value = ""
            toast.value.message = err.response?.data?.message || 'Erro ao redefinir senha.'
            toast.value.show = true
            toast.value.type = 'error'
            setTimeout(() => { toast.value.show = false; toast.value.type = undefined }, 3000)
        } finally {
            isResetingPassword.value = false
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
        <div class="sticky px-4 py-4 flex items-center flex-row">
            <div class="flex-1 mr-2">
                <!-- Botão X no topo esquerdo para voltar/fechar -->
                <button @click="handleClose" class="focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="shrink-0">
                <SecondaryButton v-if="step == 1" @on-press="handleNext" :disabled="!email.trim() || emailError?.show"
                    :loading="isCheckingEmail" text="Enviar" />
                <SecondaryButton v-if="step == 2" @on-press="handleNext" :loading="isVerifyingCode"
                    :disabled="!verificationCode.trim() || isVerifyingCode || codeError?.show" text="Verificar" />

                <SecondaryButton v-if="step == 3" @on-press="handleNext" :disabled="!newPassword.trim() || !confirmPassword.trim() || newPasswordError?.show || confirmError?.show"
                        :loading="isResetingPassword || isRedirectingFromLogin" text="Redefinir" />
            </div>
        </div>

        <!-- Conteúdo -->
        <div class="flex-1 flex overflow-y-scroll pb-4 flex-col px-4">
            <!-- Título dinâmico -->
            <h1 class="text-xl text-[rgb(40,40,41)] dark:text-inherit font-bold mb-4">
                {{ step === 1 ? 'Encontrar sua conta' : step === 2 ? 'Verifique o seu e-mail' : 'Redefinir a senha' }}
            </h1>

            <!-- Formulário -->
            <div class="w-full flex flex-col">
                <template v-if="step === 1">
                    <Input @update:model-value="validateEmail" v-model="email" title="E-mail" label="email"
                        placeholder="O seu e-mail" type="email" :error="emailError" />
                </template>

                <template v-else-if="step === 2">
                    <!-- Campo de código -->
                    <Input @update:model-value="validateCode" v-model="verificationCode"
                        title="Código de verificação (6 dígitos)" label="code" :error="codeError" />
                    <!-- Botão Verificar -->
                </template>

                <template v-else-if="step === 3">
                    <div class="mb-4">
                        <Input @update:model-value="validatePassword" v-model="newPassword" title="Nova senha"
                            label="password" type="password" :error="newPasswordError" />
                    </div>
                    <div class="mb-4">
                        <Input @update:model-value="validateConfirmPassword" v-model="confirmPassword"
                            title="Confirme a nova senha" label="confirm" type="password" :error="confirmError" />
                    </div>

                </template>
            </div>
        </div>

        <!-- Toast -->
        <Toast :show="toast.show" :message="toast.message" :type="toast.type" />
    </div>
</template>