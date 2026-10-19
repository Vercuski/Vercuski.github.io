---
title: Gap Analysis — Project Tapline
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2026-07-31
reviewers:
  - Dana Okafor (Chief Architect) — approved 2026-07-29
  - Elena Brooks (Program Director) — approved 2026-07-30
  - Marcus Bell (Director, Bus Operations) — approved current-state inventory 2026-07-30
  - Revenue Operations Manager — approved current-state inventory 2026-07-30
tags:
  - gap_analysis
---
# Gap Analysis — Project Tapline

> [!summary] What has to change
> RiverCard is **card-based**: each card's chip holds the balance and fare products, and Castellan's back office keeps only a lagging "shadow" copy uploaded from fareboxes overnight. Almost every gap below follows from that one fact. Of 18 gaps, 11 are **Critical** (Tapline cannot launch without them), 5 **High**, 2 **Medium**. Three things in this analysis were not in the [Vision](../00-vision-and-strategy/architecture-vision.md):
> - The station ticket vending machines (R-6).
> - The RiverCard card keys Tapline needs during transition (R-4).
> - Shadow-balance drift, which becomes the hardest part of the data migration (R-5).
>
> The [Roadmap §3](../00-vision-and-strategy/architecture-roadmap.md) summarizes this analysis.

## 1. Current State Summary

Inventory as of June 2026, from site surveys, Castellan documentation and Revenue Operations.

| Component | Today (RiverCard) | Notes |
|---|---|---|
| **Fare media** | RiverCard smart card (MIFARE DESFire EV1, issued since 2012); single-ride paper tickets from TVMs; cash on buses | ~2.9M cards ever issued; 1.1M registered; ~410k used in the last 90 days |
| **Where value lives** | **On the card chip** (balance, passes, transfer state). Back office keeps a "shadow" balance from farebox uploads. | Shadow lags by 1–3 days; it diverges when uploads fail |
| **Bus equipment** | 1,100 Castellan CF-200 fareboxes (card reader + cash vault) | Failing at ~4% a year; spares end with support (2028-12-31) |
| **Rail equipment** | 920 Castellan platform validators at 46 stations; 138 ticket vending machines (TVMs) | Rail is proof of payment; TVMs sell cards, loads and paper tickets, cash and card |
| **Ferry equipment** | 120 Vantor V5 validators (2023 pilot), configured for RiverCard plus contactless pilot | The only modern hardware CRT owns ([EX-001](../07-governance/architecture-exception-request.md)) |
| **Back office** | Castellan-hosted system on Oracle 11g (extended support); nightly batch from fareboxes over cellular dial-up; monthly revenue reports | Fare rules hard-coded per product; change orders take 3–6 months |
| **Payments** | Castellan is merchant of record for card loads (web, TVM, retail POS) through its own acquirer | CRT receives net settlements monthly; card data in Castellan's vault |
| **Retail** | 380 stores with Castellan POS terminals for card sales and loads | Commission 2.5%; terminals end of life 2027 |
| **Rider channels** | Castellan web portal (registration, balance, autoload, lost-card); no mobile app | Not WCAG-conformant (2025 audit: 47 failures) |
| **Reduced fare** | Paper application, CRT customer service center; 38k active enrollments | 4–6 week turnaround |
| **Customer service** | Castellan console in CRT's contact center | Can't see on-card balance without the card; refunds manual |
| **Reporting and data** | Monthly extracts from Castellan; CRT has no direct database access | Title VI analyses use sampled survey data plus extracts |
| **Partner operators** | Six separate systems (HCT runs a small account-based pilot; others cash and paper passes) | No shared transfers |
| **Integration** | ERP receives monthly journal from a Castellan report, keyed manually | 3 FTE days a month |

## 2. Target State Summary

Tapline as defined in the [Architecture Vision §9](../00-vision-and-strategy/architecture-vision.md) and the [Container Diagram](../02-core-architecture/c4-model/container-diagram.md):
- **Account-based:** media are identifiers; value lives in the ledger.
- **Edge:** offline-first Vantor V7 validators on every bus door and rail platform.
- **Payments:** open payments through Northgate with CRT as merchant of record. Cash through CornerPay retail and CRT cards.
- **Riders:** app and portal at WCAG 2.2 AA; reduced fare verified with State DHS.
- **Money and data:** daily settlement and GL posting; CRT-owned data platform.
- **Region:** partners on the same platform from Phase 4.

