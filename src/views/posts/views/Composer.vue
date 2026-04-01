<template>
    <div class="relative">
        <div v-if="!isSubmiting" class="relative w-screen overflow-y-auto box-border flex flex-col"
            :style="{ height: `calc(${viewportHeight}px - ${showFooter ? 52 : 0}px)` }">

            <!--start header-->
            <div
                class="flex fixed top-0 w-full z-[100] h-14 p-2 bg-surface-0 dark:bg-dark-bg items-center justify-between">
                <div class="flex items-center gap-2">
                    <button
                        class="py-1.5 px-2.5 text-sm hover:bg-primary/20 dark:hover:bg-primary/30 text-light-link dark:text-dark-link rounded-full font-semibold flex items-center"
                        @click="openCancelPostDrawer">
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="#666"
                                stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
                        </svg>
                    </button>
                    <button @click="openPostAudienceDrawer">{{ audienceText
                    }}</button>
                </div>

                <button
                    class="h-9 px-5 text-sm rounded-full text-white disabled:opacity-60 disabled:pointer-events-none font-semibold bg-primary-500"
                    @click="handleSubmit" :disabled="!canPost || isSubmiting || selectFileLoading || isUploading">
                    {{ btnSubmitText }}
                </button>
            </div>
            <!--end header-->

            <!--start body-->
            <div class="flex-1 max-h-full justify-between flex-col mt-14 ">
                <div>
                    <div v-if="!parentPost?._id">
                        <div class="flex borde-b border-gray-100 pb-2 items-center gap-1 justify-center flex-1">
                            <button @click="setPostType('question')"
                                :class="{ '!text-sky-400': postType === 'question' }" class="flex-1">Fazer
                                pergunta</button>
                            <button @click="setPostType('post')" :class="{ '!text-sky-400': postType === 'post' }"
                                class="flex-1">Criar post</button>
                        </div>
                    </div>
                </div>
                <div>
                    <!--start error alert-->
                    <div v-if="error" class="px-4 mb-5">
                        <div
                            class="py-3 flex justify-between px-3 bg-light-card dark:bg-dark-card mb-2 rounded-lg text-light-text-secondary dark:text-dark-text-primary relative">
                            <div class="flex">
                                <svg class="shrink-0 mr-2" fill="none" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="hsl(346, 91%, 47.2%)" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm8-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-4a1 1 0 0 1-1-1Zm1-3a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z">
                                    </path>
                                </svg>
                                <span class="block leading-5">{{ error }}</span>
                            </div>
                            <button @click="error = null"
                                class="shrink-0 w-[22px] h-[22px] rounded-full flex justify-center items-center bg-light-bg dark:bg-dark-bg top-0 bottom-0 right-0">
                                <svg fill="none" width="12" viewBox="0 0 24 24" height="12"
                                    style="color: rgb(147, 165, 183); pointer-events: none;">
                                    <path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 0 1 1.414 0L12 10.586l6.293-6.293a1 1 0 1 1 1.414 1.414L13.414 12l6.293 6.293a1 1 0 0 1-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L10.586 12 4.293 5.707a1 1 0 0 1 0-1.414Z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <!--end error alert-->

                    <!--start author-->
                    <div class="px-2 flex flex-col">
                        <div class="flex items-center gap-1">
                            <div class="shrink-0">
                                <Avatar :url="user?.profile_image?.url" />
                            </div>
                            <div class="flex">
                                <p>{{ user?.display_name }}</p>
                            </div>
                        </div>
                    </div>
                    <!--end author-->

                    <!--start question input-->
                    <div class="px-2 flex flex-col gap-1 py-2" v-if="postType === 'question'">
                        <input class="dark:text-black" v-model="postQuestion" type="text"
                            placeholder="Faca uma pergunta?">
                    </div>
                    <!--end question input-->

                    <div v-else>
                        <!--star quill editor -->
                        <label for="quillText">

                            <div class="flex flex-col">
                                <div class="flex-1 p-2">
                                    <textarea :class="{ 'pointer-events-none': isSubmiting }" id="quillText"
                                        maxlength="280" v-model="postContent" ref="textAreaRef"
                                        placeholder="Escrever a resposta..."
                                        class="w-full placeholder:text-text-light placeholder:dark:text-dark-text-light text-base bg-light-bg dark:bg-dark-bg leading-5 text-text-secondary dark:text-dark-text-primary resize-none outline-none placeholder-gray-500 mb-3"
                                        @input="adjustTextareaHeight">
                            </textarea>
                                </div>

                                <div v-if="parentPost?._id && !loadingFetchPostParent" class="flex flex-col">
                                    <ParentPostCard :data="parentPost" :module="module" :user-id="user?._id" />
                                </div>

                            </div>
                        </label>
                        <!--end quill editor-->

                        <!-- start media previews -->
                        <div class="px-4 py-2 pt-0 flex-1 flex flex-row gap-3"
                            :class="{ 'overflow-x-auto': mediaPreviews.length > 1, 'justify-center': mediaPreviews.length === 1 }"
                            v-if="mediaPreviews.length" ref="mediaContainer">
                            <div v-for="(media, index) in mediaPreviews" :key="media.id"
                                class="relative rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border overflow-hidden shadow-sm flex-shrink-0"
                                :class="{
                                    'w-48 h-48': mediaPreviews.length > 1, // Quadrado para múltiplas mídias
                                    'w-full h-60': mediaPreviews.length === 1 && media.type === 'image', // 100% da largura do pai para uma única imagem
                                    'max-w-full min-w-full h-60': mediaPreviews.length === 1 && media.type === 'video', // Máximo de 320px para um único vídeo
                                    'opacity-75': uploadProgress[media.id] !== undefined,
                                    'transition-opacity duration-300': uploadProgress[media.id] !== undefined
                                }">
                                <!-- Imagem -->
                                <img v-if="media.type === 'image'" :src="media.url" class="w-full h-full object-cover"
                                    alt="Prévia da imagem" />

                                <!-- Vídeo -->
                                <video v-if="media.type === 'video'" controls class="w-full h-full object-cover"
                                    autoplay loop muted playsinline disablePictureInPicture>
                                    <source :src="media.url" :type="'video/' + media.format" />
                                </video>

                                <!-- Botão de remoção (apenas durante o upload) -->
                                <button :disabled="uploadProgress[media.id] === 100" @click.stop="removeMedia(index)"
                                    class="absolute top-2 right-2 bg-[#000]/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors duration-200">
                                    <svg viewBox="0 0 24 24" class="w-5 h-5">
                                        <path fill="currentColor"
                                            d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <!-- end media previews -->
                    </div>
                </div>
            </div>
            <!--end body-->

            <!--start footer-->
            <div v-if="showFooter" class="bg-surface-0 fixed bottom-0 w-full bg-light-bg dark:bg-dark-bg p-2"
                :style="{ transform: footerTransform }">
                <!-- Adicione aqui os controles do footer (emoji, mídia, etc) -->
                <div class="flex items-center justify-between">
                    <!-- Exemplo de controles -->
                    <div class="flex-1">
                        <div v-if="!isUploading" class="flex items-center">
                            <button
                                class="flex hover:bg-primary/20 dark:hover:bg-primary/25 items-center justify-center w-[39px] h-[39px] rounded-full text-primary-500 disabled:pointer-events-none disabled:text-[#8c9eb2] disabled:dark:text-[#5b7795]"
                                @click="imageInput?.click()" :disabled="hasVideo || selectFileLoading || isSubmiting">
                                <input type="file" ref="imageInput" accept="image/*" multiple
                                    @change="handleImageUpload" class="hidden" />
                                <svg fill="none" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm2 1v7.213l1.246-.932.044-.03a3 3 0 0 1 3.863.454c1.468 1.58 2.941 2.749 4.847 2.749 1.703 0 2.855-.555 4-1.618V5H5Zm14 10.357c-1.112.697-2.386 1.097-4 1.097-2.81 0-4.796-1.755-6.313-3.388a1 1 0 0 0-1.269-.164L5 14.712V19h14v-3.643ZM15 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 1a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z">
                                    </path>
                                </svg>
                            </button>

                            <button @click="videoInput?.click()"
                                :disabled="hasImages || selectFileLoading || hasUploadedVideo || isSubmiting"
                                class="flex hover:bg-primary/20 dark:hover:bg-primary/25 items-center justify-center w-[39px] h-[39px] rounded-full text-primary-500 disabled:pointer-events-none disabled:text-[#8c9eb2] disabled:dark:text-[#5b7795]">
                                <input type="file" ref="videoInput" accept="video/*" @change="handleVideoUpload"
                                    class="hidden" />
                                <svg fill="none" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4Zm2 1v2h2V5H5Zm4 0v6h6V5H9Zm8 0v2h2V5h-2Zm2 4h-2v2h2V9Zm0 4h-2v2h2V13Zm0 4h-2V19h2ZM15 19v-6H9v6h6Zm-8 0v-2H5v2h2Zm-2-4h2v-2H5v2Zm0-4h2V9H5v2Z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                        <div v-else class="flex w-full gap-3 overflow-hidden items-center">
                            <svg width="30" height="30" fill="none">
                                <!-- Círculo de fundo -->
                                <path d="M15 0.5
           a14.5 14.5 0 0 1 0 29
           a14.5 14.5 0 0 1 0 -29" stroke-linecap="butt" stroke-width="1"
                                    class="text-[hsl(211,20%,85.89999999999999%)] dark:text-[hsl(211,28%,25.2%)]"
                                    stroke="currentColor" />
                                <!-- Círculo de progresso -->
                                <path class="text-primary-500" :stroke-dasharray="dashArrayUploadProgress" d="M15 2.5
           a12.5 12.5 0 0 1 0 25
           a12.5 12.5 0 0 1 0 -25" stroke-linecap="butt" stroke-width="3" stroke="currentColor" />
                            </svg>
                            <p
                                class="text-sm truncate flex-1 text-ellipsis text-text-secondary dark:text-dark-text-primary font-medium">
                                {{ hasVideo ? 'Enviando o vídeo...' : 'Enviando imagens...' }}</p>
                        </div>
                    </div>

                    <div class="flex shrink-0 items-center gap-3">
                        <p class="text-sm font-normal text-text-secondary dark:text-dark-text-primary">
                            {{ remainingChars }}
                        </p>

                        <svg width="30" height="30" fill="none">
                            <!-- Círculo de fundo -->
                            <path d="M15 0.5
           a14.5 14.5 0 0 1 0 29
           a14.5 14.5 0 0 1 0 -29" stroke-linecap="butt" stroke-width="1"
                                class="text-[hsl(211,20%,85.89999999999999%)] dark:text-[hsl(211,28%,25.2%)]"
                                stroke="currentColor" />
                            <!-- Círculo de progresso -->
                            <path class="text-primary-500" :stroke-dasharray="dashArray" d="M15 2.5
           a12.5 12.5 0 0 1 0 25
           a12.5 12.5 0 0 1 0 -25" stroke-linecap="butt" stroke-width="3" stroke="currentColor" />
                        </svg>
                    </div>
                </div>
            </div>
            <!--end footer-->

            <!-- Modal de Confirmação -->
            <Drawer @close="closeDrawer" :is-open="drawer?.show" :title="drawer?.metadata?.title">
                <template v-if="drawer?.name === 'cancelPost'">
                    <div class="flex flex-col">
                        <DrawerItem @on-press="closeDrawer" title="Continuar editando"></DrawerItem>
                        <DrawerItem @on-press="confirmCancel" title="Descartar tudo"></DrawerItem>
                    </div>
                </template>

                <template v-if="drawer?.name === 'postAudience'">
                    <div class="flex flex-col">
                        <DrawerItem :is-active="postAudience === 'everyone'" @on-press="setPostAudience('everyone')"
                            title="Público"
                            description="Todos verão a tua identidade junto a pergunta no seu perfil ou no feed deles." />
                        <DrawerItem :is-active="postAudience === 'limited'" @on-press="setPostAudience('limited')"
                            title="Limitado"
                            description="A sua identidade ficará visível, mas esta pergunta nao aparecerá no feed dos seu seguidores" />
                    </div>
                </template>
            </Drawer>
        </div>
        <div v-else>
            <LoadingScreen />
        </div>
    </div>

