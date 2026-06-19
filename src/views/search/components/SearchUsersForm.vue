<template>
    <div class="w-full z-50 bg-transparent h-10 pb-0">
        <div class="flex items-center h-full  gap-3">
            <div class="flex items-center w-full py-2 px-4">
                <div class="h-[36px] w-full flex items-center relative">
                    <span class="absolute text-[#939598] dark:text-white/[0.8] left-[8px]">
                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm10.45 2.95L16 16l4.95 4.95Z"
                                class="icon_svg-stroke" stroke="currentColor" stroke-width="1.8" fill="none"
                                stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </span>
                    <input ref="searchInput" v-model="query" @input="handleSearch" :placeholder="placeholder"
                        class="h-full pl-[28px] peer w-full bg-transparent  text-[15px] placeholder:text-[#939598] placeholder:dark:text-[#b1b3b6] border p-2 focus:shadow-[rgb(235,240,255)_0px_0px_0px_2px] dark:focus:shadow-[rgb(40,45,65)_0px_0px_0px_2px] dark:border-[rgb(57,56,57)] dark:text-white outline-none transition-all text-[rgb(40,40,41)] focus:!border-[#2e69ff]" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, nextTick, ref } from 'vue';

defineProps({
    placeholder: {
        type: String,
        default: "Insira o nome do destinatário"
    }
})

const emit = defineEmits(['go-back', 'search', 'clear-search'])

const query = ref('')
const searchInput = ref(null)

const handleSearch = () => {
    emit('search', query.value)
}

const clearSearch = () => {
    query.value = ''
    nextTick(() => searchInput.value.focus())
    emit('clear-search')
}

const focusInput = () => searchInput.value.focus()


onMounted(() => {
    focusInput()
})

// Expõe a função para o componente pai
defineExpose({
    clearSearch,
    focusInput
});
</script>