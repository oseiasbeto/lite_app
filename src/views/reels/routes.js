export default [
    {
        path: '/reels',
        name: 'Reels',
        meta: {
            requiresAuth: true,
            rootPage: 'reels',
            title: 'Reels'
        },
        component: () => import('./views/ReelsPage.vue')
    }
]