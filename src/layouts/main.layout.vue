<template>
    <q-layout view='lHh Lpr lFf'>
        <q-header elevated class='bg-light-blue-10'>
            <q-toolbar>
                <q-btn flat dense round icon='menu' aria-label='Menu'
                       @click='leftDrawerOpen = !leftDrawerOpen' />

                <q-toolbar-title>
                    Intranet Social
                </q-toolbar-title>

                <div class='cursor-pointer' v-if='$route.name === "dashboard"'>
                    {{ upTime }} <br />
                    <q-tooltip class='bg-light-blue-10' :offset='[10, 10]'>
                        Saved to profile in every 5 minutes
                    </q-tooltip>
                </div>
            </q-toolbar>
        </q-header>

        <q-drawer v-model='leftDrawerOpen' bordered behavior='mobile'>
            <menu-component />

            <q-footer elevated class='row justify-between bg-transparent'>
                <q-btn
                    label='Sign Out'
                    color='blue'
                    no-wrap
                    icon='power_off'
                    class='full-width'
                    @click='confirmSignOut = true' />
            </q-footer>
        </q-drawer>

        <q-dialog v-model='confirmSignOut' persistent>
            <q-card>
                <q-card-section class='row items-center'>
                    <q-avatar rounded size='lg' icon='power_off' color='primary' text-color='white' />
                    <span class='q-ml-sm'>Are you sure to sign out?</span>
                </q-card-section>

                <q-card-actions align='right'>
                    <q-btn flat label='No' color='primary' text-color='negative' v-close-popup />
                    <q-btn flat label='Yes' color='primary' @click='signOut' />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue';
import { QSpinnerDots, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { realmWebApp } from '../custom/funtions/RealmWebClient';
import { GoogleAuth } from '../../src-capacitor/node_modules/@codetrix-studio/capacitor-google-auth';
import { useEmitter } from '../boot/mitt';
import MenuComponent from '../components/menu.component.vue';

export default defineComponent({
    name: 'MainLayout',
    components: { MenuComponent },
    setup() {
        const router = useRouter();
        const $q = useQuasar();
        const emitter: any = useEmitter();

        const leftDrawerOpen = ref(false);
        const confirmSignOut = ref(false);
        const upTime = ref('00:00');

        onMounted(() => {
            if (!$q.platform.is.capacitor) {
                GoogleAuth.init();
            }
            emitter.on('up-time', (time: string) => {
                upTime.value = time;
            });
            emitter.on('sign-out', async () => {
                await signOut();
            });
        });

        const signOut = async () => {
            $q.loading.show({
                message: 'Signing in...........',
                spinner: QSpinnerDots,
                spinnerSize: 50
            });
            try {
                await GoogleAuth.signOut();
                await realmWebApp.removeUser(realmWebApp?.currentUser as any);
                await realmWebApp.currentUser?.logOut();

                confirmSignOut.value = false;
                $q.loading.hide();

                await router.push({ name: 'login' });
                $q.notify({
                    message: 'Successfully logged out',
                    type: 'positive'
                });
            } catch (e) {
                await router.push({ name: 'login' });
                confirmSignOut.value = false;
                $q.loading.hide();
                $q.notify({
                    message: 'Error during logout'
                });
            }
        };

        return {
            leftDrawerOpen,
            confirmSignOut,
            upTime,
            signOut
        };
    }
});
</script>
