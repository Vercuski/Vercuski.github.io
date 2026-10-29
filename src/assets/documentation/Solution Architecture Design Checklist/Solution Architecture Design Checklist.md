---
type: reference
domain:
  - "[[System Design]]"
  - "[[Architecture]]"
  - "[[Toolkit]]"
  - "[[Interview Prep]]"
status: draft
summary: Discovery and design-review questions for any system or solution design, grouped by concern, each paired with the design decision its answer drives.
aliases:
  - System Design Questions
  - Questions for System Design
  - System Design Discovery Questions
  - Solution Architecture Design Checklist
  - Solution Architecture Project Questions
  - Design Review Checklist
  - Requirements Elicitation Questions
  - System Design Checklist
created: 2026-08-12
updated: 2026-10-29
tags:
  - cheatsheet
  - interview
---
# System Design Question Bank

> [!summary] TL;DR
> **Part 1** is asked before drawing any boxes: it turns vague requirements into numbers, priorities and constraints, and each answer settles a specific design decision. **Part 2** reviews a candidate design against those answers. Start with the **Core 12**.

> [!tip] How to use
> - **Interviews:** ask the Core 12 in the first 5–10 minutes, then state assumptions out loud for anything left unanswered.
> - **Real projects:** copy the [[#Project worksheet]] and the sections you need into the project note, record the answers as given, and turn each significant answer into an [[Architecture Decision Records|ADR]] or a fitness function.
> - **Push for numbers.** "Fast" becomes a p99 in ms; "highly available" becomes a number of nines and a downtime budget.
> - **"It depends" is a trade-off to record,** not a gap to paper over. See [[Trade-off Analysis]].
> - **IDs are stable** (B3, R2, A1…), so project notes and ADRs can cite the question they answer.

---

## Core 12
1. What problem does this solve, for whom, and how is it handled today?
2. What are the 3–5 must-have use cases for the first release? What is explicitly out of scope?
3. How many users (total, daily active, peak concurrent), and where are they?
4. What is peak load (requests/sec, messages/sec), and what is the read:write ratio?
5. How much data is there on day one, and how fast does it grow?
6. Which three architecture characteristics matter most, and which are we willing to sacrifice?
7. What is the availability target, and what does an hour of downtime cost?
8. What latency do users need (p95/p99), and for which operations?
9. Where is strong consistency required, and where is eventual consistency acceptable?
10. What data is sensitive, and which regulations apply?
11. What do we integrate with, and what happens when those dependencies fail?
12. What are the fixed constraints: deadline, budget, team skills, mandated platforms?

---

# Part 1 · Discovery (before design)

## 1. Business context

| # | Question | What the answer drives |
|---|----------|------------------------|
| B1 | What business problem does this solve, what is the measurable outcome (revenue, cost, risk, compliance), and how does it support current strategy or OKRs? | Success criteria; which characteristics to prioritize |
| B2 | Who are the stakeholders, who has the final say on scope and trade-offs, and who can veto? | Decision rights; ADR approvers |
| B3 | What does the current process or system do, what's wrong with it, and what are users' biggest pain points today? | Migration strategy; behavior that must not regress |
| B4 | What is the deadline, and what drives it (contract, regulation, market)? | Build vs buy; scope cuts; how ambitious the architecture can be |
| B5 | What is the expected lifespan: throwaway, tactical (1–2 years) or strategic (10+)? | Investment in evolvability vs time to market |
| B6 | What is the growth plan over 1, 3 and 5 years (markets, products, acquisitions)? | Scalability headroom; extension points |
| B7 | What happens to the business if the system is down, slow, or wrong? | Availability, latency, consistency and durability targets |
| B8 | Is this capability a differentiator or a commodity? | Build vs buy vs SaaS |
| B9 | Why now? What happens if we don't build this, or build it six months later? | Urgency; scope of the first release; build vs buy |

## 2. Users and usage patterns

| # | Question | What the answer drives |
|---|----------|------------------------|
| U1 | Who are the user types: customers, staff, partners, other systems? | Authentication models; BFFs; API surface |
| U2 | How many users: total, daily active, peak concurrent? | Capacity planning |
| U3 | Where are users located, and on what devices and networks? | Regions; CDN and edge; offline or mobile support |
| U4 | What does traffic look like across a day, week, and year? Any flash events (sales, month-end, campaigns)? | Elasticity; autoscaling; queue-based load leveling |
| U5 | Which operations are most frequent, and which are most important? (They often differ.) | Where to optimize and cache |
| U6 | Do users need real-time updates (live dashboards, notifications)? | SignalR/WebSockets, SSE, or polling |
| U7 | Are localization, multiple time zones or currencies, or accessibility standards required? | UI and data model |
| U8 | Is the system multi-tenant? How isolated must tenants be, and do any need dedicated resources? | Tenancy model (shared DB, schema per tenant, DB per tenant) |
| U9 | How technically skilled are the users, and how much training or support will they get? | UX complexity; guided vs self-service workflows; support load |

## 3. Functional scope

| # | Question | What the answer drives |
|---|----------|------------------------|
| F1 | What are the core use cases, in priority order? What's MVP (must-have) and what's later (nice-to-have)? | Scope; release plan |
| F2 | What is explicitly out of scope? | Prevents silent scope creep |
| F3 | What are the core domain entities and the business rules that govern them? | Domain model; bounded contexts; service boundaries |
| F4 | Which workflows span several steps or systems, and what happens if one fails halfway? | Sagas; orchestration vs choreography; compensation |
| F5 | Which operations must complete while the user waits, and which can run in the background? | Async processing; queues; workers |
| F6 | What reporting, search, or analytics is needed? Who uses it, and how fresh must it be? | Read models; CQRS; reporting store; search index |
| F7 | Are there batch, scheduled, or long-running jobs? | Worker services; job scheduling |
| F8 | What must business users be able to change without a deployment? | Rules engine; feature flags; admin UI |

## 4. Scale and capacity
Get numbers here, even rough ones. Back-of-envelope estimates come from these answers.

| # | Question | What the answer drives |
|---|----------|------------------------|
| S1 | What are average and peak requests per second? What's the peak-to-average ratio? | Instance sizing; autoscaling policy |
| S2 | What is the read:write ratio? | Caching; read replicas; CQRS |
| S3 | How much data at launch, how much growth per month, and kept for how long? | Storage choice; partitioning; archiving |
| S4 | How big are typical and largest payloads (records, files, media)? | Blob storage; streaming; upload strategy |
| S5 | Are there hot spots (a huge tenant, a popular product, a celebrity account)? | Partition/shard key; hot-partition mitigation |
| S6 | How many messages or events per second, and how large? | Broker choice; partition count |
| S7 | How fast must capacity grow: minutes (autoscale) or seconds (pre-warmed)? | Elasticity strategy |
| S8 | What headroom is needed in three years: 2×, 10×, 100×? | Whether horizontal scale is designed in now or later |

See [[Scalability]] and [[Caching Patterns]].

## 5. Architecture characteristics
See [[Architecture Characteristics]]. Aim for the *least worst* architecture: you can't maximize everything.

| # | Question | What the answer drives |
|---|----------|------------------------|
| Q1 | What are the top three characteristics, and which can we trade away? | Architecture style; see [[Architecture Styles Compared]] |
| Q2 | What is the availability target? (99.9% ≈ 8.8 h/year down; 99.99% ≈ 53 min/year.) Are maintenance windows allowed? | Redundancy; deployment strategy; cost |
| Q3 | What are the latency targets at p95/p99 for each key operation? | Caching; data locality; sync vs async |
| Q4 | Which data must be strongly consistent, which can be eventually consistent, and how stale is acceptable? | Transaction boundaries; replication; [[CAP Theorem]] trade-offs |
| Q5 | What are the RPO (data loss tolerated) and RTO (time to recover)? | Backups; replication; DR design |
| Q6 | How often must we release, and is zero-downtime deployment required? | CI/CD; blue-green or canary; DB migration style |
| Q7 | How many teams change this system, and how independently must they ship? | Modularity; service granularity |
| Q8 | Must it be cloud-portable or run on-premises? | Use of managed services; abstraction layers |
| Q9 | Do some characteristics apply to only part of the system? | Architecture quanta; separate deployment units |

## 6. Data

| # | Question | What the answer drives |
|---|----------|------------------------|
| D1 | What are the main entities, which system is the source of truth for each, and who owns or stewards that data? | Data ownership; service boundaries |
| D2 | What are the access patterns: by key, range, full text, relationships, aggregations? | Database type; indexing |
| D3 | Which operations need ACID transactions, and do any span entities or services? | Transaction boundaries; see [[Atomic vs Eventual Transactions]] |
| D4 | How long is data retained, and must it be deletable on request? | Archiving; purge jobs; crypto-shredding |
| D5 | Is history or audit needed (who changed what, when; point-in-time views)? | Temporal tables; event sourcing; audit log |
| D6 | What existing data must be migrated, and how clean is it? | Migration and cutover plan |
| D7 | Who else needs this data (reports, other systems, a warehouse)? | CDC; domain events; outbox; read replicas |
| D8 | Are there data residency requirements? | Region pinning; per-region deployments |
| D9 | How often will the schema change? | Migration tooling; schema versioning; expand/contract |
| D10 | Which data is critical (must never be lost or wrong), and which is derived (can be rebuilt)? | Backup and replication scope; what can live only in caches or read models |

## 7. Integration and interfaces

| # | Question | What the answer drives |
|---|----------|------------------------|
| I1 | Which upstream and downstream systems and existing processes do we integrate with, and who owns them? | Context map; dependency risk |
| I2 | For each: synchronous or asynchronous, and over what (REST, gRPC, messaging, files)? | Communication style; coupling |
| I3 | What are their SLAs, rate limits, and failure behavior? | Circuit breaker; retry; bulkhead; cache fallback |
| I4 | Who consumes our APIs: internal teams, partners, the public? | API gateway; documentation; throttling |
| I5 | How are contracts versioned, and how are breaking changes communicated? | Versioning strategy; consumer-driven contract tests |
| I6 | Can messages arrive twice or out of order? Must operations be idempotent? | Idempotency keys; deduplication; ordered partitions |
| I7 | Must a DB write and an event publish succeed together? | Transactional outbox |
| I8 | Are there legacy or file-based integrations? | Anti-corruption layer; adapters |

See [[Distributed Systems Pattern Catalog]].

## 8. Security and compliance

| # | Question | What the answer drives |
|---|----------|------------------------|
| X1 | Who authenticates, and how (OIDC/SSO, API keys, mTLS)? Is there an existing identity provider? | Identity integration |
| X2 | What is the authorization model: roles, permissions, resource-level, attribute-based, tenant-scoped? | Policy design; where checks are enforced |
| X3 | How is the data classified: PII, PHI, payment card data, secrets? | Encryption; masking; access controls |
| X4 | Which regulations or standards apply (GDPR, HIPAA, PCI DSS, SOC 2, SOX), and do they dictate data handling or residency? | Controls; hosting; audit; see [[Data Compliance Standards Compared]] |
| X5 | What encryption is required at rest and in transit? Customer-managed keys? | Key management |
| X6 | What audit trail is required, and who reviews it? | Audit logging; retention |
| X7 | What are the trust boundaries and main threats? | [[Threat Modeling]] (STRIDE) |
| X8 | How are secrets stored and rotated? | Key Vault or equivalent; managed identities |
| X9 | Is anything exposed to the public internet? | WAF; DDoS protection; rate limiting; bot defense |

## 9. Reliability and failure handling

| # | Question | What the answer drives |
|---|----------|------------------------|
| R1 | What happens when each dependency is slow, down, or returns garbage? What degraded behavior is acceptable? | Graceful degradation; fallbacks; timeouts |
| R2 | Which components are single points of failure, and what is the blast radius if each one fails? | Redundancy; isolation (bulkheads, cells) |
| R3 | Is single-region acceptable, or is multi-zone or multi-region needed? Active-active or active-passive? | Topology; data replication; cost |
| R4 | How are partial failures in multi-step workflows resolved? | Compensation; reconciliation jobs |
| R5 | How is the system protected from overload: bursts, retry storms, noisy tenants? | Rate limiting; load shedding; backpressure; bulkheads |
| R6 | How are backups taken, and when was a restore last tested? | Backup policy; restore drills |
| R7 | What is the disaster recovery plan, and who runs it? | DR runbooks; failover automation |

## 10. Operations and observability

| # | Question | What the answer drives |
|---|----------|------------------------|
| O1 | How do we know the system is healthy? Which SLIs and SLOs? | Dashboards; alerts; error budgets |
| O2 | What are the logging, metrics, and tracing standards? Is there an existing platform? | OpenTelemetry setup; correlation IDs; see [[Monitoring vs Observability]] |
| O3 | Who is on call, what's the support model, and how are incidents detected and escalated? | Alert routing; runbooks; incident process |
| O4 | Where is it deployed, and which environments exist? | Hosting (containers, PaaS, serverless); pipeline design |
| O5 | How is a bad release rolled back, including its database changes? | Expand/contract migrations; feature flags |
| O6 | How are configuration and feature flags managed per environment? | Config service; flag tooling |
| O7 | What alerts and runbooks must exist at launch? | Operational readiness checklist |
| O8 | After launch, how are changes requested, approved, and prioritized, and who owns the system? | Change governance; ownership; backlog |
| O9 | How and when will the system be retired, and what happens to its data? | Decommissioning plan; data export and retention |

## 11. Constraints

| # | Question | What the answer drives |
|---|----------|------------------------|
| C1 | How big is the team, and what are they experienced with? | Technology choices the team can actually operate |
| C2 | Are platforms, languages, cloud providers, or enterprise standards mandated? | Solution space |
| C3 | What's the budget to build and to run (CapEx/OpEx)? Is there a monthly cloud ceiling? | Managed vs self-hosted; serverless vs reserved capacity |
| C4 | Are there licensing constraints (open source policy, commercial licenses)? | Library and product selection |
| C5 | For each major capability: build, buy, or SaaS? | Integration effort; vendor lock-in |
| C6 | How are teams organized, and who will own which parts? | Service boundaries (Conway's law) |
| C7 | Which existing systems must be reused or replaced? | Integration and migration scope |
| C8 | Which constraints are truly fixed, and which are negotiable? | Where to push back; the real solution space |

---

# Part 2 · Design review (during design)
Run this once a candidate design exists, and again before sign-off. Each question tests the design against the Part 1 answers.

## 12. Decisions

| # | Question | What the answer drives |
|---|----------|------------------------|
| A1 | What are the key architectural decisions? Is each recorded as an ADR with alternatives and trade-offs, and who signs off? | [[Architecture Decision Records]] |
| A2 | Which decisions are hard or expensive to reverse, and have they had proportionate scrutiny? | Where to spend analysis time (one-way vs two-way doors) |
| A3 | Can any decision be deferred until we know more? | Last responsible moment; options kept open |
| A4 | Is each pattern or technology chosen because it fits the Part 1 drivers, or because it's familiar or fashionable? | Traceability from characteristics to style |

## 13. Structure and boundaries

| # | Question | What the answer drives |
|---|----------|------------------------|
| M1 | What are the key components, and does each have one clear responsibility? | Component view; ownership |
| M2 | Do service and module boundaries align with business domains (bounded contexts)? | Service granularity; team ownership |
| M3 | Where is coupling unavoidable, and is it explicit (contracts, shared libraries, shared data)? | Integration contracts; fitness functions that guard it |
| M4 | Could this start as a modular monolith and extract services later? | Deployment complexity now vs later |

## 14. Risk

| # | Question | What the answer drives |
|---|----------|------------------------|
| K1 | What are the biggest technical risks and unknowns, and which spike or proof of concept retires each one early? | Early prototypes; iteration plan |
| K2 | Walking each dependency through slow, down, and wrong: does the design behave as R1 requires? | Timeouts; circuit breakers; validation at boundaries |
| K3 | Has the design been threat-modeled against its trust boundaries (X7)? | [[Threat Modeling]] |
| K4 | Which risks are we explicitly accepting, and who has signed off on them? | Risk register; ADR consequences |

## 15. Validation

| # | Question | What the answer drives |
|---|----------|------------------------|
| V1 | How will we prove the design meets its targets: load tests, chaos tests, fitness functions? | Test strategy; see [[Load Testing Tools]] |
| V2 | Have stakeholders reviewed the design against real scenarios, not just diagrams? | Scenario walkthroughs |
| V3 | Which assumptions are we making that nobody has confirmed, and how will we know if they're wrong? | Assumption log; follow-ups |
| V4 | What business and technical metrics will we track after launch, and how will we gather user feedback? | Post-launch success measures; feedback loop |

## 16. Evolution and cost

| # | Question | What the answer drives |
|---|----------|------------------------|
| E1 | Which parts are most likely to change over the next 2–3 years, and how often? | Isolating volatility; modularity |
| E2 | Are future requirements already known (channels, markets, products), and how do we avoid over-engineering for them today? | Extension points; avoiding premature generality |
| E3 | If replacing a legacy system: big bang or incremental? | Strangler Fig; see [[Legacy Migration Approaches]] |
| E4 | How will we detect architectural drift over time? | [[Architectural Fitness Functions]] |
| E5 | What's the total cost of ownership, including infrastructure, licensing, and operational headcount? | Hosting model; build vs buy; staffing |
| E6 | What technical debt are we knowingly taking on, and what's the plan to pay it down? | Debt register; roadmap |
| E7 | Will a new developer understand this system in a year? | Documentation; diagrams; ADRs |

---

## Red flags in answers
- **"It must scale infinitely" or "100% uptime."** No number. Ask what an hour of downtime actually costs.
- **"Everything is critical."** No priorities. Force a top-three ranking of characteristics.
- **"Real-time" with no latency figure.** Ask: sub-100 ms, a few seconds, or a few minutes?
- **"Same as the old system."** The old system's behavior is a set of undocumented requirements; capture them.
- **Requirements stated as solutions** ("we need Kafka", "it has to be microservices"). Ask what problem the solution is meant to solve.
- **"We'll handle security later."** Compliance and data classification shape hosting and data design from the start.

## Project worksheet
Copy this section into the project note and fill it in as the questions are answered.

| Field | Value |
|-------|-------|
| Project | |
| Architect | |
| Date | |
| Status | Draft / In Review / Approved |

- [ ] Core 12 answered
- [ ] Part 1 answered, or assumptions recorded for each gap
- [ ] Part 2 review held with stakeholders
- [ ] ADRs written for the decisions in A1

| # | Question / Issue | Owner | Status |
|---|------------------|-------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
