<template>
    <div class="flex items-center gap-1">
        <div class="shrink-0">
            <Avatar size="md" url=""/> 
        </div>
         
        <div>
           <p>{{ profile?.name || 'Nome' }}</p> 
           <p>Descricao</p>
        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';

const props = defineProps({
    profile: {
        type: Object,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
})
</script>