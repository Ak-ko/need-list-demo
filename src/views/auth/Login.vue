<script setup>
import { supabase } from '@/db';
import { useAuthStore } from '@/stores/authStore';
import { useForm } from 'vee-validate';
import bcrypt  from 'bcryptjs'
import * as yup from 'yup';
import { useRouter } from 'vue-router';

const schema = yup.object({
  email: yup.string().required().email().label('Email address'),
  password: yup.string().required().min(6).label('Password'),
});

const { defineField, handleSubmit, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
    password: '',
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
const store = useAuthStore();
const router = useRouter();

const onSubmit = handleSubmit(async (values) => {
    const { data, error } = await supabase
                           .from('users')
                           .select(`id, email, password`)
                           .eq('email', values.email);

    if(!data?.length) {
      setFieldError('email', 'User doesn\'t exist');
      return;
    }

    if(!error) {
          const user = data[0];
          if(user.email !== values.email) {
              setFieldError('email', 'Invalid Credentials');
              return;
          }

          if(!await bcrypt.compare(values.password, user.password)) {
              setFieldError('password', 'Invalid Credentials');
              return;
          }
        delete user?.password;
        store.login(user)
        router.replace({ name: 'home' })
    } else {
        console.log(error)
    }
});

</script>
<template>
    <div class="container q-pa-lg">
        <h1 class="text-h4 text-weight-bold">Login</h1>
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

        <q-btn class="q-mt-lg block full-width" padding="10px" size="md" color="primary" label="Submit" type="submit"  />
      </q-form>
      <p class="q-mt-lg">
        Already have an account ? <RouterLink :to="{ name: 'register' }">Register</RouterLink>
      </p>
    </div>
</template>