<template>
    <div class="relative">
        <div class="relative dark:bg-transparent bg-white h-screen w-screen overflow-y-hidden box-border flex flex-col">

            <!--start header-->
            <div class="flex flex-col sticky top-0 w-full z-[100] bg-white dark:bg-transparent">
                <div class="flex w-full py-2 items-center justify-between">
                    <div class="flex flex-1 pr-2 items-center gap-2">
                        <button
                            class="py-1.5 px-2.5 text-sm text-light-link dark:text-dark-link rounded-full font-semibold flex text-inherit items-center"
                            @click="openCancelPostDrawer">
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="currentColor"
                                    stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
                            </svg>
                        </button>
                        <button class="flex items-center gap-1" @click="openPostAudienceDrawer">
                            <svg v-if="postAudience === 'everyone'" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g class="icon_svg-stroke" transform="translate(4 4)" stroke="currentColor"
                                    stroke-width="1.5" fill="none" fill-rule="evenodd">
                                    <path d="M10 15.5a5 5 0 0 0-10 0m17 0a5 5 0 0 0-7.032-4.57"></path>
                                    <circle cx="5" cy="4" r="4"></circle>
                                    <path d="M9.678 7.258A4 4 0 1 0 9.791.665"></path>
                                </g>
                            </svg>
                            <svg v-else width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g class="icon_svg-stroke" transform="translate(6 3)" stroke="currentColor" stroke-width="1.5"
                                    fill="none" fill-rule="evenodd">
                                    <path d="M13 18c0-3.314-2.91-6-6.5-6S0 14.686 0 18"></path>
                                    <circle cx="6.5" cy="5" r="4.5"></circle>
                                </g>
                            </svg>
                            <span class="font-semibold">{{ audienceText }}</span>
                        </button>
                    </div>
                    <div class=" shrink-0 pr-2">
                        <SecondaryButton @on-press="handleSubmit" :loading="isSubmiting"
                            :disabled="!canPost || selectFileLoading || isUploading" :text="btnSubmitText" />
                    </div>

                </div>

                <div>
                    <div v-if="!parentPost?._id">
                        <div
                            class="flex border-b dark:border-[rgb(57,56,57)] px-2 items-center gap-1 justify-center flex-1">
                            <button @click="setPostType('question')" class="flex-1 py-2 relative active:opacity-50">
                                <span class="font-semibold whitespace-nowrap dark:text-white text-[rgb(40,40,41)]">Fazer
                                    uma pergunta</span>
                                <span v-show="postType === 'question'"
                                    class="box-border absolute bottom-0 bg-[#2e69ff] left-0 right-0 h-[3px] rounded-tl-sm rounded-tr-sm"></span>
                            </button>
                            <button @click="setPostType('post')" class="flex-1 py-2 relative active:opacity-50">
                                <span class="font-semibold whitespace-nowrap dark:text-white text-[rgb(40,40,41)]">Criar
                                    post</span>
                                <span v-show="postType === 'post'"
                                    class="box-border absolute bottom-0 bg-[#2e69ff] left-0 right-0 h-[3px] rounded-tl-sm rounded-tr-sm"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <!--end header-->

            <!--start body-->
            <div class="flex-1 px-4 pt-4 max-h-full overflow-y-auto justify-between flex-col">
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
                    <div class="flex flex-col">
                        <div class="flex items-center gap-1">
                            <div class="shrink-0">
                                <Avatar size="xl" :url="user?.profile_image?.url" />
                            </div>
                            <div class="flex ml-1">
                                <p class="font-semibold dark:text-white text-[rgb(40,40,41)]">{{ user?.display_name }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <!--end author-->

                    <!--start question input-->
                    <div class="flex flex-col gap-1 py-2 border-b dark:border-[rgb(57,56,57)]"
                        v-if="postType === 'question'">
                        <textarea v-model="postQuestion"
                            class="placeholder:dark:text-[rgb(177,179,182)] placeholder:text-[#949494] resize-none dark:text-white text-[rgb(40,40,41)]"
                            width="100%" height="3px" rows="2"
                            placeholder="Comece sua pergunta com &quot;O que&quot;, &quot;Como&quot;, &quot;Por que&quot;, etc"
                            autocomplete="off" role="combobox" aria-controls="selector:24" aria-haspopup="listbox"
                            aria-autocomplete="list" aria-expanded="true"
                            style="box-sizing: border-box; font-size: 18px; width: 100%; box-shadow: none; background-color: transparent; padding: 0px; outline: none; font-weight: 500; border: none; flex: 1 1 0%; min-height: 26px; overflow: hidden; overflow-wrap: break-word; height: 50px;"></textarea>
                    </div>
                    <!--end question input-->

                    <div v-else>
                        <!--star quill editor -->
                        <RichTextEditor v-model="postContent" :disable-upload-image="mediaPreviews.length"
                            :no-min-height="mediaPreviews.length" @upload-image="imageInput?.click()" />
                        <!--end quill editor-->

                        <!-- start media previews -->
                        <div class="py-2 pt-0 flex-1 flex flex-row gap-3"
                            :class="{ 'overflow-x-auto': mediaPreviews.length > 1, 'justify-center': mediaPreviews.length === 1 }"
                            v-if="mediaPreviews.length" ref="mediaContainer">
                            <div v-for="(media, index) in mediaPreviews" :key="media.id"
                                class="relative bg-light-card dark:border-[rgb(57,56,57)] border overflow-hidden shadow-sm flex-shrink-0"
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

                        <!--input files-->
                        <input type="file" ref="imageInput" accept="image/*" multiple @change="handleImageUpload"
                            class="hidden" />
                        <!--input files-->
                    </div>
                </div>
            </div>
            <!--end body-->


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
    </div>

</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, onActivated } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useStore } from 'vuex';
//import ReplyToparentPost from '../components/ReplyToparentPost.vue';
import CryptoJS from 'crypto-js';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import ParentPostCard from '../components/ParentPostCard.vue';
import RichTextEditor from '@/components/UI/RichTextEditor.vue';
import Avatar from '@/components/Utils/Avatar.vue';
import SecondaryButton from '@/components/buttons/SecondaryButton.vue';

