<script setup>
import { supabase } from '@/db';
import { useAuthStore } from '@/stores/authStore';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required().label('Name'),
  price: yup.string().required().label('Price'),
});

const editSchema = yup.object({
  editName: yup.string().required().label('Name'),
  editPrice: yup.string().required().label('Price'),
});

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    price: '',
  },
});

const editForm = useForm({
    validationSchema: editSchema,
    initialValues: {
        editId: '',
        editName: '',
        editPrice: '',
    }
})

const quasarConfig = (state) => ({
  props: {
    error: !!state.errors[0],
    'error-message': state.errors[0],
  },
});

const [name, nameProps] = defineField('name', quasarConfig);
const [price, priceProps] = defineField('price', quasarConfig);
const [editName, editNameProps] = editForm.defineField('editName', quasarConfig)
const [editPrice, editPriceProps] = editForm.defineField('editPrice', quasarConfig)

const router = useRouter();

const store = useAuthStore();
const items = ref([]);
const doneItems = ref([]);
const checkedItems = ref([]);
const editDialog = ref(false);
const deleteDialog= ref(false);
const backdropFilter = ref(null);

const openEditDialog = () => {
    backdropFilter.value = "blur(4px)";
    editDialog.value = true;
}

const closeEditDialog = () => {
    backdropFilter.value = "";
    editDialog.value = false;
}

const openDeleteDialog = () => {
    backdropFilter.value = "blur(4px)";
    deleteDialog.value = true;
}

const closeDeleteDialog = () => {
    backdropFilter.value = "";
    deleteDialog.value = false;
}

const getUndoneItems = async (user) => {
    const query = await supabase
                            .from('lists')
                            .select(`*`)
                            .eq('isDone', false)
                            .eq('user_id', user?.id);
    
    if(query?.error) {
        console.log(query?.error)
        return null;
    }

    return query?.data || [];
}

const getDoneItems = async (user) => {
    const query = await supabase
                            .from('lists')
                            .select(`*`)
                            .eq('isDone', true)
                            .eq('user_id', user?.id);
    
    if(query?.error) {
        console.log(query?.error)
        return null;
    }
    return query?.data || [];
}

const onSubmit = handleSubmit(async (values) => {
    const data = {
        name: values?.name,
        price: +values?.price,
    }

    await addItem(data)
});

const onEdit = editForm.handleSubmit(async (values) => {
    const data = {
        name: values?.editName,
        price: +values?.editPrice,
    }
    await editItem(values?.editId, data)
})

const addItem = async (data) => {
    const query = await supabase
            .from('lists')
            .insert({...data, 'user_id': store?.getUser?.id})
            .select('*');

    if(!query.error){
        items.value = await getUndoneItems(store?.getUser);
        resetForm()
    }
}

const editItem = async(id, data) => {
    const query = await supabase
        .from('lists')
        .update({...data, 'user_id': store?.getUser?.id})
        .eq('id', id);

    if(!query.error){
        items.value = await getUndoneItems(store?.getUser);
        resetForm()
        closeEditDialog()
    }
}

const getEditData = (item) => {
    if(!item) return;
    openEditDialog()
    editForm.setFieldValue('editId', item.id)
    editForm.setFieldValue('editName', item.name)
    editForm.setFieldValue('editPrice', item.price)
}

const doneItem = async (itemIds) => {
    await supabase
            .from('lists')
            .update({ isDone: true })
            .eq('id', itemIds[0])

    checkedItems.value = [];

    items.value = await getUndoneItems(store?.getUser)
    doneItems.value = await getDoneItems(store?.getUser)
}

const undoneItem = async (item) => {
    await supabase
            .from('lists')
            .update({ isDone: false })
            .eq('id', item.id)

    items.value = await getUndoneItems(store?.getUser)
    doneItems.value = await getDoneItems(store?.getUser)
}

const deleteItem = async(item) => {
    const deleteQuery = await supabase
            .from('lists')
            .delete()
            .eq('id', item.id);

    if(!deleteQuery.error) {
        items.value = await getUndoneItems(store?.getUser);
        doneItems.value = await getDoneItems(store?.getUser);
        closeDeleteDialog();
    }
}

const getAuthUser = async () => {
    const query = await supabase
            .from('users')
            .select(`id, email`)
            .eq('email', store?.getUser?.email);

    if(query?.error){
        console.log(query?.error);
        return [];
    }

    return query?.data;
}


