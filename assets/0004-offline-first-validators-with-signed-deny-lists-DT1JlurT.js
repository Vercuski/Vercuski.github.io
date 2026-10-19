const e=`---
title: "ADR-0004: Offline-First Validators with Signed Deny Lists"
status: accepted
owner: Diego Alvarez (Edge Team lead)
version: 1.0.0
last_updated: 2026-06-24
reviewers:
  - Architecture Review Board — accepted 2026-06-24 (see ARB minutes)
  - Tom Whitaker (CISO)
  - Miguel Serrano (Chief Revenue Officer) — accepted first-ride risk (residual risk R-1)
  - Marcus Bell (Director, Bus Operations)
tags:
  - adr
---
# ADR-0004: Offline-First Validators with Signed Deny Lists

## 1. Status
Accepted

- **Decision date:** 2026-06-24
- **Deciders:** Architecture Review Board, with the CRO accepting the revenue risk
- **Drivers:** NFR-PERF-01 (≤ 300 ms), NFR-AVAIL-03 (72 h offline), BR-07, BR-08, threats T-05, T-06, T-12

## 2. Context
Under the account-based model ([ADR-0002](0002-account-based-fare-model.md)), the validator does not calculate fares, but it must still decide **accept or deny** at the door. Field measurements in May 2026 (Route 12, Blue Line tunnel, rural Route 88) showed:
- Cellular round-trip time to Azure: median 180 ms, p95 1,100 ms, with outages of 4–40 minutes daily on rural routes and in the Blue Line tunnel.
- Boarding time is the largest factor in bus running times. Operations will not accept anything slower than today's ~900 ms.
- A multi-hour carrier outage occurred twice in 2025.

A decision that depends on the network at the moment of the tap would fail the 300 ms target for at least 5% of taps and stop fare collection during outages.

## 3. Decision
We will make validators **offline-first**:
1. **Local decision:** a validator decides accept or deny using only the medium's own checks (EMV offline data authentication; CRT card AES authentication; app QR signature) and its **local deny list**. It never calls the back office during a tap.
2. **Signed deny lists:** the Deny List Service publishes a signed **full list nightly** and **signed deltas every 5 minutes**. Signatures come from an HSM key. Versions are chained, so a validator applies deltas strictly in order and falls back to the full list on a gap. Unsigned or wrongly signed files are rejected and raise a fault.
3. **Store-and-forward:** every tap is signed by the device key and stored on the validator until the Device Gateway confirms a durable write. Capacity is at least 50,000 taps (72 h on the busiest validator).
4. **First-ride risk accepted:** a bank card never seen before is accepted if it passes its own checks. If its later charge is declined, its token joins the deny list until the debt is paid.
5. **Deny-list staleness is monitored:** validators report their list version in every heartbeat, and an alert fires when distribution is more than 20 minutes behind.

## 4. Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| **Online authorization per tap** (validator asks the cloud) | No first-ride risk; always-current status | Fails 300 ms for ~5% of taps; no fare collection during outages; puts the back office on the critical path for 320k boardings a day | Fails NFR-PERF-01 and BR-08 |
| **Online with offline fallback** (try online, accept offline after a timeout) | Fresh status when the network is good | The timeout itself adds latency (≥ 300 ms) on every bad-network tap; two code paths; behavior varies by location | Worst of both: slower than offline-first and still has first-ride risk |
| **Allow list** instead of deny list (validators only accept known tokens) | Stronger control | Breaks "tap any card without registering" (BR-01); an allow list of every valid card is unbounded | Fails BR-01 |
| **Unsigned deny lists over the private APN** | Simpler | One compromised distribution point could unblock or block cards fleet-wide (T-05) | Rejected by the CISO |
| **Offline-first with signed deny lists** (chosen) | Fast, consistent behavior everywhere; collection continues through outages | First-ride risk; blocked cards work for up to one distribution cycle (or longer offline) | **Chosen** |

## 5. Consequences
**Positive:**
- Boarding is equally fast in a tunnel, on a rural route and at a downtown station.
- Fare collection survives cloud, carrier and region outages for up to 72 hours.
- The back office is off the critical path for boarding, which lowers the availability bar for cloud services.

**Negative:**
- **First-ride risk.** Accepted by the CRO up to 0.3% of card fare revenue ([Threat Model R-1](../../05-security/threat-model.md)). It must be measured from day one of the pilot.
- **Blocked media keep working briefly:** up to ~15 minutes when connected, and up to 72 hours offline ([Threat Model R-2](../../05-security/threat-model.md)).
- Deny-list distribution becomes an operational service with its own SLO, alert and runbook.
- Validator storage, signing and upload logic is critical and lives in Vantor firmware ([Threat Model R-4](../../05-security/threat-model.md)).

**Neutral / follow-up work required:**
- Runbook *Deny-list distribution stalled* (SRE, before Phase 1).
- ICD-002 with Vantor to fix tap format, signing and upload behavior.
- The ferry's older Vantor V5 validators can only receive lists at dock. This is handled by an [exception request](../../07-governance/architecture-exception-request.md), approved at the same ARB.

**Reversibility:** Costly. Moving to online authorization would need new firmware, a new SLO for the cloud path, and renegotiated risk with Northgate.

## 6. Related
- [ARB minutes, 2026-06-24](../../07-governance/arb-minutes-template.md)
- [Threat Model](../../05-security/threat-model.md) (v0.9 was the input to this decision)
- [Sequence Diagrams §2, §4](../../02-core-architecture/sequence-diagrams.md)
- **Review trigger:** Phase 1 exit, if first-ride losses exceed 0.3% of card fare revenue or deny-list p95 propagation exceeds 15 minutes.
`;export{e as default};
