<template>
    <div
        :class="['relative gap-2 flex pt-1.5 pb-0.5 flex-col border-x-light-border dark:border-x-dark-border', isReply ? 'border-none px-0 !bg-transparent' : 'border-b px-4', active ? 'dark:bg-x-dark-surfaceActive bg-x-light-surfaceActive' : 'bg-transparent']">

        <!--TRUNK: linha vertical de ramificacao, do fundo do avatar ate as respostas.
            Ajusta os valores de "top"/"left" caso o teu Avatar 'md'/'xs' nao sejam 40px/24px -->
        <span v-if="data?.replies?.length" class="absolute bottom-0 w-[2px] z-0 bg-x-light-border dark:bg-x-dark-border"
            :class="isReply ? 'top-[30px] left-[12px]' : 'top-[46px] left-[30px]'">
        </span>

        <div class="flex flex-row gap-2 relative z-[1]">
            <div @click="goToProfile(data?.author?._id || data?.user?._id)" class="shrink-0">
                <Avatar :size="isReply ? 'xs' : 'md'" :url="isReply ? data?.author?.profile_image?.thumbnails?.xs || data?.author?.profile_image?.url :
                    data?.author?.profile_image?.thumbnails?.md || data?.author?.profile_image?.url" />
            </div>
            <div class="flex-1 min-w-0">
                <!--AUTHOR DETAILS-->
                <CommentAuthorDetails :author="data?.author || data?.user || {}" :user-id="userId"
                    :created-at="data?.created_at" />
                <!--BODY-->
                <div>
                    <!--CONTENT-->
                    <p v-if="isReply && data?.reply_to?._id !== data?.author?._id"
                        class="mb-0.5 flex gap-1 items-center text-xs min-w-0">
                        <span class="shrink-0 text-x-light-textSecondary dark:text-x-dark-textSecondary">Resposta para:
                        </span>
                        <router-link class="text-x-light-blue truncate" :to="`/profile/${data?.reply_to?._id}`">
                            {{ '@' + data?.reply_to?.username }}
                        </router-link>
                    </p>
                    <CommentContent :content="data?.content || ''" />
                    <!--MEDIA-->
                </div>

                <!--FOOTER-->
                <div class="mb-1">
                    <CommentReactions :loading="isReactingComment" :upvotes="data?.upvotes"
                        :upvotes-count="data?.upvotes_count" :downvotes="data?.downvotes" :user-id="userId"
                        :downvotes-count="data?.downvotes_count" :replies-count="data?.replies_count"
                        :shares-count="data?.shares_count" @on-more="handleOneMore(data)" @on-upvote="handleUpvote"
                        @on-downvote="handleDownvote" @on-reply="onReply({
                            parent: data,
                            replyTo: data?.author
                        })" />
                </div>

                <!--REPLIES-->
                <div v-if="data?.replies?.length" class="relative z-[1]">
                    <div v-for="reply in data?.replies" :key="reply?._id" class="relative">
                        <!--CURVA: liga o tronco vertical ao avatar desta resposta especifica-->
                        <span class="absolute top-0 h-[18px] border-l-2 border-b-2 rounded-bl-2xl z-0
                            border-x-light-border dark:border-x-dark-border pointer-events-none"
                            :class="isReply ? '-left-[20px] w-[20px]' : '-left-[28px] w-[28px]'">
                        </span>

                        <CommentCard :post-id="postId" :user-id="userId" :data="reply" :is-reply="true" @on-reply="onReply({
                            parent: reply?.parent,
                            replyTo: reply?.author
                        })" />
                    </div>

                    <!--LOAD MORE-->
                    <button class="text-x-light-textSecondary dark:text-x-dark-textSecondary py-2 text-xs"
                        @click="loadMoreReplies" v-if="queryReplies?.hasMore && !loadingLoadMoreReplies">
                        <span class="flex items-center gap-1">
                            <p class="font-semibold">Ver mais respostas</p>
                            <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="m5 8.5 7 7 7.005-7" class="icon_svg-stroke" stroke="currentColor"
                                    stroke-width="2" fill="none" stroke-linecap="round"></path>
                            </svg>
                        </span>
                    </button>
                    <div v-if="loadingLoadMoreReplies" class="py-[13px] w-full flex justify-center">
                        <SpinnerSmall />
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref } from 'vue';
import CommentAuthorDetails from './CommentAuthorDetails.vue';
import CommentContent from './CommentContent.vue';
import CommentReactions from './CommentReactions.vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Avatar from '@/components/Utils/Avatar.vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

const store = useStore()
const router = useRouter()

const goToProfile = (userId) => {
    router.push({
        path: '/profile/' + userId
    })
}

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    postId: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    isReply: {
        type: Boolean,
        default: false
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

const isReactingComment = ref(false)
const loadingLoadMoreReplies = ref(false)



const queryReplies = ref({
    page: 1,
    limit: 3,
    parentId: props?.data?._id,
    hasMore: props?.data?.pagination_replies?.hasMore !== undefined ? props?.data?.pagination_replies?.hasMore : props?.data?.replies_count > 3,
    hasTotal: props?.data?.replies_count
})

const handleUpvote = async () => {
    isReactingComment.value = true

    await store.dispatch('toggleUpvoteComment', {
        postId: props?.postId,
        commentId: props?.data?._id
    })
        .finally(() => {
            isReactingComment.value = false
        })
}

const handleOneMore = async (data) => {
    emit('on-more', data)
}

const handleDownvote = async () => {
    isReactingComment.value = true
    await store.dispatch('toggleDownvoteComment', {
        postId: props?.postId,
        commentId: props?.data?._id
    })
        .finally(() => {
            isReactingComment.value = false
        })
}

const loadMoreReplies = async () => {
    const hasMore = queryReplies.value?.hasMore

    if (hasMore) {
        loadingLoadMoreReplies.value = true
        queryReplies.value.page += 1

        await store.dispatch("getCommentsByParentId", {
            ...queryReplies.value,
            postId: props?.data?.post,
            commentId: props?.data?._id
        })
            .then(pagination => {
                const { totalComments, hasMore } = pagination
                queryReplies.value.hasMore = hasMore
                queryReplies.value.hasTotal = totalComments
            })
            .finally(() => {
                loadingLoadMoreReplies.value = false
            })
    }
}

const emit = defineEmits(['openNewCommentDrawer', 'on-reply'])

const onReply = ({ parent, replyTo }) => {
    emit('on-reply', {
        parent,
        replyTo
    })
}
</script>