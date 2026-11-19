const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
  - '[[System Design]]'
status: evergreen
summary: "Single-purpose, separately deployed services that own their data in a bounded context, trading cost, simplicity and performance for agility, scalability and fault tolerance."
aliases:
  - Microservices
  - Microservices Architecture Style
  - Microservice Architecture
  - Share-Nothing Architecture
source: '[[Lesson 162 — Microservices Architecture]]'
created: 2026-10-08
updated: 2026-11-15
review: 2027-10-05
tags:
  - trade_off
---
> [!summary] TL;DR
> Single-purpose functions deployed as separate units of software, each owning its own data. The **bounded context** (service plus its data, sharing nothing) lets each service change independently, giving five-star agility, scalability, elasticity and fault tolerance, at the price of cost, simplicity and inter-service latency.

## Problem
- Many teams working on one large system can't deploy, scale or change a business capability without coordinating with everyone else.
- A shared database couples every part of the system to every schema change.

## Solution
- **Shape:** client requests reach an API layer or gateway that fronts separately deployed services, each owning its data.
- **"Micro" means purpose, not size:** a service is a single-purpose, separately deployed unit that does one thing really well.
- **Data ownership:** each service formally owns the tables it writes to; they can share a schema in a highly reliable database or have a separate physical database, but only the owner reads or writes them.
- **Bounded context / share-nothing:** functionality and data form one unit; other services ask the owner for data through a contract. This exists mainly to facilitate change: a schema change touches only the owner, not hundreds of services querying the table directly.
- **Ratings:** five stars for agility, scalability, elasticity and fault tolerance; mean time to start and recovery in hundreds of milliseconds, so users often don't notice faults. Poor on initial cost and simplicity (the reverse of the monolithic styles).
- **Three kinds of latency** in inter-service calls: network, security (authentication or re-authorization) and data (several database calls per request instead of one query). This is where the performance cost comes from; see [[Architecture Style Risks]] for mitigations.
- **Why two stars for performance** (Lesson 104): about 90% of business microservices systems need east-west communication (request-based data gathering, or workflows like customer registration spanning four to six services). Example figures: network latency from a few ms locally to 300+ ms remote; security re-authorization adding up to hundreds of ms per hop; a seven-table join (~17 ms) in a monolith becomes seven service calls plus in-memory aggregation.
- **Natural fit for the cloud:** on-demand provisioning of services, storage and networks.
- **What sets it apart from other styles** (course: [[10. Examining Microservices Architecture]]): it requires (1) breaking up the database, (2) operational automation, since nobody can monitor and manage hundreds of services by hand, and (3) organizational change to cross-functional teams (see [[Team Topologies]]). A bounded context can be enforced in code (domain bounded context) or physically, by disallowing direct data access so others must ask the owning service (consumer-supplier collaboration). Services can be added as drop-in functionality and retired when no longer needed.

