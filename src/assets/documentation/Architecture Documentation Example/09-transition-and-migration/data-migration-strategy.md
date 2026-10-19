---
title: Data Migration Strategy — Project Tapline
status: approved
owner: Hannah Cole (Money Team lead)
version: 1.1.0
last_updated: 2028-01-26
reviewers:
  - Jordan Hale (CFO) — approved §3.2 balance rules 2027-10-14; approved v1.1 2028-01-24
  - Mei Chen (Rider Team lead) — approved Legacy module design 2028-01-22
  - Tom Whitaker (CISO) — approved §6 on 2028-01-22
  - CRT Internal Audit — reviewed trial migration 3 results 2028-01-25
  - CRT General Counsel — approved unclaimed-property and retention approach 2028-01-25
tags:
  - data_migration
  - strategy
---
# Data Migration Strategy — Project Tapline

> [!summary] Moving $14.0M of riders' money off a card-based system
> RiverCard's balances live **on card chips**; Castellan's back office holds a "shadow" copy that lags behind. So Tapline can't simply copy a database. Each balance is moved **when the rider asks**, using the best evidence available: the latest chip read (from Tapline validators through the bridge, or a reader at a store), else the shadow balance under CFO-approved rules. Trial migration 3 (January 2028) shows that **99.69% of registered cards** resolve automatically, and that the remaining 3,410 cards ($41k of differences) need manual review. That is within the team's capacity. This closes the open question behind risk RSK-03.

**Change history:** v1.0 (2027-06-30) first version, after trial 1. v1.1 (2028-01-26) added results of trials 2 and 3, the balance rules approved by the CFO, and the tap-to-transfer path.

## 1. Data Sources & Targets
| Source | Target | Volume | Sensitivity |
|---|---|---|---|
| RiverCard registrations (Castellan Oracle: `CUSTOMER`, `CARD_REG`) | Account Service **Legacy module** (pending records); becomes a Tapline account and CRT-card medium when moved | 1.1M registered cards; ~870k unique customers | Confidential (name, email, phone, address) |
| Card balances: **shadow** (Castellan `PURSE_SHADOW`) | Balance resolver → Ledger opening-balance transaction | 640k registered cards with balance ($9.6M); 1.32M unregistered with balance ($4.4M); **$14.0M total** (Jan 2028) | Confidential (financial) |
| Card balances: **chip** (read by V7s through the bridge, or by store and service-center readers) | Balance resolver (authoritative when recent) | Every RiverCard tap on a V7 since 2028-01-03; every tap-to-transfer | Confidential |
| Reduced-fare enrollments (`CONCESSION`) | Eligibility: `verified_by = rivercard_migration`; `valid_to` = the earlier of RiverCard expiry and 2 years | 38k | **Sensitive** (category only; no documents migrated) |
| Autoload settings (`AUTOLOAD`) | **Not migrated as payment data.** Castellan's card tokens belong to its acquirer and can't move to Northgate. Migrated as a *preference* that prompts the rider to add a card through hosted fields on first sign-in. | 61k | Restricted at source (tokens stay with Castellan) |
| Card hotlist (lost, stolen, blocked) | Deny list (`rivercard` media type) through the bridge | ~210k entries | Confidential |
| Transaction history (2 years online at Castellan) | **Not migrated.** Goes to the RiverCard archive (immutable, 7 years) for disputes and audit. | ~190M rows | Confidential |
| Castellan liability file (daily) | Daily liability reconciliation (both systems) | 1 row per day | Internal |

## 2. Migration Approach
- **Pattern:** ELT into a staging area, then **continuous nightly sync** until switch-off, with a **pull-based** move per card. There is no one-time bulk load of balances.
- **Pipeline:**
  1. **Extract.** Castellan delivers nightly full extracts (PGP-encrypted, SFTP over ExpressRoute) of registrations, shadow balances, reduced-fare enrollments, autoload preferences and the hotlist. The bridge also performs on-demand read-only shadow-balance lookups against the Oracle read replica (EX-002).
  2. **Land.** Into ADLS (`raw/rivercard/yyyy-mm-dd/`, immutable, 7 years).
  3. **Validate.** Schema, row counts against Castellan's control file, referential checks, and a DLP scan that confirms no card numbers are present. Every extract so far has passed.
  4. **Load.** The .NET migration worker upserts pending records into the **Legacy schema** of the Account Service. It is idempotent by RiverCard card number, so the nightly reload replaces yesterday's data.
  5. **Move (per card, on request).**
     - The rider proves possession: card number plus the security code on the back, or a physical tap at a reader.
     - The balance resolver (§3.2) decides the amount.
     - The Account Service creates or links the Tapline account and posts a **ledger opening-balance transaction**: debit the RiverCard clearing account, credit the rider's stored-value sub-ledger.
     - The card is deactivated in RiverCard (hotlist through the bridge) and blocked on the Tapline deny list. A rider confirmation shows the amount.
- **Tooling:**
  - .NET 10 migration worker.
  - The ADLS raw zone.
  - Fabric notebooks for reconciliation reports.
  - The same ledger, deny-list and Account Service code paths as normal operations. There is no "migration-only" money path.

## 3. Data Validation & Reconciliation

