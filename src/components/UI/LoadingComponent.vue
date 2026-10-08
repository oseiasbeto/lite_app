<template>
    <div class="fixed left-0 top-0 z-[9999] h-screen h-[100dvh] w-screen overflow-hidden bg-[rgba(0,0,0,0.5)] dark:bg-[rgba(0,0,0,0.65)]"
        role="status" aria-live="polite" aria-label="A carregar">

        <!-- Barra de progresso no topo -->
        <span class="absolute left-0 top-0 h-[4px] w-full overflow-hidden bg-white/20">
            <div class="animate-gradient-move h-full rounded-r-full bg-[length:200%_100%] transition-all duration-[0.5s] ease-in-out"
                :style="{
                    width: `${progress}%`,
                    backgroundImage:
                        'linear-gradient(90deg, #25F4EE, #FE2C55, #25F4EE, #FE2C55)',
                    boxShadow: '0 0 8px rgba(254, 44, 85, 0.6)'
                }"></div>
        </span>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const progress = ref(0);
let interval = null;

const startProgress = () => {
    clearInterval(interval);
    progress.value = 0;
    interval = setInterval(() => {
        if (progress.value < 90) {
            progress.value += 10;
        }
    }, 100);
};

const finishProgress = () => {
    clearInterval(interval);
    progress.value = 100;
    setTimeout(() => {
        progress.value = 0;
        interval = null;
    }, 100);
};

onMounted(() => {
    startProgress();
});

onUnmounted(() => {
    finishProgress();
});

defineExpose({ startProgress, finishProgress });
</script>

<style scoped>
@keyframes gradient-move {
    0% {
        background-position: 0% 50%;
    }

    100% {
        background-position: 200% 50%;
    }
}

.animate-gradient-move {
    animation: gradient-move 2s linear infinite;
}

/* ── Loader TikTok: dois pontos que se cruzam ── */
.tt-loader {
    position: relative;
    width: 56px;
    height: 24px;
}

.tt-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 14px;
    height: 14px;
    margin: -7px 0 0 -7px;
    border-radius: 9999px;
    animation: tt-orbit 1.1s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.tt-dot-cyan {
    background: #25F4EE;
}

.tt-dot-red {
    background: #FE2C55;
    animation-delay: -0.55s;
}

@keyframes tt-orbit {
    0% {
        transform: translateX(-16px) scale(1);
        z-index: 1;
    }

    25% {
        transform: translateX(0) scale(0.65);
        z-index: 0;
    }

    50% {
        transform: translateX(16px) scale(1);
        z-index: 1;
    }

    75% {
        transform: translateX(0) scale(1.3);
        z-index: 2;
    }

    100% {
        transform: translateX(-16px) scale(1);
        z-index: 1;
    }
}

@media (prefers-reduced-motion: reduce) {

    .tt-dot,
    .animate-gradient-move {
        animation-duration: 3s;
    }
}
</style>