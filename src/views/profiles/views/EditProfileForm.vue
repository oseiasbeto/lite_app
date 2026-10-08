<template>
    <div class="tt-page [--tt-bg:#ffffff] [--tt-text:#161823] [--tt-text-2:rgba(22,24,35,0.6)] [--tt-text-3:rgba(22,24,35,0.34)] [--tt-field:rgba(22,24,35,0.06)] [--tt-line:rgba(22,24,35,0.12)] dark:[--tt-bg:#000000] dark:[--tt-text:#ffffff] dark:[--tt-text-2:rgba(255,255,255,0.6)] dark:[--tt-text-3:rgba(255,255,255,0.34)] dark:[--tt-field:rgba(255,255,255,0.12)] dark:[--tt-line:rgba(255,255,255,0.12)]">
        <!--start header-->
        <header class="tt-header">
            <button :disable="loading || uploading" class="tt-header__back" aria-label="Voltar" @click="router.back()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m15 5-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>

            <h1 class="tt-header__title">{{ pageTitle }}</h1>

            <button class="tt-save" :disabled="!canSubmit || loading || uploading" @click="handleSubmit">
                <span v-if="loading || uploading" class="tt-save__spinner" aria-hidden="true"></span>
                <span v-else>Salvar</span>
            </button>
        </header>
        <!--end header-->

        <main class="tt-content">
            <!-- FOTO -->
            <template v-if="editForm == 'picture'">
                <section class="tt-picture">
                    <div :class="{ 'pointer-events-none': loadingRemovePicture }" class="tt-picture__wrap">
                        <img :src="imagePreview" alt="Preview" class="tt-picture__img" />
                        <label for="picture-upload" class="tt-picture__overlay" title="Alterar foto">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path
                                    d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                                <circle cx="12" cy="13" r="3" />
                            </svg>
                        </label>
                        <input id="picture-upload" ref="fileInput" type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" @change="handleFileSelect"
                            class="hidden" />
                    </div>

                    <label for="picture-upload" class="tt-picture__change">Alterar foto</label>

                    <!-- Botão remover foto -->
                    <button v-if="!loadingRemovePicture && !uploading && (originalPicturePublicId || selectedFile)"
                        @click="removePicture" class="tt-picture__remove" :disabled="uploading">
                        Remover foto atual
                    </button>

                    <!-- Barra de progresso -->
                    <div v-if="uploading" class="tt-progress">
                        <div class="tt-progress__track">
                            <div class="tt-progress__bar" :style="{ width: `${uploadProgress}%` }"></div>
                        </div>
                        <p class="tt-progress__label">{{ uploadProgress }}%</p>
                    </div>

                    <!-- Mensagens de erro -->
                    <p v-if="pictureError.show" class="tt-error">{{ pictureError.message }}</p>
                </section>
            </template>

            <!-- NOME -->
            <template v-else-if="editForm == 'name'">
                <section class="tt-section">
                    <p class="tt-section__desc">Altere seu nome quantas vezes quiser.</p>
                    <div class="tt-field">
                        <Input @update:model-value="validateName" v-model="form.name" title="Nome" label="name"
                            :error="nameError" />
                        <span class="tt-counter">{{ (form.name || '').length }}/20</span>
                    </div>
                </section>
            </template>

            <!-- CREDENCIAL -->
            <template v-else-if="editForm == 'credentials'">
                <section class="tt-section">
                    <p class="tt-section__desc">Adicione uma credencial para mostrar quem você é no seu perfil.</p>
                    <div class="tt-field">
                        <Input @update:model-value="validateCredentials" v-model="form.credentials"
                            title="Credencial" label="credentials" :error="credentialsError" />
                        <span class="tt-counter">{{ (form.credentials || '').length }}/20</span>
                    </div>
                </section>
            </template>

            <!-- LOCALIZAÇÃO -->
            <template v-else-if="editForm == 'location'">
                <section class="tt-section">
                    <p class="tt-section__desc">Diga de onde você é.</p>
                    <div class="tt-field">
                        <Input @update:model-value="validateLocation" v-model="form.location" title="Localização"
                            label="location" :error="locationError" />
                        <span class="tt-counter">{{ (form.location || '').length }}/30</span>
                    </div>
                </section>
            </template>

            <!-- BIO -->
            <template v-else-if="editForm == 'bio'">
                <section class="tt-section">
                    <p class="tt-section__desc">Conte um pouco sobre você.</p>
                    <div class="tt-field">
                        <Textarea @update:model-value="validateBio" v-model="form.bio" title="Biografia" label="bio"
                            :error="bioError" />
                        <span class="tt-counter">{{ (form.bio || '').length }}/200</span>
                    </div>
                </section>
            </template>

            <!-- TEMA -->
            <template v-else-if="editForm == 'theme'">
                <section class="tt-section">
                    <p class="tt-section__desc">Ajuste a maneira em que você gostaria que o tema apareça no seu App.
                    </p>

                    <div class="tt-themes" role="radiogroup" aria-label="Tema">
                        <label v-for="opt in themeOptions" :key="opt.value" :for="opt.id" class="tt-theme"
                            :class="{ 'is-active': form.theme === opt.value }">
                            <input class="hidden" type="radio" :id="opt.id" :value="opt.value"
                                v-model="form.theme" />

                            <div class="tt-theme__preview" :class="`is-${opt.value}`" aria-hidden="true">
                                <span class="tt-theme__bar"></span>
                                <span class="tt-theme__card"></span>
                                <span class="tt-theme__card"></span>
                                <span class="tt-theme__fab"></span>
                            </div>

                            <div class="tt-theme__footer">
                                <span class="tt-theme__radio">
                                    <svg v-if="form.theme === opt.value" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none">
                                        <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <span class="tt-theme__name">{{ opt.label }}</span>
                            </div>
                        </label>
                    </div>
                </section>
            </template>

            <template v-else>
                <p class="tt-empty">Formulário não encontrado.</p>
            </template>
        </main>

        <!-- Recorte da foto (estilo TikTok) -->
        <ImageCropper v-if="showCropper && cropSrc" :src="cropSrc" :file-name="pendingFileName"
            @cancel="closeCropper" @done="onCropDone" />
    </div>
