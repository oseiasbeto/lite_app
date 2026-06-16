<template>
    <div :class="{ 'opacity-0 pointer-events-none': !show, 'opacity-100 pointer-events-auto': show }"
        class="absolute z-[99] px-4 py-2 max-h-[250px] w-full bottom-0 text-white transition-opacity duration-300 ease-in-out bg-black/[0.8]">
        <p class="line-clamp-2 text-[15px] mb-1 break-words" v-html="post?.content?.length > 0 ? post?.content : '...'">
        </p>

        <button @click="goToViewMore"
            class="flex gap-0.5 my-3 active:opacity-70 text-white font-bold text-[15px] bg-[rgba(245,245,245,0.25)] items-center justify-center rounded-full h-[38px] w-full">
            <p>Continuar a ler</p>
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m9 5 7 7-7 7.005" class="icon_svg-stroke" stroke="#fff" stroke-width="1.8" fill="none"
                    stroke-linecap="round"></path>
            </svg>
        </button>

        <PostReactions :loading="isReactingPost" :upvotes="post?.upvotes" :upvotes-count="post?.upvotes_count"
            :downvotes="post?.downvotes" :downvotes-count="post?.downvotes_count" :comments-count="post?.comments_count"
            :shares-count="post?.shares_count" :user-id="userId" 
            :show-btn-more="false" 
            @on-upvote="handleUpvote" 
            @on-downvote="handleDownvote"
            @on-comment="goToComments" @on-share="goToShare" />
    </div>
</template>

<script setup>
import PostReactions from '@/views/posts/components/PostReactions.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore()
const router = useRouter()

const props = defineProps({
    post: { type: Object, required: true },
    show: { type: Boolean, default: true },
    userId: { type: String, required: true },
    module: { type: String, required: true }
})

const isReactingPost = ref(false)

const handleUpvote = async () => {
    isReactingPost.value = true
    await store.dispatch('toggleUpvotePost', {
        postId: props?.post?._id,
        module: props?.module
    })
        .finally(() => {
            isReactingPost.value = false
        })
}

const handleDownvote = async () => {
    isReactingPost.value = true
    await store.dispatch('toggleDownvotePost', {
        postId: props?.post?._id,
        module: props?.module
    })
        .finally(() => {
            isReactingPost.value = false
        })
}

const goToViewMore = () => {
    if (!props.showMore) {
        store.commit("SET_POST", props?.post)
        router.push({
            path: '/post/' + props?.post?._id,
            query: {
                module: props.module
            }
        })
    } else return
}

const goToComments = () => {
    store.commit("SET_POST", {
        ...props?.post,
        showCommentFormDrawer: true
    })
    router.push({
        path: '/post/' + props?.post?._id,
        query: {
            module: props.module
        }
    })
}

const goToShare = () => {
    const parentPost = props?.post?.shared_post ? props?.post?.shared_post : props?.post

    store.commit("SET_PARENT_POST", parentPost)
    router.push({
        path: '/composer',
        query: {
            module: props.module,
            parent_post: parentPost?._id || undefined,
            post_type: 'post'
        }
    })
}

</script>