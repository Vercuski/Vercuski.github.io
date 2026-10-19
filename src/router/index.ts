/**
 * router/index.ts
 *
 * Route definitions for the app. This exports the raw route table rather
 * than a router instance — vite-ssg (see src/main.ts) builds the actual
 * router for both the client build and the static-generation build
 * (ADR-0002 in the FrontendRedesign architecture docs).
 */

import type { RouteRecordRaw } from 'vue-router'

import AboutView from '../pages/About.vue'
import IndexView from '../pages/index.vue'
import ProjectsView from '../pages/Projects.vue'
import SkillsView from '../pages/Skills.vue'
import TopicsView from '../pages/Topics.vue'
import TopicsIndexView from '../pages/TopicsIndex.vue'
import TopicDetailView from '../pages/TopicDetail.vue'
import NotFoundView from '../pages/NotFound.vue'
import { allTopics } from '../data/topics'

export const routes: RouteRecordRaw[] = [
  { path: '/', component: IndexView },
  { path: '/About', component: AboutView },
  { path: '/Projects', component: ProjectsView },
  { path: '/Skills', component: SkillsView },
  {
    path: '/Topics',
    component: TopicsView,
    children: [
      { path: '', component: TopicsIndexView },
      // One static child route per topic and sub-topic so vite-ssg
      // prerenders each page.
      ...allTopics.map(topic => ({
        path: topic.slug,
        component: TopicDetailView,
        props: { slug: topic.slug },
      })),
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
]