</template>

<script setup>
import Input from '@/views/auth/components/Input.vue';
import Textarea from '@/views/auth/components/Textarea.vue';
import ImageCropper from '@/components/UI/Imagecropper.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { logger } from '@/utils/logger';
import Cookies from "js-cookie";
import { statusBar } from "webtonative"

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
    bio: profile.value?.bio || '',
    theme: profile.value?.settings?.theme || 'system'
})

// (visual) título do cabeçalho e opções de tema
const pageTitle = computed(() => ({
    picture: 'Editar foto de perfil',
    name: 'Nome',
    credentials: 'Credencial',
    location: 'Localização',
    bio: 'Descrição',
    theme: 'Tema'
}[editForm.value] || 'Editar perfil'))

const themeOptions = [
    { value: 'light', id: 'themeLight', label: 'Claro' },
    { value: 'dark', id: 'themeDark', label: 'Escuro' },
    { value: 'system', id: 'themeSystem', label: 'Sistema' }
]

// Configurações Cloudinary
const CLOUD_NAME = 'daujoblcc'
const UPLOAD_PRESET = 'social_media_upload'
const API_KEY = 'MANTENHA_SEU_VALOR_ATUAL'; // ⚠️ idealmente mover para o backend
const API_SECRET = 'MANTENHA_SEU_VALOR_ATUAL'; // ⚠️ NUNCA deixe o secret no front-end

