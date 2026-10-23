<template>
  <div class="px-2">
    <h1 class="text-h5" style="font-weight: bold">Topics</h1>
    <br/>
    <p class="text-h6" style="font-weight: bold">Pick a topic from the menu.</p>
    <br/>
    <p>
      Notes and write-ups on the areas I spend most of my time in. Select a
      topic on the left to read more.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { usePageMeta } from '../composables/usePageMeta'

// Shown at /topics/ before a topic is chosen from the navigation.

usePageMeta({
  title: 'Topics | Scott Vercuski',
  description: 'Topics by Scott Vercuski on solution architecture, software architecture, and software design patterns.',
})
</script>
