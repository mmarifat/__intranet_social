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
                />
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Login',
});
</script>
