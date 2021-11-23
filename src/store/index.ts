import {store} from 'quasar/wrappers'
import {InjectionKey} from 'vue'
import {createStore, Store as VuexStore, useStore as vuexUseStore} from 'vuex'
import {SocialLinkInterface} from 'src/interfaces/social-link.interface';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface StateInterface {
  // Define your own store structure, using submodules if needed
  // example: ExampleStateInterface;
  // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
  leftDrawer: boolean
  socialLink: SocialLinkInterface
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> = Symbol('vuex-key')

export default store(function (/* { ssrContext } */) {
  return createStore<StateInterface>({
    state: {
      leftDrawer: false,
      socialLink: {
        link: '',
        icon: '',
        label: '',
        caption: '',
      }
    },
    mutations: {
      SET_LEFT_DRAWER(state) {
        state.leftDrawer = !state.leftDrawer;
      },
      SET_SOCIAL_LINK(state, payload) {
        state.socialLink = payload;
      }
    },
    getters: {
      getLeftDrawer: state => state.leftDrawer,
      getSocialLink: state => state.socialLink
    },
    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING
  });
})

export function useStore() {
  return vuexUseStore(storeKey)
}