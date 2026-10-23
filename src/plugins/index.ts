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

/**
 * Installs every app-level plugin on the Vue app.
 *
 * @param app - The app instance vite-ssg created.
 */
export function registerPlugins (app: App) {
  app.use(vuetify)
}