## 3. Gaps
| Area | Current State | Target State | Gap | Priority |
|---|---|---|---|---|
| Fare model | Card-based: value and rules on the chip | Account-based; fares in the cloud ([ADR-0002](../06-decisions-and-standards/adr/0002-account-based-fare-model.md)) | Fare Engine, accounts, ledger; a new model for staff and riders | Critical |
| Open payments | Not supported | Contactless EMV and wallets everywhere | P2PE validators, Northgate integration, card-data zone | Critical |
| Bus equipment | CF-200 fareboxes, end of life | ~3,300 V7 validators (front and rear doors) | Procurement, installation in maintenance cycles, power and mounting per bus type | Critical |
| Rail equipment | 920 platform validators | ~1,380 V7 validators (more per platform, for all-door boarding and accessibility reach) | As above, plus station power and network drops | Critical |
| Ferry equipment | V5 configured for RiverCard | V5 on Tapline until refits, then V7 | Reconfiguration; exception for V5 limits | High |
| Cash on bus | Accepted at fareboxes | Phased out on-board (< 5% by 2030); cash via retail onto CRT cards | Retail network change (Castellan POS → CornerPay); rider communications; equity monitoring | Critical |
| **Station TVMs** | 138 TVMs selling RiverCard and paper tickets | *Not addressed by the Vision* | Decision needed: retire, replace or repurpose (R-6) | High |
| Retail network | 380 Castellan POS stores | 420 CornerPay stores | New contract; overlap during 2027–2028; staff training | High |
| Reduced fare | Paper, 4–6 weeks | Online, same day via DHS | DHS integration; migration of 38k enrollments | Critical |
| Rider channels | Vendor portal, no app, not accessible | App + portal, WCAG 2.2 AA, four languages | Build both; migrate registered users (1.1M) | Critical |
| Customer service | Castellan console; manual refunds | Back-office portal with two-person refunds | New tools, training, scripts; processes for two systems during 2028 | High |
| Payments and settlement | Castellan merchant of record; monthly net settlement | CRT merchant of record; daily settlement and reconciliation | New merchant account, processes, Revenue Operations skills | Critical |
| Finance integration | Manual monthly journal | Automated daily GL posting | ERP integration; chart-of-accounts mapping | Medium |
| **Stored value and card data** | Balance authoritative on the chip, shadow copy in back office; ~$14.7M liability | Balance in Tapline ledger | Move every balance with no loss; reconcile chip vs shadow (R-5) | Critical |
| **Accepting RiverCard on new equipment** | Only Castellan readers hold the RiverCard keys | V7s read and debit RiverCard cards during transition | Castellan must release the card keys (SAM keys) under exit assistance; Vantor must support the RiverCard card profile (R-4) | Critical |
| Data and reporting | Monthly extracts; no CRT database access | CRT-owned lakehouse; Title VI from real data | Data platform; privacy design | Medium |
| Security and compliance | PCI findings on TVMs and kiosks; vendor-held card data | Minimal PCI scope; CRT security architecture | Card-data zone, P2PE, QSA assessment as a Level 1 merchant | Critical |
| Regional integration | Six separate systems | One platform, operator fare tables | Multi-operator fare policy and apportionment | High (Phase 4) |

## 4. Recommendations
| # | Recommendation | Addresses | Owner |
|---|---|---|---|
| R-1 | **Build** the account-based core (Fare Engine, accounts, ledger); **buy** validators, processing and retail, per the [Business Case](../00-vision-and-strategy/business-case.md) Option C | Fare model, open payments, payments | Program |
| R-2 | **Replace equipment garage by garage**, fitting V7s during scheduled bus maintenance to avoid extra out-of-service time; rail by line | Bus and rail equipment | Marcus Bell, Diego Alvarez |
| R-3 | **Run RiverCard and Tapline side by side in 2028** (a strangler-fig approach). RiverCard cards keep working on new validators until a published acceptance end date, so riders move at their own pace. Detailed in the [Transition Architecture](transition-architecture.md). | Stored value, rider channels | Aisha Karimi |
| R-4 | **Secure the RiverCard card keys now.** Invoke Castellan's exit-assistance clause to deliver the DESFire application keys (as HSM-wrapped SAM keys) to Vantor's key-injection facility by Q3 2027, so V7s can read and debit RiverCard cards from January 2028. Without this, R-3 is impossible. | Accepting RiverCard on new equipment | Jordan Hale (contract), Diego Alvarez |
| R-5 | **Treat shadow-balance drift as a first-class migration problem.** Run trial extracts from Phase 1 to measure chip vs shadow divergence, and agree balance rules with the CFO before Phase 3 ([Data Migration Strategy](data-migration-strategy.md)) | Stored value | Hannah Cole |
| R-6 | **TVMs:** retire 114 of 138 TVMs with RiverCard. Re-purpose 24 at the busiest stations with a Vantor upgrade kit to sell CRT cards and take cash loads. Needs a business case addendum (~$1.1M) to the Program Board by 2026-10. | Station TVMs, cash access | Miguel Serrano |
| R-7 | **Keep fareboxes' cash vaults until on-board cash falls below 5%**, then remove them garage by garage. Card readers on fareboxes are disabled when the bridge goes live. | Cash on bus | Marcus Bell |
| R-8 | **Migrate reduced-fare riders first and with help.** They depend most on the system and are least likely to self-serve. | Reduced fare | Grace Liu |
| R-9 | **Automate the ERP journal from day one of the pilot.** Small effort, removes manual risk. | Finance integration | Hannah Cole |

**Program Board decision (2026-10-21):** R-6 approved with $1.1M from contingency, and the TVM upgrade added to Phase 2 scope. The remaining recommendations were accepted as part of the Roadmap.
