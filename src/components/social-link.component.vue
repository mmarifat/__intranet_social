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
import {defineComponent, ref} from 'vue'
import {SocialLinkInterface} from 'src/interfaces/social-link.interface';
import {useStore} from 'src/store';

export default defineComponent({
  name: 'SocialLinkComponent',

  setup() {
    const $store = useStore();

    const links = ref<SocialLinkInterface[]>([
      {
        label: 'Youtube',
        link: 'https://www.youtube.com',
        caption: '@youtube',
        icon: 'https://cliply.co/wp-content/uploads/2019/04/371903520_SOCIAL_ICONS_YOUTUBE.png'
      },
      {
        label: 'Facebook',
        link: 'https://www.facebook.com',
        caption: '@facebook',
        icon: 'https://cdn3.iconfinder.com/data/icons/capsocial-round/500/facebook-512.png'
      },
      {
        label: 'Movie Lover BD',
        link: 'https://www.mlwbd.com',
        caption: '@mlwbd',
        icon: 'https://en.wikialpha.org/mediawiki/images/9/99/MLWBD.png'
      }
    ])

    const changeLink = (link: SocialLinkInterface) => {
      $store.commit('SET_SOCIAL_LINK', link)
      $store.commit('SET_LEFT_DRAWER')
    }

    return {links, changeLink}
  }
})
</script>
