const e=`---
title: "ADR-0005: No Card Numbers in CRT Systems"
status: accepted
owner: Tom Whitaker (CISO)
version: 1.1.0
last_updated: 2026-09-12
reviewers:
  - Architecture Review Board — accepted 2026-05-13; v1.1 (media-token derivation) accepted 2026-09-09
  - Hannah Cole (Money Team lead)
  - Jordan Hale (CFO)
tags:
  - adr
---
# ADR-0005: No Card Numbers in CRT Systems

## 1. Status
Accepted

- **Decision date:** 2026-05-13. Revised 2026-09-09 (v1.1) to specify how validators derive media tokens.
- **Deciders:** Tom Whitaker, Dana Okafor, Hannah Cole, Jordan Hale (ARB)
- **Drivers:** BR-23, NFR-SEC-01, PCI DSS v4.0.1, threats T-07, T-08

## 2. Context
Open payments put bank cards in front of ~5,200 CRT devices in public places, and through CRT's apps and portal. Any system that stores, processes or transmits card numbers (PANs) is in PCI DSS scope. As a Level 1 merchant, CRT faces an annual QSA audit of everything in scope. RiverCard's card-load kiosks are in scope today, and CRT has had two remediation findings on them since 2022.

Tapline still needs to:
- Recognize the same card across taps, offline, for deny lists and fare capping.
- Charge cards nightly.
- Show riders which card they used.

## 3. Decision
**No CRT system will store, process or transmit an unencrypted card number.** Specifically:
1. **Validators use Northgate-validated P2PE readers.** Card data is encrypted inside the tamper-responsive reader and can be decrypted only by Northgate.
2. **Media tokens are derived in the reader** (v1.1). The secure reader computes an irreversible keyed hash of the card number, using a key injected by Northgate's key-injection facility that CRT never holds. The same card gives the same token on every validator, so offline recognition works without card numbers.
3. **Payment tokens come from Northgate.** On a token's first tap, the encrypted card data is passed through to Northgate for verification (ICD-001 IF-1), and Northgate returns a reusable payment token. Payment tokens are Restricted and live only in the card-data zone.
4. **App and portal card entry uses Northgate's hosted payment fields** (ICD-001 IF-5). Card numbers go from the rider's device to Northgate and never reach CRT.
5. **Display data is limited to brand, last 4 digits and expiry.** Customer service finds accounts with these, never with full card numbers.

## 4. Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| **CRT tokenization service** (CRT vault holds PANs, issues its own tokens) | Full control; processor independence | Puts a PAN vault inside CRT, the largest possible PCI scope, plus HSM operations for card keys | Highest risk and cost |
| **Validators send clear PANs over the private APN to a CRT CDE** | Simple validator firmware | Every validator, router and the network path in PCI scope | Unacceptable scope |
| **Use Northgate payment tokens at the validator** (no media token) | One identifier | Validators can't obtain payment tokens offline; first tap of a new card couldn't be recognized | Fails offline-first ([ADR-0004](0004-offline-first-validators-with-signed-deny-lists.md)) |
| **P2PE + reader-derived media token + processor tokens** (chosen) | Smallest scope; offline recognition; processor holds card data | Dependence on Northgate's P2PE program and key injection; processor change requires a re-tokenization plan | **Chosen** |

## 5. Consequences
**Positive:**
- PCI scope shrinks to the card-data zone (Payments, Ledger, Settlement), which holds tokens and encrypted blobs only. With a PCI-listed P2PE solution, validators fall largely out of scope.
- A breach of the main zone exposes no card data.

**Negative:**
- **Processor lock-in.** Media tokens depend on Northgate's injected key and payment tokens are Northgate's. Changing processor needs a migration: either a token-mapping export under the agreement's exit clause, or re-verification of cards on their next tap.
- Customer service can't search by full card number, which riders sometimes expect (trade-off 3 in the [NFR priorities](../../01-requirements/non-functional-requirements.md)).
- Wallet payments produce a different token from the physical card, so they are separate media. Riders must link both to share caps. This is explained in the app.

**Neutral / follow-up work required:**
- PCI scoping review at each phase gate.
- P2PE solution listing for Vantor V7 + Northgate before Phase 1 go-live ([SAD OQ-2](../../02-core-architecture/solution-architecture-document.md)).
- Logging allow-list and test for the encrypted card-data field (T-07).

**Reversibility:** Costly. A processor change needs card re-tokenization. The design itself (never holding PANs) is meant to be permanent.

## 6. Related
- [ICD-001](../../03-interfaces-and-integration/interface-control-document.md), [Security Architecture](../../05-security/security-architecture.md), [Domain Model glossary](../../02-core-architecture/domain-model.md) (media token, payment token, encrypted card data)
- **Review trigger:** a change of processor, or the P2PE listing not being obtained before Phase 1.
`;export{e as default};
