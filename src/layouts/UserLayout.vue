<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { RouterView, useRouter } from 'vue-router'

const store = useAuthStore();
const router = useRouter();

const logout = () => {
  store?.logout();
  router.replace({ name: 'login' })
}

</script>

<template>
  <q-layout>
    <q-header elevated class="q-py-sm bg-primary">
        <q-toolbar>
          <!-- <q-btn flat round dense icon="menu" class="q-mr-sm" /> -->
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar> -->
          <q-toolbar-title >List Builder</q-toolbar-title>

          <q-btn v-if="store?.getUser" flat round dense icon="logout" @click="logout()" />
        </q-toolbar>
    </q-header>

    <q-page-container>
      <RouterView />
    </q-page-container>
  </q-layout>
</template>