onMounted(async() => {
    const authUser = await getAuthUser();
    if(!authUser?.length) {
        store?.logout();
        router.replace({ name: 'login' });
        return;
    }
    items.value = await getUndoneItems(authUser[0]);
    doneItems.value = await getDoneItems(authUser[0]);

})
</script>
<template>
    <div class="container q-pa-lg">
        <h1 class="text-h4 text-weight-bold">Need List</h1>
        <q-form @submit="onSubmit" class="row items-center q-gutter-md">
            <q-input
                label="Name"
                placeholder="eg: Carrot"
                v-model="name"
                v-bind="nameProps"
                class="col"
            />
             <q-input
                label="Price"
                placeholder="1000 MMK"
                v-model="price"
                v-bind="priceProps"
                type="number"
                class="col"
            />

            <q-btn class="" padding="10px" size="md" color="primary" type="submit" icon="add_circle" />
      </q-form>
    </div>
    <div class="container q-px-lg">
        <q-card>
            <q-card-section>
                <q-item-label header class="row items-center q-gutter-sm">
                    <span>Buy List</span>
                    <q-badge class="text-subtitle2 q-py-none q-px-md">{{ items.length }}</q-badge>
                </q-item-label>
                <template v-if="items?.length">
                    <q-list v-for="item in items" :key="item.id" separator>
                        <q-item>
                            <q-item-section side top>
                                    <q-checkbox  color="green" :val="item.id"  v-model="checkedItems" @update:model-value="doneItem"  />
                            </q-item-section>
            
                            <q-item-section>
                                    <q-item-label>{{ item.name }}</q-item-label>
                                    <q-item-label caption>
                                        {{item.price}} MMK
                                    </q-item-label>
                            </q-item-section>

                            <q-item-section side right>
                                <q-btn icon="edit" color="primary" flat @click.prevent="getEditData(item)" />
                            </q-item-section>

                             <q-dialog v-model="editDialog" :backdrop-filter="backdropFilter">
                                    <q-card style="width: 90vw; max-width: 800px;">
                                        <q-card-section class="row items-center q-pb-none text-h6">
                                            Edit Item
                                        </q-card-section>

                                        <q-card-section>
                                            <q-form @submit="onEdit">
                                                <q-input
                                                    label="Name"
                                                    placeholder="eg: Carrot"
                                                    v-model="editName"
                                                    v-bind="editNameProps"
                                                    class="col"
                                                />
                                                <q-input
                                                    label="Price"
                                                    placeholder="1000 MMK"
                                                    v-model="editPrice"
                                                    v-bind="editPriceProps"
                                                    type="number"
                                                    class="col"
                                                />
                                                <q-card-actions align="right" class="text-primary">
                                                    <q-btn flat label="Cancel" v-close-popup />
                                                    <q-btn type="submit" flat label="Done" />
                                                </q-card-actions>
                                            </q-form>
                                        </q-card-section>
                                    </q-card>
                              </q-dialog>
                        </q-item>
                    </q-list>
                </template>
                <div v-else class="text-center text-h6 q-py-lg">
                    <q-icon name="hourglass_disabled" color="grey" size="md"></q-icon>
                    <p class="text-subtitle1 q-mt-sm text-grey">Empty</p>
                </div>
            </q-card-section>
        </q-card>

         <q-card class="q-my-lg bg-light-green-4">
            <q-card-section>

                <q-item-label header class="row items-center q-gutter-sm text-black">
                    <span>Done List</span>
                    <q-badge color="green-9" class="text-subtitle2 q-py-none q-px-md">{{ doneItems.length }}</q-badge>
                </q-item-label>

                <template v-if="doneItems?.length">
                    <q-list v-for="item in doneItems" :key="item.id" separator>
                        <q-item>
                            <q-item-section>
                                    <q-item-label>{{ item.name }}</q-item-label>
                                    <q-item-label caption>
                                        {{item.price}} MMK
                                    </q-item-label>
                            </q-item-section>

                            <q-item-section side right>
                                <div>
                                    <q-btn icon="unpublished" color="green" flat @click.prevent="undoneItem(item)" />
                                    <q-btn icon="delete" color="red" flat @click.prevent="openDeleteDialog" />
                                    <q-dialog v-model="deleteDialog" persistent :backdrop-filter="backdropFilter">
                                        <q-card>
                                            <q-card-section class="row items-center q-gutter-md">
                                                <q-avatar icon="delete" color="red-12" text-color="white" />
                                                    <span class="q-ml-lg text-subtitle1">Are you sure do you want to delete <strong>{{ item.name  }}</strong></span>
                                                </q-card-section>

                                                <q-card-actions align="right">
                                                    <q-btn flat label="Cancel" color="black" v-close-popup />
                                                    <q-btn label="Delete" color="red-12" @click.prevent="deleteItem(item)" />
                                                </q-card-actions>
                                            </q-card>
                                     </q-dialog>
                                </div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </template>
                <div v-else class="text-center text-h6 q-py-lg">
                    <q-icon name="hourglass_disabled" color="white" size="md"></q-icon>
                    <p class="text-subtitle1 q-mt-sm text-white">Empty</p>
                </div>
            </q-card-section>
        </q-card>

    </div>

</template>