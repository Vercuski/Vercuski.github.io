---
title: Test Strategy — Project Tapline
status: approved
owner: Tomás Reyes (Test & Quality Lead, Platform Team)
version: 2.1.0
last_updated: 2027-12-01
reviewers:
  - Ravi Patel (Principal Engineer, Fare Engine) — approved §2.7 and the DST cases 2027-11-29
  - Diego Alvarez (Edge Team lead) — approved §2.5 on 2027-11-29
  - Hannah Cole (Money Team lead) — approved §2.6 on 2027-11-29
  - Tom Whitaker (CISO) — approved §2.3 on 2027-11-30
  - Architecture Review Board — v2.1 adopted 2027-12-08
tags:
  - test_strategy
---
# Test Strategy — Project Tapline

> [!summary] Where Tapline's tests concentrate
> Ordinary functional testing is necessary but not where Tapline's risk is. The effort goes where a defect costs riders money or stops boarding:
> 1. **Fare correctness under real-world time:** property-based tests of the pure Fare Engine core, now including every daylight-saving transition. Added after [INC-2027-1107-01](../08-risk-and-operations/incident-postmortem.md).
> 2. **Real devices on real networks:** the hardware lab at Ridgeline garage.
> 3. **The processor boundary:** Northgate certification.
> 4. **The NFRs:** load, resilience, security and accessibility.
>
> Every test case cited by the [Functional Requirements](../01-requirements/functional-requirements.md) traceability matrix is defined in §6.

**Change history:**
- v1.0 (2026-10-30): Phase 0.
- v2.0 (2027-08-20): Gate 1 learnings. Added the robot tapper, CERT cases and first-ride loss monitoring.
- v2.1 (2027-12-01): DST time-zone generators and TC-FARE-007/008; pre-charge cap guard test TC-FIN-006; clock-change game day TC-RES-008.

