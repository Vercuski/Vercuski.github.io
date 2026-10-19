---
title: Architecture Principles — Project Tapline
status: approved
owner: Dana Okafor (Chief Architect)
version: 1.1.0
last_updated: 2026-07-15
reviewers:
  - Architecture Review Board — v1.0 approved 2026-05-08; v1.1 approved 2026-07-15
  - Priya Raman (CIO)
  - Tom Whitaker (CISO) — P3, P10
tags:
  - principles
---
# Architecture Principles — Project Tapline

> [!summary] How principles are used
> Principles are the tie-breakers. When a design choice isn't covered by a requirement or an ADR, the ARB asks which option better follows these principles. Each principle states what it **rules out**; a principle that rules nothing out isn't doing any work. Breaking a principle needs an [exception request](../07-governance/architecture-exception-request.md).

**Change history:** v1.0 (2026-05-08) adopted P1–P11. v1.1 (2026-07-15) added P12 and P13, and sharpened P5 after ADR-0007.

## 1. Principle Template
The register in §2 lists all principles. Each one is set out below in the template's format.

### 1.1 Principle: P1 · Offline-first at the edge
- **Statement:** Validators and handhelds must do their job, accepting or denying a tap and checking proof of payment, without a network connection.
- **Rationale:** connectivity in tunnels, rural areas and outages is unreliable (field measurements, May 2026). Boarding speed drives bus running times, and fare collection must never stop.
- **Implications:**
  - Edge decisions use only local data: deny lists, card cryptography and synced recent taps.
  - Everything the edge records is stored and forwarded, never fire-and-forget.
  - **Rules out:** any back-office call on the tap path, and online-only features at the door.

### 1.2 Principle: P2 · The ledger is append-only
- **Statement:** Financial records are never updated or deleted. Corrections are new, balanced entries.
- **Rationale:** auditability (FR-FIN-01), tamper evidence for Internal Audit, and simple reasoning about history.
- **Implications:**
  - Database-enforced through Azure SQL ledger tables ([ADR-0006](adr/0006-azure-sql-ledger-tables-for-fare-ledger.md)).
  - Every money movement is one balanced transaction.
  - **Rules out:** "fix the balance" scripts, soft deletes on financial rows, and recalculating historic charges in place.

### 1.3 Principle: P3 · Card numbers stop at the processor
- **Statement:** No CRT system stores, processes or transmits an unencrypted card number.
- **Rationale:** PCI scope and breach impact (BR-23).
- **Implications:**
  - P2PE readers; tokens only; hosted payment fields ([ADR-0005](adr/0005-no-card-numbers-in-crt-systems.md)).
  - **Rules out:** CRT-built card-entry forms, PAN search in customer service, and logging any card field.

### 1.4 Principle: P4 · Taps are facts; everything else is derived
- **Statement:** A tap, once recorded, never changes. Trips, fares, caps and ledger entries are derived from taps, fare rules and money events, and can be recomputed.
- **Rationale:** late and duplicate data are normal at the edge, and recomputation makes re-rating and recovery possible (NFR-INTEG-01).
- **Implications:**
  - Fare calculation is deterministic and pure.
  - Raw taps are archived immutably.
  - **Rules out:** editing a tap to "fix" a fare, and fare logic that depends on processing time or arrival order.

### 1.5 Principle: P5 · Integrate by contract, not by database
- **Statement:** Contexts and external systems integrate only through published events and APIs with versioned, machine-readable contracts.
- **Rationale:** independent change and deployment; replaceable components.
- **Implications:**
  - One database per context.
  - Contracts in `Contracts/`; anti-corruption layers for external systems.
  - **Rules out:** cross-context SQL joins, shared tables, reading another context's database "just for a report", and shared domain classes beyond the small `SharedKernel`.

### 1.6 Principle: P6 · Every message is idempotent
- **Statement:** Every message and request that changes state carries a unique ID, and every consumer handles duplicates safely.
- **Rationale:** at-least-once delivery everywhere: validators retry, Event Hubs redelivers, webhooks repeat.
- **Implications:**
  - Unique constraints on IDs (`tap_id`, `source_event_id`, charge IDs).
  - `Idempotency-Key` on money-moving APIs.
  - **Rules out:** consumers that assume exactly-once delivery, and auto-increment IDs as the only identity of a business event.

