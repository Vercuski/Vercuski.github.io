const e=`---
title: Sequence Diagrams — Project Tapline
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2026-09-25
reviewers:
  - Ravi Patel (Principal Engineer, Fare Engine) — approved 2026-09-23
  - Money Team lead — approved flows 2–3 on 2026-09-24
  - Edge Team lead — approved flow 4 on 2026-09-24
  - Dana Okafor (Chief Architect) — approved 2026-09-25
tags:
  - sequence_diagram
---
# Sequence Diagrams — Project Tapline

> [!summary] Only the flows that matter
> Five flows cross several services and carry money or boarding risk: (1) a tap becoming a fare, (2) the first tap of a new bank card, (3) the nightly charge and settlement, (4) deny-list distribution, and (5) re-rating a late tap. Simple create/read/update calls are not drawn. Containers are defined in the [Container Diagram](c4-model/container-diagram.md), terms in the [Domain Model](domain-model.md).

## 1. Flow: Tap to rated fare

The everyday path: UC-01 main flow, NFR-PERF-01 to -03.

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor R as Rider
    participant V as Validator
    participant DG as Device Gateway
    participant T as taps (Event Hubs)
    participant TR as Tap Router
    participant C as Redis cache
    participant RT as rider-taps (Event Hubs)
    participant FE as Fare Engine
    participant J as Journey DB
    participant DE as domain-events
    participant L as Ledger Service

    R->>V: Tap card
    V->>V: Read token, check deny list and double tap
    V-->>R: Accept (green, tone) within 300 ms
    V->>V: Sign and store tap
    Note over V: Upload every 15 s or 50 taps
    V->>DG: POST tap batch (mutual TLS)
    DG->>DG: Verify device certificate and tap signatures
    DG->>T: Write batch
    T-->>DG: Durable
    DG-->>V: 200 OK with acknowledged tap IDs
    V->>V: Delete acknowledged taps
    T->>TR: Tap
    TR->>C: Rider key for token?
    C-->>TR: account_id (or miss, then ask Account Service)
    TR->>RT: Tap keyed by rider key
    RT->>FE: Tap (in order per rider key)
    FE->>J: Load rider fare week
    FE->>FE: Assign service day, build trip, apply caps
    FE->>J: Save week + outbox row (one transaction)
    FE->>DE: FareCalculated (from outbox)
    DE->>L: FareCalculated
    L->>L: Write balanced ledger transaction (idempotent by event ID)
\`\`\`

**Notes:**
- **Failure modes:**
  - Device Gateway or Event Hubs unavailable → the validator keeps taps and retries with backoff. Boarding is unaffected (NFR-AVAIL-03).
  - Redis miss → the Tap Router calls the Account Service. If that is also down, the tap is routed by its media token and re-routed once the account link is known (the Fare Engine merges it into the account's week on re-rating).
  - Fare Engine crash → the partition is taken over by another instance from the last checkpoint. Taps already processed are skipped (see below).
- **Idempotency considerations:**
  - \`tap_id\` is unique. The Device Gateway, Tap Router and Fare Engine all ignore a tap they have already processed. Event Hubs delivery is at-least-once, so this is required, not optional.
  - The Fare Engine writes state and the outgoing event in one transaction (transactional outbox), so an event is never published without its state change, or the reverse.
  - The Ledger Service is idempotent by \`source_event_id\` (unique constraint).
- **Timeout/retry behavior:**
  - Validator upload: 10 s timeout; exponential backoff from 5 s to 5 min with jitter.
  - Tap Router → Account Service: 300 ms timeout, one retry, then fall back to the media token.
  - Fare Engine → Journey DB: optimistic concurrency on \`row_version\`. A conflict, which should never happen with one writer per partition, triggers reload and retry up to 3 times, then a dead-letter alert.

## 2. Flow: First tap of a new bank card

A card Tapline has never seen. It shows the first-ride risk and the boundary around card data.

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor R as Rider
    participant V as Validator (P2PE reader)
    participant DG as Device Gateway
    participant P as Payments Service
    participant N as Northgate Payments
    participant DE as domain-events
    participant DL as Deny List Service

    R->>V: Tap new bank card
    V->>V: Card offline checks pass, token not on deny list
    V-->>R: Accept (first-ride risk)
    V->>DG: Tap + encrypted card data (first tap of token on this validator today)
    DG->>P: Encrypted card data + media token
    P->>P: Payment token known for this media token?
    alt Not known
        P->>N: Account verification ($0) with encrypted card data
        alt Card valid
            N-->>P: Approved + payment token
            P->>P: Store media token → payment token
        else Card invalid or reported lost
            N-->>P: Declined (reason)
            P->>DE: MediumDeclined
            DE->>DL: MediumDeclined
            DL->>DL: Add token to next deny-list delta
        end
    else Already known
        P->>P: Discard encrypted data
    end
\`\`\`

**Notes:**
- **Failure modes:** if Northgate is unavailable, the encrypted data is held, encrypted, in the Payments Service's queue for up to 24 hours and retried. Taps are rated normally meanwhile; the charge waits for the payment token. After 24 hours the medium is treated as declined.
- **Idempotency considerations:** verification is keyed by media token. Many validators may send encrypted data for the same new card on the same day; only the first verification is sent to Northgate.
- **Timeout/retry behavior:** Northgate verification timeout is 5 s, retried with backoff for 24 h. The ICD caps CRT's request rate at 50 per second.
- **Card-data boundary:** encrypted card data passes through the Device Gateway but is never written to \`taps\`, logs or traces. The gateway's logging middleware has an explicit deny-list for the field, and a test checks it.

## 3. Flow: Nightly charge and settlement

Runs every night after the service day closes at 02:59. UC-06, NFR-PERF-07.

\`\`\`mermaid
sequenceDiagram
    autonumber
    participant S as Settlement Jobs
    participant L as Ledger DB
    participant P as Payments Service
    participant N as Northgate Payments
    participant DE as domain-events
    participant DL as Deny List Service
    participant E as CRT ERP
    actor RA as Revenue analyst

    Note over S: 03:15 service day closed, late-tap grace 15 min
    S->>L: Sum capped fares per bank-card token for the service day
    S->>P: Build charges (one per token)
    P->>N: Charge file (SFTP) by 04:00
    N-->>P: Per-charge results (API callbacks)
    loop Each result
        alt Approved
            P->>DE: ChargeApproved
        else Declined
            P->>DE: ChargeDeclined (debt raised)
            DE->>DL: Add token to deny list
        end
    end
    DE->>L: Ledger transactions for results
    N-->>S: Settlement file (05:30)
    S->>L: Match settlement to approved charges
    S->>E: Post summarized journal (by 06:00)
    S-->>RA: Reconciliation dashboard (green or exceptions)
\`\`\`

**Notes:**
- **Failure modes:**
  - Charge file not acknowledged by 04:30 → page the on-call Money Team engineer (runbook *Charge file not acknowledged*).
  - Settlement file late → reconciliation waits and the late delivery is logged as an ICD breach. The ERP post is delayed, never estimated.
  - Any reconciliation difference → exception for Revenue Operations. The day is not locked until it is resolved.
- **Idempotency considerations:**
  - Each charge has a deterministic ID: hash(media token, service date, attempt number). Northgate rejects duplicate IDs, so re-sending the file is safe.
  - Late adjustments after a day is charged become a separate adjustment charge or refund the next night. A sent charge is never changed.
- **Timeout/retry behavior:** SFTP upload retried 5 times over 20 minutes. Callbacks are idempotent by charge ID. If callbacks are missing at 05:00, results are pulled from the Northgate API.

## 4. Flow: Deny-list distribution

From blocking a medium to every connected validator refusing it within 15 minutes (NFR-PERF-04). This is the flow behind the *Deny-list distribution stalled* [runbook](../08-risk-and-operations/runbook-template.md).

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor A as Rider or agent
    participant AS as Account Service
    participant DE as domain-events
    participant DL as Deny List Service
    participant HSM as Managed HSM
    participant B as Blob Storage
    participant FD as Front Door
    participant V as Validator

    A->>AS: Block medium (lost card)
    AS->>DE: MediumBlocked
    DE->>DL: MediumBlocked
    Note over DL: Every 5 min: collect changes since last delta
    DL->>DL: Build delta N+1 (adds and removes)
    DL->>HSM: Sign delta and manifest
    HSM-->>DL: Signatures
    DL->>B: Write delta N+1, then manifest (version N+1)
    loop Every 5 min (staggered)
        V->>FD: GET manifest (If-None-Match)
        alt Manifest changed
            FD-->>V: Manifest N+1
            V->>FD: GET delta N+1
            FD-->>V: Delta
            V->>V: Verify signature, check delta follows current version
            V->>V: Apply and report deny-list version in heartbeat
        else Unchanged
            FD-->>V: 304 Not Modified
        end
    end
\`\`\`

**Notes:**
- **Failure modes:**
  - A validator that missed deltas (a gap in versions) downloads the nightly full list instead.
  - A bad signature → the validator rejects the file, keeps its current list and raises a fault in its heartbeat.
  - Deny List Service down → no new deltas. Validators keep the last list, and the *deny-list age* alert fires at 20 minutes.
- **Idempotency considerations:** deltas are numbered and applied strictly in order. Re-applying a delta the validator already has is a no-op.
- **Timeout/retry behavior:** validators poll every 5 minutes with ±60 s random jitter, so 5,200 validators don't hit Front Door at once. A failed download is retried on the next poll.
- **Order of writes matters:** the delta is written before the manifest that announces it, so a validator never sees a manifest pointing to a file that doesn't exist yet.

## 5. Flow: Re-rating a late tap

A bus offline for two days uploads its stored taps (NFR-INTEG-01 scenario).

\`\`\`mermaid
sequenceDiagram
    autonumber
    participant RT as rider-taps
    participant FE as Fare Engine
    participant FP as Fare rule cache
    participant J as Journey DB
    participant DE as domain-events
    participant L as Ledger Service
    participant S as Settlement Jobs

    RT->>FE: Tap (tapped Monday 08:10, received Wednesday)
    FE->>J: Load rider fare week
    FE->>FE: Week is Active or Closed (not Sealed), so re-rate
    FE->>FP: Fare rule version in effect Monday 08:10
    FP-->>FE: Version v12
    FE->>FE: Insert tap in time order, rebuild trips and caps for Monday onward
    FE->>FE: Compare new result with previous result
    FE->>J: Save week + outbox (FareAdjusted with differences only)
    FE->>DE: FareAdjusted (+$2.00 Monday, −$1.00 Tuesday cap effect)
    DE->>L: Adjustment ledger transactions
    Note over S: Next nightly run
    S->>S: Net adjustments per token into an adjustment charge or refund
\`\`\`

**Notes:**
- **Failure modes:**
  - Tap for a **sealed** week (more than 30 days old) → not re-rated automatically. It is recorded and queued for Revenue Operations to review as a manual adjustment.
  - Fare rule version missing from the cache → loaded from the Policy DB. Versions are never deleted, so this always succeeds.
- **Idempotency considerations:** re-rating is deterministic. Rebuilding a week from its taps always gives the same result, so replaying the same late tap produces a zero difference and no event.
- **Timeout/retry behavior:** as flow 1.
- **Ordering:** trips are rebuilt in tap-time order, not arrival order. Comparisons use the tap's UTC instant so the order holds in every case.
`;export{e as default};
