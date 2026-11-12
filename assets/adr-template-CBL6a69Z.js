const e=`---
title: "ADR-XXXX: {Short Title}"
summary: "Architecture decision record (ADR) template in the Michael Nygard format: status, context, decision, alternatives considered and consequences."
about: "Write one ADR per decision, numbered in sequence, and never delete an accepted one; supersede it with a new ADR that links back. State the decision as a full sentence, such as 'We will use X to do Y because Z', and list the negative consequences honestly alongside the positive ones."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - adr
  - template
---
# ADR-XXXX: {Short title of decision}

> Guidance (Michael Nygard format). One decision per file. Copy this
> template and number sequentially: 0001, 0002, etc. Never delete an ADR
> once accepted — supersede it with a new one that links back.

## 1. Status
Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX](XXXX-title.md)

## 2. Context
> What is the issue we're seeing that motivates this decision? State the
> forces at play (technical, political, social, project-local) as
> neutrally as possible.

TBD

## 3. Decision
> State the decision in full sentences, active voice: "We will use X to
> do Y because Z."

TBD

## 4. Alternatives Considered
| Option | Pros | Cons | Why not chosen |
|---|---|---|---|
| TBD | TBD | TBD | TBD |

## 5. Consequences
> Guidance: Be honest here — include the negative and neutral
> consequences, not just the positive ones.

**Positive:**
- TBD

**Negative:**
- TBD

**Neutral / follow-up work required:**
- TBD

## 6. Related
Links to related ADRs, architecture document sections, or external
references.
`;export{e as default};
