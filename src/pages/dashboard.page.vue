<template>
    <q-page>
        <div class="q-pa-sm" v-if="!!socialLink.label">
            Now Running => {{ socialLink.link }}
        </div>
        <div class="q-pa-sm" v-else>
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
