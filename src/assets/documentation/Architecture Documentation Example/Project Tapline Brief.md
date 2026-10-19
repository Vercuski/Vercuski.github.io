---
type: reference
domain:
- '[[Architecture]]'
- '[[Toolkit]]'
status: draft
summary: Fictional extra-large program (Project Tapline) used to write a worked example of every architecture documentation template.
aliases:
- Project Tapline
- Tapline
- Architecture Documentation Example
created: 2026-10-17
updated: 2026-10-18
tags: []
---
# Project Tapline Brief

> [!summary] TL;DR
> **Project Tapline** is a fictional program used to write a worked example of every template in [[README|Architecture Documentation Templates]]. Confluence Regional Transit (CRT) replaces its legacy smart-card fare system (**RiverCard**) with an account-based, open-payments fare platform built on .NET 10 and Azure. The program was chosen because it naturally needs all 50 templates.

> [!warning] Everything here is fictional
> All organizations, people, systems, figures and incidents are invented for teaching. Regulations and standards (PCI DSS, FTA Title VI, ADA/WCAG, NIST CSF) are real and are referenced as they would be on a real program.

---

## 1. The pitch

Confluence Regional Transit (CRT) serves a three-county metro of about **2.4M people**. It is retiring **RiverCard**, a 14-year-old, vendor-hosted, closed-loop smart-card system whose vendor support ends on **31 Dec 2028**.

**Tapline** replaces it. Riders tap a contactless bank card, a phone wallet, a CRT card or a CRT app QR code on any of about **5,200 validators** across buses, light rail and the ferry. Fares are calculated in the cloud with daily and weekly **fare capping**, reduced fares are verified with the state, and revenue is **apportioned** among six partner operators. A microtransit partner joins through an API. It is a five-year program (2026–2030) with a capital budget of **$89.6M**.

## 2. Why it needs every template

| Program trait | Templates it drives |
|---|---|
| Money and card data | Data architecture, security architecture, threat model, compliance matrix (PCI DSS), ICD with the payment processor |
| Hardware at the edge on cellular | Network architecture, deployment topology, offline-first ADR, exception request |
| Many outside parties (6 operators, processor, hardware vendor, state agency, retail network) | Integration architecture, ICD, governance framework, ARB minutes, RFC |
| Legacy system holding real customer balances | Gap analysis, transition architecture, migration plan, data migration strategy |
| Rush-hour and event spikes | Capacity planning, SLA/SLO/SLI, observability, runbook, DR plan, postmortem |
| Public agency spending federal money | Business case, roadmap, Title VI fare-equity analysis, ADA/WCAG accessibility |

## 3. Canonical facts

> [!important] Single source of truth
> Every example document must use these figures. If a document needs a new fact, add it here first.

### Organization and service
| Fact | Value |
|---|---|
| Agency | Confluence Regional Transit (CRT); counties: Harbor, Millbrook, Ridgeline |
| Service area population | 2.4M |
| Bus | 1,100 buses, 94 routes, 6 garages |
| Light rail | Blue Line and Gold Line, 46 stations |
| Ferry | 4 vessels, 6 terminals |
| Paratransit | CRT Access — **out of scope** until Phase 4 evaluation |
| Annual ridership (2025) | 96M unlinked trips (~320k boardings per weekday) |
| Peak load | ~1,100 taps/minute on a normal weekday peak; ~3,000/minute after stadium events |
| Design capacity | 12,000 taps/minute (≈10× normal peak, for surges and partner growth) |
| Fare revenue (2025) | $118M per year |
| Cost of fare collection (2025) | $17.8M per year = 15.1% of fare revenue (RiverCard vendor fees $8.2M, cash handling $4.4M, farebox/TVM maintenance $2.8M, card production and retail commissions $2.4M) |
| Estimated fare evasion | $4.8M per year (4.1% of revenue) |
| On-board cash | 22% of bus boardings |
| Bus garages | Northside (210 buses), Ridgeline (160), Eastbank (190), Harbor Point (200), Millbrook Road (170), Riverside (170) |
| Fiscal year | Calendar year |

