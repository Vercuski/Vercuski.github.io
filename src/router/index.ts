/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
})

router.beforeEach((to, from, next) => {
  if (to.fullPath.substring(0,2) === "/?") {
    const newto = to.fullPath.replace('/?', '');
    router.push(newto);
  }
  next();
});

export default router
