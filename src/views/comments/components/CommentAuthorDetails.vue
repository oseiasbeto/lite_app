<template>
    <div>
        <div v-if="author?._id" class="flex gap-1 flex-row items-center">
            <div class="flex-1 text-[13px]">
                <div class="flex items-center">
                    <span @click="goToProfile(author?._id)" class="dark:text-white text-[rgb(40,40,41)] font-bold">{{
                        author?.name }}</span>
                    <svg v-if="author?.is_verified" class="ml-[5px] mb-[3px] mr-[2px]" fill="none" width="13" viewBox="0 0 24 24"
                        height="13">
                        <circle cx="12" cy="12" r="11.5" fill="#0F73FF"></circle>
                        <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
                            d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
                        </path>
                    </svg>
                    <span class="flex items-center dark:text-[#b0b3b8]">
                        <span> · </span>
                        <span>{{ formattedDate(createdAt) }}</span>
                    </span>
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