</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, onActivated } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
//import { usePost } from "@/app/posts/posts.hook";
import axios from 'axios';
import { useStore } from 'vuex';
//import ReplyToparentPost from '../components/ReplyToparentPost.vue';
import CryptoJS from 'crypto-js';
import LoadingScreen from "@/components/UI/LoadingScreen.vue"
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import Avatar from '../../users/components/Avatar.vue';
import ParentPostCard from '../components/ParentPostCard.vue';

// Constantes do Cloudinary
const CLOUD_NAME = 'daujoblcc';
const UPLOAD_PRESET = 'social_media_upload';
const API_KEY = '686559434489718'; // Substitua pelo sua API Key do Cloudinary
const API_SECRET = 'oAYl12OIZf2HkieFNDQQk2romHM'; // Substitua pelo seu API Secret do Cloudinary

const router = useRouter();
const route = useRoute();
const store = useStore();

const textAreaRef = ref(null);
const isSubmited = ref(false)
const mediaContainer = ref(null);
const selectFileLoading = ref(false);

const isAnonymous = ref(false);
const postAudience = ref("everyone");
const topics = ref([])
const postContent = ref('');
const queryPostType = computed(() => route?.query?.post_type || 'question')
const postType = ref('question')
const postQuestion = ref('')

const mediaPreviews = ref([]);
const uploadProgress = ref({});

