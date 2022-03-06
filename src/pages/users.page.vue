<template>
    <q-page>
        <q-table
            :columns='columns'
            :rows='rows'
            :loading='isLoading'
            v-model:selected='selected'
            v-model:pagination='pagination'
            :filter='filter'
            :style="'max-height: 88.5vh'"
            binary-state-sort
            card-class='full-width text-black'
            row-key='_id'
            @request='onRequest'>

            <template v-slot:no-data='{ icon, filter }'>
                <div class='text-overline full-width row justify-center q-py-xl q-my-xl'>
                    <q-icon
                        :name="filter ? 'filter_b_and_w' : icon"
                        class='col-1'
                        color='warning'
                        size='2em'
                    />
                    <span>No data to show!</span>
                </div>
            </template>

            <template v-slot:top-right>
                <q-input borderless dense debounce='500' v-model='filter' placeholder='Search'>
                    <template v-slot:append>
                        <q-icon name='search' />
                    </template>
                </q-input>
            </template>

            <template v-slot:body='props'>
                <q-tr :props='props'>
                    <!--                    <q-td auto-width>
                                            <q-checkbox v-model='props.selected' />
                                        </q-td>-->
                    <q-td auto-width>
                        {{ props.row.index }}
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        <q-img
                            :src='props.row.imageUrl'
                            class='q-ma-none rounded-borders'
                            width='30'
                            height='30'
                            rounded
                            fit='cover'
                        />
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        {{ props.row.name }}
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        {{ props.row.nid }}
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        {{ new Date(props.row.createdAt).toLocaleString() }}
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        <q-chip class='glossy' square :color="props.row.verified === true ? 'teal' : 'red'"
                                dense size='12px' text-color='white' icon='bookmark'>
                            {{ props.row.verified === true ? 'Verified' : 'Not Verified' }}
                        </q-chip>
                    </q-td>

                    <q-td class='q-px-sm'>
                        <q-icon class='cursor-pointer' color='dark' name='list' size='sm'>
                            <q-menu anchor='bottom left' fit self='top left' transition-hide='jump-up'
                                    transition-show='jump-down'>
                                <q-list style='min-width: 100px'>
                                    <q-item clickable dense v-if='props.row.verified === false'>
                                        <q-item-section>
                                            <div>Verify NID</div>
                                            <q-popup-proxy :breakpoint='700'>
                                                <q-banner dense>
                                                    <template v-slot:avatar>
                                                        <q-icon color='negative' name='delete_forever' />
                                                    </template>
                                                    Would you really like to verify `
                                                    [{{ props.row.nid }} - of {{ props.row.name }}] `?
                                                    <template v-slot:action>
                                                        <q-btn color='negative' glossy v-close-popup
                                                               @click='verifyNID(props.row._id)'>
                                                            Yes
                                                        </q-btn>
                                                        <q-btn v-close-popup color='secondary' glossy> No</q-btn>
                                                    </template>
                                                </q-banner>
                                            </q-popup-proxy>
                                        </q-item-section>
                                    </q-item>

                                    <q-item clickable dense v-if='props.row.verified === true'>
                                        <q-item-section>
                                            <div>Un-Verify NID</div>
                                            <q-popup-proxy :breakpoint='700'>
                                                <q-banner dense>
                                                    <template v-slot:avatar>
                                                        <q-icon color='negative' name='delete_forever' />
                                                    </template>
                                                    Would you really like to un-verify `
                                                    [{{ props.row.nid }} - of {{ props.row.name }}] `?
                                                    <template v-slot:action>
                                                        <q-btn color='negative' glossy v-close-popup
                                                               @click='unVerifyNID(props.row._id)'>
                                                            Yes
                                                        </q-btn>
                                                        <q-btn v-close-popup color='secondary' glossy> No</q-btn>
                                                    </template>
                                                </q-banner>
                                            </q-popup-proxy>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-icon>
                    </q-td>
                </q-tr>

            </template>

        </q-table>
    </q-page>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue';
