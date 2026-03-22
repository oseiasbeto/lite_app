<template>
    <button @click="goToComposer(module)">
        Oque estas pensando?
    </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
    module: {
        type: String,
        required: true
    }
})

const router = useRouter()

const goToComposer = (module) => {
    router.push({
        path: '/composer',
        query: {
            module: module
        }
    })
}
</script>