const cancelTokens = ref({});
const error = ref(null);

const showModal = ref(false);

const drawer = ref({
    show: false,
    name: "",
    metadata: {}
})

const uploadedMediaIds = ref([]); // Rastreia public_ids das mídias carregadas

const imageInput = ref(null);
const videoInput = ref(null);
const loadingFetchPostParent = ref(false)

const isKeyboardOpen = ref(false);
const viewportHeight = ref(window.visualViewport.height);

// Constants
const MAX_CHARS = 500;
const MAX_IMAGES = 4;
const MAX_VIDEO_SIZE_MB = 50;


const showFooter = computed(() => postType.value !== 'question' && !parentPost.value?._id)
const audienceText = computed(() => {
    switch (postAudience.value) {
        case 'limited':
            return 'Limitado'
        default:
            return 'Público'
    }
})

const btnSubmitText = computed(() => {
    if (postType.value === 'question') return 'Adicionar'
    else return 'Postar'
})

const module = computed(() => route.query.module || null);
const remainingChars = computed(() => MAX_CHARS - postContent.value.length);
const hasImages = computed(() => mediaPreviews.value.some(m => m.type === 'image'));
const hasVideo = computed(() => mediaPreviews.value.some(m => m.type === 'video'));
const isSubmiting = ref(false)

