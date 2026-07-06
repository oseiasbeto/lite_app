<template>
    <div v-if="images?.length" class="w-full overflow-hidden">

        <!-- ── 1 imagem: usa a proporção ORIGINAL (largura/altura reais), limitada ── -->
        <template v-if="images.length === 1">
            <div class="media-cell w-full rounded-2xl overflow-hidden"
                :style="{ aspectRatio: getRatio(images[0]), maxHeight: MAX_SINGLE_HEIGHT + 'px' }">
                <img v-lazy="imgSrc(images[0])" loading="lazy" decoding="async"
                    class="w-full h-full object-cover cursor-pointer block"
                    @click="open(images[0])" />
            </div>
        </template>

        <!-- ── 2 imagens: dois quadrados lado a lado ── -->
        <template v-else-if="images.length === 2">
            <div class="grid grid-cols-2 gap-[2px] rounded-2xl overflow-hidden aspect-[16/9]"
                :style="{ maxHeight: MAX_GRID_ROW_HEIGHT + 'px' }">
                <div v-for="(img, i) in images" :key="img.url" class="media-cell"
                    :class="i === 0 ? 'rounded-l-2xl' : 'rounded-r-2xl'">
                    <img v-lazy="imgSrc(img)" loading="lazy" decoding="async"
                        class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 3 imagens: quadrado grande à esquerda + 2 quadrados empilhados à direita ── -->
        <template v-else-if="images.length === 3">
            <div class="grid grid-cols-2 gap-[2px] rounded-2xl overflow-hidden aspect-[16/9]"
                style="grid-template-rows: 1fr 1fr;" :style="{ maxHeight: MAX_GRID_ROW_HEIGHT + 'px' }">
                <div class="media-cell row-span-2 rounded-l-2xl">
                    <img v-lazy="imgSrc(images[0])" loading="lazy" decoding="async"
                        class="w-full h-full object-cover cursor-pointer" @click="open(images[0])" />
                </div>
                <div v-for="(img, i) in images.slice(1)" :key="img.url" class="media-cell"
                    :class="i === 0 ? 'rounded-tr-2xl' : 'rounded-br-2xl'">
                    <img v-lazy="imgSrc(img)" loading="lazy" decoding="async"
                        class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 4 imagens: grade 2×2 ── -->
        <template v-else-if="images.length === 4">
            <div class="grid grid-cols-2 grid-rows-2 gap-[2px] rounded-2xl overflow-hidden aspect-[16/9]"
                :style="{ maxHeight: MAX_GRID_ROW_HEIGHT + 'px' }">
                <div v-for="(img, i) in images" :key="img.url" class="media-cell" :class="cornerClass4(i)">
                    <img v-lazy="imgSrc(img)" loading="lazy" decoding="async"
                        class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                </div>
            </div>
        </template>

        <!-- ── 5+ imagens: 2 quadrados grandes em cima + faixa de 3 embaixo com overlay ── -->
        <template v-else>
            <div class="flex flex-col gap-[2px] rounded-2xl overflow-hidden">
                <div class="grid grid-cols-2 gap-[2px] aspect-[16/9]"
                    :style="{ maxHeight: MAX_GRID_ROW_HEIGHT + 'px' }">
                    <div v-for="(img, i) in images.slice(0, 2)" :key="img.url" class="media-cell"
                        :class="i === 0 ? 'rounded-tl-2xl' : 'rounded-tr-2xl'">
                        <img v-lazy="imgSrc(img)" loading="lazy" decoding="async"
                            class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-[2px] aspect-[24/9]"
                    :style="{ maxHeight: MAX_GRID_ROW_HEIGHT_SM + 'px' }">
                    <div v-for="(img, i) in images.slice(2, 5)" :key="img.url" class="media-cell relative"
                        :class="i === 0 ? 'rounded-bl-2xl' : i === 2 ? 'rounded-br-2xl' : ''">
                        <img v-lazy="imgSrc(img)" loading="lazy" decoding="async"
                            class="w-full h-full object-cover cursor-pointer" @click="open(img)" />
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
        default: () => []   // [{ url: string, type: 'image', width?: number, height?: number, thumbnails?: {...} }]
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

// Limites de proporção, igual o X: nunca deixa a imagem ficar
// muito "espaguete" vertical nem uma faixa horizontal gigante.
const MIN_RATIO = 0.5;     // limite retrato (1:2)
const MAX_RATIO = 1.7778;  // limite paisagem (16:9)

// ── Limites de altura ───────────────────────────────────────────────────
// Aplicados ao CONTENTOR (não à <img>), para que a imagem (w-full h-full)
// se ajuste sempre ao mesmo limite e nunca sobre espaço vazio por baixo.
// Também mantém a altura de cada post num intervalo previsível, o que
// ajuda a estimativa de altura usada na virtualização do feed (PostList).
const MAX_SINGLE_HEIGHT = 510     // caso de 1 imagem (retrato/paisagem livre)
const MAX_GRID_ROW_HEIGHT = 420   // linhas 16:9 (2, 3, 4 imagens e topo do 5+)
const MAX_GRID_ROW_HEIGHT_SM = 260 // faixa inferior do layout de 5+ imagens

const getRatio = (img) => {
    if (!img?.width || !img?.height) return MAX_RATIO; // fallback se não vier metadata
    const ratio = img.width / img.height;
    return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
};

// Usa uma miniatura mais leve se a API a disponibilizar (poupa dados em
// redes lentas e reduz o tamanho da imagem a descodificar); cai sempre
// para o url original se não houver thumbnails, sem alterar o comportamento.
const imgSrc = (img) => img?.thumbnails?.md || img?.thumbnails?.url || img?.url;
</script>

<style scoped>
.media-cell {
    overflow: hidden;
    position: relative;
    background-color: rgb(230, 231, 232);
    border: 1px solid rgb(239, 243, 244);
    /* Nada aqui sai da caixa (sem tooltips/overlays a transbordar), por isso
       o containment é seguro: isola o custo de layout/paint deste elemento
       sem risco de cortar conteúdo visível, ao contrário do que aconteceria
       em componentes com elementos decorativos a sair da caixa. */
    contain: content;
}

.dark .media-cell {
    background-color: rgb(24, 24, 24);
    border-color: rgb(47, 51, 54);
}

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