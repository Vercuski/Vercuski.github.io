const e=`---
title: "ADR-0003: Azure Event Hubs for Tap Ingestion and Domain Events"
status: accepted
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2026-06-12
reviewers:
  - Architecture Review Board — accepted 2026-06-10
  - Ravi Patel (Principal Engineer, Fare Engine)
  - Sam Ortega (SRE Lead)
tags:
  - adr
---
# ADR-0003: Azure Event Hubs for Tap Ingestion and Domain Events

## 1. Status
Accepted

- **Decision date:** 2026-06-10
- **Deciders:** Dana Okafor, Aisha Karimi, Ravi Patel, Sam Ortega (ARB)
- **Drivers:** NFR-SCALE-01, NFR-AVAIL-04, NFR-AVAIL-05, NFR-AVAIL-07, NFR-INTEG-01, ADR-0002

## 2. Context
Under the account-based model ([ADR-0002](0002-account-based-fare-model.md)), every tap must be captured durably, routed in order per rider, replayable for re-rating and recovery, and archived immutably. Load is about 1,100 taps a minute at normal peak, with a design capacity of 12,000 a minute, and the ledger needs RPO 0 across a region failure. Contexts also need a way to publish business events to each other without coupling.

Three managed options and one self-managed option were evaluated in the [Technology Evaluation / Trade Study](../technology-evaluation-trade-study.md) (2026-06-05).

## 3. Decision
We will use **Azure Event Hubs Premium** as the streaming backbone:
- \`taps\`: 32 partitions, partitioned by media token, 7-day retention, **Capture** to the immutable ADLS archive, and **geo-replication in synchronous mode** to Central US.
- \`rider-taps\`: 32 partitions, partitioned by rider key.
- \`domain-events\`: 16 partitions, carrying CloudEvents with schemas in the Event Hubs schema registry.
- Services use the Azure SDK (\`EventProcessorClient\`) with managed identities and Private Link. Producers use the transactional outbox pattern.
- **Azure Service Bus** remains the choice for commands and work queues (notifications, retries to external systems), not for streams.

## 4. Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| **Confluent Cloud (Kafka)** on Azure | Richest ecosystem; unlimited retention; mature stream processing | New vendor to procure and assess for PCI; higher estimated cost; cross-region replication is asynchronous | Scored 3.95 vs 4.25. Cost and procurement outweighed ecosystem benefits we don't need. |
| **Azure Service Bus Premium** | Team already knows it; sessions give ordering | No replay once consumed; not built for streaming volume; no capture to storage | Scored 3.20. Fails the replay and archive needs. |
| **Self-managed Kafka on AKS** | Full control, no licence | Operating Kafka at this criticality with a 40-person IT department | Excluded: violates the "managed services first" principle |
| **Event Hubs Premium** (chosen) | Managed; partitioned ordering; Capture to ADLS; synchronous geo-replication; Kafka-compatible endpoint keeps an exit path | Retention capped at 90 days; synchronous geo-replication is newer than the rest of the platform | **Chosen** (4.25) |

## 5. Consequences
**Positive:**
- One managed service gives partitioned ordering, replay for 7 days, an immutable archive with no custom code, and synchronous replication for RPO 0.
- The Kafka-compatible endpoint means a later move to Kafka wouldn't require rewriting producers and consumers from scratch.

**Negative:**
- Synchronous geo-replication is a newer capability. RPO 0 depends on it, which is recorded as a risk in the [SAD §8](../../02-core-architecture/solution-architecture-document.md) and tested quarterly.
- The partition count is fixed per hub in practice. 32 was chosen to allow one Fare Engine instance per partition at design capacity; increasing it later means creating a new hub and migrating.
- Processing units must be raised manually ahead of planned surges.

**Neutral / follow-up work required:**
- Replay tooling (\`tapline-replay\`) built in Phase 0.
- Schema registry and compatibility rules ([Integration Architecture §6](../../03-interfaces-and-integration/integration-architecture.md)).
- KEDA scaling on consumer lag ([Deployment Topology §3](../../04-infrastructure-and-network/deployment-topology.md)).

**Reversibility:** Costly but possible. Producers and consumers sit behind CRT abstractions, and the Kafka-compatible endpoint helps. Estimated at 3 team-sprints.

## 6. Related
- [Technology Evaluation / Trade Study](../technology-evaluation-trade-study.md)
- [Container Diagram](../../02-core-architecture/c4-model/container-diagram.md), [Data Architecture §5](../../02-core-architecture/data-architecture.md)
- **Review trigger:** if a quarterly DR test shows synchronous geo-replication losing events, or if retention beyond 90 days becomes a requirement.
`;export{e as default};
