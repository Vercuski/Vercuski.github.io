/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
//import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// Wave 5 (visual/design system): the site previously used Vuetify's built-in
// 'dark' theme (light text, dark-surface-calibrated component colors) while
// the actual page background (.main, see settings.scss) is a light image with
// manually-forced black text — two different, uncoordinated color systems
// fighting each other. Any Vuetify component that did not have its colors
// hand-overridden (e.g. an outlined button) would render near-invisible
// light-on-light. This defines one real light theme, built from the colors
// already in use elsewhere on the site (header/footer background, the
// project card accent), so every Vuetify component gets correct, readable
// colors automatically instead of needing a manual override per element.
//
// Contrast-checked against WCAG AA (4.5:1 for normal text):
//   white on primary (#6966DB): 4.64:1 — passes
//   white on secondary (#66627A): 5.84:1 — passes
//   black on background (#F5F5F5): 19.26:1 — passes
//
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'scottLight',
    themes: {
      scottLight: {
        dark: false,
        colors: {
          primary: '#6966DB',
          secondary: '#66627A',
          background: '#F5F5F5',
          surface: '#FFFFFF',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
        },
      },
    },
  },
})
