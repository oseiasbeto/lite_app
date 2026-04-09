<template>
    <div>
        <div class="flex justify-between">
            <span @click="router.back()">X</span>
            <button :disabled="!canSubmit" @click="handleSubmit">Editar</button>
        </div>
        <template v-if="editForm == 'picture'">
            <div class="picture-editor">
                <p class="mb-4 text-center text-lg font-medium">Editar foto de perfil</p>

                <!-- Preview da imagem -->
                <div class="flex flex-col items-center gap-4">
                    <div class="relative">
                        <img :src="imagePreview" alt="Preview"
                            class="w-32 h-32 rounded-full object-cover border-2 dark:border-[rgb(57,56,57)]" />
                        <label for="picture-upload"
                            class="absolute dark:bg-[#202020] bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                            title="Alterar foto">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </label>
                        <input id="picture-upload" type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" @change="handleFileSelect"
                            class="hidden" />
                    </div>

                    <!-- Botão remover foto -->
                    <button v-if="hasExistingPicture || selectedFile" @click="removePicture"
                        class="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        :disabled="uploading">
                        Remover foto atual
                    </button>

                    <!-- Barra de progresso -->
                    <div v-if="uploading" class="w-full max-w-xs">
                        <div class="dark:bg-[rgb(57,56,57)] rounded-full h-2 overflow-hidden">
                            <div class="bg-blue h-2 transition-all duration-300"
                                :style="{ width: `${uploadProgress}%` }"></div>
                        </div>
                        <p class="text-xs text-gray-500 text-center mt-1">{{ uploadProgress }}%</p>
                    </div>

                    <!-- Mensagens de erro -->
                    <div v-if="pictureError.show" class="text-red-500 text-sm text-center">
                        {{ pictureError.message }}
                    </div>
                </div>
            </div>
        </template>
        <template v-else-if="editForm == 'name'">
            <Input @update:model-value="validateName" v-model="form.name" title="Nome" label="name"
                :error="nameError" />
        </template>
        <template v-else-if="editForm == 'credentials'">
            <Input @update:model-value="validateCredentials" v-model="form.credentials" title="Credencial"
                label="credentials" :error="credentialsError" />
        </template>
        <template v-else-if="editForm == 'location'">
            <Input @update:model-value="validateLocation" v-model="form.location" title="Localização" label="location"
                :error="locationError" />
        </template>
        <template v-else-if="editForm == 'bio'">
            <Textarea @update:model-value="validateBio" v-model="form.bio" title="Biografia" label="bio"
                :error="bioError" />
        </template>
        <template v-else>
            <p>Formulário não encontrado.</p>
        </template>
    </div>
</template>

<script setup>
import Input from '@/views/auth/components/Input.vue';
import Textarea from '@/views/auth/components/Textarea.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const route = useRoute()
const router = useRouter()
const store = useStore()

const editForm = computed(() => route.query?.edit_form || null)
const profile = computed(() => store.getters.currentProfile)

const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

const form = ref({
    name: profile.value?.name || '',
    credentials: profile.value?.credentials || '',
    location: profile.value?.location || '',
    bio: profile.value?.bio || ''
})

// Configurações Cloudinary
const CLOUD_NAME = 'daujoblcc'
const UPLOAD_PRESET = 'social_media_upload'
const API_KEY = '686559434489718'; // Substitua pelo sua API Key do Cloudinary
const API_SECRET = 'oAYl12OIZf2HkieFNDQQk2romHM'; // Substitua pelo seu API Secret do Cloudinary

// Estado da imagem
const selectedFile = ref(null)
const imagePreview = ref(profile.value?.profile_image?.url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png')
const originalPicturePublicId = ref(profile?.value?.profile_image?.public_id || null)
const hasExistingPicture = ref(!!profile.value?.profile_image?.url)
const pictureToRemove = ref(false)
const pictureError = ref({ show: false, message: '' })

// Extrair public_id da URL do Cloudinary
const extractPublicIdFromUrl = (url) => {
    if (!url) return null
    // Padrão para URL do Cloudinary: https://res.cloudinary.com/cloud_name/image/upload/.../public_id
    const match = url.match(/\/upload\/(?:v\d+\/)?([^/.]+)(?:\.[^.]+)?$/)
    return match ? match[1] : null
}

// Inicializar public_id da foto atual
if (profile.value?.picture) {
    originalPicturePublicId.value = extractPublicIdFromUrl(profile.value.picture)
}

// Validação de segurança do arquivo
const validateImageFile = (file) => {
    // Tipos de imagem permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']

    // Verificar tipo MIME
    if (!allowedTypes.includes(file.type)) {
        pictureError.value = {
            show: true,
            message: 'Formato inválido. Use apenas imagens (JPEG, PNG, GIF, WEBP)'
        }
        return false
    }

    // Verificar extensão do arquivo
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
        pictureError.value = {
            show: true,
            message: 'Extensão de arquivo inválida'
        }
        return false
    }

    // Verificar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB em bytes
    if (file.size > maxSize) {
        pictureError.value = {
            show: true,
            message: 'A imagem deve ter no máximo 5MB'
        }
        return false
    }

    // Verificar dimensões da imagem (opcional, para evitar imagens muito grandes)
    return new Promise((resolve) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(objectUrl)
            // Limite de 4096x4096 pixels
            if (img.width > 4096 || img.height > 4096) {
                pictureError.value = {
                    show: true,
                    message: 'A imagem não pode ter dimensões maiores que 4096x4096 pixels'
                }
                resolve(false)
            } else {
                resolve(true)
            }
        }

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            pictureError.value = {
                show: true,
                message: 'Arquivo de imagem inválido ou corrompido'
            }
            resolve(false)
        }

        img.src = objectUrl
    })
}

