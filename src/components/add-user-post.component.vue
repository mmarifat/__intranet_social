<template>
    <q-dialog v-model='dialog' persistent maximized>
        <q-card square class='bg-light-blue-2'>
            <q-card-section class='q-pa-none'>
                <q-form
                    @submit='save'
                    autocorrect='off'
                    autocapitalize='off'
                    autocomplete='off'
                >
                    <q-card-section class='text-bold text-h5 text-center q-pa-xs'>
                        New Post
                    </q-card-section>

                    <q-card square class='row q-px-md q-pt-md'>
                        <div class='col-12 q-mb-sm'>
                            <q-input type='textarea' rows='15' hint='Share your story' square outlined
                                     v-model='postContent' />
                        </div>

                        <div class='col-12'>
                            <p>
                                You can <a href='javascript:void(0)' @click='openImgbb()'>
                                upload image here
                            </a>
                                and copy paste the link
                            </p>
                            <q-input square outlined v-model='postImage' label='Image Link'
                                     :rules='[validateImageUrl]' />
                        </div>

                        <div class='col-12'>
                            <q-input square outlined v-model='postYoutube' label='Youtube Url'
                                     :rules='[validateYouTubeUrl]' />
                        </div>

                        <q-card-actions class='q-pt-md q-pb-sm col-12 text-right justify-center'>
                            <q-btn dense color='red' label='Close' @click='close'>
                                <q-tooltip>
                                    Discard your changes
                                </q-tooltip>
                            </q-btn>
                            <q-btn dense color='primary' label='Save' type='submit'>
                                <q-tooltip>
                                    Save your changes
                                </q-tooltip>
                            </q-btn>
                        </q-card-actions>
                    </q-card>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue';
import { useEmitter } from '../boot/mitt';
import { realmWebApp } from '../custom/funtions/RealmWebClient';
import { QSpinnerIos, useQuasar } from 'quasar';
import { Browser } from '../../src-capacitor/node_modules/@capacitor/browser';

export default defineComponent({
    name: 'AddUserPost',
    setup() {
        const $q = useQuasar();
        const emitter = useEmitter();

        const dialog = ref(false);
        const postImage = ref('');
        const postYoutube = ref('');
        const postContent = ref('');

        onMounted(() => {
            emitter.on('open-add-user-post-dialog', (stat: boolean) => {
                dialog.value = stat;
                postContent.value = '';
            });
        });
        const save = async () => {
            if (realmWebApp.currentUser?.isLoggedIn) {
                if (!postContent.value && !postImage.value && !postYoutube.value) {
                    $q.notify({
                        type: 'negative',
                        textColor: 'white',
                        message: 'Post content is empty',
                        position: 'top',
                        timeout: 2000
                    });
                    return;
                } else {
                    const linkPayload = {
                        youtube: '',
                        image: ''
                    };
                    if (postYoutube.value) {
                        if (validateYouTubeUrl(postYoutube.value) != 'Require valid youtube url') {
                            const getVideoId = (url: string) => {
                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                const match = regExp.exec(url);
                                return (match && match[2].length === 11) ? match[2] : '';
                            };
                            linkPayload.youtube = `https://youtube.com/embed/${getVideoId(postYoutube.value)}`;
                        } else {
                            $q.notify({
                                type: 'negative',
                                textColor: 'white',
                                message: 'Invalid YouTube URL',
                                position: 'top',
                                timeout: 2000
                            });
                            return;
                        }
                    }
                    if (postImage.value) {
                        if (validateImageUrl(postImage.value) != 'Require valid image url') {
                            linkPayload.image = postImage.value;
                        } else {
                            $q.notify({
                                type: 'negative',
                                textColor: 'white',
                                message: 'Invalid Image Link',
                                position: 'top',
                                timeout: 2000
                            });
                            return;
                        }
                    }
                    $q.loading.show({
                        spinner: QSpinnerIos,
                        message: 'Saving...'
                    });
                    await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('posts').insertOne({
                        content: postContent.value,
                        link: linkPayload,
                        createdAt: new Date(),
                        realmID: realmWebApp.currentUser?.id
                    }).then(() => {
                        close();
                        emitter.emit('on-new-post-added');
                        $q.notify({
                            message: 'Post added successfully',
                            color: 'positive',
                            textColor: 'white',
                            position: 'top',
                            timeout: 2000
                        });
                    }).catch(() => {
                        $q.notify({
                            message: 'Error adding post',
                            color: 'negative',
                            textColor: 'white',
                            position: 'top',
                            timeout: 2000
                        });
                    }).finally(() => {
                        $q.loading.hide();
                    });
                }
            }
        };

        const close = () => {
            dialog.value = false;
            postContent.value = '';
            postYoutube.value = '';
            postImage.value = '';
        };

        const validateYouTubeUrl = (url: string): boolean | string => {
            if (!!url || url != '') {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
                const match = regExp.exec(url);
                if (match && match[2].length == 11) {
                    return true;
                } else {
                    return 'Require valid youtube url';
                }
            } else {
                return true;
            }
        };

        const validateImageUrl = (url: string): boolean | string => {
            if (!!url || url != '') {
                const regExp = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/;
                const match = regExp.exec(url);
                if (match) {
                    return true;
                } else {
                    return 'Require valid image url';
                }
            } else {
                return true;
            }
        };

        const openImgbb = async () => {
            await Browser.open({
                url: 'https://imgbb.com/'
            });
        };

        return {
            dialog,
            postImage,
            postYoutube,
            postContent,
            validateYouTubeUrl,
            validateImageUrl,
            close,
            save,
            openImgbb
        };
    }
})
;
</script>
