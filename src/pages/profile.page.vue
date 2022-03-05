<template>
    <q-page>
        <q-card>
            <q-avatar size='70px' class='absolute-top-right' rounded style='top: 16%; right: 12px; z-index: 9'>
                <q-img class='rounded-borders' :src='currentUser.imageUrl' :alt='"image of "+ currentUser._id' />
            </q-avatar>
            <q-img height='150px' width='100%' src='https://cdn.quasar.dev/img/parallax2.jpg' />
            <q-list>
                <q-item>
                    <q-item-section avatar>
                        <q-icon color='secondary' name='alternate_email' />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>{{ currentUser.name }}</q-item-label>
                        <q-item-label caption>{{ currentUser.email }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon color='red' name='qr_code' />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>Invitation Code</q-item-label>
                        <q-item-label caption>{{ currentUser.inviteCode }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon color='amber' name='inventory' />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>Invited Point</q-item-label>
                        <q-item-label caption>${{ currentUser.invitedPoint }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon color='pink' name='emoji_events' />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>Available Reward</q-item-label>
                        <q-item-label caption>${{ Math.round(currentUser.reward).toFixed(2) }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon color='purple'
                                :name='currentUser.verified === true ? "verified" : "tv_off"' />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>Verification Status</q-item-label>
                        <q-item-label caption>
                            {{ currentUser.verified === true ? 'Verified' : 'Not Verified' }}
                        </q-item-label>
                    </q-item-section>
                </q-item>

                <q-item :clickable='currentUser.verified === true'>
                    <q-item-section avatar>
                        <q-icon color='light-blue-10' name='verified_user' />
                    </q-item-section>

                    <q-item-section>
                        <q-tooltip>
                            {{ currentUser.nid ? 'Your NID' : 'Add your NID for verification' }}
                        </q-tooltip>
                        <q-item-label>
                            NID
                        </q-item-label>
                        <q-popup-edit v-if='!currentUser.nid' v-model.number='NID'
                                      :validate='NIDValidation' persistent>
                            <template v-slot='scope'>
                                <q-input
                                    autofocus
                                    dense
                                    type='number'
                                    v-model.number='scope.value'
                                    :model-value='scope.value'
                                    hint='Your NID'
                                    :rules="[val => scope.validate(val) || 'More than 7 chars required']"
                                >
                                    <template v-slot:after>
                                        <q-btn
                                            flat dense color='negative' icon='cancel'
                                            @click.stop='scope.cancel'
                                            @click='NID= ""' />
                                        <q-btn
                                            flat dense color='positive' icon='check_circle'
                                            @click.stop='scope.set'
                                            @click='addNID'
                                            :disable='scope.validate(scope.value) === false || scope.initialValue === scope.value'
                                        />
                                    </template>
                                </q-input>
                            </template>
                        </q-popup-edit>
                        <q-item-label caption>
                            {{ currentUser.nid || `Save your NID for verification (click on 'NID' to enable editing)` }}
                        </q-item-label>
                    </q-item-section>
                </q-item>

                <q-item clickable :disable='currentUser.verified !== true || Number(totalReward) < 5000'>
                    <q-item-section avatar>
                        <q-icon color='orange' name='price_check' />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>Request for a point withdrawal</q-item-label>

                        <q-popup-edit v-if='Number(totalReward) >= 5000'
                                      v-model.number='pointWithdrawAmount' :validate='pointWithdrawValidation'>
                            <template v-slot='scope'>
                                <q-input
                                    autofocus
                                    dense
                                    type='number'
                                    v-model.number='scope.value'
                                    :model-value='scope.value'
                                    hint='Your desired point withdrawal'
                                    :rules="[val => scope.validate(val) || 'Minimum 5000 points']"
                                >
                                    <template v-slot:after>
                                        <q-btn
                                            flat dense color='negative' icon='cancel'
                                            @click.stop='scope.cancel'
                                            @click='NID= ""' />
                                        <q-btn
                                            flat dense color='positive' icon='check_circle'
                                            @click.stop='scope.set'
                                            @click='pointWithdraw'
                                            :disable='scope.validate(scope.value) === false'
                                        />
                                    </template>
                                </q-input>
                            </template>
                        </q-popup-edit>

                        <q-item-label caption>
                            Total 5000 points required to withdraw <br />
                            Current balance: ${{ totalReward }} <br />
                            Click on the label to request for a withdrawal after reaching minimum 5000 points
                        </q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon color='green' name='timeline' />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>
                            Transaction Histories
                            <hr />
                        </q-item-label>
                        <q-item-label caption>
                            <div v-if='!transactionHistories.length'>
                                No transaction history yet
                            </div>
                            <ul v-else style='list-style: decimal; padding-left: 15px'>
                                <li class='q-pb-xs' v-for='history of transactionHistories' :key='history._id'>
                                    {{ history.amount }} points on
                                    {{
                                        new Date(history.createdAt).toLocaleString()
                                    }}
                                </li>
                            </ul>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card>
    </q-page>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue';
import { realmWebApp } from '../custom/funtions/RealmWebClient';
import { QSpinnerIos, useQuasar } from 'quasar';
import { useEmitter } from '../boot/mitt';

export default defineComponent({
    name: 'DashboardComponent',
    setup() {
        const $q = useQuasar();
        const emitter: any = useEmitter();
        const currentUser = ref({} as any);

        const NID = ref('');
        const totalReward = ref('0');
        const pointWithdrawAmount = ref(5000);

        const transactionHistories = ref<any[]>([]);

        onMounted(async () => {
            await getUserData();
        });

        const getUserData = async () => {
            const realmID = realmWebApp.currentUser?.id as string;
            currentUser.value = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').findOne({
                realmID
            });
            NID.value = currentUser.value?.nid;
            totalReward.value = Math.round(Number(currentUser.value.reward) + Number(currentUser.value.invitedPoint)).toFixed(2);

            transactionHistories.value = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('transactions').find({
                realmID
            }, {
                sort: { createdAt: -1 },
                projection: { _id: 1, amount: 1, createdAt: 1, verified: 1 }
            }) as any[];
        };

        const NIDValidation = (e: any) => {
            if (e) {
                if (e.toString().length < 8) {
                    return 'NID must be minimum 8 digits';
                } else if (!/^\d+$/.test(e)) {
                    return 'NID must be numeric';
                } else {
                    return true;
                }
            } else {
                return 'NID is required';
            }
        };

        const addNID = async () => {
            if (NIDValidation(NID.value) === true) {
                $q.loading.show({
                    spinner: QSpinnerIos
                });
                await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').count({
                    nid: NID.value.toString()
                }).then(async count => {
                    if (count < 1) {
                        await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').updateOne({
                            realmID: realmWebApp.currentUser?.id
                        }, {
                            $set: {
                                verified: false,
                                nid: NID.value.toString()
                            }
                        }).then(() => {
                            $q.notify({
                                timeout: 2000,
                                color: 'positive',
                                textColor: 'white',
                                message: 'NID saved successfully',
                                caption: 'You are now logging out....'
                            });
                            setTimeout(() => {
                                emitter.emit('sign-out');
                            }, 1500);
                        }).catch(() => {
                            $q.notify({
                                timeout: 2000,
                                color: 'negative',
                                textColor: 'white',
                                message: 'NID could not be saved'
                            });
                        });
                        currentUser.value.nid = NID.value;
                    } else {
                        $q.notify({
                            timeout: 2000,
                            color: 'negative',
                            textColor: 'white',
                            message: 'A user is already registered with this NID',
                            caption: 'Try different NID'
                        });
                    }
                }).finally(() => {
                    $q.loading.hide();
                });
            } else {
                $q.notify({
                    timeout: 2000,
                    color: 'negative',
                    textColor: 'white',
                    message: NIDValidation(NID.value).toString()
                });
            }
            NID.value = '';
        };

        const pointWithdrawValidation = (e: any) => {
            if (e) {
                if (e < 5000) {
                    return 'Point must be minimum 5000';
                } else if (!/^\d+$/.test(e)) {
                    return 'Point must be numeric';
                } else if (e > Number(totalReward.value)) {
                    return 'Point must be less than or equal to total reward available';
                } else {
                    return true;
                }
            } else {
                return 'Point is required';
            }
        };

        const pointWithdraw = async () => {
            if (pointWithdrawValidation(pointWithdrawAmount.value) === true) {
                $q.loading.show({
                    spinner: QSpinnerIos
                });
                const newRewardPoint = Number(currentUser.value.reward) - (Number(pointWithdrawAmount.value) - Number(currentUser.value.invitedPoint));
                await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').updateOne({
                    realmID: realmWebApp.currentUser?.id,
                    verified: true
                }, {
                    $set: {
                        invitedPoint: 0,
                        reward: newRewardPoint
                    }
                }).then(async () => {
                    await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('transactions').insertOne({
                        realmID: realmWebApp.currentUser?.id,
                        userID: realmWebApp.currentUser?.customData._id,
                        amount: pointWithdrawAmount.value,
                        verified: false,
                        createdAt: new Date()
                    }).then(async () => {
                        $q.notify({
                            timeout: 2000,
                            color: 'positive',
                            textColor: 'white',
                            message: 'Reward withdrawn successfully'
                        });
                        await getUserData();
                    });
                }).catch(() => {
                    $q.notify({
                        timeout: 2000,
                        color: 'negative',
                        textColor: 'white',
                        message: 'Reward withdrawn failed'
                    });
                }).finally(() => {
                    $q.loading.hide();
                });
            } else {
                $q.notify({
                    timeout: 2000,
                    color: 'negative',
                    textColor: 'white',
                    message: pointWithdrawValidation(pointWithdrawAmount.value).toString()
                });
            }
            pointWithdrawAmount.value = 5000;
        };

        return {
            currentUser,
            NID,
            NIDValidation,
            addNID,
            totalReward,
            pointWithdrawAmount,
            pointWithdrawValidation,
            pointWithdraw,
            transactionHistories
        };
    }
});
</script>

<style lang='scss'>

</style>
