import { boot } from 'quasar/wrappers';
import { Notify } from 'quasar';
import { realmWebApp } from '../custom/funtions/RealmWebClient';

export default boot(({ router }) => {
    router.beforeEach((to, from, next) => {
        if (to.meta?.protected) {
            if (realmWebApp.currentUser?.isLoggedIn) {
                if (realmWebApp.currentUser?.customData?.invitedBy === null) {
                    router.replace('/');
                } else {
                    if (to.meta?.onlyAdmin === true && realmWebApp.currentUser?.customData?.userType !== 'admin') {
                        router.replace('/dashboard');
                    } else {
                        next();
                    }
                }
            } else {
                router.replace('/');
                Notify.create({
                    message: 'Access Protected',
                    caption: 'Please login first!',
                    type: 'negative'
                });
            }
        } else {
            if (!realmWebApp.currentUser?.isLoggedIn) {
                next();
            } else {
                if (realmWebApp.currentUser?.customData?.invitedBy === null) {
                    next();
                } else {
                    router.replace('/dashboard');
                }
            }
        }
    });
});
