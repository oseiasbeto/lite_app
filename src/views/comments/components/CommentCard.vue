<template>
    <div class=""
        :class="['gap-2 flex pt-1.5 pb-0.5 flex-col dark:border-[rgb(57,56,57)]', isReply ? 'border-none px-0' : 'border-b px-[10px]']">
        <div class="flex flex-row gap-2">
            <div class="shrink-0">
                <Avatar :size="isReply ? 'xs' : 'md'"
                    url="https://qph.cf2.quoracdn.net/main-thumb-1542242401-200-zgcrofpkjukharfjyuwoiltdlabbkjkh.jpeg" />
            </div>
            <div class="flex-1">
                <!--AUTHOR DETAILS-->
                <CommentAuthorDetails 
                :author="data?.author || data?.user || {}" 
                :user-id="userId" 
                :created-at="data?.created_at"
                />
                <!--BODY-->
                <div>
                    <!--CONTENT-->
                    <CommentContent :content="data?.content || ''" />

                    <!--MEDIA-->
                </div>

                <!--FOOTER-->
                <div class="mb-1">
                    <CommentReactions 
                        :loading="isReactingComment" 
                        :upvotes="data?.upvotes"
                        :upvotes-count="data?.upvotes_count" 
                        :downvotes="data?.downvotes"
                        :user-id="userId"
                        :downvotes-count="data?.downvotes_count" 
                        :replies-count="data?.replies_count"
                        :shares-count="data?.shares_count" 
                        @on-upvote="handleUpvote" 
                        @on-downvote="handleDownvote"
                        @on-reply="onReply({
                            parent: data,
                            replyTo: data?.author
                        })" />
                </div>

                <div v-if="data?.replies?.length">
                    <CommentCard v-for="reply in data?.replies" :post-id="postId" :key="reply?._id" :user-id="userId"
                        :data="reply" :is-reply="true" @on-reply="onReply({
                            parent: reply?.parent,
                            replyTo: reply?.author
                        })" />
                </div>
            </div>
        </div>
        <!--LOAD MORE-->
        <button :disabled="loadingLoadMoreReplies" @click="loadMoreReplies" v-if="queryReplies?.hasMore">
            <span v-if="!loadingLoadMoreReplies">Ver mais >

            </span>
            <span v-else>...</span>
        </button>
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

const store = useStore()
const router = useRouter()

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    postId: {
        type: String,
        required: true
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