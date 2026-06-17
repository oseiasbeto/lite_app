<template>
    <div v-if="data?._id" class="flex flex-col"
        :class="[showBorderBottom ? 'border-b-[6px] border-[rgb(230,231,232)] dark:border-[rgb(24,24,24)]' : 'border-none', !showMore && !isParentPost ? 'dark:bg-[rgba(36,37,38,1.0)] bg-white' : 'dark:bg-transparent bg-white']">
        <!--HEADER-->
        <div :class="isParentPost ? 'px-[10px] pb-1 pt-[8px]' : 'p-[10px]'">
            <!--AUTHOR DETAILS-->
            <PostAuthorDetails @on-follow="handleFollowUser(data?.author?._id)" :is-following-user="isFollowingUser"
                :show-btn-follow="canFollowUser" :author="data?.author" :created-at="data?.created_at"
                :user-id="user?._id" :is-parent-post="isParentPost" />
        </div>

        <!--BODY-->
        <div>
            <!--CONTENT-->
            <div :class="isParentPost ? 'px-[10px]' : 'px-[10px]'">
                <PostContent :enable-truncate="enableTruncate" :is-parent-post="isParentPost" :show-more="showMore"
                    @on-press="goToViewMore" :content="data.content" />
            </div>


            <!--MEDIA-->
            <PostMediaImages v-if="data?.media?.length" :images="data.media.filter(m => m.type === 'image')"
                :post="data" :module="module" :is-parent-post="isParentPost" @open="setMedia" />

            <PostMediaVideo v-if="data?.media?.find(m => m.type === 'video')"
                :video="data.media.find(m => m.type === 'video')" :is-parent-post="isParentPost" @open="openVideo" />

            <!--PARENT POST-->
            <div v-if="data?.shared_post?._id" class="px-[10px] pt-1 pb-2">
                <div class="border-[1px] dark:border-[rgb(57,56,57)]">
                    <PostCard :data="data?.shared_post" :is-parent-post="true" :user-id="user?._id" :module="module" />
                </div>
            </div>
        </div>

        <!--FOOTER-->
        <div v-if="!isParentPost" class="px-[10px] pt-1 pb-1">
            <PostReactions :loading="isReactingPost" :upvotes="data?.upvotes" :upvotes-count="data?.upvotes_count"
                :downvotes="data?.downvotes" :downvotes-count="data?.downvotes_count"
                :comments-count="data?.comments_count" :shares-count="data?.shares_count" :user-id="user?._id"
                @on-upvote="handleUpvote" @on-downvote="handleDownvote" @on-comment="goToComments" @on-share="goToShare"
                @on-more="openMoreOptions(data)" />
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
import PostMediaImages from './PostMediaImages.vue';
import PostMediaVideo from './PostMediaVideo.vue';

const emit = defineEmits(['openNewCommentDrawer', 'openMoreOptionsDrawer'])

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
    enableTruncate: {
        type: Boolean,
        default: true
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
            if (props?.user?.following?.includes(props?.data?.author?._id)) return false
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

const openMoreOptions = (post) => {
    if (!post) return
    emit('openMoreOptionsDrawer', post)
}

const setMedia = ({ selected, list, post, module }) => {
    store.commit("SET_MEDIA", { selected, list, post })

    router.push(`/media/${selected?._id}?module=${module}`)
}

const openVideo = (video) => {
    store.commit("SET_MEDIA", { selected: video, list: [video], post: props.data })
    router.push(`/media/${video._id}?module=${props.module}`)
}

</script>