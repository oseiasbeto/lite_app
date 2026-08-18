export default [
    {
        path: '/reels',
        name: 'Reels',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Reels'
        },
        component: () => import('./views/ReelsPage.vue')
    }
]