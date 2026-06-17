<template>
    <div :class="{ 'opacity-0 pointer-events-none': !show, 'opacity-100 pointer-events-auto': show }" class="absolute w-full z-[99] transition-opacity duration-300 ease-in-out text-white top-0 bg-black/[0.8]">
        <div>
            <button @click="$emit('close')" class="w-[38px] px-[2.5px] h-[38px] flex justify-center items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="#fff" stroke-width="1.5"
                        fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
                </svg>
            </button>
        </div>
        <div v-if="author?._id" class="flex px-4 gap-2.5 py-2 items-center flex-row">
            <div class="shrink-0">
                <Avatar :is-darkoo="true" size="md" :url="author?.profile_image?.thumbnails?.sm || author?.profile_image?.url" />
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                        <div class="flex items-center">
                            <span
                                class="text-sm aguwx2q text-shadow-[2px_2px_4px_rgba(0,0,0,0.5)] font-bold text-white">{{
                                    author?.name }}
                            </span>

                            <svg v-if="author?.is_verified" class="ml-[5px] mb-0.5" fill="none" width="14"
                                viewBox="0 0 24 24" height="14">
                                <circle cx="12" cy="12" r="11.5" fill="#fff"></circle>
                                <path class="text-[rgba(0,0,0,0.8)]" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
                                </path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="flex text-sm aguwx2q text-white leading-4 items-center">
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

defineEmits(['close'])

defineProps({
    author: { type: Object, required: true },
    createdAt: { type: String, required: true },
    show: { type: Boolean, default: true }
})
</script>

<style scoped>
.aguwx2q * {
    text-shadow: rgba(0, 0, 0, 0.3) 0px 1px 2px;
    color: rgb(255, 255, 255) !important;
}
</style>