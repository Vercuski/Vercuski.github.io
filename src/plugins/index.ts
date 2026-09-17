/**
 * plugins/index.ts
 *
 * Registers app-level plugins. Router installation is handled by
 * vite-ssg itself (see src/main.ts), not here.
 */

// Plugins
import vuetify from './vuetify'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app.use(vuetify)
}
