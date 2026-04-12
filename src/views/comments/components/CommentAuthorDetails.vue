<template>
    <div>
        <div v-if="author?._id" class="flex gap-1 flex-row items-center">
            <div class="flex-1 text-[13px]">
                <div>
                    <span @click="goToProfile(author?._id)" class="dark:text-white text-[rgb(40,40,41)] font-bold">{{ author?.name }}</span>

                    <span> · </span>
                    <span>{{ formattedDate(createdAt) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import formattedDate from '@/utils/formatted-date';
import { useRouter } from 'vue-router';

const router = useRouter()

const goToProfile = (userId) => {
    router.push({
        path: '/profile/' + userId
    })
}

defineProps({
    author: {
        type: Object,
        required: true
    },
    createdAt: {
        type: String
    },
    userId: {
        type: String,
        required: true
    }
})
</script>