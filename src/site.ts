/**
 * site.ts
 *
 * The site's public URL and canonical URL form, shared by the page
 * <head> tags (App.vue) and the build-time sitemap (vite.config.mts) so
 * the two always agree.
 */

/** Public origin of the live site, without a trailing slash. */
export const SITE_URL = 'https://scott.vercuski.com'

/**
 * Contact page delivery (src/pages/Contact.vue) via Web3Forms. The access
 * key is tied to the inbox messages are delivered to, which is set when
 * the key is created at https://web3forms.com, and is safe to publish.
 */
export const CONTACT_FORM = {
  /** Web3Forms access key that routes submissions to the owner's inbox. */
  accessKey: '9e011125-d13e-44ac-98a1-80aba77454cd',
  /** Reply-To address set on every delivered message. */
  replyTo: 'no-reply@scott.vercuski.com',
}

/**
 * Builds the canonical URL of a page. The live host redirects every page
 * URL to lowercase with a trailing slash ('/About' -> '/about/'), so that
 * is the canonical form.
 *
 * @param path - Route path, optionally with a query string or hash.
 * @returns The absolute, lowercase URL with a trailing slash.
 */
export function canonicalUrl (path: string): string {
  const normalized = path.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '')
  return `${SITE_URL}${normalized}/`
}
