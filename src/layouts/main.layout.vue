<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-light-blue-10">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer"/>

        <q-toolbar-title>
          Hybrid Social
        </q-toolbar-title>

        <div>Version - 1.0.0</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawer" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Social Links
        </q-item-label>

        <essential-link-component/>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import EssentialLinkComponent from 'components/social-link.component.vue'

import {computed, defineComponent} from 'vue'
import {useStore} from 'src/store';

export default defineComponent({
  name: 'MainLayout',
  components: {EssentialLinkComponent},
  setup() {
    const $store = useStore();

    const leftDrawer = computed({
      get: () => $store.getters.getLeftDrawer,
      set: () => $store.commit('SET_LEFT_DRAWER')
    });

    const toggleLeftDrawer = () => {
      $store.commit('SET_LEFT_DRAWER')
    }

    return {
      leftDrawer,
      toggleLeftDrawer
    }
  }
})
</script>
