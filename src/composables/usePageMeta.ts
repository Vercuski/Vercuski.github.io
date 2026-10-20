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

export interface PageMeta {
  title: string
  description: string
}

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
