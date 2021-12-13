<template>
    <div class='fullscreen bg-light-blue-6 text-white text-center q-pa-md flex flex-center'>
        <div>

            <div class='text-h4' style='opacity:0.6'>
                Welcome
            </div>

            <div class='q-my-lg'>
                <q-btn
                    color='red-7'
                    label='SignIn'
                    icon-right='fab fa-google'
                    text-color='white'
                    unelevated
                    no-caps
                    @click="logIn"
                />
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue';
import '../../src-capacitor/node_modules/@codetrix-studio/capacitor-google-auth';
import {Plugins} from '../../src-capacitor/node_modules/@capacitor/core';

export default defineComponent({
    name: 'Login',
    setup() {
        /*onMounted(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            Plugins.GoogleAuth.initialize();
        });*/

        const logIn = async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const response = await Plugins.GoogleAuth.signIn();
            console.log(response);
        };

        return {
            logIn,
        };
    },
});
</script>
