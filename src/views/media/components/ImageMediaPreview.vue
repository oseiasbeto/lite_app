<template>
    <div class="flex h-full w-full items-center justify-center bg-black">
        <!-- Header -->
        <ImageMediaHeader :show="showHeaderAndFooter" @close="router.back()"
            @on-donwload="downloadFromCloudinary(list[currentIndex].url)" :created-at="post?.created_at"
            :author="post?.author" />

        <!-- Swiper -->
        <swiper :initial-slide="currentIndex" :slides-per-view="1" :space-between="0" direction="horizontal"
            :centered-slides="true" :modules="modules" :zoom="{ maxRatio: 4, minRatio: 1 }"
            :keyboard="{ enabled: true }" class="swiper-fullscreen" @slide-change="onSlideChange"
            @click="toggleShowHeaderAndFooter">
            <swiper-slide v-for="img in list" :key="img.url" class="swiper-slide-fullscreen">
                <!-- div.swiper-zoom-container é obrigatório para o módulo Zoom funcionar -->
                <div class="swiper-zoom-container">
                    <img :src="img.url" class="slide-img" draggable="false" />
                </div>
            </swiper-slide>
        </swiper>

        <!-- Footer -->
        <ImageMediaFooter :module="module" :user-id="userId" :show="showHeaderAndFooter" :post="post" />
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import ImageMediaHeader from './ImageMediaHeader.vue';
import ImageMediaFooter from './ImageMediaFooter.vue';
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Zoom, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/zoom';

const props = defineProps({
    currentImage: { type: Object, required: true },
    list: { type: Array, default: () => [] },
    userId: { type: String, required: true },
    post: { type: Object, required: true },
    module: { type: String, required: true }
});

const router = useRouter();
const modules = [Zoom, Keyboard];

const showHeaderAndFooter = ref(true);

// Só alterna header/footer se a imagem NÃO estiver com zoom ativo
const swiperInstance = ref(null);

const onSwiper = (swiper) => {
    swiperInstance.value = swiper;
};

const toggleShowHeaderAndFooter = () => {
    const zoom = swiperInstance.value?.zoom;
    // Se estiver com zoom > 1, não esconde o header (opcional: pode remover essa guarda)
    if (zoom && zoom.scale > 1) return;
    showHeaderAndFooter.value = !showHeaderAndFooter.value;
};

const currentIndex = ref(
    Math.max(0, props.list.findIndex(img => img.url === props.currentImage.url))
);

const onSlideChange = (swiper) => {
    currentIndex.value = swiper.activeIndex;
};

function extractPublicIdFromCloudinaryUrl(url) {
    try {
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        let path = url.substring(uploadIndex + 8);

        // remove query string, se houver
        path = path.split('?')[0];

        const parts = path.split('/');

        // remove todos os segmentos iniciais que parecem transformação
        // (contêm "," ou "=") — cobre múltiplas transformações encadeadas
        while (parts.length > 1 && (parts[0].includes(',') || parts[0].includes('='))) {
            parts.shift();
        }

        // remove segmento de versão, se presente (ex: "v1719999999")
        if (parts.length > 1 && /^v\d+$/.test(parts[0])) {
            parts.shift();
        }

        let publicId = parts.join('/');
        publicId = publicId.replace(/\.[^./]+$/, ''); // remove extensão, se houver

        return publicId || null;
    } catch {
        return null;
    }
}

function downloadFromCloudinary(img, options = {}) {
    const url = typeof img === 'string' ? img : img?.url;
    if (!url) {
        console.error('❌ URL da imagem não encontrada.');
        return;
    }

    const {
        fileName = null,       // Nome personalizado (ex: "minha_foto")
        usePublicId = true,    // Se true, usa o public_id extraído da URL
        prefix = 'IMG',
        mimeType = 'image/jpeg' // ajuste conforme o formato mais comum retornado pelo Cloudinary
    } = options;

    let finalFileName;
    if (fileName) {
        finalFileName = fileName;
    } else if (usePublicId) {
        const publicId = extractPublicIdFromCloudinaryUrl(url);
        finalFileName = publicId ? publicId.replace(/\//g, '_') : generateImageFileName(prefix);
    } else {
        finalFileName = generateImageFileName(prefix);
    }

    // Extrai a extensão a partir da URL (já que não temos mais o blob pra checar o mimeType real)
    const extMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    const extensao = extMatch ? extMatch[1] : 'jpg';
    const nomeCompleto = finalFileName.includes('.') ? finalFileName : `${finalFileName}.${extensao}`;

    if (window.WTN?.customFileDownload) {
        window.WTN.customFileDownload({
            fileName: nomeCompleto,
            downloadUrl: url,
            mimeType,
            cookies: "",
            isBlob: false,
            userAgent: "",
            openFileAfterDownload: true
        });
        console.log(`✅ Download solicitado via WTN: ${nomeCompleto}`);
    } else {
        console.error('❌ window.WTN.customFileDownload não está disponível neste ambiente.');
        alert('Download não suportado neste ambiente.');
    }
}
</script>

<style scoped>
.swiper-fullscreen {
    position: fixed;
    inset: 0;
    width: 100dvw;
    height: 100dvh;
}

.swiper-slide-fullscreen {
    width: 100dvw !important;
    height: 100dvh !important;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* O swiper-zoom-container precisa ocupar tudo para centralizar */
.swiper-zoom-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slide-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
}
</style>