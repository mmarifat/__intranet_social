import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'login',
        component: () => import('pages/login.page.vue'),
        meta: {
            title: 'Login',
            protected: false
        }
    },
    {
        path: '/dashboard',
        component: () => import('layouts/main.layout.vue'),
        children: [
            {
                path: '',
                name: 'dashboard',
                component: () => import('pages/dashboard.page.vue'),
                meta: {
                    title: 'Dashboard',
                    protected: true
                }
            },
            {
                path: '/profile',
                name: 'profile',
                component: () => import('pages/profile.page.vue'),
                meta: {
                    title: 'Profile',
                    protected: true
                }
            },
            {
                path: '/users',
                name: 'users',
                component: () => import('pages/users.page.vue'),
                meta: {
                    title: 'Users',
                    protected: true,
                    adminOnly: true
                }
            }
        ]
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/error404.page.vue')
    }
];

export default routes;