### Fares
| Fare product | Full fare | Reduced fare |
|---|---|---|
| Single ride (incl. 2-hour transfer) | $2.00 | $1.00 |
| Daily cap | $5.00 | $2.50 |
| Weekly cap (Mon–Sun) | $25.00 | $12.50 |
| Service day | 03:00 to 02:59 local time (the root of the 2027 DST incident) | |
| Legacy RiverCard passes | 7-day $25, 31-day $90 (retired in Phase 2; caps replace them) | 7-day $12.50, 31-day $45 |

### RiverCard (legacy)
| Fact | Value |
|---|---|
| Vendor | Castellan Fare Systems, vendor-hosted, Oracle database |
| In service since | 2012 |
| End of support | 31 Dec 2028 (immovable) |
| Registered cards | 1.1M (~410k used in the last 90 days) |
| Outstanding stored value | $14.7M (2025); $14.0M at January 2028: $9.6M on 640k registered cards, $4.4M on 1.32M unregistered cards |
| Where RiverCard value lives | On the card chip; Castellan keeps a lagging "shadow" balance (2.3% of registered cards differed in trial 2) |
| Reduced-fare enrollments | 38k |
| Autoload configurations | 61k |

### Tapline (target)
| Fact | Value |
|---|---|
| Validators | ~5,200: Vantor V7 on buses (3,300) and rail (1,380); 120 older Vantor V5 on the ferry until Q4 2028 (bought in 2023 under a grant; TLS 1.2 and upload at dock only); plus 400 handheld inspection devices |
| Retail cash network | CornerPay, 420 locations |
| Product teams | Journey (Fare Engine, Fare Policy; lead Ravi Patel) · Rider (accounts, media, eligibility, apps) · Money (payments, ledger, settlement, apportionment) · Edge (validators, Device Gateway, deny list, handhelds) · Platform (AKS, observability, SRE; lead Sam Ortega) |
| Platform stack | .NET 10, ASP.NET Core, Azure (East US 2 primary, Central US secondary), Azure SQL, Event Hubs, AKS, Blazor (portal), .NET MAUI (app), Entra External ID, Bicep, GitHub Actions, OpenTelemetry |
| Capital budget | $89.6M (FTA grant $44.8M, state $26.9M, CRT local $17.9M) |
| 10-year business case | Net benefit +$19.9M, NPV +$10.4M at 4%, payback FY2033 |

## 4. Cast

### Organizations
| Party | Role |
|---|---|
| Confluence Regional Transit (CRT) | Program owner and primary operator |
| Partner operators (6) | Harbor County Transit (HCT), Millbrook Express, Eastbank Commuter Bus, Ridgeline Transit, Confluence State University (CSU) Shuttle, Southport Trolley |
| Northgate Payments | Card acquirer and processor (transit transaction aggregation, tokenization, settlement) |
| Vantor Devices | Validator hardware, firmware and device-management vendor |
| State Department of Human Services (DHS) | Eligibility verification API for reduced fares |
| CornerPay | Retail cash-load network |
| Keel Mobility | Microtransit partner (on-demand zones), joins in Phase 4 |
| Castellan Fare Systems | RiverCard vendor (legacy) |
| Federal Transit Administration (FTA) | Grant funder; Title VI oversight |

