---
title: Use Cases / User Stories — Project Tapline
status: approved
owner: Nadia Flores (Lead Business Analyst)
version: 1.0.0
last_updated: 2026-07-31
reviewers:
  - Grace Liu (Director, Fare Policy & Equity) — approved 2026-07-29
  - Aisha Karimi (Lead Solution Architect) — approved 2026-07-29
  - Rider Advisory Committee — reviewed UC-01 to UC-04 on 2026-07-22
  - Accessibility Advisory Committee — reviewed UC-01 and UC-05 on 2026-07-22
tags:
  - use_cases
  - user_stories
---

# Use Cases / User Stories — Project Tapline

> [!summary] How to read this
> **Use cases** (§1) describe the journeys that cross several parts of the system and carry the most risk. **User stories** (§2) are the backlog form of smaller features, each with Given/When/Then acceptance criteria. Both trace to the [Functional Requirements](functional-requirements.md) (FR) and [Non-Functional Requirements](non-functional-requirements.md) (NFR). The cross-service flows are drawn in [Sequence Diagrams](../02-core-architecture/sequence-diagrams.md).

**Actors**
| Actor | Description |
|---|---|
| Rider | Anyone paying a fare. May or may not have an account. |
| Reduced-fare rider | A rider with senior, disability or low-income status. |
| Fare inspector | CRT staff checking proof of payment on rail and ferry. |
| Customer service agent | CRT contact-center or service-center staff. |
| Revenue analyst | CRT Revenue Operations staff who reconcile money. |
| Partner operator finance user | Finance staff at one of the six partner operators. |
| Validator | The fare device on a vehicle or platform (system actor). |
| Northgate Payments | Card processor (external system). |
| State DHS | Eligibility verification service (external system). |
| RiverCard | Legacy fare system (external system, until 2028). |

## 1 Use Cases

### 1.1 UC-01: Rider taps a contactless bank card on a bus
- **Actor(s):** Rider (primary); Validator; Northgate Payments
- **Preconditions:**
  - The validator has a deny list no older than its configured limit.
  - The rider's card is contactless-capable.
- **Main Flow:**
  1. The rider taps a bank card on the validator at the front door.
  2. The validator reads the card's payment token and runs the card's offline checks.
  3. The validator checks the token against its local deny list and the 10-second double-tap rule.
  4. The validator shows accept (green, accept tone) and records a signed tap with time, location, route and validator ID.
  5. The validator uploads the tap to the cloud within 30 seconds.
  6. The system assigns the tap to a service day, builds the trip, and calculates the fare after transfers and caps.
  7. After the service day ends, the system combines the day's fares for the card into one charge and sends it to Northgate.
  8. Northgate approves the charge, and the payment is recorded in the ledger.
- **Alternate Flows:**
  - **A1 – Token on deny list (step 3):** the validator shows deny (red, deny tone, reason "Card blocked – see app or call"). No tap is recorded as paid.
  - **A2 – No network (step 5):** the validator stores the tap and uploads it when the connection returns, possibly days later. The tap is rated with the fare rules and service day in effect when it was made.
  - **A3 – Transfer within 2 hours (step 6):** the tap joins the existing trip and costs $0.00.
  - **A4 – Daily cap already reached (step 6):** the fare is $0.00.
  - **A5 – Charge declined (step 8):** the debt is recorded on the card, and the card's token is added to the deny list until the rider pays the debt (FR-TAP-07, FR-PAY-05).
  - **A6 – Card not contactless or unreadable (step 2):** the validator shows "Card not read – try again". After 3 failures it shows "Use another card".
- **Postconditions:**
  - The tap is stored durably in the cloud, and the fare is in the ledger.
  - If the card is linked to an account, the trip appears in the rider's history.
- **Related NFRs:** NFR-PERF-01, NFR-PERF-02, NFR-PERF-03, NFR-AVAIL-03, NFR-AVAIL-04, NFR-SEC-01, NFR-USE-03
- **Related FRs:** FR-TAP-01, -03, -04, -05, -07; FR-FARE-01 to -04; FR-CAP-01, -05; FR-PAY-01

