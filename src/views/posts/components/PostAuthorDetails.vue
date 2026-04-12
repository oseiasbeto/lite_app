<template>
    <div>
        <div v-if="author?._id" class="flex items-center flex-row" :class="isParentPost ? 'gap-1' : 'gap-2.5'">
            <div @click="goToProfile(author?._id)" class="shrink-0">
                <Avatar :size="isParentPost ? 's' : 'md'"
                    :url=" isParentPost ? author?.profile_image?.thumbnails?.xs || author?.profile_image?.url : author?.profile_image?.thumbnails?.sm || author?.profile_image?.url" />
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                        <div @click="goToProfile(author?._id)">
                            <span :class="isParentPost ? 'font-normal' : 'font-bold'"
                                class="text-[13px] dark:text-white text-[rgb(40,40,41)]">{{ author?.name }}</span>
                        </div>
                        <span v-show="!isParentPost && showBtnFollow" class="dark:text-[#e6e7e8] text-[13px]"> · </span>
                        <div v-show="!isParentPost && showBtnFollow">
                            <button :disabled="isFollowingUser" @click="$emit('onFollow')"
                                class="text-[13px] text-[#4894fd] disabled:text-gray-400 font-semibold"
                                v-if="showBtnFollow">Seguir</button>
                        </div>
                    </div>

                </div>

                <div v-show="!isParentPost" class="flex text-[13px] leading-4 items-center">
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