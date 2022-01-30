import { boot } from 'quasar/wrappers';
import mitt from 'mitt';
import { getCurrentInstance } from 'vue';

const emitter = mitt();

export default boot(({ app }) => {
    app.config.globalProperties.emitter = emitter;
});

export function useEmitter() {
    const internalInstance = getCurrentInstance();
    return internalInstance?.appContext.config.globalProperties.emitter;
}

