<template>
    <div class="flex flex-col">
        <div @click="goToComposer(module)">
            Oque estas pensando?
        </div>

        <div class="flex items-center gap-1">
            <button class="p-2" @click="goToComposer(module)">Perguntar</button>
            <button class="p-2">Responder</button>
            <button class="p-2" @click="goToComposer(module, 'post')">Postar</button>
        </div>
    </div>

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

const goToComposer = (module, postType) => {
    router.push({
        path: '/composer',
        query: {
            module: module,
            ...(postType && {
                post_type: postType
            })
        }
    })
}
</script>