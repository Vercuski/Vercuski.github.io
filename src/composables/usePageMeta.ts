/**
 * composables/usePageMeta.ts
 *
 * Sets a page's <title> and description together with the matching Open
 * Graph and Twitter card tags, so link previews (LinkedIn, Slack, X, ...)
 * show the page being shared rather than the homepage. The canonical URL
 * and og:url are set for every page in App.vue.
 */
import { useHead } from '@unhead/vue'
import { toValue, type MaybeRefOrGetter } from 'vue'

/** A page's title and description, as shown in search results and link previews. */
export interface PageMeta {
  /** Full `<title>`, e.g. 'About | Scott Vercuski'. */
  title: string
  /** Summary for the description meta tags, ideally 160 characters or fewer. */
  description: string
}

/**
 * Sets the current page's title, description and matching social card
 * tags. Call from a component's `setup`.
 *
 * @param meta - The values to set, or a ref/getter so they can change
 *   reactively (e.g. a topic page whose title depends on its props).
 */
export function usePageMeta (meta: MaybeRefOrGetter<PageMeta>) {
  useHead(() => {
    const { title, description } = toValue(meta)
    return {
      title,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
    }
  })
}
