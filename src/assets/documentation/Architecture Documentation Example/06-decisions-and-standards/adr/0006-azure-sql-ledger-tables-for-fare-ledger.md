---
title: "ADR-0006: Azure SQL Ledger Tables for the Fare Ledger"
status: accepted
owner: Hannah Cole (Money Team lead)
version: 1.0.0
last_updated: 2026-07-08
reviewers:
  - Architecture Review Board — accepted 2026-07-08
  - Jordan Hale (CFO)
  - CRT Internal Audit — consulted 2026-07-01
tags:
  - adr
---
# ADR-0006: Azure SQL Ledger Tables for the Fare Ledger

## 1. Status
Accepted

- **Decision date:** 2026-07-08
- **Deciders:** Hannah Cole, Aisha Karimi, Jordan Hale, Dana Okafor (ARB)
- **Drivers:** FR-FIN-01, FR-FIN-05, NFR-INTEG-01, NFR-AVAIL-05, the "ledger is append-only" principle

## 2. Context
Tapline's ledger records every fare, charge, top-up, refund and settlement: about 150 million transactions a year, holding a stored-value liability of $14.7M or more.

Requirements:
- **Append-only:** corrections are new entries (FR-FIN-01).
- **Balanced:** every transaction's debits equal its credits.
- **Traceable** from tap to bank deposit (FR-FIN-05).
- **Durable:** RPO 0 for the business.
- **Tamper-evident:** CRT Internal Audit asked for evidence, not just a policy, that financial history cannot be altered by anyone, including DBAs. RiverCard's 2024 audit found that vendor staff could edit balances directly in Oracle.

## 3. Decision
We will store the ledger in **Azure SQL Database (Business Critical, zone-redundant)** using **append-only ledger tables** for `ledger_transaction` and `ledger_entry`:
- The database itself rejects `UPDATE` and `DELETE` on these tables, for every principal.
- **Database digests** are generated automatically and stored every 15 minutes in immutable Blob storage, signed with an HSM key. Ledger verification runs nightly and before every audit.
- Balance is enforced by the Ledger Service, which writes each transaction's entries in one database transaction, and checked nightly in SQL.
- Idempotency comes from a unique constraint on `source_event_id`.
- Rows older than 2 years are exported, with their digests, to the immutable financial archive and kept for 7 years.

## 4. Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| **Ordinary SQL tables** with application-enforced append-only and triggers | Simple; familiar | Policy, not proof: a DBA or a bug can still change history | Fails Internal Audit's requirement |
| **Event-sourced ledger in Event Hubs + projections** | Natural fit with the event backbone | Retention capped at 90 days; queries and reconciliation need projections anyway; auditors want SQL | Event Hubs isn't a ledger of record |
| **Azure Confidential Ledger** (blockchain-backed service) | Strong tamper evidence | Designed for small, high-value records, not 150M rows a year with accounting queries; new to CRT | Wrong fit for volume and querying |
| **A purpose-built ledger database** (e.g. TigerBeetle) | Built for double-entry at scale | New technology to CRT; separate operations; auditors unfamiliar | Too much novelty for the system of record |
| **Azure SQL ledger tables** (chosen) | Database-enforced append-only; cryptographic digests; ordinary SQL for reconciliation and audit; familiar to CRT | Ledger tables can't be altered to non-ledger later; schema changes are additive only; some storage overhead for history | **Chosen** |

## 5. Consequences
**Positive:**
- Internal Audit gets cryptographic evidence of integrity, verifiable independently of Tapline staff.
- Reconciliation and finance queries are plain SQL, supported by tools CRT already uses.

**Negative:**
- Schema changes to ledger tables are additive only. Mistakes in column design can't be dropped, only superseded.
- Business Critical tier costs more than General Purpose. It is accepted for the zone-redundant, synchronous in-region replicas.
- Cross-region geo-replication is still asynchronous. RPO 0 relies on replaying events ([Data Architecture §5](../../02-core-architecture/data-architecture.md)).

**Neutral / follow-up work required:**
- Nightly ledger verification job and alert.
- Digest storage in an immutable container in the separate audit subscription.
- Archive-and-verify procedure for rows older than 2 years.

**Reversibility:** Costly. Data can be exported, but the tamper-evidence chain would have to be re-established in any new store.

## 6. Related
- [Data Architecture](../../02-core-architecture/data-architecture.md), [Domain Model: Ledger Transaction](../../02-core-architecture/domain-model.md)
- [ADR-0003](0003-event-hubs-for-tap-ingestion.md) (event replay for RPO 0)
- **Review trigger:** if ledger write throughput approaches 70% of capacity, or if Azure SQL ledger features change.
