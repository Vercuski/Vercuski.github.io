/**
 * utils/markdown.ts
 *
 * Helpers for rendering the Obsidian-authored documentation in
 * src/assets/documentation with @crazydos/vue-markdown: front-matter and
 * [[wikilink]] preprocessing, relative-link resolution, and small rehype
 * plugins for Obsidian callouts and Mermaid code blocks.
 */
import type { Element, ElementContent, Root, RootContent } from 'hast'

// Removes a leading YAML front-matter block.
function stripFrontMatter (markdown: string) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}

// [[target]] / [[target|alias]] / [[target#heading|alias]] ->
// [alias](<wiki:target#heading>), outside fenced and inline code (Mermaid
// node shapes like A[["taps"]] must survive untouched).
function convertWikilinks (markdown: string) {
  let inFence = false
  return markdown.split('\n').map(line => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      return line
    }
    if (inFence) return line
    return line.split(/(`[^`]*`)/).map(part => part.startsWith('`')
      ? part
      : part.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target: string, alias?: string) => {
        const label = alias ?? target.split('#')[0]
        return `[${label}](<wiki:${target.trim()}>)`
      }),
    ).join('')
  }).join('\n')
}

export function prepareMarkdown (markdown: string) {
  return convertWikilinks(stripFrontMatter(markdown))
}

// Resolves a relative link (e.g. '../01-requirements/x.md') against the
// path of the document it appears in. Returns the normalized path.
export function resolveRelativePath (fromPath: string, href: string) {
  const segments = fromPath.split('/').slice(0, -1)
  for (const segment of decodeURI(href).split('/')) {
    if (segment === '..') segments.pop()
    else if (segment !== '.' && segment !== '') segments.push(segment)
  }
  return segments.join('/')
}

function isElement (node: RootContent | ElementContent): node is Element {
  return node.type === 'element'
}

function walk (node: Root | Element, visit: (el: Element, parent: Root | Element, index: number) => void) {
  node.children.forEach((child, index) => {
    if (isElement(child)) {
      visit(child, node, index)
      walk(child, visit)
    }
  })
}

function textOf (node: ElementContent): string {
  if (node.type === 'text') return node.value
  if (node.type === 'element') return node.children.map(textOf).join('')
  return ''
}

// Obsidian callouts: '> [!warning] Title' becomes
// <blockquote class="callout callout-warning"> with a title row.
export function rehypeCallouts () {
  return (tree: Root) => walk(tree, el => {
    if (el.tagName !== 'blockquote') return
    const paragraph = el.children.find(isElement)
    const first = paragraph?.children[0]
    if (!paragraph || paragraph.tagName !== 'p' || first?.type !== 'text') return
    const match = /^\[!(\w+)\][+-]?[ \t]*([^\n]*)\n?/.exec(first.value)
    if (!match) return

    const type = match[1].toLowerCase()
    const title = match[2].trim() || type.charAt(0).toUpperCase() + type.slice(1)
    first.value = first.value.slice(match[0].length)
    if (paragraph.children.every(child => textOf(child).trim() === '')) {
      el.children.splice(el.children.indexOf(paragraph), 1)
    }
    el.properties = { ...el.properties, className: ['callout', `callout-${type}`] }
    el.children.unshift({
      type: 'element',
      tagName: 'div',
      properties: { className: ['callout-title'] },
      children: [{ type: 'text', value: title }],
    })
  })
}

// ```mermaid blocks become <mermaid-diagram code="..."> so the viewer can
// render them through a scoped slot (see components/MermaidDiagram.vue).
export function rehypeMermaid () {
  return (tree: Root) => walk(tree, (el, parent, index) => {
    if (el.tagName !== 'pre') return
    const code = el.children.find(isElement)
    const classes = code?.properties?.className
    if (!code || !Array.isArray(classes) || !classes.includes('language-mermaid')) return
    parent.children[index] = {
      type: 'element',
      tagName: 'mermaid-diagram',
      properties: { code: textOf(code) },
      children: [],
    }
  })
}
