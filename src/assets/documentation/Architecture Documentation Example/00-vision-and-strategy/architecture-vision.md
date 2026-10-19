---
title: Architecture Vision — Project Tapline
status: approved
owner: Dana Okafor (Chief Architect)
version: 1.0.0
last_updated: 2026-02-20
reviewers:
  - Miguel Serrano (Chief Revenue Officer, executive sponsor) — approved 2026-02-18
  - Priya Raman (CIO) — approved 2026-02-18
  - Tom Whitaker (CISO) — approved 2026-02-19
  - Grace Liu (Director, Fare Policy & Equity) — approved 2026-02-19
  - Linda Park (Partner Operator Council) — reviewed 2026-02-20
tags:
  - vision
---

# Architecture Vision — Project Tapline

> [!summary] In one sentence
> Any rider can tap whatever they already carry (a bank card, a phone, or a CRT card) on any CRT vehicle and be charged the best fare automatically, on a platform CRT controls and its partner operators can join.

## 1. Purpose / Problem Statement

CRT collects $118M a year in fares through **RiverCard**, a closed-loop smart-card system bought in 2012 and hosted by its vendor, Castellan Fare Systems. RiverCard is reaching the end of its life:

- **Support ends on 31 Dec 2028.** Castellan will not support the system or its fareboxes after that date, and the Oracle platform underneath it is already on extended support.
- **Collecting fares is expensive.** It costs $17.8M a year, or 15.1% of fare revenue. A large share goes to handling cash, which is still 22% of bus boardings.
- **Riders have to plan ahead.** A rider must buy a RiverCard or carry exact cash. Visitors and occasional riders, who already carry contactless bank cards and phones, cannot simply tap and ride.
- **Lower-income riders pay more.** Riders who can't afford a $90 monthly pass pay single fares indefinitely, often spending more over a month than pass holders.
- **The region is fragmented.** Six partner operators each run their own fare media. A trip that crosses operators means two fares and no shared transfer.
- **Fare policy is locked in the vendor's software.** Changing a fare rule needs a Castellan change order and months of lead time.

**If we do nothing**, CRT will run an unsupported, increasingly non-compliant fare system from January 2029. The validators' card readers cannot meet current PCI DSS expectations without replacement, and a farebox failure could leave routes unable to collect fares. Doing nothing is not a real option. See [Business Case §6](business-case.md).

## 2. Goals

1. **Retire RiverCard on time, with no customer money lost.** Switch it off by 31 Dec 2028, with all $14.7M of outstanding stored value transferred or refunded.
2. **Accept open payments everywhere.** Contactless bank cards and digital wallets are accepted on 100% of CRT validators by June 2028.
3. **Make fares fair by default.** Daily and weekly fare caps apply to every rider, including reduced-fare riders, from the systemwide launch.
4. **Lower the cost of collecting fares** from 15.1% to 10% or less of fare revenue by 2030.
5. **Build one regional fare system.** All six partner operators share one platform with daily revenue apportionment by the end of 2030.
6. **Own the fare policy.** CRT can change a fare rule by configuration, with no code change and no vendor change order.

## 3. Stakeholders

| Stakeholder | Role | Interest / Concerns | Decision Authority |
|---|---|---|---|
| CRT Board of Directors | Governing body | Cost, equity, public perception, federal compliance | Approves budget, fare changes and Title VI analyses |
| Miguel Serrano, Chief Revenue Officer | Executive sponsor | Revenue protection, lower collection cost, fare evasion | Approves scope and business priorities |
| Priya Raman, CIO | Technology owner | Sustainability, skills, running cost, vendor lock-in | Approves technology direction |
| Dana Okafor, Chief Architect | Architecture owner, ARB chair | Coherent architecture, standards, decision quality | Approves architecture decisions (ARB) |
| Elena Brooks, Program Director | Delivery | Schedule, dependencies, risk | Approves plans and phase gates |
| Tom Whitaker, CISO | Security and compliance | PCI DSS scope, card data, fraud | Can veto anything that adds unacceptable PCI or security risk |
| Grace Liu, Fare Policy & Equity | Fare policy, Title VI | Equity impact, reduced fares, cash-paying riders | Owns fare rules; prepares Title VI analyses |
| Jordan Hale, CFO | Finance | Stored-value liability, reconciliation, grant compliance | Approves financial controls |
| Bus, Rail & Ferry Operations | Run the service | No slower boarding, no extra driver duties, reliable hardware | Approves operational rollout dates per garage |
| Partner Operator Council (chair: Linda Park, HCT) | Six partner operators | Fair apportionment, control of their own fares, cost to join | Approves the regional fare agreement |
| Rider Advisory and Accessibility Advisory Committees | Rider voice | Ease of use, accessibility, cash access, privacy | Advisory |
| Bus operators' union | Workforce | Operator duties and fare-dispute safety | Consulted under the labor agreement |
| Federal Transit Administration (FTA) | Funder and regulator | Grant compliance, Title VI, Buy America | Grant conditions |
| Northgate Payments, Vantor Devices, State DHS, CornerPay | External providers | Clear interfaces, certification, SLAs | Contractual |