## Structure
\`\`\`mermaid
flowchart TB
    C[Clients] --> GW[API gateway]
    GW --> A[Order service] --> DA[(Order data)]
    GW --> B[Payment service] --> DB[(Payment data)]
    GW --> N[Inventory service] --> DN[(Inventory data)]
    A -. event or contract call .-> B
\`\`\`

## Microservices topics
| Topic | One line | Home note |
| ----- | -------- | --------- |
| Finding service boundaries | Combine function-, data- and request-driven views in a loop (Lesson 38) | [[Identifying Microservices]] · [[Service Granularity]] |
| Service vs microservice | "Service" is generic; a microservice is single-purpose and owns its data (Lesson 134) | [[Service Types by Architecture Style]] |
| Shared data | Sharing data widens the bounded context; keep data services private to it (Lessons 125, 140) | [[Microservices Data Services]] · [[Microservices Annotations and Attributes#Bounded context attribute]] |
| Inter-service communication | The more services call each other, the less reliable and performant the system (Lesson 152) | [[Business Automation Model]] · [[Microservices Communication Protocols]] |
| Integration services | Gateways, orchestrators and aggregators beside functional services (Lessons 43–45) | [[Microservices Gateway Pattern]] · [[Microservices Orchestration Pattern]] · [[Microservices Aggregation Pattern]] |
| Reporting | Event-based push into a reporting database preserves bounded contexts (Lesson 13) | [[Microservices Reporting Patterns]] |
| Migrating | Move functionality first, data once granularity is right (Lesson 42) | [[Deferred Data Migration]] · [[Legacy Migration Approaches]] |
| Contract versioning | Version the contract in the header, not the endpoint, for small changes (Lesson 41) | [[Versioning in Distributed Systems]] |
| Caching | Replicated caching usually fits multi-instance services best (Lesson 80) | [[Caching Topologies]] |
| Governance and documentation | Entry-point attributes for type, domain and sagas (Lesson 107) | [[Microservices Annotations and Attributes]] |
| Structural decay | Count shared libraries, inter-service calls, orchestration, aggregation and database coupling (Lesson 10) | [[Microservices Structural Decay]] · [[Stovepipe Architecture Anti-Pattern]] |
| Events between services | Events don't make it EDA; it's a hybrid (Lesson 131) | [[Microservices vs Event-Driven Architecture]] |
| Vs service-based | Service count forces the database split, DevOps automation and team change (Lesson 114) | [[Microservices vs Service-Based Architecture]] |
| DevOps automation | Required at scale, but can run as a parallel work stream (Lesson 5) | [[Staging Iteration]] |
| Shared code | Replicate, shared library or shared service | [[Code Reuse in Microservices]] |
| Patterns | Gateway, saga, outbox, circuit breaker and more | [[Distributed Systems Pattern Catalog]] |

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| High agility and time-to-market needs | Large monolithic (especially relational) data that can't be split into bounded contexts (consider [[Service-Based Architecture]]) |
| High scalability and elasticity needs | Tight time and budget constraints at startup |
| High fault tolerance needs | Teams organized by technical layers (UI, back end, database, shared services) |
| Cloud-based deployments | Highly semantically coupled functionality: a big ball of distributed mud |

## Trade-offs
| Pro | Con |
| --- | --- |
| Services change, deploy and scale independently | Data must be broken apart into bounded contexts |
| Fault isolation and very fast recovery | Network, security and data latency hurt performance and responsiveness |
| Five-star agility, scalability and elasticity | High initial cost and low simplicity |

## Related patterns
- **Alternatives:** [[Service-Based Architecture]] (coarser services, shared database); [[Modular Monolith Architecture]]; [[Event-Driven Architecture]]
- **Often combined with:** [[Event-Driven Architecture]] (a hybrid, not the same thing); [[Microservices Gateway Pattern]]; [[Transactional Sagas]]; [[Cell-Based Architecture]]; [[Micro-Frontends]]; [[Microservices Architecture Blueprint]]
- **Anti-pattern to watch for:** [[Microservice All the Things Pitfall]]; [[Stovepipe Architecture Anti-Pattern]]; [[Microservices Structural Decay]]
- **Context:** [[Architecture Style Risks]] · [[Domain to Architecture Isomorphism]] · [[Fallacies of Distributed Computing]]
- Index: [[Architecture Styles Compared]]. MOC: [[Architecture]]

## Sources
- [[Lesson 80 — Choosing The Right Caching Topology]] (Mark Richards, Software Architecture Monday): which caching topologies suit microservices
- [[Lesson 162 — Microservices Architecture]] (Mark Richards, Software Architecture Monday): shape, bounded context, star ratings, when to use and avoid, three kinds of latency
- [[Lesson 152 — Modeling Distributed Workflows]] (Mark Richards, Software Architecture Monday): inter-service communication and modeling distributed workflows
- [[Lesson 140 — Governing Data Services]] (Mark Richards, Software Architecture Monday): shared data widens the bounded context; governing data services as private components
- [[Lesson 134 — What is a Service]] (Mark Richards, Software Architecture Monday): service vs microservice; microservice characteristics
- [[Lesson 133 — Stovepipe Architecture AntiPattern]] (Mark Richards, Software Architecture Monday): how microservices erode into a big ball of distributed mud
- [[Lesson 131 — Microservices vs Event-Driven Architecture]] (Mark Richards, Software Architecture Monday): the three constraints that distinguish microservices from event-driven architecture
- [[Lesson 125 — Managing Broad Bounded Contexts]] (Mark Richards, Software Architecture Monday): data domain pattern and broad bounded contexts; tagging services by bounded context
- [[Lesson 114 — Microservices vs. Service Based Architecture]] (Mark Richards, Software Architecture Monday): structural and operational differences from service-based architecture
- [[Lesson 107 — Microservices Annotations and Attributes]] (Mark Richards, Software Architecture Monday): service entry point, type, domain and saga annotations/attributes
- [[Lesson 104 — Architecture Styles FAQ 1]] (Mark Richards, Software Architecture Monday): why microservices rates two stars for performance; latency examples
- [[Lesson 45 — Microservices Gateway Pattern]] (Mark Richards, Software Architecture Monday): gateways as a specialized kind of microservice alongside orchestrators and aggregators
- [[Lesson 44 — Microservices Aggregation Pattern]] (Mark Richards, Software Architecture Monday): aggregators vs orchestrators for requests spanning many services
- [[Lesson 43 — Microservices Orchestration Pattern]] (Mark Richards, Software Architecture Monday): orchestrator microservices vs orchestration in the API gateway
- [[Lesson 42 — Deferred Data Migration]] (Mark Richards, Software Architecture Monday): deferring data migration until service granularity is settled
- [[Lesson 41 — Microservices Contract Versioning]] (Mark Richards, Software Architecture Monday): contract-level versioning and deprecation strategies across services
- [[Lesson 38 — Identifying Microservices]] (Mark Richards, Software Architecture Monday): combining function, data and request views to identify microservices
- [[Lesson 13 — Microservices and Reporting]] (Mark Richards, Software Architecture Monday): reporting patterns across distributed data
- [[Lesson 10 — Analyzing Architecture - Microservices]] (Mark Richards, Software Architecture Monday): macro-level forms of structural decay in microservices
- [[Lesson 5 — Microservices - Reducing Staging Iterations]] (Mark Richards, Software Architecture Monday): why microservices need DevOps automation, and setting it up in parallel
- [[8. Understanding Microservices Architecture Style]] (O'Reilly Software Architecture course): bounded context, data isolation and star ratings
- [[10. Examining Microservices Architecture]] (O'Reilly Software Architecture course): what sets microservices apart; bounded context variants
`;export{e as default};
