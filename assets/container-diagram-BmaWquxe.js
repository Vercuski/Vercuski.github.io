const e=`---
title: "C4 Model — Level 2: Container Diagram — Project Tapline"
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.2.0
last_updated: 2026-09-12
reviewers:
  - Dana Okafor (Chief Architect) — approved 2026-09-02
  - Ravi Patel (Principal Engineer, Fare Engine) — approved 2026-09-02
  - Tom Whitaker (CISO) — approved 2026-09-03 (card-data zone boundary)
  - Sam Ortega (SRE Lead) — approved 2026-09-04
tags:
  - container_diagram
  - containerization
  - c4_model
---
# C4 Model — Level 2: Container Diagram — Project Tapline

## 1. Purpose
Zooms into Tapline to show its deployable building blocks (apps, services, data stores and message streams) and how they communicate. External systems are the ones on the [Context Diagram](context-diagram.md). Services are grouped by the bounded contexts in the [Domain Model](../domain-model.md); [ADR-0007](../../06-decisions-and-standards/adr/0007-services-by-bounded-context.md) records why each context is a small number of services rather than many fine-grained microservices.

**Change history:** v1.1 (2026-09-04) split the Tap Router out of the Fare Engine (see §3, note 1) and moved the Payments Service into the card-data zone. v1.2 (2026-09-12) added the Device Gateway → Payments Service flow for encrypted card data (ADR-0005 v1.1).

\`\`\`mermaid
flowchart TB
    subgraph edge["Edge (vehicles, stations, staff devices)"]
        val["Validator<br/><i>Vantor V7 firmware + CRT config</i><br/>Accept/deny, store and forward taps"]
        hh["Inspection App<br/><i>.NET MAUI on Android handheld</i>"]
    end

    subgraph clients["Rider and staff channels"]
        app["Rider App<br/><i>.NET MAUI (iOS, Android)</i>"]
        portal["Rider Portal<br/><i>Blazor Web App</i>"]
        bo["Back-Office Portal<br/><i>Blazor Web App</i>"]
        pp["Partner Portal<br/><i>Blazor Web App</i>"]
    end

    subgraph ingress["Ingress"]
        fd["Front Door + WAF"]
        apim["API Gateway<br/><i>Azure API Management</i>"]
        dgw["Device Gateway<br/><i>ASP.NET Core, mutual TLS</i>"]
    end

    subgraph journey["Journey and Fare Policy"]
        router["Tap Router<br/><i>.NET worker</i><br/>Token → rider key"]
        fe["Fare Engine<br/><i>.NET worker</i><br/>Trips, fares, caps"]
        fps["Fare Policy Service<br/><i>ASP.NET Core</i>"]
        jdb[("Journey DB<br/><i>Azure SQL</i>")]
        pdb[("Policy DB<br/><i>Azure SQL</i>")]
    end

    subgraph rideracct["Rider Account, Media, Eligibility"]
        acct["Account Service<br/><i>ASP.NET Core</i>"]
        adb[("Account DB<br/><i>Azure SQL</i>")]
        cache[("Read cache<br/><i>Azure Managed Redis</i>")]
    end

    subgraph money["Payments and Settlement (card-data zone)"]
        pay["Payments Service<br/><i>ASP.NET Core</i>"]
        ledger["Ledger Service<br/><i>.NET worker + API</i>"]
        settle["Settlement Jobs<br/><i>.NET jobs</i><br/>Charges, reconciliation, GL"]
        ldb[("Ledger DB<br/><i>Azure SQL ledger tables</i>")]
    end

    subgraph fleet["Device Fleet"]
        dls["Deny List Service<br/><i>.NET worker</i>"]
        dms["Device Management Service<br/><i>ASP.NET Core</i>"]
        blob[("Deny-list and config files<br/><i>Blob Storage via Front Door</i>")]
    end

    subgraph streams["Event streams"]
        eh_taps[["taps<br/><i>Event Hubs</i>"]]
        eh_rtaps[["rider-taps<br/><i>Event Hubs</i>"]]
        eh_dom[["domain-events<br/><i>Event Hubs</i>"]]
    end

    subgraph shared["Shared and analytics"]
        integ["Integration Service<br/><i>ASP.NET Core</i><br/>DHS, CornerPay, ERP, partners"]
        notif["Notification Service<br/><i>.NET worker</i>"]
        appt["Apportionment Service<br/><i>.NET jobs, Phase 4</i>"]
        bridge["RiverCard Bridge<br/><i>.NET worker, 2028 only</i>"]
        lake[("Tap archive and lakehouse<br/><i>ADLS Gen2 + Fabric</i>")]
    end

    val -- "Tap batches, heartbeats (HTTPS, mTLS)" --> dgw
    val -- "Fetch deny list and config (HTTPS)" --> fd
    hh -- "Recent taps (HTTPS)" --> apim
    app & portal --> fd --> apim
    bo & pp --> fd
    apim --> acct & pay & fps & fe
    dgw --> eh_taps --> router --> eh_rtaps --> fe
    router -. "lookup" .-> cache
    fe --> jdb
    fe -- "FareCalculated, TripCompleted" --> eh_dom
    fps --> pdb
    fps -- "FareRuleVersionPublished" --> eh_dom
    acct --> adb
    acct -- "MediumLinked, MediumBlocked,<br/>EligibilityChanged" --> eh_dom
    eh_dom --> ledger & pay & dls & notif & cache
    ledger --> ldb
    settle --> ldb
    pay --> ledger
    dls --> blob
    eh_taps -- "Capture" --> lake
    dms --> dgw
    integ --> acct & pay & ledger
    appt --> ldb
    bridge --> eh_taps

    classDef store fill:#f5f5f5,stroke:#555,color:#111
    class jdb,pdb,adb,cache,ldb,blob,lake store
\`\`\`

The diagram omits some connections to stay readable: every service sends telemetry to Azure Monitor, every service reads secrets from Key Vault, and external systems connect only through the Integration Service, the Payments Service or the Device Management Service (see §3).

## 2. Containers

### 2.1 Edge
| Container | Technology | Responsibility |
|---|---|---|
| Validator | Vantor V7 hardware; Vantor firmware; CRT-supplied fare-media config, deny list and signing certificate | Reads media, decides accept/deny locally (FR-TAP-03), stores signed taps and uploads them (FR-TAP-04). Holds up to 50,000 taps and 5M deny-list entries. |
| Inspection App | .NET MAUI on rugged Android handhelds | Checks proof of payment against taps synced in the last 5 minutes (FR-INSP-01). Shows no personal data. |

### 2.2 Channels
| Container | Technology | Responsibility |
|---|---|---|
| Rider App | .NET MAUI (iOS, Android) | Account, trips, cap progress, top-ups, QR ticket, reduced-fare application. |
| Rider Portal | Blazor Web App (static server rendering with interactive islands) | Same rider features on the web; WCAG 2.2 AA. |
| Back-Office Portal | Blazor Web App (interactive server), CRT single sign-on | Customer service, fare policy, revenue operations, device dashboard. |
| Partner Portal | Blazor Web App, partner single sign-on through Entra ID B2B | Partner fare tables and apportionment statements (Phase 4). |

### 2.3 Ingress
| Container | Technology | Responsibility |
|---|---|---|
| Front Door + WAF | Azure Front Door Premium | Global entry, TLS, web application firewall, CDN for deny-list and config files. |
| API Gateway | Azure API Management | Single front door for app, portal and partner APIs: authentication, rate limits, versioning. |
| Device Gateway | ASP.NET Core on AKS, mutual TLS with per-device certificates | The only endpoint validators talk to for uploads. Verifies device certificates and tap signatures, writes taps to Event Hubs, acknowledges only after a durable write. |

### 2.4 Services
| Container | Technology | Responsibility |
|---|---|---|
| Tap Router | .NET worker on AKS | Reads \`taps\`, resolves each token to a rider key (an account, or the token itself for unlinked cards), and republishes to \`rider-taps\` partitioned by rider key. |
| Fare Engine | .NET worker on AKS | Builds trips, applies transfer rules and caps, re-rates late taps. Single writer per rider key. Detailed in the [Component Diagram](component-diagram.md). |
| Fare Policy Service | ASP.NET Core API on AKS | Fare rule versions, two-person approval, simulation, publishing to the Fare Engine and GTFS-Fares. |
| Account Service | ASP.NET Core API on AKS | Accounts, linked media, CRT card issuance, eligibility, privacy settings. |
| Payments Service | ASP.NET Core API on AKS (card-data zone) | Northgate integration: card verification, daily charges, top-ups, autoload, debt recovery. Holds tokens only, never card numbers. |
| Ledger Service | .NET worker + API on AKS (card-data zone) | Turns fare and money events into balanced, append-only ledger entries; serves balances and statements. |
| Settlement Jobs | .NET scheduled jobs on AKS (card-data zone) | 03:00–06:00 window: build daily charges, send them to Northgate, reconcile settlement, post GL entries. |
| Deny List Service | .NET worker on AKS | Maintains the deny list from account and payment events; publishes a signed full list each night and deltas every 5 minutes. |
| Device Management Service | ASP.NET Core API on AKS | Fleet status, software rings, Vantor Fleet Cloud integration. |
| Integration Service | ASP.NET Core on AKS | Anti-corruption layer for DHS, CornerPay, ERP, and the partner API and SFTP feeds. |
| Notification Service | .NET worker on AKS + Azure Communication Services | Email, SMS and push notifications in four languages. |
| Apportionment Service | .NET scheduled jobs on AKS | Daily revenue split between operators (Phase 4). |
| RiverCard Bridge | .NET worker on AKS | Translates RiverCard taps taken on Tapline validators and posts them to RiverCard (2028 only). Detailed in the [Transition Architecture](../../09-transition-and-migration/transition-architecture.md). |

### 2.5 Data stores and streams
| Container | Technology | Responsibility |
|---|---|---|
| \`taps\` stream | Azure Event Hubs Premium, 32 partitions, key = media token, 7-day retention, Capture to ADLS | Durable landing place for every tap ([ADR-0003](../../06-decisions-and-standards/adr/0003-event-hubs-for-tap-ingestion.md)). |
| \`rider-taps\` stream | Event Hubs, 32 partitions, key = rider key | Orders taps per rider for the Fare Engine. |
| \`domain-events\` stream | Event Hubs, 16 partitions | Published business events between contexts. |
| Journey DB | Azure SQL Database (Hyperscale) | Fare weeks, trips and cap accumulators per rider key. |
| Policy DB | Azure SQL Database | Fare rule versions and approvals. |
| Account DB | Azure SQL Database (Business Critical) | Accounts, media links, eligibility, privacy settings. |
| Ledger DB | Azure SQL Database (Business Critical) with append-only ledger tables | The financial record ([ADR-0006](../../06-decisions-and-standards/adr/0006-azure-sql-ledger-tables-for-fare-ledger.md)). |
| Read cache | Azure Managed Redis | Token → rider-key lookups; account read models. |
| Deny-list and config files | Azure Blob Storage behind Front Door | Signed deny lists and validator configuration for download. |
| Tap archive and lakehouse | ADLS Gen2 (immutable storage) + Microsoft Fabric | Raw tap archive for 7 years; de-identified analytics. |

Storage details, retention and backups are in the [Data Architecture](../data-architecture.md).

## 3. Communication
| From | To | Protocol | Description |
|---|---|---|---|
| Validator | Device Gateway | HTTPS with mutual TLS, JSON batches | Tap batches every 15 s or every 50 taps; heartbeat every 5 min. Taps deleted on the device only after acknowledgement. |
| Validator | Front Door (Blob) | HTTPS GET with ETag | Polls the deny-list manifest every 5 minutes; downloads signed deltas or the nightly full list. |
| Device Gateway | \`taps\` | AMQP | Writes tap batches; acknowledges the validator after Event Hubs confirms the write. Taps carry the media token only. |
| Device Gateway | Payments Service | HTTPS (private network) | Passes P2PE-encrypted card data, which CRT cannot decrypt, for media tokens not seen before. Never written to \`taps\` or any log. |
| Tap Router | \`taps\` → \`rider-taps\` | AMQP | Resolves token to rider key (Redis, falling back to the Account Service), republishes. |
| Fare Engine | \`rider-taps\`, Journey DB | AMQP; TDS | One consumer per partition: a single writer per rider key. |
| Fare Engine | \`domain-events\` | AMQP via transactional outbox | Publishes \`TripCompleted\`, \`FareCalculated\`, \`CapReached\`, \`FareAdjusted\`. |
| Rider App, Rider Portal | API Gateway | HTTPS/REST, OAuth 2.0 (Entra External ID) | Account, trips, top-ups. |
| Back-Office Portal | Services through API Gateway | HTTPS/REST, OAuth 2.0 (Entra ID) | Staff actions; every action audited. |
| Account Service | \`domain-events\` | AMQP via outbox | \`MediumLinked\`, \`MediumBlocked\`, \`EligibilityChanged\`, \`AccountClosed\`. |
| Ledger Service | \`domain-events\`, Ledger DB | AMQP; TDS | Consumes fare and money events and writes balanced ledger transactions; idempotent by event ID. |
| Payments Service | Northgate Payments | HTTPS/REST (mutual TLS); SFTP for settlement files | Charges, verifications, tokens, chargebacks. Specified in the [Northgate ICD](../../03-interfaces-and-integration/interface-control-document.md). |
| Settlement Jobs | Northgate (SFTP), CRT ERP | SFTP; ERP journal import API | Daily charge file out by 04:00; settlement file in; GL post by 06:00. |
| Deny List Service | \`domain-events\` → Blob Storage | AMQP; HTTPS | Builds signed deltas and the full list. |
| Device Management Service | Vantor Fleet Cloud | HTTPS/REST | Firmware campaigns, diagnostics. |
| Integration Service | State DHS | HTTPS/REST (mutual TLS) | Eligibility checks. |
| Integration Service | CornerPay | HTTPS webhook (HMAC-signed) | Cash loads. |
| Integration Service | Partners | HTTPS/REST (Partner API); SFTP for one partner | Statements and fare tables (Phase 4). |
| Inspection App | API Gateway | HTTPS/REST | Recent-tap sync for the inspector's line, every 60 s. |
| RiverCard Bridge | RiverCard | Castellan batch API over private connection | 2028 transition only. |

**Notes**
1. **Why two tap streams.** Validators only know the media token, but caps are per account across all linked media. If taps were processed by token, two cards in one account could update the same cap at the same time. The Tap Router re-keys every tap by rider key, so all taps for one rider land on one partition and are processed by one Fare Engine instance, in order. This gives a single writer per rider key without distributed locks.
2. **The card-data zone** contains the Payments Service, Ledger Service, Settlement Jobs and Ledger DB. It is a separate subscription and network segment (see [Network Architecture](../../04-infrastructure-and-network/network-architecture.md)). It holds tokens only, so its PCI scope is small; the scoping review decides the final boundary.
3. **Everything between contexts is asynchronous** except reads through the API Gateway. A context failing does not stop taps being accepted or stored.
`;export{e as default};
