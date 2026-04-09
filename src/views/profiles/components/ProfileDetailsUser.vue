<template>
    <div class="relative">
        <div class="flex mb-2 items-center gap-1">
            <div class="shrink-0 mr-[16px]">
                <Avatar size="big" :url="profile?.profile_image?.thumbnails?.lg || profile?.profile_image?.url" />
            </div>

            <div class="flex flex-col">
                <p class="font-bold text-[21px] dark:text-white text-black">{{ profile?.name || 'Nome' }}</p>
                <div class="flex mt-4 text-[13px] items-center gap-2">
                    <span> {{ profile?.followers_count }} Seguidores</span>
                    <span style="box-sizing: border-box;"> · </span>
                    <span> {{ profile?.following_count }} Seguindo</span>
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