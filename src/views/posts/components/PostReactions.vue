<template>
    <div class="flex items-center " :class="{ 'pointer-events-none': loading }">
        <div class="flex gap-1 items-center flex-1 justify-between">
            <button @click="$emit('on-upvote')"
                :class="[upvotes.includes(userId) ? '!text-[#f91880]' : 'text-x-light-textSecondary rounded-[30px] dark:text-x-dark-textSecondary']"
                class="h-[28px] gap-1 text-center flex items-center text-blue text-x-light-textSecondary dark:text-x-dark-textSecondary">
                <span>
                    <svg v-if="!upvotes?.includes(userId)" aria-label="Gosto" role="img" viewBox="-0.5 0 25 24"
                        class="w-[19px] h-[19px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <title>Gosto</title>
                        <path
                            d="M16.5 2C14.8335 2 13.2217 2.70703 12 3.93652C10.7783 2.70704 9.1665 2 7.5 2C3.3785 2 0.5 5.08423 0.5 9.5C0.5 14.1284 4.84516 19.4619 11.311 22.7719C11.5267 22.8827 11.7633 22.9379 12 22.9379C12.2367 22.9379 12.4733 22.8827 12.689 22.7719C19.1548 19.4619 23.5 14.1284 23.5 9.5C23.5 5.08423 20.6217 2 16.5 2ZM12 20.8764C6.30767 17.8962 2.5 13.3467 2.5 9.5C2.5 6.15893 4.4625 4 7.5 4C9.5 4 11.25 5.75 12 7.5C12.75 5.75 14.5 4 16.5 4C19.5377 4 21.5 6.15893 21.5 9.5C21.5 13.3467 17.6923 17.8962 12 20.8764Z"
                            fill="currentColor"></path>
                    </svg>
                    <svg v-else aria-label="Não gosto" role="img" viewBox="-0.5 0 25 24" class="w-[19px] h-[19px]"
                        fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <title>Não gosto</title>
                        <path
                            d="M16.4045 1.50879C14.785 1.50879 13.2185 2.16259 12 3.30764C10.7815 2.16259 9.215 1.50879 7.5955 1.50879C3.41766 1.50879 0.5 4.62796 0.5 9.09411C0.5 13.7857 4.70617 18.9703 11.2153 22.3022C11.4605 22.428 11.7298 22.4912 11.9995 22.4912C12.2692 22.4912 12.5395 22.428 12.7847 22.3022C19.2938 18.9703 23.5 13.7857 23.5 9.09411C23.5 4.62796 20.5823 1.50879 16.4045 1.50879Z"
                            fill="currentColor"></path>
                    </svg>
                </span>
                <span v-show="upvotesCount" class="text-inherit">{{ formattedCount(upvotesCount)
                    }}</span>
            </button>
            <button @click="$emit('on-comment')"
                class="flex gap-1 items-center h-[28px]  text-x-light-textSecondary dark:text-x-dark-textSecondary">
                <svg aria-label="Responder" role="img" viewBox="0 0 24 24" class="w-[18px] h-[18px]"
                    fill="currentColor">
                    <title>Responder</title>
                    <path clip-rule="evenodd"
                        d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C13.414 21 14.7492 20.6747 15.9373 20.0956C16.1277 20.0028 16.3428 19.9728 16.5514 20.0101L20.7565 20.7619L19.9927 16.5927C19.954 16.3815 19.9843 16.1633 20.0792 15.9707C20.6685 14.7742 21 13.4273 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92486 5.92488 1 12 1C18.0752 1 23 5.92488 23 12C23 13.6205 22.649 15.1615 22.018 16.549L22.9836 21.8198C23.0427 22.1423 22.94 22.4733 22.7086 22.7056C22.4773 22.938 22.1468 23.0421 21.824 22.9844L16.512 22.0348C15.1341 22.6553 13.6061 23 12 23C5.92488 23 1 18.0752 1 12Z"
                        fill="currentColor" fill-rule="evenodd"></path>
                </svg>
                <span v-show="commentsCount" class="text-[13px] text-inherit">{{ formattedCount(commentsCount) }}</span>
            </button>
            <button @click="$emit('on-share')"
                class="text-x-light-textSecondary dark:text-x-dark-textSecondary flex items-center gap-1 text-xs">
                <svg aria-label="Partilhar" role="img" viewBox="0 0 24 24" class="w-[16px] h-[16px]">
                    <title>Partilhar</title>
                    <path clip-rule="evenodd"
                        d="M7.2474 1.49853C4.18324 -0.187039 0.600262 2.64309 1.53038 6.01431L3.18181 12L1.53038 17.9857C0.600277 21.3569 4.18324 24.1871 7.2474 22.5015L20.8245 15.0329C23.2153 13.7177 23.2153 10.2823 20.8244 8.96712L7.2474 1.49853ZM3.45835 5.48239C2.99873 3.81649 4.76927 2.41796 6.28345 3.25089L19.8605 10.7195C20.0016 10.7971 20.123 10.8923 20.2247 11H4.98064L3.45835 5.48239ZM4.98064 13L3.45835 18.5176C2.99873 20.1835 4.76927 21.5821 6.28345 20.7491L19.8605 13.2805C20.0016 13.2029 20.123 13.1078 20.2247 13H4.98064Z"
                        fill="currentColor" fill-rule="evenodd"></path>
                </svg>
                <p class="text-inherit" v-show="sharesCount">{{ formattedCount(sharesCount) }}</p>
            </button>

            <button v-if="showBtnMore" @click="$emit('on-more')"
                class="h-[30px] min-w-[30px] text-x-light-textSecondary dark:text-x-dark-textSecondary flex items-center justify-center">
                <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.25 11.25a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Zm-7 0a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Zm14 0a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Z"
                        class="icon_svg-stroke" fill="currentColor" stroke="currentColor" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import formattedCount from '@/utils/formatted-count';

defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        default: null
    },
    upvotes: {
        type: Array,
        default: []
    },
    upvotesCount: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Array,
        default: []
    },
    downvotesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    sharesCount: {
        type: Number,
        default: 0
    },
    isDarkoo: {
        type: Boolean,
        default: false
    },
    showBtnMore: {
        type: Boolean,
        default: true
    }
})

defineEmits(['on-upvote', 'on-downvote', 'on-comment', 'on-share', 'on-more'])
</script>