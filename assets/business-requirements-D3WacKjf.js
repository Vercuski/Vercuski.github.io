const e=`---
title: Business Requirements — Project Tapline
status: approved
owner: Grace Liu (Director, Fare Policy & Equity)
version: 1.0.0
last_updated: 2026-05-29
reviewers:
  - Miguel Serrano (Chief Revenue Officer, executive sponsor) — approved 2026-05-27
  - Jordan Hale (CFO) — approved 2026-05-27
  - Marcus Bell (Director, Bus Operations) — approved 2026-05-28
  - Tom Whitaker (CISO) — approved 2026-05-28
  - Linda Park (Partner Operator Council) — approved 2026-05-29
  - Nadia Flores (Lead Business Analyst) — author
tags:
  - business_requirements
---

# Business Requirements — Project Tapline

> [!summary] What this document is
> What CRT, its riders and its partner operators need from a new fare system, stated without reference to any technology. The [Functional Requirements](functional-requirements.md) turn each business requirement (BR) into testable system behavior, and the [Non-Functional Requirements](non-functional-requirements.md) set the quality targets.

## 1. Background

CRT collects $118M a year in fares through RiverCard, a closed-loop smart-card system whose vendor support ends on 31 Dec 2028. Collecting fares costs 15.1% of fare revenue, riders must buy a RiverCard or carry exact cash, there is no fare capping, and each of the region's six partner operators runs a separate fare system.

The CRT Board approved replacing RiverCard on 18 March 2026 (Resolution 2026-12). The reasons, goals and scope are in the [Architecture Vision](../00-vision-and-strategy/architecture-vision.md) and the [Business Case](../00-vision-and-strategy/business-case.md). This document was produced through 14 workshops between April and May 2026 with Revenue Operations, Customer Service, Finance, Bus/Rail/Ferry Operations, Fare Policy, the Rider and Accessibility Advisory Committees, and the Partner Operator Council.

**Open questions from the Vision that this document settles:**

| Vision question | Decision | Captured in |
|---|---|---|
| Q2: Must partners follow CRT's transfer rules? | No. Each operator keeps its own fare table; inter-operator transfers follow the regional agreement. | BR-15 |
| Q3: Keep a physical CRT card? | Yes. A free CRT card, available at retail locations, for riders without a bank card or smartphone. | BR-02 |
| Q5: Calendar or rolling week for the weekly cap? | Calendar week, Monday to Sunday. It is easier to explain, and the Title VI analysis showed no material difference in equity outcomes. | BR-04 |

## 2. Business Objectives

| ID | Objective | Priority | Owner |
|---|---|---|---|
| BO-1 | Retire RiverCard by 31 Dec 2028 with no customer money lost | Must | Elena Brooks |
| BO-2 | Let any rider pay with what they already carry: a bank card, a phone, or a CRT card bought with cash | Must | Miguel Serrano |
| BO-3 | Make sure no rider pays more than a pass would have cost (fare capping), including reduced-fare riders | Must | Grace Liu |
| BO-4 | Reduce the cost of collecting fares to 10% or less of fare revenue by 2030 | Must | Miguel Serrano |
| BO-5 | Give CRT direct control of fare policy, so fare changes need no vendor involvement | Must | Grace Liu |
| BO-6 | Protect fare revenue: every fare is accounted for from tap to bank deposit | Must | Jordan Hale |
| BO-7 | Keep fare collection accessible to cash-paying, unbanked and disabled riders | Must | Grace Liu |
| BO-8 | Offer one regional fare system that partner operators can join on fair terms | Should (Must by 2030) | Linda Park |

## 3. Business Requirements

### 3.1 Paying a fare
| ID | Requirement | Rationale | Priority |
|---|---|---|---|
| BR-01 | Riders can pay a fare by tapping a contactless bank card or a phone wallet on any CRT vehicle or station, without registering or buying anything first. | Removes the biggest barrier for occasional riders and visitors (BO-2). | Must |
| BR-02 | Riders without a bank card or smartphone can get a free CRT card and add money to it with cash at retail locations across the service area. | Unbanked and cash-paying riders must not be left behind as on-board cash declines (BO-7). | Must |
| BR-03 | Riders can pay using a ticket displayed in a CRT app. | Supports riders who prefer their phone but don't use a mobile wallet. | Should |
| BR-04 | A rider never pays more than the daily cap in a service day or the weekly cap in a calendar week (Monday to Sunday), counting every fare paid with any card or device linked to the same account. A bank card that is not linked to an account is capped on its own. | Delivers the Board's fare-capping commitment (BO-3). | Must |
| BR-05 | The current transfer policy stays the same: one fare covers unlimited CRT transfers for 2 hours from the first tap. | No fare change is intended by this project. | Must |
| BR-06 | Seniors, riders with disabilities and low-income riders pay reduced fares and reduced caps. Low-income eligibility is verified with the state the same day the rider applies, not in weeks. | Equity Action Plan commitment; today's paper process takes 4–6 weeks (BO-7). | Must |
| BR-07 | Boarding must be no slower than it is today, at every door. | Boarding time drives bus running times and costs (BO-4). | Must |
| BR-08 | Fares can still be collected when communications to the vehicle or station are lost, for at least three days. | Tunnels, rural routes and outages must not stop fare collection (BO-6). | Must |
| BR-09 | On rail and ferry, staff can check that a rider has paid, whatever card or device the rider used. | CRT rail and ferry use proof of payment, not gates. | Must |

### 3.2 Managing an account
| ID | Requirement | Rationale | Priority |
|---|---|---|---|
| BR-10 | Riders can open an account, link several cards or devices to it, see their trips and charges, and download a statement. | Transparency is the main rider request from the advisory committee. | Must |
| BR-11 | Riders can add money to an account by card online, by automatic top-up, or with cash at retail locations. | Covers today's RiverCard loading options plus cash (BO-7). | Must |
| BR-12 | A rider who loses a card or device can block it and keep their balance, cap progress and reduced-fare status on a replacement. | Riders lose $310k a year in RiverCard balances on unregistered lost cards. | Must |
| BR-13 | Riders can question a charge and get a refund or correction. Customer service can make adjustments, with controls against misuse. | Rider trust; refund fraud prevention (BO-6). | Must |
| BR-14 | Riders control their own trip history: they can see it, download it, and choose to have it deleted after the period needed for billing disputes. | Rider privacy expectations and state privacy law. | Must |

### 3.3 Running the business
| ID | Requirement | Rationale | Priority |
|---|---|---|---|
| BR-15 | CRT and each partner operator can set and change their own fares, caps, transfer rules and products, with a future effective date, without vendor involvement. | Fare policy control (BO-5); partner autonomy (BO-8). | Must |
| BR-16 | Every fare can be traced from the tap to the charge, to the processor's settlement, to the bank deposit and the general ledger, and is reconciled every day. | Revenue protection and audit (BO-6). | Must |
| BR-17 | Partner operators receive a daily statement of the revenue owed to them under the regional agreement, with enough detail to audit it. | Fair terms for partners (BO-8). | Should (Must for Phase 4) |
| BR-18 | Operations staff can see which fare equipment is not working, where it is, and since when. | Failed equipment means lost fares and frustrated riders (BO-6). | Should |
| BR-19 | CRT can measure fare usage by route, time and area to complete Title VI equity analyses, without tracking identifiable individuals. | Federal requirement before any fare change; privacy (BO-3, BO-7). | Must |
| BR-20 | Microtransit trips (Keel Mobility) and institutional programs, such as the CSU student pass, can be paid through the same account and count toward caps. | Regional integration (BO-8). | Could (Phase 4) |

### 3.4 Moving off RiverCard
| ID | Requirement | Rationale | Priority |
|---|---|---|---|
| BR-21 | Every RiverCard customer can move their balance, reduced-fare status and automatic top-up to Tapline, or receive a refund. No customer loses money. Unclaimed balances are handled under state unclaimed-property law. | BO-1; $14.7M stored-value liability. | Must |
| BR-22 | RiverCard cards keep working on new equipment until a published switch-off date, so riders can move over at their own pace. | Avoids a disruptive "big bang" for 410k active cards (BO-1). | Must |

### 3.5 Obligations
| ID | Requirement | Rationale | Priority |
|---|---|---|---|
| BR-23 | CRT does not store bank card numbers and meets the card industry's security standard (PCI DSS). | Limits breach risk and compliance cost. | Must |
| BR-24 | The app, website and fare equipment are usable by riders with disabilities: WCAG 2.2 AA for digital channels, and audio and visual feedback with reachable mounting heights for equipment. | ADA and the DOJ Title II rule; Accessibility Advisory Committee (BO-7). | Must |
| BR-25 | Rider information is offered in the four languages in CRT's Language Assistance Plan: English, Spanish, Vietnamese and Simplified Chinese. | Title VI limited-English-proficiency obligations. | Must |
| BR-26 | Rider data is collected only when needed, kept only as long as needed, never sold, and released to law enforcement only under legal process. | Rider privacy policy adopted by the Board in 2025. | Must |

## 4. Assumptions

- Fare *levels* stay the same for this project: $2.00 full and $1.00 reduced, with a 2-hour transfer. Daily caps are $5.00 / $2.50 and weekly caps $25.00 / $12.50. The caps replace the 7-day and 31-day passes and need Board approval of the Title VI analysis (November 2026).
- A **service day** runs from 03:00 to 02:59 local time, matching CRT's overnight service pattern. Late-night trips count toward the previous day.
- CRT accepts a small loss from cards that are declined after the ride ("first-ride risk"). The amount is managed by blocking such cards until the debt is paid. Revenue Operations estimates it at under 0.3% of card fare revenue.
- At least 85% of riders' bank cards are contactless-capable by 2027 (Northgate market data, April 2026).
- The State DHS will provide a way to confirm SNAP and Medicaid enrollment by Q2 2027.
- Retail partners will accept cash loads at the same commission as RiverCard loads today (2.5%).

## 5. Dependencies

- **Board approval** of the Title VI fare equity analysis for capping (November 2026), before capping can go live.
- **Regional fare agreement** among the six partner operators (target 2028) before BR-17 and BR-20.
- **State DHS** data-sharing agreement for eligibility verification (BR-06).
- **Northgate Payments** contract, covering card acceptance, tokens and settlement (BR-01, BR-16, BR-23).
- **CornerPay** retail network contract (BR-02, BR-11).
- **Castellan Fare Systems** exit-assistance cooperation for RiverCard data and the RiverCard bridge (BR-21, BR-22).
- **Labor agreement:** bus operators' duties around fare disputes stay as they are (BR-07).

## 6. Out of Scope

- Changing fare prices. Any price change follows CRT's normal fare-change process.
- Paratransit (CRT Access) fares. To be evaluated in Phase 4.
- Parking, park-and-ride permits and bike lockers.
- Station gates. Rail stays proof-of-payment.
- Loyalty programs, advertising, and selling anything other than transit fares.
- Partner operators' scheduling, dispatch and vehicle-location systems.

## 7. Stakeholder Sign-off

| Role | Name | Date |
|---|---|---|
| Executive Sponsor, Chief Revenue Officer | Miguel Serrano | 2026-05-27 |
| Chief Financial Officer | Jordan Hale | 2026-05-27 |
| Director, Bus Operations | Marcus Bell | 2026-05-28 |
| Chief Information Security Officer | Tom Whitaker | 2026-05-28 |
| Director, Fare Policy & Equity (owner) | Grace Liu | 2026-05-29 |
| Chair, Partner Operator Council | Linda Park | 2026-05-29 |
`;export{e as default};
