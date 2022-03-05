<template>
    <div class='q-pa-sm scroll'>
        <q-pull-to-refresh
            @refresh='refresh'
            color='yellow-9'
            icon='lightbulb'
        >
            <div class='q-mb-sm' v-for='post of posts' :key='post._id'>
                <q-card flat bordered>
                    <q-item>
                        <q-item-section avatar>
                            <q-avatar>
                                <img :src='post.user.imageUrl' :alt='"alt of "+post.user._id'>
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ post.user.name }}</q-item-label>
                            <q-item-label caption>
                                {{ new Date(post.createdAt).toLocaleString() }}
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-separator />

                    <q-card-section horizontal>
                        <q-card-section v-html='post.content' />
                    </q-card-section>
                </q-card>
            </div>
        </q-pull-to-refresh>
    </div>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useEmitter } from '../boot/mitt';
import { realmWebApp } from '../custom/funtions/RealmWebClient';

export default defineComponent({
    name: 'UserPost',
    setup() {
        const $q = useQuasar();
        const emitter = useEmitter();

        const posts = ref<any[]>([]);

        onMounted(() => {
            getPosts();
            emitter.on('on-new-post-added', () => {
                getPosts();
            });
        });

        const getPosts = async () => {
            posts.value = [];
            $q.loading.show({ message: 'Loading...' });

            const lookUpSteps = [
                {
                    $lookup: {
                        from: 'users',
                        let: { realmID_Post: '$realmID' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$realmID', '$$realmID_Post'] }
                                }
                            },
                            { $project: { _id: 1, name: 1, imageUrl: 1, invitedBy: 1 } }
                        ],
                        as: 'user'
                    }
                },
                { $unwind: '$user' }
            ];
            const getAllPosts = async () => {
                await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('posts')
                    ?.aggregate([
                        { $sort: { createdAt: -1 } },
                        { $limit: 100 },
                        ...lookUpSteps
                    ]).then(allPosts => {
                        for (const newPost of allPosts) {
                            const found = posts.value.findIndex(post => post._id.toString() === newPost._id.toString());
                            if (found === -1) {
                                posts.value.push(newPost);
                            }
                        }
                    });
            };

            await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users')
                .findOne(
                    { _id: realmWebApp.currentUser?.customData?.invitedBy },
                    { projection: { _id: 1, realmID: 1 } }
                ).then(async referredUser => {
                    const currentInviteId = (realmWebApp.currentUser?.customData?.invitedBy as any).$oid;

                    const conditionLast10Days = {
                        $expr: {
                            $gt: [
                                '$createdAt',
                                {
                                    $dateSubtract: {
                                        startDate: '$$NOW',
                                        unit: 'day',
                                        amount: 10
                                    }
                                }
                            ]
                        }
                    };

                    if (currentInviteId !== realmWebApp.currentUser?.customData?._id) {
                        await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('posts')
                            ?.aggregate([
                                {
                                    $match: {
                                        $and: [
                                            conditionLast10Days,
                                            { realmID: referredUser.realmID }
                                        ]
                                    }
                                },
                                { $sort: { createdAt: -1 } },
                                ...lookUpSteps
                            ]).then(response => {
                                posts.value.push(...response);
                            }).then(async () => {
                                await getAllPosts();
                            });
                    } else {
                        await getAllPosts();
                    }
                }).finally(() => {
                    $q.loading.hide();
                });


            /* await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('posts')
                 ?.aggregate([
                     { $sort: { createdAt: -1 } },
                     { $limit: 100 },
                     ...lookUpSteps
                 ]).then(response => {
                     posts.value.push(...response);
                 }).finally(() => {
                     $q.loading.hide();
                 });*/
        };
        // eslint-disable-next-line @typescript-eslint/ban-types
        const refresh = (done: Function) => {
            setTimeout(() => {
                getPosts();
                done();
            }, 1000);
        };
        return {
            posts,
            refresh
        };
    }
});
</script>
