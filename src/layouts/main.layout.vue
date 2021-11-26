<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated class="bg-light-blue-10">
            <q-toolbar>
                <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer"/>

                <q-toolbar-title>
                    Intranet Social
                </q-toolbar-title>

                <div>Version - 1.0.0</div>
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

                <q-footer reveal class="bg-transparent text-black row justify-end q-px-sm text-weight-light">
                    <small>copyright-mmarifat@{{ new Date().getFullYear() }}</small>
                </q-footer>
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view/>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import EssentialLinkComponent from 'components/social-link.component.vue'

import {defineComponent, ref} from 'vue'

export default defineComponent({
    name: 'MainLayout',
    components: {EssentialLinkComponent},
    setup() {
        const leftDrawerOpen = ref(false)

        return {
            leftDrawerOpen,
            toggleLeftDrawer() {
                leftDrawerOpen.value = !leftDrawerOpen.value
            }
        }
    }
})
</script>
