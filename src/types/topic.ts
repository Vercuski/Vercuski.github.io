/**
 * types/topic.ts
 *
 * Shared shape for an entry in the Topics page's left-hand navigation
 * (see pages/Topics.vue). The list itself lives in data/topics.ts so the
 * layout and the detail page read from the same source.
 */
export interface Topic {
  // URL path under /Topics, e.g. 'SolutionArchitecture' or, for a
  // sub-topic, 'SolutionArchitecture/DocumentationAndExample'
  slug: string
  title: string
  summary: string
  // Folder under src/assets/documentation to show as a browsable
  // documentation set on this topic's page
  documentation?: string
  // Sub-topics, shown as a sub-menu under this topic in the navigation
  children?: Topic[]
}
