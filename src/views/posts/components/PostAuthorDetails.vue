<template>
    <div>
        <div v-if="author?._id" class="flex items-center flex-row" :class="isParentPost ? 'gap-1' : 'gap-2.5'">
            <div @click="goToProfile(author?._id)" class="relative shrink-0">
                <Avatar :size="isParentPost ? 's' : 'md'"
                    :url="isParentPost ? author?.profile_image?.thumbnails?.xs || author?.profile_image?.url : author?.profile_image?.thumbnails?.sm || author?.profile_image?.url" />

                <!-- Bolinha de status -->
                <span v-if="author?.is_online && !isParentPost"
                    class="absolute bottom-[2px] right-0 bg-[rgba(63,187,70,1.0)] block h-3 w-3 rounded-full ring-2 ring-white dark:ring-[rgba(36,37,38,1.0)]"></span>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                        <div class="flex items-center" @click="goToProfile(author?._id)">
                            <span :class="isParentPost ? 'font-normal' : 'font-bold'"
                                class="text-sm dark:text-white text-[rgb(40,40,41)]">{{ author?.name }}
                            </span>

                            <svg v-if="author?.is_verified" :class="{ 'w-[12px] h-[12px]': isParentPost }"
                                class="ml-[5px] mb-0.5" fill="none" width="14" viewBox="0 0 24 24" height="14">
                                <circle cx="12" cy="12" r="11.5" fill="#0F73FF"></circle>
                                <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
                                </path>
                            </svg>
                        </div>
                        <span v-show="!isParentPost && showBtnFollow" class="dark:text-[#e6e7e8] text-[13px]"> · </span>
                        <div v-show="!isParentPost && showBtnFollow">
                            <button :disabled="isFollowingUser" @click="$emit('onFollow')"
                                class="text-[13px] text-[#4894fd] disabled:text-gray-400 font-semibold"
                                v-if="showBtnFollow">Seguir</button>
                        </div>
                    </div>

                </div>

                <div v-show="!isParentPost" class="flex text-sm dark:text-[#b0b3b8] leading-4 items-center">
                    <span class="trunc" v-show="author?.credentials">
                        <span class="break-all break-words">{{ author?.credentials }}</span>
                    </span>
                    <span v-show="author?.credentials">&nbsp;·&nbsp;</span>
                    <span>{{ formattedDate(createdAt) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';
import formattedDate from '@/utils/formatted-date';
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
        type: String
    },
    userId: {
        type: String,
        default: null
    }
})
</script>

<style scoped>
.trunc {
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
}
</style>