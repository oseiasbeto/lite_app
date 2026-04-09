import { logger } from '@/utils/logger';
import api from '../../api'

export default {
    state: {
        posts: [],
        post: {},
        parentPost: {}
    },
    mutations: {
        PUSH_MODULE_FROM_POSTS(state, payload) {
            const posts = state.posts;

            if (!posts) return;

            const byModule = payload?.module || null

            const index = posts.findIndex(p => p.module === byModule)

            if (index === -1) {
                posts.push(payload);
            } else {
                const cachedModule = state.posts[index];
                const posts = payload?.posts || []
                const { page, totalPages, hasMore } = payload?.pagination || {}

                if (!posts.length) return

                // Filtra os novos posts para remover quaisquer que já existam no cache
                const uniqueNewPosts = posts.filter(
                    (newPost) =>
                        !cachedModule.posts.some(
                            (existingPost) => existingPost._id === newPost._id
                        )
                );

                cachedModule.posts = [...cachedModule.posts, ...uniqueNewPosts];
                cachedModule.pagination.page = page;
                cachedModule.pagination.totalPages = totalPages;
                cachedModule.pagination.hasMore = hasMore
            }
        },
        SET_POSTS_FROM_MODULE(state, payload) {
            const posts = state.posts;

            if (!posts) return;

            const byModule = payload?.module || null

            const index = posts.findIndex(p => p.module === byModule)

            if (index !== -1) {
                const cachedModule = state.posts[index];
                const posts = payload?.posts || []
                const { page, totalPages, hasMore } = payload?.pagination || {}

                if (!posts.length) return

                cachedModule.posts = posts;
                cachedModule.pagination.page = page;
                cachedModule.pagination.totalPages = totalPages;
                cachedModule.pagination.hasMore = hasMore
            } else {
                posts.push(payload);
            }
        },
        SET_POST(state, payload) {
            state.post = payload
        },
        SET_PARENT_POST(state, payload) {
            state.parentPost = payload
        },
        UPDATE_REACTIONS_POST(state, { module, payload }) {
            if (!module || !payload) return

            const {
                post_id,
                upvotes,
                upvotes_count,
                downvotes,
                comments_count,
                shares_count,
                downvotes_count
            } = payload

            const modulePosts = state.posts.find(m => m.module === module)

            if (modulePosts?.posts?.length) {
                const post = modulePosts.posts.find(p => p?._id === post_id)

                if (post) {
                    post.upvotes = upvotes
                    post.upvotes_count = upvotes_count
                    post.downvotes = downvotes
                    post.downvotes_count = downvotes_count
                    post.comments_count = comments_count
                    post.shares_count = shares_count
                }

                if (module !== 'feed') {
                    const moduleFeedPosts = state.posts.find(m => m.module === 'feed')

                    if (moduleFeedPosts?.posts?.length) {
                        const post = moduleFeedPosts.posts.find(p => p?._id === post_id)

                        if (post) {
                            post.upvotes = upvotes
                            post.upvotes_count = upvotes_count
                            post.downvotes = downvotes
                            post.downvotes_count = downvotes_count
                            post.comments_count = comments_count
                            post.shares_count = shares_count
                        }
                    }
                } else if (module !== 'profile') {
                    const moduleProfilePosts = state.posts.find(m => m.module === 'profile')

                    if (moduleProfilePosts?.posts?.length) {
                        const post = moduleProfilePosts.posts.find(p => p?._id === post_id)

                        if (post) {
                            post.upvotes = upvotes
                            post.upvotes_count = upvotes_count
                            post.downvotes = downvotes
                            post.downvotes_count = downvotes_count
                            post.comments_count = comments_count
                            post.shares_count = shares_count
                        }
                    }
                }
            }

            const post = state.post

            if (post?._id === post_id) {
                post.upvotes = upvotes
                post.upvotes_count = upvotes_count
                post.downvotes = downvotes
                post.downvotes_count = downvotes_count
                post.comments_count = comments_count
                post.shares_count = shares_count
            }
        },
        UPDATE_PAGINATION_POSTS_FROM_CACHE(state, payload) {
            const modulePosts = state.posts;

            if (!modulePosts?.length) return;

            const module = payload?.module || null

            const index = modulePosts.findIndex(m => m.module === module)

            if (index !== -1) {
                const { scrollTop } = payload

                state.posts[index].pagination = {
                    ...state.posts[index].pagination,
                    ...(scrollTop && {
                        scrollTop
                    })
                }
            }
        },
        INC_COMMENTS_COUNT_FROM_POST(state, postId) {
            const post = state.post

            if (post && post?._id === postId) {
                post.comments_count += 1
            }
        }
    },
    actions: {
        async createPost({ commit }, data) {
            try {
                const response = await api.post('/posts', data);
                const { new_post } = response.data

                commit("SET_POST", new_post)

                return new_post
            } catch (error) {
                logger.error(error);
            }
        },
        async getPostById({ commit }, { postId, type = 'post' }) {
            try {
                const response = await api.get('/posts/' + postId);
                const { post } = response.data

                if (type == 'post') {
                    commit("SET_POST", post)
                } else if (type == 'parentPost') {
                    commit("SET_PARENT_POST", post)
                }


                return post
            } catch (err) {
                logger.error(err);
                throw err
            }
        },
        async getFeedPosts({ commit }, query) {
            try {
                const { module, hasTotal, page: currentPage, limit } = query

                const response = await api.get('/posts/feed', {
                    params: {
                        page: currentPage,
                        total: hasTotal,
                        limit: limit
                    }
                });

                const { posts, page, totalPages, total, hasMore } = response.data

                const payload = {
                    module,
                    posts,
                    pagination: {
                        page,
                        total,
                        hasMore,
                        totalPages,
                    }
                }

                commit("PUSH_MODULE_FROM_POSTS", payload)
            } catch (error) {
                logger.error(error);
            }
        },
        async getProfilePosts({ commit }, query) {
            try {
                const { module, userId, isPush = true, type = 'post', hasTotal, page: currentPage, limit } = query

                const response = await api.get('/posts/user/' + userId, {
                    params: {
                        page: currentPage,
                        type,
                        total: hasTotal,
                        limit: limit
                    }
                });

                const { posts, page, totalPages, total, hasMore } = response.data

                const payload = {
                    module,
                    posts,
                    pagination: {
                        page,
                        total,
                        hasMore,
                        totalPages,
                    }
                }

                if (isPush) {
                    commit("PUSH_MODULE_FROM_POSTS", payload)
                } else {
                    commit("SET_POSTS_FROM_MODULE", payload)
                }

            } catch (err) {
                logger.error("Erro ao carregar mais postagens:", err?.response?.data?.message || err);
                throw err
            }
        },
        async toggleUpvotePost({ commit }, { postId, module }) {
            try {
                const response = await api.put(`/posts/${postId}/toggle-upvote`);

                const { post } = response.data
                const { upvotes, upvotes_count, downvotes, comments_count, shares_count, downvotes_count } = post

                const payload = {
                    post_id: post?._id,
                    upvotes,
                    upvotes_count,
                    downvotes,
                    comments_count,
                    shares_count,
                    downvotes_count
                }

                commit("UPDATE_REACTIONS_POST", {
                    payload,
                    module
                })
            } catch (error) {
                logger.error("Erro ao adicionar/remover voto positivo na postagem:", error?.response?.message);
            }
        },
        async toggleDownvotePost({ commit }, { postId, module }) {
            try {
                const response = await api.put(`/posts/${postId}/toggle-downvote`);

                const { post } = response.data
                const { upvotes, upvotes_count, downvotes, comments_count, shares_count, downvotes_count } = post

                const payload = {
                    post_id: post?._id,
                    upvotes,
                    upvotes_count,
                    downvotes,
                    comments_count,
                    shares_count,
                    downvotes_count
                }

                commit("UPDATE_REACTIONS_POST", {
                    payload,
                    module
                })
            } catch (error) {
                logger.error("Erro ao adicionar/remover voto positivo na postagem:", error?.response?.message);
            }
        },
    },
    getters: {
        currentPost: (state) => state.post,
        parentPost: (state) => state.parentPost,
        modulePosts: (state) => state.posts,
    }
}