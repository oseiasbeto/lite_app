<template>
    <div v-if="data?._id" class="border-b flex flex-col border-gray-50">
        <!--HEADER-->
        <div class="p-2">
            <!--AUTHOR DETAILS-->
            <PostAuthorDetails :author="data?.author" :user-id="userId" />
        </div>

        <!--BODY-->
        <div class="px-2">
            <!--CONTENT-->
            <PostContent :show-more="showMore" @on-press="goToViewMore" :content="data.content" />

            <!--MEDIA-->
        </div>

        <!--FOOTER-->
        <div class="p-2">
            <PostReactions :loading="isReactingPost" :upvotes="data?.upvotes" :upvotes-count="data?.upvotes_count"
                :downvotes="data?.downvotes" :downvotes-count="data?.downvotes_count"
                :comments-count="data?.comments_count" :shares-count="data?.shares_count" @on-upvote="handleUpvote"
                @on-downvote="handleDownvote" @on-comment="goToComments" @on-share="goToShare" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import PostAuthorDetails from './PostAuthorDetails.vue';
import PostContent from './PostContent.vue';
import PostReactions from './PostReactions.vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore()
const router = useRouter()

const isReactingPost = ref(false)

const handleUpvote = async () => {
    isReactingPost.value = true
    await store.dispatch('toggleUpvotePost', {
        postId: props?.data?._id,
        module: props?.module
    })
        .finally(() => {
            isReactingPost.value = false
        })
}

const handleDownvote = async () => {
    isReactingPost.value = true
    await store.dispatch('toggleDownvotePost', {
        postId: props?.data?._id,
        module: props?.module
    })
        .finally(() => {
            isReactingPost.value = false
        })
}

const goToComments = () => {
    if (!props.showMore) {
        store.commit("SET_POST", {
            ...props?.data,
            showCommentFormDrawer: true
        })
        router.push({
            path: '/post/' + props?.data?._id,
            query: {
                module: props.module
            }
        })
    } else {
        emit('openNewCommentDrawer')
    }

}

const goToViewMore = () => {
    if (!props.showMore) {
        store.commit("SET_POST", props?.data)
        router.push({
            path: '/post/' + props?.data?._id,
            query: {
                module: props.module
            }
        })
    } else return
}

const goToShare = () => {
    console.log("go to share")
}

const emit = defineEmits(['openNewCommentDrawer'])

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    module: {
        type: String,
        default: 'feed'
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