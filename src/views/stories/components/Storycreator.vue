<template>
    <Teleport to="body">
        <Transition name="sc">
            <div v-if="open" class="sc-root" role="dialog" aria-modal="true" aria-label="Criar story">
                <div class="sc-card">
                    <!-- Topo -->
                    <header class="sc-top">
                        <button type="button" class="sc-icon" @click="requestClose" :disabled="uploading"
                            aria-label="Fechar">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round">
                                <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        </button>
                        <h2 class="sc-title">{{ mode === 'pick' ? 'Novo story' : 'Pré-visualizar' }}</h2>
                        <button v-if="mode !== 'pick'" type="button" class="sc-icon" @click="reset" :disabled="uploading"
                            aria-label="Voltar">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                        </button>
                        <span v-else class="sc-icon" />
                    </header>

                    <!-- ============ ESCOLHER ============ -->
                    <div v-if="mode === 'pick'" class="sc-pick">
                        <button type="button" class="sc-tile" @click="cameraInput?.click()">
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor"
                                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
                                <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            <span>Câmera</span>
                        </button>
                        <button type="button" class="sc-tile" @click="galleryInput?.click()">
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor"
                                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="16" rx="2" />
                                <circle cx="9" cy="10" r="1.6" />
                                <path d="M21 16l-5-5-8 8" />
                            </svg>
                            <span>Galeria</span>
                        </button>
                        <button type="button" class="sc-tile" @click="startText">
                            <span class="sc-tile__aa">Aa</span>
                            <span>Texto</span>
                        </button>

                        <p v-if="error" class="sc-error" role="alert">{{ error }}</p>

                        <input ref="cameraInput" type="file" accept="image/*,video/*" capture="environment" hidden
                            @change="onFile" />
                        <input ref="galleryInput" type="file" accept="image/*,video/*" hidden @change="onFile" />
                    </div>

                    <!-- ============ EDITAR ============ -->
                    <template v-else>
                        <div class="sc-preview" :style="mode === 'text' ? { background: STORY_BACKGROUNDS[bgKey] } : {}">
                            <img v-if="mode === 'media' && media.type === 'photo'" :src="previewUrl" alt="" />
                            <video v-else-if="mode === 'media'" :src="previewUrl" autoplay loop muted playsinline />

                            <textarea v-if="mode === 'text'" v-model="text" class="sc-textarea" maxlength="300"
                                placeholder="Escreva algo..." aria-label="Texto do story" rows="4" />

                            <div v-if="mode === 'media'" class="sc-caption-wrap">
                                <input v-model="caption" type="text" maxlength="200" class="sc-caption"
                                    placeholder="Adicionar legenda..." aria-label="Legenda" />
                            </div>
                        </div>

                        <div class="sc-panel">
                            <div v-if="mode === 'text'" class="sc-swatches" role="radiogroup" aria-label="Fundo">
                                <button v-for="(css, key) in STORY_BACKGROUNDS" :key="key" type="button"
                                    class="sc-swatch" :class="{ 'is-active': bgKey === key }"
                                    :style="{ background: css }" role="radio" :aria-checked="bgKey === key"
                                    :aria-label="`Fundo ${key}`" @click="bgKey = key" />
                            </div>

                            <div class="sc-privacy" role="radiogroup" aria-label="Quem pode ver">
                                <button v-for="opt in privacyOptions" :key="opt.value" type="button" role="radio"
                                    class="sc-chip" :class="{ 'is-active': privacy === opt.value }"
                                    :aria-checked="privacy === opt.value" @click="privacy = opt.value">
                                    {{ opt.label }}
                                </button>
                            </div>
                            <p class="sc-privacy__hint">{{privacyOptions.find((o) => o.value === privacy)?.hint}}</p>

                            <label class="sc-toggle">
                                <span>Permitir respostas</span>
                                <input type="checkbox" v-model="allowReplies" />
                                <i aria-hidden="true" />
                            </label>

                            <p v-if="error" class="sc-error" role="alert">{{ error }}</p>

                            <button type="button" class="sc-publish" :disabled="!canPublish || uploading"
                                @click="publish">
                                <span v-if="uploading" class="sc-publish__bar" :style="{ width: progress + '%' }" />
                                <span class="sc-publish__label">
                                    {{ uploading ? `Publicando ${progress}%` : 'Publicar story' }}
                                </span>
                            </button>
                        </div>
                    </template>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useStore } from 'vuex'
