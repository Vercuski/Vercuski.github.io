const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
  - '[[Testing]]'
status: draft
summary: "A project's new requirements come mainly from bug reports, so testers effectively drive the feature set instead of product requirements."
aliases:
  - Tester Driven Development
  - Bug-Driven Development
source: https://en.wikipedia.org/wiki/Tester-driven_development
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> When requirements are vague, every gap surfaces as a "bug" filed by testing, and the backlog becomes a stream of defect fixes that are really undocumented features. Agree requirements and acceptance criteria up front, and separate change requests from defects.

## Problem
- Requirements are incomplete, so testers discover expected behavior and file it as bugs.
- Bug counts look terrible while the product's scope drifts.
- Developers and testers argue over what is a bug versus a feature.

## Solution
- Define acceptance criteria before development (behavior-driven development, specification by example).
- Classify incoming issues as defects or change requests.
- Involve testers in requirements refinement.

## Structure
\`\`\`mermaid
flowchart LR
    R["Vague requirements"] --> D["Build"]
    D --> T["Testing files 'bugs'"]
    T --> F["Bugs are really new requirements"]
    F --> D
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Never as a planning method | Projects without clear acceptance criteria |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Testers' input does shape the product | Scope creep disguised as defects |
|  | Misleading quality metrics |
|  | Friction between roles |

## Related patterns
- **Fix with:** BDD; acceptance criteria; [[Architecture Story Cards]]
- **Often found with:** [[Coding by Exception]]
- **Related anti-patterns:** [[Analysis Paralysis]] (the overcorrection)
- Catalog: [[Software Design Patterns & Anti Patterns#Methodological|Methodological anti-patterns]].
`;export{e as default};
