<template>
    <div class="flex h-full w-full items-center justify-center bg-black">
        <!-- Header -->
        <ImageMediaHeader
            :show="showHeaderAndFooter"
            @close="router.back()"
            :created-at="post?.created_at"
            :author="post?.author"
        />

        <!-- Swiper -->
        <swiper
            :initial-slide="currentIndex"
            :slides-per-view="1"
            :space-between="0"
            direction="horizontal"
            :centered-slides="true"
            :modules="modules"
            :zoom="{ maxRatio: 4, minRatio: 1 }"
            :keyboard="{ enabled: true }"
            class="swiper-fullscreen"
            @slide-change="onSlideChange"
            @click="toggleShowHeaderAndFooter"
        >
            <swiper-slide v-for="img in list" :key="img.url" class="swiper-slide-fullscreen">
                <!-- div.swiper-zoom-container é obrigatório para o módulo Zoom funcionar -->
                <div class="swiper-zoom-container">
                    <img :src="img.url" class="slide-img" draggable="false" />
                </div>
            </swiper-slide>
        </swiper>

        <!-- Footer -->
        <ImageMediaFooter
            :module="module"
            :user-id="userId"
            :show="showHeaderAndFooter"
            :post="post"
        />
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
    list:         { type: Array,  default: () => [] },
    userId:       { type: String, required: true },
    post:         { type: Object, required: true },
    module:       { type: String, required: true }
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