<template>
  <div class="docbrowser">
    <!-- File tree for the documentation set. Each document has its own
         prerendered page, so the tree is made of ordinary links that
         search engines can follow. -->
    <nav class="doctree" aria-label="Documents">
      <v-list
        v-model:opened="openedFolders"
        open-strategy="multiple"
        nav
        density="compact"
        bg-color="transparent"
      >
        <DocumentationTree :nodes="tree" :selected="currentPath" :link-for="path => urlFor(set, path)" />
      </v-list>
    </nav>

    <article ref="viewer" class="docviewer">
      <div v-if="currentPath" class="text-caption text-medium-emphasis mb-4">{{ currentPath }}</div>
      <div v-if="error" class="text-error">{{ error }}</div>
      <Suspense v-else-if="currentPath" @resolve="onDocumentShown">
        <DocumentView
          :key="currentPath"
          :set="set"
          :path="currentPath"
          :custom-attrs="customAttrs"
          :set-page-meta="!!doc"
        />
        <template #fallback>
          <div class="text-medium-emphasis">Loading…</div>
        </template>
      </Suspense>
    </article>
  </div>
</template>

<script lang="ts" setup>
import { computed, onErrorCaptured, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CustomAttrs } from '@crazydos/vue-markdown'
import {
  defaultDocument,
  documentForSlug,
  findDocumentByName,
  getDocumentationTree,
  hasMarkdown,
} from '../data/documentation'
import { allTopics } from '../data/topics'
import { docUrl } from '../utils/docPaths'
import { resolveRelativePath } from '../utils/markdown'
import DocumentView from './DocumentView.vue'

// A documentation set's file tree beside the current document, with the
// markdown's links wired up to the site's document pages.
const props = defineProps<{
  /** Name of the folder under src/assets/documentation to show. */
  set: string
  /**
   * Document URL segment from the route (see router/index.ts); omitted on
   * the set's own page, which shows its default document.
   */
  doc?: string
}>()

const route = useRoute()
const router = useRouter()

const tree = computed(() => getDocumentationTree(props.set))

const currentPath = computed(() => props.doc ? documentForSlug(props.set, props.doc) : defaultDocument(props.set))

const error = ref('')
watch(currentPath, path => {
  error.value = path ? '' : props.doc ? 'Document not found.' : 'This documentation set has no documents.'
}, { immediate: true })

onErrorCaptured(() => {
  error.value = `Couldn't load ${currentPath.value}.`
  return false
})

// Keep the folders containing the current document open.
const openedFolders = ref<string[]>([])
watch(currentPath, path => {
  if (!path) return
  const segments = path.split('/').slice(0, -1)
  const ancestors = segments.map((_, i) => segments.slice(0, i + 1).join('/'))
  openedFolders.value = [...new Set([...openedFolders.value, ...ancestors])]
}, { immediate: true })

const viewer = ref<HTMLElement>()

/**
 * Converts an Obsidian heading link to the id rehype-slug gives that
 * heading: '#Some Heading' -> 'some-heading'.
 *
 * @param hash - The link's fragment, without the '#'.
 */
function headingId (hash: string) {
  return decodeURIComponent(hash).trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-')
}

/**
 * Smoothly scrolls the heading a fragment points at into view, if present.
 *
 * @param hash - The link's fragment, without the '#'.
 */
function scrollToHeading (hash: string) {
  document.getElementById(headingId(hash))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Builds the URL of document `path` from documentation set `set`, which
 * may be on another Topics page (e.g. the Example linking to the
 * Templates README).
 *
 * @param set - Documentation set folder name.
 * @param path - Path of the document within the set.
 * @param hash - Optional heading to link to.
 * @returns The URL, or `undefined` if no topic shows that set.
 */
function urlFor (set: string, path: string, hash?: string): string | undefined {
  const topic = allTopics.find(t => t.documentation === set)
  if (!topic) return undefined
  return docUrl(topic.slug, path, defaultDocument(set)) + (hash ? `#${headingId(hash)}` : '')
}

/**
 * Attributes that make a rendered `<a>` behave like a router-link: a real
 * href for crawlers and new tabs, client-side navigation on a plain click.
 *
 * @param url - The site URL to link to.
 */
function routerLinkAttrs (url: string) {
  return {
    href: url,
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      e.preventDefault()
      router.push(url)
    },
  }
}

// Links in the markdown: relative .md links and [[wikilinks]] go to that
// document's page, '#heading' links scroll, and external links open in a
// new tab.
const customAttrs = computed<CustomAttrs>(() => ({
  a: node => {
    const href = String(node.properties?.href ?? '')

    if (href.startsWith('#')) {
      return { onClick: (e: MouseEvent) => { e.preventDefault(); scrollToHeading(href.slice(1)) } }
    }

    if (href.startsWith('wiki:')) {
      const [name, hash] = href.slice('wiki:'.length).split('#')
      const doc = findDocumentByName(name, props.set)
      const url = doc && urlFor(doc.set, doc.path, hash)
      // Unresolvable wikilinks render as plain text.
      return url ? routerLinkAttrs(url) : { href: undefined }
    }

    if (/^[a-z][a-z\d+.-]*:/i.test(href)) {
      return { target: '_blank', rel: 'noopener noreferrer' }
    }

    const [relative, hash] = href.split('#')
    const path = resolveRelativePath(currentPath.value ?? '', relative)
    const url = hasMarkdown(props.set, path) && urlFor(props.set, path, hash)
    return url ? routerLinkAttrs(url) : {}
  },
}))

let firstDocument = true
/**
 * Runs after a document is shown: goes to the linked heading, or brings
 * the top of the document into view if the reader had scrolled past it.
 */
function onDocumentShown () {
  if (route.hash) {
    scrollToHeading(route.hash.slice(1))
  } else if (!firstDocument && viewer.value && viewer.value.getBoundingClientRect().top < 0) {
    viewer.value.scrollIntoView({ block: 'start' })
  }
  firstDocument = false
}

onMounted(() => {
  // Documents used to be addressed as ?doc=<path>; send those links to
  // the document's own page.
  const legacy = route.query.doc
  if (typeof legacy === 'string' && hasMarkdown(props.set, legacy)) {
    const url = urlFor(props.set, legacy)
    if (url) router.replace(url)
  }
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
