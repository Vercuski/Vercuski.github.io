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
import { defaultDocument, documentMeta, frontMatterField, hasMarkdown, loadMarkdown } from '../data/documentation'
import { docUrl } from '../utils/docPaths'
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
const topic = allTopics.find(topic => topic.documentation === props.set)
const { title, description } = documentMeta(props.path, source, topic?.summary ?? props.set)
const markdown = withIntro(prepareMarkdown(source), introCallouts())

/**
 * Callouts shown under the document's title: its front-matter `about`
 * note on when to use it, and a link to the matching document in the
 * companion topic's set (a template's filled-in example, or the reverse).
 *
 * @returns Markdown for the callouts, or '' if there are none.
 */
function introCallouts (): string {
  const callouts: string[] = []

  const about = frontMatterField(source, 'about')
  if (about) callouts.push(`> [!info] When to use it\n> ${about}`)

  const companion = topic?.companion && allTopics.find(t => t.slug === topic.companion!.slug)
  if (companion?.documentation && hasMarkdown(companion.documentation, props.path)) {
    const url = docUrl(companion.slug, props.path, defaultDocument(companion.documentation))
    callouts.push(`> [!tip] ${topic!.companion!.label}\n> [${title} →](${url})`)
  }

  return callouts.join('\n\n')
}

/**
 * Inserts `intro` after the document's first top-level heading (outside
 * code fences), or at the top if it has none.
 *
 * @param doc - Prepared markdown.
 * @param intro - Markdown to insert.
 */
function withIntro (doc: string, intro: string): string {
  if (!intro) return doc
  const lines = doc.split('\n')
  let inFence = false
  const heading = lines.findIndex(line => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    return !inFence && /^#\s/.test(line)
  })
  lines.splice(heading + 1, 0, '', intro, '')
  return lines.join('\n')
}

if (props.setPageMeta) {
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
