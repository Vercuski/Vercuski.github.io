/**
 * main.ts
 *
 * Bootstraps the app via vite-ssg, which builds the router from `routes`
 * for both the dev/client build and the static-generation build
 * (ADR-0002 in the FrontendRedesign architecture docs), and registers
 * Vuetify.
 *
 * Per-route <head> (title/meta) support comes from vite-ssg's own
 * built-in @unhead/vue integration (the `useHead: true` default) — it
 * creates and registers the head instance itself before this setup
 * callback runs. We must NOT create or app.use() a second head instance
 * here: doing so silently overrides the Vue provide/inject binding that
 * useHead() in page components reads from, so page-level useHead() calls
 * would write into an orphaned head that vite-ssg's SSG build never reads
 * from when it calls renderDOMHead() — which is exactly what caused every
 * prerendered route to keep the homepage's static <title>/<meta> tags.
 */

import { ViteSSG } from 'vite-ssg'

import App from './App.vue'
import { routes } from './router'
import { registerPlugins } from '@/plugins'

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
  },
  ({ app }) => {
    registerPlugins(app)
  },
)