### 3.1 Trial migrations
| Trial | Date | Scope | Result |
|---|---|---|---|
| T1 | 2027-06 | 50k-card sample | Pipeline works; 1.9% chip vs shadow differences in the 6,200 sampled cards that had chip reads |
| T2 | 2027-09 | Full extract; chip reads from pilot V7s and a service-center reader survey | **2.3%** of registered cards (25,300) with chip ≠ shadow; net difference **$186k**. Main causes: failed farebox uploads (61%), unposted TVM loads (22%), Castellan batch defects (17%). Raised RSK-03 to High. |
| T3 | 2028-01 | Full extract plus 4 weeks of bridge chip reads (2028-01-03 to 2028-01-24) | With the §3.2 rules: **99.69%** resolve automatically; **3,410** cards (0.31%) need manual review; **$41k** total difference in that set. Internal Audit sampled 400 resolutions: 0 errors. |

### 3.2 Authoritative balance rules
Approved by the CFO on 2027-10-14 and confirmed for v1.1.

| # | Situation | Balance used |
|---|---|---|
| 1 | The chip was read in the last 30 days (V7 tap through the bridge, or a store/service-center reader), with no later shadow-only transactions | **Chip balance** |
| 2 | No recent chip read; shadow balance has no failed-upload flags for the card | **Shadow balance** |
| 3 | Chip and shadow both known; they differ by **≤ $50** | **The higher of the two.** CRT bears the difference, at most ~$140k in total from T3 projections, charged to the migration contingency |
| 4 | Chip and shadow differ by **> $50**, or the card has a fraud or chargeback flag | **Manual review** by Revenue Operations within 10 business days. The rider gets the lower amount immediately and the difference after review. |
| 5 | Unregistered card | **Chip balance**, read at the moment of tap-to-transfer. The chip is then zeroed through the RiverCard profile. |

### 3.3 Reconciliation controls
- **Every night:** extract control totals (row counts, total shadow balance) must match Castellan's control file **exactly**, or the load stops.
- **Every day, the liability invariant:**
  > RiverCard liability (Castellan's daily file) + Tapline migrated balances (ledger account 2315 *RiverCard migrated*) − differences recognized under rule 3 = yesterday's total ± RiverCard sales and fares for the day

  Any unexplained difference is a Sev3 for the Money Team.
- **Per card:** each move records which rule was applied and the evidence (chip read ID, extract date). The record can be audited from the ledger transaction.
- **Monthly:** Internal Audit samples 200 moves.
- **Quarterly:** liability report to the Board (Board condition on Resolution 2026-12).
- **At switch-off:** final extract totals = Castellan closing liability = refund service balances + migrated balances + recognized differences. **Gate 3 requires $0.00 unexplained.**

## 4. Downtime / Cutover Window
- **No downtime** for riders during migration. Moves happen while both systems run (TS3 in the [Transition Architecture](transition-architecture.md)). Nightly loads run 01:00–02:30 and don't block moves: a move uses the last loaded snapshot plus a live shadow lookup.
- **Final cutover:** 2028-12-31, 22:00 to 2029-01-01, 06:00.
  - Final full extract.
  - Load into the RiverCard refund service and archive.
  - Castellan switches off at 23:59.
  - Verification by 06:00 ([Migration Plan §4.2](migration-plan.md)).

  Riders aren't affected: RiverCard acceptance already ended on 2028-10-31.

## 5. Rollback Plan
| What | Rollback | Window |
|---|---|---|
| A nightly load | Reload the previous day's extract (idempotent upsert) | Any time |
| A single card move | Ledger reversal transaction; RiverCard card reactivated through the bridge; Tapline medium unblocked | 30 days after the move, and not after 2028-10-31 |
| A move wave (M1–M3) | Pause moves by feature flag; reverse any affected moves individually as above | Until 2028-10-31 |
| Tap-to-transfer (M4) | **Not reversible** once the chip is zeroed; errors corrected by refund | — |
| Final cutover | **Not reversible** after Castellan shuts down; the refund service uses the final extract | Last decision point: go/no-go 2028-12-15 |

## 6. PII / Compliance Considerations
- **Minimization:**
  - Only data needed to move a card or answer a dispute is loaded into Tapline. RiverCard trip history goes to the archive only.
  - Addresses are loaded only for customers with balances over $20, for refund checks.
  - Pending records for customers who never move are purged from the Legacy schema at switch-off and exist only in the archive.
- **No card data:** RiverCard autoload uses Castellan's acquirer tokens, which are not migrated. Every extract is DLP-scanned for card numbers before landing, and a positive result quarantines the file and alerts the CISO.
- **RiverCard card keys:** Castellan's DESFire keys are Restricted. They were delivered HSM-wrapped to Vantor's key-injection facility and to CRT's Managed HSM for store and service-center readers, never in clear. They are destroyed at switch-off under a witnessed key ceremony.
- **Privacy notice:** riders are told what moves, what doesn't (trip history), and how long the archive is kept, in four languages, before M1.
- **Unclaimed property:** balances not moved or refunded by **2029-12-31** are reported to the state unclaimed-property program as the law requires (FR-MIG-04), with the owner's name and last-known address where registered.
- **Records retention:** the RiverCard archive (final extract, 2 years of transactions, every nightly extract) is kept **7 years**, until 2035-12-31, in immutable storage, then destroyed with a certificate.
- **Reduced-fare data:** only category and expiry migrate. Castellan's scanned documents are not transferred and are destroyed by Castellan at switch-off under the exit-assistance schedule, with a certificate.