### People
| Name | Role | Typical document ownership |
|---|---|---|
| Miguel Serrano | Chief Revenue Officer, executive sponsor | Business case |
| Elena Brooks | Tapline Program Director | Roadmap, migration plan, risk register |
| Priya Raman | Chief Information Officer | Governance framework |
| Dana Okafor | Chief Architect, ARB chair | Vision, SAD, principles, ADR log |
| Aisha Karimi | Lead Solution Architect, Tapline | C4, integration, data architecture |
| Ravi Patel | Principal Engineer, Fare Engine | Component diagram, coding standards |
| Tom Whitaker | Chief Information Security Officer | Security architecture, threat model, compliance matrix |
| Sam Ortega | SRE Lead | Observability, SLOs, runbooks, DR |
| Grace Liu | Director, Fare Policy & Equity | Business requirements, Title VI analysis |
| Nadia Flores | Lead Business Analyst | Functional requirements, use cases |
| Hannah Cole | Money Team lead | Northgate ICD, settlement, ledger runbooks |
| Diego Alvarez | Edge Team lead | Device Gateway, deny list, validator integration |
| Mei Chen | Rider Team lead | Accounts, apps, Rider and Partner APIs |
| Kofi Mensah | Cloud & Network Architect, Platform Team | Network architecture, landing zone, IaC |
| Tomás Reyes | Test & Quality Lead, Platform Team | Test strategy, hardware-lab regression |
| Jordan Hale | Chief Financial Officer | Business case reviewer |
| Marcus Bell | Director, Bus Operations | Migration plan reviewer |
| Linda Park | General Manager, Harbor County Transit; chair of the Partner Operator Council | ICDs and RFCs with partners |
| Jamie Ruiz | Architecture analyst, Program Office; ARB secretary | ARB minutes |

## 5. Program timeline

| Date | Event |
|---|---|
| 2025-11 | CRT Board authorizes the fare modernization study |
| 2026-02-20 | Architecture Vision v1.0 approved |
| 2026-03-18 | Business Case approved (Board Resolution 2026-12) |
| 2026-04-06 | Roadmap baselined; Phase 0 starts |
| Apr–Dec 2026 | **Phase 0 · Foundations** |
| Jan–Aug 2027 | **Phase 1 · Pilot** (Route 12 and the Blue Line) |
| Sep 2027–Jun 2028 | **Phase 2 · Systemwide open payments** |
| 2026-12-18 | Gate 0 passed |
| 2027-03-04 | Vantor V7 + Northgate P2PE solution listed by PCI SSC |
| 2027-03-14 | Spring-forward: the same time defect undercharges 141 pilot riders ($214); unnoticed until the November postmortem |
| 2027-06-11 | Northgate production certification |
| 2027-08-31 | Gate 1 passed (pilot: tap success 99.7%, first-ride losses 0.11%) |
| 2027-11-07 | **Fall-back incident INC-2027-1107-01:** daily cap resets an hour early on the 25-hour service day, and first-pass taps of the repeated hour are stamped an hour late; ~2,140 riders overcharged $3,873, all refunded with a $5 credit |
| 2027-12-08 | ADR-0008 (time handling) accepted |
| 2028-03-12 | Spring-forward handled correctly after the ADR-0008 changes (game day TC-RES-008 on 2028-03-07) |
| 2028-06-30 | Gate 2 passed, with conditions F-1 and F-2 due 2028-10-15 |
| 2028-07-14 | Phase 2 as-built accepted by CRT IT Operations; delivery partner rolls off in August |
| Jan–Dec 2028 | **Phase 3 · RiverCard migration and sunset** (RiverCard off 2028-12-31) |
| Q4 2028 | Ferry validators replaced (expiry of the ferry exception) |
| 2029–2030 | **Phase 4 · Regional partners and microtransit** |

Each example document is dated where it would fall in this timeline, and its frontmatter `status` and `version` reflect that point in the program.

## 6. Story threads

These threads run through several documents so that cross-links point at real content.

1. **Offline validators.** ADR-0004 (offline-first validators with signed deny lists) → threat model → ferry exception request → ARB minutes → "deny-list distribution stalled" runbook.
2. **The DST incident.** On 2027-11-07 (the fall-back night) the Cap Accumulator's "a day is 24 hours" shortcut reset the daily cap an hour early on a 25-hour service day, and the Device Gateway stamped first-pass taps of the repeated hour an hour late. About 2,140 riders were overcharged $3,873. Seeds in earlier documents: the coding standard's `TimeZoneInfo.ConvertTimeToUtc`, Vantor's local-time tap format, and invariant 6 testing only ordinary days. Chain: [postmortem](08-risk-and-operations/incident-postmortem.md) → [ADR-0008](06-decisions-and-standards/adr/0008-time-handling-utc-instants-and-service-day-boundaries.md) → coding standards v2.0 (NodaTime) → risk RSK-19 → DST property tests (TC-FARE-007/008) in the test strategy.
3. **Event backbone choice.** Trade study (Event Hubs vs Confluent Kafka vs Service Bus) → ADR-0003 → tech radar → capacity planning.
4. **RiverCard balance migration.** Gap analysis → transition architecture (both systems running) → data migration ($14.7M reconciled to the cent) → risk register → compliance review.

