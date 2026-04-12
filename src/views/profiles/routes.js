export default [
    {
        path: '/profile/:profile_id',
        name: 'Profile',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Perfil'
        },
        component: () => import('./views/Profile.vue')
    },
    {
        path: '/profile/:profile_id/edit',
        name: 'EditProfile',
        meta: {
            requiresAuth: true,
            rootPage: 'profiles',
            title: 'Editar Perfil'
        },
        component: () => import('./views/EditProfile.vue')
    }
]