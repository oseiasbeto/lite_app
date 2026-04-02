<template>
    <div>
        <div v-if="author?._id" class="flex gap-1 flex-row items-center">
            <div @click="goToProfile(author?._id)" class="shrink-0">
                <Avatar size="xs" url=""/>
            </div>
            <div class="flex-1">
                <span @click="goToProfile(author?._id)" class="text-sm">{{ author?.name }}</span>
                <span></span>
            </div>
        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const goToProfile = (userId) => {
    router.push({
        path: '/profile/'+userId
    })
}

defineProps({
    author: {
        type: Object,
        required: true
    },
    isParentPost: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date
    },
    userId: {
        type: String,
        required: true
    }
})
</script>