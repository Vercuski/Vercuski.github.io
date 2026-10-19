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

// The document shown when a set is opened with nothing selected: its
// README, else the first top-level markdown file, else the first one found.
export function defaultDocument (set: string): string | undefined {
  const paths = Object.keys(markdownLoaders)
    .map(splitKey)
    .filter(entry => entry.set === set)
    .map(entry => entry.path)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  return paths.find(p => p.toLowerCase() === 'readme.md') ??
    paths.find(p => !p.includes('/')) ??
    paths[0]
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
