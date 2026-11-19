const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
  - '[[System Design]]'
status: evergreen
summary: "Monolithic architecture style with a core system and independent, self-contained plug-ins; strong on cost, simplicity, evolvability and configurability, weak on scalability and fault tolerance."
aliases:
  - Microkernel
  - Plug-in Architecture
  - Plugin Architecture
  - Micro-kernel Architecture
source: '[[Lesson 160 — Microkernel Architecture]]'
created: 2026-10-08
updated: 2026-11-15
review: 2027-12-07
tags:
  - trade_off
---
> [!summary] TL;DR
> A single deployment unit made of a **core system** holding general business rules plus **independent, self-contained plug-ins** that add or customize functionality (IDEs, browsers, CI/CD tools, tax forms, per-jurisdiction claims rules). It fits when most change can be pushed into plug-ins; it struggles with elasticity, scalability and fault tolerance because every request goes through the core (Mark Richards).

## Problem
- A product needs customer-, region- or rule-specific behavior without forking the core for each variation.
- New capabilities must be added or removed without changing and redeploying the core system.

## Solution
- **Monolithic** with modular add-ons; rooted in operating systems; also called the **plug-in architecture**.
- **Plug-ins don't depend on each other.** Shared plug-ins (as in Eclipse) create version dependencies where updating or removing one breaks another.
- **External plug-ins:** JAR, DLL, gem or package, optionally managed by OSGi or Java modularity tools; can be replaced without restarting.
- **Internal plug-ins:** namespaces, packages or directories in one code base; simpler, but any plug-in change redeploys the whole system.
- **Plug-ins as adapters:** in poly-cloud setups the core stays the same while plug-ins abstract Azure, GCP or AWS services.
- **Ratings** (Lesson 160): strong on cost, simplicity, evolvability, interoperability and configurability; three stars for maintainability, testability and deployability (layered one, modular monolith two).
- **Shape** (Lesson 180): one deployment unit with independent add-on plug-ins (can be remote). See [[Architecture Styles Compared]].
- **Integration via adapter plug-ins** (Lesson 113): integration is structurally supported by microkernel but not by layered or modular monolith. Example: an inventory-optimization system with ML analytics in the core over a large database, and adapter plug-ins for the ordering, stock replenishment, reporting dashboard and order archive systems; future integrations are new plug-ins. See [[Cart Before the Horse Anti-Pattern]].
- **Modularity: two stars** (Lesson 196): fine-grained plug-ins, but the core isn't modular. See [[Architectural Modularity]].
- **Event-driven microkernel hybrid** (Lesson 92): the core talks to plug-ins through events and messaging. Gains a star each on deployability, elasticity, evolvability (three to four), performance and scalability; loses on cost (a couple of stars, broker licensing), simplicity and testability (three to two); maintainability unchanged; fault tolerance stays one star because the core is still a single point of failure. See [[Hybrid Architectures]].
- **Microkernel microservices hybrid** (Lesson 92): each plug-in is a separately deployed microservice in a container.
- **Core and examples** (Lesson 89): the core can itself be layered or a modular monolith; plug-ins are added at runtime or compile time. Examples include IntelliJ IDEA, Eclipse, VS Code, Jira, PMD, Jenkins, and tax software where the core is the 1040 and worksheets and forms are plug-ins.

- **What makes it a microkernel** (course: [[7. Understanding Microkernel Architecture Style]]): supporting plug-ins isn't enough. The core must be minimal and stable, holding only general rules, while volatile and custom behavior lives in plug-ins (e.g. claims processing with one plug-in per state's rules). Govern how much change lands in the core. Structurally it is the Template Method pattern at architecture scale, and it counts as technically or domain partitioned depending on whether plug-ins add technical or domain features.
- **Registry and contracts** (course: [[9. Examining Microkernel Architectures]]): the core keeps a plug-in registry and each plug-in implements a contract agreed with the core. Plug-ins can be remote (REST or messaging), which adds latency. Typical examples are IDEs such as Eclipse and linting tools.

## Structure
\`\`\`mermaid
flowchart LR
    P1[Plug-in A] --> C[Core system]
    P2[Plug-in B] --> C
    P3[Plug-in C] --> C
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| Most change is isolated to plug-ins | High elasticity or scalability (the core is a bottleneck) |
| The product has multiple configurations or customizations | Fault tolerance matters (a core crash stops everything) |
| Plug-ins can adapt to differing external services (poly-cloud) | Most change lands in the core (constant full redeploy and retest) |
| End users or third parties add functionality | |
| Tight time or budget for the initial system ([[Monolithic vs Distributed Architecture]]) | |

## Trade-offs
| Pro | Con |
| --- | --- |
| Low cost and simple | All requests flow through one core |
| Evolves by adding plug-ins | Single deployment unit; internal plug-ins force full redeploys |
| Change isolated to a plug-in limits test and deployment scope | Plug-in frameworks (OSGi etc.) add complexity |

## Related patterns
- **Alternatives:** [[Modular Monolith Architecture]]; [[Layered Architecture]]
- **Often combined with:** [[Hybrid Architectures]] (e.g. remote plug-ins as services); [[Architectural Modularity]]
- **Anti-pattern to watch for:** a core that knows about specific plug-ins, or plug-ins that call each other
- **Context:** [[Monolithic vs Distributed Architecture]] · [[Domain to Architecture Isomorphism]] · [[Cart Before the Horse Anti-Pattern]]
- Index: [[Architecture Styles Compared]]. MOC: [[Architecture]]

## Sources
- [[Lesson 160 — Microkernel Architecture]] (Mark Richards, Software Architecture Monday)
- [[Lesson 180 — Domain To Architecture Isomorphism Part 2]] (Mark Richards, Software Architecture Monday): shape of microkernel
- [[Lesson 196 — Modularity and Architectural Styles]] (Mark Richards, Software Architecture Monday): two-star modularity
- [[Lesson 113 — Cart Before The Horse AntiPattern]] (Mark Richards, Software Architecture Monday): plug-ins as integration adapters
- [[Lesson 92 — Understanding Hybrid Architectures]] (Mark Richards, Software Architecture Monday): event-driven microkernel and microkernel microservices hybrids
- [[Lesson 89 — Becoming A Software Architect Part 4]] (Mark Richards, Software Architecture Monday): core options, runtime vs compile-time plug-ins, tool examples
- [[7. Understanding Microkernel Architecture Style]] (O'Reilly Software Architecture course): core vs plug-ins; what qualifies as microkernel
- [[9. Examining Microkernel Architectures]] (O'Reilly Software Architecture course): plug-in registry, contracts, remote plug-ins
`;export{e as default};
