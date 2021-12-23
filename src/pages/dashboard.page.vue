<template>
    <q-page>
        <div class='q-pa-xs'>
            <q-card flat bordered>
                <q-card-section class='row q-gutter-sm q-py-sm q-px-md text-overline'>
                    <div class='col order-last'>
                        <div class='text-overline'>Welcome</div>
                        <div class='text-h5 q-mt-sm q-mb-xs'>{{ currentUser.name }}</div>
                        <div class='text-caption text-grey'>
                            {{ currentUser.email }}
                        </div>
                        <div class='q-py-sm text-grey'>
                            <div>
                                Invite Code: <span class='text-bold'> {{ currentUser?.inviteCode }} </span>
                            </div>
                            <div v-if='currentUser?.invitedPoint?.$numberInt > 0'>
                                Referral Bonus: <span class='text-bold'> {{ currentUser?.invitedPoint?.$numberInt
                                }} </span> points
                            </div>
                            <div>
                                Current Reward: <span class='text-bold'> {{ currentReward }} </span> points
                            </div>
                        </div>
                    </div>

                    <div class='col-12 col-md-auto text-center text-md-right'>
                        <q-img height='150px' width='150px' class='rounded-borders' :src='currentUser.imageUrl' />
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
import { App } from '../../src-capacitor/node_modules/@capacitor/app';

// 5 minutes
const apiHitInterval = 300;
const increasePoint = 50;

export default defineComponent({
    name: 'DashboardComponent',
    setup() {
        const $q = useQuasar();
        const currentUser = ref({} as any);
        const currentUpTime = ref(0);
        const currentReward = ref(0);
        const updatingPointProfile = ref(false);
        const browserMode = ref(false);

        onMounted(async () => {
            currentUser.value = realmWebApp.currentUser?.customData;
            const { value } = await Storage.get({
                key: currentUser.value?.realmID as string
            });
            currentReward.value = currentUser.value?.reward?.$numberInt || 0;
            currentUpTime.value = value ? Number(value) : 0;
        });

        Browser.addListener('browserPageLoaded', () => {
            browserMode.value = true;
        });

        Browser.addListener('browserFinished', () => {
            browserMode.value = false;
        });

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval(async () => {
            const { isActive } = await App.getState();
            if (realmWebApp.currentUser?.isLoggedIn && isActive) {
                if ($q.appVisible || (browserMode.value === true)) {
                    if (currentUpTime.value < apiHitInterval) {
                        currentUpTime.value++;
                        if(currentUpTime.value % 60 === 0) {
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
            }
        }, 1000);

        watch(currentUpTime, async () => {
            if ($q.appVisible && realmWebApp.currentUser?.isLoggedIn) {
                if (currentUpTime.value === apiHitInterval) {
                    updatingPointProfile.value = true;
                    const rewardPoint = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet_social')?.collection('users').findOneAndUpdate({
                        realmID: currentUser.value?.realmID as string
                    }, {
                        $inc: {
                            // TODO:: change this when necessary
                            reward: increasePoint
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
                }
            }
        });

        const secondsToTime = () => new Date(Number(currentUpTime.value) * 1000).toISOString().substr(11, 8);

        return {
            currentUser,
            currentUpTime,
            currentReward,
            updatingPointProfile,
            secondsToTime
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
