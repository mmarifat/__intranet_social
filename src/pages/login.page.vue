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
        <referral-component v-model='firstTimeLogin' />
    </div>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue';
import { QSpinnerOval, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import * as Realm from 'realm-web';
import * as referralCodes from 'referral-codes';
import { realmWebApp } from 'src/custom/funtions/RealmWebClient';
import { GoogleAuth } from '../../src-capacitor/node_modules/@codetrix-studio/capacitor-google-auth';
import ReferralComponent from '../components/referral.component.vue';
import { useEmitter } from '../boot/mitt';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const $ = require('mongo-dot-notation');

export default defineComponent({
    name: 'Login',
    components: { ReferralComponent },
    setup() {
        const $q = useQuasar();
        const $router = useRouter();
        const emitter = useEmitter();

        const firstTimeLogin = ref(false);

        onMounted(() => {
            if (!$q.platform.is.capacitor) {
                GoogleAuth.init();
            }
            checkGoogleLoggedInStatus();
        });

        const checkGoogleLoggedInStatus = () => {
            if (realmWebApp.currentUser?.isLoggedIn) {
                $router.replace({ name: 'dashboard' });
            }
        };

        const googleSignIn = async () => {
            $q.loading.show({
                message: 'Signing in with google...........',
                spinner: QSpinnerOval,
                spinnerSize: 60,
                backgroundColor: 'light-blue-12'
            });
            try {
                const googleCred = await GoogleAuth.signIn();
                if (!!googleCred) {
                    const credential = Realm.Credentials.google({ idToken: googleCred.authentication.idToken });
                    await realmWebApp.logIn(credential).then(async response => {
                        const client = response?.mongoClient('mongodb-atlas').db('intranet-social');

                        const googleUserPayload: any = {
                            ...googleCred,
                            realmID: response?.id,
                            sourceID: googleCred.id,
                            sourceType: 'google'
                        };
                        delete googleUserPayload?.id;

                        const alreadyThere = await client?.collection('users').findOne({
                            realmID: response?.id,
                            sourceID: googleCred.id
                        });
                        if (!!alreadyThere) {
                            if (alreadyThere.invitedBy === null) {
                                firstTimeLogin.value = true;
                                emitter.emit('firstTimeLogin', credential);
                            } else {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                const flattenPayload = $.flatten({
                                    ...googleUserPayload,
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                    updatedAt: $.$currentDate()
                                });
                                await client?.collection('users').updateOne({
                                    realmID: response?.id,
                                    sourceID: googleCred.id
                                }, flattenPayload, {
                                    upsert: true
                                });
                            }
                        } else {
                            googleUserPayload.inviteCode = referralCodes.generate({ pattern: '###-###-##' })[0].toUpperCase();
                            googleUserPayload.invitedBy = null;
                            googleUserPayload.invitedPoint = 0.0;
                            googleUserPayload.reward = 0.0;
                            googleUserPayload.rewardCounter = 0;
                            googleUserPayload.createdAt = new Date();
                            client?.collection('users').insertOne({ ...googleUserPayload });
                            firstTimeLogin.value = true;
                            emitter.emit('firstTimeLogin', credential);
                        }
                    }).then(async () => {
                        await realmWebApp.logIn(credential);
                        if (!firstTimeLogin.value) {
                            $router.replace({ name: 'dashboard' }).catch(e => e);
                            $q.notify({
                                message: `Successfully logged in as ${googleCred?.givenName}`,
                                type: 'positive'
                            });
                        }
                    }).catch(() => {
                        $q.notify({
                            message: 'Something wrong with database-client',
                            type: 'negative'
                        });
                    }).finally(() => {
                        $q.loading.hide();
                    });
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
            firstTimeLogin,
            googleSignIn
        };
    }
});
</script>
