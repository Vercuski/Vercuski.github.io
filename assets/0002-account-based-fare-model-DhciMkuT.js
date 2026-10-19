const e=`---
title: "ADR-0002: Account-Based Fare Model"
status: accepted
owner: Dana Okafor (Chief Architect)
version: 1.0.0
last_updated: 2026-04-24
reviewers:
  - Architecture Review Board — accepted 2026-04-22
  - Grace Liu (Director, Fare Policy & Equity)
  - Miguel Serrano (Chief Revenue Officer)
tags:
  - adr
---
# ADR-0002: Account-Based Fare Model

## 1. Status
Accepted

- **Decision date:** 2026-04-22. The direction was set by the Business Case (2026-03-18); this ADR records it formally.
- **Deciders:** Dana Okafor, Priya Raman, Aisha Karimi, Grace Liu (ARB)
- **Drivers:** Vision goals 2, 3, 5 and 6; BR-01, BR-04, BR-15, BR-17

## 2. Context
RiverCard is **card-based**: the fare product, the balance and the transfer state live on the smart card, and fare logic runs in the farebox. Changing a fare means reprogramming every farebox and re-encoding cards when riders next tap. That is why fare changes take months and need Castellan change orders.

Tapline must accept contactless bank cards and phone wallets. CRT cannot write anything to those, so the fare state cannot live on the medium. It must also deliver:
- Fare capping across several media in one account (BR-04).
- Per-operator fare tables (BR-15).
- Fare changes by configuration (Vision goal 6).

Each of these requires one place that knows a rider's whole history and the current rules.

The forces against moving logic to the cloud are latency at the door, behavior during network loss, and dependence on back-office availability for every fare.

## 3. Decision
We will use an **account-based** fare model:
- **Media are identifiers only.** Whatever is tapped (a bank card, a wallet, a CRT card or an app ticket) yields a media token. No fare product or balance is stored on any medium, including CRT cards.
- **Fares are calculated in the cloud** by the Fare Engine, after the tap, from the rider's tap history and the fare rule version in effect at the time of the tap.
- **Validators decide only accept or deny**, locally, from the medium's own checks and a deny list. They do not calculate fares. (How validators work offline is [ADR-0004](0004-offline-first-validators-with-signed-deny-lists.md).)
- **Stored value lives in the account** (the ledger), not on CRT cards.

## 4. Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| **Card-based** (RiverCard model, new hardware) | Works fully offline; fare known at the door | Cannot support bank cards or wallets; caps across media impossible; fare changes need card and farebox updates | Fails BO-2 and BO-3 outright |
| **Hybrid**: card-based for CRT cards, account-based for bank cards | Familiar for existing CRT card holders | Two fare engines that must agree to the cent; caps across a CRT card and a bank card impossible without syncing card state; double the testing | Complexity with no lasting benefit; RiverCard-style cards disappear in 2028 anyway |
| **Account-based with online authorization of every tap** | Fare known at the door; no first-ride risk | Every boarding depends on the network and back office; fails in tunnels and outages; ~800–1,500 ms on cellular | Fails NFR-PERF-01 and BR-08; see ADR-0004 |
| **Account-based, fares calculated after the tap** (chosen) | Supports every medium; caps across media; fare policy as data; one place for history | Rider doesn't see the exact fare at the door; first-ride risk; depends on late-tap re-rating being correct | **Chosen** |

## 5. Consequences
**Positive:**
- Open payments, fare capping, reduced fares and multi-operator fares become rules in one engine, not hardware features.
- Fare changes become data (FR-POL-01), with no farebox or card reprogramming.
- Validators become simpler and replaceable (NFR-PORT-01).
- Lost CRT cards no longer lose money, because the balance is in the account (BR-12).

**Negative:**
- The validator cannot show the fare charged. It shows only accept or deny, and riders see the fare in the app within about a minute (NFR-PERF-03). The Rider Advisory Committee accepted this on 2026-04-15 provided the app shows it promptly.
- Taps can arrive late or out of order (offline vehicles), so the Fare Engine must re-rate deterministically. This is the hardest engineering in the program.
- The system has to manage first-ride risk: cards accepted, then declined when charged.

**Neutral / follow-up work required:**
- ADR-0004 (offline behavior and deny lists), ADR-0005 (card data), and the [Domain Model](../../02-core-architecture/domain-model.md) (rider key, fare week aggregate).
- Title VI fare equity analysis for capping (Board, November 2026).

**Reversibility:** One-way door. Validators, data model and rider experience are all built on it.

## 6. Related
- [Architecture Vision §9](../../00-vision-and-strategy/architecture-vision.md), [Business Case](../../00-vision-and-strategy/business-case.md)
- [ADR-0004](0004-offline-first-validators-with-signed-deny-lists.md), [ADR-0005](0005-no-card-numbers-in-crt-systems.md)
- **Review trigger:** none expected. Revisit only if CRT ever needed fare calculation at the door, e.g. for gated stations.
`;export{e as default};
