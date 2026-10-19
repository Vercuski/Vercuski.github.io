const e=`---
title: SLOs, SLAs & Error Budgets — Project Tapline
status: approved
owner: Sam Ortega (SRE Lead)
version: 1.0.0
last_updated: 2026-11-20
reviewers:
  - Aisha Karimi (Lead Solution Architect) — approved 2026-11-18
  - Team leads (Journey, Rider, Money, Edge) — approved their SLOs 2026-11-18
  - Miguel Serrano (Chief Revenue Officer) — approved the Rider Charter commitments 2026-11-19
  - Architecture Review Board — adopted 2026-11-20
tags:
  - sla
  - slo
  - sli
---

# SLOs, SLAs & Error Budgets — Project Tapline

> [!summary] What we promise, to whom
> **SLOs** are internal targets derived from the [NFRs](../01-requirements/non-functional-requirements.md), each owned by one team, with an error budget. **SLAs** are external promises: Tapline has few that are contractual (to partner operators, from Phase 4) and one public commitment (the Rider Charter). We also *consume* SLAs from Northgate, Vantor and others; those are listed in §3.3 because they bound what our SLOs can achieve. Measurement is described in the [Observability Strategy](observability-strategy.md).

## 1. Service Level Indicators (SLIs)
| SLI | Definition | Measurement Method |
|---|---|---|
| **Tap ingestion availability** | Upload batches accepted by the Device Gateway ÷ well-formed upload attempts from registered validators | Gateway metrics (\`devicegw_upload_total\` by status); excludes 4xx caused by revoked or unregistered devices |
| **Tap upload latency** | Time from \`tapped_at\` to Event Hubs write, for validators that were online at the tap | \`received_at − tapped_at\` histogram, filtered to taps whose validator heartbeat was current |
| **Tap-to-account latency** | Time from Event Hubs write to the fare appearing in the account read model | End-to-end histogram from trace spans keyed by \`tap_id\` |
| **Validator decision time** | Card presented to accept/deny shown | Reported by validators in heartbeats (p99 per device, aggregated) |
| **Deny-list freshness** | Share of online validators whose deny-list version is no more than 15 minutes behind the latest published version | Heartbeat \`denylist_version\` vs Deny List Service \`published_version\` |
| **Fare reproducibility** | Share of sampled rider weeks whose re-rating from scratch matches the stored result | Daily job re-rates a random 0.1% of yesterday's rider weeks |
| **Settlement timeliness** | Charge file acknowledged by Northgate by 04:00; GL journal posted by 06:00 | Settlement Jobs completion events |
| **Rider API availability** | Successful requests (non-5xx, excluding 429) ÷ all requests | API Management metrics, plus synthetic probes from 3 locations every 1 min |
| **Rider API latency** | Server time at API Management | APIM \`duration\` histogram |
| **Back-Office availability** | As Rider API, for back-office endpoints during 06:00–23:00 | APIM metrics |
| **Partner statement timeliness** (Phase 4) | Daily statements available by 08:00 | Apportionment job events |

## 2. Service Level Objectives (SLOs)
| Service | SLI | SLO Target | Measurement Window |
|---|---|---|---|
| Device Gateway | Tap ingestion availability | **99.95%** | Rolling 30 days |
| Device Gateway | Tap upload latency (p95) | **≤ 30 s** | Rolling 30 days |
| Journey (Tap Router + Fare Engine) | Tap-to-account latency | **95% ≤ 60 s; 99% ≤ 5 min** | Rolling 30 days |
| Validator fleet | Decision time (p99) | **≤ 300 ms** | Rolling 7 days |
| Deny List Service | Deny-list freshness | **99%** of online validators within 15 min, measured every 5 min | Rolling 30 days |
| Fare Engine | Fare reproducibility | **100%** | Daily. No error budget: any mismatch is a Sev2 incident |
| Settlement Jobs | Charge file by 04:00; GL by 06:00 | **Every service day** (allowance: 1 miss per quarter) | Calendar quarter |
| Rider API | Availability | **99.9%** | Rolling 30 days |
| Rider API | Latency (p95 / p99) | **≤ 500 ms / ≤ 1.5 s** | Rolling 30 days |
| Back-Office API | Availability (06:00–23:00) | **99.9%** | Rolling 30 days |
| Apportionment (Phase 4) | Statements by 08:00 | **99%** of days | Calendar quarter |

SLOs are set at or slightly stricter than the NFR targets, so that NFR evidence for phase gates comes straight from SLO dashboards.

## 3. Service Level Agreements (SLAs)

### 3.1 Commitments Tapline makes
| Commitment | Target | Penalty for Breach |
|---|---|---|
| **Rider Charter** (public, adopted by the CRT Board): you'll never pay more than the cap | 100% of charges within the daily and weekly caps | Automatic refund of any overcharge within **5 business days**, plus a $5 account credit |
| Rider Charter: charge disputes answered | 95% within 3 business days | Escalation to Customer Service Director; reported to the Board quarterly |
| Rider Charter: refunds paid | 95% within 5 business days of approval | As above |
| **Regional fare agreement** (Phase 4): daily apportionment statements | Available by 08:00 on 99% of days per quarter | Service credit to partners per the agreement's schedule |

### 3.2 Internal operating-level agreements
| Commitment | Provider | Target |
|---|---|---|
| ExpressRoute and DC firewall availability | CRT Network Operations | 99.95% monthly |
| Carrier private APN | Carrier (through CRT contract) | 99.9% monthly per carrier; dual carrier per bus |
| ERP journal import window | CRT ERP team | Open 05:00–07:00 daily |

### 3.3 SLAs Tapline depends on
| Provider | Commitment | Source |
|---|---|---|
| Northgate Payments | API 99.95%; verification p95 ≤ 1.5 s; results by 05:00; settlement file by 05:30 | [ICD-001 §5](../03-interfaces-and-integration/interface-control-document.md) |
| Vantor | Fleet Cloud 99.9%; P1 response 1 h; firmware security fixes ≤ 30 days | Vantor contract, ICD-002 |
| State DHS | 99.5% business hours | Data-sharing agreement |
| CornerPay | Loads delivered within 5 min (p95); 99.9% | ICD-004 |
| Microsoft Azure | Per-service SLAs (e.g. Event Hubs Premium 99.95%; zone-redundant SQL Business Critical 99.995%) | Microsoft SLA for Online Services |

The Rider API's 99.9% depends on Front Door, APIM, AKS and SQL together. Their composite SLA is about 99.9%, so redundancy across zones, plus degraded modes (read-only, cached trips), are what make the SLO achievable.

## 4. Error Budget
- **Budget = 100% − SLO target.**

| SLO | Budget per 30 days |
|---|---|
| 99.95% | ≈ 21.6 min |
| 99.9% | ≈ 43.2 min |
| 99% (deny-list freshness) | ≈ 7.2 h of validator-time outside 15 min |

- **Burn-rate alerts** (multi-window, multi-burn-rate):
  - **Page** when 2% of the budget burns in 1 hour (14.4× burn), confirmed over 5 minutes.
  - **Ticket** when 10% burns in 6 hours (6× burn), confirmed over 30 minutes.
- **Policy when the budget is exhausted:**
  1. The owning team freezes feature releases for that service. Only reliability fixes, security patches and fare-rule data changes may ship.
  2. The team presents a recovery plan at the next architecture sync.
  3. The freeze lifts when the rolling budget is positive again, or by ARB decision.
  4. Two exhausted budgets in a quarter put the service on the ARB agenda.
- **Zero-budget SLIs:** fare reproducibility and the Rider Charter cap commitment have **no error budget**. Any breach is a Sev2 incident with a postmortem.
- **Planned maintenance** counts against the budget unless it falls inside an agreed window announced 7 days in advance. Settlement-window outages always count.

## 5. Ownership
| SLO | Owning Team | Escalation Contact |
|---|---|---|
| Tap ingestion availability, upload latency | Edge Team | Diego Alvarez |
| Validator decision time | Edge Team (with Vantor) | Diego Alvarez |
| Deny-list freshness | Edge Team | Diego Alvarez |
| Tap-to-account latency, fare reproducibility | Journey Team | Ravi Patel |
| Settlement timeliness, Rider Charter cap commitment | Money Team | Hannah Cole |
| Rider API, Back-Office API | Rider Team | Mei Chen |
| Apportionment statements (Phase 4) | Money Team | Hannah Cole |
| SLO platform, burn-rate alerting, reporting | Platform Team (SRE) | Sam Ortega |

SLO attainment and budget consumption are reported monthly to the Program Board and at each phase gate.
`;export{e as default};
