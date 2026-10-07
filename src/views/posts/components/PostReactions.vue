<template>
    <div class="flex items-center" :class="{ 'pointer-events-none': loading }">
        <div class="flex gap-1 items-center flex-1 justify-between">
            <!--Botao de like: coracao outline, preenche e fica vermelho TikTok ao curtir-->
            <button @click="$emit('on-upvote')"
                :class="[isLiked ? '!text-[#FE2C55]' : 'text-x-light-textSecondary dark:text-x-dark-textSecondary']"
                class="h-[32px] gap-1.5 text-center flex items-center active:scale-95 transition-transform">
                <span class="relative inline-flex items-center justify-center">
                    <!-- explosão de partículas, só aparece no momento do like -->
                    <span v-if="bursting" class="like-burst" aria-hidden="true">
                        <span v-for="particle in particles" :key="particle.id" class="like-burst__particle"
                            :style="particle.style"></span>
                    </span>

                    <svg v-if="!isLiked" aria-label="Gosto" role="img" viewBox="-0.5 0 25 24"
                        class="w-[22px] h-[22px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <title>Gosto</title>
                        <path
                            d="M16.5 2C14.8335 2 13.2217 2.70703 12 3.93652C10.7783 2.70704 9.1665 2 7.5 2C3.3785 2 0.5 5.08423 0.5 9.5C0.5 14.1284 4.84516 19.4619 11.311 22.7719C11.5267 22.8827 11.7633 22.9379 12 22.9379C12.2367 22.9379 12.4733 22.8827 12.689 22.7719C19.1548 19.4619 23.5 14.1284 23.5 9.5C23.5 5.08423 20.6217 2 16.5 2ZM12 20.8764C6.30767 17.8962 2.5 13.3467 2.5 9.5C2.5 6.15893 4.4625 4 7.5 4C9.5 4 11.25 5.75 12 7.5C12.75 5.75 14.5 4 16.5 4C19.5377 4 21.5 6.15893 21.5 9.5C21.5 13.3467 17.6923 17.8962 12 20.8764Z"
                            fill="currentColor"></path>
                    </svg>
                    <svg v-else aria-label="Não gosto" role="img" viewBox="-0.5 0 25 24"
                        class="w-[22px] h-[22px]" :class="{ 'heart-pop': popping }" fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg">
                        <title>Não gosto</title>
                        <path
                            d="M16.4045 1.50879C14.785 1.50879 13.2185 2.16259 12 3.30764C10.7815 2.16259 9.215 1.50879 7.5955 1.50879C3.41766 1.50879 0.5 4.62796 0.5 9.09411C0.5 13.7857 4.70617 18.9703 11.2153 22.3022C11.4605 22.428 11.7298 22.4912 11.9995 22.4912C12.2692 22.4912 12.5395 22.428 12.7847 22.3022C19.2938 18.9703 23.5 13.7857 23.5 9.09411C23.5 4.62796 20.5823 1.50879 16.4045 1.50879Z"
                            fill="currentColor"></path>
                    </svg>
                </span>
                <span v-show="upvotesCount" class="text-inherit text-[13px] font-semibold">
                    <FlipNumber :value="upvotesCount" />
                </span>
            </button>

            <!--Comentarios: balao outline com tres pontos-->
            <button @click="$emit('on-comment')"
                class="flex gap-1.5 items-center h-[32px] text-x-light-textSecondary dark:text-x-dark-textSecondary active:scale-95 transition-transform">
                <svg aria-label="Responder" role="img" viewBox="0 0 24 24" class="w-[22px] h-[22px]"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <title>Responder</title>
                    <path d="M12 3C6.98 3 3 6.58 3 11c0 2.4 1.15 4.55 3 6l-.9 3.6a.6.6 0 0 0 .86.67L9.8 18.9c.7.14 1.45.2 2.2.2 5.02 0 9-3.58 9-8s-3.98-8-9-8z"></path>
                    <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"></circle>
                    <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none"></circle>
                    <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"></circle>
                </svg>

                <span v-show="commentsCount" class="text-[13px] font-semibold">
                    <FlipNumber :value="commentsCount" />
                </span>
            </button>

            <!--Favoritos: marcador outline. Mantem o mesmo handler/contagem de antes-->
            <button @click="$emit('on-comment')"
                class="flex gap-1.5 items-center h-[32px] text-x-light-textSecondary dark:text-x-dark-textSecondary active:scale-95 transition-transform">
                <svg aria-label="" role="img" viewBox="0 0 24 24"
                    class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <title></title>
                    <path d="M7 3h10a1 1 0 0 1 1 1v16.3a.7.7 0 0 1-1.1.57L12 17.4l-4.9 3.47A.7.7 0 0 1 6 20.3V4a1 1 0 0 1 1-1z"></path>
                </svg>

                <span v-show="commentsCount" class="text-[13px] font-semibold">
                    <FlipNumber :value="commentsCount" />
                </span>
            </button>

            <!--Partilhar: seta curva outline-->
            <button @click="$emit('on-share')"
                class="text-x-light-textSecondary dark:text-x-dark-textSecondary flex items-center gap-1.5 h-[32px] active:scale-95 transition-transform">
                <svg aria-label="Partilhar" role="img" viewBox="0 0 24 24" class="w-[22px] h-[22px]"
                    fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                    <title>Partilhar</title>
                    <path d="M13.5 5.5v2.1C8 8.2 4 11.9 3.2 18.5c-.1.7.8 1.1 1.3.6C6.8 16 9.7 14.8 13.5 14.7v4.1c0 .8.9 1.2 1.5.7l7.2-6.4a1 1 0 0 0 0-1.5L15 4.8c-.6-.5-1.5-.1-1.5.7z"></path>
                </svg>
                <p v-show="sharesCount" class="text-[13px] font-semibold">
                    <FlipNumber :value="sharesCount" />
                </p>
            </button>

            <button v-if="showBtnMore" @click="$emit('on-more')" aria-label="Mais opções"
                class="h-[32px] min-w-[32px] text-x-light-textSecondary dark:text-x-dark-textSecondary flex items-center justify-center">
                <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.25 11.25a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Zm-7 0a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Zm14 0a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Z"
                        class="icon_svg-stroke" fill="currentColor" stroke="currentColor" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import FlipNumber from '@/components/UI/Flipnumber.vue'

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        default: null
    },
    upvotes: {
        type: Array,
        default: []
    },
    upvotesCount: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Array,
        default: []
    },
    downvotesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    sharesCount: {
        type: Number,
        default: 0
    },
    isDarkoo: {
        type: Boolean,
        default: false
    },
    showBtnMore: {
        type: Boolean,
        default: true
    }
})

