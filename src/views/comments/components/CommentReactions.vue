<template>
    <div class="flex items-center justify-between" :class="{ 'pointer-events-none': loading }">
        <div class="flex gap-0.5 items-center">
            <div
                class="flex rounded-[30px] border dark:border-[#393839] bg-[rgba(255,255,255,0.05)] items-center gap-0.5 mr-[8px]">
                <button @click="$emit('on-upvote')"
                    :class="['p-[0px_10px] h-[28px] text-center flex items-center', upvotes?.includes(userId) ? 'text-[#4894fd]' : 'text-inherit']">
                    <span>

                        <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4 3 15h6v5h6v-5h6z" class="icon_svg-stroke icon_svg-fill" stroke-width="1.5"
                                stroke="currentColor" :fill="upvotes?.includes(userId) ? 'currentColor' : 'none'"
                                stroke-linejoin="round"></path>
                        </svg>
                    </span>
                    <span v-show="upvotesCount" class="ml-1 min-w-[20px] font-semibold">{{ formattedCount(upvotesCount)
                    }}</span>
                </button>
                <span class="h-[28px] w-[1px] dark:bg-[#393839]"></span>
                <button @click="$emit('on-downvote')"
                    class="p-[0px_10px_0px_8px] h-[28px] text-center flex items-center">
                    <span :class="downvotes?.includes(userId) ? 'text-[#e95111]' : 'text-inherit'">
                        <svg width="24" height="24" class="w-5 h-5" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="m12 20 9-11h-6V4H9v5H3z" class="icon_svg-stroke icon_svg-fill"
                                stroke="currentColor" :fill="downvotes?.includes(userId) ? 'currentColor' : 'none'"
                                stroke-width="1.5" stroke-linejoin="round"></path>
                        </svg>
                    </span>
                </button>
            </div>
            <button @click="$emit('on-reply')" class="flex font-semibold text-[13px] items-center h-[28px] px-0.5">
               <p>Responder</p>
            </button>
        </div>

        <div>

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
        required: true
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
    repliesCount: {
        type: Number,
        default: 0
    },
    sharesCount: {
        type: Number,
        default: 0
    },
})

defineEmits(['on-upvote', 'on-downvote', 'on-reply', 'on-share'])
</script>