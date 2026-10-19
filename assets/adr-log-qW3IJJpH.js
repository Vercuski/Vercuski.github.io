const e=`---
title: ADR Log — Project Tapline
status: approved
owner: Dana Okafor (Chief Architect)
version: 1.8.0
last_updated: 2027-12-08
reviewers:
  - Architecture Review Board — log reviewed 2026-09-09; ADR-0008 added 2027-12-08
tags:
  - adr
  - log
---
# Architecture Decision Record Log

Every accepted, proposed, superseded or deprecated ADR for Tapline. The process is in [ADR-0001](0001-record-architecture-decisions.md) and the [Governance Framework](../../07-governance/governance-framework.md). New ADRs use the [Tapline ADR template](adr-template.md).

| # | Title | Status | Date |
|---|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record Architecture Decisions | Accepted | 2026-04-10 |
| [0002](0002-account-based-fare-model.md) | Account-Based Fare Model | Accepted | 2026-04-22 |
| [0003](0003-event-hubs-for-tap-ingestion.md) | Azure Event Hubs for Tap Ingestion and Domain Events | Accepted | 2026-06-10 |
| [0004](0004-offline-first-validators-with-signed-deny-lists.md) | Offline-First Validators with Signed Deny Lists | Accepted | 2026-06-24 |
| [0005](0005-no-card-numbers-in-crt-systems.md) | No Card Numbers in CRT Systems (v1.1: reader-derived media tokens) | Accepted | 2026-05-13 (rev. 2026-09-09) |
| [0006](0006-azure-sql-ledger-tables-for-fare-ledger.md) | Azure SQL Ledger Tables for the Fare Ledger | Accepted | 2026-07-08 |
| [0007](0007-services-by-bounded-context.md) | Services by Bounded Context, Not per Entity | Accepted | 2026-07-22 |
| [0008](0008-time-handling-utc-instants-and-service-day-boundaries.md) | Time Handling: UTC Instants from the Edge, One Source of Service-Day Boundaries | Accepted | 2027-12-08 |

**By theme**
| Theme | ADRs |
|---|---|
| Fare model | 0002 |
| Edge and validators | 0004, 0008 |
| Data and money | 0003, 0006, 0008 |
| Security and PCI | 0005 |
| Structure and process | 0001, 0007 |

**Related decisions recorded elsewhere**
- **Bicep instead of Terraform:** a CRT-wide platform standard, recorded in the CRT landing-zone repository ([IaC Notes §1](../../04-infrastructure-and-network/infrastructure-as-code-notes.md)).
- **Fare levels and caps:** CRT Board fare decisions, not architecture decisions.

**Pending (proposed, not yet decided)**
| Topic | Owner | Expected |
|---|---|---|
| Rider fare week state in Orleans grains (SAD OQ-1) | Ravi Patel | After Phase 1 load results |
| Keel Mobility integration style (SAD OQ-3) | Aisha Karimi | Phase 3 design sprint |
`;export{e as default};
