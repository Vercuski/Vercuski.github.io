<template>
  <v-app id="app">
    <div app class="d-flex align-center justify-end header">
      <router-link to="/" class="headerrouterlink my-5 mx-5">HOME</router-link>
      <router-link to="/about/" class="headerrouterlink my-5 mx-5"
        >ABOUT</router-link
      >
      <router-link to="/projects/" class="headerrouterlink my-5 mx-5"
        >PROJECTS</router-link
      >
      <router-link to="/skills/" class="headerrouterlink my-5 mx-5"
        >SKILLS</router-link
      >
      <router-link to="/topics/" class="headerrouterlink my-5 mx-5"
        >TOPICS</router-link
      >
      <router-link to="/contact/" class="headerrouterlink my-5 mx-5"
        >CONTACT</router-link
      >
    </div>
    <v-main class="main">
      <router-view />
    </v-main>
    <v-footer app class="d-flex align-center justify-center footer">
      <span class="text-body-1">&copy; {{ currentYear }}. Created by Scott Vercuski</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { canonicalUrl } from './site'

const currentYear = new Date().getFullYear()

// Per-page canonical URL (and matching og:url), in the same form the
// sitemap uses (see site.ts).
const route = useRoute()
const pageUrl = computed(() => canonicalUrl(route.path))
useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [{ property: 'og:url', content: pageUrl }],
})
</script>
