export default [
    {
        path: '/search',
        name: 'Search',
        meta: {
            requiresAuth: true,
            rootPage: 'search',
            title: 'Pesquisar'
        },
        component: () => import('./views/Search.vue')
    }
]