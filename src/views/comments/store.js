import { logger } from '@/utils/logger';
import api from '../../api'


// --- Estado de coordenação da fila de upvotes (fora do Vuex; é só controle de fluxo) ---
const upvoteQueues = new Map(); // key: `${postId}:${commentId}` -> { pendingCount, inFlight, timer }
const UPVOTE_DEBOUNCE_MS = 400; // janela de "espera" pra agrupar cliques rápidos

function getQueueEntry(key) {
    if (!upvoteQueues.has(key)) {
        upvoteQueues.set(key, { pendingCount: 0, inFlight: false, timer: null });
    }
    return upvoteQueues.get(key);
}

// Localiza comentário/reply no estado atual (igual ao original, extraído pra reuso)
function findTargetComment(state, postId, commentId) {
    const moduleComments = state.comments.find(m => m.postId === postId);
    if (!moduleComments?.comments?.length) return null;

    const mainComment = moduleComments.comments.find(c => c._id === commentId);
    if (mainComment) return { targetComment: mainComment, parentComment: null };

    for (const c of moduleComments.comments) {
        const reply = c.replies?.find(r => r._id === commentId);
        if (reply) return { targetComment: reply, parentComment: c };
    }
    return null;
}

// Aplica UM toggle local (otimista). Usada tanto no clique quanto na reversão de erro,
// já que "aplicar de novo" desfaz exatamente o efeito líquido de uma chamada que falhou —
// não importa quantos outros cliques aconteceram no meio.
function applyLocalToggle({ commit, state }, { postId, commentId, userId }) {
    const found = findTargetComment(state, postId, commentId);
    if (!found) return;
    const { targetComment, parentComment } = found;

    const hasUpvoted = targetComment.upvotes?.some(id => id === userId) || false;

    const newUpvotes = hasUpvoted
        ? targetComment.upvotes.filter(id => id !== userId)
        : [...(targetComment.upvotes || []), userId];

    const newUpvotesCount = hasUpvoted
        ? targetComment.upvotes_count - 1
        : targetComment.upvotes_count + 1;

    commit("UPDATE_REACTIONS_COMMENT", {
        postId,
        payload: {
            comment_id: commentId,
            parent_id: parentComment?._id || null,
            upvotes: newUpvotes,
            upvotes_count: newUpvotesCount,
            downvotes: targetComment.downvotes,
            downvotes_count: targetComment.downvotes_count,
            replies_count: targetComment.replies_count,
            user_id: userId
        }
    });
}

// Decide se envia (ou não) a chamada de rede, e encadeia a próxima verificação
// assim que a chamada atual terminar.
async function runFlush(ctx, args) {
    const { postId, commentId } = args;
    const key = `${postId}:${commentId}`;
    const queue = getQueueEntry(key);

    if (queue.inFlight) return; // já tem chamada em voo; o finally dela vai chamar runFlush de novo
    if (queue.pendingCount === 0) return; // nada acumulado, nada a fazer

    const isNetToggle = queue.pendingCount % 2 === 1;
    queue.pendingCount = 0; // consome tudo que foi acumulado até aqui

    if (!isNetToggle) return; // número par de cliques = estado líquido inalterado, sem chamada

    queue.inFlight = true;
    try {
        await api.put(`/comments/${postId}/${commentId}/toggle-upvote`);
        // sucesso: o estado local já está correto, nada a fazer
    } catch (error) {
        logger.error("Erro ao tentar dar upvote no comentário: ", error);
        // reverte exatamente o efeito líquido desta chamada (1 toggle),
        // aplicado sobre o estado ATUAL (que pode já ter novos cliques em cima)
        applyLocalToggle(ctx, args);
    } finally {
        queue.inFlight = false;
        runFlush(ctx, args); // reavalia na hora, sem novo debounce, se sobrou algo pendente
    }
}

function scheduleFlush(ctx, args) {
    const key = `${args.postId}:${args.commentId}`;
    const queue = getQueueEntry(key);
    clearTimeout(queue.timer);
    queue.timer = setTimeout(() => runFlush(ctx, args), UPVOTE_DEBOUNCE_MS);
}


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
        // Mantida exatamente como estava
        UPDATE_REACTIONS_COMMENT(state, { postId, payload }) {
            if (!postId || !payload) return

            const {
                comment_id,
                parent_id,
                upvotes,
                upvotes_count,
                downvotes,
                replies_count,
                user_id,
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
        toggleUpvoteComment(ctx, { postId, commentId, userId }) {
            const args = { postId, commentId, userId };
            const key = `${postId}:${commentId}`;
            const queue = getQueueEntry(key);

            // 1. UI: alterna na hora, sempre, sem exceção
            applyLocalToggle(ctx, args);

            // 2. Conta o clique e (re)agenda a avaliação com debounce
            queue.pendingCount++;
            scheduleFlush(ctx, args);
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