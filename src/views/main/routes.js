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
    },
    {
        path: '/notifications',
        name: 'Notifications',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Notificacao'
        },
        component: () => import('./views/Notifications.vue')
    }
]