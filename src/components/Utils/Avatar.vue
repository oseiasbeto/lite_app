<template>
    <div class="bg-background-secondary shrink-0 relative overflow-hidden rounded-full"
        :class="[sizeClasses]" role="img" :aria-label="`Avatar de ${altText || 'nome'}`">
        <img v-lazy="props?.url && props.url" :alt="`Avatar de ${altText || 'nome'}`" class=" w-full h-full object-cover"
            :class="[sizeClasses]" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
    url: {
        type: String,
        required: true,
        default: '',
    },
    altText: {
        type: String,
        default: 'Usuário',
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['s', 'xs', 'xl', 'big', 'sm', 'md', 'lg'].includes(value),
    },
});

// Classes dinâmicas para tamanhos
const sizeClasses = computed(() => {
    return {
        s: 'w-[18px] h-[18px]',
        xs: 'w-[20px] h-[20px]',
        xl: 'w-[24px] h-[24px]',
        sm: 'w-[32px] h-[32px]',
        md: 'w-[36px] h-[36px]',
        lg: 'w-[40px] h-[40px]',
        big: 'w-[80px] h-[80px]'
    }[props.size] || 'w-11 h-11';
});

</script>