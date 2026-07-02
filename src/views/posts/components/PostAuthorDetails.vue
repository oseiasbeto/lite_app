<template>
    <div>
        <div v-if="author?._id" class="flex items-center flex-row" :class="isParentPost ? 'gap-1' : 'gap-2.5'">
            <div @click="goToProfile(author?._id)" class="relative shrink-0">
                <Avatar :size="isParentPost ? 's' : 'md'"
                    :url="isParentPost ? author?.profile_image?.thumbnails?.xs || author?.profile_image?.url : author?.profile_image?.thumbnails?.sm || author?.profile_image?.url" />

                <!-- Bolinha de status -->
                <span v-if="author?.is_online && !isParentPost"
                    class="absolute bottom-[2px] right-0 bg-[rgba(63,187,70,1.0)] block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[rgba(36,37,38,1.0)]"></span>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                        <div class="flex items-center" @click="goToProfile(author?._id)">
                            <span :class="isParentPost ? 'font-normal' : 'font-bold'" class="text-sm text-inherit">{{
                                author?.name }}
                            </span>

                            <svg v-if="author?.is_verified" :class="{ 'w-[12px] h-[12px]': isParentPost }" viewBox="0 0 22 22" aria-label="Verified account" role="img"
                                class="w-[16px] h-[16px] text-x-light-blue ml-[2px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                                data-testid="icon-verified">
                                <g>
                                    <path
                                        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z">
                                    </path>
                                </g>
                            </svg>
                        </div>
                        <span v-show="!isParentPost && showBtnFollow"
                            class="text-x-light-textSecondary dark:text-x-dark-textSecondary text-[13px]"> · </span>
                        <div v-show="!isParentPost && showBtnFollow">
                            <button :disabled="isFollowingUser" @click="$emit('onFollow')"
                                class="text-[13px] text-[#4894fd] disabled:text-gray-400 font-semibold"
                                v-if="showBtnFollow">Seguir</button>
                        </div>
                    </div>

                </div>

                <div v-show="!isParentPost"
                    class="flex text-sm text-x-light-textSecondary dark:text-x-dark-textSecondary  leading-4 items-center">
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