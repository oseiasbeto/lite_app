<template>
    <div v-if="images?.length" class="w-full overflow-hidden" :class="wrapperClass">

        <!-- ── 1 imagem: largura total, altura proporcional livre ── -->
        <template v-if="images.length === 1">
            <div class="media-cell w-full">
                <img v-lazy="images[0].url" class="w-full h-auto max-h-[560px] object-cover cursor-pointer block"
                    @click="open(images[0])" />
            </div>
        </template>

        <!-- ── 2 imagens: dois quadrados lado a lado ── -->
        <template v-else-if="images.length === 2">
            <div class="grid grid-cols-2 gap-[2px]">
                <div v-for="img in images" :key="img.url" class="media-cell aspect-square">
                    <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 3 imagens: quadrado grande à esquerda + 2 quadrados empilhados à direita ── -->
        <template v-else-if="images.length === 3">
            <div class="grid grid-cols-2 gap-[2px]" style="grid-template-rows: 1fr 1fr;">
                <!-- Esquerda: ocupa as duas linhas -->
                <div class="media-cell row-span-2">
                    <img v-lazy="images[0].url" class="w-full h-full object-cover cursor-pointer"
                        @click="open(images[0])" />
                </div>
                <!-- Direita: duas células iguais que dividem a altura da esquerda -->
                <div v-for="img in images.slice(1)" :key="img.url" class="media-cell aspect-square">
                    <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 4 imagens: grade 2×2 de quadrados ── -->
        <template v-else-if="images.length === 4">
            <div class="grid grid-cols-2 gap-[2px]">
                <div v-for="img in images" :key="img.url" class="media-cell aspect-square">
                    <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 5+ imagens: 2 quadrados grandes em cima + faixa de 3 embaixo com overlay ── -->
        <template v-else>
            <div class="flex flex-col gap-[2px]">
                <!-- Linha superior: 2 quadrados -->
                <div class="grid grid-cols-2 gap-[2px]">
                    <div v-for="img in images.slice(0, 2)" :key="img.url" class="media-cell aspect-square">
                        <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                    </div>
                </div>
                <!-- Linha inferior: 3 células, última com overlay "+N" -->
                <div class="grid grid-cols-3 gap-[2px]">
                    <div v-for="(img, i) in images.slice(2, 5)" :key="img.url"
                        class="media-cell aspect-square relative">
                        <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                        <div v-if="i === 2 && images.length > 5"
                            class="absolute inset-0 bg-black/55 flex items-center justify-center cursor-pointer"
                            @click="open(images[4])">
                            <span class="text-white text-2xl font-semibold tracking-tight select-none">
                                +{{ images.length - 5 }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </template>

    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    images: {
        type: Array,
        default: () => []   // [{ url: string, type: 'image' }]
    },
    post: {
        type: Object,
        required: true
    },
    module: {
        type: String,
        required: true
    },
    isParentPost: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['open']);

const wrapperClass = computed(() => ({
    'box-border -ml-[21px] -mr-[10px]': props.isParentPost
}));

const open = (selected) => {
    emit('open', {
        selected,
        post: props.post,
        list: props.images,
        module: props.module
    });
};
</script>

<style scoped>
/* Célula base: fundo de loading + overflow para não vazar */
.media-cell {
    overflow: hidden;
    position: relative;
    background-color: rgb(230, 231, 232);
}

.dark .media-cell {
    background-color: rgb(24, 24, 24);
}

/* Fade suave no lazy load */
.media-cell img {
    transition: opacity 0.18s ease-in-out;
    display: block;
}

.media-cell img[lazy="loading"] {
    opacity: 0;
}

.media-cell img[lazy="loaded"] {
    opacity: 1;
}
</style>