/**
 * data/topics.ts
 *
 * The topics shown in the Topics page's left-hand navigation. Adding a
 * topic here adds both its nav link and its /topics/<slug>/ route
 * (see router/index.ts). Sub-topics go in a topic's `children` and show
 * as a sub-menu under it.
 */
import type { Topic } from '../types/topic'

/** Top-level topics, in navigation order, with their sub-topics nested. */
export const topics: Topic[] = [
  {
    slug: 'solution-architecture',
    title: 'Solution Architecture',
    summary: 'How systems, services, and platforms fit together to solve a business problem end to end.',
    children: [
      {
        slug: 'solution-architecture/design-checklist',
        title: 'Design Checklist',
        summary: 'Questions to work through before and during solution design: business context, constraints, quality attributes, data, integration and operations, then decisions, boundaries, risk, validation and evolution.',
        documentation: 'Solution Architecture Design Checklist',
      },
      {
        slug: 'solution-architecture/documentation-and-example',
        title: 'Documentation and Example',
        summary: 'How to document a solution architecture, with a worked example.',
        children: [
          {
            slug: 'solution-architecture/documentation-and-example/example',
            title: 'Example',
            summary: 'Every template filled in for Project Tapline, a fictional program in which a regional transit agency replaces its legacy smart-card fare system with an account-based fare platform on .NET and Azure.',
            documentation: 'Architecture Documentation Example',
            companion: {
              slug: 'solution-architecture/documentation-and-example/templates',
              label: 'Start from the blank template',
            },
          },
          {
            slug: 'solution-architecture/documentation-and-example/templates',
            title: 'Templates',
            summary: 'A library of 50 architecture documentation templates in 12 folders, organized by phase of the architecture lifecycle: vision, requirements, design, decisions, governance, operations, migration, validation and handover.',
            documentation: 'Architecture Documentation Templates',
            companion: {
              slug: 'solution-architecture/documentation-and-example/example',
              label: 'See this template filled in for Project Tapline',
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'software-architecture',
    title: 'Software Architecture',
    summary: 'The high-level structure of an application: its layers, boundaries, and the trade-offs behind them.',
    children: [
      {
        slug: 'software-architecture/architecture-styles',
        title: 'Architecture Styles',
        summary: 'Common software architecture styles, from monoliths and layers to microservices, event-driven and serverless: how each is shaped, when it fits, and what it costs.',
        children: architectureStyles(),
      },
    ],
  },
  {
    slug: 'software-design-patterns',
    title: 'Software Design Patterns',
    summary: 'Reusable solutions to common problems in object-oriented and application design.',
    children: [
      {
        slug: 'software-design-patterns/patterns-and-anti-patterns',
        title: 'Patterns & Anti-Patterns',
        summary: 'A catalog of classic design patterns grouped as creational, structural, behavioral and concurrency, followed by named anti-patterns: generic, object-oriented, programming, methodological, configuration management and architecture.',
        documentation: 'Software Design Patterns & Anti Patterns',
        hideDocumentList: true,
      },
    ],
  },
]

/**
 * The Architecture Styles sub-topics, in the order of the "The styles"
 * table in the Architecture Styles Compared note. Each shows the
 * documentation set (a folder under src/assets/documentation) holding
 * that style's single note.
 *
 * @returns One topic per style.
 */
function architectureStyles (): Topic[] {
  const styles: Array<[slug: string, title: string, documentation: string, summary: string]> = [
    ['monolithic', 'Monolithic', 'Monolithic Architecture', 'The whole application is built, deployed and scaled as one unit. Simple and cheap to start; layered, modular monolith, microkernel and pipeline are its structured forms.'],
    ['client-server', 'Client-Server', 'Client-Server Architecture', 'Clients request services; servers own the resources and answer. The base topology under the web, databases and most APIs, from two-tier fat clients to N-tier.'],
    ['layered', 'Layered (N-Tier)', 'Layered Architecture', 'Monolithic style, one deployment unit grouped by technical layer (presentation, business, persistence); strong on cost and simplicity, weak on agility, scale and fault tolerance.'],
    ['modular-monolith', 'Modular Monolith', 'Modular Monolith Architecture', 'Monolithic architecture style with one deployment unit whose functionality is grouped by domain area; strong on cost and simplicity, weak on time to market, scalability and fault tolerance.'],
    ['microkernel', 'Microkernel (Plug-In)', 'Microkernel Architecture', 'Monolithic architecture style with a core system and independent, self-contained plug-ins; strong on cost, simplicity, evolvability and configurability, weak on scalability and fault tolerance.'],
    ['pipeline', 'Pipeline (Pipes and Filters)', 'Pipes and Filters Architecture', 'Pipeline style: self-contained filters each transform data and pass it along pipes, so processing is a chain of reusable, independently testable steps. Technically partitioned.'],
    ['hexagonal', 'Hexagonal', 'Hexagonal Architecture', 'Ports and Adapters: the application core exposes ports (interfaces); adapters connect UIs, databases and external systems, so the core runs and tests with no infrastructure.'],
    ['onion', 'Onion', 'Onion Architecture', "Jeffrey Palermo's style: concentric layers around an independent domain model, with every dependency pointing toward the center and infrastructure pushed to the outer ring."],
    ['clean', 'Clean', 'Clean Architecture', "Clean Architecture keeps business rules at the center with dependencies pointing inward; in .NET that's Domain ← Application ← Infrastructure and Presentation projects."],
    ['vertical-slice', 'Vertical Slice', 'Vertical Slice Architecture', 'Organize code by feature, not layer: each request\'s endpoint, handler, mapping and validation live in one slice; add Domain and Infrastructure projects only when needed.'],
    ['service-based', 'Service-Based', 'Service-Based Architecture', 'Distributed architecture style of coarse-grained domain services that usually share one database; a common stepping stone before microservices.'],
    ['service-oriented', 'Service-Oriented (SOA)', 'Service-Oriented Architecture', 'Shares core functionality across enterprise systems via a strict service taxonomy and an enterprise service bus, trading cost, agility and performance for interoperability.'],
    ['microservices', 'Microservices', 'Microservices Architecture', 'Single-purpose, separately deployed services that own their data in a bounded context, trading cost, simplicity and performance for agility, scalability and fault tolerance.'],
    ['event-driven', 'Event-Driven', 'Event-Driven Architecture', "Services react asynchronously to an initiating event and to each other's derived events via a simple broker, trading simplicity and consistency for performance and scalability."],
    ['space-based', 'Space-Based', 'Space-Based Architecture', 'Distributed architecture style that keeps all transactional data in replicated in-memory caches and writes to the database asynchronously, for the highest elasticity, scalability and performance.'],
    ['serverless', 'Serverless', 'Serverless Architecture', "Event-triggered functions and managed services run on the provider's infrastructure, scale to zero and bill per execution; you trade control and cold starts for no server management."],
    ['peer-to-peer', 'Peer-to-Peer', 'Peer-to-Peer Architecture', 'Every node is both client and server; peers share resources directly with no central authority. Scales with its users and resists single points of failure, at the cost of control.'],
    ['primary-replica', 'Primary-Replica (Master-Worker)', 'Primary-Replica Architecture', 'One coordinator (master/primary/leader) distributes work or writes to identical subordinates (replicas/workers) and owns the authoritative result or state.'],
  ]
  return styles.map(([slug, title, documentation, summary]) => ({
    slug: `software-architecture/architecture-styles/${slug}`,
    title,
    summary,
    documentation,
  }))
}

/**
 * @param list - Topics, possibly with nested `children`.
 * @returns Each topic followed by its sub-topics, depth first.
 */
function flatten (list: Topic[]): Topic[] {
  return list.flatMap(topic => [topic, ...flatten(topic.children ?? [])])
}

/**
 * Every topic and sub-topic (at any depth) in one flat list, for building
 * routes and looking a topic up by slug.
 */
export const allTopics: Topic[] = flatten(topics)