import {
    STORY_BACKGROUNDS,
    STORY_MAX_PHOTO_BYTES,
    STORY_MAX_VIDEO_BYTES,
    STORY_MAX_VIDEO_SECONDS,
    compressImage,
    readVideoMeta,
} from '../../../utils/story-utils'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'published'])

const store = useStore()

const privacyOptions = [
    { value: 'everyone', label: 'Todos', hint: 'Qualquer pessoa pode ver por 24 horas.' },
    { value: 'friends', label: 'Amigos', hint: 'Só quem você segue e também segue você.' },
    { value: 'only_me', label: 'Só eu', hint: 'Fica salvo no seu arquivo, sem aparecer para ninguém.' },
]

const cameraInput = ref(null)
const galleryInput = ref(null)

const mode = ref('pick') // pick | media | text
const media = ref({ type: null, file: null, width: null, height: null, duration: 0 })
const previewUrl = ref('')
const caption = ref('')
const text = ref('')
const bgKey = ref('sunset')
const privacy = ref('everyone')
const allowReplies = ref(true)

const uploading = ref(false)
const progress = ref(0)
const error = ref('')

const canPublish = computed(() => (mode.value === 'text' ? !!text.value.trim() : !!media.value.file))

const revokePreview = () => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
}

const reset = () => {
    revokePreview()
    mode.value = 'pick'
    media.value = { type: null, file: null, width: null, height: null, duration: 0 }
    caption.value = ''
    text.value = ''
    error.value = ''
    progress.value = 0
}

const requestClose = () => {
    if (uploading.value) return
    emit('close')
}

watch(
    () => props.open,
    (value) => {
        document.body.style.overflow = value ? 'hidden' : ''
        if (!value) {
            reset()
            privacy.value = 'everyone'
            allowReplies.value = true
            bgKey.value = 'sunset'
        }
    }
)

const startText = () => {
    error.value = ''
    mode.value = 'text'
}

const onFile = async (event) => {
    const input = event.target
    const file = input.files?.[0]
    input.value = '' // permite escolher o mesmo arquivo de novo
    if (!file) return

    error.value = ''

    try {
        if (file.type.startsWith('image/')) {
            if (file.size > STORY_MAX_PHOTO_BYTES) {
                error.value = 'A foto deve ter até 20 MB.'
                return
            }
            const result = await compressImage(file)
            revokePreview()
            media.value = { type: 'photo', file: result.file, width: result.width, height: result.height, duration: 0 }
            previewUrl.value = URL.createObjectURL(result.file)
            mode.value = 'media'
        } else if (file.type.startsWith('video/')) {
            if (file.size > STORY_MAX_VIDEO_BYTES) {
                error.value = 'O vídeo deve ter até 100 MB.'
                return
            }
            const meta = await readVideoMeta(file)
            if (meta.duration > STORY_MAX_VIDEO_SECONDS + 0.5) {
                error.value = `O vídeo deve ter até ${STORY_MAX_VIDEO_SECONDS} segundos.`
                return
            }
            revokePreview()
            media.value = { type: 'video', file, width: meta.width, height: meta.height, duration: meta.duration }
            previewUrl.value = URL.createObjectURL(file)
            mode.value = 'media'
        } else {
            error.value = 'Escolha uma foto ou um vídeo.'
        }
    } catch {
        error.value = 'Não foi possível abrir este arquivo.'
    }
}

const publish = async () => {
    if (!canPublish.value || uploading.value) return

    uploading.value = true
    progress.value = 0
    error.value = ''

    try {
        let payload

        if (mode.value === 'text') {
            payload = { media_type: 'text', text_content: text.value.trim(), background: bgKey.value }
        } else {
            const uploaded = await store.dispatch('uploadStoryMedia', {
                file: media.value.file,
                onProgress: (p) => (progress.value = p),
            })
            payload = {
                media_type: media.value.type,
                media: {
                    url: uploaded.url,
                    public_id: uploaded.public_id,
                    thumb: uploaded.thumb,
                    width: uploaded.width || media.value.width,
                    height: uploaded.height || media.value.height,
                    duration: uploaded.duration || media.value.duration,
                    size: uploaded.size,
                },
                caption: caption.value.trim(),
            }
        }

        await store.dispatch('publishStory', {
            ...payload,
            privacy: privacy.value,
            allow_replies: allowReplies.value,
        })

        emit('published')
        emit('close')
    } catch (err) {
        error.value = err?.response?.data?.message || err?.message || 'Não foi possível publicar. Tente de novo.'
    } finally {
        uploading.value = false
    }
}

