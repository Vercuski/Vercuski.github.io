/**
 * router/index.ts
 *
 * Route definitions for the app. This exports the raw route table rather
 * than a router instance — vite-ssg (see src/main.ts) builds the actual
 * router for both the client build and the static-generation build
 * (ADR-0002 in the FrontendRedesign architecture docs).
 */

import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import AboutView from '../pages/About.vue'
import IndexView from '../pages/index.vue'
import ProjectsView from '../pages/Projects.vue'
import SkillsView from '../pages/Skills.vue'
import TopicsView from '../pages/Topics.vue'
import TopicsIndexView from '../pages/TopicsIndex.vue'
import TopicDetailView from '../pages/TopicDetail.vue'
import NotFoundView from '../pages/NotFound.vue'
import { allTopics } from '../data/topics'

// Paths are lowercase: the live host redirects every URL to lowercase with
// a trailing slash, and links point straight at that form (see site.ts).
export const routes: RouteRecordRaw[] = [
  { path: '/', component: IndexView },
  { path: '/about', component: AboutView },
  { path: '/projects', component: ProjectsView },
  { path: '/skills', component: SkillsView },
  {
    path: '/topics',
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
      // One page per document in a documentation set, e.g.
      // /topics/<slug>/01-requirements/business-requirements/. These are
      // dynamic, so vite.config.mts lists them for prerendering.
      ...allTopics.filter(topic => topic.documentation).map(topic => ({
        path: `${topic.slug}/:doc(.*)`,
        component: TopicDetailView,
        props: (route: RouteLocationNormalized) => ({
          slug: topic.slug,
          doc: String(route.params.doc).replace(/\/+$/, ''),
        }),
      })),
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
]
