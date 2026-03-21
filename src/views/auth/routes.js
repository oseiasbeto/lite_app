export default [
    {
        path: '/',
        name: 'Login',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: 'Auth'
        },
        component: () => import('./views/Wekcome.vue')
    },
    {
        path: '/auth/signin',
        name: 'SignIn',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: 'Iniciar Sessão'
        },
        component: () => import('./views/Signin.vue')
    },
    {
        path: '/auth/signup',
        name: 'SignUp',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: 'Criar Conta'
        },
        component: () => import('./views/Signup.vue')
    },
    {
        path: '/auth/forgot-password',
        name: 'Forgot password',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: 'Esqueci a senha'
        },
        component: () => import('./views/ForgotPassword.vue')
    }
]