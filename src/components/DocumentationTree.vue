<template>
  <!-- One level of the documentation tree; renders itself for sub-folders.
       Must be used inside a <v-list> (see DocumentationBrowser.vue). -->
  <template v-for="node in nodes" :key="node.path">
    <v-list-group v-if="node.type === 'folder'" :value="node.path">
      <template #activator="{ props: activatorProps, isOpen }">
        <v-list-item
          v-bind="activatorProps"
          :prepend-icon="isOpen ? mdiFolderOpenOutline : mdiFolderOutline"
          :title="node.name"
        />
      </template>
      <DocumentationTree :nodes="node.children ?? []" :selected="selected" :link-for="linkFor" />
    </v-list-group>
    <!-- exact: otherwise Vuetify treats every document link as active
         (they share one route) and expands each one's folder on load. -->
    <v-list-item
      v-else-if="node.type === 'markdown'"
      :to="linkFor(node.path)"
      exact
      :active="node.path === selected"
      :prepend-icon="mdiFileDocumentOutline"
      :title="displayName(node.name)"
      color="primary"
    />
    <v-list-item
      v-else
      :href="node.url"
      :prepend-icon="mdiDownload"
      :title="node.name"
      download
    />
  </template>
</template>

<script lang="ts" setup>
import { mdiDownload, mdiFileDocumentOutline, mdiFolderOpenOutline, mdiFolderOutline } from '@mdi/js'
import type { DocNode } from '../data/documentation'

defineProps<{
  nodes: DocNode[]
  // Path of the document currently shown
  selected?: string
  // URL of a document's page
  linkFor: (path: string) => string | undefined
}>()

function displayName (name: string) {
  return name.replace(/\.md$/i, '')
}
</script>
