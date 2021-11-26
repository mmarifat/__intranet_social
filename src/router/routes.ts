import {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('layouts/main.layout.vue'),
        children: [
            {
                path: '',
                component: () => import('pages/dashboard.page.vue'),
                meta: {
                    title: 'Dashboard'
                }
            }
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/Error404.vue'),
    },
];

export default routes;