onBeforeUnmount(() => {
    revokePreview()
    document.body.style.overflow = ''
})
</script>

<style scoped>
.sc-root {
    position: fixed;
    inset: 0;
    z-index: 1100;
    background: #000;
    display: flex;
    justify-content: center;
    color: #fff;
}

.sc-card {
    width: 100%;
    max-width: 480px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0b0b0c;
}

.sc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: calc(env(safe-area-inset-top, 0px) + 8px) 8px 8px;
}

.sc-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.sc-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 0;
    color: #fff;
    border-radius: 9999px;
    cursor: pointer;
}

.sc-icon:disabled {
    opacity: 0.4;
}

/* escolher */
.sc-pick {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    padding: 24px;
}

.sc-tile {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
}

.sc-tile:active {
    background: rgba(255, 255, 255, 0.12);
}

.sc-tile__aa {
    width: 30px;
    text-align: center;
    font-size: 24px;
    font-weight: 800;
    line-height: 1;
}

/* editar */
.sc-preview {
    position: relative;
    flex: 1;
    min-height: 0;
    margin: 0 12px;
    border-radius: 18px;
    overflow: hidden;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sc-preview img,
.sc-preview video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.sc-textarea {
    position: relative;
    width: 100%;
    background: transparent;
    border: 0;
    outline: none;
    resize: none;
    color: #fff;
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25;
    padding: 24px;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.sc-textarea::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.sc-caption-wrap {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 12px;
}

.sc-caption {
    width: 100%;
    height: 44px;
    border-radius: 9999px;
    border: 0;
    outline: none;
    padding: 0 18px;
    font-size: 15px;
    color: #fff;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(6px);
}

.sc-caption::placeholder {
    color: rgba(255, 255, 255, 0.7);
}

.sc-panel {
    padding: 14px 16px calc(env(safe-area-inset-bottom, 0px) + 16px);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.sc-swatches {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 2px;
    scrollbar-width: none;
}

.sc-swatch {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: 9999px;
    border: 2px solid transparent;
    cursor: pointer;
    outline: 2px solid rgba(255, 255, 255, 0.25);
    outline-offset: 1px;
}

.sc-swatch.is-active {
    outline: 2px solid #fff;
}

.sc-privacy {
    display: flex;
    gap: 8px;
}

.sc-chip {
    flex: 1;
    height: 38px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.sc-chip.is-active {
    background: #fff;
    color: #000;
    border-color: #fff;
}

.sc-privacy__hint {
    margin: -2px 2px 0;
    font-size: 12px;
    opacity: 0.6;
}

.sc-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    cursor: pointer;
}

.sc-toggle input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.sc-toggle i {
    position: relative;
    width: 44px;
    height: 26px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.25);
    transition: background 0.15s ease;
}

.sc-toggle i::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 9999px;
    background: #fff;
    transition: transform 0.15s ease;
}

.sc-toggle input:checked+i {
    background: #fe2c55;
}

.sc-toggle input:checked+i::after {
    transform: translateX(18px);
}

.sc-toggle input:focus-visible+i {
    outline: 2px solid #fff;
    outline-offset: 2px;
}

.sc-error {
    margin: 0;
    font-size: 13px;
    color: #ff7a8f;
}

.sc-publish {
    position: relative;
    height: 50px;
    border-radius: 9999px;
    border: 0;
    background: #fe2c55;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    overflow: hidden;
}

.sc-publish:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.sc-publish__bar {
    position: absolute;
    inset: 0 auto 0 0;
    background: rgba(255, 255, 255, 0.28);
    transition: width 0.15s linear;
}

.sc-publish__label {
    position: relative;
}

.sc-enter-active,
.sc-leave-active {
    transition: opacity 0.18s ease;
}

.sc-enter-from,
.sc-leave-to {
    opacity: 0;
}
</style>