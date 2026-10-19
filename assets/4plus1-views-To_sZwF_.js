const e=`---
title: 4+1 View Model — Project Tapline
status: approved
owner: Dana Okafor (Chief Architect)
version: 1.0.0
last_updated: 2026-10-02
reviewers:
  - Aisha Karimi (Lead Solution Architect) — approved 2026-09-30
  - Sam Ortega (SRE Lead) — approved physical view 2026-10-01
  - Ravi Patel (Principal Engineer, Fare Engine) — approved 2026-10-02
tags:
  - 4plus1
---

# 4+1 View Model — Project Tapline

> [!summary] Why both C4 and 4+1
> The C4 diagrams answer "what are the boxes?" for everyone. This document answers the questions engineers and operators keep asking that C4 doesn't: what runs concurrently and in what order (process view), how the code is laid out (development view), and what runs where (physical view). The five scenarios at the end check that the four views agree with each other.

## 1. Logical View
> Audience: developers, designers.

The logical view is the aggregates and services of the [Domain Model](domain-model.md), arranged by bounded context. This class diagram shows the key abstractions and the main operations on them. It is not a database model; for that, see the [Data Architecture](data-architecture.md).

\`\`\`mermaid
classDiagram
    direction LR
    class RiderFareWeek {
        +RiderKey riderKey
        +LocalDate weekStart
        +List~Trip~ trips
        +Money weeklyTotal
        +Apply(Tap tap, IFareRules rules) FareDelta
    }
    class Trip {
        +TripId id
        +Instant firstTap
        +OperatorCode operator
        +Money baseFare
        +Money cappedFare
    }
    class FareRuleVersion {
        +VersionId id
        +OperatorCode operator
        +LocalDateTime effectiveFrom
        +Money FareFor(FareCategory c)
        +Duration transferWindow
        +Caps caps
    }
    class Account {
        +AccountId id
        +List~MediumLink~ media
        +PrivacySetting privacy
        +Link(MediaToken t)
        +Block(MediaToken t)
    }
    class Medium {
        +MediaToken token
        +MediumType type
        +MediumStatus status
    }
    class Charge {
        +ChargeId id
        +MediaToken token
        +LocalDate serviceDate
        +Money amount
        +ChargeStatus status
    }
    class LedgerTransaction {
        +TransactionId id
        +EventId sourceEvent
        +List~LedgerEntry~ entries
        +IsBalanced() bool
    }
    class DenyList {
        +long version
        +Delta BuildDelta(changes)
    }
    RiderFareWeek "1" *-- "many" Trip
    Trip ..> FareRuleVersion : rated with
    Account "1" o-- "0..5" Medium
    Charge ..> LedgerTransaction : recorded as
    RiderFareWeek ..> LedgerTransaction : FareCalculated
    Medium ..> DenyList : blocked or in debt
\`\`\`

**Key abstractions shared across contexts** live in a small \`Tapline.SharedKernel\` package: \`Money\` (integer cents plus currency, with no floating point anywhere), \`MediaToken\`, \`RiderKey\`, \`OperatorCode\` and the event envelope. Nothing else is shared. Contexts integrate through events and APIs, not shared classes.

## 2. Process View
> Audience: integrators, performance engineers.

Tapline has three kinds of runtime process with very different behavior:

| Process | Runs | Concurrency model | Ordering guarantee |
|---|---|---|---|
| **Validator software** | Continuously on ~5,200 devices | Single process per device: a reader thread, an upload thread and a deny-list thread | Taps signed and stored in device order; the upload thread never deletes before acknowledgement |
| **Streaming pipeline:** Device Gateway → Tap Router → Fare Engine → Ledger Service | Continuously in the cloud | Stateless gateway pods; Tap Router and Fare Engine own Event Hubs partitions; one writer per rider key | Per media token in \`taps\`; per rider key in \`rider-taps\`; none across riders, and none needed |
| **Scheduled jobs:** Settlement, deny-list full build, de-identification, GL post, apportionment | Nightly windows | One active instance per job (leader election through a Blob lease) | Fixed chain, below |
| **Request/response APIs:** Account, Payments, Fare Policy, Device Management | On demand | Stateless pods behind API Management; scale on CPU and requests | Per request; writes use optimistic concurrency |

**Nightly chain** (times are local):

\`\`\`mermaid
gantt
    title Nightly processing window
    dateFormat HH:mm
    axisFormat %H:%M
    section Service day
    Service day closes (02:59)          :milestone, 02:59, 0m
    Late-tap grace                       :03:00, 15m
    section Money
    Build charges                        :charges, 03:15, 30m
    Send charge file (by 04:00)          :send, after charges, 15m
    Northgate processing                 :ng, after send, 75m
    Reconcile settlement                 :rec, 05:30, 20m
    Post GL journal (by 06:00)           :gl, after rec, 10m
    section Fleet
    Build full deny list                 :03:15, 20m
    section Analytics
    De-identification and lakehouse load :04:00, 90m
\`\`\`

**Back-pressure and surge behavior.** If the Fare Engine falls behind, for example during the stadium surge in [NFR-SCALE-01](../01-requirements/non-functional-requirements.md), taps simply wait in \`rider-taps\`, which holds 7 days. Nothing upstream slows down: validators and the Device Gateway only need Event Hubs to accept writes. The Fare Engine scales out on consumer lag (KEDA on AKS) up to one instance per partition. Lag is the main operational metric for this pipeline.

## 3. Development View
> Audience: developers, project management.

Code is split into four repositories by lifecycle, not by team:

\`\`\`text
tapline-platform/              .NET 10 solution: all CRT-built cloud services
├── src/
│   ├── SharedKernel/          Money, MediaToken, RiderKey, event envelope
│   ├── Journey/               Domain, Application, Infrastructure, Worker (Fare Engine, Tap Router)
│   ├── FarePolicy/            Domain, Application, Infrastructure, Api
│   ├── Accounts/              Modules: RiderAccount, Media, Eligibility; one Api host
│   ├── Payments/              Domain, Application, Infrastructure, Api, SettlementJobs
│   ├── Ledger/                Domain, Infrastructure, Worker, Api
│   ├── DeviceFleet/           DeviceGateway, DenyList, DeviceManagement
│   ├── Integration/           Adapters: Dhs, CornerPay, Erp, Partners
│   ├── Apportionment/         Phase 4
│   └── Contracts/             Event schemas (JSON Schema) and generated C# types
├── tests/                     Unit, property-based, contract, architecture tests per context
└── build/                     Directory.Build.props, analyzers, shared CI templates
tapline-apps/                  .NET MAUI Rider App and Inspection App; Blazor portals
tapline-edge/                  Validator configuration, deny-list format, Vantor integration test kit
tapline-infra/                 Bicep modules and environment definitions
\`\`\`

- **Layering inside each context** follows Onion / Clean Architecture: \`Domain\` depends on nothing; \`Application\` depends on \`Domain\`; \`Infrastructure\` and the host projects depend inward. An architecture test (NetArchTest) fails the build if a dependency points outward or if one context references another context's internals.
- **Contexts talk through \`Contracts\` only.** Event types are generated from JSON Schema in \`Contracts/\`. A context may reference \`Contracts\` and \`SharedKernel\`, nothing else from another context.
- **Build and release:** GitHub Actions. Each context builds and deploys independently (path filters), producing one container image per host. Promotion is dev → test → hardware lab → staging → production, with production deployment gated on the hardware-lab regression suite. Details are in [Deployment Topology](../04-infrastructure-and-network/deployment-topology.md) and [IaC Notes](../04-infrastructure-and-network/infrastructure-as-code-notes.md).
- **Code standards:** [Coding Standards](../06-decisions-and-standards/coding-standards.md).

## 4. Physical View
> Audience: system engineers, ops.

\`\`\`mermaid
flowchart TB
    subgraph field["Field (CRT assets)"]
        bus["1,100 buses<br/>3,300 validators<br/>4G/5G router, private APN"]
        rail["46 rail stations<br/>1,380 validators<br/>station LAN + fiber"]
        ferry["6 ferry terminals, 4 vessels<br/>120 validators"]
        hh["400 handhelds<br/>public cellular,<br/>device certificate"]
    end

    subgraph crtdc["CRT data center"]
        er["ExpressRoute circuit"]
        rc["RiverCard (until 2028)"]
    end

    subgraph primary["Azure East US 2 (primary)"]
        afd["Front Door + WAF (global)"]
        subgraph main["Main zone subscription"]
            aks1["AKS cluster: 3 zones<br/>gateways, Journey, Accounts,<br/>Fleet, Integration"]
            eh1["Event Hubs Premium"]
            sql1["Azure SQL: Journey, Account, Policy"]
        end
        subgraph cde["Card-data zone subscription"]
            aks2["AKS cluster: 3 zones<br/>Payments, Ledger, Settlement"]
            sql2["Azure SQL: Ledger (Business Critical)"]
            hsm["Managed HSM"]
        end
    end

    subgraph secondary["Azure Central US (secondary)"]
        warm["Warm standby: AKS scaled to 25%,<br/>SQL geo-replicas, Event Hubs geo-replica"]
    end

    bus & ferry -- "Carrier private APN → IPsec" --> er
    rail -- "CRT WAN" --> er
    er -- "Private peering" --> main
    hh --> afd
    afd --> main
    main <-- "Private Link" --> cde
    primary -. "Geo-replication" .-> secondary
    er --- rc
\`\`\`

| Software | Runs on | Where | Scale |
|---|---|---|---|
| Validator software | Vantor V7 (ARM, Linux, P2PE secure reader, 32 GB storage) | Vehicles, platforms, terminals | 5,200 devices |
| Inspection App | Rugged Android handhelds with contactless reader | Fare inspectors | 400 devices |
| Rider App | Riders' phones (iOS 17+, Android 10+) | — | — |
| Gateways, Journey, Accounts, Fleet, Integration | AKS (main zone), 3 availability zones | East US 2; standby in Central US | 12–60 pods, autoscaled |
| Payments, Ledger, Settlement | AKS (card-data zone), 3 availability zones | East US 2; standby in Central US | 6–12 pods |
| Event streams | Event Hubs Premium, 4 processing units | East US 2, geo-replicated | 32 + 32 + 16 partitions |
| Databases | Azure SQL (Hyperscale and Business Critical) | Zone-redundant; failover groups to Central US | See [Data Architecture §5](data-architecture.md) |
| Portals | AKS behind Front Door | East US 2 | 4–12 pods |

Network zones, routing and firewall rules are in [Network Architecture](../04-infrastructure-and-network/network-architecture.md).

## 5. Scenarios (+1)
> A handful of key use cases that exercise all four views: the glue and validation.

| Scenario | Views Exercised | Notes |
|---|---|---|
| **S1. Rider taps a bank card and reaches the daily cap** (UC-01, UC-02) | Logical, Process, Physical | \`RiderFareWeek.Apply\` (logical) runs in the Fare Engine instance that owns the rider's partition (process), on the main-zone AKS cluster, fed by a validator over the private APN (physical). Checks: cap invariant inside one aggregate; single writer per rider key. |
| **S2. Stadium surge with 120 buses reconnecting at once** (NFR-SCALE-01) | Process, Physical | Gateway pods scale on requests; \`rider-taps\` lag grows, then KEDA scales the Fare Engine to 32 instances; Journey DB write rate is the limit. Checks: no back-pressure reaches validators. |
| **S3. A bus offline for two days uploads its taps** (NFR-INTEG-01) | Logical, Process | Late taps are re-rated through the same code path; \`FareAdjusted\` carries differences only; the nightly chain nets adjustments into the next charge. Checks: determinism of the pure components. |
| **S4. Azure East US 2 fails at the morning peak** (NFR-AVAIL-07) | Physical, Process | Validators hold taps; failover to Central US; the Ledger Service replays 15 minutes of events and skips duplicates by \`source_event_id\`. Checks: RPO 0 by recomputation (see [Data Architecture §5](data-architecture.md)). |
| **S5. Fare Policy publishes a new fare table for 1 July** (US-05) | Logical, Development, Process | Change is data, not code: \`FareRuleVersion\` approved in the Policy context and published as an event; the Fare Engine's resolver cache picks it up; no deployment. Checks: the \`Contracts\` boundary and the absence of any code release. |
`;export{e as default};
