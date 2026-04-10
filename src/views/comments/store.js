import { logger } from '@/utils/logger';
import api from '../../api'

export default {
    state: {
        comments: [],
        comment: {}
    },
    mutations: {
        PUSH_COMMENT(state, { postId, payload }) {
            const moduleComments = state.comments;

            if (!moduleComments) return;

            const byPostId = postId || null

            const index = moduleComments.findIndex(c => c.postId === byPostId)

            if (index !== -1) {
                if (!payload?.parent?._id) {
                    moduleComments[index].comments.unshift(payload)
                } else {
                    const parentId = payload?.parent?._id || null

                    if (!parentId) return
                    else {
                        const comment = moduleComments[index].comments.find(c => c._id === parentId)

                        if (comment) {
                            comment.replies.push(payload)
                        }
                    }

                }


            }
        },
        PUSH_COMMENTS_FROM_CACHE(state, payload) {
            const comments = state.comments;

            if (!comments) return;

            const byPostId = payload?.postId || null

            const index = comments.findIndex(c => c.postId === byPostId)

            if (index === -1) {
                if (comments?.length >= 2) {
                    state.comments = [payload]
                } else {
                    comments.push(payload);
                }
            } else {
                const cachedModule = state.comments[index];
                const comments = payload?.comments || []
                const { page, totalPages, hasMore } = payload?.pagination || {}

                if (!comments.length) return

                // Filtra os novos posts para remover quaisquer que já existam no cache
                const uniqueNewComments = comments.filter(
                    (newComment) =>
                        !cachedModule.comments.some(
                            (existingPost) => existingPost._id === newComment._id
                        )
                );

                cachedModule.comments = [...cachedModule.comments, ...uniqueNewComments];
                cachedModule.pagination.page = page;
                cachedModule.pagination.totalPages = totalPages;
                cachedModule.pagination.hasMore = hasMore
            }
        },
        SET_COMMENTS_FROM_CACHE(state, payload) {
            const comments = state.comments;

            if (!comments?.length) return;

            const byPostId = payload?.postId || null

            const index = comments.findIndex(c => c.postId === byPostId)

            if (index === -1) {
                if (comments?.length >= 2) {
                    state.comments = [payload]
                } else {
                    comments.push(payload);
                }
            } else {
                const comments = payload?.comments || []
                const { page, totalPages, hasMore } = payload?.pagination || {}

                if (!comments.length) return

                state.comments[index].comments = comments;
                state.comments[index].pagination.page = page;
                state.comments[index].pagination.totalPages = totalPages;
                state.comments[index].pagination.hasMore = hasMore
            }
        },
        UPDATE_PAGINATION_COMMENTS_FROM_CACHE(state, payload) {
            const comments = state.comments;

            if (!comments) return;

            const byPostId = payload?.postId || null

            const index = comments.findIndex(c => c.postId === byPostId)

            if (index !== -1) {
                const { sortBy, scrollTop } = payload
                state.comments[index].pagination = {
                    ...state.comments[index].pagination,
                    ...(sortBy && {
                        sortBy
                    }),
                    ...(scrollTop && {
                        scrollTop
                    })
                }
            }
        },
        SET_REPLIES_FROM_COMMMENT(state, payload) {
            const comments = state.comments;

            if (!comments) return;

            const { postId, commentId } = payload

            if (!postId) return

            const index = comments.findIndex(c => c.postId === postId)

            if (index !== -1) {
                const moduleComments = state.comments[index];

                const comment = moduleComments.comments.find(c => c._id === commentId)

                if (comment) {
                    const { comments: replies } = payload
                    const { page, totalPages, totalComments, hasMore } = payload?.pagination || {}

                    const uniqueNewReplies = replies.filter(
                        (newReply) =>
                            !comment.replies.some(
                                (existingReply) => existingReply._id === newReply._id
                            )
                    );

                    comment.replies = [...comment.replies, ...uniqueNewReplies];
                    comment.pagination_replies = {
                        page: page,
                        hasMore: hasMore,
                        hasTotal: totalComments
                    }
                }
            }
        },
        UPDATE_REACTIONS_COMMENT(state, { postId, payload }) {
            if (!postId || !payload) return

            const {
                comment_id,
                parent_id,
                upvotes,
                upvotes_count,
                downvotes,
                replies_count,
                downvotes_count
            } = payload



            const moduleComments = state.comments.find(m => m.postId === postId)

            if (moduleComments?.comments?.length) {
                let comment

                if (!parent_id) {
                    comment = moduleComments.comments.find(c => c?._id === comment_id)
                } else {
                    comment = moduleComments.comments.find(c => c?._id === parent_id)
                }

                if (!comment) return
                else {
                    if (!parent_id) {
                        comment.upvotes = upvotes
                        comment.upvotes_count = upvotes_count
                        comment.downvotes = downvotes
                        comment.downvotes_count = downvotes_count
                        comment.replies_count = replies_count
                    } else {
                        const reply = comment.replies.find(r => r._id === comment_id)


                        if (!reply) return
                        else {
                            reply.upvotes = upvotes
                            reply.upvotes_count = upvotes_count
                            reply.downvotes = downvotes
                            reply.downvotes_count = downvotes_count
                            reply.replies_count = replies_count
                        }
                    }

                }
            }
        },
        RESET_COMMENTS_FROM_CACHE(state, postId) {
            const moduleComments = state.comments;

            if (!moduleComments) return;

            const byPostId = postId || null

            const index = moduleComments.findIndex(c => c.postId === byPostId)

            if (index !== -1) {
                moduleComments[index].comments = []
                moduleComments[index].pagination = {
                    page: 1,
                    hasMore: false,
                    limit: 5,
                    total: 0
                }
            }
        },
    },
    actions: {
        async createComment({ commit }, data) {
            try {
                const { content, media, replyTo, postId, parentId } = data
                const response = await api.post('/comments/' + postId, {
                    content,
                    media,
                    parentId,
                    replyTo
                });
                const { new_comment } = response.data

                commit("PUSH_COMMENT", {
                    postId: new_comment?.post,
                    payload: new_comment
                })
                if (!new_comment?.parent?._id) {
                    commit("INC_COMMENTS_COUNT_FROM_POST", postId)
                }

                return new_comment
            } catch (error) {
                logger.error("Erro ao tentar criar um novo comentario: ", error);
            }
        },
        async toggleUpvoteComment({ commit }, { postId, commentId }) {
            try {

                const response = await api.put(`/comments/${postId}/${commentId}/toggle-upvote`);

                const { comment } = response.data

                const { upvotes, upvotes_count, downvotes, replies_count, downvotes_count } = comment

                const payload = {
                    comment_id: comment?._id,
                    parent_id: comment?.parent,
                    upvotes,
                    upvotes_count,
                    downvotes,
                    replies_count,
                    downvotes_count
                }

                commit("UPDATE_REACTIONS_COMMENT", { postId, payload })
            } catch (error) {
                logger.error("Erro ao adicionar/remover voto positivo no comentario:", error?.response?.message);
            }
        },
        async toggleDownvoteComment({ commit }, { postId, commentId }) {
            try {
                const response = await api.put(`/comments/${postId}/${commentId}/toggle-downvote`);

                const { comment } = response.data
                const { upvotes, upvotes_count, downvotes, replies_count, downvotes_count } = comment



                const payload = {
                    comment_id: comment?._id,
                    parent_id: comment?.parent,
                    upvotes,
                    upvotes_count,
                    downvotes,
                    replies_count,
                    downvotes_count
                }



                commit("UPDATE_REACTIONS_COMMENT", { postId, payload })
            } catch (error) {
                logger.error("Erro ao adicionar/remover voto negativo no commentario:", error?.response?.data?.message || error);
            }
        },
        async getCommentsByPostId({ commit }, { query, postId }) {
            try {
                const { hasTotal, sortCommentId, type = 'push', sortBy = 'recents', page: currentPage, limit } = query
                
                const response = await api.get('/comments/' + postId, {
                    params: {
                        page: currentPage,
                        sortBy,
                        total: hasTotal,
                        limit,
                        ...(sortCommentId && {
                            sortCommentId: sortCommentId
                        })
                    }
                });

                const { comments, pagination } = response.data

                const payload = {
                    postId,
                    comments,
                    pagination
                }

                if (type == 'push') {
                    commit("PUSH_COMMENTS_FROM_CACHE", payload)
                } else {
                    commit("SET_COMMENTS_FROM_CACHE", payload)
                }

            } catch (error) {
                logger.error(error);
            }
        },
        async getCommentsByParentId({ commit }, query) {
            try {
                const { hasTotal, commentId, postId, page: currentPage, parentId, limit } = query

                const response = await api.get('/comments/replies/' + parentId, {
                    params: {
                        page: currentPage,
                        total: hasTotal,
                        limit: limit
                    }
                });

                const { comments, pagination } = response.data

                const payload = {
                    commentId,
                    parentId,
                    postId,
                    comments,
                    pagination
                }
                commit("SET_REPLIES_FROM_COMMMENT", payload)

                return pagination
            } catch (error) {
                logger.error(error);
            }
        },
    },
    getters: {
        comments: (state) => state.comments,
    }
}