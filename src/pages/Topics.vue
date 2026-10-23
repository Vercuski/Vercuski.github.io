<template>
  <div class="topicslayout">
    <!-- Left-hand navigation: flush to the left edge and spanning the full
         height between the header and footer. Stacks above the content on
         small screens. -->
    <nav class="topicsnav">
      <div class="text-overline font-weight-bold px-4 pt-4">Topics</div>
      <!-- open-strategy="multiple": with Vuetify's default "list" strategy,
           a group activator that is also a link collapses its own group as
           soon as its route becomes active (the activator has no registered
           parent, so the open set is reset to empty), making the sub-menu
           flash open and then close on the first click. -->
      <v-list
        v-model:opened="openedGroups"
        open-strategy="multiple"
        nav
        density="comfortable"
        bg-color="transparent"
      >
        <TopicNavItem v-for="topic in topics" :key="topic.slug" :topic="topic" />
      </v-list>
    </nav>
    <div class="topicscontent pa-6">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { allTopics, topics } from '../data/topics'
import TopicNavItem from '../components/TopicNavItem.vue'
import { topicUrl } from '../utils/docPaths'

// Layout for every /topics/ page: the topic navigation on the left and
// the current topic (a child route) beside it.

// Start with a sub-menu open when the current page is that topic or one
// of its sub-topics (at any depth).
const route = useRoute()
const openedGroups = ref<string[]>(
  allTopics
    .filter(topic => topic.children?.length && `${route.path.toLowerCase()}/`.startsWith(topicUrl(topic.slug)))
    .map(topic => topic.slug),
)
</script>

<style scoped>
.topicslayout {
  display: flex;
  /* Fill the space between the 80px header and the 80px footer
     ($headerandfooterheight in styles/settings.scss). */
  min-height: calc(100vh - 160px);
}

.topicsnav {
  flex: 0 0 280px;
  background-color: rgba(255, 255, 255, 0.85);
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.topicscontent {
  flex: 1 1 auto;
  min-width: 0;
}

@media (max-width: 959px) {
  .topicslayout {
    flex-direction: column;
  }

  .topicsnav {
    flex: 0 0 auto;
    border-right: none;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
