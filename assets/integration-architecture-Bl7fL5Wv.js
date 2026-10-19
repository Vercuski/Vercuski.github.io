const e=`---
title: Integration Architecture — Project Tapline
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2026-09-30
reviewers:
  - Dana Okafor (Chief Architect) — approved 2026-09-28
  - Hannah Cole (Money Team lead) — approved 2026-09-29
  - Diego Alvarez (Edge Team lead) — approved 2026-09-29
  - Mei Chen (Rider Team lead) — approved 2026-09-29
  - CRT ERP Product Owner — approved §7 (ERP) on 2026-09-30
tags:
  - integration_architecture
---
# Integration Architecture — Project Tapline

> [!summary] Integration rules in one list
> 1. **Inside Tapline, contexts talk through events**, not shared databases. Synchronous calls between contexts are allowed only for reads, and never on the tap path.
> 2. **Every external system sits behind an anti-corruption layer** owned by one context. No external model leaks into the domain.
> 3. **Every message has a unique ID and every consumer is idempotent.** Delivery is at-least-once everywhere.
> 4. **Contracts are machine-readable and versioned:** OpenAPI for REST, AsyncAPI and JSON Schema for events. See the [API Specification Guide](api-specification-guide.md).

## 1. Integration Overview

\`\`\`mermaid
flowchart LR
    subgraph edge["Edge"]
        V["Validators"]
        H["Handhelds"]
    end
    subgraph channels["Channels"]
        APP["Rider App / Portal"]
        BO["Back-Office"]
        PP["Partner Portal"]
    end
    subgraph tapline["Tapline core"]
        DG["Device Gateway"]
        APIM["API Management"]
        EH[["Event Hubs:<br/>taps · rider-taps · domain-events"]]
        CTX["Context services<br/>(Journey, Accounts, Payments,<br/>Ledger, Fleet, Policy)"]
        INT["Integration Service<br/>(ACLs)"]
        CDN["Deny list / config<br/>via Front Door"]
    end

    NG["Northgate Payments"]
    VF["Vantor Fleet Cloud"]
    DHS["State DHS"]
    CP["CornerPay"]
    ERP["CRT ERP"]
    SCH["CRT Scheduling (GTFS)"]
    RC["RiverCard (Castellan)"]
    PART["Partner operators"]
    KEEL["Keel Mobility"]
    ACS["Azure Communication<br/>Services"]
    OPEN["Open-data portal /<br/>trip planners"]

    V -- "Store-and-forward<br/>HTTPS mTLS" --> DG
    V -- "Pull (CDN)" --> CDN
    H & APP & BO & PP -- "REST / OAuth 2.0" --> APIM
    DG --> EH
    APIM --> CTX
    CTX <--> EH
    CTX -- "REST + SFTP batch<br/>(ICD-001)" --> NG
    NG -- "Webhooks + SFTP" --> CTX
    CTX -- "REST" --> VF
    INT -- "REST mTLS" --> DHS
    CP -- "Signed webhook" --> INT
    INT -- "Journal API" --> ERP
    SCH -- "GTFS zip, daily" --> INT
    INT <-- "Batch API (2028)" --> RC
    INT -- "Partner API / SFTP" --> PART
    KEEL -- "Charge API (Phase 4)" --> APIM
    CTX -- "Email, SMS, push" --> ACS
    CTX -- "GTFS-Fares v2 feed" --> OPEN
    INT <--> EH
\`\`\`

The Payments Service connects to Northgate directly, and the Device Management Service to Vantor, rather than through the Integration Service. Those two integrations are central to their contexts and are governed by the card-data zone and edge security rules respectively. Every other external system goes through the Integration Service.

## 2. Integration Patterns Used

| Pattern | Where | Why |
|---|---|---|
| **Store-and-forward** | Validators → Device Gateway | Boarding must not depend on the network (NFR-AVAIL-03). The validator owns each tap until the cloud acknowledges a durable write. |
| **Event streaming** (partitioned, ordered, replayable) | \`taps\`, \`rider-taps\` | High volume, ordering per key, and the ability to replay for re-rating and disaster recovery ([ADR-0003](../06-decisions-and-standards/adr/0003-event-hubs-for-tap-ingestion.md)). |
| **Publish/subscribe domain events** | \`domain-events\` | Contexts react to each other's facts without knowing who is listening. Adding a consumer (e.g. Apportionment in Phase 4) needs no change to the producer. |
| **Transactional outbox** | Every context that publishes | State change and event publication succeed or fail together. |
| **Request/response (REST)** | Apps and portals → APIs; DHS checks; Northgate verifications; Vantor fleet API | Users and some partners need an immediate answer. Never used between contexts on the tap path. |
| **Batch file transfer (SFTP)** | Northgate charges and settlement; one partner's statements; RiverCard extracts | The counterparties' standard for high-volume financial exchange, with clear cut-offs and audit trails. |
| **Webhooks** | Northgate charge results and chargebacks; CornerPay cash loads | The external party pushes events as they happen. Always backed by a pull API for missed callbacks. |
| **CDN pull** | Deny lists and validator configuration | 5,200 devices polling a static, signed file scales cheaply and works through Front Door caching. |
| **Anti-corruption layer** | All external systems | Keeps Northgate, Vantor, DHS, CornerPay and Castellan models out of Tapline's domain. Each can be replaced by rewriting one adapter (NFR-PORT-01). |
| **Conformist** | CRT ERP | Tapline adopts the ERP's chart of accounts and journal format. Translating it would add cost with no benefit. |

**Deliberately not used**
- **Shared databases between contexts.** Each context owns its data ([Data Architecture §2](../02-core-architecture/data-architecture.md)).
- **Distributed transactions (2PC).** Replaced by outbox, idempotent consumers and compensating ledger entries.
- **Synchronous call chains on the tap path.** A tap must be acceptable and storable with every downstream service down.

## 3. API Inventory

| API | Type (REST/GraphQL/gRPC) | Consumer(s) | Spec Location |
|---|---|---|---|
| Rider API | REST (OpenAPI 3.1) | Rider App, Rider Portal | \`tapline-platform/specs/openapi/rider-api.v1.yaml\` |
| Back-Office API | REST, one spec per context | Back-Office Portal | \`specs/openapi/backoffice-{context}.v1.yaml\` |
| Partner API | REST | Partner finance systems (Phase 4) | \`specs/openapi/partner-api.v1.yaml\` |
| Device API | REST over mutual TLS | Validators (via Vantor firmware) | \`specs/openapi/device-api.v1.yaml\`; tap format fixed in ICD-002 (Vantor, planned) |
| Inspection API | REST | Inspection App | \`specs/openapi/inspection-api.v1.yaml\` |
| Fare Data API | REST (read-only, public) | Trip planners, open-data portal | \`specs/openapi/fare-data-api.v1.yaml\` + GTFS-Fares v2 feed |
| CornerPay Load Webhook (inbound) | REST webhook | CornerPay | \`specs/openapi/cornerpay-webhook.v1.yaml\` |
| Keel Charge API | REST (proposed) | Keel Mobility (Phase 4) | Not yet specified; depends on SAD OQ-3 |

Full inventory, owners and status are in the [API Specification Guide](api-specification-guide.md).

## 4. Message/Event Contracts

All events use the **CloudEvents 1.0** envelope in structured JSON mode. Event types are named \`crt.tapline.<context>.<event>.v<major>\`. Payload schemas are JSON Schema in \`tapline-platform/src/Contracts/schemas/\`, registered in the Event Hubs schema registry and described as a whole in \`specs/asyncapi/tapline-events.yaml\`.

| Event/Message | Producer | Consumer(s) | Schema Location |
|---|---|---|---|
| \`journey.tap-recorded.v1\` | Device Gateway | Tap Router, Capture (archive) | \`schemas/journey/tap-recorded.v1.json\` |
| \`journey.rider-tap-routed.v1\` | Tap Router | Fare Engine | \`schemas/journey/rider-tap-routed.v1.json\` |
| \`journey.fare-calculated.v1\` | Fare Engine | Ledger, Payments, Notification, account read model | \`schemas/journey/fare-calculated.v1.json\` |
| \`journey.fare-adjusted.v1\` | Fare Engine | Ledger, Payments, Notification | \`schemas/journey/fare-adjusted.v1.json\` |
| \`journey.cap-reached.v1\` | Fare Engine | Notification, account read model | \`schemas/journey/cap-reached.v1.json\` |
| \`journey.trip-completed.v1\` | Fare Engine | Apportionment (Phase 4), lakehouse | \`schemas/journey/trip-completed.v1.json\` |
| \`farepolicy.fare-rule-version-published.v1\` | Fare Policy Service | Fare Engine, Fare Data API | \`schemas/farepolicy/fare-rule-version-published.v1.json\` |
| \`media.medium-linked.v1\` / \`media.medium-unlinked.v1\` | Account Service | Tap Router cache, Fare Engine | \`schemas/media/…\` |
| \`media.medium-blocked.v1\` / \`media.medium-unblocked.v1\` | Account Service | Deny List Service | \`schemas/media/…\` |
| \`eligibility.eligibility-changed.v1\` | Account Service | Fare Engine | \`schemas/eligibility/eligibility-changed.v1.json\` |
| \`account.account-closed.v1\` | Account Service | Payments (refund balance), Journey (purge schedule) | \`schemas/account/account-closed.v1.json\` |
| \`payments.medium-declined.v1\` | Payments Service | Deny List Service, Notification | \`schemas/payments/medium-declined.v1.json\` |
| \`payments.charge-approved.v1\` / \`payments.charge-declined.v1\` | Payments Service | Ledger; Deny List (declined) | \`schemas/payments/…\` |
| \`payments.debt-cleared.v1\` | Payments Service | Deny List Service, Notification | \`schemas/payments/debt-cleared.v1.json\` |
| \`payments.top-up-completed.v1\` | Payments Service | Ledger, Notification | \`schemas/payments/top-up-completed.v1.json\` |
| \`payments.retail-load-received.v1\` | Integration Service (CornerPay ACL) | Payments, Ledger | \`schemas/payments/retail-load-received.v1.json\` |
| \`ledger.service-day-closed.v1\` | Settlement Jobs | Apportionment, reporting | \`schemas/ledger/service-day-closed.v1.json\` |
| \`fleet.deny-list-published.v1\` | Deny List Service | Device Management (monitoring) | \`schemas/fleet/deny-list-published.v1.json\` |

**Example: \`journey.fare-calculated.v1\`**
\`\`\`json
{
  "specversion": "1.0",
  "type": "crt.tapline.journey.fare-calculated.v1",
  "source": "/tapline/journey/fare-engine",
  "id": "0b8f6c1e-5a43-4c55-9f0e-3c7d1a2e9b41",
  "time": "2027-05-14T12:16:03.412Z",
  "subject": "rider/acct_7Q2M9X",
  "datacontenttype": "application/json",
  "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "data": {
    "riderKey": "acct_7Q2M9X",
    "tapId": "6f1d2c4b-8e7a-4b3c-9d21-0a5e6f7b8c9d",
    "tripId": "c2a1e5d3-7b9f-4e8a-8c6d-1f2e3a4b5c6d",
    "serviceDate": "2027-05-14",
    "operatorCode": "CRT",
    "fareRuleVersionId": "frv_2027_04_01_crt",
    "fareCategory": "full",
    "baseFareCents": 200,
    "cappedFareCents": 100,
    "dailyTotalCents": 500,
    "weeklyTotalCents": 1400,
    "fundingSource": { "type": "bank_card", "mediaToken": "mt_9c41…e07a" }
  }
}
\`\`\`
Amounts are always integer cents. Event payloads never contain names, email addresses or Restricted data.

## 5. Error Handling & Retry Strategy

| Situation | Behavior |
|---|---|
| Transient failure calling a dependency (timeout, 5xx, throttling) | Retry with exponential backoff and jitter using \`Microsoft.Extensions.Http.Resilience\` standard pipelines: 3 attempts for user-facing calls, longer schedules for background work. A circuit breaker opens after 50% failures over 30 s. |
| Consumer cannot process an event (bug or bad data) | After 5 attempts the event moves to a **parking stream** (\`<stream>-parked\`) with the error attached, and the consumer continues. A parked event raises an alert and is never discarded. |
| Fixing parked events | The \`tapline-replay\` CLI re-publishes parked events (or a time range from the archive) after the fix. Idempotent consumers make replay safe. |
| Duplicate delivery | Ignored by unique ID at every consumer (\`tap_id\`, CloudEvents \`id\`, \`source_event_id\`). |
| Out-of-order delivery across partitions | Allowed. Within a rider key, order is guaranteed by partitioning; the Fare Engine re-rates anything that arrives late. |
| External callback missed (Northgate, CornerPay) | Every webhook has a matching pull API. Reconciliation jobs pull anything not received by a cut-off time. |
| External system down | Requests queue (Service Bus) with time-to-live per use case. Riders see "pending" rather than an error, e.g. a pending DHS check. |
| Money mismatch | Never retried or corrected automatically. It becomes a reconciliation exception for Revenue Operations (UC-06). |

## 6. Versioning Strategy

- **Events:** schemas evolve **backward-compatibly only**. Optional fields may be added; nothing is removed, renamed or re-typed. The schema registry enforces this on publish. A breaking change creates \`.v2\`. The producer publishes both versions until every consumer has moved, for at least 90 days, then retires \`.v1\` through the ARB.
- **Internal APIs:** URI major version (\`/v1/\`). Additive changes don't change the version.
- **External APIs (Rider, Partner):** same rule, with the deprecation periods in the [API Specification Guide §3](api-specification-guide.md).
- **External interfaces we consume:** versions and change notice are fixed in each ICD (e.g. 90 days' notice for breaking changes from Northgate).
- **Contract tests:** each consumer's expectations of an event or API are tested in CI against the producer's published schema, so a producer can't merge a change that breaks a known consumer.

## 7. Third-Party Integrations

| System | Purpose | Auth Method | SLA |
|---|---|---|---|
| Northgate Payments | Card verification, payment tokens, nightly charges, settlement, chargebacks, account updater | Mutual TLS + OAuth 2.0 client credentials; PGP-encrypted SFTP files; HMAC-signed webhooks | 99.95% API availability; settlement file by 05:30. See [ICD-001](interface-control-document.md). |
| Vantor Fleet Cloud | Firmware campaigns, diagnostics, warranty | OAuth 2.0 client credentials | 99.9%; P1 support response in 1 h (contract) |
| State DHS | SNAP and Medicaid enrollment checks | Mutual TLS + API key, under a data-sharing agreement | 99.5% business hours; best effort otherwise. Tapline queues requests when it is down. |
| CornerPay | Cash loads at 420 stores | HMAC-signed webhook (inbound); OAuth 2.0 for the confirmation API | Loads delivered within 5 min (p95); 99.9% |
| CRT ERP | Daily summarized journal entries | Entra ID managed identity | Internal: journal import available 05:00–07:00 daily |
| CRT Scheduling | GTFS feed (routes, stops) | Entra ID managed identity (internal blob) | Internal: daily feed by 01:00 |
| Castellan (RiverCard) | Card acceptance bridge and account and balance extracts (2028) | Mutual TLS over ExpressRoute; SFTP for extracts | Per the exit-assistance schedule of the Castellan contract |
| Keel Mobility | Microtransit trip charges (Phase 4) | OAuth 2.0 client credentials | To be agreed (ICD-007) |
| Azure Communication Services | Email, SMS | Managed identity | Azure SLA (99.9%) |
| Partner operators | Statements and fare tables (Phase 4) | OAuth 2.0 client credentials (API); SFTP with keys (one partner) | Statements available by 08:00 daily |

## 8. Formal Interface Agreements
Interfaces that cross an organizational boundary get an Interface Control Document using the [ICD template](interface-control-document.md).

| ICD | Interface | Status |
|---|---|---|
| ICD-001 | Tapline ↔ Northgate Payments | **Signed 2026-08-28** ([document](interface-control-document.md)) |
| ICD-002 | Tapline ↔ Vantor (Device API, tap format, Fleet Cloud) | In negotiation; target 2026-11 |
| ICD-003 | Tapline ↔ State DHS | Drafted with the data-sharing agreement; target 2027-02 |
| ICD-004 | Tapline ↔ CornerPay | Target 2027-06, before retail loads go live |
| ICD-005 | Tapline ↔ Castellan (RiverCard bridge and extracts) | Target 2027-09, before Phase 3 |
| ICD-006 | Tapline ↔ Partner operators | Schedule to the regional fare agreement; target 2028 |
| ICD-007 | Tapline ↔ Keel Mobility | Phase 4 |

Interfaces between CRT-internal systems (ERP, Scheduling) use a lighter-weight integration agreement recorded in the API Specification Guide, not an ICD.
`;export{e as default};
