<template>
    <div
        class="fixed top-0 left-0 overflow-hidden z-[9999] bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.3)] w-screen h-screen">
        <span class="absolute w-full h-0.5 bg-gray-200 top-0">
            <div class="h-full transition-all duration-[0.5s] ease-in-out bg-red-500" :style="{ width: `${progress}%` }"> </div>
        </span>
        
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const progress = ref(0)

let interval = null

const startProgress = () => {
    progress.value = 0

    interval = setInterval(() => {
        if (progress.value < 90) {
            progress.value += 10
        }
    }, 100)
}

const finishProgress = () => {
    clearInterval(interval)
    progress.value = 100
    setTimeout(() => {
        progress.value = 0
          interval = null
    }, 100)
}

onMounted(() => {
    startProgress()
})

onUnmounted(() => {
    finishProgress()
})
</script>
