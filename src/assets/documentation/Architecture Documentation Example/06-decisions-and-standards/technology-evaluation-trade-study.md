---
title: Technology Evaluation / Trade Study — Tap Ingestion and Event Backbone
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2026-06-05
reviewers:
  - Ravi Patel (Principal Engineer, Fare Engine) — scored 2026-06-02
  - Sam Ortega (SRE Lead) — scored 2026-06-02
  - Hannah Cole (Money Team lead) — scored 2026-06-02
  - CRT Procurement — reviewed cost and vendor sections 2026-06-04
  - Dana Okafor (Chief Architect) — approved for ARB 2026-06-05
tags:
  - technology_evaluation
  - trade_study
---

# Technology Evaluation / Trade Study — Tap Ingestion and Event Backbone

> [!summary] Result
> **Azure Event Hubs Premium** scored **4.25 / 5**, ahead of Confluent Cloud (3.95) and Azure Service Bus Premium (3.20). Self-managed Kafka was excluded on a hard constraint. The gap between the top two is small; cost, procurement and Azure-native Capture decided it, not raw capability. Recorded as [ADR-0003](adr/0003-event-hubs-for-tap-ingestion.md).

## 1. Decision Context
- **Decision to be made:** which streaming platform carries taps from the Device Gateway to the Fare Engine, and domain events between contexts.
- **Why now / what's forcing this decision:** the Fare Engine and Device Gateway designs (Phase 0) depend on the platform's ordering, replay and replication guarantees. The Phase 0 walking skeleton must start in July 2026.
- **Decision owner:** Aisha Karimi, for the ARB.
- **Deadline / driver:** ARB of 2026-06-10.
- **Related requirements:**
  - [NFRs](../01-requirements/non-functional-requirements.md): NFR-SCALE-01 (12,000 taps/min), NFR-AVAIL-04 (no lost taps), NFR-AVAIL-05/07 (ledger RPO 0 across regions), NFR-INTEG-01 (re-rating), NFR-COST-01.
  - [ADR-0002](adr/0002-account-based-fare-model.md) (account-based) and the "managed services first" principle.

**Hard constraints (must-haves).** An option failing any of these is excluded, not scored.
1. Ordered delivery per key (rider key / media token).
2. Retention of at least 7 days with consumer-controlled replay.
3. Runs in Azure East US 2 and Central US with Private Link.
4. A managed service: no CRT-operated broker clusters.

## 2. Evaluation Criteria & Weights

| Criterion | Weight (%) | Description / Why It Matters |
|---|---|---|
| Throughput and partitioned ordering | 20 | 200 taps/s sustained at design capacity with per-key order (NFR-SCALE-01) |
| Durability and cross-region replication | 20 | Synchronous or near-zero-loss replication for RPO 0 (NFR-AVAIL-05, -07) |
| Retention, replay and archive | 15 | Replay for re-rating and recovery; immutable archive of raw taps (NFR-INTEG-01, Data Architecture) |
| Operational burden | 15 | CRT's small platform team must run it 24/7 |
| Cost (5-year) | 10 | Must fit within the $2.1M/yr cloud budget (NFR-COST-01) |
| .NET ecosystem and team familiarity | 10 | SDK quality, team skills, hiring |
| Azure integration | 10 | Managed identity, Private Link, Capture, Monitor, one support contract |

**Total: 100%**

## 3. Options Considered
| Option | Summary | Included in Scoring? | Reason if Excluded |
|---|---|---|---|
| A | **Azure Event Hubs Premium**: partitioned log, Kafka-compatible endpoint, Capture, geo-replication | Y | |
| B | **Confluent Cloud** (managed Apache Kafka) on Azure, dedicated cluster | Y | |
| C | **Azure Service Bus Premium**: queues and topics with sessions for ordering | Y | |
| D | **Apache Kafka self-managed on AKS** (Strimzi operator) | N | Fails hard constraint 4 (managed service) |
| E | **Azure SQL as a queue** (outbox tables polled by consumers) | N | Fails constraint 1 at scale in practice and adds load to the databases the Fare Engine depends on. Kept only for the transactional outbox pattern. |

## 4. Scoring Matrix
Scale 1–5 (1 = poor fit, 5 = excellent). Weighted score = raw × weight ÷ 100. Scores are the average of four independent scorers (Karimi, Patel, Ortega, Cole), rounded to the nearest whole point after discussion.

| Criterion | Weight | A: Event Hubs Premium (raw / weighted) | B: Confluent Cloud (raw / weighted) | C: Service Bus Premium (raw / weighted) |
|---|---|---|---|---|
| Throughput and partitioned ordering | 20 | 4 / 0.80 | 5 / 1.00 | 2 / 0.40 |
| Durability and cross-region replication | 20 | 4 / 0.80 | 4 / 0.80 | 3 / 0.60 |
| Retention, replay and archive | 15 | 4 / 0.60 | 5 / 0.75 | 1 / 0.15 |
| Operational burden | 15 | 5 / 0.75 | 4 / 0.60 | 5 / 0.75 |
| Cost (5-year) | 10 | 4 / 0.40 | 2 / 0.20 | 4 / 0.40 |
| .NET ecosystem and team familiarity | 10 | 4 / 0.40 | 3 / 0.30 | 5 / 0.50 |
| Azure integration | 10 | 5 / 0.50 | 3 / 0.30 | 4 / 0.40 |
| **Total** | 100% | **4.25** | **3.95** | **3.20** |