## 7. Example index

Files mirror the template folder exactly, with the same file names. Links between examples use relative Markdown links, the same convention the templates use.

### 00 · Vision & Strategy
| Status | Example | Covers |
|---|---|---|
| ✅ | [Architecture Vision](00-vision-and-strategy/architecture-vision.md) | "Tap anything, pay the best fare"; goals, stakeholders, scope, success metrics |
| ✅ | [Business Case](00-vision-and-strategy/business-case.md) | Four options, 10-year cost/benefit, recommendation to build the core on commercial devices |
| ✅ | [Architecture Roadmap](00-vision-and-strategy/architecture-roadmap.md) | Phases 0–4, gaps, milestones, cross-phase risks |

### 01 · Requirements
| Status | Example | Covers |
|---|---|---|
| ✅ | [Business Requirements](01-requirements/business-requirements.md) | Fare capping, reduced fare, partner revenue sharing, cash path through retail, equity analysis |
| ✅ | [Functional Requirements](01-requirements/functional-requirements.md) | FR-xxx traced to BR-xxx: tap acceptance, trip building, transfers, caps, refunds, autoload |
| ✅ | [Non-Functional Requirements](01-requirements/non-functional-requirements.md) | Tap decision ≤300 ms offline, 72 h offline operation, 99.95% tap ingestion, no stored card numbers, WCAG 2.2 AA |
| ✅ | [Use Cases / User Stories](01-requirements/use-cases-and-user-stories.md) | Rider taps a bank card; applicant verifies reduced-fare eligibility; operator reviews daily apportionment |

### 02 · Core Architecture
| Status | Example | Covers |
|---|---|---|
| ✅ | [Solution Architecture Document](02-core-architecture/solution-architecture-document.md) | Umbrella narrative linking everything |
| ✅ | [Domain Model](02-core-architecture/domain-model.md) | Fare Policy, Rider Account, Media & Tokens, Journey, Payments & Settlement, Eligibility, Apportionment, Device Fleet |
| ✅ | [Data Architecture](02-core-architecture/data-architecture.md) | Append-only ledger, tap event store, tokenized media, retention, lakehouse |
| ✅ | [Sequence Diagrams](02-core-architecture/sequence-diagrams.md) | Tap → trip → cap → deferred authorization → settlement; deny-list distribution |
| ✅ | [4+1 Views](02-core-architecture/4plus1-views.md) | Tap-pipeline concurrency, Azure + vehicles, stadium-surge scenario |
| ✅ | [C4 Context](02-core-architecture/c4-model/context-diagram.md) | Tapline among riders, operators, processor, fleet, DHS, retail, Keel, RiverCard |
| ✅ | [C4 Container](02-core-architecture/c4-model/container-diagram.md) | App, portal, back-office, Fare API, tap ingestion, Fare Engine, Ledger, Settlement, Device Mgmt, Reporting |
| ✅ | [C4 Component](02-core-architecture/c4-model/component-diagram.md) | Fare Engine internals: rule evaluator, transfer window, cap accumulator, service-day clock |

### 03 · Interfaces & Integration
| Status | Example | Covers |
|---|---|---|
| ✅ | [Integration Architecture](03-interfaces-and-integration/integration-architecture.md) | Events (`TapRecorded`, `TripCompleted`, `CapReached`), partner APIs, SFTP batch, versioning |
| ✅ | [API Specification Guide](03-interfaces-and-integration/api-specification-guide.md) | OpenAPI, AsyncAPI, problem-details errors |
| ✅ | [Interface Control Document](03-interfaces-and-integration/interface-control-document.md) | Tapline ↔ Northgate Payments |

