/**
 * site.ts
 *
 * The site's public URL and canonical URL form, shared by the page
 * <head> tags (App.vue) and the build-time sitemap (vite.config.mts) so
 * the two always agree.
 */

export const SITE_URL = 'https://scott.vercuski.com'

// Contact page delivery (src/pages/Contact.vue) via Web3Forms. The access
// key is tied to the inbox messages are delivered to, which is set when
// the key is created at https://web3forms.com, and is safe to publish.
export const CONTACT_FORM = {
  accessKey: '9e011125-d13e-44ac-98a1-80aba77454cd',
  replyTo: 'no-reply@scott.vercuski.com',
}

// The live host redirects every page URL to lowercase with a trailing
// slash ('/About' -> '/about/'), so that is the canonical form.
export function canonicalUrl (path: string): string {
  const normalized = path.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '')
  return `${SITE_URL}${normalized}/`
}
