---
title: Data Architecture
summary: "Data architecture template: conceptual and logical data models, data dictionary, data flows, storage and retention, governance and data classification."
about: "This covers the physical and logical side of data: where it is stored, how it moves, how long it is kept and who owns it. Flag personal data in the data dictionary from the start; it drives classification, encryption and retention decisions. The domain model template covers the conceptual, business-language side."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - data_architecture
---

# Data Architecture — {Project Name}

> Guidance: This document covers physical/logical data concerns — storage,
> flow, retention, governance. For the conceptual/DDD-flavored model and
> ubiquitous language, see `domain-model.md`.

## 1. Conceptual Data Model
<!-- DIAGRAM: entity relationship diagram (conceptual) -->

## 2. Logical Data Model
<!-- DIAGRAM: ERD (logical, with attributes/keys) -->

## 3. Data Dictionary
| Entity | Attribute | Type | Description | PII? |
|---|---|---|---|---|
| | | | | |

## 4. Data Flow
<!-- DIAGRAM: data flow diagram across systems -->

## 5. Data Storage Strategy
| Data Type | Store | Retention | Backup Strategy |
|---|---|---|---|
| | | | |

## 6. Data Governance
Ownership, quality rules, master data management.

## 7. Data Classification & Privacy
Sensitivity levels, PII handling, anonymization/pseudonymization approach.
