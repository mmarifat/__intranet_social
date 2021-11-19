<template>
  <q-page>
    <div v-if="!!socialLink.link">
      <iframe width="100%" height="100%" :src="socialLink.link" :title="socialLink.caption" frameborder="0"
              allowfullscreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
      </iframe>
    </div>
    <div v-else class="q-pa-sm">
      Welcome to dashboard
    </div>
  </q-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {mapGetters} from 'vuex';

export default defineComponent({
  name: 'DashboardComponent',
  computed: {
    ...mapGetters({
      socialLink: 'getSocialLink'
    })
  }
});
</script>

<style lang="scss">
iframe {
  display: block;
  background: #000;
  border: none;
  height: 100vh;
  width: 100vw;
}
</style>
