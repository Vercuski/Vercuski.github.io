---
title: "C4 Model — Level 1: System Context — Project Tapline"
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2026-08-07
reviewers:
  - Dana Okafor (Chief Architect) — approved 2026-08-05
  - Miguel Serrano (Chief Revenue Officer) — reviewed 2026-08-06
  - Linda Park (Partner Operator Council) — reviewed 2026-08-07
tags:
  - context_diagram
  - system_design
---
# C4 Model — Level 1: System Context — Project Tapline

## 1. Purpose
Shows Tapline as a single black box: who uses it, and which other systems it depends on or serves. Written for the CRT Board, partner operators and non-technical staff. Technology detail is in the [Container Diagram](container-diagram.md).

```mermaid
flowchart TB
    rider(["👤 Rider<br/>Pays fares, manages account"])
    rrider(["👤 Reduced-fare rider<br/>Senior, disability or low income"])
    inspector(["👤 Fare inspector<br/>Checks proof of payment"])
    staff(["👤 CRT staff<br/>Customer service, revenue,<br/>fare policy, operations"])
    partner(["👤 Partner operator staff<br/>Six regional operators"])

    tapline["<b>Tapline</b><br/>Account-based fare system:<br/>accepts taps, calculates fares and caps,<br/>manages accounts, collects and<br/>accounts for every fare"]

    northgate["Northgate Payments<br/>Card processor"]
    dhs["State DHS<br/>Eligibility verification"]
    cornerpay["CornerPay<br/>Retail cash network"]
    vantor["Vantor Fleet Cloud<br/>Validator vendor services"]
    erp["CRT ERP<br/>General ledger"]
    gtfs["CRT Scheduling<br/>Routes, stops (GTFS)"]
    rivercard["RiverCard<br/>Legacy fare system<br/>(until 2028-12-31)"]
    keel["Keel Mobility<br/>Microtransit (Phase 4)"]
    bank["CRT bank<br/>Deposit account"]

    rider -- "Taps card or phone; uses app and website" --> tapline
    rrider -- "Applies for and uses reduced fares" --> tapline
    inspector -- "Checks whether riders have paid" --> tapline
    staff -- "Serves riders, sets fares, reconciles money,<br/>watches equipment" --> tapline
    partner -- "Sets own fares; receives revenue statements" --> tapline

    tapline -- "Charges cards, gets settlement reports" --> northgate
    northgate -- "Deposits card revenue" --> bank
    tapline -- "Checks benefit enrollment" --> dhs
    cornerpay -- "Sends cash loads" --> tapline
    tapline -- "Manages validator hardware and software" --> vantor
    tapline -- "Posts daily journal entries" --> erp
    gtfs -- "Supplies routes and stops" --> tapline
    tapline <-- "Accepts old cards; migrates balances" --> rivercard
    keel -- "Charges microtransit trips (Phase 4)" --> tapline

    classDef person fill:#08427b,stroke:#052e56,color:#fff
    classDef system fill:#1168bd,stroke:#0b4884,color:#fff
    classDef external fill:#999999,stroke:#6b6b6b,color:#fff
    classDef legacy fill:#b8860b,stroke:#7a5a07,color:#fff
    class rider,rrider,inspector,staff,partner person
    class tapline system
    class northgate,dhs,cornerpay,vantor,erp,gtfs,keel,bank external
    class rivercard legacy
```

## 2. Actors & External Systems
| Name | Type (Person/System) | Relationship / Description |
|---|---|---|
| Rider | Person | Taps a bank card, phone, CRT card or app ticket to ride. Optionally opens an account to see trips, add money and manage cards. About 410k active riders today. |
| Reduced-fare rider | Person | A rider with senior, disability or low-income status. Pays reduced fares and caps. |
| Fare inspector | Person | CRT staff on rail and ferry who check that riders have paid, using a handheld device. |
| CRT staff | Person | Customer service agents, revenue analysts, fare-policy analysts and operations supervisors using back-office tools. |
| Partner operator staff | Person | Finance and fare-policy staff at the six partner operators. They set their own fares and receive daily revenue statements (from Phase 4). |
| Northgate Payments | System (external) | CRT's card processor. Supplies payment tokens for cards, approves combined daily charges, and sends settlement reports. Governed by the [Northgate ICD](../../03-interfaces-and-integration/interface-control-document.md). |
| CRT bank | System (external) | Receives card revenue deposits from Northgate and retail deposits from CornerPay. Shown for completeness; Tapline reads deposit files only for reconciliation. |
| State DHS | System (external) | Confirms whether an applicant is enrolled in SNAP or Medicaid, for low-income reduced fares. |
| CornerPay | System (external) | 420 retail locations where riders add cash to CRT cards and accounts. |
| Vantor Fleet Cloud | System (external) | Vantor's device-management service: firmware updates, hardware diagnostics and warranty. Tapline drives it through its API. |
| CRT ERP | System (internal, outside Tapline) | CRT's financial system. Receives daily summarized journal entries. |
| CRT Scheduling | System (internal, outside Tapline) | Source of truth for routes, stops and service patterns, published as GTFS. |
| RiverCard | System (legacy, external) | Castellan Fare Systems' legacy fare system. Tapline accepts RiverCard cards during the transition and migrates accounts and balances before switch-off on 31 Dec 2028. |
| Keel Mobility | System (external) | Microtransit partner. From Phase 4, charges on-demand trips to Tapline accounts. |

## 3. Notes
- **Validators are part of Tapline**, not an external system. They are CRT-owned devices running CRT-specified software and configuration, even though Vantor supplies the hardware. This is why the boundary includes them, and why Vantor's cloud service appears separately as an external system.
- **Partner operators are users of Tapline**, not external systems. Once they join they don't run their own fare systems. Their staff use the Partner Portal, and their finance systems pull statements through the Partner API (one partner uses an SFTP file instead). Those interfaces are detailed in the [Integration Architecture](../../03-interfaces-and-integration/integration-architecture.md) rather than drawn here.
- **RiverCard** is drawn in a different color because it disappears at the end of 2028. After that, this diagram loses one box and nothing else changes.
- Keep this diagram free of technology. If a box needs a product name to make sense, it belongs on the [Container Diagram](container-diagram.md).
