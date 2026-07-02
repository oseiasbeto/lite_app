<template>
    <div v-if="images?.length" class="w-full overflow-hidden">

        <!-- ── 1 imagem: largura total, cantos arredondados, altura contida ── -->
        <template v-if="images.length === 1">
            <div class="media-cell w-full rounded-2xl">
                <img v-lazy="images[0].url"
                    class="w-full h-auto max-h-[510px] min-h-[280px] object-cover cursor-pointer block"
                    @click="open(images[0])" />
            </div>
        </template>

        <!-- ── 2 imagens: dois quadrados lado a lado ── -->
        <template v-else-if="images.length === 2">
            <div class="grid grid-cols-2 gap-[2px] rounded-2xl overflow-hidden aspect-[16/9]">
                <div v-for="(img, i) in images" :key="img.url" class="media-cell"
                    :class="i === 0 ? 'rounded-l-2xl' : 'rounded-r-2xl'">
                    <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 3 imagens: quadrado grande à esquerda + 2 quadrados empilhados à direita ── -->
        <template v-else-if="images.length === 3">
            <div class="grid grid-cols-2 gap-[2px] rounded-2xl overflow-hidden aspect-[16/9]"
                style="grid-template-rows: 1fr 1fr;">
                <!-- Esquerda: ocupa as duas linhas -->
                <div class="media-cell row-span-2 rounded-l-2xl">
                    <img v-lazy="images[0].url" class="w-full h-full object-cover cursor-pointer"
                        @click="open(images[0])" />
                </div>
                <!-- Direita: duas células, primeira e última com canto arredondado -->
                <div v-for="(img, i) in images.slice(1)" :key="img.url" class="media-cell"
                    :class="i === 0 ? 'rounded-tr-2xl' : 'rounded-br-2xl'">
                    <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 4 imagens: grade 2×2 ── -->
        <template v-else-if="images.length === 4">
            <div class="grid grid-cols-2 grid-rows-2 gap-[2px] rounded-2xl overflow-hidden aspect-[16/9]">
                <div v-for="(img, i) in images" :key="img.url" class="media-cell" :class="cornerClass4(i)">
                    <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 5+ imagens: 2 quadrados grandes em cima + faixa de 3 embaixo com overlay ── -->
        <template v-else>
            <div class="flex flex-col gap-[2px] rounded-2xl overflow-hidden">
                <!-- Linha superior: 2 quadrados -->
                <div class="grid grid-cols-2 gap-[2px] aspect-[16/9]">
                    <div v-for="(img, i) in images.slice(0, 2)" :key="img.url" class="media-cell"
                        :class="i === 0 ? 'rounded-tl-2xl' : 'rounded-tr-2xl'">
                        <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                    </div>
                </div>
                <!-- Linha inferior: 3 células, última com overlay "+N" -->
                <div class="grid grid-cols-3 gap-[2px] aspect-[24/9]">
                    <div v-for="(img, i) in images.slice(2, 5)" :key="img.url" class="media-cell relative"
                        :class="i === 0 ? 'rounded-bl-2xl' : i === 2 ? 'rounded-br-2xl' : ''">
                        <img v-lazy="img.url" class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                        <div v-if="i === 2 && images.length > 5"
                            class="absolute inset-0 bg-black/55 hover:bg-black/60 flex items-center justify-center cursor-pointer transition-colors"
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

const open = (selected) => {
    emit('open', {
        selected,
        post: props.post,
        list: props.images,
        module: props.module
    });
};

// Cantos arredondados apenas nas 4 pontas externas da grade 2x2
const cornerClass4 = (i) => {
    return ['rounded-tl-2xl', 'rounded-tr-2xl', 'rounded-bl-2xl', 'rounded-br-2xl'][i];
};
</script>

<style scoped>
/* Célula base: fundo de loading + overflow para não vazar + borda sutil estilo X */
.media-cell {
    overflow: hidden;
    position: relative;
    background-color: rgb(230, 231, 232);
    border: 1px solid rgb(239, 243, 244);
}

.dark .media-cell {
    background-color: rgb(24, 24, 24);
    border-color: rgb(47, 51, 54);
}

/* Fade suave no lazy load */
.media-cell img {
    transition: opacity 0.18s ease-in-out, filter 0.15s ease-in-out;
    display: block;
}

.media-cell img:hover {
    filter: brightness(0.92);
}

.media-cell img[lazy="loading"] {
    opacity: 0;
}

.media-cell img[lazy="loaded"] {
    opacity: 1;
}
</style>