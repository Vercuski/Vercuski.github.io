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
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { usePageMeta } from '../composables/usePageMeta'
import { canonicalUrl } from '../site'
import { breadcrumbList, personRef, topicTrail, useJsonLd } from '../utils/structuredData'
import { prepareMarkdown, rehypeCallouts, rehypeMermaid } from '../utils/markdown'
import MermaidDiagram from './MermaidDiagram.vue'

// One rendered document. Its setup awaits the markdown, so it must sit
// inside a <Suspense> (see DocumentationBrowser.vue). That is what puts
// the document's full text into the prerendered HTML: vite-ssg waits for
// it, and the browser hydrates the same content without a loading flash.
const props = defineProps<{
  /** Documentation set folder name. */
  set: string
  /** Path of the document within the set. */
  path: string
  /** Attributes for rendered elements, e.g. link click handlers. */
  customAttrs: CustomAttrs
  /**
   * Set the page <title>/description from the document. Off for a set's
   * own page, which keeps the topic's title and description.
   */
  setPageMeta: boolean
}>()

const remarkPlugins: PluggableList = [remarkGfm]
const rehypePlugins: PluggableList = [rehypeRaw, rehypeSlug, rehypeCallouts, rehypeMermaid]

const source = await loadMarkdown(props.set, props.path)
const markdown = prepareMarkdown(source)

if (props.setPageMeta) {
  const topic = allTopics.find(topic => topic.documentation === props.set)
  const { title, description } = documentMeta(props.path, source, topic?.summary ?? props.set)
  usePageMeta({ title: `${title} | ${props.set} | Scott Vercuski`, description })

  // JSON-LD: the document as a TechArticle by the site owner, and a
  // breadcrumb trail ending at it that replaces its topic page's.
  const route = useRoute()
  const url = canonicalUrl(route.path)
  const dateModified = __DOC_DATES__[`${props.set}/${props.path}`]
  const trail = [...(topic ? topicTrail(topic.slug) : []), { name: title, path: route.path }]
  useJsonLd('breadcrumb', [breadcrumbList(trail)])
  // Link previews: an article rather than the site-wide 'website'.
  useHead({
    meta: [
      { property: 'og:type', content: 'article' },
      ...(dateModified ? [{ property: 'article:modified_time', content: dateModified }] : []),
      { property: 'article:author', content: personRef.url },
    ],
  })
  useJsonLd('page', [{
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    ...(dateModified && { dateModified }),
    author: personRef,
    publisher: personRef,
    isPartOf: { '@type': 'CreativeWorkSeries', name: props.set },
  }])
}
</script>