### 1.7 Principle: P7 · Fare policy is data, not code
- **Statement:** Fares, caps, transfer windows and products are versioned business data managed by Fare Policy staff.
- **Rationale:** BR-15, and Vision goal 6: no vendor or release needed for a fare change.
- **Implications:**
  - Fare rule versions with effective dates and two-person approval.
  - The Fare Engine is generic over rules.
  - **Rules out:** fare amounts or rider categories as constants in code, and feature flags as a substitute for fare rules.

### 1.8 Principle: P8 · Buy commodities, build differentiators
- **Statement:** Buy what is standard in the market (hardware, payment processing, cash networks, cloud platforms). Build what carries CRT's fare policy and regional ambition (fare engine, accounts, ledger, apportionment).
- **Rationale:** the Business Case's Option C; control where it matters, less effort where it doesn't.
- **Implications:**
  - Commercial validators; Northgate; CornerPay; Azure PaaS.
  - CRT-owned domain services.
  - **Rules out:** building hardware, a payment gateway or an identity provider, and buying a fare engine as a black box.

### 1.9 Principle: P9 · Managed services first
- **Statement:** Prefer fully managed cloud services over components CRT must operate.
- **Rationale:** CRT IT has about 40 people. Operating brokers, databases or clusters by hand at this criticality is beyond its capacity.
- **Implications:**
  - Azure PaaS (SQL, Event Hubs, Redis, APIM, Front Door). AKS is the one platform CRT operates, and it is managed by the Platform Team.
  - **Rules out:** self-hosted Kafka, self-hosted databases, and VMs for application workloads.

### 1.10 Principle: P10 · Privacy by design
- **Statement:** Separate who a rider is from where they travel, collect the minimum, and keep data only as long as needed.
- **Rationale:** BR-14, BR-26, the state privacy law, rider trust.
- **Implications:**
  - Media tokens as the only join between identity and travel.
  - Pseudonymized analytics with monthly key rotation.
  - The 90-day option.
  - **Rules out:** names or contact details in events, logs or analytics; open-ended retention; and staff access to trip history without a support reason.

### 1.11 Principle: P11 · Everything as code
- **Statement:** Infrastructure, configuration, policies, dashboards and alerts are defined in version control and deployed by pipeline.
- **Rationale:** repeatable environments, reviewable change, auditability.
- **Implications:**
  - Bicep + Deployment Stacks; Flux; alert rules in IaC.
  - **Rules out:** portal changes in production, hand-built environments, and undocumented manual steps. The HSM key ceremony is the single documented exception.

### 1.12 Principle: P12 · Design for replaceable vendors
- **Statement:** Every vendor-supplied component sits behind a CRT-owned interface, so it can be replaced without changing domain code.
- **Rationale:** RiverCard's lock-in; NFR-PORT-01.
- **Implications:**
  - Anti-corruption layers for Vantor, Northgate, DHS and CornerPay.
  - CRT-owned tap format at the Device Gateway, translated from Vantor's.
  - **Rules out:** vendor SDK types in domain code, and vendor identifiers as primary keys.

### 1.13 Principle: P13 · Observable by default
- **Statement:** Every service emits traces, metrics and structured logs through OpenTelemetry, and every tap is traceable end to end by its `tap_id`.
- **Rationale:** a distributed, asynchronous system is undebuggable without it. Revenue disputes need evidence.
- **Implications:**
  - Shared instrumentation library; SLOs and alerts defined with each service.
  - **Rules out:** shipping a service without dashboards, SLOs and runbooks; and unstructured logs.

---

## 2. Principle Register
| # | Principle | Category |
|---|---|---|
| P1 | Offline-first at the edge | Ops / Edge |
| P2 | The ledger is append-only | Data |
| P3 | Card numbers stop at the processor | Security |
| P4 | Taps are facts; everything else is derived | Data |
| P5 | Integrate by contract, not by database | Integration |
| P6 | Every message is idempotent | Integration |
| P7 | Fare policy is data, not code | Data / Business |
| P8 | Buy commodities, build differentiators | Strategy |
| P9 | Managed services first | Ops |
| P10 | Privacy by design | Security / Data |
| P11 | Everything as code | Ops |
| P12 | Design for replaceable vendors | Integration |
| P13 | Observable by default | Ops |

**Where principles conflict**, the [NFR trade-off order](../01-requirements/non-functional-requirements.md) applies: money correctness, then boarding speed and availability, then PCI scope, then privacy, then vendor independence, then cost.