### 1.2 UC-02: Rider reaches the daily cap across two linked media
- **Actor(s):** Rider with an account
- **Preconditions:**
  - The rider's account has a bank card and a CRT card linked.
  - No fares have been charged yet this service day.
- **Main Flow:**
  1. At 07:40 the rider taps the bank card on Route 12. The fare is $2.00.
  2. At 12:15 the rider taps the CRT card on the Blue Line. The fare is $2.00, charged to the account's stored value.
  3. At 17:30 the rider taps the bank card on Route 31. The system calculates $1.00, bringing the day to the $5.00 cap.
  4. The app shows "Daily cap reached – ride free until 3 AM".
  5. At 20:05 the rider taps the CRT card. The fare is $0.00.
- **Alternate Flows:**
  - **A1 – Rider is reduced-fare:** fares are $1.00, $1.00, $0.50, then $0.00 (cap $2.50).
  - **A2 – Tap at 01:30 the next calendar day:** the tap belongs to the same service day and is $0.00.
  - **A3 – Weekly cap reached first:** the remaining fare is reduced to reach exactly $25.00 for the week.
  - **A4 – A tap from step 1 uploads late (validator offline):** caps are recalculated when it arrives. The total for the day is still $5.00, and the charges are corrected with new ledger entries.
- **Postconditions:**
  - The day's total charge across both media is $5.00.
  - The account's weekly progress has increased by $5.00.
- **Related NFRs:** NFR-PERF-03, NFR-INTEG-01
- **Related FRs:** FR-CAP-01 to -04, -06; FR-FARE-03; FR-ACCT-02

### 1.3 UC-03: Applicant verifies low-income reduced fare online
- **Actor(s):** Rider (applicant); State DHS
- **Preconditions:**
  - The rider has an account.
  - The rider is enrolled in SNAP or Medicaid.
- **Main Flow:**
  1. The rider selects "Apply for reduced fare – income" in the app.
  2. The rider enters a DHS case number and date of birth and gives consent for CRT to check enrollment.
  3. The system sends a verification request to the DHS API.
  4. DHS confirms active enrollment and an enrollment end date.
  5. The system sets reduced-fare status on the account, with an expiry date that matches DHS's end date (maximum 2 years).
  6. The rider is notified, and every linked medium is charged reduced fares from the next tap.
- **Alternate Flows:**
  - **A1 – No match at DHS (step 4):** the application goes to manual review. The rider can upload a benefits letter, and an agent decides within 5 business days.
  - **A2 – DHS API unavailable (step 3):** the system retries for up to 24 hours and tells the rider the check is pending.
  - **A3 – Rider applies at a service center:** an agent performs steps 2–5 for the rider.
- **Postconditions:**
  - The account has reduced-fare status with an expiry date and a 30-day reminder scheduled.
  - Only the result (eligible or not, and the end date) is stored. No DHS case details are kept.
- **Related NFRs:** NFR-SEC-07, NFR-PRIV-01, NFR-USE-01, NFR-USE-02
- **Related FRs:** FR-ELIG-01, FR-ELIG-03, FR-FARE-05, FR-CAP-04

### 1.4 UC-04: Rider reports a lost CRT card and moves the balance
- **Actor(s):** Rider with an account
- **Preconditions:**
  - The lost CRT card is linked to the rider's account.
- **Main Flow:**
  1. The rider selects the lost card in the app and chooses "Block card".
  2. The system blocks the card and adds it to the deny list.
  3. The rider links a replacement CRT card bought at a retail location.
  4. The system moves the balance and reduced-fare status to the account level, where all linked media can use them. Cap progress is already held per account, so it carries over.
  5. The rider taps the new card and pays from the same balance.
- **Alternate Flows:**
  - **A1 – Lost card used after blocking but before the validator gets the update:** the tap is accepted offline. The fare is charged to the account as normal, and customer service can refund it on request.
  - **A2 – Card not linked to an account:** the balance can't be protected; the rider is told to register cards in future. (This is the situation BR-12 exists to reduce.)
- **Postconditions:**
  - The lost card is denied at validators within NFR-PERF-04.
  - No money is lost.
- **Related NFRs:** NFR-PERF-04, NFR-SEC-04
- **Related FRs:** FR-ACCT-04, FR-TAP-06

