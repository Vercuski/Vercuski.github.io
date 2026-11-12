/**
 * utils/structuredData.ts
 *
 * schema.org JSON-LD for search engines: the site's Person and WebSite
 * entities, breadcrumb trails, and a composable that adds a block to the
 * page <head>. Every page refers to the same Person by its `@id`, so
 * search engines tie the homepage profile and the articles together.
 */
import { useHead } from '@unhead/vue'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { allTopics } from '../data/topics'
import type { Topic } from '../types/topic'
import { SITE_URL, canonicalUrl } from '../site'
import { topicUrl } from './docPaths'

/** `@id` of the site owner's Person entity. */
export const PERSON_ID = `${SITE_URL}/#person`

/** `@id` of the WebSite entity. */
export const WEBSITE_ID = `${SITE_URL}/#website`

/** The site owner, in full. Described once, on the homepage. */
export const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Scott Vercuski',
  url: canonicalUrl('/'),
  image: `${SITE_URL}/images/me.jpg`,
  jobTitle: 'Software & Solution Architect',
  description: 'Software & solution architect with 30+ years across architecture, backend engineering and DevOps, mostly in C#/.NET, SQL and Vue.',
  knowsAbout: [
    'Software architecture',
    'Solution architecture',
    'Software design patterns',
    'Architecture documentation',
    'C#',
    '.NET',
    'SQL Server',
    'Vue.js',
    'DevOps',
  ],
  sameAs: [
    'https://www.linkedin.com/in/scott-vercuski/',
    'https://github.com/Vercuski',
  ],
}

/**
 * A short reference to the site owner for other pages' `author`. It
 * carries the name and URL as well as the `@id`, since search engines
 * don't always follow an `@id` to another page.
 */
export const personRef = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: person.name,
  url: person.url,
}

/** The site itself. */
export const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'Scott Vercuski',
  url: canonicalUrl('/'),
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
}

/** One step in a breadcrumb trail. */
export interface Crumb {
  /** Name shown for the step. */
  name: string
  /** Route path of the step's page, e.g. '/topics/'. */
  path: string
}

/**
 * The breadcrumb trail to a topic: Home, Topics, then the topic's parent
 * topics (whose slugs prefix its own) and the topic itself.
 *
 * @param slug - The topic's slug, e.g. 'solution-architecture/design-checklist'.
 */
export function topicTrail (slug: string): Crumb[] {
  const segments = slug.split('/')
  const topics = segments.map((_, i) => {
    const prefix = segments.slice(0, i + 1).join('/')
    return allTopics.find(topic => topic.slug === prefix)
  }).filter((topic): topic is Topic => !!topic)
  return [
    { name: 'Home', path: '/' },
    { name: 'Topics', path: '/topics/' },
    ...topics.map(topic => ({ name: topic.title, path: topicUrl(topic.slug) })),
  ]
}

/**
 * @param trail - Steps from the homepage to the current page.
 * @returns A schema.org BreadcrumbList for the trail.
 */
export function breadcrumbList (trail: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  }
}

/**
 * Adds a JSON-LD block to the page <head>. Blocks are keyed so a nested
 * component can replace its page's block: a document page's breadcrumb
 * replaces its topic page's.
 *
 * @param key - Identifies the block, e.g. 'breadcrumb'.
 * @param entities - schema.org entities, without `@context`; several go
 *   into one `@graph`.
 */
export function useJsonLd (key: string, entities: MaybeRefOrGetter<object[]>) {
  useHead(() => {
    const list = toValue(entities)
    const data = list.length === 1
      ? { '@context': 'https://schema.org', ...list[0] }
      : { '@context': 'https://schema.org', '@graph': list }
    return {
      script: [{
        key: `jsonld-${key}`,
        type: 'application/ld+json',
        // Keep '</script>' inside a string from ending the tag early.
        innerHTML: JSON.stringify(data).replace(/</g, '\\u003c'),
      }],
    }
  })
}
