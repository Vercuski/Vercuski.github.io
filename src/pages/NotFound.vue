<template>
  <v-container class="fill-height" fluid>
    <v-row class="align-center justify-center" style="min-height: 60vh">
      <v-col cols="12" class="text-center">
        <h1 class="text-h3" style="font-weight: bold">404 — Page Not Found</h1>
        <p class="text-h6 mt-6">
          The page you're looking for doesn't exist.
          <router-link to="/">Go back home.</router-link>
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'Page Not Found | Scott Vercuski',
  meta: [
    { name: 'robots', content: 'noindex' },
  ],
})
</script>
