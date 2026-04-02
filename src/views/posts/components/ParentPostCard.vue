<template>
    <div v-if="data?._id" class="flex flex-col">
        <!--HEADER-->
        <div class="p-2">
            <!--AUTHOR DETAILS-->
            <PostAuthorDetails :author="data?.author" :user-id="userId" :is-parent-post="true" />
        </div>

        <!--BODY-->
        <div class="px-2">
            <!--CONTENT-->
            <PostContent :show-more="showMore" :content="data.content" />

            <!--MEDIA-->

        </div>

    </div>
</template>

<script setup>
import PostAuthorDetails from './PostAuthorDetails.vue';
import PostContent from './PostContent.vue';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    showMore: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: true
    }
})

</script>