const isUploading = computed(() => {
    return Object.values(uploadProgress.value).some(progress => progress < 100);
});

const hasUploadedVideo = computed(() => {
    return mediaPreviews.value.some(media => media.type === 'video' && media.public_id);
});

const canPost = computed(() => {
    if (postContent.value.trim().length > 0 && postType.value !== 'question' || mediaPreviews.value.length > 0 && postType.value !== 'question' || postType.value === 'question' && postQuestion.value.trim().length > 0 || parentPost?.value?._id && !isSubmited.value) return true
    else return false
});

const user = computed(() => store.getters.currentUser);

const parentPost = computed(() => store.getters.parentPost);

const progressChars = computed(() => {
    const percentage = ((MAX_CHARS - remainingChars.value) / MAX_CHARS) * 100;
    return Math.min(Math.max(percentage, 0), 100);
});

const dashArray = computed(() => {
    const circumference = 2 * Math.PI * 12.5;
    const dash = (progressChars.value / 100) * circumference;
    return `${dash} ${circumference - dash}`;
});

const uploadProgressPercentage = computed(() => {
    const progresses = Object.values(uploadProgress.value);
    if (progresses.length === 0) return 0;
    const totalProgress = progresses.reduce((sum, progress) => sum + progress, 0);
    return Math.round(totalProgress / progresses.length);
});

