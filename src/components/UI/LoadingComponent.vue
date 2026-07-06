<template>
    <div
        class="fixed top-0 left-0 overflow-hidden z-[9999] bg-[rgba(0,0,0,0.7)] dark:bg-[rgba(0,0,0,0.65)] w-screen h-screen">
        <span class="absolute w-full h-[3px] dark:bg-[rgba(0,0,0,0.5)] top-0">
            <div 
                class="h-full transition-all duration-[0.5s] ease-in-out" 
                :style="{ 
                    width: `${progress}%`, 
                    background: 'linear-gradient(90deg, #fd267d, #ff7854)' 
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
</script>