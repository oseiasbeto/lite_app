export default [
    {
        path: '/media/:media_id',
        name: 'Media',
        meta: {
            requiresAuth: true,
            rootPage: 'media',
            title: 'Midia'
        },
        component: () => import('./views/Media.vue')
    }
]