const dashArrayUploadProgress = computed(() => {
    const circumference = 2 * Math.PI * 12.5;
    if (isUploading.value) {
        const dash = (uploadProgressPercentage.value / 100) * circumference;
        return `${dash} ${circumference - dash}`;
    } else {
        const percentage = ((MAX_CHARS - remainingChars.value) / MAX_CHARS) * 100;
        const dash = (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;
        return `${dash} ${circumference - dash}`;
    }
});

const footerTransform = computed(() =>
    isKeyboardOpen.value ? `translateY(-${window.innerHeight - window.visualViewport.height}px)` : ''
);

const setPostType = (type) => {
    postType.value = type

    if (type !== 'question') {
        postQuestion.value = ''
    } else {
        postContent.value = ''
    }
}

const setPostAudience = (status) => {
    postAudience.value = status
    closeDrawer()
}

const handleViewportResize = () => {
    viewportHeight.value = window.visualViewport.height;
    isKeyboardOpen.value = (window.visualViewport.height < window.innerHeight * 0.8);
    if (isKeyboardOpen.value && textAreaRef.value) {
        setTimeout(() => {
            textAreaRef?.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
};

const resetForm = () => {
    postContent.value = '';
    //postType.value = 'question'
    postQuestion.value = '';
    topics.value = [];
    postAudience.value = 'everyone';
    //mediaPreviews.value = [];
    uploadProgress.value = {};
    cancelTokens.value = {};
    uploadedMediaIds.value = [];
    error.value = null;
};

const openDrawer = (data) => {
    const { show, name, metadata = {} } = data

    drawer.value = {
        show,
        name,
        metadata
    }
}

const closeDrawer = () => {
    drawer.value = {
        show: false,
        name: '',
        metadata: {}
    }
}

const openCancelPostDrawer = () => {
    if (canPost.value) {
        openDrawer({
            show: true,
            name: 'cancelPost',
            metadata: {
                title: 'Descartar post?'
            }
        })
    } else {
        confirmCancel();
    }
};

const openPostAudienceDrawer = () => {
    openDrawer({
        show: true,
        name: 'postAudience',
        metadata: {
            title: 'Audiencia'
        }
    })
}

const validateVideoIntegrity = (file) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
            if (video.duration === Infinity || isNaN(video.duration) || video.videoWidth === 0) {
                URL.revokeObjectURL(video.src);
                reject(new Error('Vídeo corrompido ou inválido.'));
            } else {
                URL.revokeObjectURL(video.src);
                resolve(true);
            }
        };
        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject(new Error('Vídeo corrompido ou não pôde ser lido.'));
        };
    });
};

const deleteMediaFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signatureString = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
        const signature = CryptoJS.SHA1(signatureString).toString(); // Usar crypto-js para SHA-1

        await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
            {
                public_id: publicId,
                api_key: API_KEY,
                timestamp: timestamp,
                signature: signature,
            }
        );
        uploadedMediaIds.value = uploadedMediaIds.value.filter(id => id !== publicId);
    } catch (error) {
        console.error('Erro ao excluir mídia do Cloudinary:', error);
    }
};

const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const availableSlots = MAX_IMAGES - mediaPreviews.value.length;

    if (files.length > availableSlots) {
        error.value = `Você pode adicionar no máximo ${MAX_IMAGES} imagens`;
        return;
    }

    error.value = null;
    selectFileLoading.value = true;

    for (const file of files.slice(0, availableSlots)) {
        if (!(file instanceof File) || !file.type.startsWith('image/')) {
            error.value = 'Arquivo inválido ou não é uma imagem.';
            continue;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const id = uuidv4();
            const media = {
                id,
                url: e.target.result,
                type: 'image',
                format: file.type.split('/')[1],
                file
            };
            mediaPreviews.value.push(media);
            uploadProgress.value[id] = 0;

            try {
                const uploadedMedia = await uploadMedia(media);
                if (uploadedMedia) {
                    const mediaIndex = mediaPreviews.value.findIndex(m => m.id === id);
                    if (mediaIndex !== -1) {
                        mediaPreviews.value[mediaIndex] = {
                            ...mediaPreviews.value[mediaIndex],
                            ...uploadedMedia
                        };
                        console.log('Mídia atualizada em mediaPreviews:', mediaPreviews.value[mediaIndex]);
                    }
                }
            } catch (err) {
                error.value = err.message || 'Erro ao fazer upload da imagem. Tente novamente.';
                mediaPreviews.value = mediaPreviews.value.filter(m => m.id !== id);
                console.error('Erro no upload da imagem:', err);
            }

            if (mediaPreviews.value.length === files.length + (mediaPreviews.value.length - files.length)) {
                selectFileLoading.value = false;
            }
        };
        reader.onerror = () => {
            error.value = 'Erro ao carregar a imagem. Tente novamente.';
            selectFileLoading.value = false;
        };
        reader.readAsDataURL(file);
    }

    e.target.value = '';
};

