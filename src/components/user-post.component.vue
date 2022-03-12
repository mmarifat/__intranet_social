<template>
    <div class='q-pa-sm'>
        <q-pull-to-refresh @refresh='onRefresh' color='yellow-9' icon='lightbulb'>
            <q-infinite-scroll @load='onPostScroll' :offset='250'>
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

                        <q-card-section horizontal class='column'>
                            <q-img
                                v-if='!post.link.isVideo && post.link.link'
                                :src='post.link.link'
                                fit='fill'
                                :ratio='16/9'
                                height='200px'
                                weight='200px'
                            />
                            <q-video
                                v-if='post.link.isVideo && post.link.link'
                                :src='post.link.link'
                                :ratio='16/9'
                            />
                            <q-card-section v-html='post.content' />
                        </q-card-section>
                    </q-card>
                </div>
                <template v-slot:loading>
                    <div class='row justify-center q-my-md'>
                        <q-spinner-dots color='primary' size='40px' />
                    </div>
                </template>
            </q-infinite-scroll>
        </q-pull-to-refresh>
    </div>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue';
import { QSpinnerIos, useQuasar } from 'quasar';
import { useEmitter } from '../boot/mitt';
import { realmWebApp } from '../custom/funtions/RealmWebClient';

export default defineComponent({
    name: 'UserPost',
    setup() {
        const $q = useQuasar();
        const emitter = useEmitter();

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
        const pageSize = ref(50);
        const posts = ref<any[]>([]);

        onMounted(() => {
            getPosts();
            emitter.on('on-new-post-added', () => {
                getPosts();
            });
        });

        const getRemainingPosts = async () => {
            const alreadyAvailablePostIds = posts.value.map(post => post._id);
            await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('posts')
                ?.aggregate([
                    { $match: { _id: { $nin: alreadyAvailablePostIds } } },
                    { $sort: { createdAt: -1 } },
                    { $limit: pageSize.value },
                    ...lookUpSteps
                ]).then(allPosts => {
                    for (const post of (allPosts.length > 0 ? allPosts : [])) {
                        const foundIndex = posts.value.findIndex(p => p._id === post._id);
                        if (foundIndex === -1) {
                            posts.value.push(post);
                        }
                    }
                });
        };

        const getPosts = async () => {
            posts.value = [];
            $q.loading.show({ spinner: QSpinnerIos, spinnerSize: 30 });

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

            const getNLevelPosts = async (currentInviteId: any, prevUserId: any) => {
                if (currentInviteId && prevUserId) {
                    return await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users')
                        ?.findOne(
                            { _id: currentInviteId },
                            { projection: { _id: 1, realmID: 1, invitedBy: 1 } }
                        ).then(async nLevelUser => {
                            currentInviteId = currentInviteId.hasOwnProperty('$oid') ? currentInviteId.$oid : currentInviteId;
                            if (currentInviteId.toString() !== prevUserId.toString()) {
                                await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('posts')
                                    ?.aggregate([
                                        {
                                            $match: {
                                                $and: [
                                                    conditionLast10Days,
                                                    { realmID: nLevelUser.realmID }
                                                ]
                                            }
                                        },
                                        { $sort: { createdAt: -1 } },
                                        ...lookUpSteps
                                    ]).then(response => {
                                        for (const responseElement of (response.length > 0 ? response : [])) {
                                            const foundIndex = posts.value.findIndex(post => post._id === responseElement._id);
                                            if (foundIndex === -1) {
                                                posts.value.push(responseElement);
                                            }
                                        }
                                    });
                            }
                            return {
                                nLevelUserID: nLevelUser._id,
                                nLevelUserInvitedID: nLevelUser.invitedBy
                            };
                        });
                } else {
                    return {
                        nLevelUserID: null,
                        nLevelUserInvitedID: null
                    };
                }
            };

            // level 1 referred posts
            await getNLevelPosts(
                realmWebApp.currentUser?.customData?.invitedBy,
                realmWebApp.currentUser?.customData?._id
            ).then(async (newUser: any) => {
                // level 2 referred posts
                await getNLevelPosts(
                    newUser.nLevelUserInvitedID,
                    newUser.nLevelUserID
                );
            }).then(async () => {
                // get all remaining posts
                await getRemainingPosts();
            }).finally(() => {
                $q.loading.hide();
            });
        };

        // eslint-disable-next-line @typescript-eslint/ban-types
        const onRefresh = (done: Function) => {
            setTimeout(() => {
                getPosts().then(() => {
                    done();
                });
            }, 1000);
        };

        // eslint-disable-next-line @typescript-eslint/ban-types
        const onPostScroll = (index: number, done: Function) => {
            setTimeout(() => {
                const prevPostsLength = posts.value.length;
                getRemainingPosts().then(() => {
                    const afterPostsLength = posts.value.length;
                    if (prevPostsLength !== afterPostsLength) {
                        done();
                    } else {
                        // 'true' to stop the infinite scroll
                        done(true);
                    }
                });
                done();
            }, 2000);
        };

        return {
            posts,
            onRefresh,
            onPostScroll
        };
    }
})
;
</script>
