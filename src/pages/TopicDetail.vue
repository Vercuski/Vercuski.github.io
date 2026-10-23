<template>
  <div class="px-2">
    <!-- On documentation pages the document's own title is the page's
         <h1>, so the set name is a plain label there. -->
    <div v-if="topic.documentation" class="text-h5" style="font-weight: bold">{{ topic.documentation }}</div>
    <h1 v-else class="text-h5" style="font-weight: bold">{{ topic.title }}</h1>
    <br/>
    <p>{{ topic.summary }}</p>
    <br/>
    <DocumentationBrowser v-if="topic.documentation" :set="topic.documentation" :doc="doc" />
    <!-- Topics with sub-topics link to each one with its summary. -->
    <v-row v-else-if="topic.children?.length">
      <v-col v-for="child in topic.children" :key="child.slug" cols="12" md="6">
        <v-card :to="topicUrl(child.slug)" class="h-100" hover>
          <h2 class="v-card-title text-wrap">{{ child.title }}</h2>
          <v-card-text>{{ child.summary }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <p v-else class="text-medium-emphasis">Content coming soon.</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
import { allTopics } from '../data/topics'
import { usePageMeta } from '../composables/usePageMeta'
import { topicUrl } from '../utils/docPaths'

// Loaded on demand: the markdown pipeline is large and only these
// documentation pages need it.
const DocumentationBrowser = defineAsyncComponent(() => import('../components/DocumentationBrowser.vue'))

// A topic's page: its summary, then its documentation set, links to its
// sub-topics, or a placeholder.
//
// Props are passed from the route table (router/index.ts) so each topic
// gets its own static route for vite-ssg to prerender.
const props = defineProps<{
  /** Slug of the topic to show (see data/topics.ts). */
  slug: string
  /** Document URL segment, on a documentation set's document pages. */
  doc?: string
}>()

const topic = computed(() => allTopics.find(t => t.slug === props.slug)!)

// Document pages override this with the document's own title and
// description (see components/DocumentView.vue).
usePageMeta(() => ({
  title: `${topic.value.documentation ?? topic.value.title} | Topics | Scott Vercuski`,
  description: topic.value.summary,
}))
</script>
