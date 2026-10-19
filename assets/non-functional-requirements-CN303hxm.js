const e=`---
title: Non-Functional Requirements — Project Tapline
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.1.0
last_updated: 2026-09-12
reviewers:
  - Dana Okafor (Chief Architect) — approved 2026-07-15
  - Tom Whitaker (CISO) — approved 2026-07-16
  - Sam Ortega (SRE Lead) — approved 2026-07-16
  - Marcus Bell (Director, Bus Operations) — approved NFR-PERF-01 and NFR-AVAIL-03 on 2026-07-17
tags:
  - non_functional_requirements
---

# Non-Functional Requirements — Project Tapline

> [!summary] The five that shape the architecture
> 1. **Tap decision within 300 ms, online or offline** (NFR-PERF-01): drives offline-first validators and local deny lists.
> 2. **Fare collection survives 72 hours without a network** (NFR-AVAIL-03): drives store-and-forward taps.
> 3. **No tap is ever lost, and no fare is wrong by a cent** (NFR-AVAIL-04, NFR-INTEG-01): drives the append-only ledger and deterministic fare engine.
> 4. **Surge to 12,000 taps a minute** (NFR-SCALE-01): drives event streaming for tap ingestion.
> 5. **No card numbers in CRT systems** (NFR-SEC-01): drives tokenization and the PCI scope design.

IDs follow \`NFR-<area>-nn\`. Each requirement traces to the [Business Requirements](business-requirements.md) (BR) or a [Vision success criterion](../00-vision-and-strategy/architecture-vision.md) (S). Requirements marked ★ are architecturally significant and have a full quality-attribute scenario. Service-level objectives for operations are defined from these targets in the [SLA/SLO/SLI Definitions](../08-risk-and-operations/sla-slo-sli-definitions.md).

**Change history:** v1.1 (2026-09-12) reworded NFR-SEC-01 to describe P2PE and reader-derived media tokens (ADR-0005 v1.1). Targets unchanged.

**Load reference.** These figures are from the [Project Tapline Brief](../Project%20Tapline%20Brief.md):

| Measure | Value |
|---|---|
| Normal weekday peak | ~1,100 taps/minute |
| Event surge (stadium) | ~3,000 taps/minute |
| Design capacity | 12,000 taps/minute (200 per second) |

## 1. Performance

| ID | Metric | Target | Notes |
|---|---|---|---|
| NFR-PERF-01 ★ | Validator accept/deny decision time, from card presented to result shown | p99 ≤ 300 ms, online or offline | S7, BR-07. Today's fareboxes take about 900 ms. |
| NFR-PERF-02 | Tap upload: from tap to receipt in the cloud, while the validator is connected | p95 ≤ 30 s | Validators upload in small batches |
| NFR-PERF-03 ★ | Tap to account: from tap received in the cloud to the trip, fare and cap progress shown in the app | p95 ≤ 60 s; p99 ≤ 5 min | FR-CAP-06 |
| NFR-PERF-04 ★ | Deny-list propagation: from a medium being blocked in the back office to every connected validator denying it | p95 ≤ 15 min | FR-TAP-06. Size: up to 5M entries; full list ≤ 40 MB compressed. |
| NFR-PERF-05 | Rider app and portal page response (server time) | p95 ≤ 500 ms; p99 ≤ 1.5 s | Excludes payment-processor round trips |
| NFR-PERF-06 | Fare API (partner and app APIs) | p95 ≤ 250 ms | |
| NFR-PERF-07 | Daily settlement: card charges for a service day sent to Northgate | Sent by 04:00; settlement and reconciliation done by 06:00 | FR-PAY-01, FR-FIN-02 |
| NFR-PERF-08 | Handheld inspection check | p95 ≤ 2 s | FR-INSP-01 |

**Scenario NFR-PERF-01: boarding at the front door**

| Element | Value |
|---|---|
| Source | Rider |
| Stimulus | Taps a contactless bank card on a bus validator |
| Environment | Weekday peak; the bus is in a tunnel with no cellular signal |
| Artifact | Validator software and its local deny list |
| Response | Shows accept or deny with tone and color, and stores the signed tap for upload |
| Response Measure | p99 ≤ 300 ms from card presented to result shown; no back-office call made |

**Scenario NFR-PERF-03: rider checks cap progress**

| Element | Value |
|---|---|
| Source | Rider |
| Stimulus | Third tap of the day on the Blue Line, then opens the app |
| Environment | Normal peak load (1,100 taps/min), validator online |
| Artifact | Tap ingestion, Fare Engine, account read model |
| Response | App shows the trip, a $1.00 charge, and "Daily cap reached" |
| Response Measure | Visible within 60 s of the tap for 95% of taps |

## 2. Scalability

**Expected growth**

| Dimension | 2027 (Phase 1–2) | 2030 (all partners) | Design limit |
|---|---|---|---|
| Taps per year | 96M | ~120M (+22M from partners, plus growth) | 250M |
| Normal peak taps per minute | 1,100 | 1,400 | — |
| Surge peak taps per minute | 3,000 | 4,000 | 12,000 |
| Accounts | 300k | 1.2M | 3M |
| Linked media | 600k | 2.5M | 6M |
| Validators | 5,200 | 6,900 | 10,000 |
| Ledger entries per year | ~150M | ~190M | 500M |

| ID | Requirement | Target |
|---|---|---|
| NFR-SCALE-01 ★ | Tap ingestion absorbs a surge to the design capacity without losing taps or breaching NFR-PERF-03's p99 | 12,000 taps/min sustained for 30 min |
| NFR-SCALE-02 | Adding a partner operator needs configuration and capacity changes only, with no code change | Demonstrated at Phase 4 onboarding |
| NFR-SCALE-03 | Capacity is added by scaling out stateless services and partitions, not by larger machines | No single instance is a throughput bottleneck at design capacity |

**Strategy:** the cloud scales horizontally. Tap ingestion is partitioned by medium token, so all taps for one medium are processed in order. Fare Engine workers scale with partition count. The ledger database scales vertically within a tier, with ledger-entry archiving after 13 months keeping the working set small. Validators are the edge tier and scale with the fleet, needing no central coordination for a tap. Detailed numbers are in [Capacity Planning](../08-risk-and-operations/capacity-planning.md).

**Scenario NFR-SCALE-01: stadium surge**

| Element | Value |
|---|---|
| Source | 18,000 fans leaving a stadium event |
| Stimulus | Taps at 4 rail stations and 40 extra buses within 20 minutes, while 120 buses that were offline in the stadium garage reconnect and upload stored taps at once |
| Environment | Saturday 22:30, with normal network load elsewhere |
| Artifact | Tap ingestion, Fare Engine |
| Response | All taps accepted at validators; backlog processed in order per medium |
| Response Measure | No tap lost; backlog cleared within 10 minutes; NFR-PERF-03 p99 ≤ 5 min holds |

## 3. Availability

| ID | Metric | Target |
|---|---|---|
| NFR-AVAIL-01 | Rider app and portal availability | 99.9% monthly (about 43 min a month) |
| NFR-AVAIL-02 | Tap ingestion endpoint availability | 99.95% monthly (about 22 min a month) |
| NFR-AVAIL-03 ★ | Validator operation with no connection to the cloud | ≥ 72 hours, accepting taps and storing ≥ 50,000 taps |
| NFR-AVAIL-04 ★ | Tap durability | Zero taps lost once accepted by a validator |
| NFR-AVAIL-05 | Fare ledger | RTO 1 hour; **RPO 0** (no committed entry lost) |
| NFR-AVAIL-06 | Other cloud services | RTO 4 hours; RPO 5 minutes |
| NFR-AVAIL-07 | Region failure | Ledger and tap ingestion keep running from the secondary region within RTO; validators are unaffected because they hold taps locally |

**Scenario NFR-AVAIL-03: network outage**

| Element | Value |
|---|---|
| Source | Cellular carrier |
| Stimulus | Regional cellular outage cuts every bus off from the cloud |
| Environment | Weekday, all day |
| Artifact | Validator fleet; deny-list freshness |
| Response | Validators keep accepting and denying taps using their last deny list, store taps locally, and upload everything when service returns |
| Response Measure | No interruption to boarding for up to 72 h; 100% of stored taps uploaded and processed within 2 h of reconnection; first-ride-risk losses during the outage ≤ 0.5% of card fare revenue for the affected days |

**Scenario NFR-AVAIL-07: Azure region failure**

| Element | Value |
|---|---|
| Source | Azure East US 2 regional outage |
| Stimulus | Primary region unavailable |
| Environment | Weekday 08:00 (peak) |
| Artifact | Cloud platform (ingestion, Fare Engine, ledger, app back end) |
| Response | Failover to Central US; validators keep storing taps during failover |
| Response Measure | Tap ingestion and ledger back within 1 h; zero ledger entries lost; app read-only within 1 h and fully back within 4 h |

The recovery plan is in the [Disaster Recovery Plan](../08-risk-and-operations/disaster-recovery-plan.md).

## 4. Security

| ID | Requirement | Source |
|---|---|---|
| NFR-SEC-01 ★ | No primary account number (PAN), card verification value or track data is stored, processed or sent by any CRT system. Validators use point-to-point encryption (P2PE): card data is encrypted in the reader and only Northgate can decrypt it. Tapline identifies bank cards by a media token (an irreversible keyed hash), Northgate's payment token (card-data zone only), and last 4 digits and expiry for display. | BR-23 |
| NFR-SEC-02 | Riders sign in with a password plus a one-time code, or with a passkey. Staff sign in with CRT single sign-on and phishing-resistant MFA. | BR-10 |
| NFR-SEC-03 | Access is role-based and least-privilege. Sensitive actions (refunds, fare rule changes, deny-list overrides) need two people (FR-CS-02, FR-POL-02). | BR-13, BR-15 |
| NFR-SEC-04 | Every validator authenticates with its own device certificate (mutual TLS). Taps and deny lists are signed, and a validator rejects an unsigned or wrongly signed deny list. | BR-08, BR-16 |
| NFR-SEC-05 | Data is encrypted in transit (TLS 1.2 minimum, 1.3 preferred) and at rest. Signing and encryption keys are held in a hardware security module. | BR-23, BR-26 |
| NFR-SEC-06 | Every staff action on accounts, money or fare rules is written to a tamper-evident audit log. The log is kept online for 1 year and archived for 7. | BR-16 |
| NFR-SEC-07 | Data classification: **Restricted** (payment tokens, keys), **Confidential** (rider identity, trip history, eligibility), **Internal** (de-identified usage), **Public** (fare tables, GTFS). Handling rules per class are in the Security Architecture. | BR-26 |

**Compliance:** PCI DSS v4.0.1 (SAQ or ROC scope to be set by the PCI scoping review), state consumer privacy law, NIST CSF 2.0 as CRT's security framework. Details are in the [Security Architecture](../05-security/security-architecture.md) and [Compliance Matrix](../07-governance/compliance-matrix.md).

## 5. Maintainability

- **Fare rule changes are data, not code.** A fare change goes live through FR-POL-01 with no deployment (BR-15).
- **Quality gates on every pull request:** build, unit tests, ≥ 80% line coverage on the Fare Engine and ledger (≥ 60% elsewhere), .NET analyzers with warnings treated as errors, dependency vulnerability scan, and an architecture-rules test that enforces layer boundaries.
- **Platform currency:** runtime on a supported .NET LTS release; move to each new LTS within 12 months of its release. No component may run on an out-of-support runtime or database version.
- **Deployability:** any service can be deployed independently, in business hours, with no downtime. Rollback within 15 minutes.
- **Documentation:** every architecturally significant decision is an ADR (see the [ADR Log](../06-decisions-and-standards/adr/adr-log.md)). Every service has a README, an owner, and a runbook for each alert it raises.
- **Standards:** the [Coding Standards](../06-decisions-and-standards/coding-standards.md) apply to all CRT-built code.

## 6. Observability

- **Tracing:** every tap carries a correlation ID from the validator through ingestion, the Fare Engine, the ledger and settlement, so a single tap can be followed end to end (supports FR-FIN-05). OpenTelemetry for all services.
- **Metrics:** RED metrics (rate, errors, duration) for every service; business metrics for taps per minute, tap-to-account latency, cap events, declined charges, and settlement differences.
- **Logs:** structured JSON logs, with no restricted or confidential data in plain text. 30 days hot, 1 year archived.
- **Fleet telemetry:** each validator reports a heartbeat every 5 minutes with its software version, deny-list version, stored-tap count and hardware health.
- **Alerting:** every alert is linked to a runbook, and every SLO has an error-budget burn alert.
- Details are in the [Observability Strategy](../08-risk-and-operations/observability-strategy.md).

## 7. Other Quality Attributes

| ID | Attribute | Requirement |
|---|---|---|
| NFR-INTEG-01 ★ | Financial correctness | Every fare is right to the cent and reproducible: recalculating any past service day gives an identical result (FR-FARE-06). The ledger balances to zero every day. |
| NFR-USE-01 | Accessibility | App and portal meet WCAG 2.2 AA (the DOJ Title II rule's legal minimum is 2.1 AA). Validators give audio and visual feedback, with screens readable in direct sunlight, and are mounted within ADA reach ranges. |
| NFR-USE-02 | Languages | All rider-facing content in English, Spanish, Vietnamese and Simplified Chinese (BR-25). |
| NFR-USE-03 | Validator feedback | Accept/deny is clear without reading: distinct tones, colors and icons, tested with the Accessibility Advisory Committee. |
| NFR-INTEROP-01 | Open standards | Publish fares as GTFS-Fares v2; stops and routes come from CRT's GTFS feed. Partner and app APIs are documented with OpenAPI, events with AsyncAPI. |
| NFR-PORT-01 | Vendor independence | Validators and the payment processor can be replaced without changing the Fare Engine or ledger: both sit behind CRT-owned interfaces. |
| NFR-COST-01 | Cost | Platform operating cost (cloud, processor platform fees, device support and team) stays within $11.2M a year at steady state (Business Case). Cloud spend target ≤ $2.1M a year, reviewed monthly. |
| NFR-PRIV-01 | Privacy | Trip history kept 13 months by default, or 90 days at the rider's choice (FR-DATA-02). Financial records kept 7 years without trip locations once trip history expires. |

**Scenario NFR-INTEG-01: late-arriving taps**

| Element | Value |
|---|---|
| Source | Validator on a bus that was offline for 2 days |
| Stimulus | Uploads 1,900 stored taps after the affected service days have already been settled |
| Environment | Normal operation, two days after a fare-rule change |
| Artifact | Fare Engine, ledger, settlement |
| Response | Taps are rated with the fare rules in effect when they were made (FR-FARE-04); caps are recalculated for the affected days; adjustments are posted as new ledger entries and included in the next settlement |
| Response Measure | Every affected rider's charges equal what they would have been if the taps had arrived on time, to the cent; the ledger still balances |

## 8. Prioritization / Trade-offs

When these qualities conflict, the following order applies. It was agreed at the ARB on 2026-07-15.

1. **Money correctness over speed of posting.** A fare can be late, but never wrong. Ledger writes are strongly consistent; if the ledger is unavailable, taps queue durably and are posted later (NFR-INTEG-01 and NFR-AVAIL-04 over NFR-PERF-03).
2. **Boarding speed and availability over up-to-the-minute fare enforcement.** Validators decide locally and accept first-ride risk, rather than waiting on the network (NFR-PERF-01 and NFR-AVAIL-03 over NFR-PERF-04).
3. **Smaller PCI scope over convenience.** CRT never holds card numbers, even though customer service must search by last 4 digits and expiry instead (NFR-SEC-01 over FR-CS-01 usability).
4. **Rider privacy over analytics detail.** Reports use de-identified data with small-group suppression, even where named data would allow finer analysis (NFR-PRIV-01 over FR-DATA-01 granularity).
5. **Vendor independence over time to market.** CRT-owned interfaces around validators and the processor, even where a vendor SDK would be faster (NFR-PORT-01).
6. **Cost** is optimized within the constraints above, never at their expense.
`;export{e as default};
