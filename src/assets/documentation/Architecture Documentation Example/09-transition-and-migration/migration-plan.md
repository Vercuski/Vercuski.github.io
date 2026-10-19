---
title: Migration Plan — Project Tapline
status: approved
owner: Elena Brooks (Program Director)
version: 1.3.0
last_updated: 2027-12-20
reviewers:
  - Marcus Bell (Director, Bus Operations) — approved wave schedule 2027-12-16
  - Rail and Ferry Operations Directors — approved 2027-12-16
  - Aisha Karimi (Lead Solution Architect) — approved 2027-12-17
  - Grace Liu (Director, Fare Policy & Equity) — approved customer waves M1–M4 2027-12-17
  - Program Board — approved v1.3 on 2027-12-20
tags:
  - migration
  - plan
---
# Migration Plan — Project Tapline

> [!summary] Two migrations, one deadline
> 1. **Equipment migration:** V7 validators replace RiverCard equipment garage by garage and line by line (waves W0–W6, January 2027 to March 2028).
> 2. **Customer migration:** RiverCard holders move their balances to Tapline (waves M1–M4, March to December 2028).
>
> Both end at the fixed date: **RiverCard switched off on 31 Dec 2028.**
>
> **Status at v1.3 (2027-12-20):** W0–W3 complete. W3 (Eastbank) went live on 2027-12-06, one week late, after a go/no-go review of the [INC-2027-1107-01](../08-risk-and-operations/incident-postmortem.md) fixes. The plan still holds the 2028-12-31 date with 3 weeks of float.

**Change history:**
- v1.0 (2026-12-11): Gate 0.
- v1.1 (2027-06-30): customer migration redesigned as pull-based waves.
- v1.2 (2027-10-20): W3–W6 dates re-confirmed after RiverCard card-key delivery.
- v1.3 (2027-12-20): W3 actuals; added the incident go/no-go criterion and M4 tap-to-transfer at retail.

## 1. Migration Strategy
- **Phased, by garage and line, for equipment.** Each wave changes one garage (or rail line) so that problems stay small and Operations can support one go-live at a time. V7s are fitted during scheduled bus maintenance in the 4–6 weeks before go-live; go-live itself is a configuration switch, not an installation night.
- **Strangler fig with parallel run, for the fare system.** RiverCard keeps working throughout 2028: first on its own equipment, then on V7s through the RiverCard Bridge ([Transition Architecture](transition-architecture.md)). Riders are never forced to switch on a particular day until acceptance ends on 2028-10-31.
- **Pull-based, for customer data.** Balances move when a rider (or an agent or store on their behalf) asks, never in a bulk push. Most balances live on card chips, and a push from the shadow copy would move wrong amounts for about 2% of cards ([Data Migration Strategy](data-migration-strategy.md)).
- **Not big bang.** A single cutover was rejected at Gate 0: 1,100 buses can't be refitted in one weekend, and RiverCard's balance model makes an overnight data move unreliable.

## 2. Migration Waves

### 2.1 Equipment waves
| Wave | Scope | Timeline | Dependencies | Rollback Plan |
|---|---|---|---|---|
| **W0 · Pilot** ✅ | Route 12 (60 buses, Northside garage); Blue Line (22 stations) | Live 2027-02-01 (closed pilot), 2027-05-03 (open); Gate 1 2027-08-31 | Northgate certification; pilot hardware | Fareboxes kept at front doors; pilot could be paused by config |
| **W1 · Northside** ✅ | Remaining 150 Northside buses | Live 2027-09-13 | Gate 1 | Fareboxes in place for 30 days after go-live; disable V7 open payments by config |
| **W2 · Ridgeline** ✅ | 160 buses (incl. hardware-lab garage) | Live 2027-10-18 | W1 + 30 days stable | As W1 |
| **W3 · Eastbank** ✅ | 190 buses | Live **2027-12-06** (planned 2027-11-29; one-week hold for incident fixes) | W2 + incident action items: cap guard live; DST property tests passing | As W1 |
| **W4 · Harbor Point + Gold Line + ferry** | 200 buses; Gold Line (24 stations); ferry V5s switched to Tapline config | 2028-01-17 | RiverCard Bridge live (2028-01-03); V7 firmware 7.3 ring 3 | As W1; ferry V5 config rollback through rings |
| **W5 · Millbrook Road** | 170 buses | 2028-02-14 | W4 + 21 days stable | As W1 |
| **W6 · Riverside** | 170 buses; final 24 TVM upgrades | 2028-03-13 | W5 + 21 days stable | As W1 |

