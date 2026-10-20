/**
 * site.ts
 *
 * The site's public URL and canonical URL form, shared by the page
 * <head> tags (App.vue) and the build-time sitemap (vite.config.mts) so
 * the two always agree.
 */

export const SITE_URL = 'https://scott.vercuski.com'

// The live host redirects every page URL to lowercase with a trailing
// slash ('/About' -> '/about/'), so that is the canonical form.
export function canonicalUrl (path: string): string {
  const normalized = path.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '')
  return `${SITE_URL}${normalized}/`
}