// Estado da imagem
const selectedFile = ref(null)
const imagePreview = ref(profile.value?.profile_image?.url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png')
const originalPicturePublicId = ref(profile?.value?.profile_image?.public_id || null)
const hasExistingPicture = ref(!!profile.value?.profile_image?.url)
const loadingRemovePicture = ref(false)
const pictureError = ref({ show: false, message: '' })
const nameError = ref({ show: false, message: '' })
const credentialsError = ref({ show: false, message: '' })
const locationError = ref({ show: false, message: '' })
const bioError = ref({ show: false, message: '' })

// Estado do cropper
const fileInput = ref(null)
const showCropper = ref(false)
const cropSrc = ref(null)
const pendingFileName = ref('profile.jpg')

const canSubmit = computed(() => {
    if (editForm.value === 'picture') {
        // Habilita apenas se uma nova imagem foi selecionada e não está fazendo upload
        return !uploading.value && selectedFile.value !== null;
    }

    const isSameName = form.value?.name === profile.value.name;
    const isSameCredentials = form.value?.credentials === profile.value.credentials;
    const isSameLocation = form.value?.location === profile.value.location;
    const isSameBio = form.value?.bio === profile.value.bio;
    const isSameTheme = form.value?.theme === profile.value?.settings?.theme;

    if (
        nameError.value.show ||
        credentialsError.value.show ||
        locationError.value.show ||
        bioError.value.show ||
        (isSameName && editForm.value === 'name') ||
        (isSameCredentials && editForm.value === 'credentials') ||
        (isSameLocation && editForm.value === 'location') ||
        (isSameTheme && editForm.value === 'theme') ||
        (isSameBio && editForm.value === 'bio')
    ) {
        return false;
    }
    return true;
});

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

    logger.log('Iniciando deleção da imagem do Cloudinary com public_id:', publicId)
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
    ).then(async response => {
        if (response.data.result === 'ok') {
            logger.log('Imagem deletada com sucesso do Cloudinary:', response.data)
        } else {
            console.warn('Falha ao deletar imagem do Cloudinary:', response.data)
        }
    }).catch(error => {
        console.error('Erro ao deletar imagem do Cloudinary:', error)
    })
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

// Manipular seleção de arquivo (agora abre o cropper depois de validar)
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

    // Abrir o cropper com a imagem escolhida
    pendingFileName.value = file.name
    cropSrc.value = URL.createObjectURL(file)
    showCropper.value = true
}

// Fechar cropper (cancelar ou concluir)
const closeCropper = () => {
    if (cropSrc.value) URL.revokeObjectURL(cropSrc.value)
    cropSrc.value = null
    showCropper.value = false
    if (fileInput.value) fileInput.value.value = '' // permite escolher o mesmo arquivo de novo
}

// Recorte concluído: o arquivo recortado segue o mesmo fluxo de antes
const onCropDone = (croppedFile) => {
    if (imagePreview.value?.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = URL.createObjectURL(croppedFile)
    selectedFile.value = croppedFile
    loadingRemovePicture.value = false
    closeCropper()
}

// Remover foto
const removePicture = async () => {
    loadingRemovePicture.value = true
    if (hasExistingPicture.value && originalPicturePublicId.value) {
        selectedFile.value = null
        imagePreview.value = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
        pictureError.value = { show: false, message: '' }

        await deleteFromCloudinary(originalPicturePublicId.value)
            .then(async () => {
                await handlePictureSubmit()
                    .finally(() => {
                        loadingRemovePicture.value = false
                        originalPicturePublicId.value = null
                    })
                // Continuar com a submissão do perfil após deletar a imagem
            })
    } else if (selectedFile.value) {
        selectedFile.value = null
        imagePreview.value = profile.value?.picture || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
        pictureError.value = { show: false, message: '' }
        loadingRemovePicture.value = false
    }
}

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

                logger.log('Deletando foto antiga do Cloudinary com public_id:', originalPicturePublicId.value)
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

        if (newPictureUrl) {
            router.back()
        }

    } catch (error) {
        logger.error('Erro ao atualizar foto:', error)
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
            .then(() => {
                if (editForm.value === 'theme') {
                    setThemeColor(form.value.theme)
                }
            })
        // router.back()
    } catch (error) {
        logger.error('Erro ao atualizar perfil:', error)
    } finally {
        loading.value = false
    }
}