**Phase 2 Gate** (2028-06-30): 100% of validators accept contactless EMV; ≥ 99.95% of taps processed correctly.

### 2.2 Customer migration waves
| Wave | Scope | Timeline | Dependencies | Rollback Plan |
|---|---|---|---|---|
| **M1 · Assisted** | 38k reduced-fare enrollments; 61k autoload customers. Personal outreach: letters, calls, service-center appointments, community events with the Rider Advisory Committee | 2028-03-01 to 2028-04-30 | Legacy module and balance resolver live; trial migration 3 passed | A moved card can be restored to RiverCard within 30 days (balance reversed in the ledger, RiverCard reactivated through the bridge) |
| **M2 · High balances** | Registered cards with balance ≥ $20 (~140k cards, ~$5.3M) | 2028-05-01 to 2028-06-30 | M1 manual-review queue under 500 | As M1 |
| **M3 · All registered** | All remaining registered cards (~500k with balance). **RiverCard sales stop 2028-07-01.** | 2028-07-01 to 2028-09-30 | CornerPay stores selling CRT cards everywhere RiverCard was sold | As M1 |
| **M4 · Unregistered** | ~1.3M unregistered cards with balance (~$4.4M, average $3.33). **Tap-to-transfer** at CornerPay stores and service centers; campaign at stations | 2028-08-01 to 2028-12-31 (after acceptance ends 2028-10-31: transfer or refund only) | Tap-to-transfer readers in 420 stores | Not reversible after the chip is zeroed; refunds instead |

Wave sizes are planned so that the manual-review queue (balance differences over $50) never exceeds what 6 Revenue Operations staff can clear in 10 business days.

## 3. Data Migration Approach
See the [Data Migration Strategy](data-migration-strategy.md). In short:
- Nightly Castellan extracts feed a Legacy module of pending records.
- Each card moves when the rider asks, using a balance resolver that picks the authoritative balance (latest chip read or shadow) under CFO-approved rules.
- The move is recorded as a ledger opening-balance transaction.
- RiverCard trip history is not migrated; it is archived for 7 years.

## 4. Cutover Plan

### 4.1 Garage wave cutover (repeated for W1–W6)
| When | Step | Owner |
|---|---|---|
| Go-live −6 to −1 weeks | V7s fitted during scheduled maintenance; configured in ring "garage-pre" (accept nothing yet; heartbeat only) | Bus Maintenance, Edge Team |
| Go-live −7 days | **Go/no-go 1:** ≥ 98% of the garage's V7s reporting healthy; operator training ≥ 95% complete; riders informed (bus cards, stops, app) | Elena Brooks (chair), Marcus Bell, Diego Alvarez |
| Go-live −1 day, 14:00 | **Go/no-go 2:** no open Sev1/Sev2; previous wave stable 21 days; post-incident criteria (cap guard alert green; reproducibility 100%) | Program Director, SRE on-call |
| Go-live 03:00 | Garage ring switched to "live" (Device Management): V7s accept Tapline media and, from W4, RiverCard through the bridge | Edge on-call |
| 04:30–06:00 | Pull-out: garage supervisors check validators on every bus; floor walkers from the program team at the garage | Garage superintendent |
| Go-live day | Hypercare: Edge, Journey and Money on-call on site or on the bridge; dashboards filtered to the garage | SRE |
| +1 to +30 days | Daily stand-up on faults, rider complaints, first-ride losses for the garage | Elena Brooks |
| +30 days | Farebox card readers disabled (cash only); rollback window closes | Marcus Bell |

