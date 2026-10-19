const e=`---
title: Data Architecture — Project Tapline
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2026-09-18
reviewers:
  - Dana Okafor (Chief Architect) — approved 2026-09-16
  - Tom Whitaker (CISO) — approved §7 on 2026-09-16
  - Jordan Hale (CFO) — approved retention of financial records 2026-09-17
  - CRT Records Manager — approved §5 retention schedule 2026-09-17
  - Sam Ortega (SRE Lead) — approved backups 2026-09-18
tags:
  - data_architecture
---

# Data Architecture — Project Tapline

> [!summary] Three rules shape all of Tapline's data
> 1. **Taps are facts; everything else is derived.** Trips, fares and ledger entries can all be recomputed from taps plus fare rules plus money events. That's what makes re-rating and disaster recovery possible.
> 2. **Money is append-only.** The ledger is never updated or deleted, only appended to.
> 3. **Identity and travel are kept apart.** Analytics never sees who travelled, and riders can choose to have their trip history deleted after 90 days.

Business meanings of every term are in the [Domain Model](domain-model.md). This document covers how the data is stored, moved, kept and protected. Physical names use \`snake_case\`; amounts are stored as integer cents (\`bigint\`); times are stored as UTC with the local offset recorded where it matters.

## 1. Conceptual Data Model

\`\`\`mermaid
flowchart LR
    subgraph Identity["Who (Confidential)"]
        A[Account]
        M[Medium]
        E[Eligibility]
    end
    subgraph Travel["Where and when (Confidential)"]
        T[Tap]
        TR[Trip]
        W[Rider fare week]
    end
    subgraph Rules["What it costs (Public)"]
        F[Fare rule version]
        O[Operator]
    end
    subgraph Money["Money (Confidential / Restricted)"]
        L[Ledger transaction]
        C[Charge]
        PT[Payment token]
    end
    subgraph Fleet["Equipment (Internal)"]
        V[Validator]
        D[Deny list]
    end
    A --- M
    A --- E
    M --> T
    V --> T
    T --> TR --> W
    F --> TR
    O --> F
    TR --> L
    C --> L
    M -. "bank cards" .-> PT
    PT --> C
    M --> D
\`\`\`

The groups are subject areas, each owned by one context (§6). The only link between **Identity** and **Travel** is the media token. This is the join that the privacy controls in §7 cut for analytics.

## 2. Logical Data Model

The model is split by database, one per context, with no foreign keys across databases. References across contexts carry IDs only.

\`\`\`mermaid
erDiagram
    tap {
        uuid tap_id PK
        varchar media_token "keyed hash or CRT card serial"
        varchar medium_type "bank_card, wallet, crt_card, app_ticket"
        varchar validator_id
        varchar operator_code
        varchar route_id "null for stations"
        varchar stop_id
        datetime2 tapped_at_utc
        smallint local_offset_minutes "offset in effect at the tap"
        varchar result "accepted, denied"
        varchar deny_reason
        datetime2 received_at_utc
        varbinary signature
    }
    rider_fare_week {
        varchar rider_key PK "account_id or media_token"
        date fare_week_start PK "Monday"
        varchar fare_category
        bigint weekly_total_cents
        rowversion row_version
    }
    service_day_total {
        varchar rider_key PK
        date service_date PK
        bigint daily_total_cents
    }
    trip {
        uuid trip_id PK
        varchar rider_key FK
        date service_date
        datetime2 first_tap_at_utc
        varchar operator_code
        uuid fare_rule_version_id
        varchar fare_category
        bigint base_fare_cents
        bigint capped_fare_cents
        varchar status "open, completed, adjusted"
    }
    trip_tap {
        uuid trip_id PK
        uuid tap_id PK
    }
    rider_fare_week ||--|{ service_day_total : has
    rider_fare_week ||--o{ trip : contains
    trip ||--|{ trip_tap : groups
    tap ||--o| trip_tap : "assigned in"

    account {
        uuid account_id PK
        varchar external_identity_id "Entra External ID"
        varchar email
        varchar phone
        char language
        varchar privacy_retention "13_months, 90_days"
        varchar status
        datetime2 created_at_utc
    }
    medium {
        varchar media_token PK
        varchar medium_type
        uuid account_id FK "nullable"
        varchar display_hint "last 4 + expiry, or card number"
        varchar status "active, blocked, replaced"
        datetime2 linked_at_utc
    }
    eligibility {
        uuid eligibility_id PK
        uuid account_id FK
        varchar category "senior, disability, low_income"
        varchar verified_by "dhs, document, rivercard_migration"
        date valid_from
        date valid_to
    }
    account ||--o{ medium : links
    account ||--o{ eligibility : has

    fare_rule_version {
        uuid fare_rule_version_id PK
        varchar operator_code
        datetime2 effective_from_local
        varchar status
        json rules "fares, transfer window, caps"
        varchar author
        varchar approver
    }

    ledger_transaction {
        uuid transaction_id PK
        uuid source_event_id UK
        date service_date
        varchar transaction_type
        datetime2 recorded_at_utc
    }
    ledger_entry {
        uuid transaction_id FK
        smallint line_no
        varchar ledger_account_code
        varchar subledger_key "account_id, media_token or operator"
        bigint debit_cents
        bigint credit_cents
    }
    charge {
        uuid charge_id PK
        varchar media_token
        varchar payment_token "Restricted"
        date service_date
        bigint amount_cents
        varchar status "pending, approved, declined, recovered"
        varchar northgate_reference
    }
    ledger_transaction ||--|{ ledger_entry : "balanced lines"
    charge ||--o{ ledger_transaction : "recorded by"
\`\`\`

**Notes**
- \`ledger_transaction\` and \`ledger_entry\` are Azure SQL **append-only ledger tables** ([ADR-0006](../06-decisions-and-standards/adr/0006-azure-sql-ledger-tables-for-fare-ledger.md)). The database rejects updates and deletes, and ledger digests are stored in immutable Blob Storage every 15 minutes so tampering can be detected.
- \`tap\` exists in two places: the immutable raw archive (ADLS, written by Event Hubs Capture) and a working copy in the Journey DB kept for 13 months for re-rating and rider history.
- \`rider_key\` is deliberately a string that is either an \`account_id\` or a \`media_token\`. It is not a foreign key; see the [Domain Model §4](domain-model.md).

## 3. Data Dictionary
| Entity | Attribute | Type | Description | PII? |
|---|---|---|---|---|
| tap | tap_id | uuid | Generated on the validator; globally unique; makes uploads idempotent | No |
| tap | media_token | varchar(64) | Pseudonymous medium identifier | Yes (pseudonymous) |
| tap | stop_id, route_id | varchar(16) | Where the tap happened (from GTFS) | Yes, when joined to a token |
| tap | tapped_at_utc | datetime2(3) | Instant of the tap. Vantor validators report GPS-synced local time plus their time-zone name; the Device Gateway converts this to UTC. | Yes, when joined to a token |
| tap | local_offset_minutes | smallint | UTC offset at the validator when tapped (e.g. −240 in summer, −300 in winter) | No |
| tap | signature | varbinary(64) | Validator's signature over the tap fields | No |
| rider_fare_week | rider_key | varchar(64) | Account ID or media token | Yes (pseudonymous) |
| rider_fare_week | weekly_total_cents | bigint | Capped fares counted toward the weekly cap | No |
| trip | base_fare_cents / capped_fare_cents | bigint | Fare before and after caps | No |
| trip | fare_rule_version_id | uuid | Version used to rate the trip | No |
| account | email, phone | varchar | Contact and sign-in details | **Yes** |
| account | privacy_retention | varchar | Rider's choice: 13 months or 90 days | No |
| medium | display_hint | varchar(32) | Last 4 digits and expiry (bank cards) or CRT card number | Yes |
| eligibility | category | varchar | Reduced-fare category. Disability is recorded only as "disability", with no condition stored. | **Yes (sensitive)** |
| eligibility | verified_by | varchar | How eligibility was confirmed; no DHS case data is kept | No |
| fare_rule_version | rules | json | Fares, transfer window and caps per category | No (Public) |
| ledger_entry | ledger_account_code | varchar | ERP chart-of-accounts code (e.g. 2310 Stored-value liability) | No |
| ledger_entry | subledger_key | varchar | Account, token or operator the entry belongs to | Yes (pseudonymous) |
| charge | payment_token | varchar(64) | Northgate's reusable charge reference; card-data zone only | **Restricted** |
| charge | northgate_reference | varchar(40) | Northgate authorization ID, for reconciliation | No |
| validator | validator_id | varchar(16) | Asset number, e.g. \`BUS-4471-F\` (bus 4471, front door) | No |
| deny_list_entry | media_token, reason, added_at_utc | — | Blocked, lost or in debt | Yes (pseudonymous) |

## 4. Data Flow

\`\`\`mermaid
flowchart LR
    V["Validators"] -- "signed taps" --> DG["Device Gateway"]
    DG -- "encrypted card data<br/>(new tokens only)" --> PAY["Payments Service"]
    DG --> TAPS[["taps"]]
    TAPS -- "Capture (every 5 min)" --> RAW[("Raw tap archive<br/>ADLS, immutable, 13 months")]
    TAPS --> TR["Tap Router"] --> RT[["rider-taps"]] --> FE["Fare Engine"]
    FE <--> JDB[("Journey DB")]
    POL[("Policy DB")] -- "fare rule versions" --> FE
    ACC[("Account DB")] -- "token → rider key<br/>(via Redis)" --> TR
    FE -- "FareCalculated / FareAdjusted" --> DE[["domain-events"]]
    DE --> LED["Ledger Service"] --> LDB[("Ledger DB")]
    PAY <--> NG["Northgate"]
    PAY --> LED
    LDB --> SET["Settlement Jobs"]
    SET -- "charge file 04:00" --> NG
    NG -- "settlement file" --> SET
    SET -- "journal 06:00" --> ERP["CRT ERP"]
    LDB -- "archive after 2 years" --> FIN[("Financial archive<br/>ADLS, immutable, 7 years")]
    RAW --> DEID["De-identification job<br/>(daily)"]
    JDB --> DEID
    DEID --> LAKE[("Fabric lakehouse<br/>de-identified")]
    LAKE --> BI["Title VI and<br/>ridership reports"]
    GTFS["CRT Scheduling (GTFS)"] -- "daily" --> LAKE
    GTFS -- "daily" --> FE
\`\`\`

| Flow | Volume (2027) | Latency | Mechanism |
|---|---|---|---|
| Taps, validator → \`taps\` | ~96M a year; 1,100/min peak; 12,000/min design | p95 ≤ 30 s | HTTPS batches, Event Hubs |
| Taps → rated trips | same | p95 ≤ 60 s | Event Hubs consumers |
| Fare events → ledger | ~150M ledger transactions a year | p95 ≤ 2 min | Event Hubs, idempotent by event ID |
| Charges → Northgate | ~110k charges a day | Daily by 04:00 | SFTP file + API |
| Ledger → ERP | ~400 summarized lines a day | Daily by 06:00 | ERP journal import API |
| Raw taps → lakehouse | daily | T+1 | Fabric pipeline after de-identification |

## 5. Data Storage Strategy
| Data Type | Store | Retention | Backup Strategy |
|---|---|---|---|
| Tap stream | Event Hubs Premium (\`taps\`, \`rider-taps\`) | 7 days | Geo-replication to Central US (synchronous for \`taps\`) |
| Raw tap archive | ADLS Gen2, immutable (time-based retention policy) | 13 months, then deleted | Geo-zone-redundant storage (GZRS) |
| Journey working data (trips, fare weeks, tap copies) | Azure SQL Hyperscale (Journey DB) | 13 months; 90 days for riders who choose it | Point-in-time restore 35 days; geo-replica |
| Accounts, media, eligibility | Azure SQL Business Critical (Account DB) | Life of account; identity data deleted 90 days after closure | PITR 35 days; failover group to Central US |
| Eligibility documents (uploads) | Blob Storage, lifecycle policy | 90 days, then deleted | Zone-redundant; no backup by design |
| Fare rules | Azure SQL (Policy DB) | Permanent (needed to re-rate history) | PITR 35 days; weekly long-term backups for 10 years |
| Ledger | Azure SQL Business Critical with ledger tables (Ledger DB) | 2 years online, then archived | PITR 35 days; failover group; yearly long-term backups for 10 years |
| Financial archive | ADLS Gen2, immutable | 7 years | GZRS; ledger digests stored alongside |
| Deny list | Blob Storage + Front Door | Current version + 30 days of history | Rebuildable from Account and Payments events |
| Read models and token cache | Azure Managed Redis | Cache only | None. Rebuilt from source on loss. |
| Analytics | Microsoft Fabric lakehouse (OneLake) | 7 years, de-identified | OneLake redundancy; rebuildable from archives |
| Application logs | Azure Monitor (Log Analytics) | 30 days hot, 1 year archive | Platform-managed |
| Audit log | Log Analytics + immutable Blob archive | 1 year hot, 7 years archive | GZRS, immutable |

**How the ledger achieves RPO 0 (NFR-AVAIL-05).** Azure SQL geo-replication is asynchronous, so a region failure could lose the last few seconds of ledger writes. Those writes are not lost to the business, because the ledger is derived. Every ledger transaction comes from an event in \`taps\` or \`domain-events\`, which are geo-replicated synchronously, and is unique by \`source_event_id\`. After failover, the Ledger Service replays the last 15 minutes of events. Entries that already exist are skipped, and missing ones are written. The [DR Plan](../08-risk-and-operations/disaster-recovery-plan.md) tests this every quarter.

## 6. Data Governance

**Ownership**
| Subject area | Data owner (business) | Data steward (technical) |
|---|---|---|
| Travel (taps, trips) | Grace Liu, Fare Policy & Equity | Journey Team |
| Fare rules | Grace Liu | Journey Team |
| Identity (accounts, media, eligibility) | Customer Service Director | Rider Team |
| Money (ledger, charges, settlement) | Jordan Hale, CFO | Money Team |
| Equipment (validators, deny list) | Marcus Bell, Bus Operations | Edge Team |
| Analytics | Grace Liu (Title VI) and the Planning Director | Platform Team |

**Quality rules.** These are monitored automatically; each failure raises an alert.
| Rule | Check | When |
|---|---|---|
| Every tap is unique | Duplicate \`tap_id\` count = 0 | Continuous |
| No tap is lost | Validator-reported tap count = taps received, per validator per day | Daily 05:00 |
| Ledger balances | Total debits = total credits, per service day and overall | Daily and on every write batch |
| Liability matches balances | Ledger account 2310 total = sum of all stored-value sub-ledgers | Daily |
| Settlement reconciles | Approved charges = Northgate settlement ± fees | Daily 06:00 |
| Fares reproducible | Re-rating a random 0.1% sample of yesterday's rider weeks gives identical results | Daily |
| Stops are valid | Every \`stop_id\` exists in the current GTFS feed | Daily |

**Master and reference data**
| Data | System of record | How Tapline gets it |
|---|---|---|
| Routes, stops, service patterns | CRT Scheduling (GTFS) | Daily import; versioned so historical taps keep their stop names |
| Operators | Apportionment context (Tapline) | Managed in the Back-Office Portal |
| Chart of accounts | CRT ERP | Conformist; monthly sync |
| Fare rules | Fare Policy context (Tapline) | Published as GTFS-Fares v2 for trip planners |
| Validator assets | Device Fleet context (Tapline), seeded from CRT's asset register | Two-way sync with the asset register |

**Data contracts.** Event schemas are registered in the Event Hubs schema registry (JSON Schema). Changes must be backward-compatible: fields may be added, never removed or renamed. A breaking change needs a new event version, and both versions are published until all consumers have moved (see [Integration Architecture](../03-interfaces-and-integration/integration-architecture.md)).

## 7. Data Classification & Privacy

| Class | Examples | Where it may live | Handling |
|---|---|---|---|
| **Restricted** | Payment tokens, P2PE-encrypted card data, signing and encryption keys | Card-data zone and Managed HSM only | Never logged; access by named roles with just-in-time elevation |
| **Confidential** | Account contact details, eligibility, media tokens joined to taps, trip history | Operational databases in the main zone | Encrypted at rest; field-level access control; masked in the back office except for the rider's own agent session |
| **Internal** | De-identified usage, validator status, aggregate revenue | Lakehouse, dashboards | CRT staff and partners by role |
| **Public** | Fare tables, GTFS-Fares, published ridership statistics | Websites, open-data portal | No restrictions |

**Pseudonymization for analytics.** The daily de-identification job replaces every \`rider_key\` and \`media_token\` with an HMAC-SHA256 value. The key is held in Managed HSM and **rotated every month**, so analysts can follow a pseudonymous rider within a month (for transfer and cap analysis) but cannot link the same rider across months. Exact times are rounded to 15 minutes. Any reporting group of fewer than 10 riders is suppressed (FR-DATA-01).

**Rider-chosen deletion (FR-DATA-02).** When a rider chooses 90-day retention, their trips and tap copies older than 90 days are deleted from the Journey DB and all read models every night, and staff can no longer see them. The **raw tap archive** still holds those taps until its 13-month retention ends. It is immutable, so it cannot be edited early. Access to it is break-glass only (CISO approval, logged) and limited to fraud and audit investigations. The rider privacy notice says so plainly.

**Disability data.** Only the category "disability" is stored. Supporting documents are deleted after 90 days (FR-ELIG-02), and no medical information is ever recorded.

**Law enforcement requests** are handled by CRT Legal under the Board's 2025 rider privacy policy: legal process is required, and every disclosure is logged.
`;export{e as default};
