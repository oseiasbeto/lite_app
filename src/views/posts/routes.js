export default [
    {
        path: '/composer',
        name: 'Composer',
        meta: {
            requiresAuth: true,
            rootPage: 'posts',
            title: 'Compor'
        },
        component: () => import('./views/Composer.vue')
    },
    {
        path: '/post/:id',
        name: 'Post details',
        meta: {
            requiresAuth: true,
            rootPage: 'posts',
            title: 'Postagem'
        },
        component: () => import('./views/PostDetails.vue')
    }
]