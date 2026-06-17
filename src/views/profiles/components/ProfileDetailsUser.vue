<template>
    <div class="relative">
        <div class="flex mb-2 items-center gap-1">
            <div class="relative shrink-0 mr-[16px]">
                <Avatar size="big" :url="profile?.profile_image?.thumbnails?.lg || profile?.profile_image?.url" />

                <!-- Bolinha de status -->
                <span v-if="profile?.is_online"
                    class="absolute bottom-[5px] right-[7px] bg-[rgba(63,187,70,1.0)] block h-4 w-4 rounded-full ring-2 ring-white dark:ring-[rgba(36,37,38,1.0)]"></span>
            </div>

            <div class="flex flex-col">
                <div class="flex items-center">
                    <p class="font-bold text-[21px] dark:text-white text-[rgb(40,40,41)]">{{ profile?.name || 'Nome' }}
                    </p>

                    <svg v-if="profile?.is_verified" class="ml-[5px] shrink-0 mr-[2px]" fill="none" width="21"
                        viewBox="0 0 24 24" height="21">
                        <circle cx="12" cy="12" r="11.5" fill="currentColor"></circle>
                        <path class="text-white dark:text-[#262626]" fill="currentColor" fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
                        </path>
                    </svg>
                </div>



                <div class="flex mt-4 text-[13px] items-center gap-1.5">
                    <span> <span class="dark:text-white text-[rgb(40,40,41)]">{{
                        formattedCount(profile?.followers_count) }}</span> Seguidores</span>
                    <span style="box-sizing: border-box;"> · </span>
                    <span> <span class="dark:text-white text-[rgb(40,40,41)]">{{
                        formattedCount(profile?.following_count) }}</span> Seguindo</span>
                </div>
            </div>
        </div>

        <div v-show="profile?.bio?.length" class="py-2">
            <p class="text-[15px] line-clamp-3 font-normal" v-html="profile?.bio"></p>
        </div>
    </div>

</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';
import formattedCount from '@/utils/formatted-count';

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