/**
 * utils/docPaths.ts
 *
 * URL rules for the documentation sets, kept free of Vite-only APIs so
 * both the app (data/documentation.ts) and the build (vite.config.mts,
 * which lists every document page for prerendering) can use them.
 */

// Document path within its set -> URL segment:
// '00-vision-and-strategy/Business Case.md' -> '00-vision-and-strategy/business-case'
export function docSlug (path: string): string {
  return path
    .replace(/\.md$/i, '')
    .split('/')
    .map(segment => segment.trim().toLowerCase().replace(/\s+/g, '-'))
    .join('/')
}

// The document shown on a set's own page: its README, else the first
// top-level markdown file, else the first one found.
export function pickDefaultDocument (paths: string[]): string | undefined {
  const sorted = [...paths].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  return sorted.find(p => p.toLowerCase() === 'readme.md') ??
    sorted.find(p => !p.includes('/')) ??
    sorted[0]
}

export function topicUrl (topicSlug: string): string {
  return `/topics/${topicSlug}/`
}

// URL of a document page. The set's default document lives at the set's
// own page rather than at a second URL with the same content.
export function docUrl (topicSlug: string, path: string, defaultPath: string | undefined): string {
  return path === defaultPath ? topicUrl(topicSlug) : `${topicUrl(topicSlug)}${docSlug(path)}/`
}
