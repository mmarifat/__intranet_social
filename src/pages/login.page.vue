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
                    @click="googleSignIn"
                />
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import {defineComponent, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useQuasar} from 'quasar';
import {GoogleAuth} from '../../src-capacitor/node_modules/@codetrix-studio/capacitor-google-auth';
import {Storage} from '../../src-capacitor/node_modules/@capacitor/storage';
import {StorageKeys} from 'src/custom/enums/StorageKeys';

export default defineComponent({
    name: 'Login',
    setup() {
        const router = useRouter();
        const $q = useQuasar();

        onMounted(async () => {
            const checkGoogleLoggedInStatus = async () => {
                const {value} = await Storage.get({
                    key: StorageKeys.GOOGLEUSER,
                });
                if (value) {
                    router.push({name: 'dashboard'})
                }
            }
            await checkGoogleLoggedInStatus();
        })

        const googleSignIn = async () => {
            const response = await GoogleAuth.signIn();
            if (response) {
                await Storage.set({
                    key: StorageKeys.GOOGLEUSER,
                    value: JSON.stringify(response)
                });

                const givenName = response.givenName;

                router.push({name: 'dashboard'})
                $q.notify({
                    message: `Successfully logged in as ${givenName}`,
                    type: 'positive'
                })
            } else {
                $q.notify({
                    message: 'Login cancelled',
                    type: 'negative'
                })
            }
        }

        return {
            googleSignIn
        }
    }
});
</script>
