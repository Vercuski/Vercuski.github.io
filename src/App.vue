<template>
  <v-app id="app">
    <a href="#main-content" class="skiplink">Skip to content</a>
    <header class="d-flex align-center justify-end header px-3">
      <nav aria-label="Main">
        <!-- Full link row on desktop; collapses into a menu below the md
             breakpoint, where six links no longer fit across the screen.
             Both are CSS-driven so the prerendered HTML is the same at
             every width. -->
        <ul class="navlinks d-none d-md-flex align-center">
          <li v-for="link in navLinks" :key="link.to">
            <router-link :to="link.to" class="headerrouterlink my-5 mx-5">{{ link.label }}</router-link>
          </li>
        </ul>
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="d-md-none"
              :icon="mdiMenu"
              variant="text"
              color="white"
              aria-label="Open menu"
            />
          </template>
          <v-list min-width="200">
            <v-list-item v-for="link in navLinks" :key="link.to" :to="link.to" :title="link.label" />
          </v-list>
        </v-menu>
      </nav>
    </header>
    <v-main id="main-content" class="main" tabindex="-1">
      <router-view />
    </v-main>
    <v-footer app class="d-flex flex-column align-center justify-center footer">
      <div class="d-flex flex-wrap justify-center footerlinks">
        <a href="https://www.linkedin.com/in/scott-vercuski/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://github.com/Vercuski" target="_blank" rel="noopener">GitHub</a>
        <router-link to="/contact/">Contact</router-link>
        <router-link to="/privacy/">Privacy</router-link>
      </div>
      <span class="text-body-2">&copy; {{ currentYear }}. Created by Scott Vercuski</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { mdiMenu } from '@mdi/js'
import { canonicalUrl } from './site'

const currentYear = new Date().getFullYear()

const navLinks = [
  { to: '/', label: 'HOME' },
  { to: '/about/', label: 'ABOUT' },
  { to: '/projects/', label: 'PROJECTS' },
  { to: '/skills/', label: 'SKILLS' },
  { to: '/topics/', label: 'TOPICS' },
  { to: '/contact/', label: 'CONTACT' },
]

// Per-page canonical URL (and matching og:url), in the same form the
// sitemap uses (see site.ts).
const route = useRoute()
const pageUrl = computed(() => canonicalUrl(route.path))
useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [{ property: 'og:url', content: pageUrl }],
})
</script>
