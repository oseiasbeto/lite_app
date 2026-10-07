<template>
    <div class="relative flex flex-col items-center text-center px-4 pt-4">
        <!-- Avatar -->
        <div class="relative shrink-0">
            <Avatar @click="$emit('goToPictureFullScreen')" size="big"
                :url="profile?.profile_image?.thumbnails?.lg || profile?.profile_image?.url" />

            <!-- Bolinha de status -->
            <span v-if="profile?.is_online"
                class="absolute bottom-[5px] right-[7px] bg-[#25f4ee] block h-4 w-4 rounded-full ring-2 ring-white dark:ring-[rgba(36,37,38,1.0)]"></span>
        </div>

        <!-- Nome e credenciais -->
        <div class="mt-3 flex flex-col items-center leading-5">
            <p class="font-bold text-[17px] dark:text-white text-[rgb(22,24,35)]">
                {{ profile?.name || 'Nome' }}
            </p>

            <p v-show="profile?.credentials?.length"
                class="mt-0.5 text-x-light-textSecondary dark:text-x-dark-textSecondary text-[13px]">
                {{ profile?.credentials }}
            </p>
        </div>

        <!-- Estatísticas -->
        <div class="flex items-center justify-center gap-7 mt-4">
            <span @click="$emit('goToFollowing')" class="active:opacity-50 flex flex-col items-center min-w-[64px]">
                <span class="font-bold text-[17px] leading-5 dark:text-white text-[rgb(22,24,35)]">
                    {{ formattedCount(profile?.following_count) }}
                </span>
                <span
                    class="text-[13px] mt-0.5 text-[rgba(22,24,35,0.6)] dark:text-[rgba(255,255,255,0.6)]">Seguindo</span>
            </span>

            <span @click="$emit('goToFollowers')" class="active:opacity-50 flex flex-col items-center min-w-[64px]">
                <span class="font-bold text-[17px] leading-5 dark:text-white text-[rgb(22,24,35)]">
                    {{ formattedCount(profile?.followers_count) }}
                </span>
                <span
                    class="text-[13px] mt-0.5 text-[rgba(22,24,35,0.6)] dark:text-[rgba(255,255,255,0.6)]">Seguidores</span>
            </span>

            <span @click="$emit('goToPosts')" class="active:opacity-50 flex flex-col items-center min-w-[64px]">
                <span class="font-bold text-[17px] leading-5 dark:text-white text-[rgb(22,24,35)]">
                    {{ formattedCount(profile?.posts_count) }}
                </span>
                <span
                    class="text-[13px] mt-0.5 text-[rgba(22,24,35,0.6)] dark:text-[rgba(255,255,255,0.6)]">Posts</span>
            </span>
        </div>

        <!-- Bio -->
        <div v-show="profile?.bio?.length" class="pt-3 max-w-[320px]">
            <p class="text-[15px] leading-[20px] line-clamp-3 font-normal dark:text-white text-[rgb(22,24,35)]"
                v-html="profile?.bio"></p>
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