## 1. Testing Levels
| Level | Scope | Owner | Tooling |
|---|---|---|---|
| Unit | Domain rules per context; pure Fare Engine components | Each product team | xUnit v3, Shouldly, NSubstitute ([Coding Standards §6](../06-decisions-and-standards/coding-standards.md)) |
| **Property-based** | Fare Engine invariants over generated weeks of taps | Journey Team | FsCheck; custom generators (`Tapline.Journey.Testing.Generators`) |
| Integration | One context with its real database, streams and cache | Each product team | Testcontainers (SQL Server, Azurite, Redis), Event Hubs emulator |
| Contract | Event schemas and API specs between producers and consumers | Each producing team; consumers add expectations | JSON Schema validation in CI; `oasdiff`; consumer expectation tests run against producer schemas |
| Architecture | Layering, context isolation, banned APIs | Platform Team | NetArchTest; BannedApiAnalyzers |
| E2E (system) | Rider and staff journeys across contexts, in the test environment, with simulated validators and the Northgate certification environment | Test & Quality | Playwright (.NET) for portals; Appium for the Rider App; `tapline-tapgen` for validator traffic |
| **Hardware-in-the-loop** | Real Vantor V7/V5 validators, handhelds and a bus router on the APN | Edge Team with Test & Quality | Hardware lab; robot tapper; network impairment box |
| **Processor certification** | Northgate's required test cases | Money Team | Northgate certification environment and test cards |
| Performance/Load | Throughput, latency, surges, soak | Platform Team (SRE) | k6 (APIs); `tapline-tapgen` (taps and uploads at scale) |
| Security | SAST, DAST, dependencies, containers, IaC, penetration tests | Security (CISO's team) with teams | CodeQL, GitHub Advanced Security, OWASP ZAP, Defender for Containers, PSRule; external testers |
| Chaos/Resilience | Failure injection and game days | SRE with owning teams | Azure Chaos Studio; Kubernetes fault injection; manual game days |
| Accessibility | Digital WCAG 2.2 AA; validator physical accessibility | Rider Team; Edge Team | axe-core (via Playwright); manual screen-reader testing; Accessibility Advisory Committee sessions |

## 2. NFR Validation
| NFR | Test Approach | Pass Criteria |
|---|---|---|
| NFR-PERF-01 (decision ≤ 300 ms) | Robot tapper in the lab, 10,000 taps per media type, online and with network cut (TC-HIL-001) | p99 ≤ 300 ms in both conditions |
| NFR-PERF-02 (upload ≤ 30 s) | Lab validators on APN; production SLI | p95 ≤ 30 s |
| NFR-PERF-03 (tap-to-account) | Load tests (TC-PERF-001/002); production SLI | p95 ≤ 60 s; p99 ≤ 5 min at design capacity |
| NFR-PERF-04 (deny list ≤ 15 min) | TC-HIL-003 in the lab; production freshness SLI | p95 ≤ 15 min |
| NFR-PERF-07 (settlement window) | Nightly in test against Northgate certification; TC-CERT-003 | File by 04:00, GL by 06:00, 30 consecutive nights |
| NFR-SCALE-01 (12,000 taps/min) | TC-PERF-003 (stadium surge plus reconnect), TC-PERF-004 (mass reconnect) | No tap lost; backlog cleared ≤ 10 min |
| NFR-AVAIL-03 (72 h offline) | TC-HIL-002: lab validators disconnected 72 h at busy-door tap rates | 50,000 taps held; 100% uploaded and processed ≤ 2 h after reconnection |
| NFR-AVAIL-04 (no lost taps) | Tap count reconciliation (validator-reported vs received) in every test and daily in production | 0 lost |
| NFR-AVAIL-05/07 (RPO 0, region failover) | TC-RES-001 (staging failover drill, quarterly); annual production failover | Ledger replay leaves 0 missing; RTOs met ([DR Plan §6](../08-risk-and-operations/disaster-recovery-plan.md)) |
| NFR-INTEG-01 (correct to the cent, reproducible) | Property-based invariants (§2.7); TC-FARE-006; TC-FIN-006 cap guard; daily reproducibility SLI; independent revenue assurance check (production) | All invariants hold over ≥ 100,000 generated weeks per CI run; 0 charges above cap |
| NFR-SEC-01 (no PANs) | TC-SEC-001 (DLP scans of logs, traces, events, databases in test and staging); QSA assessment | 0 matches |
| NFR-SEC-03/04 (authorization, device auth) | TC-SEC-002 (authorization tests incl. BOLA), TC-SEC-004 (forged and unsigned deny lists, rogue device certificates) | All rejected |
| NFR-USE-01 (WCAG 2.2 AA) | TC-ACC-001–003 | 0 automated violations; 0 open Serious or Critical manual findings |
| NFR-USE-03 (validator feedback) | TC-ACC-004 with the Accessibility Advisory Committee | Committee sign-off |
| NFR-PORT-01 (vendor independence) | Architecture tests: no Vantor or Northgate types outside adapters | 0 violations |

### 2.1 Load / Performance Testing
- **Tooling:**
  - **`tapline-tapgen`:** a .NET load generator that simulates thousands of validators with realistic tap distributions, offline periods and reconnect bursts. It signs taps with test device keys and drives the real Device Gateway.
  - **k6** for the Rider and Back-Office APIs.
  - Results feed Grafana and are archived per run.
- **Scenarios tested:** the quality attribute scenarios in the [NFRs](../01-requirements/non-functional-requirements.md): normal peak, stadium surge with mass reconnect, late-tap storm, new-card burst, 24-hour soak, breaking point. Defined as TC-PERF-001 to 006 (§6).
- **Pass/fail criteria:** as in the NFR table above. Any regression of more than 15% in p95 tap-to-account latency against the last baseline fails the run, even when within the NFR. Results are in [Capacity Planning §1](../08-risk-and-operations/capacity-planning.md).
- **When:**
  - Every phase gate and every change to the Fare Engine, Tap Router, Device Gateway or Journey DB schema.
  - The 24-hour soak monthly.
  - Run in the on-demand **performance** environment ([Deployment Topology §1](../04-infrastructure-and-network/deployment-topology.md)).

### 2.2 Chaos / Resilience Testing
- **Tooling:** Azure Chaos Studio (zone outage, VM and AKS node faults, network latency and blackholes, Key Vault denial); Chaos Mesh in AKS for pod and network faults; manual game days for cross-team scenarios.
- **Failure modes injected:**

| Fault | Where | Expected behavior | TC |
|---|---|---|---|
| Region failover | Staging (quarterly), production (annual) | RTOs met, ledger replay complete | TC-RES-001 |
| Availability zone loss | Staging | No user-visible impact; pods reschedule | TC-RES-002 |
| Event Hubs throttling | Performance | Gateway buffers; validators retain taps; no loss | TC-RES-003 |
| Journey DB failover (in-region) | Staging | Fare Engine pauses ≤ 30 s, resumes from checkpoint; no duplicates | TC-RES-004 |
| Redis loss | Staging | Tap Router falls back to the Account Service; latency rises, no errors | TC-RES-005 |
| Northgate unavailable or slow | Test (certification environment simulator) | Verifications queue; charges deferred; no rider impact | TC-RES-006 |
| Field network outage and mass reconnect | Hardware lab + `tapgen` | Validators store and forward; backlog ≤ 10 min | TC-RES-007 |
| **Clock-change game day** | Staging with controllable clock, then production watch | 25-hour and 23-hour service days rated correctly; cap guard silent; dashboards and runbook exercised | **TC-RES-008** (new in v2.1; run before every DST transition, first on 2028-03-07) |

### 2.3 Security Testing
- **Penetration testing cadence:**
  - External penetration test annually and before each phase go-live (first: 2027-01).
  - Segmentation tests of the card-data zone every 6 months and after any change to firewall rules F5–F9.
  - Validator hardware security review by an independent lab annually, covering V7 physical attacks, debug ports and firmware update path.
- **SAST/DAST tooling:**
  - CodeQL on every pull request.
  - OWASP ZAP baseline scans nightly against the test environment, and full authenticated scans weekly.
  - Spectral rules for API security schemes.
- **Dependency scanning:** Dependabot and GitHub Advanced Security (blocking on High and Critical); container image scanning (Defender for Containers) in CI and at runtime; PSRule for Azure on IaC; Gitleaks and push protection.
- **Card-data tests:** TC-SEC-001 (DLP scans for PANs) and TC-SEC-003 (customer service sees only last 4 and expiry). Quarterly ASV scans of public endpoints (PCI DSS 11.3.2).

### 2.4 Accessibility Testing (if applicable)
- **Automated:** axe-core in every Playwright E2E run, for the Rider Portal and Back-Office (all four languages). Mobile accessibility checks (Android Accessibility Scanner, Xcode Accessibility Inspector) in the app pipeline. A build fails on any violation. (TC-ACC-001)
- **Manual:** before every release with UI change. NVDA and JAWS (Windows), VoiceOver (iOS, macOS), TalkBack (Android); keyboard-only; 200% and 400% zoom; high contrast. (TC-ACC-002)
- **With riders:** Accessibility Advisory Committee testing sessions before each phase go-live, including people who are blind, low-vision, Deaf, or with motor or cognitive disabilities. (TC-ACC-003)
- **Validators:** audio and visual feedback, contrast in direct sunlight, mounting height within ADA reach ranges, tactile cues. Tested in the lab and on a sample of real installations per garage. (TC-ACC-004)
- **Annual WCAG 2.2 AA audit** by an external specialist. The report is evidence for the [Compliance Matrix](../07-governance/compliance-matrix.md). (TC-ACC-005)

### 2.5 Hardware-in-the-Loop (lab)
The hardware lab at Ridgeline garage holds:
- 24 V7 and 6 V5 validators, and 8 handhelds.
- A production bus router on the carrier APN.
- A **robot tapper**: a cartesian arm presenting 40 test cards and phones, with repeatable timing.
- A **network impairment box** (latency, loss, outage) between the validators and the router.
- A GPS simulator, used for clock and time-zone scenarios.

Every production release of validator firmware, Device Gateway or Deny List Service runs the HIL regression suite (TC-HIL-001 to 006) before ring 1, and before production deployment for cloud components that validators talk to.

### 2.6 Processor Certification
Northgate certification runs in the certification environment with Northgate's test cards (every decline code, card brand and wallet) before go-live and after any change to ICD-001 IF-1, IF-2, IF-4 or the P2PE configuration (TC-CERT-001 to 004). Results are signed by Northgate. The production certification was issued on 2027-06-11.

### 2.7 Property-Based Testing of Fare Rules
- **Invariants:** the six invariants in [Coding Standards §6](../06-decisions-and-standards/coding-standards.md), plus, since v2.1:
  - **7.** On a 25-hour or 23-hour service day, daily and weekly totals respect the caps, and every tap belongs to the service day `ServiceDayClock` assigns.
  - **8.** Elapsed transfer windows are measured in instants: two taps 119 minutes apart are one trip even when the wall clock repeats or skips an hour.
- **Generators:**
  - Taps over random weeks, with offline periods, late arrivals, duplicates, multiple media per account, reduced-fare changes mid-week and fare-rule versions changing mid-week.
  - **Since v2.1, times are generated in `America/New_York` (TZDB), with weeks biased (25% of cases) to contain a DST transition between 2027 and 2040.** The fixed-offset zone that hid the incident's defect is no longer used.
- **Volume:** 100,000 generated weeks per CI run; 10 million nightly. Failing seeds are saved as regression cases.

## 3. Test Environments
See [Deployment Topology §1 and §4](../04-infrastructure-and-network/deployment-topology.md) for the environments and their deliberate differences.

| Environment | Tests run there |
|---|---|
| Developer machine / CI | Unit, property-based (100k), architecture, integration (Testcontainers), contract |
| Ephemeral PR environments | Changed services' integration and smoke tests |
| Dev | Nightly property-based (10M); controllable-clock scenarios (DST, service-day boundaries) |
| Test | E2E (simulated validators + Northgate certification), DAST, nightly regression, settlement nights |
| Hardware lab | HIL suite; accessibility of validators; firmware rings 0 |
| Performance (on demand) | TC-PERF-*; TC-RES-003 |
| Staging | Release rehearsal; DR drills; chaos (TC-RES-001/002/004/005); clock-change game day |
| Production | SLIs, synthetic probes, daily reproducibility sample, cap guard, revenue assurance check; annual failover |

## 4. Test Data Strategy
- **Synthetic only outside production.**
  - Synthetic riders and taps are generated from **2025 RiverCard distributions**: taps per rider, route mix, time-of-day profiles, transfer patterns.
  - Generation is deterministic from a seed, so every failure is reproducible.
  - No production personal data is ever copied to a lower environment ([Deployment Topology §1](../04-infrastructure-and-network/deployment-topology.md)).
- **Cards:** Northgate test cards and test wallets only. Media tokens in lower environments come from a test key, so they never collide with production tokens.
- **Time:** dev and test environments use a controllable clock. Every DST transition 2027–2040 is in the scenario library, along with leap days and the 03:00 boundary.
- **Fare rules:** a fixture set of fare rule versions, including mid-week changes and Phase 4 operator tables.
- **Volume:** staging and performance hold production-scale synthetic data: 13 months of journeys, 1.2M accounts.
- **RiverCard migration:** trial migrations use real Castellan extracts **only in the card-data-zone staging area of production**, under Internal Audit supervision. Lower environments use a synthetic RiverCard dataset with the same anomaly rates (2.3% chip vs shadow drift).

## 5. Entry/Exit Criteria
**Per release:**
- **Entry:**
  - Change merged with green CI: unit, property-based, contract, architecture, CodeQL, dependency scan.
  - Deployed to test.
  - Release notes list FRs/NFRs touched.
- **Exit (to production):**
  - E2E regression green.
  - HIL suite green (for edge-facing changes).
  - No open Critical or High defects; Medium defects accepted by the product owner.
  - Performance regression check within 15% (for pipeline changes).
  - Accessibility checks green (for UI changes).
  - CERT re-run if ICD-001 interfaces changed.

**Per phase gate**, in addition:
- Full load and resilience suite.
- Penetration test with no open Critical or High findings.
- Accessibility Advisory Committee sign-off.
- Clock-change game day passed in the last 6 months.
- The gate's success criteria demonstrated from SLO data ([Architecture Compliance Review](architecture-compliance-review.md)).

## 6. Test Case Catalogue
IDs referenced in the FR traceability matrix and elsewhere. Level: U = unit, PB = property-based, I = integration, C = contract, E2E = system, HIL = hardware lab, CERT = Northgate certification, P = performance, R = resilience, S = security, A = accessibility.

### 6.1 Functional
| ID | Test | Level | Traces to |
|---|---|---|---|
| TC-TAP-001 | Accept/deny screen and tones for every media type and deny reason | HIL | FR-TAP-01 |
| TC-TAP-002 | CRT card accepted; cloned card (wrong AES key) denied | HIL | FR-TAP-02, T-10 |
| TC-TAP-003 | App QR accepted; expired, replayed and screenshot QR denied | HIL | FR-TAP-02, T-11 |
| TC-TAP-004 | Decision identical with network disconnected | HIL | FR-TAP-03 |
| TC-TAP-005 | Taps retained until acknowledged; duplicates ignored after re-upload | I, HIL | FR-TAP-04 |
| TC-TAP-006 | Double tap within 10 s shows "already paid", no second tap | HIL | FR-TAP-05 |
| TC-TAP-007 | Deny-list add and remove applied without restart | HIL | FR-TAP-06 |
| TC-TAP-008 | Unknown card accepted offline; added to deny list after decline | E2E | FR-TAP-07 |
| TC-FARE-001 | Bus → rail within 2 h is one trip, one fare | U, PB | FR-FARE-01 |
| TC-FARE-002 | Transfer window boundaries (1:59:59 and 2:00:59) | U | FR-FARE-02 |
| TC-FARE-003 | Tap at 01:45 Saturday belongs to Friday's service day | U | FR-FARE-03 |
| TC-FARE-004 | Tap made before a fare change, uploaded after, rated with old rules | U, I | FR-FARE-04 |
| TC-FARE-005 | Reduced fare applied to every linked medium | U | FR-FARE-05 |
| TC-FARE-006 | Re-rating a service day reproduces charges to the cent | PB | FR-FARE-06 |
| **TC-FARE-007** | **25-hour service day (fall-back):** caps, service days and transfers correct through the repeated hour; first-pass and second-pass taps ordered by instant | U, PB | FR-FARE-03, FR-CAP-01, ADR-0008 |
| **TC-FARE-008** | **23-hour service day (spring-forward):** caps correct; no tap assigned to a non-existent hour; 03:00 boundary unaffected | U, PB | FR-FARE-03, FR-CAP-01, ADR-0008 |
| TC-CAP-001 | Daily cap reached; later taps $0.00 | PB | FR-CAP-01 |
| TC-CAP-002 | Weekly cap reached; resets Monday 03:00 | PB | FR-CAP-02 |
| TC-CAP-003 | Cap counted across linked media in one account | U, I | FR-CAP-03 |
| TC-CAP-004 | Reduced caps for reduced-fare accounts | U | FR-CAP-04 |
| TC-CAP-005 | Unlinked bank card capped on its own | U | FR-CAP-05 |
| TC-CAP-006 | App shows cap progress within latency target | E2E | FR-CAP-06 |
| TC-ACCT-001 | Account creation with one-time code; duplicates rejected | E2E | FR-ACCT-01 |
| TC-ACCT-002 | Link up to 5 media; 6th rejected (`TAPLINE-ACCT-0004`) | E2E | FR-ACCT-02 |
| TC-ACCT-003 | 13-month history and statement totals equal bank charges | E2E | FR-ACCT-03 |
| TC-ACCT-004 | Block lost medium; balance and cap progress kept on replacement | E2E | FR-ACCT-04 |
| TC-ACCT-005 | Linking a card shows its last 90 days of trips | E2E | FR-ACCT-05 |
| TC-ACCT-006 | Retail-issued CRT card usable within 15 min | E2E | FR-ACCT-06 |
| TC-PAY-001 | One combined charge per card per service day | E2E, CERT | FR-PAY-01 |
| TC-PAY-002 | Online top-up $5–$100; balance within 1 min | E2E | FR-PAY-02 |
| TC-PAY-003 | Autoload triggers once per threshold crossing; failure notified | E2E | FR-PAY-03 |
| TC-PAY-004 | CornerPay cash load posted within 15 min | E2E | FR-PAY-04 |
| TC-PAY-005 | Debt payment removes card from deny list | E2E | FR-PAY-05 |
| TC-PAY-006 | First-ride decline creates debt and deny-list entry | E2E, CERT | FR-TAP-07 |
| TC-ELIG-001 | DHS match sets reduced fare same day; no match → manual review | E2E | FR-ELIG-01 |
| TC-ELIG-002 | Document approval; documents purged at 90 days | E2E | FR-ELIG-02 |
| TC-ELIG-003 | Expiry reminder at 30 days; full fare after expiry | E2E | FR-ELIG-03 |
| TC-CS-001 | Search by email, phone, CRT card, last 4 + expiry | E2E | FR-CS-01 |
| TC-CS-002 | Refund over $50 or 4th in 30 days held for second approver | E2E | FR-CS-02, T-17 |
| TC-CS-003 | Rider dispute visible to customer service within 1 min | E2E | FR-CS-03 |
| TC-INSP-001 | Handheld shows paid / not paid, works offline with 5-min sync | HIL | FR-INSP-01 |
| TC-INSP-002 | Handheld shows no personal data | HIL | FR-INSP-02 |
| TC-POL-001 | New fare version takes effect at its time; earlier taps use old version | E2E | FR-POL-01 |
| TC-POL-002 | Unapproved version can't be scheduled | E2E | FR-POL-02, T-18 |
| TC-POL-003 | Simulation report against a past week | E2E | FR-POL-03 |
| TC-POL-004 | Operator isolation of fare rules | E2E | FR-POL-04 |
| TC-FIN-001 | No update or delete path on ledger tables | I | FR-FIN-01 |
| TC-FIN-002 | Daily reconciliation flags any difference | E2E | FR-FIN-02 |
| TC-FIN-003 | GL totals equal ledger totals | E2E | FR-FIN-03 |
| TC-FIN-004 | Liability report equals sum of balances | E2E | FR-FIN-04 |
| TC-FIN-005 | 100 random taps traced from tap to GL | E2E | FR-FIN-05 |
| **TC-FIN-006** | **Pre-charge cap guard** holds any charge above the applicable cap and raises a Sev2 | I, E2E | Postmortem action; Rider Charter |
| TC-PART-001 | Operator shares sum exactly to revenue | U, PB | FR-PART-01 |
| TC-PART-002 | Statement by 08:00, no rider identity | E2E | FR-PART-02 |
| TC-PART-003 | Keel trip counts toward cap | E2E | FR-PART-03 |
| TC-DEV-001 | Offline validator shown within 10 min | HIL | FR-DEV-01 |
| TC-DEV-002 | Ring-limited rollout; halt and roll back | HIL | FR-DEV-02 |
| TC-MIG-001 | RiverCard tap on V7 deducts correct fare from chip; posted through bridge | HIL | FR-MIG-01 |
| TC-MIG-002 | Move my RiverCard: balance to the cent under each balance rule | E2E | FR-MIG-02 |
| TC-MIG-003 | Refund request paid within 30 days | E2E | FR-MIG-03 |
| TC-MIG-004 | Unclaimed-property report totals to remaining liability | E2E | FR-MIG-04 |
| TC-DATA-001 | De-identified reports: no IDs; groups < 10 suppressed | I | FR-DATA-01 |
| TC-DATA-002 | 90-day retention removes trips but keeps financial totals | E2E | FR-DATA-02 |
| TC-DATA-003 | All rider screens in four languages | E2E | FR-DATA-03 |

### 6.2 Hardware lab, certification and non-functional
| ID | Test | Level | Traces to |
|---|---|---|---|
| TC-HIL-001 | Decision time p99 ≤ 300 ms, online and offline, per media type | HIL | NFR-PERF-01 |
| TC-HIL-002 | 72 h offline with 50,000 taps; full upload after reconnection | HIL | NFR-AVAIL-03 |
| TC-HIL-003 | Deny-list propagation ≤ 15 min; gap → full list; bad signature rejected | HIL | NFR-PERF-04, T-05 |
| TC-HIL-004 | Handheld offline sync and inspection | HIL | FR-INSP-01 |
| TC-HIL-005 | Firmware ring rollout and rollback | HIL | FR-DEV-02 |
| TC-HIL-006 | RiverCard profile and bridge end to end | HIL | FR-MIG-01 |
| TC-CERT-001 | Northgate: daily aggregated charges, approvals and declines per brand | CERT | FR-PAY-01, ICD-001 IF-2/3 |
| TC-CERT-002 | Northgate: P2PE verification and tokenization (IF-1) | CERT | ADR-0005 |
| TC-CERT-003 | Northgate: settlement file and reconciliation (IF-6) | CERT | FR-FIN-02 |
| TC-CERT-004 | Northgate: disputes and debt recovery (IF-4, IF-7) | CERT | FR-PAY-05 |
| TC-PERF-001 | Normal peak 1,100 taps/min for 4 h | P | NFR-PERF-03 |
| TC-PERF-002 | Design capacity 12,000 taps/min for 30 min | P | NFR-SCALE-01 |
| TC-PERF-003 | Stadium surge + 120 reconnecting buses | P | NFR-SCALE-01 scenario |
| TC-PERF-004 | Mass reconnect: 1,200 validators × 1,500 taps | P | NFR-SCALE-01 |
| TC-PERF-005 | 24 h soak at 200 taps/s | P | NFR-PERF-03 |
| TC-PERF-006 | Rider API at 400 requests/s (k6) | P | NFR-PERF-05 |
| TC-RES-001 – 008 | Resilience scenarios | R | See §2.2 |
| TC-SEC-001 | DLP scan for card numbers in logs, traces, events, databases | S | NFR-SEC-01 |
| TC-SEC-002 | Authorization tests incl. BOLA on every rider endpoint | S | T-14 |
| TC-SEC-003 | Back office never displays or stores full card numbers | S | FR-CS-01 |
| TC-SEC-004 | Forged deny list, unsigned firmware, rogue device certificate rejected | S, HIL | T-01, T-05, T-09 |
| TC-SEC-005 | Card-data zone segmentation test | S | PCI DSS 11.4.5 |
| TC-ACC-001 | Automated WCAG checks (axe-core, mobile scanners), four languages | A | NFR-USE-01, FR-DATA-03 |
| TC-ACC-002 | Manual screen reader, keyboard, zoom, contrast | A | NFR-USE-01 |
| TC-ACC-003 | Accessibility Advisory Committee sessions | A | NFR-USE-01 |
| TC-ACC-004 | Validator audio/visual feedback, sunlight contrast, reach ranges | A, HIL | FR-TAP-01, NFR-USE-03 |
| TC-ACC-005 | Annual external WCAG 2.2 AA audit | A | Compliance Matrix |
