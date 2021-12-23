<template>
    <div class='fullscreen bg-light-blue-6 text-white text-center q-pa-md flex flex-center'>
        <div>

            <div class='text-h4' style='opacity:0.6'>
                Welcome to Intranet Social
            </div>

            <div class='q-my-lg'>
                <q-btn
                    color='red-7'
                    label='Sign In'
                    icon='fab fa-google'
                    text-color='white'
                    unelevated
                    no-caps
                    @click='googleSignIn'
                />
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import {defineComponent, onMounted} from 'vue';
import {QSpinnerOval, useQuasar} from 'quasar';
import {useRouter} from 'vue-router';
import * as Realm from 'realm-web';
import * as referralCodes from 'referral-codes';
import {realmWebApp} from 'src/custom/funtions/RealmWebClient';
import {GoogleAuth} from '../../src-capacitor/node_modules/@codetrix-studio/capacitor-google-auth';

export default defineComponent({
    name: 'Login',
    setup() {
        const $q = useQuasar();
        const $router = useRouter();

        onMounted(() => {
            if (!$q.platform.is.capacitor) {
                GoogleAuth.init();
            }
            checkGoogleLoggedInStatus();
        });

        const checkGoogleLoggedInStatus = () => {
            if (realmWebApp.currentUser?.isLoggedIn) {
                $router.replace({name: 'dashboard'})
            }
        };

        const googleSignIn = async () => {
            $q.loading.show({
                message: 'Signing in with google...........',
                spinner: QSpinnerOval,
                spinnerSize: 80,
                backgroundColor: 'light-blue-12',
            });
            try {
                const googleCred = await GoogleAuth.signIn();
                if (!!googleCred) {
                    const credential = Realm.Credentials.google({idToken: googleCred.authentication.idToken});
                    await realmWebApp.logIn(credential).then(async response => {
                        const client = response?.mongoClient('mongodb-atlas').db('intranet_social');

                        const googleUserPayload: any = {
                            ...googleCred,
                            realmID: response?.id,
                            sourceID: googleCred.id,
                            sourceType: 'google',
                        }
                        delete googleUserPayload?.id;

                        const alreadyThere = await client?.collection('users').count({
                            realmID: response?.id,
                            sourceID: googleCred.id
                        });

                        if (alreadyThere > 0) {
                            await client?.collection('users').updateOne({
                                realmID: response?.id,
                                sourceID: googleCred.id,
                            }, {
                                ...googleUserPayload,
                            }, {
                                upsert: true
                            });
                        } else {
                            googleUserPayload.inviteCode = referralCodes.generate({pattern: '###-###-##'})[0].toUpperCase();
                            await Promise.all([
                                client?.collection('users').insertOne({...googleUserPayload}),
                                client?.collection('points').insertOne({
                                    realmID: response?.id,
                                    invitedBy: null,
                                    invitedPoint: 0,
                                    reward: 0,
                                })
                            ]).then(async () => {
                                await realmWebApp.logIn(credential);
                            })
                        }
                    }).then(() => {
                        $router.replace({name: 'dashboard'});
                        $q.notify({
                            message: `Successfully logged in as ${googleCred?.givenName}`,
                            type: 'positive'
                        });
                    }).catch(() => {
                        $q.notify({
                            message: 'Something wrong with database-client',
                            type: 'negative'
                        });
                    }).finally(() => {
                        $q.loading.hide();
                    })
                }
            } catch (e) {
                $q.loading.hide();
                $q.notify({
                    message: 'Login cancelled',
                    type: 'negative'
                });
            }
        };
        return {
            googleSignIn
        };
    }
});
</script>