## 4. Business Drivers

- **Hard end-of-support date.** RiverCard and its fareboxes are unsupported after 31 Dec 2028.
- **Cost pressure.** Fare collection costs $17.8M a year, and the post-pandemic operating budget gap makes cutting that cost a Board priority.
- **Equity.** The Board's 2025 Equity Action Plan commits CRT to fare capping and simpler access to reduced fares.
- **Ridership recovery.** Making it easier for occasional riders to tap and ride supports the goal of getting back to pre-2020 ridership.
- **Regional integration.** The state's transit funding formula rewards regional fare integration starting in 2029.
- **Federal funding window.** An FTA grant covers 50% of eligible capital costs if the funds are committed by 2028.

## 5. Scope

### In Scope
- Account-based fare platform: rider accounts, media (bank cards, wallets, CRT cards, app QR), the fare engine, fare capping, transfers and refunds
- Validators on all CRT buses, rail stations and ferry terminals, plus handheld inspection devices
- Payment processing through Northgate Payments (authorization, tokenization, settlement, chargebacks)
- Rider app (iOS and Android) and rider web portal
- Back-office tools for customer service, revenue operations, fare policy and finance
- Reduced-fare eligibility, verified with the State DHS
- Cash loading through the CornerPay retail network
- Revenue apportionment and settlement reporting for partner operators
- Migration of RiverCard accounts, balances, reduced-fare enrollments and autoloads, followed by RiverCard's retirement
- Integration with CRT's ERP (general ledger) and data warehouse

### Out of Scope
- Paratransit (CRT Access) fare collection. It will be evaluated in Phase 4 under a separate decision.
- Parking payments and park-and-ride permits
- Changes to fare *levels* (prices). Tapline makes the existing fares programmable; any price changes follow CRT's normal fare-change process.
- Replacing partner operators' own CAD/AVL or scheduling systems
- Station gates (CRT rail is a proof-of-payment system and remains gateless)
- Selling anything other than transit fares (no retail or loyalty program)

## 6. Target Outcomes / Success Criteria

| # | Outcome | Measure | Baseline (2025) | Target | By |
|---|---|---|---|---|---|
| S1 | RiverCard retired | RiverCard transactions | 100% of card trips | 0 | 2028-12-31 |
| S2 | No customer money lost | Unreconciled stored value at cutover | n/a | $0.00 | 2028-12-31 |
| S3 | Open payments everywhere | Validators accepting contactless EMV | 0% | 100% | 2028-06-30 |
| S4 | Account-based adoption | Share of fare transactions on account-based media | 0% | ≥ 80% | 2030-12-31 |
| S5 | Less on-board cash | Share of bus boardings paid with cash on board | 22% | < 5% | 2030-12-31 |
| S6 | Cheaper fare collection | Collection cost as a share of fare revenue | 15.1% | ≤ 10% | 2030-12-31 |
| S7 | Fast boarding | Validator accept/deny decision time, p99 (online or offline) | ~900 ms | ≤ 300 ms | Phase 1 exit |
| S8 | Reliable taps | Taps processed and settled correctly | not measured | ≥ 99.95% | Phase 2 exit |
| S9 | Fare equity | Riders who reach a cap and are charged no more than the cap | n/a | 100% | Phase 2 exit |
| S10 | Regional integration | Partner operators live on Tapline | 0 of 6 | 6 of 6 | 2030-12-31 |

S7, S8 and S9 become measurable scenarios in the [Non-Functional Requirements](../01-requirements/non-functional-requirements.md).

## 7. Constraints

