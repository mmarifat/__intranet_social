<template>
    <q-dialog
        v-model='openDialog'
        persistent
        :maximized='maximizedToggle'
        transition-show='slide-up'
        transition-hide='slide-down'
    >
        <q-card class='bg-light-blue-14 text-white window-width'>
            <q-bar>
                <q-space />

                <q-btn dense flat icon='minimize' @click='maximizedToggle = false' :disable='!maximizedToggle'>
                    <q-tooltip v-if='maximizedToggle' class='bg-white text-primary'>Minimize</q-tooltip>
                </q-btn>
                <q-btn dense flat icon='crop_square' @click='maximizedToggle = true' :disable='maximizedToggle'>
                    <q-tooltip v-if='!maximizedToggle' class='bg-white text-primary'>Maximize</q-tooltip>
                </q-btn>
                <q-btn dense flat icon='close' @click='submitSkip'>
                    <q-tooltip class='bg-white text-primary'>Close</q-tooltip>
                </q-btn>
            </q-bar>

            <q-card-section class='text-center text-overline'>
                <div>Apply your referral code</div>
            </q-card-section>

            <q-card-section class='q-pt-none'>
                <q-form @submit.prevent='submitReferralCode' @reset='refCode = ""'>
                    <q-input rounded filled v-model='refCode' placeholder='Referral Code'
                             :rules='[v => !!v || "Required", v => !!v && v.length > 9 || "Wrong referral code"]'>
                        <template v-slot:prepend>
                            <q-icon name='code' />
                        </template>
                    </q-input>
                    <div class='row q-col-gutter-md justify-center q-mt-md'>
                        <div class='pr-4'>
                            <q-btn color='red' text-color='white' icon-right='fa fa-fast-forward' label='Skip'
                                   @click='submitSkip' />
                        </div>
                        <div>
                            <q-btn color='info' text-color='white' icon-right='send' label='Use' type='submit'
                                   :loading='codeLoading' />
                        </div>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang='ts'>
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { realmWebApp } from '../custom/funtions/RealmWebClient';


// TODO:: change when necessary
const referralBonus = 1000;

export default defineComponent({
    name: 'Referral',
    props: {
        dialogState: Boolean
    },
    model: {
        prop: 'dialogState',
        event: 'dialogStateChange'
    },
    computed: {
        openDialog: {
            get: function() {
                return this.dialogState;
            },
            set: function(value: boolean) {
                this.$emit('openDialogChange', value);
            }
        }
    },
    setup() {
        const $q = useQuasar();
        const $router = useRouter();
        const maximizedToggle = ref(false);
        const refCode = ref('');
        const codeLoading = ref(false);

        const submitSkip = () => {
            const user: any = realmWebApp.currentUser?.customData;
            $router.push({ name: 'dashboard' });
            $q.notify({
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                message: `Successfully logged in as ${user?.name}`,
                type: 'positive'
            });
        };
        const submitReferralCode = async () => {
            if (realmWebApp.currentUser?.isLoggedIn) {
                codeLoading.value = true;
                const result = await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet_social')?.collection('users').findOne({
                    inviteCode: refCode.value,
                    realmID: { $ne: realmWebApp.currentUser?.id }
                });
                if (!!result) {
                    await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet_social')?.collection('users').updateOne({
                        realmID: realmWebApp.currentUser?.id
                    }, {
                        $set: {
                            invitedBy: result?._id,
                            invitedPoint: referralBonus
                        }
                    });
                    $q.notify({
                        message: 'Congratulations',
                        caption: `You have received ${referralBonus} points as referral bonus`,
                        type: 'info'
                    });
                    submitSkip();
                } else {
                    $q.notify({
                        message: 'Invalid referral code',
                        type: 'warning'
                    });
                }
                codeLoading.value = false;
            }
        };

        return {
            maximizedToggle,
            refCode,
            codeLoading,
            submitSkip,
            submitReferralCode
        };
    }
});
</script>
