const e=`---
title: Solution Architecture Document — Project Tapline
status: approved
owner: Dana Okafor (Chief Architect)
version: 1.0.0
last_updated: 2026-10-09
reviewers:
  - Architecture Review Board — approved 2026-10-07
  - Priya Raman (CIO) — approved 2026-10-08
  - Tom Whitaker (CISO) — approved 2026-10-08
  - Aisha Karimi (Lead Solution Architect) — co-author
  - Elena Brooks (Program Director) — reviewed 2026-10-09
tags:
  - architecture_document
---

# Solution Architecture Document — Project Tapline

> [!summary] Tapline in one paragraph
> Tapline is an account-based fare system. Whatever a rider taps is only an identifier. Offline-capable validators decide accept or deny locally in under 300 ms and forward every signed tap to Azure. There, an event-streaming pipeline built on .NET 10 groups taps into trips, applies transfers and caps, and records every cent in an append-only ledger. Card data never enters CRT systems: P2PE readers encrypt it for Northgate Payments, which charges each card once a night. The design is organized around eight bounded contexts and is built to survive network loss at the edge, region loss in the cloud, and late or duplicated data everywhere.

## 1. Introduction
### 1.1 Purpose
This is the umbrella architecture document for Project Tapline. It connects the detailed architecture documents with a short narrative and records the architecture as approved at the end of Phase 0 design (ARB, 7 October 2026). It is the starting point for engineers joining the program, for the Gate 0 review, and for auditors.

### 1.2 Scope
Covers the whole Tapline system as defined in the [Architecture Vision §5](../00-vision-and-strategy/architecture-vision.md): validators and handhelds, cloud services, rider and staff channels, and integrations with Northgate, Vantor, State DHS, CornerPay, CRT ERP and RiverCard. Phase 4 capabilities (apportionment, partner portal, Keel Mobility) are included at container level but not yet designed in detail.

### 1.3 Definitions & Acronyms
Business terms are defined once, in the [Domain Model glossary](domain-model.md). Technical acronyms used here:

| Term | Meaning |
|---|---|
| ACL | Anti-corruption layer: a translation boundary that keeps an external model out of ours |
| AKS | Azure Kubernetes Service |
| CDE / card-data zone | The isolated network and subscription for Payments, Ledger and Settlement |
| EMV | The chip-card payment standard; here, contactless EMV cards and wallets |
| HSM | Hardware security module (Azure Managed HSM) |
| ICD | Interface Control Document |
| KEDA | Kubernetes Event-Driven Autoscaling |
| MTT | Mass transit transaction: the card-network rules for combining transit taps into one charge |
| P2PE | Point-to-point encryption: card data encrypted in the reader, decryptable only by the processor |
| PITR | Point-in-time restore |
| RPO / RTO | Recovery point objective / recovery time objective |

## 2. Executive Summary

RiverCard reaches end of support on 31 Dec 2028. Tapline replaces it with a system CRT owns, built on four architectural choices:

1. **Account-based, not card-based** ([ADR-0002](../06-decisions-and-standards/adr/0002-account-based-fare-model.md)). Fare logic lives in the cloud, so fare capping, reduced fares, open payments and regional integration all become configuration rather than card programming.
2. **Offline-first at the edge** ([ADR-0004](../06-decisions-and-standards/adr/0004-offline-first-validators-with-signed-deny-lists.md)). Validators never wait for the network. They decide from a signed local deny list and store taps until the cloud confirms receipt. Boarding speed and fare collection survive any outage up to 72 hours.
3. **Events as the source of truth** ([ADR-0003](../06-decisions-and-standards/adr/0003-event-hubs-for-tap-ingestion.md), [ADR-0006](../06-decisions-and-standards/adr/0006-azure-sql-ledger-tables-for-fare-ledger.md)). Taps are immutable facts in Event Hubs and an immutable archive. Trips, fares and ledger entries are derived from them deterministically, so late data is re-rated, duplicates are harmless, and a lost database can be rebuilt.
4. **No card data** ([ADR-0005](../06-decisions-and-standards/adr/0005-no-card-numbers-in-crt-systems.md)). P2PE readers and Northgate tokens keep card numbers out of every CRT system, which keeps the PCI scope small.

The system is eight bounded contexts deployed as about fifteen services on AKS, with Azure SQL, Event Hubs and Fabric for data. It is designed for 12,000 taps a minute against a normal peak of about 1,100. The biggest technical risks are Journey DB write throughput, the team's limited experience with event streaming, and dependence on Vantor's firmware for edge behavior (§8).

## 3. Architectural Goals & Constraints
From the [Architecture Vision](../00-vision-and-strategy/architecture-vision.md) and the [Non-Functional Requirements](../01-requirements/non-functional-requirements.md).

| Goal / Constraint | Description | Driver |
|---|---|---|
| Fast, offline boarding | Accept/deny in ≤ 300 ms with or without network; 72 h offline operation | NFR-PERF-01, NFR-AVAIL-03, BR-07, BR-08 |
| No lost taps, no wrong cents | Durable store-and-forward; deterministic re-rating; append-only ledger | NFR-AVAIL-04, NFR-INTEG-01, BR-16 |
| Fare policy as data | Fare changes go live by approved configuration with no release | BR-15, FR-POL-01 |
| Surge capacity | 12,000 taps/min sustained for 30 minutes | NFR-SCALE-01 |
| Minimal PCI scope | No card numbers in CRT systems | NFR-SEC-01, BR-23 |
| Privacy by design | Identity separated from travel; rider-chosen deletion; de-identified analytics | BR-14, BR-26, NFR-PRIV-01 |
| Vendor independence | Validators and processor replaceable behind CRT-owned interfaces | NFR-PORT-01 |
| Fixed end date | RiverCard switched off 31 Dec 2028 | Vision constraint |
| CRT platform standards | .NET and Azure; existing Enterprise Agreement | Vision constraint |
| Budget | Steady-state operating cost within $11.2M a year; cloud ≤ $2.1M | NFR-COST-01, Business Case |

## 4. Architectural Views

### 4.1 Context View
Tapline serves riders, inspectors, CRT staff and partner operators, and depends on Northgate, Vantor Fleet Cloud, State DHS, CornerPay, CRT ERP, CRT Scheduling and, until 2028, RiverCard. Validators are inside the system boundary: they are CRT assets running CRT configuration. See the [Context Diagram](c4-model/context-diagram.md).

### 4.2 Logical / Container View
Eight bounded contexts (Fare Policy, Journey, Rider Account, Media & Tokens, Eligibility, Payments & Settlement, Apportionment, Device Fleet) are deployed as services grouped by context ([ADR-0007](../06-decisions-and-standards/adr/0007-services-by-bounded-context.md)). The critical path is **Validator → Device Gateway → \`taps\` → Tap Router → \`rider-taps\` → Fare Engine → \`domain-events\` → Ledger Service**. The two-stream design gives one writer per rider key without distributed locks. Everything between contexts is asynchronous, so a failing context never stops taps being accepted. See the [Container Diagram](c4-model/container-diagram.md) and the logical view in [4+1 Views §1](4plus1-views.md).

### 4.3 Component View
The Fare Engine is the only container drawn at component level. Its core (Trip Builder, Fare Calculator, Cap Accumulator, Service-Day Clock) is pure and deterministic, and normal rating is just re-rating from the end of the timeline. See the [Component Diagram](c4-model/component-diagram.md).

### 4.4 Process View
Three runtime models: always-on validators; a streaming pipeline ordered per rider key; and a nightly chain from 03:00 to 06:00 that builds charges, settles with Northgate and posts to the ERP. Back-pressure stays in Event Hubs and never reaches validators. See [Sequence Diagrams](sequence-diagrams.md) and [4+1 Views §2](4plus1-views.md).

### 4.5 Deployment View
Azure East US 2 is primary, with a warm standby in Central US. Two AKS clusters (main zone and card-data zone) run across three availability zones each. Validators connect over a carrier private APN and ExpressRoute; handhelds and riders come in through Front Door. See [Deployment Topology](../04-infrastructure-and-network/deployment-topology.md) and [4+1 Views §4](4plus1-views.md).

### 4.6 Data View
One database per context, no cross-database foreign keys, money in integer cents, and taps as immutable facts. The ledger uses Azure SQL ledger tables and achieves RPO 0 by replaying synchronously replicated events. Identity and travel are joined only by the media token, and that join is cut for analytics by monthly-rotated pseudonyms. See [Data Architecture](data-architecture.md) and [Domain Model](domain-model.md).

> Guidance: If your stakeholders are more familiar with Kruchten's model
> than C4, \`4plus1-views.md\` is an alternative (or complementary) way to
> organize this section.

## 5. Technology Stack
| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Blazor Web App (rider, back-office and partner portals); .NET MAUI (Rider App, Inspection App) | One language and toolchain across the stack; CRT's existing .NET skills; MAUI covers iOS and Android plus the Android handhelds |
| Backend | .NET 10 (LTS), ASP.NET Core minimal APIs, .NET worker services | CRT standard; LTS support to late 2028 with an upgrade path to .NET 12 |
| Messaging | Azure Event Hubs Premium (\`taps\`, \`rider-taps\`, \`domain-events\`); Service Bus for commands such as notifications | Partitioned, ordered, replayable streams at the needed scale ([Trade Study](../06-decisions-and-standards/technology-evaluation-trade-study.md), [ADR-0003](../06-decisions-and-standards/adr/0003-event-hubs-for-tap-ingestion.md)) |
| Data | Azure SQL Database (Hyperscale for Journey; Business Critical for Accounts and Ledger, with ledger tables); Azure Managed Redis; ADLS Gen2 with immutable storage; Microsoft Fabric | Relational consistency where money and accounts live; tamper-evident ledger; cheap immutable archive; managed analytics |
| Data access | EF Core 10 (Accounts, Fare Policy); Dapper (Fare Engine and Ledger hot paths) | EF Core for productivity; Dapper where every millisecond and SQL statement must be explicit |
| Infrastructure | AKS (two clusters), Azure API Management, Front Door Premium + WAF, Bicep, GitHub Actions | Managed platform; independent deployment per context; IaC for every environment |
| Identity | Entra External ID (riders); Entra ID with phishing-resistant MFA (staff); Entra ID B2B (partners); per-device X.509 certificates (validators) | Separate identity planes for each population |
| Security | Azure Managed HSM (signing and encryption keys), Key Vault (secrets), Defender for Cloud, P2PE readers | Keys never leave hardware; card data never enters CRT systems |
| Observability | OpenTelemetry → Azure Monitor (Application Insights, Log Analytics); Azure Managed Prometheus and Managed Grafana | Vendor-neutral instrumentation; dashboards and SLO alerts |
| Edge | Vantor V7 validators (V5 on ferries until Q4 2028); Vantor Fleet Cloud | Commercial, EMV-certified, P2PE-capable hardware |

The technology lifecycle position of each item (Adopt, Trial, Assess, Hold) is in the [Reference Architecture & Technology Radar](../06-decisions-and-standards/reference-architecture-and-technology-radar.md).

## 6. Cross-Cutting Concerns
- **Security:** zero trust between services (managed identities, mutual TLS inside clusters), a separate card-data zone, two-person controls for refunds and fare rules, and signed taps and deny lists. See [Security Architecture](../05-security/security-architecture.md) and [Threat Model](../05-security/threat-model.md).
- **Logging / Observability:** OpenTelemetry everywhere, with every tap's \`tap_id\` used as a correlation ID end to end. Restricted data is excluded from logs by allow-listed structured fields. SLOs come from the NFRs. See [Observability Strategy](../08-risk-and-operations/observability-strategy.md).
- **Error handling:**
  - Streams: retry with backoff, then dead-letter to a parking stream with an alert. Nothing is silently dropped, and every parked message has a replay tool.
  - APIs: RFC 9457 problem details, with stable error codes per context ([API Specification Guide](../03-interfaces-and-integration/api-specification-guide.md)).
  - Money: never auto-corrected. Differences become exceptions for Revenue Operations.
- **Idempotency:** a system-wide rule. Every message carries a unique ID, and every consumer is idempotent by that ID (\`tap_id\`, \`source_event_id\`, deterministic charge IDs).
- **Time:** all instants are stored in UTC. Local time is used only to derive service days and fare weeks, through the Service-Day Clock. Validators are GPS-synced.
- **Configuration management:** fare rules are business data in the Fare Policy context, not configuration. Service configuration uses Azure App Configuration with feature flags. Validator configuration is versioned in \`tapline-edge\` and rolled out in rings.
- **Internationalization:** all rider-facing text in English, Spanish, Vietnamese and Simplified Chinese through .NET resource files and a translation workflow. Currency is USD only.
- **Accessibility:** WCAG 2.2 AA for every web and app screen, with automated checks in CI and manual testing with the Accessibility Advisory Committee before each release.

## 7. Key Architecture Decisions
> Don't repeat full ADRs here; summarize and link.

| ADR | Decision | Status | Date |
|---|---|---|---|
| [0001](../06-decisions-and-standards/adr/0001-record-architecture-decisions.md) | Record architecture decisions as ADRs in the repository | Accepted | 2026-04-10 |
| [0002](../06-decisions-and-standards/adr/0002-account-based-fare-model.md) | Account-based fare model: media are identifiers; fares are calculated in the cloud | Accepted | 2026-04-24 |
| [0003](../06-decisions-and-standards/adr/0003-event-hubs-for-tap-ingestion.md) | Azure Event Hubs Premium for tap ingestion and domain events | Accepted | 2026-06-12 |
| [0004](../06-decisions-and-standards/adr/0004-offline-first-validators-with-signed-deny-lists.md) | Offline-first validators with signed deny lists; accept first-ride risk | Accepted | 2026-06-24 |
| [0005](../06-decisions-and-standards/adr/0005-no-card-numbers-in-crt-systems.md) | No card numbers in CRT systems: P2PE readers, media tokens and Northgate payment tokens | Accepted | 2026-05-15 |
| [0006](../06-decisions-and-standards/adr/0006-azure-sql-ledger-tables-for-fare-ledger.md) | Azure SQL ledger tables for the fare ledger | Accepted | 2026-07-08 |
| [0007](../06-decisions-and-standards/adr/0007-services-by-bounded-context.md) | Services by bounded context, not one per entity; Account Service hosts three contexts | Accepted | 2026-07-22 |

Full detail is in the [ADR Log](../06-decisions-and-standards/adr/adr-log.md).

## 8. Risks & Technical Debt
Program-level risks are tracked in the [Risk Register](../08-risk-and-operations/risk-register.md). These are the architectural ones.

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Journey DB write throughput limits the Fare Engine during surges | Tap-to-account latency breaches NFR-PERF-03 during events | Medium | Hyperscale; one write per tap; load test at 1,500 taps/s in Phase 0; fallback is to batch writes per rider key |
| Team new to event streaming (ordering, idempotency, replay) | Subtle data bugs in production | High | Pairing with the delivery partner; property-based tests on the pure core; replay tooling built in Phase 0; Tap Router and Fare Engine reviewed by the ARB before Phase 1 |
| Edge behavior depends on Vantor firmware (tap format, clocks, P2PE) | Defects or delays outside CRT's control | Medium | ACL at the Device Gateway; Vantor test kit in the hardware lab; contractual firmware defect SLAs |
| Event Hubs synchronous geo-replication is newer than the rest of the stack | RPO 0 depends on it | Medium | Quarterly failover tests; if it fails, fall back to replaying from validators' retained taps (they keep taps 24 h after acknowledgement) |
| Ferry runs older Vantor V5 validators until Q4 2028 | V5s can't meet TLS 1.3 or real-time upload standards | Certain | Architecture exception with compensating controls (see [Exception Request](../07-governance/architecture-exception-request.md)) |
| PCI scope grows beyond the card-data zone | Cost and audit effort | Low | P2PE solution listing; scoping review at every phase gate |

**Accepted technical debt**
| Debt | Why accepted | Revisit |
|---|---|---|
| Account Service hosts three contexts | Same team and change cadence; fewer moving parts in Phase 1–2 | When the Rider Team splits, or by Phase 4 |
| Taps in sealed weeks (> 30 days old) need manual adjustment | Rare; automating it adds complexity to the hot path | After 6 months of production data |
| Partner Portal and Apportionment designed at container level only | Not needed until Phase 4 | Phase 3 design sprint |

## 9. Open Questions
| # | Question | Owner | Needed by |
|---|---|---|---|
| OQ-1 | Should rider fare week state move to Microsoft Orleans grains to reduce Journey DB load? (On the radar as *Trial*.) | Ravi Patel | Phase 1 load results |
| OQ-2 | Will the Vantor V7 + Northgate P2PE solution be listed by PCI SSC before Phase 1 go-live, or is an interim scope needed? | Tom Whitaker | 2026-12 |
| OQ-3 | Keel Mobility integration: does Keel call a CRT charge API, or does CRT ingest Keel trips as taps? | Aisha Karimi | Phase 3 design sprint |
| OQ-4 | Should the late-tap grace window (15 min before charges are built) be longer, given real offline patterns from the pilot? | Money Team lead | Phase 1 exit |

## 10. Appendices
- **Glossary:** [Domain Model §2](domain-model.md)
- **Reference material:**
  - [Project Tapline Brief](../Project%20Tapline%20Brief.md): canonical facts, cast and timeline
  - Requirements: [Business](../01-requirements/business-requirements.md), [Functional](../01-requirements/functional-requirements.md), [Non-Functional](../01-requirements/non-functional-requirements.md), [Use Cases](../01-requirements/use-cases-and-user-stories.md)
  - Vantor V7 technical manual (vendor, restricted distribution); Northgate Transit Acquiring Guide (vendor, restricted distribution)
  - PCI DSS v4.0.1; FTA Circular 4702.1B; DOJ ADA Title II web accessibility rule
`;export{e as default};
