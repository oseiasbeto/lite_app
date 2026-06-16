export default [
    {
        path: '/settings',
        name: 'Settings',
        meta: {
            requiresAuth: true,
            rootPage: 'settings',
            title: 'Configurações'
        },
        component: () => import('./views/Settings.vue')
    },
]