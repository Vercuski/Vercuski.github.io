---
title: Disaster Recovery Plan — Project Tapline
status: approved
owner: Sam Ortega (SRE Lead)
version: 1.0.0
last_updated: 2027-01-22
reviewers:
  - Tom Whitaker (CISO) — approved §4.3 on 2027-01-19
  - Hannah Cole (Money Team lead) — approved ledger procedures 2027-01-19
  - Priya Raman (CIO) — approved 2027-01-20
  - CRT Business Continuity Manager — approved §5 and §7 on 2027-01-21
  - Architecture Review Board — accepted for Phase 1 go-live, 2027-01-13 (draft v0.9); v1.0 after drill
tags:
  - disaster_recovery
---
# Disaster Recovery Plan — Project Tapline

> [!summary] The design does most of the work
> Tapline's first line of defense in any disaster is the edge: **validators keep accepting taps for 72 hours with no cloud at all**, so a disaster in Azure delays fares but doesn't stop boarding or lose revenue. The cloud's job is to get taps flowing and the ledger correct again within the RTOs below. The ledger reaches **RPO 0** by replaying synchronously replicated events, not by trusting asynchronous database replication. The first staging failover drill (2027-01-14) met every objective; its results are in §6.

## 1. Objectives
| Tier | Components | RTO | RPO |
|---|---|---|---|
| **Edge (boarding)** | Validators, handhelds | **0**: unaffected by cloud disasters for 72 h | 0: taps held on device until acknowledged |
| **Tier 0: money of record** | Ledger DB, Settlement Jobs, Payments Service | **1 hour** | **0**, by event replay |
| **Tier 0: tap ingestion** | Device Gateway, `taps` stream | **1 hour** | **0**: synchronous Event Hubs geo-replication, plus validator retention |
| **Tier 1: fare processing** | Tap Router, Fare Engine, Journey DB | **1 hour** | 5 min (derived data; rebuildable from taps) |
| **Tier 2: rider and staff channels** | Rider API, portals, app back end, Back-Office | **1 hour read-only; 4 hours full** | 5 min |
| **Tier 3: analytics and reporting** | Lakehouse, Power BI, apportionment reports | **24 hours** | 24 h (rebuildable from archives) |

## 2. Disaster Scenarios Covered
| Scenario | Likelihood | Response Summary | Plan Reference |
|---|---|---|---|
| Azure region outage (East US 2) | Low | Manual failover to Central US; validators hold taps; ledger replay | §4.1 |
| Availability-zone outage | Medium | Automatic: zone-redundant services continue; no action beyond monitoring | Design ([Deployment Topology](../04-infrastructure-and-network/deployment-topology.md)) |
| Data corruption (bad release, logic defect, operator error) | Medium | Stop the writer; restore or rebuild derived data from taps; correct money with new ledger entries | §4.2 |
| Ransomware or major security incident | Low | Isolate; rebuild from IaC in a clean environment; restore from immutable copies; PCI forensic process | §4.3 |
| Carrier APN or ExpressRoute outage | Medium | Validators store and forward; site-to-site VPN backup for ExpressRoute | §4.4 |
| Northgate outage | Low–Medium | Charges deferred to the next run; verifications queued; boarding unaffected | §4.5 |
| Loss or compromise of the deny-list signing key | Low | Rotate to the pre-staged next key; publish full list; investigate | §4.3 and [Runbook](runbook-template.md) §6.5 |
| CRT data center loss (ERP, RiverCard, DC firewalls) | Low | Field traffic re-homed to the carrier's secondary IPsec endpoint at the DC's backup site; GL posting deferred | §4.4 |

## 3. Backup Strategy
- **What's backed up:**
  - All Azure SQL databases.
  - Raw tap archive and financial archive (ADLS, immutable).
  - Ledger digests.
  - Blob containers for deny lists and configuration.
  - Key Vault and Managed HSM (security domain held by custodians).
  - Infrastructure definitions (Git).
  - Validators: taps on device until acknowledged, then kept 24 hours more as a last-resort replay source.
- **Frequency:**
  - Azure SQL point-in-time restore is continuous (log backups every 5–10 minutes).
  - Weekly long-term backups for Policy DB; yearly for Ledger DB.
  - Archives are written continuously (Event Hubs Capture every 5 minutes).
- **Retention:**
  - Point-in-time restore: 35 days.
  - Long-term backups: Policy DB weekly for 10 years; Ledger DB yearly for 10 years.
  - Archives as in the [Data Architecture §5](../02-core-architecture/data-architecture.md): raw taps 13 months, financial 7 years.
- **Storage location (must differ from primary):**
  - Geo-redundant backup storage in Central US.
  - Archives use GZRS.
  - A third, offline-isolated copy of the financial archive and ledger digests is held in a separate Azure subscription and tenant (the "vault tenant"), managed by CRT Records with no Tapline administrator access.
