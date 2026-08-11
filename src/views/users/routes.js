export default [
    {
        path: '/search/users',
        name: 'Search',
        meta: {
            requiresAuth: true,
            rootPage: 'users',
            title: 'Pesquisar'
        },
        component: () => import('./views/SearchUsers.vue')
    },
    {
        path: '/people',
        name: 'People',
        meta: {
            requiresAuth: true,
            rootPage: 'users',
            title: 'Pessoas'
        },
        component: () => import('./views/People.vue')
    }
]