### 1.5 UC-05: Fare inspector checks proof of payment on the Blue Line
- **Actor(s):** Fare inspector; Rider
- **Preconditions:**
  - The inspector's handheld device has synced recent taps for the line within the last 5 minutes.
- **Main Flow:**
  1. The inspector asks the rider to tap the card or phone they paid with on the handheld device.
  2. The device looks up the token in the recent taps for the line.
  3. The device shows "PAID", the fare type and the time of the last tap.
  4. The inspector moves on.
- **Alternate Flows:**
  - **A1 – No valid tap:** the device shows "NO VALID FARE". The inspector follows the fare-enforcement procedure; this is a manual process, outside the system.
  - **A2 – Rider tapped a different card from the one presented:** the device shows "NO VALID FARE". The inspector asks whether the rider has another card or device.
  - **A3 – Device offline and data older than 5 minutes:** the device shows a "Data may be out of date" warning, and the inspector uses discretion.
  - **A4 – Reduced-fare medium:** the device shows "PAID – REDUCED" so the inspector can ask for reduced-fare ID where policy requires.
- **Postconditions:**
  - An inspection event is recorded with time, location and result, with no rider identity.
- **Related NFRs:** NFR-PERF-08, NFR-PRIV-01
- **Related FRs:** FR-INSP-01, FR-INSP-02

### 1.6 UC-06: Revenue analyst reconciles a service day
- **Actor(s):** Revenue analyst; Northgate Payments
- **Preconditions:**
  - Charges for the service day were sent to Northgate by 04:00.
  - Northgate's settlement report has been received.
- **Main Flow:**
  1. At 06:00 the system matches every charge in the ledger against Northgate's settlement report.
  2. The system matches settlement totals to the bank deposit and posts summarized journal entries to the ERP general ledger.
  3. The analyst opens the reconciliation dashboard; every check is green with a $0.00 difference.
  4. The analyst signs off the day.
- **Alternate Flows:**
  - **A1 – Difference found:** the system lists the unmatched charges. The analyst investigates each one using the trace from tap to deposit (FR-FIN-05) and records a resolution. Corrections are posted as new ledger entries.
  - **A2 – Northgate report late:** reconciliation runs when the report arrives; a breach of the ICD's delivery time is logged.
- **Postconditions:**
  - The service day is reconciled and locked. Later changes, such as late taps or refunds, post to the current day.
- **Related NFRs:** NFR-PERF-07, NFR-INTEG-01, NFR-SEC-06
- **Related FRs:** FR-FIN-01 to -05

### 1.7 UC-07: Partner operator reviews its daily apportionment (Phase 4)
- **Actor(s):** Partner operator finance user (Harbor County Transit)
- **Preconditions:**
  - HCT is live on Tapline and covered by the regional agreement.
- **Main Flow:**
  1. At 08:00 the user downloads HCT's statement for the previous service day.
  2. The statement shows HCT's revenue share, trips, transfers to and from other operators, and the rule applied to each shared trip.
  3. The user checks the totals against HCT's own ridership counts.
- **Alternate Flows:**
  - **A1 – User questions a figure:** the user raises a query through the partner portal. CRT Revenue Operations responds under the regional agreement's dispute process.
- **Postconditions:**
  - HCT can see only its own data. Rider identity is never included.
- **Related NFRs:** NFR-SEC-03, NFR-PRIV-01, NFR-SCALE-02
- **Related FRs:** FR-PART-01, FR-PART-02, FR-POL-04

### 1.8 UC-08: RiverCard holder moves to Tapline (Phase 3)
- **Actor(s):** Rider with a registered RiverCard; RiverCard
- **Preconditions:**
  - The rider's RiverCard data has been migrated to Tapline as a pending record.
- **Main Flow:**
  1. The rider signs in to Tapline and selects "Move my RiverCard".
  2. The rider enters the RiverCard number and the security code on the back.
  3. The system confirms the balance, reduced-fare status and automatic top-up held for that card.
  4. The rider confirms. The system moves the balance into the Tapline account and deactivates the RiverCard in both systems.
  5. The rider receives a confirmation showing the amount moved.
