<script setup>
import { supabase } from '@/db';
import { useForm } from 'vee-validate';
import { useAuthStore } from '@/stores/authStore';
import bcrypt  from 'bcryptjs'
import * as yup from 'yup';
import { useRouter } from 'vue-router';

const schema = yup.object({
  email: yup.string().required().email().label('Email address'),
  password: yup.string().required().min(6).label('Password'),
  passwordConfirm: yup
    .string()
    .required()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .label('Password confirmation'),
});

const { defineField, handleSubmit, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
    password: '',
    passwordConfirm: ''
  },
});

const quasarConfig = (state) => ({
  props: {
    error: !!state.errors[0],
    'error-message': state.errors[0],
  },
});

const [email, emailProps] = defineField('email', quasarConfig);
const [password, passwordProps] = defineField('password', quasarConfig);
const [passwordConfirm, passwordConfirmProps] = defineField(
  'passwordConfirm',
  quasarConfig
);
const store = useAuthStore();
const router = useRouter();

const onSubmit = handleSubmit(async (values) => {
    const salt = bcrypt.genSaltSync(10);

    const _data = {
        email: values?.email,
        password: bcrypt.hashSync(values?.password, salt)
    };

    const { data, error } = await supabase
                           .from('users')
                           .select('id','email');

    if(!error) {
        if(data[0].email === _data.email) {
            setFieldError('email', 'User already exists.');
            return;
        }

        const query = await supabase
                           .from('users')
                           .insert(_data)
                           .select(`id, email`);

        if(!query?.error) {
            store.login(query?.data[0])
            router.replace({ name: 'home' })
        }
    }
});

</script>
<template>
    <div class="container q-pa-lg">
        <h1 class="text-h4 text-weight-bold">Register</h1>
        <q-form @submit="onSubmit">
        <q-input
          label="Email"
          placeholder="user@example.com"
          v-model="email"
          v-bind="emailProps"
          type="email"
        />

        <q-input
          label="Password"
          placeholder="Enter Password"
          v-model="password"
          v-bind="passwordProps"
          type="password"
        />

        <q-input
          label="Password confirmation"
          placeholder="Confirm Password"
          v-model="passwordConfirm"
          v-bind="passwordConfirmProps"
          type="password"
        />

        <q-btn class="q-mt-lg block full-width" padding="10px" size="md" color="primary" label="Submit" type="submit"  />
      </q-form>
        <p class="q-mt-lg">
            Already have an account ? <RouterLink :to="{ name: 'login' }">login</RouterLink>
        </p>
    </div>
</template>