- **Technical:**
  - Validators must keep working with no network connection for at least 72 hours. Buses lose cellular coverage in tunnels, and some rural routes have no coverage at all.
  - Validator hardware must be EMV contactless certified and bought from a commercial vendor; CRT will not build hardware.
  - CRT's standard platforms are .NET and Azure, under an existing Enterprise Agreement.
  - RiverCard data can only be extracted through Castellan's batch exports and a read-only database replica.
- **Budget / Timeline:**
  - The capital program is capped at $89.6M, contingency included. Funding: FTA $44.8M, state $26.9M, CRT local $17.9M.
  - The RiverCard end-of-support date (31 Dec 2028) cannot move.
  - FTA funds must be committed by 2028.
- **Organizational:**
  - CRT IT has about 40 staff, strong in .NET and new to running high-volume event streaming. A dedicated product team must be hired or contracted.
  - Bus operators must not take on new fare-enforcement or cash-handling duties (labor agreement).
  - Partner operators keep the authority to set their own fares.
- **Regulatory:**
  - **PCI DSS v4.0.1.** Card data must be in scope as little as possible: no card numbers (PANs) stored by CRT.
  - **FTA Title VI (Circular 4702.1B).** A fare equity analysis is required before any fare change, including the introduction of fare capping.
  - **ADA and the DOJ Title II web rule.** WCAG 2.1 AA is the legal minimum for the app and portal; CRT's own target is WCAG 2.2 AA.
  - **Buy America** applies to FTA-funded hardware.
  - **State consumer privacy law and public-records retention.** Financial records are kept for 7 years, and trip history must have rider-controlled privacy settings.

## 8. Assumptions

- Northgate Payments can aggregate transit transactions (several taps rolled into one authorization and charge) and supply payment tokens for cards, so CRT never handles card numbers.
- The State DHS will provide an eligibility-verification API, covering SNAP and Medicaid enrollment, by Q2 2027.
- More than 80% of riders' bank cards are contactless-capable by 2027. This must be confirmed with Northgate's market data.
- Vantor can deliver about 5,200 Buy America-compliant validators on the Phase 1–2 schedule.
- Castellan will cooperate on data extraction under the existing contract's exit-assistance clause.
- Partner operators accept a common fare engine, as long as each keeps control of its own fare tables.

## 9. High-Level Approach

Tapline is **account-based**. Whatever a rider taps (a bank card, a phone wallet, a CRT card or an app QR code) is only an identifier that points to an account. All fare logic runs in the cloud, not on the card or the validator. This one choice is what makes open payments, fare capping, reduced fares and regional integration possible: fare rules change in one place, and every rider's history is in one place to cap against.

At the edge, validators make a fast, local **accept or deny** decision using a signed deny list held on the device. That keeps boarding quick and lets service continue through network outages. Every tap is sent to the cloud as an event when connectivity allows. In the cloud, the fare engine assembles taps into trips, applies transfer rules and caps, and posts charges to an append-only **fare ledger**. Card charges are aggregated and settled through Northgate Payments; card numbers never reach CRT systems. Partner operators connect through published APIs and receive daily apportionment statements built from the same ledger.

CRT will **buy the commodities and build the differentiators**. Validators (Vantor), payment processing (Northgate) and the retail cash network (CornerPay) are bought. The fare engine, rider accounts, the ledger and apportionment, which are the parts that carry CRT's fare policy and its regional ambitions, are built on .NET and Azure and owned by CRT. RiverCard and Tapline will run side by side during 2028 so riders can move over at their own pace before RiverCard is switched off. The [Business Case](business-case.md) compares this approach with the alternatives, and the [Roadmap](architecture-roadmap.md) phases it.

## 10. Open Questions

| # | Question | Owner | Needed by |
|---|---|---|---|
| Q1 | Who holds the stored-value liability for RiverCard balances during the transition: CRT, or Castellan as custodian? | Jordan Hale | Business case approval |
| Q2 | Will partner operators adopt CRT's transfer rules, or does the fare engine need a separate rule set for each operator from day one? | Linda Park / Grace Liu | Phase 0 exit |
| Q3 | Should CRT keep issuing a physical CRT card for riders without a bank card or smartphone, or rely on retail-issued prepaid cards? | Grace Liu | Phase 0 exit |
| Q4 | Can validators use point-to-point encryption (P2PE) to keep them out of PCI scope, or will they be in scope? | Tom Whitaker | Vantor contract award |
| Q5 | Is the weekly cap a calendar week (Mon–Sun) or a rolling 7 days? (Rolling is fairer but harder to explain.) | Grace Liu | Title VI analysis |
