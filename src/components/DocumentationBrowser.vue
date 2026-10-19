<template>
  <div class="docbrowser">
    <!-- File tree for the documentation set. Markdown files link to
         ?doc=<path>, so a document can be bookmarked and the back button
         works. -->
    <nav class="doctree">
      <v-list
        v-model:opened="openedFolders"
        open-strategy="multiple"
        nav
        density="compact"
        bg-color="transparent"
      >
        <DocumentationTree :nodes="tree" :selected="currentPath" />
      </v-list>
    </nav>

    <article ref="viewer" class="docviewer">
      <div v-if="currentPath" class="text-caption text-medium-emphasis mb-4">{{ currentPath }}</div>
      <div v-if="error" class="text-error">{{ error }}</div>
      <div v-else-if="markdown === null" class="text-medium-emphasis">Loading…</div>
      <VueMarkdown
        v-else
        :key="currentPath"
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
    </article>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { type CustomAttrs, type PluggableList, VueMarkdown } from '@crazydos/vue-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import {
  defaultDocument,
  findDocumentByName,
  getDocumentationTree,
  hasMarkdown,
  loadMarkdown,
} from '../data/documentation'
import { allTopics } from '../data/topics'
import { prepareMarkdown, rehypeCallouts, rehypeMermaid, resolveRelativePath } from '../utils/markdown'

// Name of the folder under src/assets/documentation to show
const props = defineProps<{ set: string }>()

const route = useRoute()
const router = useRouter()

const tree = computed(() => getDocumentationTree(props.set))

const currentPath = computed(() => {
  const doc = route.query.doc
  return typeof doc === 'string' && hasMarkdown(props.set, doc) ? doc : defaultDocument(props.set)
})

// Keep the folders containing the current document open.
const openedFolders = ref<string[]>([])
watch(currentPath, path => {
  if (!path) return
  const segments = path.split('/').slice(0, -1)
  const ancestors = segments.map((_, i) => segments.slice(0, i + 1).join('/'))
  openedFolders.value = [...new Set([...openedFolders.value, ...ancestors])]
}, { immediate: true })

const markdown = ref<string | null>(null)
const error = ref('')
const viewer = ref<HTMLElement>()

const remarkPlugins: PluggableList = [remarkGfm]
const rehypePlugins: PluggableList = [rehypeRaw, rehypeSlug, rehypeCallouts, rehypeMermaid]

// Obsidian heading links ('#Some Heading') -> rehype-slug ids ('some-heading').
function headingId (hash: string) {
  return decodeURIComponent(hash).trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-')
}

function scrollToHeading (hash: string) {
  document.getElementById(headingId(hash))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Route to show `path` from documentation set `set`, which may be on
// another Topics page (e.g. the Example linking to the Templates README).
function documentLocation (set: string, path: string, hash?: string): RouteLocationRaw | undefined {
  const topic = allTopics.find(t => t.documentation === set)
  if (!topic) return undefined
  return { path: `/Topics/${topic.slug}`, query: { doc: path }, hash: hash ? `#${headingId(hash)}` : undefined }
}

function routerLinkAttrs (location: RouteLocationRaw) {
  return {
    href: router.resolve(location).href,
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      e.preventDefault()
      router.push(location)
    },
  }
}

// Links in the markdown: relative .md links and [[wikilinks]] open in this
// viewer, '#heading' links scroll, and external links open in a new tab.
const customAttrs = computed<CustomAttrs>(() => ({
  a: node => {
    const href = String(node.properties?.href ?? '')

    if (href.startsWith('#')) {
      return { onClick: (e: MouseEvent) => { e.preventDefault(); scrollToHeading(href.slice(1)) } }
    }

    if (href.startsWith('wiki:')) {
      const [name, hash] = href.slice('wiki:'.length).split('#')
      const doc = findDocumentByName(name, props.set)
      const location = doc && documentLocation(doc.set, doc.path, hash)
      // Unresolvable wikilinks render as plain text.
      return location ? routerLinkAttrs(location) : { href: undefined }
    }

    if (/^[a-z][a-z\d+.-]*:/i.test(href)) {
      return { target: '_blank', rel: 'noopener noreferrer' }
    }

    const [relative, hash] = href.split('#')
    const path = resolveRelativePath(currentPath.value ?? '', relative)
    const location = hasMarkdown(props.set, path) && documentLocation(props.set, path, hash)
    return location ? routerLinkAttrs(location) : {}
  },
}))

function scrollAfterLoad () {
  if (route.hash) {
    scrollToHeading(route.hash.slice(1))
  } else if (viewer.value && viewer.value.getBoundingClientRect().top < 0) {
    viewer.value.scrollIntoView({ block: 'start' })
  }
}

