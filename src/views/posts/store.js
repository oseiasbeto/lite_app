import api from '../../api'

export default {
    state: {
        posts: [],
        post: {},
        parentPost: {}
    },
    mutations: {
        PUSH_POST(state, payload) {
            const { post, module = 'feed' } = payload
            const moduleIndex = state.posts.findIndex((m) => m.module === module);

            if (moduleIndex === -1) {
                const newModule = {
                    module,
                    items: [post],
                    pagination: {
                        total: 1,
                        page: 1,
                        totalPages: 1,
                        hasMore: false
                    }
                }
                const posts = state.posts
                posts.push(newModule)
            } else {
                const module = state.posts[moduleIndex];

                module.items = [
                    post,
                    ...(Array.isArray(module.items) ? module.items : [])
                ];

                // Atualiza paginação sem conflitos
                module.pagination.total += 1;
                module.pagination.totalPages = Math.ceil(
                    module.pagination.total / module.pagination.limit || 10
                )
            }
        },
    },
    actions: {
        async createPost({ commit }, data) {
            try {
                const response = await api.post('/posts', data);
                const { new_post } = response.data

                if (data?.postShared) {
                    commit("INCREMENT_SHARE_COUNT_POST", {
                        byId: data?.byId,
                        postId: data?.originalPostId ? data?.originalPostId : data?.sharedPostId
                    })
                }

                const payload = {
                    post: new_post,
                    module: data?.module || 'feed'
                }
                commit("PUSH_POST", payload)
            } catch (error) {
                console.error(error);
            }
        },
    },
    getters: {
    }
}