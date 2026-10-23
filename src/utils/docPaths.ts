/**
 * utils/docPaths.ts
 *
 * URL rules for the documentation sets, kept free of Vite-only APIs so
 * both the app (data/documentation.ts) and the build (vite.config.mts,
 * which lists every document page for prerendering) can use them.
 */

/**
 * Converts a document path within its set to its URL segment:
 * '00-vision-and-strategy/Business Case.md' -> '00-vision-and-strategy/business-case'.
 *
 * @param path - Path of the markdown file relative to its documentation set.
 * @returns The lowercase, hyphenated path without the `.md` extension.
 */
export function docSlug (path: string): string {
  return path
    .replace(/\.md$/i, '')
    .split('/')
    .map(segment => segment.trim().toLowerCase().replace(/\s+/g, '-'))
    .join('/')
}

/**
 * Picks the document shown on a set's own page: its README, else the
 * first top-level markdown file, else the first one found.
 *
 * @param paths - Every markdown path in the set.
 * @returns The chosen path, or `undefined` for an empty set.
 */
export function pickDefaultDocument (paths: string[]): string | undefined {
  const sorted = [...paths].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  return sorted.find(p => p.toLowerCase() === 'readme.md') ??
    sorted.find(p => !p.includes('/')) ??
    sorted[0]
}

/**
 * @param topicSlug - A topic's slug, e.g. 'solution-architecture'.
 * @returns The topic page's URL, e.g. '/topics/solution-architecture/'.
 */
export function topicUrl (topicSlug: string): string {
  return `/topics/${topicSlug}/`
}

/**
 * Builds the URL of a document page. The set's default document lives at
 * the set's own page rather than at a second URL with the same content.
 *
 * @param topicSlug - Slug of the topic that shows the documentation set.
 * @param path - Path of the document within the set.
 * @param defaultPath - The set's default document (see {@link pickDefaultDocument}).
 * @returns The page URL, with a trailing slash.
 */
export function docUrl (topicSlug: string, path: string, defaultPath: string | undefined): string {
  return path === defaultPath ? topicUrl(topicSlug) : `${topicUrl(topicSlug)}${docSlug(path)}/`
}
