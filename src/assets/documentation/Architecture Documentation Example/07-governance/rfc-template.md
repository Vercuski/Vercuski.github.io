---
title: "RFC-001: Regional Fare Cap Across All Operators"
status: in-review
owner: Linda Park (GM, Harbor County Transit; chair, Partner Operator Council)
version: 0.3.0
last_updated: 2026-06-24
reviewers:
  - Grace Liu (Director, Fare Policy & Equity) — co-author
  - Aisha Karimi (Lead Solution Architect) — architecture review 2026-06-19
  - Architecture Review Board — first reading 2026-06-24; deferred to the Phase 3 design sprint
tags:
  - rfc
---
# RFC: Regional Fare Cap Across All Operators (RFC-001)

| Field  | Value |
| ------ | ----- |
| Author | Linda Park (Harbor County Transit), with Grace Liu (CRT) |
| Status | **Under Review**, deferred by the ARB (2026-06-24) to the Phase 3 design sprint. Preconditions: Partner Operator Council position on apportionment; draft regional fare agreement. |
| Date   | 2026-06-15 (v0.1) · 2026-06-24 (v0.3, after ARB first reading) |

## 1. Summary
Introduce a **regional daily and weekly fare cap** that counts fares paid to *any* operator on Tapline: CRT and the six partner operators. Once a rider has paid the regional cap, all further rides on any participating operator are free for the rest of that service day or fare week. Each operator keeps its own fares and its own caps. The regional cap sits above them, and the revenue given up is shared between operators under an apportionment rule agreed by the Partner Operator Council. The proposal targets Phase 4 (2030) and needs no change to Phases 1–3 beyond keeping the design open to it.

## 2. Motivation
- **Riders who cross operator boundaries pay the most and benefit least.** RiverCard trip data for 2025 shows about 31,000 weekday trips that involve two operators: mostly HCT or Millbrook Express feeders into CRT rail. Those riders pay two base fares and, under per-operator caps, rarely reach either operator's cap. Census-tract analysis shows they are disproportionately from lower-income outer-county areas.
- **Fare capping is only fair if the cap sees the whole trip.** A rider who pays $3.00 a day to HCT and $4.00 to CRT pays $7.00 a day, more than either operator's daily cap, with no cap applying.
- **State funding.** From 2029 the state transit formula pays an integration incentive, estimated at $3.4M a year across the region, for a regional fare product or cap.
- **It is the reason partners are joining.** In the Partner Operator Council's survey (May 2026), five of six partners named regional fare integration as their main reason to join Tapline.

## 3. Detailed Design

**Policy model (subject to Council and Board decisions)**
- **Cap hierarchy per rider and period:**
  1. The fare from the operator's own fare table.
  2. Reduced by the operator's own cap, if reached.
  3. Reduced again by the **regional cap**, if reached across all operators.
- **Initial levels for analysis** (not proposed prices): regional daily cap **$7.50** (reduced $3.75); regional weekly cap **$35.00** (reduced $17.50).
- **Regional cap rules are a separate fare rule type** owned jointly by the Regional Fare Committee (CRT plus partners), approved under the regional fare agreement, not by any single operator.

**Architecture fit**
| Area | Change | Size |
|---|---|---|
| **Domain model** | None to aggregates. The Rider Fare Week is already per rider across operators, and cap accumulators are keyed by rider and fare week only (design constraint recorded 2026-06-24). Add a *regional cap allocation* concept: how a reduction is attributed to the operators whose fares were reduced. | S |
| **Fare Policy** | New rule type `RegionalCapPolicy` with its own approval workflow (two approvers from different operators). Versioned and effective-dated like other fare rules. | M |
| **Fare Engine** | Cap Accumulator gains a second, outer cap level. Fare Calculator records, per trip, the reduction by cap level and operator. Property-based tests extended: the regional total never exceeds the regional cap, and operator totals never exceed their own caps. | M |
| **Events** | `FareCalculated.v2` adds `capReductions[]` (level, operator, amount). Published alongside v1 for 90 days ([Integration Architecture §6](../03-interfaces-and-integration/integration-architecture.md)). | S |
| **Apportionment** | Allocates each regional-cap reduction to operators by the agreed rule (see §4 and Q2). Daily statements show the reductions. | M |
| **Ledger** | New sub-accounts per operator for regional-cap discounts; no change to ledger structure. | S |
| **Rider App** | Cap progress shows operator caps and the regional cap. | S |