### 04 · Infrastructure & Network
| Status | Example | Covers |
|---|---|---|
| ✅ | [Network Architecture](04-infrastructure-and-network/network-architecture.md) | Card-data zone, vehicle private cellular, station LANs, hub-spoke, link to CRT data center |
| ✅ | [Deployment Topology](04-infrastructure-and-network/deployment-topology.md) | Environments incl. hardware lab, two regions, firmware rings |
| ✅ | [Infrastructure-as-Code Notes](04-infrastructure-and-network/infrastructure-as-code-notes.md) | Bicep repo map, landing-zone modules, promotion |

### 05 · Security
| Status | Example | Covers |
|---|---|---|
| ✅ | [Security Architecture](05-security/security-architecture.md) | Entra External ID, device certificates, tokenization, Managed HSM, audit |
| ✅ | [Threat Model](05-security/threat-model.md) | STRIDE per boundary: spoofed validator, replayed taps, deny-list tampering, refund fraud |

### 06 · Decisions & Standards
| Status | Example | Covers |
|---|---|---|
| ✅ | [ADR-0001](06-decisions-and-standards/adr/0001-record-architecture-decisions.md) | Record architecture decisions, adapted to Tapline |
| ✅ | [ADR Log](06-decisions-and-standards/adr/adr-log.md) | Index of the program's ADRs |
| ✅ | [ADR Template → ADRs](06-decisions-and-standards/adr/adr-template.md) | CRT-tailored template; ADRs [0002](06-decisions-and-standards/adr/0002-account-based-fare-model.md)–[0007](06-decisions-and-standards/adr/0007-services-by-bounded-context.md) (2026) and [0008](06-decisions-and-standards/adr/0008-time-handling-utc-instants-and-service-day-boundaries.md) (2027, from the postmortem) written from it. |
| ✅ | [Architecture Principles](06-decisions-and-standards/architecture-principles.md) | Offline-first edge, append-only ledger, PANs stop at the processor, integrate by contract |
| ✅ | [Coding Standards](06-decisions-and-standards/coding-standards.md) | Money type, NodaTime, idempotent handlers, analyzers |
| ✅ | [Reference Architecture & Tech Radar](06-decisions-and-standards/reference-architecture-and-technology-radar.md) | Adopt / Trial / Assess / Hold |
| ✅ | [Technology Trade Study](06-decisions-and-standards/technology-evaluation-trade-study.md) | Tap ingestion backbone |

### 07 · Governance
| Status | Example | Covers |
|---|---|---|
| ✅ | [Governance Framework](07-governance/governance-framework.md) | ARB with partner seats, decision rights |
| ✅ | [ARB Minutes](07-governance/arb-minutes-template.md) | Approves ADR-0004 and the ferry exception; defers the regional-cap RFC |
| ✅ | [Exception Request](07-governance/architecture-exception-request.md) | Ferry validators: TLS 1.2 and nightly batch until Q4 2028 |
| ✅ | [Compliance Matrix](07-governance/compliance-matrix.md) | PCI DSS v4.0.1, ADA/WCAG, Title VI, state privacy law, NIST CSF 2.0 |
| ✅ | [RFC](07-governance/rfc-template.md) | Regional fare cap across all operators |

### 08 · Risk & Operations
| Status | Example | Covers |
|---|---|---|
| ✅ | [Capacity Planning](08-risk-and-operations/capacity-planning.md) | Peaks, surges, growth, cost |
| ✅ | [Disaster Recovery Plan](08-risk-and-operations/disaster-recovery-plan.md) | Region failover, ledger RPO 0, 72 h offline fleet, settlement replay |
| ✅ | [Incident Postmortem](08-risk-and-operations/incident-postmortem.md) | INC-2027-1107-01, the 2027-11-07 fall-back incident |
| ✅ | [Observability Strategy](08-risk-and-operations/observability-strategy.md) | OpenTelemetry, fleet telemetry, business KPIs |
| ✅ | [Risk Register](08-risk-and-operations/risk-register.md) | Supply chain, PCI scope, balance reconciliation, equity, partner onboarding |
| ✅ | [Runbook](08-risk-and-operations/runbook-template.md) | Deny-list distribution stalled |
| ✅ | [SLA/SLO/SLI Definitions](08-risk-and-operations/sla-slo-sli-definitions.md) | Ingestion, trip latency, portal uptime, settlement by 06:00 |

