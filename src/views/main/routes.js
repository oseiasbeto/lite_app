export default [
    {
        path: '/home',
        name: 'Home',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Home'
        },
        component: () => import('./views/Home.vue')
    }
]