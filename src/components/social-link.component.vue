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
        label: 'Google',
        link: 'https://www.google.com/webhp?igu=1',
        caption: '@google',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/1200px-Google_%22G%22_Logo.svg.png'
      },
      {
        label: 'Youtube',
        link: 'https://www.youtube.com/webhp?igu=1',
        caption: '@youtube',
        icon: 'https://cliply.co/wp-content/uploads/2019/04/371903520_SOCIAL_ICONS_YOUTUBE.png'
      },
      {
        label: 'Facebook',
        link: 'https://www.facebook.com/webhp?igu=1',
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
