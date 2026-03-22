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
    }
]