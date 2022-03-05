<template>
    <q-list>
        <q-item-label header>
            Menu
        </q-item-label>

        <q-item-section>
            <q-item clickable to='/dashboard' exact>
                <q-item-section avatar>
                    <q-icon name='dashboard' size='24px' />
                </q-item-section>
                <q-item-section>
                    <q-item-label> Home</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable to='/profile' exact>
                <q-item-section avatar>
                    <q-icon name='account_box' size='24px' />
                </q-item-section>
                <q-item-section>
                    <q-item-label> Profile</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable to='/pointWithdraw' exact v-if='currentUserType !== "admin"'>
                <q-item-section avatar>
                    <q-icon name='price_check' size='24px' />
                </q-item-section>
                <q-item-section>
                    <q-item-label> Request Point Withdraw</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable to='/users' exact v-if='currentUserType === "admin"'>
                <q-item-section avatar>
                    <q-icon name='price_check' size='24px' />
                </q-item-section>
                <q-item-section>
                    <q-item-label> Users Corner</q-item-label>
                </q-item-section>
            </q-item>
        </q-item-section>
    </q-list>
</template>

<script lang='ts'>
import { defineComponent, ref } from 'vue';
import { realmWebApp } from '../custom/funtions/RealmWebClient';

export default defineComponent({
    name: 'MenuComponent',
    setup() {
        const currentUserType = ref(realmWebApp.currentUser?.customData.userType);
        return {
            currentUserType
        };
    }
});
</script>