- **Encryption:** all backups encrypted with customer-managed keys (Managed HSM). Immutability policies on archives can't be shortened, even by subscription owners.

## 4. Recovery Procedures

### 4.1 Scenario: Region Outage
1. **Declare.** The incident commander (SRE on-call) declares a regional disaster when Azure Service Health confirms an East US 2 incident affecting Tapline Tier 0 or 1, **or** Tier 0 has been unavailable for 15 minutes with no recovery estimate. Failover is a **manual decision**, on purpose: a partial outage with automatic failover could split validators between regions. The CIO is informed; no approval wait is required.
2. **Freeze writers in the primary**, if the region is still partly reachable: scale Ledger Service, Settlement Jobs and Fare Engine to 0 in East US 2 (`tapline-ops dr freeze --region eus2`).
3. **Promote data:**
   - Fail over SQL failover groups (Ledger, Account, Policy, Journey) to Central US (forced if needed).
   - Promote the Event Hubs geo-replica namespace to primary.
4. **Scale up Central US:** AKS node pools from 25% to production baseline; resume workers (`tapline-ops dr activate --region cus`).
5. **Re-point validators:** update `device.tapline.internal` to the Central US Device Gateway ILB (TTL 60 s). Validators upload their stored taps; expect a reconnect surge as in [Capacity Planning](capacity-planning.md) (backlog cleared in about 10 minutes).
6. **Ledger replay (RPO 0):** `tapline-ops ledger replay --from "<failover time − 15 min>"`. Re-processes `domain-events` from 15 minutes before failover. Existing transactions are skipped by `source_event_id`, and missing ones are written. Record the count written; it is the measured asynchronous-replication gap.
7. **Front Door:** origins fail over automatically by health probes. Confirm the Rider API is serving from Central US; read-only mode is enabled automatically if Account DB is still failing over.
8. **Verify:**
   - Taps/min back to expected.
   - Tap-to-account latency within SLO.
   - Ledger balances per service day.
   - Settlement can run (if the outage spans 03:00–06:00, run settlement manually when ready; Northgate accepts files until 10:00 by prior agreement).
9. **Communicate** (§7).
10. **Failback** is a planned change after the region is stable for 24 hours, during a weekday daytime window, in reverse order. It is never during the settlement window.

### 4.2 Scenario: Data Corruption
1. **Stop the damage:** identify the writer (bad release, defective logic, script) and stop it. Roll back the release, pause the consumer (`tapline-ops streams pause --group <name>`), or disable the feature flag.
2. **Classify what was corrupted:**
   - **Derived data (Journey DB, read models, deny list):** restore isn't needed. **Rebuild from facts.** Re-rate the affected rider weeks from taps in the Journey DB, or from the raw tap archive if the tap copies themselves are suspect: `tapline-ops journey rerate --since <time> --scope <filter>`. Re-rating emits `FareAdjusted` events, so money corrections flow into the ledger automatically.
   - **Account data:** point-in-time restore to a **new** database at a time before the corruption, then reconcile and copy back the affected rows with a reviewed script (two-person).
   - **Ledger:** never restored over, and never edited. It is append-only. Wrong entries are corrected with compensating transactions generated from re-rating or a reviewed adjustment batch. Run ledger verification (`tapline-ops ledger verify`) to prove the existing history is intact.
   - **Fare rules:** versions are immutable. A wrong version is superseded by a corrected one with an effective time, and affected periods are re-rated.
3. **Assess riders affected** (refunds and notifications, per the Rider Charter) and run the postmortem process.

### 4.3 Scenario: Ransomware / Security Incident
1. **Engage the CISO immediately.** CRT's incident response plan and the Tapline annex take over, and the CISO is the incident lead.
2. **Contain:**
   - Isolate the affected zone: firewall deny-all on spoke egress; revoke workload identities; disable compromised accounts.
   - If the card-data zone is involved, preserve evidence and start the **PCI forensic investigator** process with Northgate and the card brands, as the agreement requires.
3. **Keep boarding going:** validators are unaffected unless the deny-list signing or device CA keys are suspected.
   - If deny-list signing is suspect, rotate to the pre-staged next key (the trust store already holds it) and publish a full list.
   - If the device CA is suspect, stop new provisioning. The validators' existing certificates remain valid unless revoked.
4. **Rebuild clean:**
   - Deploy a fresh environment from `tapline-infra` at a known-good commit, into the Central US standby subscriptions or a new subscription.
   - Restore databases from backups taken **before** the compromise.
   - Verify the ledger against the digests in the vault tenant; any mismatch shows exactly which entries were altered.