defineEmits(['on-upvote', 'on-downvote', 'on-comment', 'on-share', 'on-more'])

// detecta a transição de "não curtido" -> "curtido" pra disparar a animação
// só quando o like é dado (igual ao X, que não anima no unlike)
const isLiked = computed(() => props.upvotes?.includes(props.userId))

const bursting = ref(false)
const popping = ref(false)
const particles = ref([])

let burstTimeout = null
let popTimeout = null
let particleIdSeed = 0

// paleta TikTok: vermelho, ciano e tons quentes
const PARTICLE_COLORS = ['#FE2C55', '#25F4EE', '#FFAD1F', '#FF8C69', '#FE2C55', '#25F4EE']

function buildParticles() {
    const count = 8
    const list = []

    for (let i = 0; i < count; i++) {
        const angle = (360 / count) * i + (Math.random() * 20 - 10)
        const distance = 14 + Math.random() * 8
        const rad = (angle * Math.PI) / 180
        const tx = Math.cos(rad) * distance
        const ty = Math.sin(rad) * distance
        const size = 4 + Math.random() * 3
        const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length]
        const delay = Math.random() * 0.04

        list.push({
            id: particleIdSeed++,
            style: {
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                animationDelay: `${delay}s`
            }
        })
    }

    return list
}

function triggerLikeAnimation() {
    clearTimeout(burstTimeout)
    clearTimeout(popTimeout)

    particles.value = buildParticles()

    // desliga e religa no próximo frame pra garantir que a animação
    // reinicie do zero mesmo em cliques muito rápidos
    bursting.value = false
    popping.value = false

    requestAnimationFrame(() => {
        bursting.value = true
        popping.value = true
    })

    burstTimeout = setTimeout(() => {
        bursting.value = false
    }, 700)

    popTimeout = setTimeout(() => {
        popping.value = false
    }, 450)
}

watch(isLiked, (likedNow, likedBefore) => {
    if (likedNow && !likedBefore) {
        triggerLikeAnimation()
    }
})
</script>

<style scoped>
.like-burst {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    pointer-events: none;
}

.like-burst__particle {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    animation: like-burst-particle 0.6s ease-out forwards;
}

@keyframes like-burst-particle {
    0% {
        transform: translate(-50%, -50%) translate(0, 0) scale(0);
        opacity: 1;
    }

    30% {
        opacity: 1;
    }

    100% {
        transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1);
        opacity: 0;
    }
}

.heart-pop {
    animation: heart-pop 0.45s cubic-bezier(0.17, 0.89, 0.32, 1.49);
}

@keyframes heart-pop {
    0% {
        transform: scale(1);
    }

    30% {
        transform: scale(1.35);
    }

    50% {
        transform: scale(0.85);
    }

    75% {
        transform: scale(1.15);
    }

    100% {
        transform: scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .heart-pop,
    .like-burst__particle {
        animation: none;
    }
}
</style>