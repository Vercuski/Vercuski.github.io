/**
 * data/topics.ts
 *
 * The topics shown in the Topics page's left-hand navigation. Adding a
 * topic here adds both its nav link and its /topics/<slug>/ route
 * (see router/index.ts). Sub-topics go in a topic's `children` and show
 * as a sub-menu under it.
 */
import type { Topic } from '../types/topic'

export const topics: Topic[] = [
  {
    slug: 'solution-architecture',
    title: 'Solution Architecture',
    summary: 'How systems, services, and platforms fit together to solve a business problem end to end.',
    children: [
      {
        slug: 'solution-architecture/documentation-and-example',
        title: 'Documentation and Example',
        summary: 'How to document a solution architecture, with a worked example.',
        children: [
          {
            slug: 'solution-architecture/documentation-and-example/templates',
            title: 'Templates',
            summary: 'A library of 50 architecture documentation templates in 12 folders, organized by phase of the architecture lifecycle: vision, requirements, design, decisions, governance, operations, migration, validation and handover.',
            documentation: 'Architecture Documentation Templates',
          },
          {
            slug: 'solution-architecture/documentation-and-example/example',
            title: 'Example',
            summary: 'Every template filled in for Project Tapline, a fictional program in which a regional transit agency replaces its legacy smart-card fare system with an account-based fare platform on .NET and Azure.',
            documentation: 'Architecture Documentation Example',
          },
        ],
      },
    ],
  },
  {
    slug: 'software-architecture',
    title: 'Software Architecture',
    summary: 'The high-level structure of an application: its layers, boundaries, and the trade-offs behind them.',
  },
  {
    slug: 'software-design-patterns',
    title: 'Software Design Patterns',
    summary: 'Reusable solutions to common problems in object-oriented and application design.',
  },
]

// Every topic and sub-topic (at any depth) in one flat list, for building
// routes and looking a topic up by slug.
function flatten (list: Topic[]): Topic[] {
  return list.flatMap(topic => [topic, ...flatten(topic.children ?? [])])
}

export const allTopics: Topic[] = flatten(topics)