let loadCount = 0
async function load (path: string | undefined) {
  const thisLoad = ++loadCount
  error.value = ''
  markdown.value = null
  if (!path) {
    error.value = 'This documentation set has no documents.'
    return
  }
  try {
    const content = await loadMarkdown(props.set, path)
    // Ignore a slower earlier load finishing after a newer one.
    if (thisLoad !== loadCount) return
    markdown.value = prepareMarkdown(content)
    await nextTick()
    scrollAfterLoad()
  } catch {
    if (thisLoad === loadCount) error.value = `Couldn't load ${path}.`
  }
}

// Markdown is loaded in the browser only; the prerendered page shows the
// tree and a loading message.
onMounted(() => {
  load(currentPath.value)
  watch(currentPath, path => load(path))
  watch(() => route.hash, hash => hash && scrollToHeading(hash.slice(1)))
})
</script>

<style scoped>
.docbrowser {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.doctree {
  flex: 0 0 320px;
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

.docviewer {
  flex: 1 1 auto;
  min-width: 0;
  padding: 24px 32px;
  background-color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

@media (max-width: 1279px) {
  .docbrowser {
    flex-direction: column;
    align-items: stretch;
  }

  .doctree {
    flex: 0 0 auto;
    position: static;
    max-height: 50vh;
  }

  .docviewer {
    padding: 16px;
  }
}

/* Rendered markdown */
.markdownbody {
  line-height: 1.6;
  overflow-wrap: break-word;
}

.markdownbody :deep(h1),
.markdownbody :deep(h2),
.markdownbody :deep(h3),
.markdownbody :deep(h4) {
  font-weight: bold;
  line-height: 1.3;
  margin: 1.5em 0 0.6em;
  scroll-margin-top: 16px;
}

.markdownbody :deep(h1) { font-size: 2rem; margin-top: 0; }
.markdownbody :deep(h2) { font-size: 1.5rem; border-bottom: 1px solid rgba(0, 0, 0, 0.12); padding-bottom: 0.2em; }
.markdownbody :deep(h3) { font-size: 1.25rem; }
.markdownbody :deep(h4) { font-size: 1.05rem; }

.markdownbody :deep(p),
.markdownbody :deep(ul),
.markdownbody :deep(ol),
.markdownbody :deep(table),
.markdownbody :deep(pre),
.markdownbody :deep(blockquote) {
  margin: 0 0 1em;
}

.markdownbody :deep(ul),
.markdownbody :deep(ol) {
  padding-left: 2em;
}

.markdownbody :deep(a) {
  color: rgb(var(--v-theme-primary));
}

.markdownbody :deep(hr) {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 1.5em 0;
}

.markdownbody :deep(code) {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 0.9em;
  background-color: rgba(0, 0, 0, 0.06);
  padding: 0.1em 0.3em;
  border-radius: 4px;
}

.markdownbody :deep(pre) {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdownbody :deep(pre code) {
  background: none;
  padding: 0;
}

.markdownbody :deep(table) {
  display: block;
  overflow-x: auto;
  border-collapse: collapse;
}

.markdownbody :deep(th),
.markdownbody :deep(td) {
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 6px 12px;
  text-align: left;
  vertical-align: top;
}

.markdownbody :deep(th) {
  background-color: rgba(0, 0, 0, 0.05);
}

.markdownbody :deep(blockquote) {
  border-left: 4px solid rgba(0, 0, 0, 0.2);
  padding: 8px 16px;
  color: rgba(0, 0, 0, 0.75);
}

.markdownbody :deep(blockquote > :last-child) {
  margin-bottom: 0;
}

/* Obsidian callouts (see utils/markdown.ts rehypeCallouts) */
.markdownbody :deep(.callout) {
  --callout-color: 105, 102, 219;
  border-left-color: rgb(var(--callout-color));
  background-color: rgba(var(--callout-color), 0.08);
  border-radius: 4px;
  color: inherit;
}

.markdownbody :deep(.callout-title) {
  font-weight: bold;
  color: rgb(var(--callout-color));
  margin-bottom: 4px;
}

.markdownbody :deep(.callout-warning) { --callout-color: 196, 112, 0; }
.markdownbody :deep(.callout-important) { --callout-color: 179, 38, 30; }
.markdownbody :deep(.callout-tip),
.markdownbody :deep(.callout-check) { --callout-color: 46, 125, 50; }
.markdownbody :deep(.callout-info) { --callout-color: 2, 119, 189; }
</style>
