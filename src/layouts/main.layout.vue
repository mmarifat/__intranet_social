<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated class="bg-light-blue-10">
            <q-toolbar>
                <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer"/>

                <q-toolbar-title>
                    Intranet Social
                </q-toolbar-title>

                <div>1.0.0</div>
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
            <q-list>
                <q-item-label header>
                    Intranet Social Links
                </q-item-label>

                <q-item-section>
                    <essential-link-component/>
                </q-item-section>

                <q-footer reveal class="row justify-between bg-transparent">
                    <q-btn
                        label="Sign Out"
                        color="blue"
                        no-wrap
                        icon="power_off"
                        class="full-width"
                        @click="confirmSignOut = true"/>
                </q-footer>
            </q-list>
        </q-drawer>

        <q-dialog v-model="confirmSignOut" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar rounded size="lg" icon="power_off" color="primary" text-color="white"/>
                    <span class="q-ml-sm">Are you sure to sign out?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="No" color="primary" text-color="negative" v-close-popup/>
                    <q-btn flat label="Yes" color="primary" @click="signOut"/>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-page-container>
            <router-view/>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {useQuasar} from 'quasar';
import {useRouter} from 'vue-router';
import EssentialLinkComponent from 'components/social-link.component.vue'
import {GoogleAuth} from '../../src-capacitor/node_modules/@codetrix-studio/capacitor-google-auth';
import {Storage} from '../../src-capacitor/node_modules/@capacitor/storage';
import {StorageKeys} from 'src/custom/enums/StorageKeys';

export default defineComponent({
    name: 'MainLayout',
    components: {EssentialLinkComponent},
    setup() {
        const router = useRouter();
        const $q = useQuasar();

        const leftDrawerOpen = ref(false)
        const confirmSignOut = ref(false)

        const signOut = async () => {
            try {
                await GoogleAuth.signOut();

                await Storage.remove({
                    key: StorageKeys.GOOGLEUSER
                });

                router.push({name: 'login'});
                $q.notify({
                    message: 'Successfully logged out',
                    type: 'positive'
                })
                confirmSignOut.value = false;
            } catch (e) {
                $q.notify({
                    message: 'Not logged in'
                })
            }
        }

        return {
            leftDrawerOpen,
            toggleLeftDrawer() {
                leftDrawerOpen.value = !leftDrawerOpen.value
            },
            confirmSignOut,
            signOut,
        }
    }
})
</script>
