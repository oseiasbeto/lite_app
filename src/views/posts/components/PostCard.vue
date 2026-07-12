<template>
    <div @click="goToViewMore" v-if="data?._id"
        class="flex flex-row dark:border-x-dark-border border-x-light-border bg-transparent"
        :class="[!isParentPost ? 'border-b' : 'border-none']">
        <!--HEADER-->
        <div :class="isParentPost ? 'px-[10px] pb-1 pt-[12px]' : 'p-[10px]'">
            <div @click.stop @click="goToProfile(data?.author?._id)" class="relative shrink-0">
                <Avatar :size="isParentPost ? 's' : 'md'"
                    :url="isParentPost ? data?.author?.profile_image?.thumbnails?.xs || data?.author?.profile_image?.url : data?.author?.profile_image?.thumbnails?.sm || data?.author?.profile_image?.url" />
                <span @click.stop="handleFollowUser(data?.author?._id)"
                    v-if="canFollowUser && !isParentPost || hasFollowing"
                    class="absolute bottom-0 text-white dark:text-black right-0 bg-x-dark-bg dark:bg-x-light-bg flex justify-center items-center h-[14px] w-[14px] rounded-full ring-[1.5px] ring-x-light-bg dark:ring-x-dark-bg">

                    <svg v-if="!hasFollowingUser" aria-label="Seguir" role="img" viewBox="0 0 10 9"
                        class="w-[10px] h-[10px] text-inherit" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <title>Seguir</title>
                        <path
                            d="M4.99512 8.66895C4.64355 8.66895 4.35059 8.36621 4.35059 8.03418V5.12891H1.50391C1.17188 5.12891 0.864258 4.83594 0.864258 4.47949C0.864258 4.12793 1.17188 3.83008 1.50391 3.83008H4.35059V0.924805C4.35059 0.583008 4.64355 0.290039 4.99512 0.290039C5.35156 0.290039 5.64453 0.583008 5.64453 0.924805V3.83008H8.49121C8.83301 3.83008 9.13086 4.12793 9.13086 4.47949C9.13086 4.83594 8.83301 5.12891 8.49121 5.12891H5.64453V8.03418C5.64453 8.36621 5.35156 8.66895 4.99512 8.66895Z">
                        </path>
                    </svg>

                    <svg v-else aria-label="Seguindo" role="img" viewBox="0 0 8 8" class="w-[8px] h-[8px] text-inherit"
                        fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <title>Seguindo</title>
                        <path
                            d="M3.19531 7.69141C2.97266 7.69141 2.80469 7.60938 2.65234 7.42578L0.632812 4.94531C0.511719 4.80469 0.464844 4.67188 0.464844 4.53125C0.464844 4.20703 0.703125 3.97266 1.03516 3.97266C1.23047 3.97266 1.36719 4.04688 1.5 4.20703L3.17969 6.32422L6.46875 1.12109C6.60547 0.902344 6.74219 0.824219 6.96875 0.824219C7.29688 0.824219 7.53125 1.05469 7.53125 1.375C7.53125 1.49609 7.49219 1.625 7.39844 1.76562L3.74219 7.40625C3.61328 7.59766 3.42969 7.69141 3.19531 7.69141Z">
                        </path>
                    </svg>
                </span>
            </div>
        </div>

        <div class="flex shrink-0 flex-1 flex-col pr-4">
            <!--BODY-->
            <div>

                <div class="pt-[10px] pb-[8px]">
                    <!--AUTHOR DETAILS-->
                    <PostAuthorDetails @on-follow="handleFollowUser(data?.author?._id)"
                        :is-following-user="isFollowingUser" :show-btn-follow="canFollowUser" :author="data?.author"
                        :created-at="data?.created_at" :user-id="user?._id" :is-parent-post="isParentPost" />
                </div>

                <!--CONTENT-->
                <div :class="{'mb-2': data?.media?.length}">
                    <PostContent :enable-truncate="enableTruncate" :is-parent-post="isParentPost" :show-more="showMore"
                        @on-press="goToViewMore" :content="data.content" />
                </div>


                <!--MEDIA-->
                <div @click.stop>
                    <PostMediaImages v-if="data?.media?.length" :images="postImages"
                        :post="data" :module="module" :is-parent-post="isParentPost" @open="setMedia" />

                    <PostMediaVideo v-if="postVideo"
                        :video="postVideo" :is-parent-post="isParentPost"
                        @open="openVideo" />
                </div>

                <!--PARENT POST-->
                <div @click.stop v-if="data?.shared_post?._id" class="pt-1 pb-2">
                    <div class="border border-x-light-border dark:border-x-dark-border rounded-2xl overflow-hidden">
                        <PostCard :data="data?.shared_post" :is-parent-post="true" :user-id="user?._id"
                            :module="module" />
                    </div>
                </div>
            </div>

            <!--FOOTER-->
            <div @click.stop v-if="!isParentPost" class="pt-1 pb-1">
                <PostReactions 
                    :loading="isReactingPost" :upvotes="data?.upvotes" :upvotes-count="data?.upvotes_count"
                    :downvotes="data?.downvotes" :downvotes-count="data?.downvotes_count"
                    :comments-count="data?.comments_count" :shares-count="data?.shares_count" :user-id="user?._id"
                    @on-upvote="handleUpvote" @on-downvote="handleDownvote" @on-comment="goToComments"
                    @on-share="goToShare" 
                    @on-more="openMoreOptions(data)" />
            </div>
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
import Avatar from '@/components/Utils/Avatar.vue';

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
const hasFollowing = ref(false)

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

const hasFollowingUser = computed(() => {
    if (props?.user?.following?.includes(props?.data?.author?._id)) return true
    else return false
})

// Media derivada de data.media, calculada uma única vez e cacheada pelo
// Vue — antes o filter/find rodavam soltos no template e eram
// reexecutados em TODO re-render do card (o find de vídeo, inclusive,
// era chamado duas vezes por render: uma no v-if, outra na prop).
const postImages = computed(() => {
    return props.data?.media?.filter(m => m.type === 'image') || []
})

const postVideo = computed(() => {
    return props.data?.media?.find(m => m.type === 'video') || null
})

const handleUpvote = async () => {
    isReactingPost.value = true
    await store.dispatch('toggleUpvotePost', {
        postId: props?.data?._id,
        module: props?.module,
        userId: props?.user?._id
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
    hasFollowing.value = true
    await store.dispatch("followUser", userId)
        .finally(() => {
            isFollowingUser.value = false
        })


 
    store.dispatch('showToast', {
        message: hasFollowingUser.value ? 'Você está seguindo ' + props?.data?.author?.name : 'Você deixou de seguir ' + props?.data?.author?.name,
        type: 'success',
        position: 'top',
    });
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

const goToProfile = (userId) => {
    router.push({
        path: '/profile/' + userId
    })
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