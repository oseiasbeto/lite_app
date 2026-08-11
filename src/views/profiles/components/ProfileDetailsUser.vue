<template>
    <div class="relative">
        <div class="flex mb-2 items-center gap-1">
            <div class="relative shrink-0 mr-[16px]">
                <Avatar @click="$emit('goToPictureFullScreen')" size="big"
                    :url="profile?.profile_image?.thumbnails?.lg || profile?.profile_image?.url" />

                <!-- Bolinha de status -->
                <span v-if="profile?.is_online"
                    class="absolute bottom-[5px] right-[7px] bg-[rgba(63,187,70,1.0)] block h-4 w-4 rounded-full ring-2 ring-white dark:ring-[rgba(36,37,38,1.0)]"></span>
            </div>

            <div class="flex flex-col">
                <div class="flex mt-4 text-[13px] items-center gap-4">
                    
                    <span @click="$emit('goToFollowers')" class="active:opacity-50 flex flex-col">
                        <span class="font-bold text-base dark:text-white text-[rgb(40,40,41)]">{{
                            formattedCount(profile?.followers_count) }}
                        </span>

                        <span class="text-sm">Seguidores</span>

                    </span>
                 
                    <span @click="$emit('goToFollowing')" class="active:opacity-50 flex flex-col">
                        <span class="font-bold text-base dark:text-white text-[rgb(40,40,41)]">{{
                            formattedCount(profile?.following_count) }}
                        </span>

                        <span class="text-sm">Seguindo</span>
                    </span>
                 
                    <span @click="$emit('goToPosts')" class="active:opacity-50 flex flex-col">
                        <span class="font-bold text-base dark:text-white text-[rgb(40,40,41)]">{{
                            formattedCount(profile?.posts_count) }}
                        </span>

                        <span class="text-sm">Posts</span>

                    </span>
                    
                </div>
            </div>
        </div>

        <div class="flex leading-5 flex-col">
            <p class="font-semibold text-base font-bold dark:text-white text-[rgb(40,40,41)]">{{ profile?.name || 'Nome' }}
            </p>

            <p v-show="profile?.credentials?.length" class="text-x-light-textSecondary dark:text-x-dark-textSecondary text-sm">{{ profile?.credentials }}</p>
        </div>

        <div v-show="profile?.bio?.length" class="py-2">
            <p class="text-[15px] line-clamp-3 font-normal" v-html="profile?.bio"></p>
        </div>
    </div>

</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue';
import formattedCount from '@/utils/formatted-count';


defineEmits(['goToPictureFullScreen', 'goToFollowers', 'goToFollowing', 'goToPosts'])

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