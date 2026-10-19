const e=`---
title: "Incident Postmortem: Fall-Back Night Overcharges (INC-2027-1107-01)"
status: approved
owner: Ravi Patel (Principal Engineer, Fare Engine)
version: 1.0.0
last_updated: 2027-11-19
reviewers:
  - Sam Ortega (SRE Lead, incident commander) — co-author
  - Hannah Cole (Money Team lead) — co-author
  - Diego Alvarez (Edge Team lead) — co-author
  - Miguel Serrano (Chief Revenue Officer) — reviewed 2027-11-18
  - Architecture Review Board — reviewed 2027-11-24; action items endorsed
tags:
  - incident_postmortem
---
# Incident Postmortem — Fall-Back Night Overcharges

> [!info] Blameless
> Everyone involved made reasonable decisions with what they knew at the time. Every design choice that contributed to this incident was reviewed and approved through normal governance. That is the point: the system, including its documents, tests and reviews, allowed this to happen, and that's what we are fixing.

| Field | Value |
|---|---|
| Incident ID | INC-2027-1107-01 |
| Date / Time (start) | 2027-11-07 01:00 EDT (05:00 UTC): first pass of the repeated hour |
| Date / Time (resolved) | 2027-11-12 16:00 EST (21:00 UTC): last refund settled |
| Duration | 5 days 16 hours (overcharging itself: 2027-11-07 01:00 EDT to 02:59 EST; detection lag 7 h 20 min) |
| Severity | **Sev2**: a Rider Charter breach (zero error budget) |
| Author | Ravi Patel, with Sam Ortega, Hannah Cole, Diego Alvarez |
| Status | Final |

## 1. Summary
When clocks went back at 02:00 EDT on Sunday 7 November 2027, two separate time-handling defects caused about **2,140 riders to be overcharged a total of $3,873** for travel on Saturday's service day.

1. **The daily cap reset an hour early.** The Fare Engine's Cap Accumulator assumed every service day lasts 24 hours. Saturday's lasted 25, so for taps between 02:00 and 02:59 EST the daily cap started again while the taps were still billed to Saturday. Riders who had already reached Saturday's $5.00 cap were charged again.
2. **Taps in the first pass of the repeated hour were stamped an hour late.** Validators report local time without an offset, and the Device Gateway's conversion treated the ambiguous 01:00–01:59 times as standard time. Some riders lost a free transfer as a result.

The overcharges went out in the 03:15 charge run, were reported by riders from 07:50, and were declared a Sev2 at 10:18. The cap defect was fixed before it could cause a weekly-cap overcharge on Monday morning. All riders were refunded automatically, with the $5 Rider Charter credit, by 12 November.

## 2. Impact
| Area | Impact |
|---|---|
| Users affected | **2,140 riders**: 1,964 charged again after reaching the daily cap (defect 1); 187 lost a free transfer (defect 2); 11 affected by both. About 22% were reduced-fare riders. Mostly late-night riders: a stadium concert (ended 23:30) and CSU homecoming, plus hospital and airport night-shift workers. |
| Services affected | Fare Engine (cap calculation), Device Gateway (tap time conversion), Settlement Jobs (charged the incorrect amounts), Rider App (showed charges above cap) |
| Data affected | 1,388 taps with incorrect UTC instants (since corrected by \`TapTimeCorrected\` facts; the original taps are unchanged, per [P4](../06-decisions-and-standards/architecture-principles.md)); 2,140 rider weeks re-rated; 2,151 adjustment ledger transactions |
| Revenue / SLA impact | **$3,873 overcharged and refunded**, plus **$10,700** in Rider Charter credits ($5 × 2,140). Rider Charter cap commitment breached (zero-budget SLO). No other SLO breached. |
| External communication issued? | **Y.** Status page and app banner (2027-11-07 12:30), rider emails in four languages (2027-11-11), statement to local media (2027-11-08), report to the CRT Board (2027-11-17). |

## 3. Timeline
All times **local** (EDT until 02:00 on 7 November, EST afterwards), with UTC in brackets for the overnight period.

| Time | Event |
|---|---|
| Sat 2027-11-06 03:00 EDT (07:00Z) | Saturday's service day begins. Because of the clock change it will last 25 hours, ending Sunday 02:59 EST. |
| Sun 01:00–01:59 EDT (05:00–05:59Z) | **Incident begins.** First pass of the repeated hour. 1,388 taps from 612 validators are stamped by the Device Gateway as if EST: 06:00–06:59Z, one hour late. |
| Sun 02:00 EDT → 01:00 EST (06:00Z) | Clocks go back. Second pass of 01:00–01:59 (EST). |
| Sun 02:00 EST (07:00Z) | Cap Accumulator's computed end of Saturday's service day (start + 24 h). Taps from now until 02:59 EST start a new daily cap window but keep Saturday's service date. **Overcharging begins.** |
| 02:59 EST | Service day closes. |
| 03:15 | Nightly charge build includes 2,151 inflated charges. |
| 03:52 | Charge file sent to Northgate (on time). |
| 04:41 | Results received; all charges approved. Riders begin to see pending charges. |
| 07:50 | **Detected (external):** first social media post: "Tapline charged me $7 on a $5 cap day". |
| 08:35 | Customer service call volume 4× normal for a Sunday; agents see charges above $5.00 in the back office. |
| 09:20 | Customer Service supervisor opens a Sev3: "charges above daily cap". |
| 10:05 | Money on-call confirms 41 sampled charges exceed the daily cap. |
| 10:18 | **Escalated to Sev2** (Rider Charter breach). Incident commander: Sam Ortega. Bridge opened. |
| 10:40 | Query finds 1,964 charges above the cap. Every one includes taps between 02:00 and 02:59 EST. The clock change becomes the working hypothesis. |
| 11:25 | **Root cause 1 identified:** the Journey on-call reproduces the defect with a property test using \`America/New_York\` instead of the fixed-offset test zone. \`CapAccumulator\` computes the window end as \`start + TimeSpan.FromDays(1)\`. |
| 12:10 | **Mitigation:** "hold charge build" flag set for Sunday's service day, so no new charges go out until the fix is verified. Customer service script published. |
| 12:30 | Status page and app banner: "Some riders were charged more than the daily cap for Saturday. You'll be refunded automatically." |
| 13:45 | **Root cause 2 identified:** while validating the fix, the Edge on-call finds 1,388 taps whose \`tapped_at_utc\` differs from the validator's GPS-based heartbeat time by exactly 3,600 s, all from the first 01:00–01:59 pass. The Device Gateway conversion treats ambiguous times as standard time. |
| 16:30 | Fix for defect 1 built and verified. Window boundaries now come from \`ServiceDayClock\`. Property tests run with DST zones and all transitions 2027–2040. |
| 22:40 | **Emergency change** approved by the CAB and deployed. This was 3 h 20 min before Monday 02:00 EST, when the same defect would have reset the **weekly** cap an hour early. |
| Mon 2027-11-08 03:15 | Sunday's charges built with the fix; held for review. |
| 08:05 | Sunday's charges reviewed (0 above cap) and released. Northgate accepted the late file under the ICD's agreed exception (until 10:00). |
| Tue 2027-11-09 14:00 | Interim fix for defect 2 deployed: the Device Gateway resolves ambiguous local times using the validator's heartbeat UTC offset and tap sequence numbers. 1,388 \`TapTimeCorrected\` facts published. |
| Wed 2027-11-10 | 2,140 rider weeks re-rated with corrected times and the fixed cap logic. Overcharges of $3,873 identified, matching the analysis to the cent. |
| Thu 2027-11-11 | Refunds issued through ICD-001 IF-4. $5 credits posted. Rider emails sent in four languages. |
| Fri 2027-11-12 16:00 | Last refund settled. **Incident resolved.** |
| 2027-11-19 | Postmortem completed (this document). |

## 4. Root Cause Analysis

**Proximate cause:**
1. \`CapAccumulator\` computed a service day's end as its start plus 24 hours, which is wrong on 25- and 23-hour days.
2. Separately, the Device Gateway converted Vantor's ambiguous local tap times with \`TimeZoneInfo.ConvertTimeToUtc\`, which interprets an ambiguous time as standard time.

**5 Whys** (for defect 1, which caused 92% of the impact):
1. **Why were riders charged above the daily cap?** Taps from 02:00 to 02:59 EST were counted toward a new daily cap window while still billed to Saturday's service day.
2. **Why a new window?** The Cap Accumulator calculated the end of the service day itself (start + 24 h), instead of asking the \`ServiceDayClock\` for the next service day's start.
3. **Why did it calculate its own boundary?** In March 2027, during the pilot, a performance change replaced per-tap \`ServiceDayClock\` calls with precomputed UTC window boundaries. The review focused on performance. The [Coding Standards](../06-decisions-and-standards/coding-standards.md) rule "service days are calculated only by \`ServiceDayClock\`" was read as covering service *dates*, not window *boundaries*.
4. **Why didn't tests catch it?**
   - The property-based generators used a fixed-offset time zone (UTC−5) to keep runs fast and deterministic, so no daylight-saving transition was ever generated.
   - The controllable clock in dev ([Deployment Topology §4](../04-infrastructure-and-network/deployment-topology.md)) existed, but no daylight-saving scenario had been written.
   - Invariant 6 tested the 03:00 boundary only on ordinary days.
   - The **spring-forward** change on 2027-03-14, during the pilot, triggered the same defect in reverse. It produced a $214 *undercharge* that no check flagged.
5. **Why did nothing stop an overcharge before it reached riders' cards?** The Rider Charter promise ("you'll never pay more than the cap") had no automated control at the point where money leaves CRT. It was assumed to follow from the Fare Engine's invariants. Those invariants held inside the engine's own model of time, which was wrong, and reconciliation compares charges with Northgate's settlement, not with the fare rules.

**Root cause:** time-zone-dependent business rules (service day, fare week) were implemented in more than one place under an implicit assumption that a day is 24 hours. And the most important promise CRT makes to riders was not independently enforced before charging.

**Defect 2 chain** (8% of impact):
1. ICD-002 (November 2026) accepted Vantor's tap format of local wall-clock time plus a time-zone name, with no UTC offset, because the firmware stores local time for receipts.
2. The Device Gateway's anti-corruption layer converted it as the Coding Standards prescribed (\`TimeZoneInfo.ConvertTimeToUtc\`).
3. Nobody asked what that call does with the repeated hour, even though the conversion was documented in the [Data Architecture data dictionary](../02-core-architecture/data-architecture.md).
4. The ICD review included the Edge and Security teams, but not the Journey Team, which owns the meaning of tap times.

## 5. Contributing Factors
- **Amplified by the date.** The fall-back night coincided with a stadium concert and CSU homecoming, producing about 3× the usual late-night ridership. Many of those riders had already reached the cap.
- **A silent warning was missed.** The March 2027 spring-forward undercharge was invisible because nobody complains about being undercharged and no check compared charges with fare rules.
- **Charges leave 15 minutes after the day closes.** The nightly chain (03:15 build, 04:00 file) leaves no window for a sanity check by a person or a machine.
- **The coding standard prescribed an API whose ambiguous-time behavior is surprising** and wasn't mentioned in the standard.
- **Phase 2 rollout pressure.** Garage waves were running on schedule, and no daylight-saving readiness review had been planned for the first fall-back with live riders (the pilot was in spring).
- **Two teams each held half the knowledge.** The Edge Team knew Vantor sends local time; the Journey Team knew service days span midnight and clock changes. The design reviews never put the two facts together.

## 6. Detection & Response Assessment
| Question | Answer |
|---|---|
| Did monitoring/alerting catch this? If not, why not? | **No.** Riders and customer service detected it 3 h 9 min after charges were approved. No alert checks charges against caps. Fare reproducibility (the daily sample) passed, because re-rating with the same defective logic reproduces the same wrong answer. The SLO measured determinism, not correctness. |
| Was the correct runbook available and followed? | No runbook existed for "charges above cap" or for clock changes. The incident process and the DR plan's data-corruption procedure ([DR Plan §4.2](disaster-recovery-plan.md)) were used and worked well: stop the writer, re-rate from facts, correct with ledger entries. |
| Was escalation timely? | Mostly. Customer Service took 45 minutes to open a ticket and the Sev3 → Sev2 escalation took another 58 minutes. Once declared, the bridge had both root causes in 3.5 hours. |
| What slowed down diagnosis or mitigation? | Two independent defects with overlapping symptoms. Defect 2 was found only because the Edge on-call compared tap times with heartbeat GPS times while validating the fix for defect 1. A "hold charges" capability existed only as a feature flag that needed a deployment-free but manual change; there was no documented trigger for using it. |

## 7. What Went Well / What Went Poorly
**Went well:**
- Principle P4 (taps are facts) paid off. Correcting times with \`TapTimeCorrected\` facts and re-rating gave refunds exactly right to the cent, with a complete audit trail. Nothing was edited.
- The append-only ledger made the correction transparent: Revenue Operations could show auditors every original and adjusting entry.
- The emergency change was built, tested and deployed in 11 hours, before the weekly cap could reset early.
- Customer Service and Communications had a script and a status-page message out within 2.5 hours of escalation, in four languages by the next business day.
- Northgate's late-file exception, agreed in the ICD, let us hold Sunday's charges for review without losing revenue.

**Went poorly:**
- Riders found the problem before we did.
- The Rider Charter's central promise had no automated safeguard.
- A design document (Data Architecture) and a standard (Coding Standards) both described the time conversion, and no review caught the ambiguity.
- The spring-forward signal was available for eight months and unseen.

**Where we got lucky:**
- **The weekly cap.** Had the fix been 3½ hours later, the weekly cap would have reset an hour early on Monday morning and overcharged more riders.
- **Only about 35% of CRT's fleet was on Tapline** (Phase 2 garage waves 1–2, Blue and Gold lines). After full rollout the same night would have affected about 3× as many riders.
- **The fall-back error overcharged.** A defect that undercharges is rarely noticed, as March showed. This one was found because it hurt riders.
- **Defect 2 was found by chance.** It would have recurred every fall-back night.

## 8. Action Items
| Action | Type (Prevent/Detect/Mitigate) | Owner | Due Date | Status |
|---|---|---|---|---|
| **Pre-charge cap guard:** Settlement Jobs refuse to send any charge whose amount exceeds the applicable cap for the days it covers; affected charges are held, and a Sev2 alert fires | Prevent | Hannah Cole | 2027-11-26 | **Done** (2027-11-24) |
| **ADR-0008:** time handling. Edge sends UTC instant + offset; NodaTime for all local-time logic; service-day and fare-week boundaries only from \`ServiceDayClock\` as instant intervals; explicit rules for ambiguous and skipped times | Prevent | Ravi Patel | 2027-12-08 (ARB) | Proposed |
| **Coding Standards v2.0** adopting ADR-0008: ban \`TimeZoneInfo.ConvertTimeToUtc\`, \`TimeSpan.FromDays(1)\` arithmetic on instants, and \`DateTime\` in domain code (BannedApiAnalyzers); boundary rule made explicit | Prevent | Ravi Patel | 2027-12-15 | Open |
| **DST property tests:** generators use \`America/New_York\` and every transition 2027–2040; explicit 23- and 25-hour service-day scenarios (TC-FARE-007, TC-FARE-008); added to the [Test Strategy](../10-testing-and-validation/test-strategy.md) | Prevent | Ravi Patel | 2027-12-01 | **Done** (2027-11-29) |
| **ICD-002 v1.1:** Vantor firmware 7.4 sends UTC instant, offset and sequence number; rollout through rings | Prevent | Diego Alvarez | 2028-03-31 | In progress (Vantor committed 2027-11-16) |
| **ICD review checklist:** every time field must specify instant, offset and zone semantics; the owning domain team must review | Prevent | Aisha Karimi | 2027-12-15 | Open |
| **Independent revenue assurance check:** a separate, simple implementation recomputes every charged token's daily and weekly totals from taps and compares them with charges (N-version check), daily, for under- and over-charges | Detect | Hannah Cole | 2028-01-31 | Open |
| **Fare correctness SLO:** add "charges within caps" (from the guard and the assurance check) alongside reproducibility in the [SLO definitions](sla-slo-sli-definitions.md) | Detect | Sam Ortega | 2027-12-15 | Open |
| **Clock-change watch:** runbook and game day before every DST transition. Journey and Money on-call awake 00:30–04:00; dashboards for 25/23-hour days; charge hold pre-set for manual release | Mitigate | Sam Ortega | 2028-03-01 (before 2028-03-12) | Open |
| **"Hold charges" as a documented control,** with its own runbook and a clear trigger, not just a flag | Mitigate | Hannah Cole | 2027-12-15 | Open |
| **\`TapTimeCorrected\` formalized:** event schema, tooling and audit report (used ad hoc in this incident) | Mitigate | Ravi Patel | 2028-01-15 | Open |
| **Retrospective for 2027-03-14:** quantify and record the spring-forward undercharge ($214, 141 riders; written off, no rider action) | Detect | Hannah Cole | 2027-11-30 | **Done** (2027-11-22) |
| **Risk register:** add time-dependent fare rules as a tracked risk | Prevent | Elena Brooks | 2027-11-24 | **Done** (RSK-19) |
| **Architecture compliance review:** add a time-handling check to the Gate 2 review | Prevent | Dana Okafor | Gate 2 (2028-06) | Open |
| Rider refunds and Rider Charter credits | Mitigate | Hannah Cole | 2027-11-12 | **Done** |

## 9. Related
- Runbook(s) invoked: none existed for this scenario. Procedures followed: [DR Plan §4.2](disaster-recovery-plan.md) (data corruption). New runbooks: *Clock-change watch*, *Hold charges*. The existing [deny-list runbook](runbook-template.md) shows the format.
- Related incidents: 2027-03-14 spring-forward undercharge (identified retrospectively by this postmortem; not previously recorded).
- Related ADRs / risk register entries: [ADR-0008](../06-decisions-and-standards/adr/0008-time-handling-utc-instants-and-service-day-boundaries.md) (proposed); [Risk Register](risk-register.md) RSK-19; [Coding Standards](../06-decisions-and-standards/coding-standards.md) §1 item 8 and §6 invariant 6; [Component Diagram](../02-core-architecture/c4-model/component-diagram.md) (Cap Accumulator, Service-Day Clock).
`;export{e as default};