const setThemeColor = (theme) => {
    // Salvar preferência
    if (form.value.theme !== theme) {
        Cookies.set('theme', theme)
        form.value.theme = theme
    }

    store.commit("SET_CURRENT_THEME", theme)

    // Aplicar classe no HTML
    if (form.value.theme === 'dark') {
        //window?.WTN?.setNavigationBarColor({ color: "#000000" });
        window?.WTN.statusBar({
            style: 'light',
            color: '000000',
            overlay: false //Only for android
        });
        // Aplicar tema escuro  
        document.documentElement.classList.add('dark');
    } else if (form.value.theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (isDark) {
            //window?.WTN?.setNavigationBarColor({ color: "#000000" });
            window?.WTN.statusBar({
                style: 'light',
                color: '000000',
                overlay: false //Only for android
            });
            
            document.documentElement.classList.add('dark');
        } else {
            window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" });
            window?.WTN.statusBar({
                style: 'dark',
                color: "FFFFFF",
                overlay: false //Only for android
            });
            document.documentElement.classList.remove('dark');
        }
    } else {
        //window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" });
        window?.WTN.statusBar({
            style: 'dark',
            color: "FFFFFF",
            overlay: false //Only for android
        });
        // Aplicar tema claro
        document.documentElement.classList.remove('dark');

    }
}
</script>

<style scoped>
/* Cores claro/escuro vêm das classes Tailwind (dark:) no elemento raiz */
.tt-page {
    --tt-red: #fe2c55;
    --tt-red-press: #e0264b;

    min-height: 100vh;
    min-height: 100dvh;
    background: var(--tt-bg);
    color: var(--tt-text);
    font-family: 'Proxima Nova', 'TikTokFont', 'Helvetica Neue', Arial, sans-serif;
}

/* ====== Header ====== */
.tt-header {
    position: sticky;
    top: 0;
    z-index: 100;
    display: grid;
    grid-template-columns: 72px 1fr 72px;
    align-items: center;
    height: 52px;
    padding: 0 8px;
    background: var(--tt-bg);
    border-bottom: 1px solid var(--tt-line);
}

.tt-header__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--tt-text);
    cursor: pointer;
}

.tt-header__back:active {
    background: var(--tt-field);
}

.tt-header__title {
    margin: 0;
    text-align: center;
    font-size: 17px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tt-save {
    justify-self: end;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 64px;
    height: 32px;
    padding: 0 14px;
    border: 0;
    border-radius: 4px;
    background: var(--tt-red);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease;
}

.tt-save:active:not(:disabled) {
    background: var(--tt-red-press);
}

.tt-save:disabled {
    background: var(--tt-field);
    color: var(--tt-text-3);
    cursor: default;
}

.tt-save__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: tt-spin 0.7s linear infinite;
}

.tt-header__back:focus-visible,
.tt-save:focus-visible {
    outline: 2px solid var(--tt-red);
    outline-offset: 2px;
}

/* ====== Conteúdo ====== */
.tt-content {
    max-width: 480px;
    margin: 0 auto;
    padding: 24px 16px 40px;
}

.tt-section__desc {
    margin: 0 0 20px;
    font-size: 14px;
    line-height: 1.45;
    color: var(--tt-text-2);
}

.tt-empty {
    text-align: center;
    color: var(--tt-text-2);
}

/* ====== Campos (envolve os componentes Input/Textarea existentes) ====== */
.tt-field {
    position: relative;
}

.tt-field :deep(label) {
    font-size: 13px;
    font-weight: 600;
    color: var(--tt-text-2);
}

