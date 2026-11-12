/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

/**
 * When each documentation file last changed ('YYYY-MM-DD'), keyed by
 * '<set>/<path within set>'. Set at build time in vite.config.mts.
 */
declare const __DOC_DATES__: Record<string, string>

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