**Example** (illustrative levels; operator caps HCT $4.00, CRT $5.00):
| Tap | Operator | Fare | After operator cap | Regional total | After regional cap |
|---|---|---|---|---|---|
| 07:10 | HCT | $2.00 | $2.00 | $2.00 | $2.00 |
| 07:45 | CRT (transfer from HCT not free across operators) | $2.00 | $2.00 | $4.00 | $2.00 |
| 17:20 | CRT | $2.00 | $2.00 | $6.00 | $2.00 |
| 18:05 | HCT | $2.00 | $2.00 | $8.00 → capped | **$1.50** |
| 21:30 | CRT | $2.00 | $1.00 (CRT cap $5.00 reached) | — | **$0.00** |

The rider pays **$7.50** instead of $9.00. The $1.50 regional reduction is allocated between HCT and CRT under the apportionment rule.

## 4. Alternatives Considered
| Alternative | Pros | Cons |
|---|---|---|
| **Status quo:** per-operator caps only | No work; each operator keeps its revenue | Leaves the inequity in §2; forgoes the state incentive |
| **Regional pass product** (buy a regional day or week pass) | Simple to apportion (pass revenue split) | Pay-up-front, the barrier capping was meant to remove; contradicts the move away from passes |
| **Cross-operator transfer credit** (e.g. $1.00 off the second operator's fare within 2 hours) | Small change; easy to explain | Helps single trips but not daily or weekly spend; doesn't qualify for the state incentive |
| **Single regional fare table** (one fare for all operators) | Simplest for riders | Requires all operators to give up fare-setting authority, which partners rejected in the BRD workshops (BR-15) |

**Apportionment options for the cap discount** (for the Council's decision, not the ARB's):
- **Proportional:** reduction split in proportion to each operator's undiscounted fares that day or week.
- **Last-operator-pays:** whichever operator's tap crossed the cap absorbs it. Simple, but penalizes the operator a rider happens to end the day with.
- **Pooled:** a regional fund (from the state incentive) reimburses reductions, so operators keep their full fares.

## 5. Impact
- **Existing systems:** no change in Phases 1–3. In Phase 4: Fare Policy, Fare Engine, Apportionment, Rider App, and a new event version. Estimated **6–8 team-sprints**, mostly Journey and Money teams.
- **Teams:** Journey (cap hierarchy, tests), Money (apportionment, ledger sub-accounts), Rider (app), Fare Policy staff of all operators (new governance).
- **Timelines:** targets 2030, after all six partners are live on their own fare tables. Can't be earlier than the regional fare agreement.
- **Revenue:** estimated regional reduction of **$1.9M a year** at the illustrative levels, against the estimated $3.4M state incentive. Net positive for the region, but the split between operators depends on the apportionment choice.
- **Compliance:** each FTA-funded operator needs its own Title VI fare equity analysis and Board approval before the cap takes effect ([Compliance Matrix](compliance-matrix.md)).
- **Risk:** cross-operator rules increase the blast radius of a fare-rule error, which now affects every operator's revenue. Mitigated by the two-operator approval and mandatory simulation (FR-POL-03).

## 6. Open Questions
| # | Question | For | Needed by |
|---|---|---|---|
| Q1 | Regional cap levels, full and reduced | Regional Fare Committee; operator boards | Regional fare agreement |
| Q2 | Apportionment rule for the cap reduction (proportional, last-operator, pooled) | Partner Operator Council | Before Phase 3 design sprint |
| Q3 | Do institutional programs (CSU student pass, BR-20) count toward the regional cap? | Grace Liu, CSU | Phase 4 design |
| Q4 | Does Keel Mobility microtransit count toward the regional cap? | Partner Operator Council | Phase 4 design |
| Q5 | Should transfers between operators within 2 hours be free under the regional rules, replacing the cap for short trips? | Regional Fare Committee | Regional fare agreement |
| Q6 | Governance: who can change the regional cap, and how are disputes between operators resolved? | General Counsel of each operator | Regional fare agreement |

*Next step:* the Partner Operator Council position paper on Q2 (due 2026-12-31), then re-submission to the ARB for the Phase 3 design sprint.
