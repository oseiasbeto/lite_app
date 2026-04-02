export default [
    {
        path: '/profile/:profile_id',
        name: 'Profile',
        meta: {
            requiresAuth: true,
            rootPage: 'profiles',
            title: 'Perfil'
        },
        component: () => import('./views/Profile.vue')
    }
]