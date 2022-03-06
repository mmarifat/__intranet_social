<template>
    <q-page>
        <q-table
            title='Transactions Histories'
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
                    <q-td auto-width>
                        {{ props.row.index }}
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        <q-img
                            :src='props.row.user.imageUrl'
                            class='q-ma-none rounded-borders'
                            width='30'
                            height='30'
                            rounded
                            fit='cover'
                        />
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        {{ props.row.user.name }}
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        {{ props.row.user.nid }}
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        {{ props.row.amount }}
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        <q-chip class='glossy' square :color="props.row.verified === true ? 'teal' : 'red'"
                                dense size='12px' text-color='white'
                                :icon='props.row.verified === true ? "check" : "bookmark"'>
                            {{ props.row.verified === true ? 'Done' : 'Processing' }}
                        </q-chip>
                    </q-td>

                    <q-td class='q-px-sm text-center cursor-pointer'>
                        {{ new Date(props.row.createdAt).toLocaleString() }}
                    </q-td>

                    <q-td class='q-px-sm'>
                        <q-icon class='cursor-pointer' color='dark' name='list' size='sm'>
                            <q-menu anchor='bottom left' fit self='top left' transition-hide='jump-up'
                                    transition-show='jump-down'>
                                <q-list style='min-width: 100px'>
                                    <q-item clickable dense v-if='props.row.verified === false'>
                                        <q-item-section>
                                            <div>Accept Transaction</div>
                                            <q-popup-proxy :breakpoint='700'>
                                                <q-banner dense>
                                                    <template v-slot:avatar>
                                                        <q-icon color='negative' name='delete_forever' />
                                                    </template>
                                                    Would you really like to accept and complete `
                                                    [{{ props.row.user.name }} - of {{ props.row.amount }}] `?
                                                    <template v-slot:action>
                                                        <q-btn color='negative' glossy v-close-popup
                                                               @click='acceptTransaction(props.row._id)'>
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
                label: 'Amount',
                name: 'amount',
                field: 'amount',
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
                    {
                        $lookup: {
                            from: 'users',
                            let: { realmID_Trans: '$realmID' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$realmID', '$$realmID_Trans'] }
                                    }
                                },
                                { $project: { _id: 1, imageUrl: 1, name: 1, nid: 1 } }
                            ],
                            as: 'user'
                        }
                    },
                    { $unwind: '$user' },
                    { $match: {} },
                    { $project: { _id: 1, amount: 1, verified: 1, createdAt: 1, user: 1 } },
                    { $sort: { [sortBy === 'name' ? 'user.name' : (sortBy === 'nid' ? 'user.nid' : sortBy)]: descending ? -1 : 1 } },
                    { $skip: (page - 1) * rowsPerPage },
                    { $limit: rowsPerPage }
                ];
                if (filter) {
                    condition[2].$match['$or'] = [
                        { amount: Number(filter) },
                        { verified: { $regex: filter, $options: 'i' } },
                        { 'user.name': { $regex: filter, $options: 'i' } },
                        { 'user.nid': { $regex: filter, $options: 'i' } }
                    ];
                }
                await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('transactions')
                    .aggregate(condition)
                    .then(async (results: any[]) => {
                        rows.value = results.map((row, index) => {
                            row.index = index + 1;
                            return row;
                        });
                        await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('transactions').count().then(count => {
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

        const acceptTransaction = async (_id: string | any) => {
            await realmWebApp.currentUser?.mongoClient('mongodb-atlas').db('intranet-social')?.collection('transactions').updateOne(
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

        return {
            rows,
            pagination,
            isLoading,
            filter,
            selected,
            columns,
            onRequest,
            acceptTransaction
        };
    }
});
</script>