// Constantes do Cloudinary
const CLOUD_NAME = 'daujoblcc';
const UPLOAD_PRESET = 'social_media_upload';
const API_KEY = '686559434489718'; // Substitua pelo sua API Key do Cloudinary
const API_SECRET = 'oAYl12OIZf2HkieFNDQQk2romHM'; // Substitua pelo seu API Secret do Cloudinary

const router = useRouter();
const route = useRoute();
const store = useStore();

const isSubmited = ref(false)
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
const loadingFetchPostParent = ref(false)

// Constants
const MAX_IMAGES = 1;


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
const isSubmiting = ref(false)

const isUploading = computed(() => {
    return Object.values(uploadProgress.value).some(progress => progress < 100);
});


const canPost = computed(() => {
    if (postContent.value.trim().length > 0 && postContent.value.trim() !== '<p></p>' && postType.value !== 'question' || mediaPreviews.value.length > 0 && postType.value !== 'question' || postType.value === 'question' && postQuestion.value.trim().length > 0 || parentPost?.value?._id && !isSubmited.value) return true
    else return false
});

const user = computed(() => store.getters.currentUser);

const parentPost = computed(() => store.getters.parentPost);

const setPostType = (type) => {
    postType.value = type

    if (type !== 'question') {
        postQuestion.value = ''
    } else {
        postContent.value = ''

        if (mediaPreviews.value.length) {
            for (let i = 0; i < mediaPreviews.value.length; i++) {
                removeMedia(i)
            }
        }
    }
}

const setPostAudience = (status) => {
    postAudience.value = status
    closeDrawer()
}

const resetForm = () => {
    postContent.value = '';
    //postType.value = 'question'
    postQuestion.value = '';
    topics.value = [];
    postAudience.value = 'everyone';
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


        // Armazenar o public_id para possível exclusão
        media.public_id = response.data.public_id;
        uploadedMediaIds.value.push(response.data.public_id);

        const newProgress = { ...uploadProgress.value };
        delete newProgress[media.id];
        uploadProgress.value = newProgress;

        return {
            public_id: response.data.public_id,
            url: media.type === 'video' ? hlsUrl : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_80,w_1200/${response.data.public_id}`,
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
});
</script>