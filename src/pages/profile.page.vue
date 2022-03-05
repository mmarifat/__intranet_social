<template>
    <q-page>
        <q-card>
            <q-img height='150px' width='100%' src='https://cdn.quasar.dev/img/parallax2.jpg' />
            <q-avatar size='55px' class='absolute' rounded
                      style='bottom: 0; right: 12px; transform: translateY(-510%);'>
                <q-img class='rounded-borders' :src='currentUser.imageUrl' :alt='"image of "+ currentUser._id' />
            </q-avatar>
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

                <q-item clickable>
                    <q-item-section avatar>
                        <q-icon color='light-blue-10' name='verified_user' />
                    </q-item-section>

                    <q-item-section>
                        <q-tooltip>
                            {{ currentUser.nid ? 'Your NID' : 'Add your NID for verification' }}
                        </q-tooltip>
                        <q-item-label>
                            NID
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
                        </q-item-label>
                        <q-item-label caption>
                            {{ currentUser.nid || `Save your NID for verification (click on 'NID' to enable editing)` }}
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
import { QSpinnerFacebook, useQuasar } from 'quasar';
import { useEmitter } from '../boot/mitt';

export default defineComponent({
    name: 'DashboardComponent',
    setup() {
        const $q = useQuasar();
        const emitter: any = useEmitter();
        const currentUser = ref({} as any);

        const NID = ref('');

        onMounted(async () => {
            const realmID = realmWebApp.currentUser?.id as string;
            currentUser.value = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').findOne({
                realmID
            });
            NID.value = currentUser.value?.nid;
        });

        const NIDValidation = (e: any) => {
            if (e) {
                if (e.toString().length < 8) {
                    return 'NID must be minimum 8 digits';
                }
                if (!/^\d+$/.test(e)) {
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
                    spinner: QSpinnerFacebook
                });
                await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').updateOne({
                    realmID: realmWebApp.currentUser?.id
                }, {
                    $set: {
                        verified: false,
                        nid: NID.value.toString()
                    }
                }).then(() => {
                    $q.notify({
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
                        color: 'negative',
                        textColor: 'white',
                        message: 'NID could not be saved'
                    });
                }).finally(() => {
                    $q.loading.hide();
                });
                currentUser.value.nid = NID.value;
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
        return {
            currentUser,
            NID,
            NIDValidation,
            addNID
        };
    }
});
</script>

<style lang='scss'>

</style>
