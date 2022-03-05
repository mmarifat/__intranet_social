<template>
    <q-dialog v-model='dialog' persistent maximized>
        <q-card class='row justify-center bg-light-blue-2'>
            <q-card-section class='col-12'>
                <q-form
                    greedy
                    @submit.prevent='save'
                    autocorrect='off'
                    autocapitalize='off'
                    autocomplete='off'
                >
                    <q-card-section class='text-bold text-h5 text-center q-pb-none'>
                        New Post
                    </q-card-section>

                    <q-card-section class='q-px-none'>
                        <q-editor
                            flat
                            :fullscreen='true'
                            content-class='bg-transparent'
                            toolbar-text-color='white'
                            toolbar-toggle-color='yellow-8'
                            toolbar-bg='light-blue-10'
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
import { defineComponent, onMounted, ref } from 'vue';
import { useEmitter } from '../boot/mitt';
import { realmWebApp } from '../custom/funtions/RealmWebClient';
import { QSpinnerFacebook, useQuasar } from 'quasar';

export default defineComponent({
    name: 'AddUserPost',
    setup() {
        const $q = useQuasar();
        const emitter = useEmitter();

        const dialog = ref(false);
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
                    $q.loading.show({
                        spinner: QSpinnerFacebook,
                        message: 'Saving...'
                    });
                    await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('posts').insertOne({
                        content: postContent.value,
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
        };
        return {
            dialog,
            kitchenSink,
            postContent,
            close,
            save
        };
    }
})
;
</script>
