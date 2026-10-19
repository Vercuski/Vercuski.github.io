const e=`---
title: As-Built Documentation — Project Tapline (Phase 2)
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2028-07-14
reviewers:
  - Dana Okafor (Chief Architect) — approved 2028-07-12
  - Sam Ortega (SRE Lead) — approved §4 and §5 on 2028-07-12
  - Ravi Patel, Mei Chen, Hannah Cole, Diego Alvarez (team leads) — confirmed their sections 2028-07-13
  - CRT IT Operations Manager — accepted for steady-state operations 2028-07-14
tags:
  - as_built
---
# As-Built Documentation — Project Tapline (Phase 2)

> [!summary] What is actually running, July 2028
> This records Tapline **as deployed at the end of Phase 2**. It is the handover from the program's delivery team to CRT's permanent product teams and IT Operations, as the delivery partner rolls off in August 2028. The design held. The account-based model, offline-first edge, two-stream pipeline, card-data zone and append-only ledger are all as planned. There are **14 deviations** (§3). Most came from the pilot, Castellan's delays and the fall-back incident. Where this document and the [SAD](../02-core-architecture/solution-architecture-document.md) (v1.0, October 2026) disagree, **this document describes reality**. SAD v1.1 is due before the Gate 3 design review (finding F-6).

## 1. Summary

**Deployed:**
- About 4,800 validators: 4,680 Vantor V7 on all six garages and both rail lines, and 120 V5 on the ferry.
- 320 handhelds.
- Rider App, Rider Portal and Back-Office Portal.
- 17 cloud services across two AKS clusters in East US 2, with a warm standby in Central US.
- Integrations live with Northgate, State DHS, CornerPay, CRT ERP and the RiverCard Bridge to Castellan.

**Not deployed yet, by plan:**
- Partner Portal, Apportionment and Keel integration (Phase 4).
- Customer migration (Phase 3; wave M1 started 2028-03-01).

**Production at handover** (June 2028 averages):
| Measure | Value |
|---|---|
| Taps per weekday | ~318k: 58% open payments, 9% CRT cards and app, 31% RiverCard through the bridge, 2% other |
| Accounts / linked media | 412k / 780k |
| On-board cash share of bus boardings | 9% (from 22% in 2025) |
| Cost of fare collection | 11.8% of fare revenue in H1 2028 (from 15.1%; target ≤ 10% by 2030) |
| SLOs | All met for the quarter ([Gate 2 review](../10-testing-and-validation/architecture-compliance-review.md)) |

## 2. Final Architecture

New or changed since the design are marked ★.

\`\`\`mermaid
flowchart TB
    subgraph edge["Edge"]
        v7["Vantor V7 ×4,680<br/>firmware 7.4 ★ (UTC + offset)"]
        v5["Vantor V5 ×120 (ferry, EX-001)"]
        hh["Handhelds ×320"]
    end
    subgraph ingress["Ingress"]
        fd["Front Door + WAF"]
        apim["APIM"]
        dgw["Device Gateway<br/>+ ambiguity resolver ★ (until F-1 closes)<br/>+ V5 listener (EX-001)"]
    end
    subgraph journey["Journey"]
        router["Tap Router<br/>(rivercard → bridge ★)"]
        fe["Fare Engine<br/>ServiceDayClock intervals, NodaTime ★"]
    end
    subgraph money["Card-data zone"]
        pay["Payments"]
        ledger["Ledger"]
        settle["Settlement Jobs<br/>+ pre-charge cap guard ★"]
        ra["Revenue Assurance ★<br/>(independent recompute)"]
    end
    subgraph other["Other contexts"]
        acct["Account Service<br/>+ Legacy module ★ (Phase 3)"]
        fps["Fare Policy"]
        dls["Deny List"]
        dms["Device Mgmt"]
        integ["Integration"]
        notif["Notification"]
    end
    bridge["RiverCard Bridge ★<br/>(batch postings + read-only replica, EX-002)"]
    eh[["Event Hubs: taps · rider-taps · domain-events"]]

    v7 & v5 --> dgw --> eh --> router --> eh
    eh --> fe --> eh
    eh --> ledger & pay & dls & notif
    router --> bridge --> castellan["Castellan RiverCard"]
    settle --> northgate["Northgate"]
    ra -. "reads taps + charges" .-> ledger
    hh & fd --> apim --> acct & fps & pay & fe
    acct --> bridge
\`\`\`

## 3. Deviations from Original Design
| Planned | Actual | Reason |
|---|---|---|
| Validators send local wall-clock time + zone name (ICD-002 v1.0); the Device Gateway converts with \`TimeZoneInfo\` | **Validators send UTC instant + offset + sequence (firmware 7.4, ICD-002 v1.1).** The Device Gateway keeps an ambiguity resolver for the 141 validators still on 7.3. | [INC-2027-1107-01](../08-risk-and-operations/incident-postmortem.md); [ADR-0008](../06-decisions-and-standards/adr/0008-time-handling-utc-instants-and-service-day-boundaries.md) |
| Cap Accumulator a pure function of the trip list (design); precomputed UTC day windows (March 2027 optimization) | **Cap windows come only from \`ServiceDayClock\` as instant intervals; NodaTime throughout Journey** | Incident root cause; ADR-0008 |
| Charges trusted from Fare Engine output | **Pre-charge cap guard** in Settlement Jobs; new **Revenue Assurance** job (Money Team) recomputes every charged token's totals independently, daily | Postmortem: the Rider Charter promise needed an independent control |
| Taps immutable; corrections not specified | **\`TapTimeCorrected\` fact** (event \`journey.tap-time-corrected.v1\`): original tap kept; Fare Engine uses the corrected instant | Incident recovery; formalized 2028-01 |
| Late-tap grace 15 min; charges built at 03:15 | **Grace 30 min; charges built at 03:30**; file still by 04:00 | Pilot data: 99.2% of offline taps for a service day arrive within 30 min of close (SAD OQ-4) |
| RiverCard Bridge live in January 2028 with card keys from Q3 2027 | Bridge live 2028-01-03 as planned, but **keys arrived 2027-10-29**: rollout state TS2a ran with dual hardware for 4 months. Bridge **reads Castellan's Oracle replica for balances (EX-002)** instead of a Castellan API. | Castellan delays (RSK-18); [Transition Architecture](../09-transition-and-migration/transition-architecture.md) v1.2 |
| Fareboxes removed with the rollout | **Fareboxes kept as cash-only** until each garage's on-board cash falls below 5% (none yet; lowest is Northside at 6.1%) | Equity and cash access ([Gap Analysis R-7](../09-transition-and-migration/gap-analysis.md)) |
| No TVMs in scope | **24 TVMs upgraded** to sell CRT cards and take cash loads; 114 retired | Gap Analysis R-6; Program Board 2026-10-21 |
| Orleans considered for rider fare week state (Trial, SAD OQ-1) | **Not adopted.** Journey DB (Hyperscale, 8 vCores) runs at 38% of log-write capacity at peak. | Phase 1 and 2 load data; stays on the radar as Trial |
| Ingress NGINX for AKS ingress | **Application Gateway for Containers** | Ingress NGINX retirement (radar change 2026-10-07) |
| Northgate verification limit 50/s | **100/s burst during planned events**, agreed through the Joint Change Board (ICD-001 v1.1, 2027-03) | New-card burst test ([Capacity Planning](../08-risk-and-operations/capacity-planning.md)) |
| 400 handhelds | **320 handhelds** in service; 80 held as spares | Inspector staffing set by Rail Operations at 64 per shift |
| Deny-list manifest caching rules in Front Door defaults | **Explicit \`no-cache\` rule for the manifest, asserted by a policy test** | Deny-list stall 2028-04-02 (Gate 2 finding F-5) |
| "Hold charges" as an ad-hoc feature flag | **Documented control with its own runbook and trigger** (\`Settlement:HoldChargeBuild\`) | Postmortem action |

**Unchanged and worth confirming:**
- Account-based model (ADR-0002), offline-first validators with signed deny lists (ADR-0004), no card numbers (ADR-0005; P2PE listed 2027-03-04).
- Event Hubs (ADR-0003) and ledger tables (ADR-0006).
- Services by bounded context (ADR-0007): the Account Service still hosts three contexts, as accepted.

## 4. Environment Details
| Environment | URL | Notes |
|---|---|---|
| Production | \`api.crt-transit.example\`, \`my.crt-transit.example\`, \`backoffice.crt-transit.example\`, \`fares.crt-transit.example\`; Device Gateway \`device.tapline.internal\` (+ \`device-v5.tapline.internal\` for EX-001) | East US 2 active; Central US warm standby (25%). Last production failover test 2027-09-26. |
| Staging | \`staging.tapline.crt-transit.example\` | Production SKUs; quarterly DR drills (last 2028-04-13); clock-change game days |
| Test | \`test.tapline.crt-transit.example\` | Northgate certification environment; nightly regression |
| Hardware lab | \`hwlab.tapline.crt-transit.example\` | Ridgeline garage: 24 V7, 6 V5, 8 handhelds, robot tapper |
| Performance | Created on demand | Destroyed after each run |
| Dev | \`dev.tapline.crt-transit.example\` | Rebuilt weekly; controllable clock |

## 5. Key Configuration
Non-secret values. Secrets and keys are in Key Vault and Managed HSM ([IaC Notes §5](../04-infrastructure-and-network/infrastructure-as-code-notes.md)). Source of truth: Azure App Configuration (\`appcs-tapline-prod\`) and \`tapline-edge\` releases.

| Setting | Value | Where |
|---|---|---|
| Event Hubs partitions (\`taps\` / \`rider-taps\` / \`domain-events\`) | 32 / 32 / 16 | IaC |
| Event Hubs Premium processing units | 4 (8 for planned events) | IaC, ops calendar |
| Validator upload batch | every 15 s or 50 taps | Validator config \`cfg-2028.06\` |
| Validator reconnect jitter | 0–60 s | Validator config |
| Deny-list delta interval / validator poll | 5 min / 5 min ± 60 s | Deny List Service; validator config |
| Service day boundary | 03:00 \`America/New_York\` (TZDB 2028a) | \`ServiceDayClock\` (code), not configuration |
| Late-tap grace / charge build start | 30 min / 03:30 | \`Settlement:LateTapGrace\`, \`Settlement:ChargeBuildAt\` |
| Fare rule version in effect (CRT) | \`frv_2028_01_01_crt\` (caps $5.00 / $25.00; reduced $2.50 / $12.50) | Fare Policy |
| Fare Engine max concurrent rider keys per instance | 64 | \`FareEngine:MaxConcurrentRiderKeys\` |
| KEDA lag thresholds (Tap Router / Fare Engine) | 2,000 / 1,000 events per partition | Helm values |
| Rider week seal period | 30 days | \`Journey:SealAfterDays\` |
| Refund limits (agent) | $50; 3 per account per 30 days | \`CustomerService:RefundLimits\` |

**Feature flags** (production, at handover):
| Flag | State | Notes |
|---|---|---|
| \`Settlement:CapGuard\` | **Enforce** | Never set to \`Monitor\` without CRO approval |
| \`Settlement:HoldChargeBuild\` | Off | Runbook *Hold charges*; set to On ahead of each clock change for manual release |
| \`DeviceGateway:AmbiguityResolver\` | On | Remove when finding F-1 closes (all validators on 7.4) |
| \`Journey:RiverCardRouting\` | On | Removed in TS4 (2028-11-01) |
| \`Accounts:RiverCardMove\` | On (waves M1–M2) | Wave scope controlled by eligibility rules |
| \`RevenueAssurance:Enabled\` | On | Daily at 07:00 |
| \`Journey:OrleansWeekState\` | Off | Trial only in the performance environment |

## 6. Known Issues / Technical Debt
| Item | Type | Impact | Plan | Owner |
|---|---|---|---|---|
| 141 validators on firmware 7.3 (Gate 2 F-1) | Condition | Rely on the interim ambiguity resolver | All in-service on 7.4 by 2028-10-15 | Diego Alvarez |
| 3 reporting jobs use \`TimeZoneInfo\` (F-2) | Condition | May misreport the repeated hour in hourly ridership | Migrate by 2028-10-15 | Ravi Patel |
| Sealed-week taps adjusted manually (F-3; SAD debt) | Debt | ~40 cases a month for Revenue Operations | Automate in Q4 2028 | Hannah Cole |
| SAD v1.0 out of date (F-6) | Documentation | New engineers read an older design; use this document | SAD v1.1 before the Gate 3 design review | Dana Okafor |
| Account Service hosts three contexts (ADR-0007) | Accepted debt | Eligibility releases coupled to Accounts | Revisit at Phase 4 | Mei Chen |
| Trace context missing in Service Bus commands (F-8) | Debt | Gaps in traces for notifications and integrations | Q3 2028 | Mei Chen |
| EX-001 ferry V5 | Exception | TLS 1.2; upload at dock | V7 at vessel refits; expires 2028-12-15 | Diego Alvarez |
| EX-002 bridge reads Castellan replica | Exception | Coupled to Castellan's schema | Removed with the bridge 2029-01-15 | Aisha Karimi |
| RiverCard balance drift (RSK-03) | Risk | 3,410 cards in manual review at trial 3 | Balance rules; Phase 3 waves sized for review capacity | Jordan Hale |
| Partner capabilities not built | Planned | — | Phase 4 design sprint; RFC-001 waiting on the regional fare agreement | Aisha Karimi |
`;export{e as default};
