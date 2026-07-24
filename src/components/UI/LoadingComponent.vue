<template>
    <div
        class="fixed top-0 left-0 overflow-hidden z-[9999] bg-[rgba(0,0,0,0.5)] dark:bg-[rgba(0,0,0,0.65)] w-screen h-screen">
        <span class="absolute w-full h-[4px] bg-x-light-surface dark:bg-x-dark-surface top-0 overflow-hidden">
            <div
                class="h-full transition-all duration-[0.5s] ease-in-out animate-gradient-move bg-[length:200%_100%]"
                :style="{
                    width: `${progress}%`,
                    backgroundImage:
                        'linear-gradient(90deg, #4f5bd5, #962fbf, #d62976, #fa7e1e, #feda75, #4f5bd5)'
                }"
            ></div>
        </span>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const progress = ref(0);
let interval = null;

const startProgress = () => {
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
</style>