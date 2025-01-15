/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'

import AboutView from '../pages/About.vue'
import IndexView from '../pages/index.vue'
import ProjectsView from '../pages/Projects.vue'
import SkillsView from '../pages/Skills.vue'


const routes = [
  { path: '/', component: IndexView },
  { path: '/About', component: AboutView },
  { path: '/Projects', component: ProjectsView },
  { path: '/Skills', component: SkillsView },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
