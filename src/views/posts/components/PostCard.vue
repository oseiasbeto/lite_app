<template>
    <div v-if="data?._id" class="flex flex-col" :class="{ 'border-b-[6px] border-[rgb(24,24,24)]': showBorderBottom }">
        <!--HEADER-->
        <div :class="isParentPost ? 'p-0' : 'p-[10px]'">
            <!--AUTHOR DETAILS-->
            <PostAuthorDetails @on-follow="handleFollowUser(data?.author?._id)" :is-following-user="isFollowingUser"
                :show-btn-follow="canFollowUser" :author="data?.author" :created-at="data?.created_at"
                :user-id="user?._id" :is-parent-post="isParentPost" />
        </div>

        <!--BODY-->
        <div>
            <!--CONTENT-->
            <div :class="isParentPost ? 'p-0' : 'px-[10px]'">
                <PostContent :is-parent-post="isParentPost" :show-more="showMore" @on-press="goToViewMore" :content="data.content" />
            </div>


            <!--MEDIA-->
            <div v-if="false" :class="isParentPost ? 'box-border -ml-[21px] -mr-[10px] mb-0' : 'w-full'">
                <div class="box-border relative h-[369.256px] bg-[#151013] 
            bg-center bg-contain bg-no-repeat 
            transition-[background-image] duration-[180ms] ease-in-out
            shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
                    style="background-image: url('https://qph.cf2.quoracdn.net/main-qimg-0fdea9306730338017993e8d3358496c');">
                </div>
            </div>
            <!--PARENT POST-->
            <div v-if="data?.shared_post?._id" class="px-[10px] pt-1 pb-2">
                <div class="border-l-[3px] dark:border-[rgb(57,56,57)] pl-2">
                    <PostCard :data="data?.shared_post" :is-parent-post="true" :user-id="user?._id" :module="module" />
                </div>
            </div>

        </div>

        <!--FOOTER-->
        <div v-if="!isParentPost" class="px-[10px] pt-1 pb-1">
            <PostReactions :loading="isReactingPost" :upvotes="data?.upvotes" :upvotes-count="data?.upvotes_count"
                :downvotes="data?.downvotes" :downvotes-count="data?.downvotes_count"
                :comments-count="data?.comments_count" :shares-count="data?.shares_count" @on-upvote="handleUpvote"
                :user-id="user?._id" @on-downvote="handleDownvote" @on-comment="goToComments" @on-share="goToShare" />
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