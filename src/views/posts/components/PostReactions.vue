<template>
    <div class="flex items-center justify-between" :class="{ 'pointer-events-none': loading }">
        <div class="flex gap-1 items-center">
            <div
                class="flex rounded-[30px] overflow-hidden border bg-[rgba(0,0,1,0.03)] border-[rgb(222,224,225)] dark:border-[#393839] dark:bg-[rgba(255,255,255,0.05)] items-center gap-0.5 mr-[8px]">
                <button @click="$emit('on-upvote')"
                    class="p-[0px_10px] h-[28px] text-center dark:active:bg-[rgba(255,255,255,0.04)] flex items-center text-blue">
                    <span>

                        <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4 3 15h6v5h6v-5h6z" class="icon_svg-stroke icon_svg-fill" stroke-width="2"
                                stroke="currentColor" :fill="upvotes?.includes(userId) ? 'currentColor' : 'none'"
                                stroke-linejoin="round"></path>
                        </svg>
                    </span>
                    <span v-show="upvotesCount" class="ml-1 min-w-[20px] font-semibold">{{ formattedCount(upvotesCount)
                        }}</span>
                </button>
                <span class="h-[28px] w-[1px] bg-[rgb(222,224,225)] dark:bg-[#393839]"></span>
                <button @click="$emit('on-downvote')"
                    class="p-[0px_10px_0px_8px] dark:active:bg-[rgba(255,255,255,0.04)] h-[28px] text-center flex items-center">
                    <span :class="downvotes?.includes(userId) ? 'text-[#e95111]' : 'text-inherit'">
                        <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="m12 20 9-11h-6V4H9v5H3z" class="icon_svg-stroke icon_svg-fill"
                                stroke="currentColor" :fill="downvotes?.includes(userId) ? 'currentColor' : 'none'"
                                stroke-width="2" stroke-linejoin="round"></path>
                        </svg>
                    </span>
                </button>
            </div>
            <button @click="$emit('on-comment')" class="flex  gap-1 mr-2 items-center h-[28px] px-0.5">
                <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12.071 18.86c4.103 0 7.429-3.102 7.429-6.93C19.5 8.103 16.174 5 12.071 5s-7.429 3.103-7.429 6.93c0 1.291.379 2.5 1.037 3.534.32.501-1.551 3.058-1.112 3.467.46.429 3.236-1.295 3.803-.99 1.09.585 2.354.92 3.701.92Z"
                        class="icon_svg-stroke icon_svg-fill" stroke="currentColor" stroke-width="2" fill="none">
                    </path>
                </svg>
                <span v-show="commentsCount" class="text-[13px]">{{ formattedCount(commentsCount) }}</span>
            </button>
            <button @click="$emit('on-share')" class="px-0.5 flex items-center gap-1 text-xs">
                <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g class="icon_svg-stroke" stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd"
                        stroke-linecap="round">
                        <path d="M19.748 10a8.003 8.003 0 0 0-15.496.002m.001 4.003a8.003 8.003 0 0 0 15.494 0"></path>
                        <path d="m2.5 7.697 1.197 3.289 3.289-1.197m14.5 6.5L20.289 13 17 14.197"></path>
                    </g>
                </svg>
                <p v-show="sharesCount">{{ formattedCount(sharesCount) }}</p>
            </button>
        </div>

        <div>
            <button class="h-[30px] min-w-[30px] flex items-center justify-center">
                <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.25 11.25a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Zm-7 0a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Zm14 0a1.06 1.06 0 1 0 1.5 1.5 1.06 1.06 0 0 0-1.5-1.5Z"
                        class="icon_svg-stroke" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round"></path>
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
})

defineEmits(['on-upvote', 'on-downvote', 'on-comment', 'on-share'])
</script>