const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];

    if (!file || !(file instanceof File) || !file.type.startsWith('video/')) {
        error.value = 'Arquivo inválido ou não é um vídeo.';
        return;
    }

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        error.value = `O vídeo deve ter no máximo ${MAX_VIDEO_SIZE_MB}MB.`;
        return;
    }
    if (!allowedVideoTypes.includes(file.type)) {
        error.value = 'Formato de vídeo não suportado. Use MP4 ou WebM.';
        return;
    }

    error.value = null;
    selectFileLoading.value = true;

    try {
        await validateVideoIntegrity(file);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const id = uuidv4();
            const media = {
                id,
                url: e.target.result,
                type: 'video',
                format: file.type.split('/')[1],
                file
            };

            mediaPreviews.value = [media];
            uploadProgress.value[id] = 0;

            try {
                const uploadedMedia = await uploadMedia(media);
                if (uploadedMedia) {
                    mediaPreviews.value[0] = {
                        ...mediaPreviews.value[0],
                        ...uploadedMedia
                    };
                }
            } catch (err) {
                error.value = err.message || 'Erro ao fazer upload do vídeo. Tente novamente.';
                mediaPreviews.value = [];
                console.error('Erro no upload do vídeo:', err);
            }

            selectFileLoading.value = false;
        };
        reader.onerror = () => {
            error.value = 'Erro ao carregar o vídeo. Tente novamente.';
            selectFileLoading.value = false;
        };
        reader.readAsDataURL(file);

        e.target.value = '';
    } catch (err) {
        error.value = err.message || 'Vídeo corrompido ou inválido.';
        selectFileLoading.value = false;
    }
};

const removeMedia = async (index) => {
    const media = mediaPreviews.value[index];

    if (uploadProgress.value[media.id] !== undefined && cancelTokens.value[media.id]) {
        cancelTokens.value[media.id].cancel('Upload cancelado pelo usuário');
        delete cancelTokens.value[media.id];
    }

    mediaPreviews.value.splice(index, 1);

    const newProgress = { ...uploadProgress.value };
    delete newProgress[media.id];
    uploadProgress.value = newProgress;

    await nextTick();
    if (mediaContainer.value) {
        mediaContainer.value.scrollTo({ left: 0, behavior: 'smooth' });
    }

    // Excluir do Cloudinary se já foi carregado
    if (media.public_id) {
        await deleteMediaFromCloudinary(media.public_id, media.type);
    }
};

