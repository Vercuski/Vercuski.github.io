const e=`---
title: Functional Requirements Specification — Project Tapline
status: approved
owner: Nadia Flores (Lead Business Analyst)
version: 1.2.0
last_updated: 2026-09-12
reviewers:
  - Grace Liu (Director, Fare Policy & Equity) — approved 2026-07-15
  - Aisha Karimi (Lead Solution Architect) — approved 2026-07-15
  - Ravi Patel (Principal Engineer, Fare Engine) — approved 2026-07-16
  - Jordan Hale (CFO) — approved FR-FIN items 2026-07-16
  - Tom Whitaker (CISO) — approved 2026-07-17
tags:
  - functional_requirements
---

# Functional Requirements Specification — Project Tapline

## 1. Overview

This specification turns the [Business Requirements](business-requirements.md) into testable system behavior. Every functional requirement (FR) traces to at least one business requirement (BR) and forward to at least one test case (TC) in the [Test Strategy](../10-testing-and-validation/test-strategy.md). Quality targets such as speed, availability and security are in the [Non-Functional Requirements](non-functional-requirements.md). Rider and staff journeys are in [Use Cases / User Stories](use-cases-and-user-stories.md).

**Conventions**
- IDs follow the pattern \`FR-<area>-nn\`. Areas: TAP (validation), FARE (fare calculation), CAP (capping), ACCT (accounts and media), PAY (payments and funding), ELIG (reduced fare), CS (customer service), INSP (inspection), POL (fare policy), FIN (finance), PART (partners), DEV (devices), MIG (RiverCard migration), DATA (reporting and privacy).
- Priority uses MoSCoW. "Phase" is the roadmap phase in which the FR first goes live; see the [Roadmap](../00-vision-and-strategy/architecture-roadmap.md).
- **Media** means anything a rider taps: a bank card, a phone wallet, a CRT card or an app ticket. **Token** means the media token, the identifier the system holds for a medium. For bank cards it is an irreversible keyed hash, never the card number. Terms are defined in the [Domain Model](../02-core-architecture/domain-model.md).

**Change history**
| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-06-26 | First approved version |
| 1.1.0 | 2026-07-17 | Added FR-CAP-05 (unlinked bank cards capped on their own) and FR-TAP-07 (first-ride risk limit) after the Northgate ICD workshops |
| 1.2.0 | 2026-09-12 | Conventions: defined "token" as the media token (ADR-0005 v1.1). No requirement changed. |

## 2. Functional Requirements

### 2.1 Tap and validation (TAP)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-TAP-01 | A validator accepts a tap from a contactless EMV bank card or phone wallet and shows accept or deny with a distinct tone and color. | BR-01, BR-24 | Must · P1 | Valid card → green screen and accept tone; deny-listed card → red screen and deny tone with a reason code; result shown on every tap. |
| FR-TAP-02 | A validator accepts a tap from a CRT card and from an app ticket (QR code). | BR-02, BR-03 | Must (card) / Should (QR) · P1 | CRT card and a valid app QR are accepted; an expired or tampered QR is denied. |
| FR-TAP-03 | A validator decides accept or deny locally, using its deny list and the medium's own checks, with no call to the back office during the tap. | BR-07, BR-08 | Must · P0 | Accept/deny is identical with the network disconnected; see NFR-PERF-01 for timing. |
| FR-TAP-04 | A validator stores every tap, signs it, and uploads it when connected. A tap is deleted from the validator only after the back office confirms receipt. | BR-08, BR-16 | Must · P0 | No taps are lost after 72 h offline followed by reconnection; duplicate uploads are ignored (each tap has a unique ID). |
| FR-TAP-05 | A validator ignores a repeat tap of the same medium within 10 seconds on the same validator ("double tap"). | BR-07 | Must · P1 | Second tap within 10 s → shows "already paid", no new tap recorded. |
| FR-TAP-06 | A validator receives deny-list updates (additions and removals) and applies them without a restart. | BR-12, BR-13 | Must · P0 | A medium blocked in the back office is denied at a connected validator; see NFR-PERF-04 for timing. |
| FR-TAP-07 | A bank card not seen before is accepted on its first tap if it passes the card's own offline checks ("first-ride risk"). If its charge is later declined, it is added to the deny list until the debt is paid. | BR-01, BR-16 | Must · P1 | Declined charge → card on deny list within one deny-list cycle; paying the debt in the portal removes it. |

### 2.2 Fare calculation (FARE)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-FARE-01 | The system groups taps by the same medium into trips, applying the transfer rule of the operator where the trip began. | BR-05 | Must · P1 | Taps on Route 12 at 08:00 and Blue Line at 09:30 → one trip, one $2.00 fare. |
| FR-FARE-02 | One fare covers unlimited CRT transfers for 2 hours from the first tap. A tap after 2 hours starts a new fare. | BR-05 | Must · P1 | Taps at 08:00 and 10:00:59 → 2 fares; taps at 08:00 and 09:59:59 → 1 fare. |
| FR-FARE-03 | Each tap is assigned to a **service day** running from 03:00 to 02:59 local time. Taps between 00:00 and 02:59 belong to the previous calendar day's service day. | BR-04 | Must · P1 | Tap at 01:45 on Saturday counts toward Friday's service day. |
| FR-FARE-04 | Fare calculation uses the fare rules in effect at the time of the tap, not at the time of processing. | BR-15, BR-16 | Must · P1 | A tap made before a fare change but uploaded after it is charged the old fare. |
| FR-FARE-05 | Riders with reduced-fare status are charged the reduced fare for every tap from any of their linked media. | BR-06 | Must · P2 | Linked bank card on a reduced-fare account → $1.00 fares. |
| FR-FARE-06 | Fare calculation can be repeated for any past period and produces the same result (deterministic). | BR-13, BR-16 | Must · P1 | Re-running a service day's taps gives identical charges to the cent. |

### 2.3 Fare capping (CAP)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-CAP-01 | When a rider's fares in a service day reach the daily cap, further taps that service day are free. | BR-04 | Must · P1 | Three $2.00 taps → $2.00, $2.00, $1.00, then $0.00 for every later tap that service day. |
| FR-CAP-02 | When a rider's fares in a calendar week (Monday 03:00 to the following Monday 02:59) reach the weekly cap, further taps that week are free. | BR-04 | Must · P1 | After $25.00 in fares in a week, every tap is $0.00 until Monday 03:00. |
| FR-CAP-03 | Caps are counted per account across all linked media. | BR-04, BR-10 | Must · P2 | Two $2.00 taps on a bank card and one on a CRT card in the same account → total $5.00 for the day, not $6.00. |
| FR-CAP-04 | Reduced-fare accounts use the reduced caps ($2.50 daily, $12.50 weekly). | BR-04, BR-06 | Must · P2 | Reduced-fare rider charged $1.00, $1.00, $0.50, then $0.00. |
| FR-CAP-05 | A bank card that is not linked to an account is capped on its own. | BR-04 | Must · P1 | Unregistered card reaches the daily cap like any account. |
| FR-CAP-06 | The app and portal show progress toward the daily and weekly caps. | BR-04, BR-10 | Should · P2 | Cap progress shown within the time in NFR-PERF-03. |

### 2.4 Accounts and media (ACCT)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-ACCT-01 | A rider can create an account with an email address or mobile number, verified by a one-time code. | BR-10 | Must · P1 | Account active after verification; duplicate email or number rejected. |
| FR-ACCT-02 | A rider can link up to 5 media to an account: bank cards, phone wallets and CRT cards. | BR-10 | Must · P1 | Linking a bank card needs a $0.00 verification with Northgate; the 6th medium is rejected with a message. |
| FR-ACCT-03 | A rider can see every tap, trip and charge for the last 13 months and download a statement (PDF or CSV). | BR-10 | Must · P1 | Statement totals equal the charges on the bank statement for the same period. |
| FR-ACCT-04 | A rider can block a lost or stolen medium and move the balance, cap progress and reduced-fare status to a replacement. | BR-12 | Must · P2 | Blocked medium denied at validators (FR-TAP-06); the replacement shows the same balance and cap progress. |
| FR-ACCT-05 | A rider can see past taps from a bank card used before the account existed, by linking that card. | BR-10 | Should · P2 | Linking a card shows its last 90 days of trips. |
| FR-ACCT-06 | A CRT card can be issued at retail locations and used immediately without an account. | BR-02 | Must · P2 | New card accepted at a validator within 15 minutes of a cash load at retail. |

### 2.5 Payments and funding (PAY)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-PAY-01 | Fares on bank cards and wallets are charged to the card in combined daily charges through Northgate, not one charge per tap. | BR-01, BR-04 | Must · P1 | One charge per card per service day, equal to the sum of that day's fares after capping. |
| FR-PAY-02 | A rider can add stored value to an account with a card online, from $5 to $100. | BR-11 | Must · P2 | Balance updated within 1 minute of a successful payment. |
| FR-PAY-03 | A rider can set automatic top-up: when the balance falls below a threshold, a set amount is charged to a chosen card. | BR-11 | Must · P2 | Top-up triggered once per threshold crossing; a failed top-up notifies the rider. |
| FR-PAY-04 | A rider can add cash to a CRT card or account at any CornerPay location. | BR-02, BR-11 | Must · P2 | Retail load posted to the account within 15 minutes. |
| FR-PAY-05 | A rider with an outstanding debt from a declined charge can pay it in the app or portal. | BR-13 | Must · P1 | Paying the debt removes the card from the deny list (FR-TAP-07). |

### 2.6 Reduced fare (ELIG)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-ELIG-01 | A rider can apply online for low-income reduced fare. Eligibility is confirmed through the State DHS using the rider's consent and case number. | BR-06 | Must · P2 | Matching DHS record → reduced fare active the same day; no match → application sent to manual review. |
| FR-ELIG-02 | Customer service can approve senior and disability reduced fares from documents, with the documents stored for 90 days and then deleted. | BR-06, BR-26 | Must · P2 | Approved status applies to all linked media; documents purged after 90 days. |
| FR-ELIG-03 | Reduced-fare status has an expiry date. The rider is reminded 30 days before it expires and can renew. | BR-06 | Must · P2 | Reminder sent 30 days before; full fare applies the day after expiry if not renewed. |

### 2.7 Customer service and refunds (CS)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-CS-01 | Customer service can find an account by email, phone, CRT card number, or the last 4 digits and expiry of a bank card. | BR-13, BR-23 | Must · P1 | Search returns matches without ever showing or storing the full card number. |
| FR-CS-02 | Customer service can issue a refund or fare adjustment. Adjustments over $50, or more than 3 for the same account in 30 days, need a second approver. | BR-13 | Must · P1 | Over-limit adjustment held until approved by a second user; every adjustment logged with the user and reason. |
| FR-CS-03 | A rider can dispute a charge in the app or portal and track its status. | BR-13 | Should · P2 | Dispute visible to customer service within 1 minute; rider notified of the outcome. |

### 2.8 Inspection (INSP)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-INSP-01 | A fare inspector can tap a rider's medium on a handheld device and see whether it has a valid tap for the current trip. | BR-09 | Must · P1 | Valid tap within the transfer window → "paid"; otherwise "no valid fare". Works offline using taps synced to the device in the last 5 minutes. |
| FR-INSP-02 | The handheld device shows no personal information: no name, no trip history, and no card number. | BR-09, BR-26 | Must · P1 | Screen shows only paid/not paid, fare type (full or reduced) and the time of the last tap. |

### 2.9 Fare policy (POL)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-POL-01 | Authorized fare-policy staff can create a new version of fare rules (prices, caps, transfer window, products) with a future effective date and time, with no software release. | BR-15 | Must · P1 | New version takes effect at the stated time; earlier taps use the earlier version (FR-FARE-04). |
| FR-POL-02 | A fare rule version must be approved by a second authorized user before it can take effect. | BR-15, BR-16 | Must · P1 | Unapproved version cannot be scheduled. |
| FR-POL-03 | Before approval, a fare rule version can be simulated against a past week of real taps, showing the revenue and rider impact. | BR-15, BR-19 | Should · P2 | Simulation report shows revenue difference and number of riders affected by fare category. |
| FR-POL-04 | Each operator manages its own fare rules. One operator cannot see or change another's. | BR-15 | Must · P4 | HCT user cannot open CRT's fare rules. |

### 2.10 Finance and reconciliation (FIN)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-FIN-01 | Every charge, payment, refund, adjustment and balance movement is recorded as a permanent ledger entry. Entries are never changed or deleted; corrections are new entries. | BR-16 | Must · P0 | No update or delete path exists for ledger entries; a correction shows both entries. |
| FR-FIN-02 | Each day the system reconciles fares charged against Northgate's settlement report and flags any difference. | BR-16 | Must · P1 | Daily reconciliation report; any difference over $0.00 raises an exception for Revenue Operations. |
| FR-FIN-03 | Each day the system posts summarized journal entries to CRT's ERP general ledger. | BR-16 | Must · P1 | GL totals match the ledger for the day. |
| FR-FIN-04 | The system reports outstanding stored value (customer liability) per day, by media type. | BR-16, BR-21 | Must · P1 | Liability total equals the sum of all account and card balances. |
| FR-FIN-05 | Any fare can be traced from the tap to the charge, settlement batch, bank deposit and GL entry. | BR-16 | Must · P1 | A sample of 100 random taps traces end to end in an audit test. |

### 2.11 Partners (PART)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-PART-01 | The system calculates each operator's share of revenue daily, according to the apportionment rules in the regional agreement. | BR-17 | Must · P4 | Shares for a service day sum exactly to the revenue collected. |
| FR-PART-02 | Each operator can download a daily apportionment statement with trip-level detail (no rider identity). | BR-17, BR-26 | Must · P4 | Statement available by 08:00 for the previous service day. |
| FR-PART-03 | Microtransit trips booked through Keel Mobility are charged to the rider's account and count toward caps. | BR-20 | Could · P4 | A Keel trip charge appears in the account and counts toward the daily cap. |

### 2.12 Devices (DEV)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-DEV-01 | Operations staff can see every validator's status (online, offline, faulty), location, last contact and software version. | BR-18 | Should · P1 | Dashboard shows a validator offline within 10 minutes of its last missed heartbeat. |
| FR-DEV-02 | Software and configuration updates can be sent to validators in groups, and stopped if problems appear. | BR-18, BR-08 | Must · P1 | An update to a test group of 20 validators does not reach other groups until promoted. |

### 2.13 RiverCard migration (MIG)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-MIG-01 | Tapline validators accept RiverCard cards until the RiverCard acceptance end date, deducting fares from the RiverCard balance. | BR-22 | Must · P3 | RiverCard tap on a Tapline validator deducts the correct fare from the RiverCard balance. |
| FR-MIG-02 | A RiverCard holder can move their balance, reduced-fare status and automatic top-up to a Tapline account, online or at a customer service center. | BR-21 | Must · P3 | Balance appears in Tapline to the cent; the RiverCard is deactivated. |
| FR-MIG-03 | A RiverCard holder can request a refund of their balance instead of moving it. | BR-21 | Must · P3 | Refund paid by check or bank transfer within 30 days. |
| FR-MIG-04 | Unclaimed RiverCard balances are reported for transfer under state unclaimed-property law. | BR-21 | Must · P3 | Report lists every unclaimed balance and totals to the remaining liability. |

### 2.14 Reporting and privacy (DATA)
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-DATA-01 | Fare usage reports by route, stop, time and census tract are produced from de-identified data. | BR-19 | Must · P2 | Report data contains no account IDs or tokens; groups of fewer than 10 riders are suppressed. |
| FR-DATA-02 | A rider can choose to have their trip history deleted after 90 days instead of 13 months. | BR-14, BR-26 | Must · P2 | Trips older than 90 days not shown and not retrievable for that account; financial totals kept. |
| FR-DATA-03 | All rider-facing screens, emails and notifications are available in English, Spanish, Vietnamese and Simplified Chinese. | BR-25 | Must · P1 | Language can be changed on every screen; all four languages pass content review. |

## 3. Traceability Matrix

Maps each functional requirement to its business requirements and forward to its test cases. Test case IDs are defined in the [Test Strategy](../10-testing-and-validation/test-strategy.md).

| FR ID | BR ID | Test Case ID |
|---|---|---|
| FR-TAP-01 | BR-01, BR-24 | TC-TAP-001, TC-ACC-004 |
| FR-TAP-02 | BR-02, BR-03 | TC-TAP-002, TC-TAP-003 |
| FR-TAP-03 | BR-07, BR-08 | TC-TAP-004, TC-HIL-001 |
| FR-TAP-04 | BR-08, BR-16 | TC-TAP-005, TC-HIL-002 |
| FR-TAP-05 | BR-07 | TC-TAP-006 |
| FR-TAP-06 | BR-12, BR-13 | TC-TAP-007, TC-HIL-003 |
| FR-TAP-07 | BR-01, BR-16 | TC-TAP-008, TC-PAY-006 |
| FR-FARE-01 | BR-05 | TC-FARE-001 |
| FR-FARE-02 | BR-05 | TC-FARE-002 |
| FR-FARE-03 | BR-04 | TC-FARE-003 |
| FR-FARE-04 | BR-15, BR-16 | TC-FARE-004 |
| FR-FARE-05 | BR-06 | TC-FARE-005 |
| FR-FARE-06 | BR-13, BR-16 | TC-FARE-006 (property-based) |
| FR-CAP-01 | BR-04 | TC-CAP-001 (property-based) |
| FR-CAP-02 | BR-04 | TC-CAP-002 (property-based) |
| FR-CAP-03 | BR-04, BR-10 | TC-CAP-003 |
| FR-CAP-04 | BR-04, BR-06 | TC-CAP-004 |
| FR-CAP-05 | BR-04 | TC-CAP-005 |
| FR-CAP-06 | BR-04, BR-10 | TC-CAP-006 |
| FR-ACCT-01 | BR-10 | TC-ACCT-001 |
| FR-ACCT-02 | BR-10 | TC-ACCT-002 |
| FR-ACCT-03 | BR-10 | TC-ACCT-003 |
| FR-ACCT-04 | BR-12 | TC-ACCT-004, TC-HIL-003 |
| FR-ACCT-05 | BR-10 | TC-ACCT-005 |
| FR-ACCT-06 | BR-02 | TC-ACCT-006 |
| FR-PAY-01 | BR-01, BR-04 | TC-PAY-001, TC-CERT-001 (Northgate certification) |
| FR-PAY-02 | BR-11 | TC-PAY-002 |
| FR-PAY-03 | BR-11 | TC-PAY-003 |
| FR-PAY-04 | BR-02, BR-11 | TC-PAY-004 |
| FR-PAY-05 | BR-13 | TC-PAY-005 |
| FR-ELIG-01 | BR-06 | TC-ELIG-001 |
| FR-ELIG-02 | BR-06, BR-26 | TC-ELIG-002 |
| FR-ELIG-03 | BR-06 | TC-ELIG-003 |
| FR-CS-01 | BR-13, BR-23 | TC-CS-001, TC-SEC-003 |
| FR-CS-02 | BR-13 | TC-CS-002 |
| FR-CS-03 | BR-13 | TC-CS-003 |
| FR-INSP-01 | BR-09 | TC-INSP-001, TC-HIL-004 |
| FR-INSP-02 | BR-09, BR-26 | TC-INSP-002 |
| FR-POL-01 | BR-15 | TC-POL-001 |
| FR-POL-02 | BR-15, BR-16 | TC-POL-002 |
| FR-POL-03 | BR-15, BR-19 | TC-POL-003 |
| FR-POL-04 | BR-15 | TC-POL-004 |
| FR-FIN-01 | BR-16 | TC-FIN-001 |
| FR-FIN-02 | BR-16 | TC-FIN-002 |
| FR-FIN-03 | BR-16 | TC-FIN-003 |
| FR-FIN-04 | BR-16, BR-21 | TC-FIN-004 |
| FR-FIN-05 | BR-16 | TC-FIN-005 |
| FR-PART-01 | BR-17 | TC-PART-001 |
| FR-PART-02 | BR-17, BR-26 | TC-PART-002 |
| FR-PART-03 | BR-20 | TC-PART-003 |
| FR-DEV-01 | BR-18 | TC-DEV-001 |
| FR-DEV-02 | BR-18, BR-08 | TC-DEV-002, TC-HIL-005 |
| FR-MIG-01 | BR-22 | TC-MIG-001, TC-HIL-006 |
| FR-MIG-02 | BR-21 | TC-MIG-002 |
| FR-MIG-03 | BR-21 | TC-MIG-003 |
| FR-MIG-04 | BR-21 | TC-MIG-004 |
| FR-DATA-01 | BR-19 | TC-DATA-001 |
| FR-DATA-02 | BR-14, BR-26 | TC-DATA-002 |
| FR-DATA-03 | BR-25 | TC-DATA-003, TC-ACC-001 |

**Coverage check:** every BR (BR-01 to BR-26) is covered by at least one FR. BR-07 (boarding speed), BR-08 (offline operation), BR-23 (PCI) and BR-24 (accessibility) are mainly quality requirements. Their measurable targets are in the [Non-Functional Requirements](non-functional-requirements.md).
`;export{e as default};
