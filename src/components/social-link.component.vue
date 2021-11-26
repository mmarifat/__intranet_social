<template>
    <q-item clickable v-for="link in links" :key="link.caption" @click="changeLink(link)">
        <q-item-section v-if="link.icon" avatar>
            <q-img :src="link.icon"/>
        </q-item-section>

        <q-item-section>
            <q-item-label>{{ link.label }}</q-item-label>
            <q-item-label caption>
                {{ link.caption }}
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useStore} from 'src/store';
import {SocialLinkInterface} from 'src/interfaces/social-link.interface';
import {Plugins} from '../../src-capacitor/node_modules/@capacitor/core';

export default defineComponent({
    name: 'SocialLinkComponent',
    setup() {
        const $store = useStore();

        const links = ref<SocialLinkInterface[]>([
            {
                label: 'Google',
                link: 'https://www.google.com',
                caption: '@google',
                icon: 'logo/google.png',
                mobileOnly: true
            },
            {
                label: 'Youtube',
                link: 'https://m.youtube.com',
                caption: '@youtube',
                icon: 'logo/youtube.png',
                mobileOnly: true
            },
            {
                label: 'Facebook',
                link: 'https://m.facebook.com',
                caption: '@facebook',
                icon: 'logo/facebook.png',
                mobileOnly: true
            }
        ])

        const changeLink = async (link: SocialLinkInterface) => {
            $store.commit('SET_SOCIAL_LINK', link)
            await Plugins.Browser.open({
                url: link.link
            })
        }

        return {links, changeLink}
    }
})
</script>
