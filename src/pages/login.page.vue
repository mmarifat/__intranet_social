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
import { defineComponent, onMounted } from 'vue';
import { QSpinnerFacebook, useQuasar } from 'quasar';
import { GoogleAuth } from '../../src-capacitor/node_modules/@codetrix-studio/capacitor-google-auth';
import { LogInOrRegister, RealmWebClient } from 'src/custom/funtions/RealmWebClient';

export default defineComponent({
    name: 'Login',
    setup() {
        const $q = useQuasar();

        onMounted(() => {
            if (!$q.platform.is.capacitor) {
                GoogleAuth.init();
            }
            const checkGoogleLoggedInStatus = () => {
                if (RealmWebClient.currentUser?.isLoggedIn) {
                    window.location.href = '/dashboard';
                }
            };
            checkGoogleLoggedInStatus();
        });

        const googleSignIn = async () => {
            $q.loading.show({
                message: 'Signing in...........',
                spinner: QSpinnerFacebook,
                spinnerSize: 50
            });
            try {
                const response = await GoogleAuth.signIn();

                if (response) {
                    const user = {
                        ...response,
                        isGoogleUser: true,
                        isFacebookUser: false
                    };

                    const api = await LogInOrRegister(user.email, user.id);

                    await api?.collection('users').updateOne({
                        email: user.email,
                        id: user.id
                    }, {
                        ...user,
                        realmWebID: RealmWebClient.currentUser?.id
                    }, {
                        upsert: true
                    });

                    window.location.href = '/dashboard';
                    $q.notify({
                        message: `Successfully logged in as ${response.givenName}`,
                        type: 'positive'
                    });
                    $q.loading.hide();
                } else {
                    $q.notify({
                        message: 'Login cancelled',
                        type: 'negative'
                    });
                }
            } catch (e) {
                $q.loading.hide();
            }

        };

        return {
            googleSignIn
        };
    }
});
</script>
