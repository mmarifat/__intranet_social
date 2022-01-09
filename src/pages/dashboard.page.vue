<template>
    <q-page>
        <div class='q-pa-xs'>
            <q-card flat bordered>
                <q-card-section class='row q-col-gutter-md text-overline'>
                    <div class='col col-4 row justify-center items-center'>
                        <q-img class='rounded-borders' :src='currentUser.imageUrl' />
                    </div>
                    <div class='col col-8'>
                        <div class='text-h5 q-mt-sm q-mb-xs'>{{ currentUser.name }}</div>
                        <!--                        <div class='text-caption text-grey'>
                                                    {{ currentUser.email }}
                                                </div>-->
                        <div class='q-py-sm text-grey'>
                            <div>
                                Invite Code: <span class='text-bold'> {{ currentUser?.inviteCode }} </span>
                            </div>
                            <div v-if='currentUser?.invitedPoint?.$numberInt > 0'>
                                Referral Bonus: <span class='text-bold'> {{ currentUser?.invitedPoint?.$numberInt
                                }} </span> points
                            </div>
                            <div v-if='!updatingPointProfile'>
                                Current Reward: <span class='text-bold'> {{ currentReward }} </span> points
                            </div>
                            <q-spinner-gears v-else size='15px' />
                        </div>
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-actions>
                    <q-btn flat round icon='event' />
                    <q-btn flat no-caps class='text-overline'>
                        Up Time: {{ secondsToTime() }} <br />
                        <q-tooltip class='bg-light-blue-10' :offset='[10, 10]'>
                            Saved to profile in every 5 minutes
                        </q-tooltip>
                    </q-btn>
                </q-card-actions>

                <q-card-section class='q-mt-sm'>
                    <div class='row justify-start q-col-gutter-lg'>
                        <q-item class='col col-4' clickable v-for='link in links' :key='link.caption'
                                @click='changeLink(link)'>
                            <q-item-section v-if='link.icon' avatar>
                                <q-img :src='link.icon' />
                            </q-item-section>

                            <q-item-section>
                                <q-item-label>{{ link.label }}</q-item-label>
                                <q-item-label caption>
                                    {{ link.caption }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { realmWebApp } from '../custom/funtions/RealmWebClient';
import { Storage } from '../../src-capacitor/node_modules/@capacitor/storage';
import { Browser } from '../../src-capacitor/node_modules/@capacitor/browser';
import { SocialLinkInterface } from '../custom/interfaces/social-link.interface';
import SocialLinks from '../custom/constants/social.links';

// 5 minutes
const apiHitInterval = 300;
// TODO:: change this when necessary
const increasePoint = 50;

export default defineComponent({
    name: 'DashboardComponent',
    setup() {
        const $q = useQuasar();
        const currentUser = ref({} as any);
        const currentUpTime = ref(0);
        const currentReward = ref(0);
        const updatingPointProfile = ref(false);
        const browserMode = ref(new Date());

        onMounted(async () => {
            const realmID = realmWebApp.currentUser?.id as string;
            const { value } = await Storage.get({
                key: realmID
            });
            const rewardObj = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet_social')?.collection('users').findOne({
                realmID
            });
            currentUser.value = rewardObj || {};
            currentReward.value = parseInt((Number(rewardObj?.reward) || 0).toString());
            currentUpTime.value = value ? Number(value) : 0;
        });

        Browser.addListener('browserPageLoaded', () => {
            browserMode.value = new Date();
        });

        Browser.addListener('browserFinished', () => {
            if (realmWebApp.currentUser?.isLoggedIn) {
                const newTime = new Date();
                const seconds = (newTime.getTime() - browserMode.value.getTime()) / 1000;
                if (seconds) {
                    const totalInterval = seconds / apiHitInterval;
                    const totalReferPoint = totalInterval * increasePoint;
                    updatingReferPoint(totalReferPoint);
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval(async () => {
            if ($q.appVisible && realmWebApp.currentUser?.isLoggedIn) {
                if (currentUpTime.value < apiHitInterval) {
                    currentUpTime.value++;
                    if (currentUpTime.value % 5 === 0) {
                        await Storage.set({
                            key: currentUser.value?.realmID as string,
                            value: String(currentUpTime.value)
                        });
                    }
                } else {
                    currentUpTime.value = -1;
                    await Storage.set({
                        key: currentUser.value?.realmID as string,
                        value: String(0)
                    });
                }
            }
        }, 1000);

        watch(currentUpTime, async () => {
            if ($q.appVisible && realmWebApp.currentUser?.isLoggedIn) {
                if (currentUpTime.value === apiHitInterval) {
                    await updatingReferPoint(increasePoint);
                    await resetTimer();
                }
            }
        });

        const updatingReferPoint = async (point: number) => {
            updatingPointProfile.value = true;
            const rewardPoint = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet_social')?.collection('users').findOneAndUpdate({
                realmID: currentUser.value?.realmID as string
            }, {
                $inc: {
                    reward: parseInt((point || 0).toString())
                },
                $set: {
                    realmID: currentUser.value?.realmID as string
                }
            }, {
                upsert: true,
                returnNewDocument: true
            });
            updatingPointProfile.value = false;
            currentReward.value = rewardPoint.reward;
            await resetTimer();
        };

        const resetTimer = async () => {
            currentUpTime.value = -1;
            await Storage.set({
                key: currentUser.value?.realmID as string,
                value: String(0)
            });
        };
        const secondsToTime = () => new Date(Number(currentUpTime.value) * 1000).toISOString().substr(14, 5);

        const links = ref<SocialLinkInterface[]>(SocialLinks);
        const changeLink = async (link: SocialLinkInterface) => {
            await Browser.open({
                url: link.link
            });
        };

        return {
            currentUser,
            currentUpTime,
            currentReward,
            updatingPointProfile,
            secondsToTime,
            links,
            changeLink
        };
    }
});
</script>

<style lang='scss'>
iframe {
    display: block;
    background: #000;
    border: none;
    height: 100vh;
    width: 100vw;
}
</style>
