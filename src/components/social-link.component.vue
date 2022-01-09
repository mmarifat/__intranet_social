<template>
    <q-item clickable v-for='link in links' :key='link.caption' @click='changeLink(link)'>
        <q-item-section v-if='link.icon' avatar>
            <q-img :src='link.icon' />
        </q-item-section>

        <q-item-section>
            <q-item-label>{{ link.label }}</q-item-label>
            <q-item-label caption>
                {{ link.caption }}
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script lang='ts'>
import { defineComponent, ref } from 'vue';
import { SocialLinkInterface } from 'src/custom/interfaces/social-link.interface';
import { Browser } from '../../src-capacitor/node_modules/@capacitor/browser';
import SocialLinks from '../custom/constants/social.links';

export default defineComponent({
    name: 'SocialLinkComponent',
    setup() {
        const links = ref<SocialLinkInterface[]>(SocialLinks);

        const changeLink = async (link: SocialLinkInterface) => {
            await Browser.open({
                url: link.link
            });
        };

        return { links, changeLink };
    }
});
</script>