### 09 · Transition & Migration
| Status | Example | Covers |
|---|---|---|
| ✅ | [Gap Analysis](09-transition-and-migration/gap-analysis.md) | RiverCard vs Tapline |
| ✅ | [Transition Architecture](09-transition-and-migration/transition-architecture.md) | Both systems running, RiverCard bridge |
| ✅ | [Migration Plan](09-transition-and-migration/migration-plan.md) | Garage-by-garage waves, rollback, communications |
| ✅ | [Data Migration Strategy](09-transition-and-migration/data-migration-strategy.md) | 1.1M accounts, $14.7M stored value, enrollments, autoloads |

### 10 · Testing & Validation
| Status | Example | Covers |
|---|---|---|
| ✅ | [Architecture Compliance Review](10-testing-and-validation/architecture-compliance-review.md) | Pre-Phase-2 review against principles, standards, ADRs |
| ✅ | [Test Strategy](10-testing-and-validation/test-strategy.md) | Property-based fare tests, hardware lab, processor certification, load, accessibility |

### 11 · Handover
| Status | Example | Covers |
|---|---|---|
| ✅ | [As-Built Documentation](11-handover/as-built-documentation.md) | What Phase 2 shipped vs design |
| ✅ | [Onboarding / Knowledge Transfer](11-handover/onboarding-knowledge-transfer.md) | Domain primer, repo map, simulated validators |

## 8. Authoring conventions

- **Same file names as the templates**, in the mirrored folder. The frontmatter keeps the template's own fields (`title`, `status`, `owner`, `version`, `last_updated`, `reviewers`, `tags`); `status` and `version` describe the fictional document, not the vault note.
- **Keep every template heading**, in order, and replace guidance blocks with real content. Extra rows or sub-sections are fine; removed sections are not.
- **Write in program order, not folder order**: a postmortem precedes the ADR and coding-standard change it causes, and the as-built comes last.
- **Link, don't duplicate**: follow the template's cross-references and link to the sibling example instead of repeating content.
- **Diagrams in Mermaid** where the template has a `DIAGRAM` placeholder.
- **ID schemes**, used everywhere so references stay consistent:

| Item | Pattern | Defined in |
|---|---|---|
| Business objective | `BO-n` | [Business Requirements](01-requirements/business-requirements.md) |
| Business requirement | `BR-nn` | [Business Requirements](01-requirements/business-requirements.md) |
| Functional requirement | `FR-<area>-nn` (TAP, FARE, CAP, ACCT, PAY, ELIG, CS, INSP, POL, FIN, PART, DEV, MIG, DATA) | [Functional Requirements](01-requirements/functional-requirements.md) |
| Non-functional requirement | `NFR-<area>-nn` (PERF, SCALE, AVAIL, SEC, INTEG, USE, INTEROP, PORT, COST, PRIV) | [Non-Functional Requirements](01-requirements/non-functional-requirements.md) |
| Use case / user story | `UC-nn` / `US-nn` | [Use Cases / User Stories](01-requirements/use-cases-and-user-stories.md) |
| Test case | `TC-<area>-nnn` (incl. HIL = hardware lab, CERT = processor certification, ACC = accessibility, SEC = security) | [Test Strategy](10-testing-and-validation/test-strategy.md) |
| Architecture decision | `ADR-nnnn` | [ADR Log](06-decisions-and-standards/adr/adr-log.md) |

## Related
- [[README|Architecture Documentation Templates]]
- [[Toolkit]]
