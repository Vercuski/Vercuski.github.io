const e=`---
title: Architecture Review Board — Minutes, 2026-06-24
status: approved
owner: Dana Okafor (Chief Architect, ARB chair)
version: 1.0.0
last_updated: 2026-07-08
reviewers:
  - Architecture Review Board — minutes approved at the 2026-07-08 meeting
tags:
  - arb
---
# Architecture Review Board — Minutes

| Field | Value |
|---|---|
| Date | 2026-06-24, 14:00–15:45 (extra session) |
| Attendees | **Voting:** Dana Okafor (chair), Priya Raman, Tom Whitaker, Aisha Karimi, Ravi Patel, Sam Ortega, Kofi Mensah. **Advisory:** Diego Alvarez, Hannah Cole, Mei Chen, Elena Brooks. **Invited:** Miguel Serrano (CRO, item 1), Marcus Bell (Bus Operations, item 1), Grace Liu and Linda Park (item 4). **Apologies:** none. |
| Facilitator | Dana Okafor. Secretary: Jamie Ruiz (architecture analyst, Program Office). |

Quorum: 7 of 7 voting members present.

## 1. Agenda
1. **ADR-0004:** Offline-first validators with signed deny lists (decision). Presenter: Diego Alvarez.
2. **EX-001:** Ferry Vantor V5 validators exception (decision). Presenter: Diego Alvarez.
3. **Threat Model v0.9 (edge):** review of findings as input to items 1–2. Presenter: Tom Whitaker.
4. **RFC-001:** Regional fare cap, first reading. Presenters: Linda Park, Grace Liu.
5. Actions from 2026-06-10 and any other business.

## 2. Discussion Notes

**Item 3 (taken first, as input to items 1 and 2): Threat Model v0.9.**
- TW presented 11 edge threats. The two rated highest were a forged deny list (T-05) and spoofed validators (T-01). Both are mitigated if deny lists and taps are signed with HSM-held and secure-element keys respectively.
- TW stated he would veto any design with unsigned deny lists.
- KM asked whether signing changes the deny-list size. DA: signatures add ~1 KB per delta, which is negligible.

**Item 1: ADR-0004.**
- DA presented field measurements from May. Median cellular RTT was 180 ms, but p95 was 1,100 ms, with daily outages of 4–40 minutes on Route 88 and in the Blue Line tunnel. Online authorization would miss the 300 ms target for about 5% of taps and stop fare collection during outages.
- MB confirmed Operations will not accept slower boarding than today's ~900 ms. He also asked that drivers never have to adjudicate a declined tap, and DA confirmed they won't.
- **First-ride risk.** MS asked for the expected loss. HC presented Northgate's peer data: 0.08–0.20% of card fare revenue at comparable agencies. MS agreed to accept up to **0.3%**, measured from the first day of the pilot, with a review at Phase 1 exit.
- RP raised the interaction with re-rating: offline taps arriving late are already handled by the Fare Engine's re-rating design (no new work).
- PR asked about the "online with offline fallback" option. DA: the fallback timeout itself adds ≥ 300 ms on every bad-network tap and produces location-dependent behavior. The ARB agreed this is the worst of both.
- SO asked that deny-list freshness be a first-class SLO with an alert and a runbook before the pilot, not after. Agreed.

**Item 2: EX-001.**
- DA explained the V5 constraints: TLS 1.2 only (Vantor letter of 2026-06-03), no connectivity at sea, and FTA grant implications of early disposal.
- TW was content with TLS 1.2 using AEAD ciphers. His concern was the dedicated listener becoming a downgrade path, and he asked that it be restricted to V5 certificates and ferry terminal source addresses.
- AK asked how stale a vessel's list can get. DA: normally under 90 minutes; worst case about 3 hours if a docking sync fails.
- SO proposed a list-age check before departure.
- MS asked for ferry first-ride losses to be reported separately, so ferry behavior can't hide inside the system average.
- The ARB discussed renewal and agreed it is allowed **once**, only if the refit schedule slips.

**Item 4: RFC-001, regional fare cap.**
- LP presented the partners' case: riders crossing operator boundaries pay two sets of fares and never reach any cap, and the state's 2029 integration incentive favors a regional cap.
- GL noted that each FTA-funded partner would need its own Title VI analysis.
- AK confirmed the domain model can support it. The Rider Fare Week aggregate is already per rider across operators, not per operator, but apportionment of the cap discount is undefined.
- Members agreed the proposal is sound in principle but premature. Partner fare tables aren't in Tapline until Phase 4, the regional fare agreement isn't drafted, and the apportionment rules are a policy decision for the Partner Operator Council before they are an architecture decision.
- PR asked that nothing in Phases 1–3 make a regional cap harder: no per-operator cap state baked into the Rider Fare Week. RP confirmed the current design keeps cap accumulators keyed by rider and fare week only.

**Item 5: Actions from 2026-06-10.**
- The trade-study follow-up (radar update for Event Hubs: Adopt) was done.
- The Northgate ICD draft is on track for August.

## 3. Decisions Made
| Item | Decision | Owner | Follow-up ADR/RFC |
|---|---|---|---|
| ADR-0004 Offline-first validators with signed deny lists | **Accepted** (7–0). First-ride risk accepted by the CRO up to 0.3% of card fare revenue; review at Phase 1 exit | Diego Alvarez | [ADR-0004](../06-decisions-and-standards/adr/0004-offline-first-validators-with-signed-deny-lists.md) |
| Deny lists must be signed with an HSM key; validators must reject unsigned files | **Accepted** as part of ADR-0004 (CISO requirement) | Diego Alvarez, Tom Whitaker | ADR-0004 §3 |
| EX-001 Ferry Vantor V5 validators | **Approved with conditions** (7–0): (1) listener restricted to V5 certificates and ferry terminal addresses; (2) list-age check before departure; (3) ferry first-ride losses reported separately. Expiry 2028-12-15; renewable once | Diego Alvarez | [EX-001](architecture-exception-request.md) |
| Threat Model v0.9 | **Noted**; full-system version due by September | Tom Whitaker | [Threat Model](../05-security/threat-model.md) |
| RFC-001 Regional fare cap | **Deferred** to the Phase 3 design sprint. Preconditions: Partner Operator Council position on apportionment of cap discounts; regional fare agreement draft. Design constraint recorded: no per-operator cap state in the Rider Fare Week | Linda Park, Grace Liu | [RFC-001](rfc-template.md) |

## 4. Action Items
| Action | Owner | Due Date |
|---|---|---|
| Update ADR-0004 to Accepted with the CISO signing requirement and CRO risk acceptance; add to the ADR log | Diego Alvarez | 2026-06-26 |
| Update EX-001 to v1.1 with the three ARB conditions; add to the exception register | Diego Alvarez | 2026-06-26 |
| Define the deny-list freshness SLO and alert; draft the *Deny-list distribution stalled* runbook | Sam Ortega | 2026-08-31 |
| Add first-ride loss reporting (system and ferry separately) to the Revenue Operations dashboard backlog | Hannah Cole | 2026-07-31 |
| Raise ICD-002 requirements with Vantor: signed taps, deny-list format and chaining, V5 profile | Diego Alvarez | 2026-07-15 |
| Record the "no per-operator cap state" constraint in the Domain Model | Ravi Patel | 2026-07-08 |
| Produce the full-system threat model (v1.0) | Tom Whitaker | 2026-09-15 |
| Ask the Partner Operator Council for a position paper on regional cap apportionment | Linda Park | 2026-12-31 |

*Next meeting: 2026-07-08 (regular). Agenda includes ADR-0006 (ledger tables).*
`;export{e as default};
