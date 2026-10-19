const e=`---
title: Business Case — Project Tapline
status: approved
owner: Miguel Serrano (Chief Revenue Officer)
version: 1.2.0
last_updated: 2026-03-18
reviewers:
  - Jordan Hale (CFO) — approved 2026-03-09
  - Priya Raman (CIO) — approved 2026-03-09
  - Dana Okafor (Chief Architect) — approved 2026-03-10
  - Elena Brooks (Program Director) — approved 2026-03-10
  - CRT Board of Directors — approved 2026-03-18 (Resolution 2026-12)
tags:
  - business_case
---

# Business Case — Project Tapline

> [!summary] Decision requested — approved
> Approve a capital program of **$89.6M** (2026–2030) to replace RiverCard with Tapline: an account-based, open-payments fare platform built by CRT on commercially bought validators and payment services. Over ten years it returns a **net benefit of $19.9M** (NPV +$10.4M at 4%) compared with extending RiverCard, pays back in **FY2033**, and delivers fare capping, regional integration and control of fare policy, which no other option provides.

All figures are in millions of US dollars, by calendar fiscal year. Ten-year window: FY2026–FY2035.

## 1. Problem Statement

RiverCard, CRT's fare system since 2012, reaches the end of vendor support on **31 Dec 2028**. Collecting fares costs **$17.8M a year (15.1% of fare revenue)**. The system can't accept the bank cards and phones riders already carry, can't cap fares, and can't be shared with the region's six partner operators. Some decision is unavoidable before 2029: the question is which replacement path gives CRT the best value and the most control. See the [Architecture Vision §1](architecture-vision.md) for the full problem statement.

## 2. Proposed Solution (Summary)

**Option C: build the core, buy the commodities.**

- **Buy** about 5,200 Vantor V7 validators, payment processing from Northgate Payments, and retail cash loading through CornerPay.
- **Build**, on CRT's existing .NET and Azure platform, the parts that encode CRT's fare policy: rider accounts, the fare engine (trips, transfers, caps), the append-only fare ledger, and partner apportionment.
- **Migrate** every RiverCard account and the $14.7M of stored value during 2028, then switch RiverCard off.

## 3. Options Considered

| Option | Description | Pros | Cons | 10-yr cost (TCO) |
|---|---|---|---|---|
| **A** Extend RiverCard | Castellan's offer: 7-year support extension, farebox refresh, Oracle upgrade. Still closed-loop. | Lowest delivery risk; riders see no change | No open payments, capping or regional integration; vendor lock-in continues to 2035; collection cost stays at 15%; PCI posture of fareboxes stays weak | **$219.0M** |
| **B** Turnkey SaaS fare system | Buy a vendor-hosted account-based fare service; CRT buys validators from the vendor's approved list. | Fastest route to open payments (systemwide mid-2027); vendor carries the delivery risk | Fee of about 6% of fare revenue that grows with ridership; fare-rule changes go through the vendor's roadmap; partner apportionment limited to the vendor's model; a new lock-in | **$215.0M** |
| **C** Build core, buy commodities (**recommended**) | As described in §2. | CRT owns fare policy, data and apportionment; lowest 10-year cost; strong fit with CRT's .NET and Azure skills; validators and processor can be swapped later | Highest delivery risk; CRT must hire a product team and learn high-volume event streaming; CRT carries PCI responsibility for its own platform | **$209.7M** |
| **D** Do nothing | Keep running RiverCard as-is after 2028. | No capital cost | Unsupported from 2029; fareboxes fail without spares; growing PCI non-compliance; risk of losing fare collection on whole routes | $178.0M on paper, **not viable** |

TCO includes capital, operating costs, and the cost of running RiverCard until it is retired. Option D is shown only to make the cost of the status quo visible.

**Why C over B, when the costs are close:** the $5.3M cost difference is within estimating error. The deciding factors are not cost:

- **Fare policy control.** Under B, each fare-rule change is a vendor change request. Under C, it is a configuration change.
- **Regional integration.** B's apportionment model supports a single operator plus "affiliates". The Partner Operator Council asked for operator-specific fare tables and daily settlement, which C delivers.
- **Fees scale with ridership under B.** If ridership grows 2% a year above plan, B's 10-year cost rises by about $6M; C's rises by under $1M.
- **Exit cost.** Under C, the commodities (validators, processor) can be replaced without replacing the platform.

## 4. Cost / Benefit Analysis

Option C compared with Option A (A is the baseline because some replacement or extension is unavoidable).

| Item | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031–35 (per year) | 10-yr total |
|---|---|---|---|---|---|---|---|
| Capital: validators, platform build, migration | 9.8 | 21.6 | 19.4 | 8.2 | 5.0 | — | 64.0 |
| Tapline operating cost (cloud, processor, devices, team) | 1.2 | 4.6 | 8.9 | 11.2 | 11.2 | 11.2 | 93.1 |
| Running RiverCard and Tapline side by side | — | 1.2 | 2.5 | — | — | — | 3.7 |
| **Total cost** | **11.0** | **27.4** | **30.8** | **19.4** | **16.2** | **11.2** | **160.8** |
| Avoided Option A capital (farebox refresh, Oracle upgrade) | — | 20.5 | 20.5 | — | — | — | 41.0 |
| Avoided RiverCard operating cost | — | — | 4.5 | 17.8 | 17.8 | 17.8 | 129.1 |
| Lower fare evasion | — | — | 0.8 | 2.0 | 2.4 | 2.4 | 17.2 |
| Ridership growth from easier access | — | — | — | 1.0 | 1.8 | 1.8 | 11.8 |
| Revenue given up through fare capping | — | — | (0.6) | (2.2) | (2.6) | (2.6) | (18.4) |
| **Total benefit** | **0.0** | **20.5** | **25.2** | **18.6** | **19.4** | **19.4** | **180.7** |
| **Net** | **(11.0)** | **(6.9)** | **(5.6)** | **(0.8)** | **3.2** | **8.2** | **19.9** |
| Cumulative net | (11.0) | (17.9) | (23.5) | (24.3) | (21.1) | reaches +3.5 in FY2033 | 19.9 |

**Notes**
- **Avoided RiverCard operating cost** begins in FY2028, when on-board cash handling and Castellan's transaction fees start to fall. It reaches the full $17.8M once RiverCard is switched off.
- **Revenue given up through capping** is a deliberate equity cost. It is the money riders save by never paying more than the daily or weekly cap. The Title VI fare equity analysis (Board approval due November 2026) relies on this figure.
- **Lower fare evasion** assumes recovering half of the estimated $4.8M a year, through faster boarding at all doors and handheld inspection devices.
- **Ridership growth** assumes 1.5% more trips from occasional and visiting riders who can tap a bank card.
- **Contingency** ($7.2M) is part of the $89.6M budget but is left out of this table. The budget is capital $64.0M + Tapline operating cost through FY2028 $14.7M + side-by-side running $3.7M + contingency $7.2M.

## 5. ROI Summary

| Measure | Value |
|---|---|
| 10-year net benefit compared with Option A | **+$19.9M** |
| Return on investment (net benefit ÷ total cost) | **12.4%** |
| Net present value at 4% (CRT's capital planning rate) | **+$10.4M** |
| Payback year | **FY2033** |
| Cost of fare collection in 2030 | 9.5% of fare revenue (from 15.1%) |

**Sensitivity**

| Scenario | 10-yr net | Payback |
|---|---|---|
| Base case | +$19.9M | FY2033 |
| Contingency fully spent (+$7.2M cost) | +$12.7M | FY2034 |
| No ridership growth | +$8.1M | FY2034 |
| Capping costs 50% more than estimated | +$10.7M | FY2034 |
| RiverCard switch-off slips 6 months (extra Castellan fees about $9M) | +$10.9M | FY2034 |
| All four of the above together | −$17.3M | Beyond FY2035 |

The case stays positive under any single adverse scenario. It turns negative only if all four happen together, which the [Risk Register](../08-risk-and-operations/risk-register.md) tracks through specific mitigations. The non-financial benefits that drive the recommendation are not monetized here: fare capping for lower-income riders, control of fare policy, regional integration, and rider data owned by CRT.

## 6. Risks of Not Proceeding

- **Fare collection may stop working.** From January 2029 there are no Castellan spares or fixes. Fareboxes are failing at about 4% a year, and a failed farebox means a bus that can't collect fares.
- **Compliance exposure.** RiverCard's card-load kiosks and fareboxes run software that can't meet PCI DSS v4.0.1 requirements. CRT would carry the compliance gap and the fines if a breach occurred.
- **Equity commitments missed.** The Board's 2025 Equity Action Plan commits to fare capping. RiverCard cannot do it.
- **Lost funding.** The FTA grant ($44.8M) must be committed by 2028. The state's regional-integration incentive starts in 2029 and requires a shared fare system.
- **Higher cost later.** Extending RiverCard (Option A) only moves this decision to 2035, after spending $41M on hardware that would then be written off.

## 7. Recommendation

Approve **Option C**, with a capital program of **$89.6M** for 2026–2030 including $7.2M contingency, funded by FTA ($44.8M), the state ($26.9M) and CRT local funds ($17.9M), and authorize staff to:

1. Award the validator contract to Vantor Devices and the payment processing contract to Northgate Payments (target Q2–Q3 2026).
2. Set up the Tapline product team and the Azure platform foundations (Phase 0, April–December 2026).
3. Bring a Title VI fare equity analysis for fare capping to the Board by November 2026.
4. Report progress to the Board at each phase gate defined in the [Architecture Roadmap](architecture-roadmap.md).

> [!check] Board decision
> Approved 18 March 2026, Resolution 2026-12 (8 in favor, 1 against, 0 abstaining). The Board added one condition: a quarterly report on the stored-value liability from the start of Phase 3.
`;export{e as default};
