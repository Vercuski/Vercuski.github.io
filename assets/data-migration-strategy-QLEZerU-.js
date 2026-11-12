const t=`---
title: Data Migration Strategy
summary: "Data migration strategy template: sources and targets, migration approach, validation and reconciliation, cutover window, rollback and PII handling."
about: "Plan how you will prove the migrated data is correct before deciding how to move it; reconciliation is usually harder than the copy. Rehearse the migration with realistic volumes to size the cutover window, and treat personal data in transit with the same controls as in production."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - data_migration
  - strategy
---
# Data Migration Strategy — {Project Name}

## 1. Data Sources & Targets
| Source | Target | Volume | Sensitivity |
|---|---|---|---|
| | | | |

## 2. Migration Approach
ETL/ELT, tooling, one-time vs continuous sync.

## 3. Data Validation & Reconciliation
How correctness is verified post-migration.

## 4. Downtime / Cutover Window

## 5. Rollback Plan

## 6. PII / Compliance Considerations
`;export{t as default};
