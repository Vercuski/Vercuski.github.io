const e=`---
title: Compliance Matrix — Project Tapline
status: approved
owner: Tom Whitaker (CISO)
version: 1.0.0
last_updated: 2026-12-04
reviewers:
  - Grace Liu (Director, Fare Policy & Equity) — Title VI and LEP rows, 2026-12-01
  - CRT General Counsel — privacy, records and procurement rows, 2026-12-02
  - CRT Accessibility Coordinator — ADA rows, 2026-12-02
  - Architecture Review Board — accepted for Gate 0, 2026-12-09
tags:
  - compliance_matrix
---
# Compliance Matrix — Project Tapline

> [!summary] Position at Gate 0 (December 2026)
> Tapline's design addresses every applicable obligation. Of 34 mapped controls, **21 are compliant by design with evidence**, **9 are in progress** (implementation due before Phase 1 go-live), **1 is a gap with a remediation plan** (P2PE listing), and **3 are not yet applicable** (Phase 4). No gap blocks Gate 0. The Phase 1 go-live gate requires the P2PE listing or an approved interim PCI scope (§3, G-1).
>
> "Compliant by design" means the design and the controls in place in the lab environment satisfy the requirement. Formal assessment (PCI QSA, WCAG audit) happens before Phase 1 go-live.

## 1. Applicable Standards/Regulations
| Standard | Applicability | Owner |
|---|---|---|
| **PCI DSS v4.0.1** | CRT is a Level 1 merchant (> 6M Visa transactions/year from Phase 2). Annual Report on Compliance (ROC) by a QSA. Scope: card-data zone, Device Gateway pass-through, validators (reduced if the P2PE solution is listed), back-office access to the CDE. | Tom Whitaker (CISO) |
| **PCI P2PE** (via vendor) | Vantor V7 + Northgate solution listing with PCI SSC reduces validator scope. Northgate is the solution provider. | Tom Whitaker; Northgate |
| **FTA Title VI (Circular 4702.1B)** | A fare equity analysis is required before any fare change: introducing caps, retiring passes, the regional cap (RFC-001). Covers service-area equity and the Language Assistance Plan. | Grace Liu |
| **FTA Title VI: limited English proficiency (LEP)** | Rider content in CRT's Language Assistance Plan languages: English, Spanish, Vietnamese, Simplified Chinese (BR-25) | Grace Liu |
| **ADA (Title II) and the DOJ web accessibility rule** | WCAG 2.1 AA is the legal minimum for the app and portal; CRT targets 2.2 AA. Fare equipment usable by riders with disabilities (BR-24). | CRT Accessibility Coordinator; Mei Chen |
| **State consumer privacy act** | Rider personal data: notice, minimization, access and deletion rights, no sale | CRT General Counsel |
| **State public records and retention schedule** | Financial records 7 years; public-records requests (with exemptions for personal data) | CRT Records Manager |
| **FTA Buy America (49 U.S.C. 5323(j))** | FTA-funded hardware: validators, handhelds | CRT Procurement |
| **NIST Cybersecurity Framework 2.0** | CRT's adopted security framework | Tom Whitaker |
| **CRT Rider Privacy Policy (2025)** | Board policy: law-enforcement requests, retention, no sale | CRT General Counsel |
| SOC 2 | **Not applicable to CRT.** Required of vendors (CornerPay Type II; Azure via Service Trust Portal) and checked under PCI DSS 12.8 | — |
| GDPR, HIPAA | **Not applicable.** No EU-targeted service; no protected health information (eligibility stores a category only, with no medical data). Recorded so the question isn't reopened. | — |

## 2. Control Mapping
| Requirement | Control Description | Implementation | Evidence Location | Status |
|---|---|---|---|---|
| PCI 1.2 / 1.3 Network security controls; CDE segmentation | CDE isolated from untrusted and main-zone networks | Separate subscription and VNet; firewall rules F5–F9; NSG deny-by-default | [Network Architecture §2, §6](../04-infrastructure-and-network/network-architecture.md); \`tapline-infra/modules/network/firewall-policy\` | Compliant |
| PCI 3.2 / 3.3 Minimize stored account data; no sensitive authentication data | No PANs or sensitive authentication data stored | P2PE; reader-derived media tokens; Northgate payment tokens | [ADR-0005](../06-decisions-and-standards/adr/0005-no-card-numbers-in-crt-systems.md); [Data Architecture §3](../02-core-architecture/data-architecture.md) | Compliant |
| PCI 3.5 / 3.6 / 3.7 Key management | Cryptographic keys protected and managed | Managed HSM; key table with rotation; key ceremony procedure | [Security Architecture §6](../05-security/security-architecture.md); key ceremony record 2026-09-22 | Compliant |
| PCI 4.2 Strong cryptography in transit | TLS on all transmissions of cardholder data | TLS 1.2+ (AEAD); mutual TLS to Northgate; P2PE from reader | Security Architecture §6; [EX-001](architecture-exception-request.md) (V5 TLS 1.2) | Compliant |
| PCI 5 Anti-malware | Protection on systems in scope | Defender for Containers on AKS CDE; Defender for Servers on jump hosts | Defender for Cloud secure-score report | Compliant |
| PCI 6.2 / 6.3 Secure development; vulnerabilities | Secure SDLC, dependency and container scanning, patching | Coding standards; GitHub Advanced Security; image scanning; monthly base-image refresh | [Coding Standards](../06-decisions-and-standards/coding-standards.md); GHAS dashboards | Compliant |
| PCI 6.4.1 / 6.4.2 Public-facing web apps protected | WAF in front of public apps | Front Door WAF (OWASP DRS 2.1, prevention mode) | Network Architecture §7; WAF policy in IaC | Compliant |
| PCI 6.4.3 / 11.6.1 Payment page script integrity | Scripts on pages hosting payment fields authorized, inventoried, monitored | Content Security Policy and Subresource Integrity on Rider Portal payment pages; script inventory; change-detection job | Rider Portal security headers config; script inventory in \`tapline-apps/docs\` | In progress (detection job due 2027-02) |
| PCI 7 Restrict access by need to know | Role-based access to CDE data and functions | Entra app roles; PIM for admins; CDE access via JIT | [Security Architecture §3](../05-security/security-architecture.md) | Compliant |
| PCI 8.4 MFA into the CDE | MFA for all access into the CDE | Phishing-resistant MFA; PIM; Bastion JIT | Entra Conditional Access policies export | Compliant |
| PCI 9.5 Protect point-of-interaction devices from tampering | Device inventory, periodic inspection, staff training | Device Management inventory; monthly inspection during maintenance; tamper alarms; driver awareness training | Device Management asset list; inspection procedure (Bus Maintenance SOP 14) | In progress (training material due 2027-01) |
| PCI 10.2 / 10.3 Audit logs | Log access and admin actions; protect logs | Audit design; separate audit subscription; immutable storage | Security Architecture §8 | Compliant |
| PCI 10.5.1 Log retention | ≥ 12 months, 3 months immediately available | 1 year Log Analytics, 7 years immutable archive | Log Analytics retention settings in IaC | Compliant |
| PCI 11.3 Vulnerability scans | Quarterly internal and external (ASV) scans | Defender vulnerability assessment; ASV vendor contracted | ASV contract (2026-11) | In progress (first ASV scan when public endpoints go live, 2027-01) |
| PCI 11.4 Penetration testing, incl. segmentation | Annual pentest; segmentation testing | External pentest before Phase 1; segmentation tests every 6 months | Pentest statement of work | In progress (pentest scheduled 2027-01) |
| PCI 12.8 Third-party service providers | List TPSPs, agreements, annual compliance evidence | Northgate (AOC), Vantor/Northgate P2PE, Microsoft Azure (AOC), CornerPay (SOC 2 Type II; not in CDE) | TPSP register in the CISO's compliance folder | Compliant |
| PCI 12.10 Incident response | Incident response plan covering card data | CRT IR plan + Tapline annex (card-data and validator scenarios) | Tapline IR annex (draft) | In progress (annex due 2027-01) |
| PCI P2PE solution listing | Validators use a PCI-listed P2PE solution | Vantor V7 + Northgate solution submitted for listing | Northgate letter 2026-10-15 | **Gap** (G-1) |
| Title VI fare equity analysis: capping and pass retirement | Analysis approved before fare change | Analysis using RiverCard data and census tracts; Board approval | Board Resolution 2026-31 (2026-11-18) | Compliant |
| Title VI fare equity analysis: regional cap | Analysis before any regional cap | Required by RFC-001 for each FTA-funded operator | [RFC-001](rfc-template.md) | N/A (Phase 4) |
| Title VI: data to monitor fare equity | Usage by route, area and time without identifying riders | De-identified lakehouse; FR-DATA-01 | [Data Architecture §7](../02-core-architecture/data-architecture.md) | Compliant |
| LEP: four languages | All rider-facing content in four languages | FR-DATA-03; translation workflow | Localization resource files; translation vendor contract | In progress (app content translation 2027-02) |
| ADA / DOJ rule: WCAG 2.1 AA minimum (target 2.2 AA) | Accessible app and portal | Automated accessibility checks in CI; manual testing with the Accessibility Advisory Committee | [Test Strategy](../10-testing-and-validation/test-strategy.md) (TC-ACC-*) | In progress (first audit before Phase 1) |
| ADA: fare equipment | Audio and visual feedback; reach ranges; tactile cues | Vantor V7 spec; mounting plan; NFR-USE-03 | Vantor V7 accessibility conformance report; mounting drawings | Compliant |
| Privacy: notice and minimization | Collect only what's needed; plain-language notice | Data classification; FR-DATA-02; eligibility documents deleted after 90 days | Data Architecture §7; privacy notice draft | In progress (notice published before Phase 1) |
| Privacy: access and deletion rights | Riders can see, download and delete their data | Statements; 90-day trip deletion; account closure process | FR-ACCT-03, FR-DATA-02 | Compliant |
| Privacy: law-enforcement requests | Legal process only; logged | CRT Legal procedure; audit of disclosures | Rider Privacy Policy 2025 | Compliant |
| Records retention: financial 7 years | Financial records retained and retrievable | Ledger 2 years online plus 7-year immutable archive | Data Architecture §5; ADR-0006 | Compliant |
| Buy America: validators and handhelds | Domestic content and final assembly | Vantor Buy America certification; pre-award audit | Procurement file VT-2026-014 | Compliant |
| NIST CSF 2.0: Govern | Roles, policy, risk management | Governance framework; risk register | [Governance Framework](governance-framework.md); [Risk Register](../08-risk-and-operations/risk-register.md) | Compliant |
| NIST CSF 2.0: Identify / Protect | Asset inventory; access control; data security | Asset registers (cloud via IaC, devices via Device Management); security architecture | Security Architecture | Compliant |
| NIST CSF 2.0: Detect / Respond / Recover | Monitoring; incident response; recovery | Sentinel rules; IR annex; [DR Plan](../08-risk-and-operations/disaster-recovery-plan.md) | Sentinel analytics rules in IaC | In progress (DR plan and IR annex before Phase 1) |
| Partner data isolation (regional agreement) | Partners see only their own data | Operator claim + row-level security | Threat Model T-24 | N/A (Phase 4) |
| Keel Mobility data sharing | Rider data minimization with microtransit partner | ICD-007 | — | N/A (Phase 4) |

## 3. Open Gaps
| Gap | Risk | Remediation Plan | Target Date |
|---|---|---|---|
| **G-1:** Vantor V7 + Northgate P2PE solution not yet PCI-listed | Without listing, all ~4,680 V7 validators and the field network fall into full PCI scope: more controls, a larger QSA assessment, higher cost | Northgate submitted the solution in Oct 2026 and expects listing in Q1 2027. Fallback: an interim scope agreed with the QSA, with validators in scope for the pilot only (60 buses + 22 stations), using compensating controls. Decision point: 2027-02-15. | 2027-03-31 |
| G-2: Payment page script monitoring (PCI 11.6.1) not automated | Undetected malicious script on the top-up page | Change-detection job and alerting | 2027-02-28 |
| G-3: Tapline incident response annex not finalized | Slower, inconsistent response to a card-data or validator incident | Draft reviewed by CISO; tabletop exercise in January | 2027-01-31 |
| G-4: Driver and maintenance staff not yet trained on device tampering | Tampered devices not noticed | Training module with the Bus Operations training team; part of pilot readiness | 2027-01-31 |
| G-5: App and portal content not yet translated into all four languages | Title VI LEP non-compliance at launch | Translation vendor engaged; content freeze 6 weeks before pilot | 2027-02-28 |

Gaps are reviewed monthly by the CISO and reported at each ARB. Phase 1 go-live requires G-1 to be closed (or the interim scope approved) and G-2 to G-5 closed.
`;export{e as default};