5. **Replay:** re-ingest taps from the raw tap archive and validator-retained taps, and re-rate. Money is corrected through the ledger.
6. **Restore service in stages:** ingestion first, then fares, then channels. Rotate all secrets and keys before reconnecting external parties.

### 4.4 Field connectivity loss (APN, ExpressRoute, CRT data center)
- **APN outage:** nothing to fail over; validators store and forward. Monitor the *Validators offline* view; after reconnection, expect a mass reconnect (§4.1 step 5 behavior).
- **ExpressRoute loss:** the site-to-site VPN takes over automatically (BGP). Bulk transfers (RiverCard extracts, GL posting) are paused if bandwidth is constrained.
- **CRT data center loss:** the carrier re-routes APN tunnels to CRT's backup site, which has its own ExpressRoute circuit. GL posting is deferred until the ERP is back. The ledger holds everything.

### 4.5 Northgate outage
- **Verifications** queue for up to 24 hours (ICD-001). **Charges:** if the 04:00 file can't be sent, the next night's run includes both days, with separate charge IDs per service date.
- **Top-ups:** the app shows "temporarily unavailable"; autoloads retry.
- No rider loses access; validators are unaffected.

## 5. Roles & Responsibilities During an Incident
| Role | Responsibility |
|---|---|
| **Incident Commander** (SRE on-call lead; Sam Ortega as backup) | Declares the disaster, runs the bridge, makes the failover call, keeps the timeline |
| **Operations Lead** (owning team on-call) | Executes procedures; reports progress to the IC every 15 minutes |
| **Security Lead** (CISO or delegate) | Leads the response in any security scenario; PCI forensic coordination |
| **Business Lead** (Revenue Operations manager) | Revenue and settlement decisions; liaison with Northgate Merchant Support |
| **Communications Lead** (CRT Communications) | Rider-facing and media messages; Board notification with the CIO |
| **Customer Service Lead** | Scripts for agents; refund handling under the Rider Charter |
| **Scribe** | Timeline and decisions log for the postmortem |
| **Vendor contacts** | Northgate P1; Vantor P1; Microsoft Unified Support (Severity A) |

## 6. Testing Schedule
> A DR plan that's never been tested is a hypothesis, not a plan.

- **Last tested:**
  - **2027-01-14:** partial failover drill in **staging** (East US 2 → Central US), with simulated validators plus 6 hardware-lab V7s re-pointed by DNS.
  - **2026-12-03:** tabletop exercise (ransomware in the main zone), with the CISO, CIO and Communications.

  **Results of the 2027-01-14 drill**

  | Measure | Target | Result |
  |---|---|---|
  | Tap ingestion restored | ≤ 1 h | 31 min |
  | Ledger writable | ≤ 1 h | 38 min |
  | Ledger replay | 0 missing after replay | 1,412 transactions written by replay (the asynchronous gap); 0 missing after; verification passed |
  | Rider API read-only / full | ≤ 1 h / ≤ 4 h | 22 min / 1 h 55 min |
  | Validator backlog cleared | ≤ 15 min after DNS change | 9 min |
  | **Findings** | | (1) The DNS TTL on one CRT resolver was overridden to 1 h; fixed by CRT Network Operations. (2) The runbook step to freeze writers was missing for Settlement Jobs; added. |

- **Next scheduled test:**
  - **Quarterly** staging failover: 2027-04-15, 2027-07-15, 2027-10-14.
  - **Annual production failover** during a planned low-traffic window: target 2027-09, before the Phase 2 rollout reaches the full fleet.
  - Data-corruption **game day** (re-rate from archive) in 2027-05.
- **Test type:**
  - Staging: **partial failover** (Tier 0–2).
  - Production: **full failover** with real validators (annual).
  - Security: **tabletop** twice a year.

## 7. Communication Plan
| Audience | Channel | Owner |
|---|---|---|
| Internal engineering | PagerDuty incident + Teams bridge `#tapline-incident`; status every 15 min | Incident Commander |
| CRT leadership (CIO, CRO, CEO) | Phone for Sev1 within 15 min; email summary hourly | Incident Commander → CIO |
| Riders | CRT status page and app banner within 30 min of a Sev1 affecting riders; social media; four languages | Communications Lead |
| Operators and drivers | Operations radio bulletin; supervisor notice ("taps are being accepted normally") | Bus and Rail Operations duty manager |
| Partner operators (Phase 4) | Email to the Partner Operator Council contacts; statement delays notified by 08:00 | Business Lead |
| Northgate, Vantor | P1 lines per ICD | Operations Lead |
| CRT Board | Written notice after any Sev1 within 24 h | CIO |
| Regulators and card brands (security incidents) | Per legal and PCI obligations | CISO with General Counsel |
