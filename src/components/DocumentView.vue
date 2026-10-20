<template>
  <VueMarkdown
    class="markdownbody"
    :markdown="markdown"
    :remark-plugins="remarkPlugins"
    :rehype-plugins="rehypePlugins"
    :custom-attrs="customAttrs"
  >
    <template #mermaid-diagram="{ code }">
      <MermaidDiagram :code="code" />
    </template>
  </VueMarkdown>
</template>

<script lang="ts" setup>
import { type CustomAttrs, type PluggableList, VueMarkdown } from '@crazydos/vue-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { documentMeta, loadMarkdown } from '../data/documentation'
import { allTopics } from '../data/topics'
import { usePageMeta } from '../composables/usePageMeta'
import { prepareMarkdown, rehypeCallouts, rehypeMermaid } from '../utils/markdown'
import MermaidDiagram from './MermaidDiagram.vue'

// One rendered document. Its setup awaits the markdown, so it must sit
// inside a <Suspense> (see DocumentationBrowser.vue). That is what puts
// the document's full text into the prerendered HTML: vite-ssg waits for
// it, and the browser hydrates the same content without a loading flash.
const props = defineProps<{
  set: string
  path: string
  customAttrs: CustomAttrs
  // Set the page <title>/description from the document. Off for a set's
  // own page, which keeps the topic's title and description.
  setPageMeta: boolean
}>()

const remarkPlugins: PluggableList = [remarkGfm]
const rehypePlugins: PluggableList = [rehypeRaw, rehypeSlug, rehypeCallouts, rehypeMermaid]

const source = await loadMarkdown(props.set, props.path)
const markdown = prepareMarkdown(source)

if (props.setPageMeta) {
  const setSummary = allTopics.find(topic => topic.documentation === props.set)?.summary ?? props.set
  const { title, description } = documentMeta(props.path, source, setSummary)
  usePageMeta({ title: `${title} | ${props.set} | Scott Vercuski`, description })
}
</script>
