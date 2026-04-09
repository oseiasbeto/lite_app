<template>
    <div class="flex pb-1 pt-1.5 border-b-[6px] dark:border-[rgb(24,24,24)] flex-col">
        <div class="px-[10px] flex items-center gap-1.5 pb-1 pt-[10px]">
            <div class=" shrink-0">
                <Avatar size="sm" :url="user?.profile_image?.thumbnails?.sm || user?.profile_image?.url" />
            </div>
            <div class="border flex-1 dark:bg-[#202020] rounded-[30px] flex items-center dark:border-[rgb(57,56,57)] h-[32px] text-[13px] dark:text-[rgb(177,179,182)]"
                @click="goToComposer(module)">

                <p class="px-[10px]">O que você quer perguntar ou compartilhar?</p>
            </div>
        </div>


        <div class="flex dark:text-[#e6e7e8] justify-between items-center gap-1">
            <button class="flex font-semibold flex-1 text-[13px] gap-1 justify-center items-center h-[30px] px-2 text-inherit"
                @click="goToComposer(module)">

                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" fill="none" fill-rule="evenodd">
                        <g transform="translate(9 7)">
                            <path d="M3 6v-.5A2.5 2.5 0 1 0 .5 3" stroke-linecap="round" stroke-linejoin="round"></path>
                            <circle class="icon_svg-fill_as_stroke" fill="currentColor" cx="3" cy="8.5" r="1"
                                stroke="none"></circle>
                        </g>
                        <path d="M7.5 4h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-3L9 22v-3H7.5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
                            stroke-linejoin="round"></path>
                    </g>
                </svg>
                <p>Perguntar</p>
            </button>
            <div class="border-l h-[16px] dark:border-[#39383A]"></div>
            <button class="flex font-semibold flex-1 text-[13px] gap-1 justify-center items-center h-[30px] px-2 text-inherit">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g stroke-width="1.5" fill="none" fill-rule="evenodd">
                        <path
                            d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9h0a2 2 0 0 1 2.828 0Z"
                            class="icon_svg-stroke" stroke="currentColor" stroke-linecap="round"
                            stroke-linejoin="round"></path>
                        <path class="icon_svg-fill_as_stroke" fill="currentColor"
                            d="m4.429 19.571 2.652-.884-1.768-1.768z">
                        </path>
                        <path d="M14.5 19.5h5v-5m-10-10h-5v5" class="icon_svg-stroke" stroke="currentColor"
                            stroke-linecap="round" stroke-linejoin="round"></path>
                    </g>
                </svg>
                <p>Responder</p>
            </button>
            <div class="border-l h-[16px] dark:border-[#39383A]"></div>
            <button class="flex font-semibold flex-1 text-[13px] gap-1 justify-center items-center h-[30px] px-2 text-inherit"
                @click="goToComposer(module, 'post')">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fill-rule="evenodd">
                        <path
                            d="M18.571 5.429h0a2 2 0 0 1 0 2.828l-9.9 9.9-4.24 1.416 1.412-4.245 9.9-9.9a2 2 0 0 1 2.828 0Z"
                            class="icon_svg-stroke" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round"></path>
                        <path class="icon_svg-fill_as_stroke" fill="currentColor"
                            d="m4.429 19.571 2.652-.884-1.768-1.768z">
                        </path>
                    </g>
                </svg>
                <p>Postar</p>
            </button>
        </div>
    </div>

</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
    module: {
        type: String,
        required: true
    },
    user: {
        type: Object,
        default: null
    }
})

const router = useRouter()

const goToComposer = (module, postType) => {
    router.push({
        path: '/composer',
        query: {
            module: module,
            ...(postType && {
                post_type: postType
            })
        }
    })
}
</script>