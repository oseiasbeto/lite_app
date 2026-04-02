<template>
    <div>
        <div v-if="author?._id" class="flex gap-1 flex-row items-center">
            <div @click="goToProfile(author?._id)" class="shrink-0">
                <Avatar size="xs" url="" />
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                        <div @click="goToProfile(author?._id)">
                            <span class="text-sm">{{ author?.name }}</span>
                        </div>
                        <div>
                            <button :disabled="isFollowingUser" @click="$emit('onFollow')" class="p-0.5 text-xs disabled:text-gray-400 text-sky-500"
                                v-if="showBtnFollow">Seguir</button>
                        </div>
                    </div>

                </div>

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
        path: '/profile/' + userId
    })
}

defineEmits(['onFollow'])

defineProps({
    author: {
        type: Object,
        required: true
    },
    isParentPost: {
        type: Boolean,
        default: false
    },
    isFollowingUser: {
        type: Boolean,
        default: false
    },
    showBtnFollow: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date
    },
    userId: {
        type: String,
        default: null
    }
})
</script>