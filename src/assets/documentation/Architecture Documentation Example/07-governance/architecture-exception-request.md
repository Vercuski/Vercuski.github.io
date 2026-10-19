---
title: "Architecture Exception Request: EX-001 Ferry Vantor V5 Validators"
status: approved
owner: Diego Alvarez (Edge Team lead)
version: 1.1.0
last_updated: 2026-06-26
reviewers:
  - Tom Whitaker (CISO) — standard owner (security); approved with conditions 2026-06-24
  - Dana Okafor (Chief Architect) — standard owner (NFRs); approved 2026-06-24
  - Architecture Review Board — approved with conditions 2026-06-24
tags:
  - exception_request
  - governance
---
# Architecture Exception Request — EX-001 Ferry Vantor V5 Validators

| Field | Value |
|---|---|
| Requesting Team | Edge Team |
| Requested By | Diego Alvarez, Edge Team lead |
| Date | 2026-06-12 (v1.0 submitted) · 2026-06-26 (v1.1, ARB conditions added) |
| Status | **Approved with conditions** (ARB, 2026-06-24) |
| Standard Being Excepted | Edge connectivity standard: Security Architecture §6 (TLS 1.3 for field devices), [NFR-PERF-02](../01-requirements/non-functional-requirements.md) (tap upload ≤ 30 s), [NFR-PERF-04](../01-requirements/non-functional-requirements.md) (deny-list propagation ≤ 15 min) |
| Expiry / Review Date | **2028-12-15** (V5 replacement during vessel refits). Reviewed quarterly. |

## 1. Standard Being Excepted
Three rules that together form the edge connectivity standard for validators:
1. **Field devices connect to the Device Gateway with TLS 1.3 only.** This is the Device Gateway's listener policy, from the [Security Architecture §6](../05-security/security-architecture.md): "TLS 1.2 minimum, TLS 1.3 preferred", and TLS 1.3 is mandatory for new field devices.
2. **NFR-PERF-02:** taps reach the cloud within 30 s (p95) while the validator is connected.
3. **NFR-PERF-04:** deny-list changes reach every connected validator within 15 minutes (p95).

Principle [P1 (offline-first)](../06-decisions-and-standards/architecture-principles.md) is **not** excepted. The V5s operate fully offline, as required.

## 2. Reason for Exception
CRT bought **120 Vantor V5 validators** for the commuter ferry in 2023 under an FTA grant, for a RiverCard-era contactless pilot. They are open-payments capable, with P2PE readers and secure elements, and run Vantor's current fare application. But:
- **The V5's TLS library supports TLS 1.2 only.** Vantor has confirmed in writing (2026-06-03) that TLS 1.3 will not be back-ported; the V5 platform is in extended support until 2029.
- **Vessels have no usable connectivity on the water.** River coverage is poor, and fitting marine-certified cellular routers to four vessels needs dry-dock work. V5s can only connect over terminal Wi-Fi while docked, roughly every 90 minutes during service.
- **Replacing them now** would mean disposing of FTA-funded equipment before the end of its useful life. That needs FTA approval and repayment of about **$210k** of remaining federal interest. The four vessels' scheduled mid-life refits (Q3–Q4 2028) are the natural replacement point, when V7s can be fitted with marine-rated routers.

## 3. Scope
- **What this exception covers:**
  - The 120 Vantor V5 validators on CRT's four ferry vessels.
  - The Device Gateway's dedicated TLS 1.2 listener for them.
  - Their upload and deny-list timing while at sea.
- **What it does NOT cover:**
  - Any other validator model or location: V7s on buses and rail remain on TLS 1.3 and full NFRs.
  - Any new V5 purchases.
  - Any relaxation of P2PE, signing, device certificates or offline operation.
- **Systems/services affected:** Device Gateway (separate listener), Deny List Service (no change; vessels sync at dock), Device Management (ferry ring), Fare Engine (no change; late taps are handled as normal).

