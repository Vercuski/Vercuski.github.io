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
import AlgebraView from '../pages/Algebra.vue'
import CalculusView from '../pages/Calculus.vue'

const routes = [
  { path: '/', component: IndexView },
  { path: '/About', component: AboutView },
  { path: '/Projects', component: ProjectsView },
  { path: '/Skills', component: SkillsView },
  { path: '/Math/Algebra', component: AlgebraView },
  { path: '/Math/Calculus', component: CalculusView },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