// Função para deletar imagem do Cloudinary
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return true

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = CryptoJS.SHA1(signatureString).toString(); // Usar crypto-js para SHA-1

    await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
        {
            public_id: publicId,
            api_key: API_KEY,
            timestamp: timestamp,
            signature: signature,
        }
    );
}

// Upload para Cloudinary
const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('cloud_name', CLOUD_NAME)
    formData.append('folder', 'profile_pictures')

    // Adicionar timestamp e nome único
    const publicId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    formData.append('public_id', publicId)

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData,
            {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    uploadProgress.value = progress
                },
            }
        )

        if (!response.data) {
            throw new Error('Erro no upload')
        }

        return {
            public_id: response.data.public_id,
            url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_80,w_500,c_fill/${response.data.public_id}`,
            secure_url: response.data.secure_url
        }
    } catch (error) {
        console.error('Erro no upload para Cloudinary:', error)
        throw new Error('Falha ao fazer upload da imagem')
    }
}

// Manipular seleção de arquivo
const handleFileSelect = async (event) => {
    const file = event.target.files[0]

    if (!file) return

    // Resetar erro
    pictureError.value = { show: false, message: '' }

    // Validar arquivo
    const isValid = await validateImageFile(file)
    if (!isValid) {
        event.target.value = '' // Limpar input
        return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
        imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    selectedFile.value = file
    pictureToRemove.value = false
}

// Remover foto
const removePicture = async () => {
    if (hasExistingPicture.value && originalPicturePublicId.value) {
        pictureToRemove.value = true
        selectedFile.value = null
        imagePreview.value = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
        pictureError.value = { show: false, message: '' }
        await deleteFromCloudinary(originalPicturePublicId.value)
    } else if (selectedFile.value) {
        selectedFile.value = null
        imagePreview.value = profile.value?.picture || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
        pictureError.value = { show: false, message: '' }
    }
}

const nameError = ref({ show: false, message: '' })
const credentialsError = ref({ show: false, message: '' })
const locationError = ref({ show: false, message: '' })
const bioError = ref({ show: false, message: '' })

const canSubmit = computed(() => {
    if (editForm.value === 'picture') {
        // Para edição de foto, pode submeter se:
        // - Não está fazendo upload
        // - E (selecionou um arquivo OU marcou para remover)
        return !uploading.value && (selectedFile.value !== null || pictureToRemove.value)
    }

    const isSameName = form.value?.name === profile.value.name
    const isSameCredentials = form.value?.credentials === profile.value.credentials
    const isSameLocation = form.value?.location === profile.value.location
    const isSameBio = form.value?.bio === profile.value.bio

    if (nameError.value.show || credentialsError.value.show || locationError.value.show || bioError.value.show ||
        (isSameName && editForm.value === 'name') ||
        (isSameCredentials && editForm.value === 'credentials') ||
        (isSameLocation && editForm.value === 'location') ||
        (isSameBio && editForm.value === 'bio')) {
        return false
    }
    return true
})

function validateName() {
    const value = form.value.name.trim()
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

function validateCredentials() {
    const value = form.value.credentials.trim()

    if (!value) {
        credentialsError.value = { show: true, message: 'A credencial é obrigatória.' }
        return false
    }
    else if (value.length > 20) {
        credentialsError.value = { show: true, message: 'A credencial deve ter no máximo 20 caracteres.' }
        return false
    }
    credentialsError.value = { show: false, message: '' }
    return true
}

function validateLocation() {
    const value = form.value?.location?.trim()

    if (!value) {
        locationError.value = { show: true, message: 'A localização é obrigatória.' }
        return false
    }
    else if (value.length > 30) {
        locationError.value = { show: true, message: 'A localização deve ter no máximo 30 caracteres.' }
        return false
    }
    locationError.value = { show: false, message: '' }
    return true
}

function validateBio() {
    const value = form.value.bio.trim()
    if (value.length > 200) {
        bioError.value = { show: true, message: 'A biografia deve ter no máximo 200 caracteres.' }
        return false
    }
    bioError.value = { show: false, message: '' }
    return true
}

const handleSubmit = async () => {
    if (!canSubmit.value) return

    if (editForm.value === 'picture') {
        await handlePictureSubmit()
    } else {
        await handleProfileSubmit()
    }
}

const handlePictureSubmit = async () => {
    loading.value = true
    let newPictureUrl = null

    try {

        // Se o usuário selecionou uma nova foto
        if (selectedFile.value) {
            uploading.value = true
            uploadProgress.value = 0

            // Se já existe uma foto, deletar primeiro
            if (originalPicturePublicId.value) {
                await deleteFromCloudinary(originalPicturePublicId.value)
            }

            // Upload da nova foto
            const uploadResult = await uploadToCloudinary(selectedFile.value)
            newPictureUrl = uploadResult.url
        }

        // Atualizar perfil com a nova foto (ou null se removeu)
        await store.dispatch('updateProfile', {
            ...form.value,
            picture: newPictureUrl
        })

        router.back()
    } catch (error) {
        console.error('Erro ao atualizar foto:', error)
        pictureError.value = {
            show: true,
            message: error.message || 'Erro ao processar a imagem. Tente novamente.'
        }
    } finally {
        loading.value = false
        uploading.value = false
        uploadProgress.value = 0
    }
}

const handleProfileSubmit = async () => {
    loading.value = true
    try {
        await store.dispatch('updateProfile', form.value)
        router.back()
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.picture-editor {
    padding: 20px;
    max-width: 400px;
    margin: 0 auto;
}
</style>