**Sensitivity.** B overtakes A only if throughput and retention together carry about half of all the weight while cost and Azure integration together fall below about 12%. Today they carry 35% and 20%. No scorer proposed weights like that. Changing the weight of durability doesn't change the order, because A and B both score 4.

## 5. Detailed Option Assessments

### 5.1 Option: Azure Event Hubs Premium (A)
- **Description:** managed partitioned log. Premium tier gives dedicated capacity (processing units), up to 90-day retention, Capture to ADLS, geo-replication with a synchronous mode, and a Kafka-compatible endpoint.
- **Strengths:**
  - Ordering per partition key.
  - Capture writes the raw tap archive with no code.
  - Synchronous geo-replication supports RPO 0.
  - Managed identity and Private Link.
  - The Kafka endpoint is an exit path.
- **Weaknesses:**
  - Retention is capped (90 days), so long-term history must live in the archive.
  - The partition count is effectively fixed after creation.
  - No built-in stream processing beyond consumers.
  - Synchronous geo-replication is newer than the rest of the service.
- **Cost implications:** estimated **$95k a year** for 4 PUs in East US 2 plus the geo-replica (Phase 2 load), plus ADLS storage for Capture.
- **Team familiarity / learning curve:** two engineers have production Event Hubs experience; the Azure SDK `EventProcessorClient` is well documented.
- **Ecosystem / community / long-term support:** first-party Azure service under CRT's Enterprise Agreement and Microsoft Unified Support.
- **Migration/exit cost if we need to change later:** moderate. Producers and consumers sit behind CRT abstractions, and the Kafka protocol endpoint allows a staged move.

### 5.2 Option: Confluent Cloud (B)
- **Description:** managed Kafka, dedicated cluster on Azure, with Schema Registry, connectors and Flink stream processing.
- **Strengths:** best-in-class throughput and ecosystem; unlimited retention (tiered storage); mature schema governance; stream processing if Tapline ever needs it.
- **Weaknesses:**
  - Cross-region replication (cluster linking) is asynchronous, so RPO 0 would need the same event-replay design as with A but with a larger loss window.
  - A new vendor for procurement, security assessment and PCI service-provider evidence.
  - Separate support contract.
- **Cost implications:** estimated **$240k a year** for a dedicated cluster with cluster linking at Phase 2 load, plus networking.
- **Team familiarity / learning curve:** one engineer has Kafka experience; Confluent's .NET client is solid but less idiomatic than the Azure SDK.
- **Ecosystem / community / long-term support:** very strong.
- **Migration/exit cost if we need to change later:** low within the Kafka ecosystem; moderate to anything else.

### 5.3 Option: Azure Service Bus Premium (C)
- **Description:** enterprise message broker: queues, topics, sessions, transactions.
- **Strengths:** CRT already uses it; sessions give per-key ordering; dead-lettering built in; geo-disaster recovery.
- **Weaknesses:**
  - Messages are removed when consumed: **no replay**, which is fatal for re-rating and recovery.
  - Session throughput is far below the design capacity in the vendor's guidance.
  - No capture to storage.
- **Cost implications:** estimated **$70k a year** for 4 messaging units in two regions.
- **Team familiarity / learning curve:** highest of all options.
- **Ecosystem / community / long-term support:** first-party Azure.
- **Migration/exit cost if we need to change later:** moderate.

## 6. Recommendation
- **Recommended option:** **A, Azure Event Hubs Premium**, for `taps`, `rider-taps` and `domain-events`. Keep Service Bus for commands and work queues.
- **Deciding factors:**
  - A meets every requirement Tapline actually has, at under half the cost of B.
  - It removes the need to build an archive pipeline, because Capture writes the immutable tap archive directly.
  - It is the only option with synchronous cross-region replication.
  - B's advantages are real but unused: unlimited retention and stream processing. Tapline's long-term record is the archive and the ledger, and its processing is ordinary .NET consumers.
- **Confidence level:** Medium–High. The one significant uncertainty is synchronous geo-replication's maturity.
- **Conditions that would change this recommendation:**
  - Synchronous geo-replication failing the Phase 0 failover test.
  - A requirement for stream joins or windowed aggregation at scale that ordinary consumers can't meet.
  - Event Hubs Premium pricing rising more than 50%.

## 7. Consequences / Risks of Chosen Option
| Risk | Impact | Mitigation |
|---|---|---|
| Synchronous geo-replication immature or adds latency | RPO 0 not met; ingestion latency | Phase 0 failover test in staging; fallback is validators retaining taps 24 h after acknowledgement, plus replay |
| 32 partitions too few for Phase 4 growth | Re-partitioning means a new hub and migration | Sized at 32 for 12,000 taps/min design capacity (~7× expected 2030 normal peak); review at Phase 3 |
| PU capacity insufficient during unannounced surges | Ingestion throttling | Device Gateway buffers and retries; validators hold taps; PU auto-inflate for planned events |
| Retention cap (90 days) | Older replay must come from the archive | Replay tool reads from both Event Hubs and the ADLS archive |

**Trade-offs knowingly accepted:**
- Less ecosystem richness than Kafka, in exchange for lower cost, one vendor and native Capture.
- Partition count fixed early, in exchange for simple, ordered, per-partition single-writer processing.

## 8. Related
- Resulting ADR: [ADR-0003](adr/0003-event-hubs-for-tap-ingestion.md)
- Tech radar entry: Event Hubs **Adopt**; self-managed Kafka **Hold** ([Reference Architecture & Technology Radar](reference-architecture-and-technology-radar.md))
- Requirements driving this decision: [Non-Functional Requirements](../01-requirements/non-functional-requirements.md)
