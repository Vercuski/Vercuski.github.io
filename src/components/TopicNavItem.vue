<template>
  <!-- One entry in the Topics page's left-hand navigation; renders itself
       for sub-topics. Topics with sub-topics still link to their own page,
       and the chevron expands their sub-menu. -->
  <v-list-group v-if="topic.children?.length" :value="topic.slug">
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :to="`/Topics/${topic.slug}`"
        :title="topic.title"
        color="primary"
      />
    </template>
    <TopicNavItem v-for="child in topic.children" :key="child.slug" :topic="child" />
  </v-list-group>
  <v-list-item
    v-else
    :to="`/Topics/${topic.slug}`"
    :title="topic.title"
    color="primary"
  />
</template>

<script lang="ts" setup>
import type { Topic } from '../types/topic'

defineProps<{ topic: Topic }>()
</script>
