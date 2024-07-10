<script setup lang="ts">
import { RouterView } from 'vue-router'

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
        </q-toolbar>
    </q-header>

    <q-page-container>
      <RouterView />
    </q-page-container>
  </q-layout>
</template>
