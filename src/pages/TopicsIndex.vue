<template>
  <div class="px-2">
    <p class="text-h6" style="font-weight: bold">Pick a topic from the menu.</p>
    <br/>
    <p>
      Notes and write-ups on the areas I spend most of my time in. Select a
      topic on the left to read more.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'Topics | Scott Vercuski',
  meta: [
    {
      name: 'description',
      content: 'Topics by Scott Vercuski on solution architecture, software architecture, and software design patterns.',
    },
  ],
})
</script>
