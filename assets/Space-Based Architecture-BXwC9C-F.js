const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
  - '[[System Design]]'
status: draft
summary: "Distributed architecture style that keeps all transactional data in replicated in-memory caches and writes to the database asynchronously, for the highest elasticity, scalability and performance."
aliases:
  - Space-Based
  - Space Based Architecture
  - SBA
  - Tuple Space Architecture
source: '[[Lesson 166 — Space Based Architecture]]'
created: 2026-10-07
updated: 2026-11-15
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Named after **tuple space** (parallel processors with shared memory), this style caches all transactional data in an in-memory data grid so processing units never touch the database during a transaction. Updates replicate across instances and flow asynchronously to the database through a queue and data writer. It buys the highest elasticity, scalability and performance at the price of complexity, cost, agility and consistency.

## Problem
- Extreme, unpredictable concurrent load (ticket sales, auctions) overwhelms a central database long before the application servers.
- Scaling out the web and application tiers just moves the bottleneck to the database.

## Solution
- **Processing units:** services (or, in early implementations, the whole application) running as multiple instances on separate servers; they hold no database connections, so they start very quickly.
- **In-memory data grid:** usually a replicated cache (Hazelcast, Coherence, Ignite, GemFire, Infinispan) that copies each update to all same-named caches within about a tenth to a hundredth of a second.
- **Data writer:** the receiving unit sends the change fire-and-forget to a queue or stream; a data writer (service, application or data hub) persists it, so the database is eventually consistent.
- **Data reader:** loads data from the database on cold start or for archived data, then the cache is replicated to the other instances.
- **Deployment manager:** virtualized middleware spins processing units up and down, which suits cloud deployments (not required, though).
- Historically called a **domain-specific** style by Mark Richards and Neal Ford: its sweet spot is high performance, high scalability and the highest elasticity.
- **Shape** (Lesson 180): all transactional data cached in memory; database removed from the transactional path. See [[Architecture Styles Compared]].
- **Modularity: three stars** (Lesson 196): processing units of variable granularity, technically partitioned. See [[Architectural Modularity]].
- **Why it maximizes scalability and elasticity** (Lesson 85): the database, the ultimate constraint, is out of the transaction path, so only the application in memory scales. Mean time to startup is milliseconds; it is limited only by connecting to the broker for the data pump and by the initial cache load (new instances load from other instances' grids, the first one from a data reader), so keep at least one instance of each processing unit running. See [[Elasticity]].
- **Highest performance and responsiveness** (Lesson 83): the name comes from *tuple space* (multiple parallel processors with shared memory); load-balanced processing units hold data in memory, so data access takes nanoseconds rather than database round trips. See [[Performance vs Responsiveness]].

## Structure
\`\`\`mermaid
flowchart LR
    PU1[Processing unit] <-- replicate --> PU2[Processing unit]
    PU1 -- async --> Q[(Queue)] --> DW[Data writer] --> DB[(Database)]
    DB --> DR[Data reader] --> PU1
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| Extreme, sudden swings in load (e.g. 20 to 200,000 users in milliseconds) | Agility or low cost matter |
| Very high concurrency (more users than database connections) | Transactional data is too large for memory (e.g. 10 TB) |
| High performance (in-memory reads and writes) | Initial time and budget are tight |
| | Strong data synchronization and consistency is required |

## Trade-offs
| Pro | Con |
| --- | --- |
| Highest elasticity; units start fast without DB connections | Probably the most technically complex style |
| Very high scalability without matching database connections | Poor agility, high cost |
| Nanosecond-scale in-memory data access | Database only eventually consistent; replicated caches risk [[Replicated Cache Data Collisions]] |

## Related patterns
- **Alternatives:** [[Event-Driven Architecture]]; [[Service-Based Architecture]]; [[Shared-Nothing Architecture]]
- **Often combined with:** [[Caching Concepts]]; [[Replicated Cache Data Collisions]] (the risk to manage)
- **Anti-pattern to watch for:** applying it to low-volume CRUD, where it adds cost and complexity for no gain
- **Context:** [[Scalability]] · [[Architectural Modularity]] · [[Performance vs Responsiveness]]
- Index: [[Architecture Styles Compared]]. MOC: [[Architecture]]

## Sources
- [[Lesson 166 — Space Based Architecture]] (Mark Richards, Software Architecture Monday)
- [[Lesson 180 — Domain To Architecture Isomorphism Part 2]] (Mark Richards, Software Architecture Monday): shape of space-based
- [[Lesson 196 — Modularity and Architectural Styles]] (Mark Richards, Software Architecture Monday): three-star modularity
- [[Lesson 85 — Defining Scalability and Elasticity]] (Mark Richards, Software Architecture Monday): scalability, elasticity and mean time to startup
- [[Lesson 83 — Defining Performance and Responsiveness]] (Mark Richards, Software Architecture Monday): highest performance and responsiveness through in-memory data
- [[10. Understanding Space-Based Architecture Style]] (O'Reilly Software Architecture course): tuple space, in-memory data grid, data pumps
- [[12. Examining Space-Based Architectures]] (O'Reilly Software Architecture course): cache-based processing, crash recovery, use cases
`;export{e as default};
