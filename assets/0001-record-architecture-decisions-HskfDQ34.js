const e=`---
title: "ADR-0001: Record Architecture Decisions"
status: Accepted
date: 2026-04-10
deciders: Dana Okafor (Chief Architect), Priya Raman (CIO), Aisha Karimi (Lead Solution Architect)
tags:
  - adr
---
# ADR-0001: Record Architecture Decisions

## Status
Accepted — 2026-04-10, at the first Tapline Architecture Review Board.

## Context
Tapline is a five-year program with a team that will change: CRT staff, a delivery partner, and vendor engineers from Vantor and Northgate. Several early decisions are hard to reverse: account-based fares, offline-first validators, and the card-data boundary. Some will be questioned years later by auditors, by the Board, or by engineers who weren't there.

RiverCard is the cautionary example. Nobody at CRT today can explain why it computes transfers on the card, why its fareboxes need a nightly dial-up, or which of its limits are contractual and which are technical. That knowledge left with Castellan's original team. Tapline needs the reasons behind its design to be kept, not just the design.

## Decision
We will record every architecturally significant decision as an **Architecture Decision Record (ADR)**, in the Michael Nygard format, using the [Tapline ADR template](adr-template.md).

- **Where:** \`tapline-platform/docs/architecture/06-decisions-and-standards/adr/\`, versioned with the code, one file per decision, numbered sequentially (\`0002-short-title.md\`).
- **What counts as significant:** the decision affects more than one context, a quality attribute in the [NFRs](../../01-requirements/non-functional-requirements.md), an external interface, security or PCI scope, or would cost more than two team-sprints to reverse.
- **Lifecycle:** \`Proposed\` (pull request open) → \`Accepted\` (approved by the ARB) → optionally \`Superseded by ADR-nnnn\` or \`Deprecated\`. Accepted ADRs are never edited except for links and typos. A changed decision gets a new ADR that supersedes the old one.
- **Index:** every ADR is added to the [ADR Log](adr-log.md) in the same pull request.
- **Contested choices** with more than two real options get a [Technology Evaluation / Trade Study](../technology-evaluation-trade-study.md) first, and the ADR links to it.

## Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| No formal record; rely on meetings and memory | Zero overhead | Knowledge leaves with people, which is exactly RiverCard's failure; no audit trail | Rejected. Doesn't survive a five-year, multi-vendor program. |
| Decisions recorded only in the Solution Architecture Document | Single place to look | Loses rejected alternatives and history; the SAD becomes bloated and gets rewritten | Rejected. The SAD *summarizes* ADRs and links to them ([SAD §7](../../02-core-architecture/solution-architecture-document.md)). |
| Decisions in the ARB minutes only | Already produced | Minutes record the meeting, not the reasoning; hard to find a decision two years later | Rejected. Minutes record approval of an ADR, not its content. |
| Confluence pages | Familiar to some staff | Separate from code; no review workflow; drifts | Rejected in favor of docs-as-code with pull-request review. |

## Consequences
**Positive:**
- Decisions and their rationale are version-controlled alongside the code and reviewed like code.
- New team members, auditors and the Board can trace *why*, not just *what*.
- Rejected alternatives are recorded, so the same debate isn't held twice.

**Negative:**
- Writing an ADR takes time (typically 2–4 hours), and there will be pressure to skip it under schedule pressure.
- Some decisions will be recorded after the fact. The ARB accepts this but records the date the decision was actually made.

**Neutral / follow-up work required:**
- The ARB's review and approval process for ADRs is defined in the [Governance Framework](../../07-governance/governance-framework.md).
- The ADR template is tailored for CRT (frontmatter, required sections, link fields): see [adr-template.md](adr-template.md).
- Decisions made before this ADR (account-based fares, the Business Case option) are recorded retrospectively as ADR-0002 onward.

## Related
- [ADR template](adr-template.md)
- [ADR Log](adr-log.md)
- [Governance Framework](../../07-governance/governance-framework.md)
`;export{e as default};
