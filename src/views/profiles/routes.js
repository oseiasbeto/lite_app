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
    },
    {
        path: '/profile/:profile_id/picture-fullscreen',
        name: 'Avatar',
        meta: {
            requiresAuth: true,
            rootPage: 'profile',
            title: 'Foto de Perfil'
        },
        component: () => import('./views/PictureFullScreen.vue')
    },
]