.tt-field :deep(input),
.tt-field :deep(textarea) {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid transparent !important;
    border-radius: 4px !important;
    background: var(--tt-field) !important;
    color: var(--tt-text) !important;
    font-size: 16px;
    outline: none;
    caret-color: var(--tt-red);
    transition: border-color 0.15s ease;
}

.tt-field :deep(input:focus),
.tt-field :deep(textarea:focus) {
    border-color: var(--tt-red) !important;
}

.tt-field :deep(textarea) {
    min-height: 120px;
    resize: none;
}

.tt-counter {
    display: block;
    margin-top: 6px;
    text-align: right;
    font-size: 12px;
    color: var(--tt-text-3);
}

/* ====== Foto de perfil ====== */
.tt-picture {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding-top: 16px;
}

.tt-picture__wrap {
    position: relative;
    width: 120px;
    height: 120px;
}

.tt-picture__img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: var(--tt-field);
}

.tt-picture__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    cursor: pointer;
}

.tt-picture__overlay:active {
    background: rgba(0, 0, 0, 0.55);
}

.tt-picture__change {
    font-size: 15px;
    font-weight: 600;
    color: var(--tt-red);
    cursor: pointer;
}

.tt-picture__remove {
    border: 0;
    background: none;
    padding: 4px 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--tt-text-2);
    cursor: pointer;
}

.tt-picture__remove:disabled {
    opacity: 0.5;
}

.tt-progress {
    width: 100%;
    max-width: 280px;
}

.tt-progress__track {
    height: 4px;
    border-radius: 2px;
    background: var(--tt-field);
    overflow: hidden;
}

.tt-progress__bar {
    height: 100%;
    background: var(--tt-red);
    transition: width 0.3s ease;
}

.tt-progress__label {
    margin: 6px 0 0;
    text-align: center;
    font-size: 12px;
    color: var(--tt-text-2);
}

.tt-error {
    margin: 0;
    text-align: center;
    font-size: 13px;
    color: var(--tt-red);
}

/* ====== Tema ====== */
.tt-themes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.tt-theme {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 8px;
    border: 2px solid transparent;
    border-radius: 8px;
    background: var(--tt-field);
    cursor: pointer;
    transition: border-color 0.15s ease;
}

.tt-theme.is-active {
    border-color: var(--tt-red);
}

.tt-theme__preview {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 5px;
    aspect-ratio: 154 / 230;
    padding: 8px 6px;
    border-radius: 4px;
    overflow: hidden;
}

.tt-theme__preview.is-light { background: #f1f1f2; }
.tt-theme__preview.is-dark { background: #121212; }
.tt-theme__preview.is-system { background: linear-gradient(90deg, #f1f1f2 50%, #121212 50%); }

.tt-theme__bar,
.tt-theme__card {
    display: block;
    border-radius: 3px;
}

.tt-theme__bar { height: 8px; }
.tt-theme__card { flex: 1; }

.is-light .tt-theme__bar,
.is-light .tt-theme__card { background: #ffffff; }

.is-dark .tt-theme__bar,
.is-dark .tt-theme__card { background: #262626; }

.is-system .tt-theme__bar,
.is-system .tt-theme__card {
    background: linear-gradient(90deg, #ffffff 50%, #262626 50%);
}

.tt-theme__fab {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--tt-red);
}

.tt-theme__footer {
    display: flex;
    align-items: center;
    gap: 6px;
}

.tt-theme__radio {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: 2px solid var(--tt-text-3);
    border-radius: 50%;
    color: #fff;
    transition: background 0.15s ease, border-color 0.15s ease;
}

.tt-theme.is-active .tt-theme__radio {
    background: var(--tt-red);
    border-color: var(--tt-red);
}

.tt-theme__name {
    font-size: 14px;
    font-weight: 600;
}

@keyframes tt-spin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .tt-save__spinner { animation-duration: 1.5s; }
    .tt-progress__bar,
    .tt-theme,
    .tt-theme__radio { transition: none; }
}
</style>