const e=`---
title: Architecture Compliance Review — Project Tapline, Gate 2 (Systemwide Open Payments)
status: approved
owner: Dana Okafor (Chief Architect, ARB chair)
version: 1.0.0
last_updated: 2028-06-23
reviewers:
  - Architecture Review Board — review held 2028-06-21; result approved
  - Tom Whitaker (CISO) — security items 2028-06-20
  - Sam Ortega (SRE Lead) — SLO evidence 2028-06-19
  - Tomás Reyes (Test & Quality Lead) — test evidence 2028-06-19
tags:
  - compliance
  - review
---
# Architecture Compliance Review — Gate 2

> [!summary] Result: **Ready with conditions**
> Tapline meets the Gate 2 success criteria. Every CRT validator accepts contactless EMV, and **99.987%** of taps were processed correctly (March–May 2028) against a 99.95% target. The architecture is implemented as decided in ADR-0001 to ADR-0008, with one approved exception per edge case (EX-001, EX-002). Two Medium findings become **conditions**: finishing the Vantor firmware 7.4 rollout, and removing the last uses of \`TimeZoneInfo\` outside the domain. Both are due before the next clock change (2028-11-05). The Program Board accepted the result on 2028-06-28, and Gate 2 was passed on 2028-06-30.

## 1. Scope of Review
- **Gate:** Phase 2 exit, *Systemwide open payments* ([Roadmap §4](../00-vision-and-strategy/architecture-roadmap.md)).
- **Period of evidence:** 2028-03-01 to 2028-05-31 for production data; test and drill evidence since Gate 1.
- **In scope:**
  - All Tapline containers in production.
  - Validators on all six garages, both rail lines and the ferry.
  - The Rider App and portals, back office, and integrations with Northgate, DHS, CornerPay, ERP and the RiverCard Bridge.
  - Documentation set.
- **Out of scope:** Phase 3 customer migration readiness, assessed at Gate 3; Phase 4 partner capabilities.
- **Method:** the [Governance Framework §3.3](../07-governance/governance-framework.md) checklist, the template items, and the **time-handling check** added after INC-2027-1107-01. Evidence comes from SLO dashboards, test reports, the ADR log, exception register, threat model, compliance matrix and risk register. Each owning team submitted a self-assessment, and the ARB sampled the evidence.

## 2. Compliance Checklist
| Item | Compliant? | Notes |
|---|---|---|
| Follows approved reference architecture | **Y** | All services on the approved stack; reference patterns used as specified (outbox, idempotent consumers, partitioned single writer, ACLs). Radar check: no Hold items in production code; NodaTime moved to Adopt (ADR-0008). |
| ADRs recorded for major decisions | **Y** | ADR-0001 to ADR-0008 accepted. Retrospective ADR ratio 26% in the last year, above the 20% target (finding F-7). |
| ADRs implemented as decided, or superseded | **Y** | Sampled: ADR-0004 (signed deny lists, chained versions verified in the lab), ADR-0005 (DLP scans clean), ADR-0006 (ledger verification nightly, 0 failures), ADR-0008 (see the time-handling check below) |
| NFRs validated | **Y** | See §2.1 |
| Security review completed | **Y** | Threat model v1.4 (2028-04, adds the RiverCard Bridge); penetration test 2028-05 (0 Critical, 0 High, 3 Medium fixed); segmentation test 2028-04 passed; PCI ROC 2027 passed (2028 assessment scheduled 2028-09) |
| No expired exceptions; open exceptions within scope | **Y** | EX-001 (ferry V5): controls verified; refit schedule confirmed; expires 2028-12-15. EX-002 (bridge reads Oracle replica): limited to balance lookups as approved. |
| Threat model and compliance matrix current; no open High threats | **Y** | All compliance gaps G-1 to G-5 closed (G-1 on 2027-03-04). No open High threats. |
| Runbooks exist for every alert of services in production | **Y** | 23 alerts, 23 runbooks. New since Gate 1: *Clock-change watch*, *Hold charges*, *Charge above cap (guard tripped)*. |
| Documentation set current | **Partial** | SAD v1.0 (2026-10) doesn't reflect ADR-0008, the pre-charge cap guard or the revenue assurance job (finding F-6). The other core documents are current. |
| **Time handling (post-incident check)** | **Partial** | Edge sends UTC instant + offset on firmware 7.4: **97.0%** of validators (finding F-1). \`ServiceDayClock\` is the only source of boundaries in Journey and Settlement (architecture tests). NodaTime in domain and ACL code. 3 reporting jobs still use \`TimeZoneInfo\` (finding F-2). Clock-change game day TC-RES-008 passed 2028-03-07; spring-forward 2028-03-12 rated correctly, with 0 guard trips and 0 assurance differences. |
| Principle conformance (P1–P13) | **Y** | P1–P12 conformant. P13: 2 services lack trace propagation through Service Bus commands (finding F-8, Low). |
| DR tested within the last 6 months | **Y** | Quarterly staging drills (latest 2028-04-13). Annual production failover performed 2027-09-26: ingestion RTO 34 min, ledger replay 0 missing. |

### 2.1 Gate 2 success criteria and key NFR evidence
| Criterion / NFR | Target | Evidence (Mar–May 2028) | Met? |
|---|---|---|---|
| Validators accepting contactless EMV (Vision S3) | 100% | 4,680 V7 + 120 V5 = **100%** (W6 live 2028-03-13) | ✅ |
| Taps processed and settled correctly (S8) | ≥ 99.95% | **99.987%** (exceptions: 2,086 taps from 3 validators with corrupted storage, recovered from the 24 h retention) | ✅ |
| Decision time p99 (S7, NFR-PERF-01) | ≤ 300 ms | 212 ms (fleet p99), 244 ms worst garage | ✅ |
| Riders charged ≤ cap (S9, Rider Charter) | 100% | **100%**: cap guard tripped 0 times; revenue assurance 0 overcharges | ✅ |
| Tap-to-account p95 / p99 | ≤ 60 s / ≤ 5 min | 14 s / 2 min 10 s | ✅ |
| Tap ingestion availability | 99.95% | 99.97% | ✅ |
| Deny-list freshness | 99% | 99.4% (one stall 2028-04-02, 47 min, cause 7, runbook followed) | ✅ |
| Settlement timeliness | Every day (1 miss allowed per quarter) | 92/92 days | ✅ |
| Rider API availability | 99.9% | 99.94% | ✅ |
| First-ride losses (ADR-0004 review trigger) | ≤ 0.3% | 0.14% (ferry 0.21%) | ✅ |
| WCAG 2.2 AA (NFR-USE-01) | 0 Serious/Critical | External audit 2028-05: 0 Critical, 2 Serious (fixed 2028-06-09) | ✅ |
| Load at design capacity (NFR-SCALE-01) | 12,000 taps/min | TC-PERF-002 re-run 2028-05-18: pass; p99 tap-to-account 41 s | ✅ |

## 3. Findings
| Finding | Severity | Recommendation | Owner |
|---|---|---|---|
| **F-1:** Vantor firmware 7.4 (UTC instant + offset) on 97.0% of validators. 141 V7s are in long-term maintenance or spares and still on 7.3, relying on the Device Gateway's interim ambiguity resolver. | Medium | **Condition:** every in-service validator on 7.4 and the resolver's fallback path alarmed by **2028-10-15**; devices returning from maintenance can't go live below 7.4 (Device Management policy) | Diego Alvarez |
| **F-2:** 3 reporting jobs (ridership by hour, Title VI extracts, partner previews) still use \`TimeZoneInfo\` and \`DateTime\` arithmetic. Not money-affecting, but they could misreport the repeated hour. | Medium | **Condition:** migrate to \`ServiceDayClock\` and NodaTime, and extend BannedApiAnalyzers to reporting projects, by **2028-10-15** | Ravi Patel |
| F-3: Independent revenue assurance check (live 2028-02) found 2 undercharges from taps in sealed weeks (> 30 days late) handled manually and late | Low | Automate sealed-week adjustments (accepted debt in SAD §8), now 6 months of data show ~40 cases a month | Hannah Cole |
| F-4: Journey DB at 38% log-write at peak; growth to Phase 4 fits | Info | None; re-check at Gate 3 | Sam Ortega |
| F-5: Deny-list stall 2028-04-02 caused by a Front Door rule change made through IaC but without the manifest no-cache rule | Low | Add a policy test in \`tapline-infra\` asserting \`no-cache\` on the manifest path | Kofi Mensah |
| F-6: SAD v1.0 out of date (no ADR-0008, cap guard, revenue assurance) | Low | Issue SAD v1.1 before Gate 3 design review | Dana Okafor |
| F-7: Retrospective ADRs 26% (target ≤ 20%) | Low | Team leads to raise ADRs at design time; ARB to track per team | Aisha Karimi |
| F-8: Two services (Notification, Integration) don't propagate trace context through Service Bus commands | Low | Add \`traceparent\` to command envelopes | Mei Chen |

**Commendations**
- The post-incident actions were completed and evidenced: cap guard, DST tests, ADR-0008, game day. Spring-forward 2028 passed without an incident.
- Re-rating and replay tooling recovered 2,086 taps from failing validator storage with no rider impact.

## 4. Sign-off
| Role | Name | Decision | Date |
|---|---|---|---|
| ARB chair | Dana Okafor | **Ready with conditions** (F-1, F-2 by 2028-10-15) | 2028-06-21 |
| CIO | Priya Raman | Agreed | 2028-06-21 |
| CISO | Tom Whitaker | Agreed: security items compliant | 2028-06-20 |
| Program Director | Elena Brooks | Conditions added to the program plan and to Gate 3 entry criteria | 2028-06-22 |
| Program Board (business readiness) | Miguel Serrano (chair) | Gate 2 accepted | 2028-06-28 |

*Conditions F-1 and F-2 are tracked in the [Risk Register](../08-risk-and-operations/risk-register.md) under RSK-11 and RSK-19, and must be closed before the fall-back on 2028-11-05.*
`;export{e as default};
