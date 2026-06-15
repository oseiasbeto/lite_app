<template>
    <div v-if="data?._id" class="flex flex-col">
        <!--HEADER-->
        <div class="p-2 relative">
            <!--AUTHOR DETAILS-->
            <PostAuthorDetails :author="data?.author" :user-id="userId" :is-parent-post="true" />

            <button v-if="showBtnClose"
                class="py-1.5 right-0 absolute top-0 px-2.5 text-sm text-light-link dark:text-dark-link rounded-full font-semibold flex text-inherit items-center"
                @click="$emit('close')">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m5.5 5.5 13 13m-13 0 13-13" class="icon_svg-stroke" stroke="currentColor"
                        stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
                </svg>
            </button>
        </div>

        <!--BODY-->
        <div class="px-2">
            <!--CONTENT-->
            <PostContent :show-more="showMore" :content="data.content" />

            <!--MEDIA-->
            <div v-if="data?.media?.length" :class="isParentPost ? 'box-border -ml-[21px] -mr-[10px] mb-0' : 'w-full'">
                <div v-for="media in data?.media">
                    <div v-if="media.type == 'image'" class="box-border relative bg-[#151013] 
                        bg-center bg-contain bg-no-repeat 
                        transition-[background-image] duration-[180ms] ease-in-out
                        shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">

                        <img class="h-full w-full object-cover" :src="media?.url">
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import PostAuthorDetails from './PostAuthorDetails.vue';
import PostContent from './PostContent.vue';

defineEmits(['close'])

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    showMore: {
        type: Boolean,
        default: false
    },
    showBtnClose: {
        type: Boolean,
        default: false
    },
    isParentPost: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: true
    }
})

</script>