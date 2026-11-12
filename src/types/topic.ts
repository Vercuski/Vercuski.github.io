/**
 * types/topic.ts
 *
 * Shared shape for an entry in the Topics page's left-hand navigation
 * (see pages/Topics.vue). The list itself lives in data/topics.ts so the
 * layout and the detail page read from the same source.
 */
export interface Topic {
  /**
   * URL path under /topics/ (lowercase, hyphenated), e.g.
   * 'solution-architecture' or, for a sub-topic,
   * 'solution-architecture/documentation-and-example'.
   */
  slug: string
  /** Name shown in the navigation and as the page heading. */
  title: string
  /** One or two sentences shown on the page and used as its meta description. */
  summary: string
  /**
   * Folder under src/assets/documentation to show as a browsable
   * documentation set on this topic's page.
   */
  documentation?: string
  /**
   * Hide the `documentation` set's document list (or, for a single
   * document, its download link). The set's
   * other document pages show a link back to this topic's page and the
   * document's name instead.
   */
  hideDocumentList?: boolean
  /**
   * Another topic whose documentation set has a matching document at the
   * same path (e.g. a blank template and its filled-in example). Each
   * document page links to its counterpart there.
   */
  companion?: {
    /** Slug of the companion topic. */
    slug: string
    /** Heading of the link box, e.g. 'See this template filled in'. */
    label: string
  }
  /** Sub-topics, shown as a sub-menu under this topic in the navigation. */
  children?: Topic[]
}
