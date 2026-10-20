/**
 * data/documentation.ts
 *
 * Indexes the documentation sets under src/assets/documentation (one
 * top-level folder per set, e.g. "Architecture Documentation Example") so
 * the Topics pages can show each set as a file tree and load its markdown.
 *
 * Markdown is loaded lazily (one chunk per file) so the ~1MB of docs isn't
 * part of the main bundle. Non-markdown files (e.g. the templates .zip) are
 * exposed as plain asset URLs so they can be downloaded.
 */

import { docSlug, pickDefaultDocument } from '../utils/docPaths'

const ROOT = '../assets/documentation/'

const markdownLoaders = import.meta.glob<string>(
  '../assets/documentation/**/*.md',
  { query: '?raw', import: 'default' },
)

const fileUrls = import.meta.glob<string>(
  ['../assets/documentation/**/*', '!../assets/documentation/**/*.md'],
  { query: '?url', import: 'default', eager: true },
)

export interface DocNode {
  name: string
  // Path relative to the documentation set's folder, e.g.
  // '01-requirements/business-requirements.md'
  path: string
  type: 'folder' | 'markdown' | 'file'
  // Download URL, for non-markdown files
  url?: string
  children?: DocNode[]
}

// '../assets/documentation/<set>/<path>' -> { set, path }
function splitKey (key: string) {
  const relative = key.slice(ROOT.length)
  const slash = relative.indexOf('/')
  return { set: relative.slice(0, slash), path: relative.slice(slash + 1) }
}

function keyFor (set: string, path: string) {
  return `${ROOT}${set}/${path}`
}

export function hasMarkdown (set: string, path: string): boolean {
  return keyFor(set, path) in markdownLoaders
}

export function loadMarkdown (set: string, path: string): Promise<string> {
  const loader = markdownLoaders[keyFor(set, path)]
  return loader ? loader() : Promise.reject(new Error(`Document not found: ${set}/${path}`))
}

// Folders first, then files; numeric-aware so '2-x' sorts before '10-x'.
function sortNodes (nodes: DocNode[]) {
  nodes.sort((a, b) => {
    if ((a.type === 'folder') !== (b.type === 'folder')) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name, undefined, { numeric: true })
  })
  nodes.forEach(node => node.children && sortNodes(node.children))
  return nodes
}

export function getDocumentationTree (set: string): DocNode[] {
  const root: DocNode[] = []
  const entries = [
    ...Object.keys(markdownLoaders).map(key => ({ key, url: undefined as string | undefined })),
    ...Object.entries(fileUrls).map(([key, url]) => ({ key, url })),
  ]

  for (const { key, url } of entries) {
    const { set: entrySet, path } = splitKey(key)
    if (entrySet !== set) continue

    const segments = path.split('/')
    let level = root
    segments.forEach((segment, i) => {
      const nodePath = segments.slice(0, i + 1).join('/')
      const isLeaf = i === segments.length - 1
      let node = level.find(n => n.path === nodePath)
      if (!node) {
        node = isLeaf
          ? { name: segment, path: nodePath, type: url ? 'file' : 'markdown', url }
          : { name: segment, path: nodePath, type: 'folder', children: [] }
        level.push(node)
      }
      if (!isLeaf) level = node.children!
    })
  }

  return sortNodes(root)
}

function markdownPaths (set: string): string[] {
  return Object.keys(markdownLoaders)
    .map(splitKey)
    .filter(entry => entry.set === set)
    .map(entry => entry.path)
}

// The document shown on the set's own page (see utils/docPaths.ts).
export function defaultDocument (set: string): string | undefined {
  return pickDefaultDocument(markdownPaths(set))
}

// URL segment from a document page's route -> document path.
export function documentForSlug (set: string, slug: string): string | undefined {
  const wanted = slug.toLowerCase()
  return markdownPaths(set).find(path => docSlug(path) === wanted)
}

// Title and description for a document page's <head>.
//   title: the first '# ' heading (else the file name), with template
//          placeholders such as '— {Project Name}' removed
//   description: the front-matter `summary`, else the document's first
//          '> [!summary]' callout, else its first prose paragraph of
//          reasonable length, else `fallback` - trimmed to snippet length
export function documentMeta (path: string, markdown: string, fallback: string) {
  const lines = markdown.split(/\r?\n/)

  // Front matter: from a leading '---' line to the next '---' line.
  let frontMatter: string[] = []
  if (lines[0]?.trim() === '---') {
    const end = lines.indexOf('---', 1)
    if (end > 0) {
      frontMatter = lines.slice(1, end)
      lines.splice(0, end + 1)
    }
  }

  // Drop fenced code blocks (e.g. Mermaid diagrams) before looking for text.
  const body: string[] = []
  let fence: string | undefined
  for (const line of lines) {
    const marker = /^\s*(```|~~~)/.exec(line)?.[1]
    if (marker && (!fence || marker === fence)) {
      fence = fence ? undefined : marker
      continue
    }
    if (!fence) body.push(line)
  }

  const heading = body.find(line => /^#\s+/.test(line))?.replace(/^#\s+/, '')
  const title = withoutPlaceholders(plainText(heading ?? path.split('/').pop()!.replace(/\.md$/i, '')))

  const frontMatterSummary = frontMatter
    .find(line => /^summary:\s*\S/.test(line))
    ?.replace(/^summary:\s*/, '').replace(/^(['"])(.*)\1$/, '$2')

  let calloutSummary: string | undefined
  const calloutStart = body.findIndex(line => /^>\s*\[!summary\]/i.test(line))
  if (calloutStart >= 0) {
    const calloutLines: string[] = []
    for (const line of body.slice(calloutStart + 1)) {
      if (!line.startsWith('>')) break
      calloutLines.push(line.replace(/^>\s?/, ''))
    }
    calloutSummary = calloutLines.join(' ')
  }

  // Paragraphs: runs of plain prose lines (not headings, lists, tables,
  // quotes or HTML), split on blank lines and non-prose lines.
  const paragraphs: string[] = []
  let current: string[] = []
  for (const line of body) {
    const trimmed = line.trim()
    if (!trimmed || /^(#|>|\||[-*+]\s|\d+\.\s|<|---)/.test(trimmed)) {
      if (current.length) paragraphs.push(current.join(' '))
      current = []
    } else {
      current.push(trimmed)
    }
  }
  if (current.length) paragraphs.push(current.join(' '))
  const paragraph = paragraphs.map(plainText).find(text => text.length >= 80 && !/[{}]/.test(text))

  let description = plainText(frontMatterSummary || calloutSummary || paragraph || fallback)
  if (description.length > 160) description = `${description.slice(0, 157).replace(/\s+\S*$/, '')}…`

  return { title, description }
}

// 'Risk Register — {Project Name}' -> 'Risk Register', 'RFC: <Title>' -> 'RFC'
function withoutPlaceholders (title: string) {
  return title
    .replace(/\{[^}]*\}|\\?<[^>]*>/g, '')
    .replace(/[\s—–:-]+$/, '')
    .trim()
}

// Markdown inline syntax -> plain text, for <head> tags.
function plainText (markdown: string) {
  return markdown
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_m, target: string, alias: string) => alias || target)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Resolves an Obsidian-style [[wikilink]] target (a file name without
// extension) to a document, preferring the given set.
export function findDocumentByName (name: string, preferredSet: string) {
  const wanted = `${name.toLowerCase()}.md`
  const matches = Object.keys(markdownLoaders)
    .map(splitKey)
    .filter(entry => entry.path.toLowerCase().split('/').pop() === wanted)
  return matches.find(entry => entry.set === preferredSet) ?? matches[0]
}
