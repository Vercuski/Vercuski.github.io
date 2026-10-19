const e=`---
title: "ADR-0008: Time Handling: UTC Instants from the Edge, One Source of Service-Day Boundaries"
status: accepted
owner: Ravi Patel (Principal Engineer, Fare Engine)
version: 1.0.0
last_updated: 2027-12-08
reviewers:
  - Architecture Review Board — accepted 2027-12-08
  - Diego Alvarez (Edge Team lead)
  - Hannah Cole (Money Team lead)
  - Grace Liu (Director, Fare Policy & Equity) — confirmed service-day policy for 23- and 25-hour days
tags:
  - adr
---
# ADR-0008: Time Handling: UTC Instants from the Edge, One Source of Service-Day Boundaries

## 1. Status
Accepted

- **Decision date:** 2027-12-08
- **Deciders:** ARB (all voting members), with the Edge and Money team leads
- **Drivers:** [INC-2027-1107-01](../../08-risk-and-operations/incident-postmortem.md); NFR-INTEG-01; Rider Charter cap commitment; risk RSK-19

## 2. Context
On the fall-back night of 2027-11-07, about 2,140 riders were overcharged because of two time-handling defects:
1. The Cap Accumulator computed a service day's end as start + 24 hours. That is wrong on 25-hour (fall-back) and 23-hour (spring-forward) service days.
2. The Device Gateway converted Vantor's local wall-clock tap times, which carry no offset, with \`TimeZoneInfo.ConvertTimeToUtc\`. That call reads ambiguous times as standard time, so first-pass taps were stamped an hour late.

The postmortem found the deeper causes:
- Time-zone logic was implemented in several places.
- An implicit "a day is 24 hours" assumption.
- An edge interface that sent ambiguous data.
- A standard that prescribed an API without explaining its ambiguous-time behavior.

The same March 2027 spring-forward defect had gone unnoticed because it undercharged.

Fare policy also needs explicit rules for odd days, which no document stated:
- On fall-back, the service day is 25 hours, and the repeated hour belongs to it twice.
- On spring-forward, it is 23 hours. The skipped hour 02:00–02:59 doesn't exist, and the 03:00 boundary is unaffected.

## 3. Decision
1. **Instants are the only representation of "when" that crosses any boundary.**
   - Validators send a UTC instant, the UTC offset in effect, and a per-device sequence number (ICD-002 v1.1, Vantor firmware 7.4).
   - Local wall-clock time without an offset is never accepted at any Tapline interface.
   - Until firmware 7.4 is fully deployed, the Device Gateway's ambiguity resolver (interim fix of 2027-11-09) assigns offsets using heartbeat UTC and sequence numbers.
2. **NodaTime for all local-time logic.** \`Instant\`, \`ZonedDateTime\`, \`LocalDate\` and \`DateTimeZone\` (TZDB) replace \`DateTime\`, \`DateTimeOffset\` arithmetic and \`TimeZoneInfo\` conversions in domain and anti-corruption-layer code.
   - Every conversion from local to instant must name its resolver explicitly, e.g. \`Resolvers.StrictResolver\` at interfaces or a documented lenient resolver in policy code. The default resolver is banned by analyzer.
3. **One source of service-day and fare-week boundaries.** \`ServiceDayClock\` is the only component that knows the 03:00 rule. It returns **instant intervals**:
   - \`ServiceDayFor(Instant) → (LocalDate date, Interval bounds)\`
   - \`FareWeekFor(Instant) → (LocalDate weekStart, Interval bounds)\`

   Every other component, including the Cap Accumulator, Settlement Jobs and reports, consumes those intervals. Computing a boundary by adding a duration to another boundary is prohibited.
4. **Fare policy for clock-change days**, confirmed by the Director of Fare Policy:
   - A service day runs from 03:00 local to the next 03:00 local, whatever its length.
   - Caps apply to the whole service day, 23 or 25 hours.
   - The transfer window is measured in elapsed time (instants), not wall-clock time.
5. **Charges are guarded independently.** Settlement Jobs refuse to send any charge above the applicable cap (pre-charge guard, live since 2027-11-24). A separate revenue assurance job recomputes totals with an independent implementation ([postmortem action items](../../08-risk-and-operations/incident-postmortem.md)). Correctness at the point where money leaves CRT no longer depends on the Fare Engine alone.

## 4. Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| **Fix the two defects only** | Smallest change | Leaves the conditions that caused them: several boundary calculations, ambiguous edge data, a misleading standard | Repeats in the next time-dependent feature |
| **Keep \`System.TimeZoneInfo\`, with wrapper helpers** | No new dependency | The BCL types still invite \`DateTime\` arithmetic; ambiguity rules stay implicit; analyzers can't tell good use from bad | Too easy to get wrong again |
| **Store service dates only (no instants) for caps** | Simple model | Transfer windows and ordering need instants anyway; two representations to keep consistent | Doesn't remove the problem |
| **Treat clock-change days as 24 hours by policy** (e.g. end the day at 02:00 on fall-back) | Code simpler | Policy changes riders didn't ask for; cap periods of irregular meaning; Title VI review needed | Changes the rules to fit a bug |
| **Instants from the edge, NodaTime, single boundary source, independent charge guard** (chosen) | Removes ambiguity at the source; one place for the rule; defense in depth for money | Firmware dependency on Vantor; migration of time code; team learning NodaTime | **Chosen** |

## 5. Consequences
**Positive:**
- No ambiguous timestamps enter Tapline once firmware 7.4 is deployed.
- Service-day logic lives in one class, tested with every daylight-saving transition from 2027 to 2040.
- Overcharges are stopped before they reach a card, even if the Fare Engine is wrong.

**Negative:**
- Migration work: about 2 team-sprints for Journey, 1 for Edge, and 0.5 for Money.
- A new library dependency (NodaTime, on the radar as **Adopt** from this ADR).
- Until firmware 7.4 is everywhere (target 2028-03-31), Tapline depends on the interim ambiguity resolver, which uses heartbeat data and sequence numbers.

**Neutral / follow-up work required:**
- [Coding Standards](../coding-standards.md) v2.0 (due 2027-12-15).
- ICD-002 v1.1.
- Tech radar update: NodaTime → Adopt; \`TimeZoneInfo\` conversions in domain code → Hold.
- Test Strategy cases TC-FARE-007 and TC-FARE-008.
- Clock-change watch runbook.

**Reversibility:** Easy to reverse technically, but there is no reason to. The decision removes a class of defects.

## 6. Related
- [Incident Postmortem INC-2027-1107-01](../../08-risk-and-operations/incident-postmortem.md)
- [Component Diagram: Service-Day Clock, Cap Accumulator](../../02-core-architecture/c4-model/component-diagram.md); [Domain Model: service day, fare week](../../02-core-architecture/domain-model.md)
- [Risk Register](../../08-risk-and-operations/risk-register.md) RSK-19
- **Review trigger:** any change to US daylight-saving law. Federal proposals to make daylight time permanent recur; TZDB updates are applied through NodaTime package updates, and the change itself would need a fare policy decision.
`;export{e as default};
