import { boot } from 'quasar/wrappers';
import { RealmWebClient } from 'src/custom/funtions/RealmWebClient';
import { Notify } from 'quasar';

export default boot(({ router }) => {
    router.beforeEach((to, from, next) => {
        if (to.meta?.protected) {
            if (RealmWebClient.currentUser?.isLoggedIn) {
                next();
            } else {
                router.replace('/');
                Notify.create({
                    message: 'Access Protected',
                    caption: 'Please login first!',
                    type: 'negative'
                });
            }
        } else {
            if (!RealmWebClient.currentUser?.isLoggedIn) {
                next();
            } else {
                router.replace('/dashboard');
                /*Notify.create({
                    message: 'Already logged in',
                    caption: 'Please log out first!',
                    type: 'warning'
                });*/
            }
        }
    });
});