### 4.2 Final RiverCard switch-off (2028-12-31)
| When | Step |
|---|---|
| 2028-11-01 | V7s deny RiverCard cards ("RiverCard retired" message). Tap-to-transfer and refunds continue. |
| 2028-12-15 | **Go/no-go:** ≥ 95% of stored value moved or refunded; daily liability reconciliation exact for 30 days; archive tested by restoring a sample; refund service ready |
| 2028-12-31 22:00 | Final Castellan extract (full) to the RiverCard archive and refund service |
| 2028-12-31 23:59 | Castellan switches RiverCard off (back office, web portal, POS) |
| 2029-01-01 06:00 | Verification: final extract totals match Castellan's closing liability report; refund service balances match; archive digests recorded |
| 2029-01-15 | RiverCard Bridge decommissioned; Tap Router rule removed; EX-002 closed |
| 2029-03-31 | Firewall rule F11 removed; ExpressRoute routes to Castellan withdrawn |

**Gate 3 criteria:** RiverCard off; **$0.00 unexplained** stored value across the final extract, the refund service and the Tapline ledger.

## 5. Rollback Strategy
- **Equipment waves:**
  - For 30 days after go-live a garage can return to fareboxes for card payment by switching its ring to "pre" and re-enabling farebox card readers. Tapline media riders are told to use cash or RiverCard during a rollback.
  - The decision belongs to the Program Director with the Director of Bus Operations. The trigger is tap success below 98% for a day, or a Sev1 attributable to the wave.
  - **No rollback has been needed in W0–W3.**
- **Customer migration:**
  - A moved card can be reversed for 30 days: the ledger reversal and RiverCard reactivation run through the bridge until 2028-10-31.
  - Tap-to-transfer (M4) can't be reversed after the chip is zeroed. Errors are corrected by refund.
- **Switch-off:** irreversible once Castellan shuts RiverCard down. The fallback is the refund service with the final extract. The **go/no-go on 2028-12-15** is the last point where switch-off could be delayed. The cost would be about $1.5M a month in Castellan fees under the extension clause, which the contingency ring-fence covers for 1 month only.

## 6. Communication Plan
| Audience | What they need to know | When | Channel | Owner |
|---|---|---|---|---|
| Riders on a garage's routes | "Tap your bank card, phone or CRT card on any door"; RiverCard still works | 4 weeks and 1 week before go-live; go-live day | On-bus cards, stop posters, app banners, social media, four languages | Communications |
| All RiverCard holders | Key dates: sales end (2028-07-01), acceptance ends (2028-10-31), switch-off (2028-12-31); how to move | From 2027-09, monthly from 2028-03 | Email to registered holders; station and bus posters; radio; community events | Communications, Grace Liu |
| Reduced-fare riders | Personal help to move status and balance | M1, from 2028-03-01 | Letters, phone calls, service-center appointments | Customer Service |
| Unregistered cardholders | Tap-to-transfer at stores and service centers | M4, from 2028-08-01 | Station campaign, retail posters, app | Communications, CornerPay |
| Bus operators and supervisors | What changes at the door; no new fare duties; how to report faults | 6 weeks before each wave; toolbox talks the week before | Training sessions, union briefing, quick-reference cards | Bus Operations Training |
| Customer service agents | Two systems in 2028; scripts; refund rules | Before each wave and each customer wave | Training, knowledge base | Customer Service Director |
| CornerPay store staff | Selling CRT cards, loads, tap-to-transfer | Before M3 and M4 | CornerPay training | CornerPay |
| CRT Board | Progress, liability, risks | Quarterly (liability reports from Phase 3, per Resolution 2026-12) | Board report | Elena Brooks, Jordan Hale |
| Partner operators | Timeline for Phase 4; transfers during 2028 unchanged | Twice a year | Partner Operator Council | Linda Park |
