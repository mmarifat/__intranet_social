import * as Realm from 'realm-web';

const app = new Realm.App({ id: 'intranet-social-cggpq' });

const LogInOrRegister = async (email: string, password: string) => {
    const credentials = Realm.Credentials.emailPassword(email, password);
    try {
        return await app.logIn(credentials, true).then(r =>
            r?.mongoClient('mongodb-atlas').db('intranet_social')
        );
    } catch (e) {
        /* if (e?.error === 'invalid username/password') {*/
        await app.emailPasswordAuth.registerUser(email, password);
        return await app.logIn(credentials, true).then(rr =>
            rr?.mongoClient('mongodb-atlas').db('intranet_social')
        );
    }
};

const RealmWebClient = app;
const RealmWebClientApi = app.currentUser?.mongoClient('mongodb-atlas').db('intranet_social');
const CurrentUserData = app.currentUser?.customData;

export { LogInOrRegister, RealmWebClient, RealmWebClientApi, CurrentUserData };
