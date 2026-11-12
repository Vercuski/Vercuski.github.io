---
title: "ADR-0001: Record Architecture Decisions"
summary: "ADR-0001, the first architecture decision record: the decision to record architecture decisions as numbered ADRs, with alternatives and consequences."
about: "Most ADR collections start with this record. It explains to future readers why decisions are written down and where, and it shows the format in use. Keep it as the first entry in your ADR log, and copy the ADR template for every decision after it."
status: Accepted
date: TBD
deciders: TBD
tags:
  - adr
---
# ADR-0001: Record Architecture Decisions

## Status
Accepted

## Context
We need a lightweight, consistent way to capture significant architectural
decisions and the reasoning behind them, so future contributors understand
*why* the system looks the way it does — not just *what* it looks like.

## Decision
We will use Architecture Decision Records (ADRs), stored in
`06-decisions-and-standards/adr/`, one file per decision, numbered
sequentially. Copy `adr-template.md` for each new decision and add it to
`adr-log.md`.

## Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| No formal record, rely on tribal knowledge | Zero overhead | Knowledge lost as people leave; no traceability | Rejected — doesn't scale |
| Decisions recorded only in the architecture document | Single place to look | Doesn't preserve rejected alternatives or historical context; document gets bloated | Rejected in favor of dedicated per-decision files |

## Consequences
**Positive:**
- Decisions and their rationale are version-controlled alongside the code.
- New team members can trace *why*, not just *what*.

**Negative:**
- Requires discipline to keep up to date.

**Neutral / follow-up work required:**
- Team needs to agree on the review/approval process for new ADRs — see
  `../../07-governance/governance-framework.md`.

## Related
- `adr-template.md`
- `../../07-governance/governance-framework.md`
