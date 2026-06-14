export default [
    {
        path: '/settings',
        name: 'Settings',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Configurações'
        },
        component: () => import('./views/Settings.vue')
    },
]