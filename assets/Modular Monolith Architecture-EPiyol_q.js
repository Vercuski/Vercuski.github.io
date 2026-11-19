const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
  - '[[System Design]]'
status: evergreen
summary: "Monolithic architecture style with one deployment unit whose functionality is grouped by domain area; strong on cost and simplicity, weak on time to market, scalability and fault tolerance."
aliases:
  - Modular Monolith
  - Modular Monolithic Architecture
  - Domain-Partitioned Monolith
source: '[[Lesson 159 — Modular Monolith Architecture]]'
created: 2026-10-08
updated: 2026-11-15
review: 2027-12-08
tags:
  - trade_off
---
> [!summary] TL;DR
> A **single deployment unit** whose code is **partitioned by domain** (inventory, payment and billing), each domain spanning UI through persistence: the layered architecture turned 90 degrees. Cheap and simple, it fits tight budgets, domain-based change and cross-functional teams, but not fast time to market, mostly technical change, or high elasticity, scalability and fault tolerance (Mark Richards, popularized by Simon Brown).

## Problem
- In a layered monolith every domain change cuts across every layer and every team.
- Microservices would give clean domain boundaries, but the team can't yet justify the cost of a distributed system.

## Solution
- **Monolithic and domain-partitioned:** the highest-level namespace or package names the domain; layered puts the technical layer there instead.
- **Fits domain-driven design** and is a good starting point for later migration to a distributed architecture (lesson description).
- **Implementation:** one code base, or each domain in a separate workspace or repository built as a JAR, DLL, package or gem and assembled at deployment (Java modularity/Jigsaw, Penrose, OSGi, Prism for .NET).
- **Ratings** (Lesson 159): cost five stars, simplicity strong; maintainability one star above layered when change is domain based; elasticity, scalability and fault tolerance one star.
- **Team fit:** cross-functional teams with specialization can own a domain change end to end. See [[Architectural Intersections]].
- **Partitioning spectrum** (Lesson 120): sits at the domain-partitioned end with service-based and microservices; namespaces put the domain in the second node (\`app.customer.presentation\`). See [[Domain vs Technical Partitioning]].
- **Modularity:** two stars, coarse-grained domain modules (Lesson 196). See [[Architectural Modularity]].
- **.NET implementation rules:** one schema and DbContext per module, a single public interface plus DTOs, \`internal sealed\` internals, events for side effects, architecture tests in CI, and staged extraction (own host → HTTP → message bus). See [[Modular Monolith Rules in DotNet]].

- **Module governance and drivers** (course: [[8. Examining Modular Monolithic Architectures]]): enforce module boundaries by package or namespace, by build tooling (separate artifacts), or by fitness functions (ArchUnit, NetArchTest). Drivers include agility, deployability, restructurability and the inverse Conway maneuver (see [[Team Topologies]]). Many teams arrive here by migrating from a layered monolith.

## Structure
\`\`\`mermaid
flowchart LR
    subgraph DU[Single deployment unit]
        A[Inventory: UI to persistence]
        B[Payment and billing: UI to persistence]
    end
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| Tight time and budget for the initial system | Fast time to market is required |
| Most change is domain based | Most change is technical (UI replacement, database or business-rule churn) |
| Teams are cross-functional, aligned to domains | High elasticity, scalability or fault tolerance |

## Trade-offs
| Pro | Con |
| --- | --- |
| Low cost, familiar, few moving parts | Single deployment unit limits agility and operational characteristics |
| Domain change is localized to one area and one team | Technical change cuts across every domain |
| Natural fit for DDD and a stepping stone to distributed styles | Module boundaries need discipline (see [[Architecture Styles Compared]]) |

## Related patterns
- **Alternatives:** [[Layered Architecture]] (technically partitioned); [[Service-Based Architecture]] (the next step: separately deployed domain services); [[Microservices Architecture]]
- **Often combined with:** [[Vertical Slice Architecture]] inside each module; [[Modular Monolith Rules in DotNet]]; [[Architectural Modularity]]
- **Anti-pattern to watch for:** [[Big Ball of Mud]] (module boundaries that erode without fitness functions)
- **Context:** [[Domain vs Technical Partitioning]] · [[Monolithic vs Distributed Architecture]] · [[Domain to Architecture Isomorphism]] · [[Architecture Style Risks]] · [[Microkernel Architecture]]
- Index: [[Architecture Styles Compared]]. MOC: [[Architecture]]

## Sources
- [[Lesson 159 — Modular Monolith Architecture]] (Mark Richards, Software Architecture Monday)
- [[Lesson 120 — Domain vs Technical Partitioning]] (domain partitioning spectrum; namespaces)
- [[20 Laws of Modular Monoliths (Anton Martyniuk)]] (Anton Martyniuk, LinkedIn infographic; .NET implementation rules)
- [[6. Understanding Modular Monolith Architecture Style]] (O'Reilly Software Architecture course): domain-grouped single deployment and star ratings
- [[8. Examining Modular Monolithic Architectures]] (O'Reilly Software Architecture course): module governance and drivers
`;export{e as default};