- **Alternate Flows:**
  - **A1 – Unregistered RiverCard:** the rider visits a service center with the card. An agent completes the move after checking the card.
  - **A2 – Rider wants a refund:** the system records a refund request (FR-MIG-03).
  - **A3 – Balance differs from the rider's expectation:** the agent shows the RiverCard transaction history from the migrated data.
- **Postconditions:**
  - The stored-value liability moves from RiverCard to Tapline, and the total liability across both systems doesn't change.
- **Related NFRs:** NFR-INTEG-01
- **Related FRs:** FR-MIG-01, FR-MIG-02, FR-MIG-03

---

## 2. User Story Format (alternative)

### US-01: See my cap progress
> As a **rider with an account**, I want **to see how close I am to today's cap**, so that **I know when the rest of my rides are free**.

**Acceptance Criteria (Given/When/Then):**
- Given I have paid $4.00 in fares this service day, when I open the app, then I see "$1.00 until free rides today".
- Given I have reached the daily cap, when I open the app, then I see "Daily cap reached – ride free until 3 AM".
- Given I have reached the weekly cap, when I open the app, then I see "Weekly cap reached – ride free until Monday 3 AM".

### US-02: Late-night taps count toward the right day
> As a **night-shift worker**, I want **my rides after midnight to count toward the same day as my evening rides**, so that **I don't pay toward two caps for one shift**.

**Acceptance Criteria (Given/When/Then):**
- Given I tapped at 22:00 on Friday, when I tap again at 01:45 on Saturday, then both taps count toward Friday's service day.
- Given I tap at 03:05 on Saturday, then the tap counts toward Saturday's service day.

### US-03: Pay off a declined charge
> As a **rider whose card was declined**, I want **to pay what I owe in the app**, so that **my card works on the bus again**.

**Acceptance Criteria (Given/When/Then):**
- Given my card has a $2.00 debt, when I pay $2.00 in the app, then the card is removed from the deny list and works at a connected validator within 15 minutes.
- Given my card has a debt, when I tap it, then the validator shows "Card blocked – see app or call".

### US-04: Load cash at a store
> As a **rider without a bank account**, I want **to add cash to my CRT card at a store near me**, so that **I don't need a bank card to ride**.

**Acceptance Criteria (Given/When/Then):**
- Given I hand $20 to a CornerPay cashier with my CRT card, when the cashier completes the load, then I get a receipt and the card has $20 more within 15 minutes.
- Given my CRT card is not registered, when I load cash, then the load still works.

### US-05: Schedule a fare change
> As a **fare policy analyst**, I want **to schedule a new fare table for a future date and see its impact first**, so that **the Board's fare decisions take effect exactly on time without IT involvement**.

**Acceptance Criteria (Given/When/Then):**
- Given I have created a fare rule version effective 1 July at 03:00, when I run a simulation, then I see the revenue change and the number of riders affected, by fare category.
- Given the version is approved by a second analyst, when 1 July 03:00 arrives, then taps from that time use the new rules and earlier taps use the old rules.
- Given the version is not approved, when I try to schedule it, then I am blocked with "Second approval required".

### US-06: Refund with a second approver
> As a **customer service supervisor**, I want **large or repeated refunds to need my approval**, so that **we prevent refund fraud**.

**Acceptance Criteria (Given/When/Then):**
- Given an agent issues a $60 refund, then it is held until a supervisor approves it.
- Given an agent issues a 4th refund on the same account within 30 days, then it is held for approval regardless of the amount.
- Given any refund, then the audit log records the agent, the approver, the reason and the amount.

### US-07: Delete my trip history
> As a **privacy-conscious rider**, I want **my trips deleted after 90 days**, so that **CRT doesn't keep a record of where I go**.

**Acceptance Criteria (Given/When/Then):**
- Given I choose "Keep 90 days" in privacy settings, when trips become older than 90 days, then they no longer appear in my history and customer service cannot see them.
- Given my trips are deleted, then my statements still show the total charged per day.

### US-08: See a broken validator
> As a **bus operations supervisor**, I want **to see which validators on my garage's buses are faulty**, so that **I can swap them before pull-out**.

**Acceptance Criteria (Given/When/Then):**
- Given a validator reports a hardware fault, when I open the device dashboard, then I see the bus number, door position and fault since time.
- Given a validator has missed two heartbeats, then it is shown as offline within 10 minutes.