## 4. Risk Assessment
| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| TLS 1.2 weaker than TLS 1.3 against future attacks | Medium | Low | AEAD cipher suites only (ECDHE with AES-GCM); TLS 1.2 is still "strong cryptography" under PCI DSS; payloads are signed taps and P2PE-encrypted card data, so confidentiality doesn't depend on TLS alone |
| A dedicated TLS 1.2 listener becomes a path for other devices to downgrade | Medium | Low | Listener accepts only certificates from the V5 device profile, and only from ferry terminal VLAN addresses (network rule F1 variant); everything else is refused |
| Deny list up to ~3 h stale on a vessel (crossing plus layover with a missed sync) | Low | Medium | Ferry is ~4,500 boardings a day (~1.4% of system); full deny-list sync at every docking; fare inspectors on every ferry departure |
| Taps arrive 30–120 min late | Low | Certain | Normal late-tap re-rating ([Sequence Diagrams §5](../02-core-architecture/sequence-diagrams.md)); no effect on charges, which are built after the service day closes |
| Higher first-ride losses on the ferry | Low | Medium | Ferry first-ride losses reported separately; included in the overall 0.3% limit (R-1) |
| Vantor ends V5 support before replacement | Medium | Low | Extended support contract to 2029 signed; replacement earlier if any critical vulnerability goes unpatched |

## 5. Alternatives Considered
| Alternative | Why Not Chosen |
|---|---|
| Following the standard as-is (replace V5s with V7s now) | ~$0.6M plus ~$210k federal-interest repayment; vessel downtime outside refit windows; no security benefit large enough to justify it |
| Fit cellular routers to vessels now | Dry-dock and marine certification needed; coverage on the river still poor (field test 2026-05: 38% of crossing time without signal) |
| Ask Vantor to upgrade V5 firmware to TLS 1.3 | Declined by Vantor (crypto library end-of-life on that platform) |
| Exclude the ferry from Tapline until 2028 (keep RiverCard fareboxes) | Breaks systemwide open payments (Vision S3); keeps RiverCard hardware alive longer; riders confused |
| Cash-only ferry until replacement | Equity and ridership regression; unacceptable to the Board |

## 6. Compensating Controls
- **Separate Device Gateway listener** (`device-v5.tapline.internal`): TLS 1.2 only with AEAD ciphers, client certificates from the V5 profile only, and source addresses limited to the six ferry terminal VLANs.
- **Full deny-list sync at every docking**, not just deltas. The V5 checks the list's age before departure and raises a fault if it is older than 4 hours.
- **Ferry dashboard and alerts:** list age per vessel, upload backlog per vessel, ferry first-ride losses (weekly), and certificate and listener anomalies.
- **Fare inspectors** check proof of payment on every departure (they already board for safety).
- **Quarterly vulnerability review** of the V5 platform with Vantor. A critical unpatched vulnerability triggers early replacement.
- **No new functionality** may be built that depends on V5-specific behavior.

## 7. Expiry & Review
- **Expiry date or trigger condition:** **2028-12-15**, or earlier when the last vessel's refit completes with V7s installed. Triggered immediately by any critical unpatched V5 vulnerability.
- **What happens at expiry:** revert to the standard. The V5 listener is removed from the Device Gateway and rule F1-V5 deleted from the firewall policy (tracked as an IaC change with the expiry date in its description).
- **Review cadence until expiry:** quarterly at the ARB (exception register item). Renewal is allowed once, by ARB decision, only if the vessel refit schedule slips.

## 8. Approval
| Role | Name | Decision | Date |
|---|---|---|---|
| Architecture Review Board | Dana Okafor (chair) for the ARB | **Approved with conditions:** (1) source-address restriction on the listener; (2) list-age check before departure; (3) separate reporting of ferry first-ride losses | 2026-06-24 |
| Standard Owner (security, TLS) | Tom Whitaker, CISO | Approved with the same conditions | 2026-06-24 |
| Standard Owner (NFRs) | Dana Okafor, Chief Architect | Approved | 2026-06-24 |
| Business risk acceptance | Miguel Serrano, CRO | Accepted ferry first-ride exposure within R-1 | 2026-06-24 |

## 9. Related
- Standard excepted: [Security Architecture §6](../05-security/security-architecture.md), [Non-Functional Requirements](../01-requirements/non-functional-requirements.md)
- Decision context: [ADR-0004](../06-decisions-and-standards/adr/0004-offline-first-validators-with-signed-deny-lists.md), [ARB minutes 2026-06-24](arb-minutes-template.md)
- Residual risk R-3 in the [Threat Model](../05-security/threat-model.md); exception register in the [Governance Framework §6](governance-framework.md)
- Related RFC: none. This is a time-boxed exception, not a step toward changing the standard.
