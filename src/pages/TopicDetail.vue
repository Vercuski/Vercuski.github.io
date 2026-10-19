<template>
  <div class="px-2">
    <p class="text-h5" style="font-weight: bold">{{ topic.documentation ?? topic.title }}</p>
    <br/>
    <p>{{ topic.summary }}</p>
    <br/>
    <DocumentationBrowser v-if="topic.documentation" :set="topic.documentation" />
    <!-- Topics with sub-topics link to each one with its summary. -->
    <v-row v-else-if="topic.children?.length">
      <v-col v-for="child in topic.children" :key="child.slug" cols="12" md="6">
        <v-card :to="`/Topics/${child.slug}`" class="h-100" hover>
          <v-card-title class="text-wrap">{{ child.title }}</v-card-title>
          <v-card-text>{{ child.summary }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <p v-else class="text-medium-emphasis">Content coming soon.</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
import { useHead } from '@unhead/vue'
import { allTopics } from '../data/topics'

// Loaded on demand: the markdown pipeline is large and only these
// documentation pages need it.
const DocumentationBrowser = defineAsyncComponent(() => import('../components/DocumentationBrowser.vue'))

// Passed from the route table (router/index.ts) so each topic gets its
// own static route for vite-ssg to prerender.
const props = defineProps<{ slug: string }>()

const topic = computed(() => allTopics.find(t => t.slug === props.slug)!)

useHead(() => ({
  title: `${topic.value.title} | Topics | Scott Vercuski`,
  meta: [
    { name: 'description', content: topic.value.summary },
  ],
}))
</script>
