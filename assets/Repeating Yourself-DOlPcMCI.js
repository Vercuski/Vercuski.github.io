const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "The same knowledge or logic is duplicated in several places, so every change has to be made everywhere and the copies drift apart (a violation of DRY)."
aliases:
  - DRY Violation
  - WET Code
  - 'Don''t Repeat Yourself'
  - Duplicate Code
source: https://en.wikipedia.org/wiki/Don%27t_Repeat_Yourself
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> When a validation rule, a calculation or a mapping lives in three places, one of them will be forgotten in the next change. Give each piece of knowledge one authoritative home. Beware the opposite mistake: merging code that only looks alike but changes for different reasons.

## Problem
- The same rule or logic is implemented in several places (UI, API, database, services).
- Changes miss some copies; behavior diverges.

## Solution
- Identify duplicated *knowledge*, not just similar-looking code.
- Extract it into one place (a method, class, [[Specification Pattern]], shared library).
- Generate code or schemas from one source where possible.
- Accept duplication across service boundaries when coupling would be worse (see [[Code Reuse in Microservices]]).

## Structure
\`\`\`mermaid
flowchart TB
    R["Discount rule"] --> A["Copy in UI"]
    R --> B["Copy in API"]
    R --> C["Copy in batch job"]
    C -. "updated only here" .-> X["Behaviors diverge"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Across independently deployed services where shared code would couple them | The same business rule in several places within one codebase |
| Code that looks alike but represents different knowledge |  |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Each copy can change independently | Inconsistent behavior |
|  | Higher change cost and missed updates |

## Related patterns
- **Fix with:** DRY extraction; [[Specification Pattern]]; [[Template Method]]
- **Often found with:** [[Copy and Paste Programming]]; [[Shotgun Surgery]]
- **Related anti-patterns:** [[Accidental Complexity Anti-Pattern]] (over-abstracting to avoid any duplication)
- Context: [[Laws & Principles]]
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{e as default};