import { realmWebApp } from '../custom/funtions/RealmWebClient';

export default defineComponent({
    name: 'UsersComponent',
    setup() {
        const rows = ref<any[]>([]);
        const pagination = ref({
            sortBy: 'createdAt',
            descending: true,
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 0
        });
        const isLoading = ref<boolean>(false);
        const filter = ref<string>('');
        const selected = ref<any[]>([]);
        const columns = ref<any[]>([
            {
                label: 'Sl.',
                name: 'index',
                field: 'index',
                sortable: false,
                filterable: false
            },
            {
                label: 'Image',
                name: 'imageUrl',
                field: 'imageUrl',
                align: 'center',
                width: '40px',
                sortable: false,
                filterable: false
            },
            {
                label: 'Name',
                name: 'name',
                field: 'name',
                align: 'center',
                sortable: true,
                filterable: true
            },
            {
                label: 'NID',
                name: 'nid',
                field: 'nid',
                align: 'center',
                sortable: true,
                filterable: true
            },
            {
                label: 'Verified',
                name: 'verified',
                field: 'verified',
                align: 'center',
                sortable: true,
                filterable: true
            },
            {
                label: 'Created At',
                name: 'createdAt',
                field: 'createdAt',
                align: 'center',
                sortable: true,
                filterable: true
            },
            {
                label: '#',
                name: '_id',
                field: '_id',
                align: 'center',
                sortable: false,
                filterable: false
            }
        ]);

        onMounted(() => {
            onRequest({
                pagination: pagination.value,
                filter: undefined
            });
        });

        const onRequest = async (props: any) => {
            if (!isLoading.value) {
                const { page, rowsPerPage, sortBy, descending } = props.pagination;
                const filter = props.filter;

                isLoading.value = true;

                const condition: any = [
                    { $match: {} },
                    { $project: { _id: 1, name: 1, imageUrl: 1, nid: 1, verified: 1, createdAt: 1 } },
                    { $sort: { [sortBy]: descending ? -1 : 1 } },
                    { $skip: (page - 1) * rowsPerPage },
                    { $limit: rowsPerPage }
                ];
                if (filter) {
                    condition[0].$match['$or'] = [
                        { name: { $regex: filter, $options: 'i' } },
                        { verified: { $regex: filter, $options: 'i' } },
                        { nid: { $regex: filter, $options: 'i' } }
                    ];
                }
                await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users')
                    .aggregate(condition)
                    .then(async (results: any[]) => {
                        rows.value = results.map((row, index) => {
                            row.index = index + 1;
                            return row;
                        });
                        await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').count().then(count => {
                            pagination.value.rowsNumber = count || 0;
                            pagination.value.page = page;
                            pagination.value.rowsPerPage = rowsPerPage;
                            pagination.value.sortBy = sortBy;
                            pagination.value.descending = descending;
                        });
                    }).catch((error: any) => {
                        console.log(error);
                    }).finally(() => {
                        isLoading.value = false;
                    });
            }
        };

        const verifyNID = async (_id: string | any) => {
            await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').updateOne(
                { _id }
                , {
                    $set: {
                        verified: true
                    }
                }
            ).then(() => {
                rows.value = rows.value.map((row: any) => {
                    if (row._id.toString() === _id.toString()) {
                        row.verified = true;
                    }
                    return row;
                });
            });
        };

        const unVerifyNID = async (_id: string | any) => {
            await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('users').updateOne(
                { _id }
                , {
                    $set: {
                        verified: false
                    }
                }
            ).then(() => {
                rows.value = rows.value.map((row: any) => {
                    if (row._id.toString() === _id.toString()) {
                        row.verified = false;
                    }
                    return row;
                });
            });
        };

        return {
            rows,
            pagination,
            isLoading,
            filter,
            selected,
            columns,
            onRequest,
            verifyNID,
            unVerifyNID
        };
    }
});
</script>
