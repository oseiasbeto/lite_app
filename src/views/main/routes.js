export default [
    {
        path: '/home',
        name: 'Home',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Página inicial'
        },
        component: () => import('./views/Home.vue')
    }
]