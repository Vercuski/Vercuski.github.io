const e=`---
title: Risk Register — Project Tapline
status: approved
owner: Elena Brooks (Program Director)
version: 2.4.0
last_updated: 2027-11-24
reviewers:
  - Program Board — reviewed 2027-11-24
  - Architecture Review Board — architectural risks reviewed 2027-11-24
tags:
  - risk_register
---
# Risk Register — Project Tapline

> [!summary] Snapshot: 24 November 2027 (Phase 2, about 35% of CRT's fleet on Tapline)
> Twenty risks: 13 open, 4 mitigated and being monitored, 3 closed. Five are rated **High** (score 6–9):
> - RiverCard balance quality (RSK-03)
> - Stored-value reconciliation at cutover (RSK-16)
> - Castellan's cooperation (RSK-18)
> - Vantor firmware dependency (RSK-11)
> - Time-dependent fare rules (RSK-19)
>
> **RSK-19** is new this month, after [INC-2027-1107-01](incident-postmortem.md). Risks specific to security are tracked in the [Threat Model](../05-security/threat-model.md) residual-risk table (R-1 to R-7) and are referenced here, not duplicated.

| ID | Risk | Category | Likelihood | Impact | Score | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| RSK-03 | **RiverCard balance data is inconsistent.** Trial extract 2 (Sep 2027) found 2.3% of registered cards (25,300) whose on-card balance differs from Castellan's back-office "shadow" balance, totalling $186k | Business | H | H | **9** | Reconciliation rules agreed with the CFO (2027-10-14): honor the higher balance up to $50 per card, manual review above; full trial migration 3 in Jan 2028; see [Data Migration Strategy](../09-transition-and-migration/data-migration-strategy.md) | Jordan Hale | Open |
| RSK-16 | **Stored-value liability can't be reconciled to $0.00 at RiverCard switch-off** (Gate 3 criterion; Board condition on quarterly liability reports) | Business | M | H | **6** | Daily liability report (FR-FIN-04) running since Phase 1; migration waves sized for reconciliation; unclaimed balances to state unclaimed-property process; dependent on RSK-03 | Jordan Hale | Open |
| RSK-18 | **Castellan slow to support exit:** extract requests averaging 19 business days against 10 in the exit-assistance schedule; RiverCard bridge interface (ICD-005) still in draft | Business | M | H | **6** | Contract escalation by General Counsel (2027-10-20); weekly exit-assistance meeting; bridge design reduced to a read-only balance lookup plus batch fare posting (EX-002 proposal) | Elena Brooks | Open |
| RSK-11 | **Edge behavior depends on Vantor firmware:** tap format and time semantics (incident defect 2), signing, P2PE; fixes need Vantor releases and fleet rollout | Technical | M | H | **6** | ICD-002 v1.1 and firmware 7.4 (UTC instant + offset + sequence) committed for Q1 2028; interim ambiguity resolver in Device Gateway; firmware defect SLAs in contract; Threat Model R-4 | Diego Alvarez | Open |
| RSK-19 | **Time-dependent fare rules fail at clock changes or service-day boundaries** (new, from INC-2027-1107-01) | Technical | M | H | **6** | Pre-charge cap guard (done); DST property tests (done); [ADR-0008](../06-decisions-and-standards/adr/0008-time-handling-utc-instants-and-service-day-boundaries.md) (ARB 2027-12-08); Coding Standards v2.0; clock-change watch before 2028-03-12; independent revenue assurance check (Jan 2028) | Ravi Patel | Open (mitigating) |
| RSK-15 | **Equity complaints or a Title VI challenge:** the incident affected late-night workers, and 22% of affected riders were reduced-fare | Business | M | M | **4** | Automatic refunds and credits (done); report to the Board (2027-11-17); equity monitoring of cap outcomes by census tract in the lakehouse; Accessibility and Rider Advisory Committees briefed | Grace Liu | Open |
| RSK-07 | **Regional fare agreement delayed,** holding Phase 4 and RFC-001 | Business | M | M | **4** | Council position paper on apportionment delivered 2027-02-10; drafting starts Q1 2028; partners can join individually without the regional cap | Linda Park | Open |
| RSK-08 | **Riders confused by two systems in 2028** (RiverCard and Tapline) | Business | M | M | **4** | RiverCard bridge so old cards work on new validators; single switch-off date published from Phase 2; four-language campaign; retail staff briefing | Elena Brooks | Open |
| RSK-17 | **Cloud cost exceeds budget by 2030** (forecast $2.37M vs $2.1M) | Ops | M | M | **4** | 3-year reservations from 2028 (−$330k a year by 2030); monthly FinOps review; [Capacity Planning §4](capacity-planning.md) | Sam Ortega | Open |
| RSK-20 | **Contingency consumed faster than schedule:** $2.4M of $7.2M used at 38% of the program timeline | Business | M | M | **4** | Monthly forecast to the Program Board; change control on scope; RiverCard migration contingency ring-fenced ($1.5M) | Elena Brooks | Open |
| RSK-01 | **Validator delivery slips** (Buy America supply chain) | Business | L | H | **3** | Delivery milestones with penalties; 3,120 of 4,680 V7s delivered (on schedule); 400 spares in stock; waves sized so any 4 of 6 garages can go first | Diego Alvarez | Open (on track) |
| RSK-05 | **PCI scope grows beyond the card-data zone** | Security | L | H | **3** | P2PE solution **listed 2027-03-04** (compliance gap G-1 closed); scoping review at every gate; first ROC passed 2027-09 | Tom Whitaker | Mitigated |
| RSK-10 | **Team inexperience with event streaming** (ordering, idempotency, replay) | Technical | L | H | **3** | Pairing with delivery partner; property-based tests; replay tooling used successfully in the incident recovery | Ravi Patel | Mitigated |
| RSK-12 | **Event Hubs synchronous geo-replication immature** (RPO 0) | Technical | L | H | **3** | Three staging failover drills passed (Jan, Apr, Jul 2027); production failover test planned before the full-fleet rollout | Sam Ortega | Mitigated |
| RSK-09 | **Journey DB write throughput limits the Fare Engine** | Technical | L | M | **2** | Load test 1,500 taps/s (7.5× design); Orleans trial (Q2 2027) showed no need yet, so it stays on Trial | Ravi Patel | Mitigated |
| RSK-13 | **Ferry V5 validators** (EX-001: TLS 1.2, upload at dock) | Security | L | M | **2** | Compensating controls in place; vessel refit schedule confirmed for Q3–Q4 2028; exception expires 2028-12-15; Threat Model R-3 | Diego Alvarez | Open |
| RSK-14 | **First-ride losses exceed 0.3% of card fare revenue** (ADR-0004) | Business | L | M | **2** | Pilot measured 0.11%; Phase 2 to date 0.14%; ferry reported separately (0.21%); Threat Model R-1 | Miguel Serrano | Open (monitoring) |
| RSK-02 | Northgate production certification delays the pilot | Business | — | — | — | **Certified 2027-06-11** | Hannah Cole | Closed (2027-06-11) |
| RSK-04 | State DHS eligibility API late | Business | — | — | — | **Live 2027-11-01**; manual fallback retained | Mei Chen | Closed (2027-11-01) |
| RSK-06 | Product team can't be hired fast enough | Business | — | — | — | **18 of 18 roles filled** (2027-03); delivery partner reduced to 4 roles | Priya Raman | Closed (2027-03-31) |

## 1. Risk Scoring Legend
- **Likelihood:**
  - **L** (1): unlikely within the program.
  - **M** (2): may well happen.
  - **H** (3): expected, or already happening.
- **Impact:**
  - **L** (1): absorbed within a team's plan.
  - **M** (2): affects a phase milestone, budget by up to $0.5M, or rider experience noticeably.
  - **H** (3): threatens a phase gate, the RiverCard switch-off date, more than $0.5M, compliance, or rider trust broadly.
- **Score** = Likelihood × Impact (1–9):
  - **6–9 High:** Program Board attention; mitigation reviewed every 2 weeks.
  - **3–4 Medium:** owner reviews monthly.
  - **1–2 Low:** quarterly.
- Closed risks stay in the register for the life of the program, with their closing date.

## 2. Review Cadence
- **Program Board, monthly:** every High risk and every change in score; new risks; closures.
- **Risk owners:** update status and mitigation before each Program Board meeting.
- **ARB, monthly:** architectural risks (Technical and Security categories) and any risk created by an ADR or exception.
- **Phase gates:** full review; no open High risk without an agreed mitigation plan.
- **After every Sev1 or Sev2 incident:** the postmortem's author proposes register changes within 5 business days.

**Change log (this version)**
| Version | Date | Change |
|---|---|---|
| 2.4 | 2027-11-24 | Added RSK-19 (time-dependent fare rules) from INC-2027-1107-01. RSK-15 raised from L to M likelihood. RSK-04 closed (DHS API live). RSK-11 impact raised to H (firmware dependency shown by the incident). |
| 2.3 | 2027-10-20 | RSK-03 raised to H likelihood after trial extract 2. RSK-18 raised after exit-assistance delays. |
| 2.2 | 2027-08-31 | Gate 1. RSK-02 closed earlier (certification); RSK-14 measured at 0.11%. |
| 2.0 | 2026-12-18 | Gate 0 baseline. Program risks merged with the roadmap's cross-phase risks and the SAD's architectural risks. |
| 1.0 | 2026-04-06 | Created with the [Architecture Roadmap](../00-vision-and-strategy/architecture-roadmap.md). |
`;export{e as default};
