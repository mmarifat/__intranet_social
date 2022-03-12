<template>
    <q-dialog v-model='dialog' persistent maximized>
        <q-card square class='bg-light-blue-2'>
            <q-card-section class='q-pa-none'>
                <q-form
                    greedy
                    @submit.prevent='save'
                    autocorrect='off'
                    autocapitalize='off'
                    autocomplete='off'
                >
                    <q-card-section class='text-bold text-h5 text-center q-pa-xs'>
                        New Post
                    </q-card-section>

                    <q-card square class='row text-center q-px-md q-pb-md'>
                        <div class='col-6 text-left row items-center'>
                            <span>Attachment</span>
                        </div>
                        <div class='col-6 text-right'>
                            <q-toggle v-model='isVideo' label='Video' left-label icon='check_box' />
                        </div>
                        <div class='col-12' v-if='isVideo'>
                            <q-input square outlined v-model='postLink' label='Youtube Url'
                                     :rules='[validateYouTubeUrl]' />
                        </div>
                        <div class='col-12' v-if='!isVideo'>
                            <q-input square outlined v-model='postLink' label='Image Link'
                                     :rules='[validateImageUrl]' />
                        </div>
                    </q-card>

                    <q-card-section class='q-px-none q-pt-none'>
                        <q-editor
                            flat
                            square
                            :fullscreen='false'
                            content-class='bg-transparent'
                            toolbar-text-color='white'
                            toolbar-toggle-color='yellow-8'
                            toolbar-bg='light-blue-10'
                            min-height='25rem'
                            v-model='postContent'
                            :toolbar='kitchenSink.toolbal'
                            :fonts='kitchenSink.fonts'
                            :definitions="{
                                    close: {
                                      tip: 'Discard your changes',
                                      icon: 'close',
                                      label: 'Discard',
                                      handler: close
                                    },
                                    save: {
                                      tip: 'Save your post',
                                      icon: 'save',
                                      label: 'Save',
                                      handler: save
                                    },
                                }"
                        />
                    </q-card-section>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useEmitter } from '../boot/mitt';
import { realmWebApp } from '../custom/funtions/RealmWebClient';
import { QSpinnerIos, useQuasar } from 'quasar';

export default defineComponent({
    name: 'AddUserPost',
    setup() {
        const $q = useQuasar();
        const emitter = useEmitter();

        const dialog = ref(false);
        const isVideo = ref(false);
        const postLink = ref('');
        const postContent = ref('');
        const kitchenSink = ref({
            toolbal: [
                [
                    {
                        label: $q.lang.editor.align,
                        icon: $q.iconSet.editor.align,
                        fixedLabel: true,
                        options: ['left', 'center', 'right', 'justify']
                    },
                    'bold', 'italic', 'strike', 'underline', 'subscript', 'superscript',
                    'token', 'hr', 'link', 'custom_btn', 'fullscreen',
                    'quote', 'unordered', 'ordered', 'outdent', 'indent',
                    {
                        label: $q.lang.editor.formatting,
                        icon: $q.iconSet.editor.formatting,
                        list: 'no-icons',
                        options: [
                            'p',
                            'h1',
                            'h2',
                            'h3',
                            'h4',
                            'h5',
                            'h6',
                            'code'
                        ]
                    },
                    {
                        label: $q.lang.editor.fontSize,
                        icon: $q.iconSet.editor.fontSize,
                        fixedLabel: true,
                        fixedIcon: true,
                        list: 'no-icons',
                        options: [
                            'size-1',
                            'size-2',
                            'size-3',
                            'size-4',
                            'size-5',
                            'size-6',
                            'size-7'
                        ]
                    },
                    {
                        label: $q.lang.editor.defaultFont,
                        icon: $q.iconSet.editor.font,
                        fixedIcon: true,
                        list: 'no-icons',
                        options: [
                            'default_font',
                            'arial',
                            'arial_black',
                            'comic_sans',
                            'courier_new',
                            'impact',
                            'lucida_grande',
                            'times_new_roman',
                            'verdana'
                        ]
                    },
                    'undo', 'redo', 'removeFormat', 'viewsource',
                    'close', 'save'
                ]
            ],
            fonts: {
                arial: 'Arial',
                arial_black: 'Arial Black',
                comic_sans: 'Comic Sans MS',
                courier_new: 'Courier New',
                impact: 'Impact',
                lucida_grande: 'Lucida Grande',
                times_new_roman: 'Times New Roman',
                verdana: 'Verdana'
            }
        });

        onMounted(() => {
            emitter.on('open-add-user-post-dialog', (stat: boolean) => {
                dialog.value = stat;
                postContent.value = '';
            });
        });
        const save = async () => {
            if (realmWebApp.currentUser?.isLoggedIn) {
                if (!postContent.value) {
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
                        isVideo: isVideo.value,
                        link: ''
                    };
                    if (isVideo.value) {
                        if (postLink.value) {
                            if (validateYouTubeUrl(postLink.value) != 'Require valid youtube url') {
                                const getVideoId = (url: string) => {
                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                    const match = regExp.exec(url);
                                    return (match && match[2].length === 11) ? match[2] : '';
                                };
                                linkPayload.link = `https://youtube.com/embed/${getVideoId(postLink.value)}`;
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
                    }
                    if (!isVideo.value) {
                        if (postLink.value) {
                            if (validateImageUrl(postLink.value) != 'Require valid image url') {
                                linkPayload.link = postLink.value;
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
            isVideo.value = false;
            postLink.value = '';
        };

        const validateYouTubeUrl = (url: string): boolean | string => {
            if (url != undefined || url != '') {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
                const match = regExp.exec(url);
                if (match && match[2].length == 11) {
                    return true;
                }
            }
            return 'Require valid youtube url';
        };

        const validateImageUrl = (url: string): boolean | string => {
            if (url != undefined || url != '') {
                const regExp = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/;
                const match = regExp.exec(url);
                if (match) {
                    return true;
                }
            }
            return 'Require valid image url';
        };

        watch(isVideo, () => {
            postLink.value = '';
        });

        return {
            dialog,
            kitchenSink,
            isVideo,
            postLink,
            postContent,
            validateYouTubeUrl,
            validateImageUrl,
            close,
            save
        };
    }
})
;
</script>
