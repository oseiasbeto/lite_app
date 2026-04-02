<template>
    <div class="flex items-center gap-1">
        <div class="shrink-0">
            <Avatar size="md" url=""/> 
        </div>
         
        <div>
           <p>{{ user?.name || 'Nome' }}</p> 
           <p>Descricao</p>
        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';

defineProps({
    user: {
        type: Object,
        required: true
    }
})
</script>