<template>
    <div v-if="data?._id" class="flex flex-col" :class="{' border-b-[6px] border-[rgb(24,24,24)]': showBorderBottom}">
        <!--HEADER-->
        <div class="p-[10px]">
            <!--AUTHOR DETAILS-->
            <PostAuthorDetails 
            @on-follow="handleFollowUser(data?.author?._id)"
            :is-following-user="isFollowingUser"
            :show-btn-follow="canFollowUser" 
            :author="data?.author" 
            :created-at="data?.created_at"
            :user-id="user?._id"
            :is-parent-post="isParentPost" />
        </div>
        
        <!--BODY-->
        <div class="px-[10px]">
            <!--CONTENT-->
            <PostContent :show-more="showMore" @on-press="goToViewMore" :content="data.content" />

            <!--MEDIA-->

            <!--PARENT POST-->
            <div v-if="data?.shared_post?._id">
                <PostCard :data="data?.shared_post" :is-parent-post="true" :user-id="user?._id" :module="module" />
            </div>

        </div>

        <!--FOOTER-->
        <div v-if="!isParentPost" class="p-[10px] pb-1">
            <PostReactions 
                :loading="isReactingPost" 
                :upvotes="data?.upvotes" 
                :upvotes-count="data?.upvotes_count"
                :downvotes="data?.downvotes" 
                :downvotes-count="data?.downvotes_count"
                :comments-count="data?.comments_count" 
                :shares-count="data?.shares_count" 
                @on-upvote="handleUpvote"
                :user-id="user?._id"
                @on-downvote="handleDownvote" 
                @on-comment="goToComments" 
                @on-share="goToShare" 
            />
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import PostAuthorDetails from './PostAuthorDetails.vue';
import PostContent from './PostContent.vue';
import PostReactions from './PostReactions.vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const emit = defineEmits(['openNewCommentDrawer'])

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    isParentPost: {
        type: Boolean,
        default: false
    },
    module: {
        type: String,
        default: 'feed'
    },
    showMore: {
        type: Boolean,
        default: false
    },
    showBorderBottom: {
        type: Boolean,
        default: false
    },
    showBtnFollow: {
        type: Boolean,
        default: false
    },
    user: {
        type: Object,
        default: null
    }
})

const store = useStore()
const router = useRouter()

const isReactingPost = ref(false)
const isFollowingUser = ref(false)

const canFollowUser = computed(() => {
    if (!props?.showBtnFollow) return false
    else {
        if (props?.data?.author?._id == props?.user?._id) return false
        else {
            if (props?.user?.following.includes(props?.data?.author?._id)) return false
            else return true
        }
    }
})

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

const handleFollowUser = async (userId) => {
    isFollowingUser.value = true
    await store.dispatch("followUser", userId)
    .finally(() => {
        isFollowingUser.value = false
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

    const parentPost = props?.data?.shared_post ? props?.data?.shared_post : props?.data

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