const uploadMedia = async (media) => {
    const source = axios.CancelToken.source();
    cancelTokens.value[media.id] = source;

    try {
        const formData = new FormData();
        formData.append('file', media.file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('cloud_name', CLOUD_NAME);
        formData.append('folder', media.type === 'video' ? 'videos' : 'images');

        if (media.type === 'video') {
            formData.append('resource_type', 'video');
            const publicId = `video_${Date.now()}`;
            formData.append('public_id', publicId);
        }

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
            formData,
            {
                cancelToken: source.token,
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    uploadProgress.value = {
                        ...uploadProgress.value,
                        [media.id]: progress
                    };
                },
            }
        );

        delete cancelTokens.value[media.id];

        if (!response.data) {
            const newProgress = { ...uploadProgress.value };
            delete newProgress[media.id];
            uploadProgress.value = newProgress;
            error.value = 'Erro ao carregar mídia'
            return null;
        }

        const hlsUrl = media.type === 'video' ?
            `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_hd/${response.data.public_id}.m3u8` :
            null;

        const thumbnailUrl = media.type === 'video' ?
            `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${response.data.width},h_${response.data.height},c_fill,q_auto,f_jpg,so_2/${response.data.public_id}.jpg` :
            null;

        // Armazenar o public_id para possível exclusão
        media.public_id = response.data.public_id;
        uploadedMediaIds.value.push(response.data.public_id);

        const newProgress = { ...uploadProgress.value };
        delete newProgress[media.id];
        uploadProgress.value = newProgress;

        return {
            public_id: response.data.public_id,
            url: media.type === 'video' ? hlsUrl : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_80,w_1200/${response.data.public_id}`,
            thumbnail: thumbnailUrl,
            type: media.type,
            format: media.type === 'video' ? 'm3u8' : response.data.format,
            width: response.data.width,
            height: response.data.height,
            duration: media.type === 'video' ? await getVideoDuration(response.data.secure_url) : null
        };
    } catch (err) {
        if (axios.isCancel(err)) {
            const newProgress = { ...uploadProgress.value };
            delete newProgress[media.id];
            uploadProgress.value = newProgress;
            return null;
        } else {
            const newProgress = { ...uploadProgress.value };
            delete newProgress[media.id];
            uploadProgress.value = newProgress;
            error.value = 'Erro ao carregar mídia'
            throw err;
        }

    }
};

const getVideoDuration = (url) => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
            resolve(video.duration);
        };
        video.onerror = () => {
            resolve(null);
        };
    });
};

const adjustTextareaHeight = async () => {
    await nextTick();

    if (postType.value === 'post') {
        textAreaRef.value.style.height = 'auto';

        const newHeight = textAreaRef.value.scrollHeight;
        const minHeight = 50;
        const maxHeight = 200;

        textAreaRef.value.style.height = `${Math.min(Math.max(newHeight, minHeight), maxHeight)}px`;
        if (isKeyboardOpen.value) {
            textAreaRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};

const confirmCancel = async () => {
    // Cancelar todos os uploads em andamento
    Object.values(cancelTokens.value).forEach(token => token.cancel('Upload cancelado pelo usuário'));
    cancelTokens.value = {};

    // Iniciar exclusão de mídias em background
    const mediaIdsToDelete = [...uploadedMediaIds.value]; // Copiar IDs para evitar alterações concorrentes
    if (mediaIdsToDelete.length > 0) {
        Promise.all(
            mediaIdsToDelete.map(id =>
                deleteMediaFromCloudinary(id, id.includes('video_') ? 'video' : 'image')
                    .catch(err => {
                        console.error(`Erro ao excluir mídia ${id} do Cloudinary:`, err.message, err.response?.data);
                        // Não definimos error.value para evitar impacto na UI
                    })
            )
        ).catch(err => {
            console.error('Erro geral na exclusão em background:', err);
        });
    }

    // Resetar formulário e navegar imediatamente
    showModal.value = false;
    closeDrawer()
    resetForm()
    store.commit("SET_PARENT_POST", {})
    router.back();
};

const handleSubmit = async () => {

    if (!canPost.value || isUploading.value) return;
    isSubmiting.value = true

    // Usar diretamente as mídias válidas em mediaPreviews (já carregadas)
    const validMedia = mediaPreviews.value.filter(media => media.public_id);

    const postData = {
        content: postContent.value,
        media: validMedia.map(m => ({
            public_id: m.public_id,
            url: m.url,
            type: m.type,
            format: m.format,
            thumbnail: m.thumbnail,
            width: m.width,
            height: m.height,
            duration: m.duration
        })),
        postType: postType.value,
        sharedPost: parentPost?.value?._id || null,
        postQuestion: postQuestion.value,
        isAnonymous: isAnonymous.value,
        topics: topics.value || [],
        audience: postAudience.value,
        module: module.value,
    };
    await store.dispatch('createPost', postData)
        .then(newPost => {
            resetForm()
            const { _id } = newPost
            router.replace({
                path: '/post/' + _id,
                ...(module.value, {
                    query: {
                        module: module.value
                    }
                })
            });
        })
        .catch(() => {
            isSubmiting.value = false
            console.log("Deu um erro")
        })
};


onBeforeRouteLeave((to, from, next) => {
    if (canPost.value && !drawer.value?.show) {
        openCancelPostDrawer()
        next(false); // Impede a navegação até o usuário confirmar
    } else if (drawer.value?.show) {
        closeDrawer()
        next(false)
    } else {
        next()
    }
});

onMounted(async () => {
    window.visualViewport.addEventListener('resize', handleViewportResize);

    if (queryPostType.value === 'post') {
        postType.value = 'post'
    }

    if (queryPostType.value === 'post' && parentPost.value?._id) {
        loadingFetchPostParent.value = true
        await store.dispatch("getPostById", {
            postId: route.query?.parent_post,
            type: 'parentPost'
        })
            .finally(() => {
                loadingFetchPostParent.value = false
            })
    }

    if (!parentPost.value?._id) {
        // await getPostById(119);
    }
    adjustTextareaHeight();
});

onUnmounted(() => {
    window.visualViewport.removeEventListener('resize', handleViewportResize);
});
</script>