<template>
    <!--Sem bordas nem fundo: comentarios "soltos" como no TikTok-->
    <div :class="['relative flex flex-col', isReply ? 'pt-3' : 'px-4 pt-4', active ? 'bg-x-light-surfaceActive dark:bg-x-dark-surfaceActive' : 'bg-transparent']">

        <div class="relative flex flex-row gap-3">
            <div @click="goToProfile(data?.author?._id || data?.user?._id)" class="shrink-0 cursor-pointer">
                <Avatar :size="isReply ? 'xs' : 'md'" :url="isReply ? data?.author?.profile_image?.thumbnails?.xs || data?.author?.profile_image?.url :
                    data?.author?.profile_image?.thumbnails?.md || data?.author?.profile_image?.url" />
            </div>

            <div class="flex-1 min-w-0">
                <!--Area principal: reserva espaco a direita para o coracao (coluna de likes do TikTok)-->
                <div class="pr-12">
                    <!--AUTHOR DETAILS-->
                    <CommentAuthorDetails :author="data?.author || data?.user || {}" :user-id="userId"
                        :created-at="data?.created_at" />

                    <!--BODY-->
                    <div>
                        <p v-if="isReply && data?.reply_to?._id !== data?.author?._id"
                            class="flex gap-1 items-center text-[13px] min-w-0 mt-0.5">
                            <span class="shrink-0 text-x-light-textSecondary dark:text-x-dark-textSecondary">Em resposta a</span>
                            <router-link class="font-semibold truncate text-x-light-textSecondary dark:text-x-dark-textSecondary"
                                :to="`/profile/${data?.reply_to?._id}`">
                                {{ '@' + data?.reply_to?.username }}
                            </router-link>
                        </p>
                        <CommentContent :content="data?.content || ''" />
                    </div>

                    <!--FOOTER: data + Responder + mais (o coracao posiciona-se a direita, absoluto)-->
                    <CommentReactions :loading="isReactingComment" :upvotes="data?.upvotes"
                        :upvotes-count="data?.upvotes_count" :downvotes="data?.downvotes" :user-id="userId"
                        :downvotes-count="data?.downvotes_count" :replies-count="data?.replies_count"
                        :shares-count="data?.shares_count" :created-at="data?.created_at"
                        @on-more="handleOneMore(data)"
                        @on-upvote="handleUpvote"
                        @on-downvote="handleDownvote" @on-reply="onReply({
                            parent: data?.parent || data,
                            replyTo: data?.author
                        })" />
                </div>

                <!--REPLIES-->
                <div v-if="data?.replies?.length" class="relative">
                    <div v-for="reply in data?.replies" :key="reply?._id" class="relative">
                        <!--
                            🔒 CORREÇÃO DE SEGURANÇA:
                            Antes: @on-more="handleOneMore(data)" -> enviava sempre o comentário PAI,
                            mesmo estando dentro do loop de replies. Isso fazia o drawer "mais opções"
                            abrir com o autor/ID errado (o do pai, não o da resposta clicada),
                            permitindo editar/excluir/seguir a pessoa errada.
                            Agora: repassamos a própria função como referência (pass-through), para
                            que o payload emitido pelo CommentCard filho (que já é o "reply" certo,
                            capturado no closure correto dele) seja propagado sem substituição.
                        -->
                        <CommentCard :post-id="postId"
                            :user-id="userId" :data="reply"
                            :is-reply="true"
                            @on-more="handleOneMore"
                            @on-reply="onReply"
                            />
                    </div>

                    <!--LOAD MORE: traco curto + texto, como "Ver respostas" do TikTok-->
                    <button class="flex items-center gap-2 pt-3 pb-1 text-[13px] text-x-light-textSecondary dark:text-x-dark-textSecondary"
                        @click="loadMoreReplies" v-if="queryReplies?.hasMore && !loadingLoadMoreReplies">
                        <span class="block w-6 h-px bg-x-light-border dark:bg-x-dark-border"></span>
                        <span class="flex items-center gap-1">
                            <span class="font-semibold">Ver mais respostas</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="m5 8.5 7 7 7.005-7" class="icon_svg-stroke" stroke="currentColor"
                                    stroke-width="2.5" fill="none" stroke-linecap="round"></path>
                            </svg>
                        </span>
                    </button>
                    <div v-if="loadingLoadMoreReplies" class="pt-3 pb-1 w-full flex justify-start pl-8">
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
        commentId: props?.data?._id,
        userId: props?.userId
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

const emit = defineEmits(['openNewCommentDrawer', 'on-more', 'on-reply'])

const onReply = ({ parent, replyTo }) => {
    emit('on-reply', {
        parent,
        replyTo
    })
}
</script>