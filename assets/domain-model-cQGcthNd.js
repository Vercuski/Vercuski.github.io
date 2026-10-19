const e=`---
title: Domain Model — Project Tapline
status: approved
owner: Ravi Patel (Principal Engineer, Fare Engine)
version: 1.1.0
last_updated: 2026-09-12
reviewers:
  - Aisha Karimi (Lead Solution Architect) — approved 2026-08-19
  - Grace Liu (Director, Fare Policy & Equity) — approved glossary 2026-08-20
  - Nadia Flores (Lead Business Analyst) — approved glossary 2026-08-20
  - Dana Okafor (Chief Architect) — approved 2026-08-21
tags:
  - domain_model
---
# Domain Model — Project Tapline

> [!summary] Canonical vocabulary
> This is the single definition of Tapline's business terms. Every other document, code identifier and API uses these words with these meanings. If a term is missing or a definition is wrong, change it here first. Storage details (tables, retention, classification) are in the [Data Architecture](data-architecture.md).

**Change history:** v1.1 (2026-09-12) added *media token*, *encrypted card data* and *payment token* to the glossary, to match [ADR-0005](../06-decisions-and-standards/adr/0005-no-card-numbers-in-crt-systems.md) v1.1.

## 1. Bounded Contexts

| Context | Responsibility | Owning Team |
|---|---|---|
| **Fare Policy** | Defines what things cost: fare rule versions, products, transfer windows, caps, effective dates, approval and simulation. Per operator from Phase 4. | Journey Team (lead: Ravi Patel) |
| **Journey** | Turns taps into trips and fares. Assigns service days, applies transfers and caps, re-rates late taps. The heart of the system. | Journey Team |
| **Rider Account** | Accounts, sign-in identity, privacy settings, stored-value balance as seen by the rider. | Rider Team |
| **Media & Tokens** | Everything a rider can tap: bank-card tokens, wallet tokens, CRT cards, app tickets. Links media to accounts; blocks and replaces media. | Rider Team |
| **Eligibility** | Reduced-fare categories (senior, disability, low income), verification and expiry. | Rider Team |
| **Payments & Settlement** | Money: card charges, top-ups, debt, the ledger, settlement with Northgate, reconciliation and GL posting. | Money Team |
| **Apportionment** | Splits shared revenue between operators under the regional agreement (Phase 4). | Money Team |
| **Device Fleet** | Validators and handhelds: status, software, deny-list distribution, proof-of-payment inspection. | Edge Team |

Rider Account, Media & Tokens and Eligibility are separate contexts with separate models, but they are deployed together in the Account Service ([ADR-0007](../06-decisions-and-standards/adr/0007-services-by-bounded-context.md)). They change for the same reasons and are owned by one team, so one deployable unit is simpler. Their code is still separated into modules with no shared tables.

## 2. Ubiquitous Language / Glossary

| Term | Definition | Context |
|---|---|---|
| **Account** | A rider's registered relationship with CRT. Holds linked media, stored value, eligibility and privacy settings. Optional: unregistered riders have no account. | Rider Account |
| **Rider key** | The identity used for fares and caps. It is the account ID if the medium is linked to an account; otherwise it is the medium's token. | Journey |
| **Medium** (plural **media**) | Anything a rider taps: a bank card, a phone wallet, a CRT card or an app ticket. | Media & Tokens |
| **Media token** (or **token**) | Tapline's identifier for a medium. For bank cards and wallets it is a keyed hash of the card number, computed inside the validator's secure card reader with a key CRT never holds; the same card gives the same token on every validator, and the token can't be reversed. For CRT cards it is the card serial number; for app tickets, the ticket ID. | Media & Tokens |
| **Encrypted card data** | The card details, encrypted by the validator's point-to-point encryption (P2PE) reader. Only Northgate can decrypt it. Tapline passes it through to Northgate and never stores it. | Payments & Settlement |
| **Payment token** | Northgate's reusable reference for charging a bank card, returned after the card is first verified. Held only in the card-data zone. | Payments & Settlement |
| **Tap** | One presentation of a medium to a validator, with time, validator, location, route and the validator's accept/deny result. A tap is a fact: it is never changed once recorded. | Journey |
| **Late tap** | A tap that reaches the cloud after later taps for the same rider key have already been rated, usually because the validator was offline. | Journey |
| **Trip** | One or more taps by the same rider key that are covered by a single fare under the transfer rule. | Journey |
| **Transfer window** | The time after a trip's first tap during which more taps join the same trip at no cost. 2 hours for CRT. | Fare Policy |
| **Fare** | The amount owed for a trip before caps. | Journey |
| **Fare category** | Full or reduced. Decided by the rider key's eligibility at the time of the tap. | Eligibility |
| **Service day** | The operating day a tap belongs to: 03:00 to 02:59 local time. A tap at 01:45 Saturday belongs to Friday's service day. | Journey |
| **Fare week** | Seven service days, Monday to Sunday. Starts Monday 03:00 local time. | Journey |
| **Cap** | The most a rider key pays in a service day (daily cap) or fare week (weekly cap). | Fare Policy |
| **Cap accumulator** | The running total of fares counted toward a cap for one rider key in one service day or fare week. | Journey |
| **Fare rule version** | An approved, immutable set of fare rules with an effective-from time. A tap is always rated with the version in effect at the tap's time. | Fare Policy |
| **Rating** | Calculating the fare for a tap: trip assignment, fare, cap. **Re-rating** repeats it when a late tap or correction changes the result. | Journey |
| **Fare adjustment** | The difference produced by re-rating, posted as a new ledger entry. Previous entries are never changed. | Journey / Payments |
| **Charge** | One combined request to a bank card for all its fares in one service day. | Payments & Settlement |
| **Debt** | An amount a rider owes because a charge was declined. A medium with debt is on the deny list. | Payments & Settlement |
| **First-ride risk** | The chance that a card accepted offline is later declined. CRT accepts this risk to keep boarding fast. | Payments & Settlement |
| **Stored value** | Money held in an account or on a CRT card, spent on fares. A liability on CRT's books. | Payments & Settlement |
| **Top-up** | Adding stored value. **Autoload** is an automatic top-up triggered when the balance falls below a threshold. **Retail load** is a cash top-up at a CornerPay location. | Payments & Settlement |
| **Ledger transaction** | A balanced set of ledger entries (debits equal credits) that records one money movement. | Payments & Settlement |
| **Settlement** | Northgate paying CRT for approved charges, less fees. | Payments & Settlement |
| **Reconciliation** | Proving that charges, settlement, bank deposits and ledger agree for a service day. | Payments & Settlement |
| **Operator** | A transit agency whose services accept Tapline: CRT or a partner operator. | Apportionment |
| **Apportionment** | The rule-based split of revenue from multi-operator trips. | Apportionment |
| **Validator** | A fare device on a vehicle, platform or terminal that reads media and records taps. | Device Fleet |
| **Deny list** | The signed list of tokens validators must refuse: blocked media and media with debt. Distributed as a nightly full list plus 5-minute deltas. | Device Fleet |
| **Inspection** | A proof-of-payment check by a fare inspector. | Device Fleet |

> [!warning] Words we don't use
> - **"Ticket"** is not used for open payments: a bank card *is* the medium, and there is no ticket. "App ticket" means only the QR code medium.
> - **"Pass"**: passes are replaced by caps. Use "cap".
> - **"Journey"** is the context name only. A rider's ride is a "trip".
> - **"Transaction"** on its own is ambiguous. Say "tap", "charge" or "ledger transaction".

## 3. Core Entities & Relationships

\`\`\`mermaid
erDiagram
    ACCOUNT ||--o{ MEDIUM : "links (max 5)"
    ACCOUNT ||--o| ELIGIBILITY : has
    ACCOUNT ||--|| STORED_VALUE_BALANCE : holds
    MEDIUM ||--o{ TAP : "presented in"
    VALIDATOR ||--o{ TAP : records
    RIDER_FARE_WEEK ||--|{ SERVICE_DAY : contains
    SERVICE_DAY ||--o{ TRIP : contains
    TRIP ||--|{ TAP : groups
    RIDER_FARE_WEEK ||--|| CAP_ACCUMULATOR : "weekly"
    SERVICE_DAY ||--|| CAP_ACCUMULATOR : "daily"
    FARE_RULE_VERSION ||--o{ TRIP : "rates"
    OPERATOR ||--o{ FARE_RULE_VERSION : owns
    MEDIUM ||--o{ CHARGE : "charged via (bank cards)"
    CHARGE ||--|{ LEDGER_TRANSACTION : "recorded as"
    TRIP ||--|{ LEDGER_TRANSACTION : "fares recorded as"
    MEDIUM ||--o| DENY_LIST_ENTRY : "may be on"
\`\`\`

\`RIDER_FARE_WEEK\` is keyed by **rider key**, which is either an account or an unlinked medium's token. That is why it has no drawn relationship to \`ACCOUNT\` or \`MEDIUM\`.

### Entity: Tap
- **Description:** A single presentation of a medium at a validator. The raw fact everything else is derived from.
- **Key attributes:** tap ID (generated on the validator, globally unique), token, medium type, validator ID, operator, route or station, tap time (UTC instant), validator time zone, local result (accepted or denied, with reason), signature.
- **Invariants:**
  - Immutable once recorded.
  - Unique by tap ID; duplicates are ignored.
  - A denied tap never produces a fare.
- **Lifecycle:** \`Recorded\` (on validator) → \`Received\` (Device Gateway acknowledged) → \`Routed\` (rider key assigned) → \`Rated\` → possibly \`Re-rated\` one or more times.

### Entity: Trip
- **Description:** The taps covered by one fare.
- **Key attributes:** trip ID, rider key, first-tap time, operator of the first tap, fare rule version, fare category, base fare, capped fare.
- **Invariants:**
  - Every tap in a trip falls within the transfer window measured from the trip's first tap.
  - A trip belongs to exactly one service day: the service day of its first tap.
  - Capped fare ≤ base fare.
- **Lifecycle:** \`Open\` (transfer window running) → \`Completed\` (window closed) → \`Adjusted\` (re-rated after completion).

### Entity: Rider Fare Week
- **Description:** All trips and cap accumulators for one rider key in one fare week.
- **Key attributes:** rider key, fare week start, service days, daily and weekly cap accumulators, version (for optimistic concurrency).
- **Invariants:**
  - Sum of capped fares in a service day ≤ daily cap for the fare category.
  - Sum of capped fares in the week ≤ weekly cap.
  - Re-rating the week from its taps always produces the same result (deterministic).
- **Lifecycle:** \`Active\` (current week) → \`Closed\` (week ended, still re-ratable by late taps) → \`Sealed\` (30 days after week end; any later tap is rated as a manual adjustment).

### Entity: Account
- **Description:** A rider's registered relationship with CRT.
- **Key attributes:** account ID, sign-in identity (from Entra External ID), contact email or phone, language, privacy setting (13 months or 90 days), status.
- **Invariants:**
  - At most 5 linked media.
  - A medium is linked to at most one account.
  - A closed account has zero stored value.
- **Lifecycle:** \`Pending verification\` → \`Active\` → \`Suspended\` (fraud hold) → \`Closed\`.

### Entity: Medium
- **Description:** A tappable credential.
- **Key attributes:** token, type (bank card, wallet, CRT card, app ticket), display hint (last 4 and expiry, or CRT card number), linked account (optional), status.
- **Invariants:**
  - The full card number is never an attribute. Bank-card media carry a media token; the payment token lives only in Payments & Settlement.
  - A blocked medium is always on the deny list.
- **Lifecycle:** \`Active\` → \`Blocked\` (lost, stolen or debt) → \`Replaced\` or back to \`Active\` (debt paid).

### Entity: Fare Rule Version
- **Description:** An approved, immutable set of fare rules for one operator.
- **Key attributes:** version ID, operator, effective-from (local date and time), fares by category, transfer window, daily and weekly caps, author, approver.
- **Invariants:**
  - Immutable once approved.
  - Author and approver are different people.
  - Effective-from is in the future at the moment of approval.
  - Versions for one operator never overlap: each starts where the previous one ends.
- **Lifecycle:** \`Draft\` → \`Simulated\` → \`Approved\` → \`Effective\` → \`Superseded\`.

### Entity: Ledger Transaction
- **Description:** A balanced, append-only record of one money movement.
- **Key attributes:** transaction ID, source event ID, service day, type (fare, adjustment, top-up, retail load, charge, settlement, refund, fee), entries (account code, debit, credit, amount).
- **Invariants:**
  - Debits equal credits.
  - Never updated or deleted; corrections are new transactions.
  - Unique by source event ID, so replays are idempotent.
- **Lifecycle:** written once; never changes.

## 4. Aggregates (if DDD)
| Aggregate Root | Contains | Consistency Boundary |
|---|---|---|
| **Rider Fare Week** | Service days, trips, tap references, daily and weekly cap accumulators | All fare and cap rules for one rider key in one week are enforced in a single transaction. One writer per rider key is guaranteed by \`rider-taps\` partitioning (see [Container Diagram §3](c4-model/container-diagram.md)). |
| **Account** | Media links, eligibility status, privacy settings | The 5-media limit, the one-account-per-medium rule and closure rules. Stored value is *not* inside: the balance lives in the ledger. |
| **Medium** | Token, status, display hint | Block and unblock. Linking is coordinated with Account through the Account Service, because both modules sit in one database. |
| **Fare Rule Version** | All rules for one operator and one effective period | Immutability and non-overlap per operator. |
| **Charge** | Fares included, amount, Northgate response, debt | One charge per bank-card token per service day. |
| **Ledger Transaction** | Balanced entries | Debits equal credits. |
| **Validator** | Configuration, software version, deny-list version, status | Device-level settings and ring membership. |

**Why the weekly cap made the aggregate a week, not a day.** A daily aggregate would need to read other days to enforce the weekly cap, which breaks the "one aggregate per transaction" rule. Making the week the aggregate keeps both caps in one consistency boundary. The cost is a larger aggregate, at most 7 days × about 20 trips. A late tap re-rates at most the rest of that week.

**No per-operator cap state.** Cap accumulators are keyed by rider key and fare week only, never by operator. This keeps a future regional cap ([RFC-001](../07-governance/rfc-template.md)) possible without restructuring the aggregate. Recorded at the ARB of 2026-06-24.

**Taps from before a medium was linked** to an account stay on their original rider key and are not re-rated against the account's caps. Merging past cap progress was judged too complex for the benefit, and it would change past charges riders have already seen. Grace Liu accepted this rule on 2026-08-20.

## 5. Context Map

\`\`\`mermaid
flowchart LR
    FP["Fare Policy"]
    J["Journey"]
    RA["Rider Account"]
    MT["Media & Tokens"]
    EL["Eligibility"]
    PS["Payments & Settlement"]
    AP["Apportionment"]
    DF["Device Fleet"]

    NG["Northgate<br/>(external)"]
    VN["Vantor<br/>(external)"]
    DHS["State DHS<br/>(external)"]
    CP["CornerPay<br/>(external)"]
    ERP["CRT ERP<br/>(external)"]
    RC["RiverCard<br/>(legacy)"]

    FP -- "Customer/Supplier<br/>Published language: FareRuleVersion" --> J
    MT -- "Customer/Supplier<br/>token → rider key" --> J
    EL -- "Published language:<br/>EligibilityChanged" --> J
    J -- "Published language:<br/>FareCalculated, FareAdjusted" --> PS
    J -- "Published language:<br/>TripCompleted" --> AP
    PS -- "Customer/Supplier:<br/>DebtRaised, DebtCleared" --> DF
    MT -- "Customer/Supplier:<br/>MediumBlocked" --> DF
    RA -- "Partnership" --- MT
    RA -- "Partnership" --- EL

    PS -- "Anti-corruption layer" --> NG
    DF -- "Anti-corruption layer" --> VN
    EL -- "Anti-corruption layer" --> DHS
    PS -- "Anti-corruption layer" --> CP
    PS -- "Conformist" --> ERP
    J -- "Anti-corruption layer<br/>(RiverCard Bridge, 2028)" --> RC
\`\`\`

| Upstream | Downstream | Relationship | Notes |
|---|---|---|---|
| Fare Policy | Journey | Customer/Supplier with a published language | Journey consumes \`FareRuleVersionPublished\` and caches versions. Fare Policy never calls Journey. |
| Media & Tokens | Journey | Customer/Supplier | The Tap Router asks "which rider key owns this token?" Journey defines what it needs; Media & Tokens supplies it. |
| Eligibility | Journey | Published language | \`EligibilityChanged\` events set the fare category from a given time. |
| Journey | Payments & Settlement | Published language | Payments never recalculates fares; it records what Journey decides. |
| Journey | Apportionment | Published language | \`TripCompleted\` includes the operators of every tap in the trip. |
| Payments & Settlement, Media & Tokens | Device Fleet | Customer/Supplier | Device Fleet builds the deny list from their events. |
| Rider Account ↔ Media & Tokens ↔ Eligibility | — | Partnership | Same team, released together, separate modules. |
| Payments & Settlement | Northgate | Anti-corruption layer | Northgate's model (merchant, terminal, MTT aggregation) is translated into charges and ledger transactions. |
| Device Fleet | Vantor | Anti-corruption layer | Vantor's tap format and fleet API are translated at the Device Gateway and Device Management Service. This keeps validators replaceable (NFR-PORT-01). |
| Eligibility | State DHS | Anti-corruption layer | Only "eligible until date" crosses the boundary; no DHS case data is stored. |
| Payments & Settlement | CRT ERP | Conformist | Tapline adopts the ERP's chart of accounts and journal import format. There's no value in translating. |
| Journey | RiverCard | Anti-corruption layer | The RiverCard Bridge isolates Castellan's model during the 2028 transition and is deleted afterwards. |
`;export{e as default};
