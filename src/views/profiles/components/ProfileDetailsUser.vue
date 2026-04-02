<template>
    <div class="relative">
        <div class="flex mb-2 items-center gap-1">
            <div class="shrink-0">
                <Avatar size="md" url="" />
            </div>

            <div class="flex flex-col">
                <p>{{ profile?.name || 'Nome' }}</p>
                <div class="flex items-center gap-2">
                    <span> {{ profile?.followers_count }} Seguidores</span>
                    <span> {{ profile?.following_count }} Seguindo</span>
                </div>
            </div>
        </div>

        <div>
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