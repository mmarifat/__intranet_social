<template>
    <q-page>
        <q-card flat bordered>
            <q-card-section class='row q-col-gutter-md text-overline q-pa-sm' ref='dashboardSection'>
                <div class='col col-4 row justify-start items-center'>
                    <q-img v-if='$q.platform.is.capacitor' class='rounded-borders' :src='currentUser.imageUrl' />
                    <q-img v-else width='150px' height='150px' class='rounded-borders' :src='currentUser.imageUrl' />
                </div>
                <div class='col col-8 text-right'>
                    <div class='text-h5 q-mt-sm q-mb-xs'>{{ currentUser.name }}</div>
                    <!--                        <div class='text-caption text-grey'>
                                                {{ currentUser.email }}
                                            </div>-->
                    <div class='q-py-sm text-grey'>
                        <div>
                            Invite Code: <span class='text-bold'> {{ currentUser.inviteCode }} </span>
                        </div>
                        <div v-if='!updatingPointProfile'>
                            Current Reward: <span class='text-bold'> {{ currentReward }} </span> points
                        </div>
                        <q-spinner-gears v-else size='15px' />
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-section class='q-mt-sm q-pa-sm'>
                <div class='row justify-evenly q-col-gutter-lg'>
                    <q-item class='col col-4' clickable dense v-for='link in links' :key='link.caption'
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

        <add-user-post />
        <user-post />

        <q-page-sticky position='bottom-right'>
            <q-tooltip>
                Click to add new post
            </q-tooltip>
            <q-btn round size='12px' icon='add' color='light-blue-10' @click='openAddUserPostDialog' />
        </q-page-sticky>
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
import { useEmitter } from '../boot/mitt';
import UserPost from '../components/user-post.component.vue';
import AddUserPost from '../components/add-user-post.component.vue';

export default defineComponent({
    name: 'DashboardComponent',
    components: { AddUserPost, UserPost },
    setup() {
        const $q = useQuasar();
        const emitter = useEmitter();
        const currentUser = ref({} as any);
        const bonusChart = ref({} as any);
        const currentUpTime = ref(0);
        const currentReward = ref(0);
        const updatingPointProfile = ref(false);
        const browserMode = ref(new Date());

        onMounted(async () => {
            const realmID = realmWebApp.currentUser?.id as string;
            const { value } = await Storage.get({
                key: realmID
            });
            bonusChart.value = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('bonus-chart').findOne({});
            const rewardObj = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').findOne({
                realmID
            });
            currentUser.value = rewardObj || {};
            currentReward.value = parseInt((Number(rewardObj?.reward) || 0).toString()) + Number(rewardObj?.invitedPoint);
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
                    const totalInterval = seconds / Number(bonusChart.value?.referInterval);
                    const pointToInc = calculateIncreaseValue(totalInterval);
                    updatingReferPoint(pointToInc);
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval(async () => {
            if ($q.appVisible && realmWebApp.currentUser?.isLoggedIn) {
                if (currentUpTime.value < Number(bonusChart.value?.referInterval)) {
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
                if (currentUpTime.value === Number(bonusChart.value?.referInterval)) {
                    const pointToInc = calculateIncreaseValue();
                    await updatingReferPoint(pointToInc);
                    await resetTimer();
                }
            }
            emitter.emit('up-time', secondsToTime());
        });
        const secondsToTime = () => new Date(Number(currentUpTime.value) * 1000).toISOString().substr(14, 5);

        const calculateIncreaseValue = (appendCounter = 0) => {
            const increaseInterval = appendCounter + parseInt(currentUser.value?.rewardCounter);
            let increasePoint = Number(bonusChart.value?.referIncrease);
            for (let i = 0; i < increaseInterval; i++) {
                increasePoint = Number(increasePoint / Number(bonusChart.value?.referReducer));
            }
            return increasePoint;
        };

        const updatingReferPoint = async (point: number) => {
            updatingPointProfile.value = true;
            const rewardPoint = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').findOneAndUpdate({
                realmID: currentUser.value?.realmID as string
            }, {
                $inc: {
                    reward: Number((point || 0).toString()),
                    rewardCounter: 1
                },
                $set: {
                    realmID: currentUser.value?.realmID as string
                }
            }, {
                upsert: true,
                returnNewDocument: true
            });
            updatingPointProfile.value = false;
            currentUser.value = rewardPoint;
            currentReward.value = parseInt((Number(rewardPoint?.reward) + Number(rewardPoint?.invitedPoint)).toString());

            // updating commission on referred (5% commission)
            const commissionPoint = (point / 100) * 5;
            realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').findOneAndUpdate({
                _id: currentUser.value?.invitedBy
            }, {
                $inc: {
                    reward: Number((commissionPoint || 0).toString())
                }
            });
            await resetTimer();
        };

        const resetTimer = async () => {
            currentUpTime.value = -1;
            await Storage.set({
                key: currentUser.value?.realmID as string,
                value: String(0)
            });
        };

        const links = ref<SocialLinkInterface[]>(SocialLinks);
        const changeLink = async (link: SocialLinkInterface) => {
            await Browser.open({
                url: link.link
            });
        };

        const openAddUserPostDialog = () => {
            emitter.emit('open-add-user-post-dialog', true);
        };

        return {
            currentUser,
            currentUpTime,
            currentReward,
            updatingPointProfile,
            links,
            changeLink,
            openAddUserPostDialog
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
