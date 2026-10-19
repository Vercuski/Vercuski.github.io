---
title: "ADR-0007: Services by Bounded Context, Not per Entity"
status: accepted
owner: Dana Okafor (Chief Architect)
version: 1.0.0
last_updated: 2026-07-22
reviewers:
  - Architecture Review Board — accepted 2026-07-22
  - Ravi Patel, Mei Chen, Hannah Cole, Diego Alvarez (team leads)
tags:
  - adr
---
# ADR-0007: Services by Bounded Context, Not per Entity

## 1. Status
Accepted

- **Decision date:** 2026-07-22
- **Deciders:** ARB with the four product team leads
- **Drivers:** NFR maintainability (independent deployability), team size (18 product roles), [Domain Model](../../02-core-architecture/domain-model.md) bounded contexts

## 2. Context
The domain model has eight bounded contexts. Early sketches from the delivery partner proposed 30+ microservices, roughly one per entity (Account, Medium, Trip, Charge, Refund, and so on). CRT will have four product teams and a platform team, and a 40-person IT department to support it afterwards. Every service adds a deployment pipeline, dashboards, alerts, an on-call surface, and network calls that can fail.

On the other side, a single monolith would couple the Fare Engine's high-throughput streaming to the request/response APIs and the card-data zone. It would also break the PCI boundary, which needs payments code deployed separately.

## 3. Decision
We will deploy **one small set of services per bounded context**, split further only for a concrete reason: different scaling, a different security zone, or a different runtime model (stream versus request).

- **Journey:** Tap Router and Fare Engine (both stream workers with different partition keys).
- **Fare Policy:** one API service.
- **Rider Account, Media & Tokens, Eligibility:** **one** Account Service, a modular monolith with three modules and separate schemas, owned by the Rider Team.
- **Payments & Settlement:** Payments Service (API), Ledger Service (worker + API) and Settlement Jobs, all in the card-data zone.
- **Device Fleet:** Device Gateway (edge ingress; very different scaling), Deny List Service, Device Management Service.
- **Apportionment:** one job service (Phase 4).
- **Shared:** Integration Service (ACLs) and Notification Service.

Contexts never share a database, and modules within the Account Service never share tables. Splitting a module out later must be a deployment change, not a redesign.

## 4. Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| **Fine-grained microservices** (~30, one per entity) | Maximum independent deployability | Operational load beyond CRT's capacity; chatty synchronous calls; distributed transactions between entities in the same context | Cost without benefit for 4 teams |
| **Single modular monolith** | Simplest to operate | Mixes stream and request workloads; PCI zone needs separate deployment; one failure domain | Breaks the card-data boundary and scaling needs |
| **Services by bounded context** (chosen) | Matches team ownership; about 15 deployables; boundaries follow the domain | Some services contain several aggregates; the Account Service hosts three contexts | **Chosen** |

## 5. Consequences
**Positive:**
- About 15 deployables instead of 30+. Each team owns 2–4.
- Calls inside a context are in-process, so they are transactional and need no network hop.
- Context boundaries are explicit in code (`tapline-platform/src/<Context>/`) and enforced by architecture tests.

**Negative:**
- The Account Service deploys three contexts together, so a defect in Eligibility can force a redeploy of Accounts. This is accepted as technical debt ([SAD §8](../../02-core-architecture/solution-architecture-document.md)).
- Teams must resist adding unrelated features to an existing service for convenience. Reviewed at the ARB.

**Neutral / follow-up work required:**
- Architecture tests (NetArchTest) for module and context boundaries.
- Rules for when to split a service, to be added to the [Reference Architecture](../reference-architecture-and-technology-radar.md).

**Reversibility:** Easy to split further, because modules already have separate schemas and contracts. Merging is harder.

## 6. Related
- [Container Diagram](../../02-core-architecture/c4-model/container-diagram.md), [4+1 Views §3](../../02-core-architecture/4plus1-views.md)
- **Review trigger:** the Rider Team splitting into two teams, or Eligibility needing a different release cadence (Phase 4).
