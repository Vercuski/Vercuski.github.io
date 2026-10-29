const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
status: draft
summary: "A single class knows too much or does too much, centralizing most of a program's control and data instead of distributing responsibilities across cohesive classes."
aliases:
  - God Class
  - Blob
  - God Object Anti-Pattern
source: https://en.wikipedia.org/wiki/God_object
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> A \`Manager\`, \`Helper\` or \`Service\` class with thousands of lines, dozens of dependencies and every important rule becomes the place everyone has to change, the source of most merge conflicts and the thing nobody dares refactor. Split it by responsibility.

## Problem
- One class accumulates most of the logic and state; other classes are thin data holders.
- High coupling: everything depends on it, and it depends on everything.
- Hard to test, understand and change in parallel.

## Solution
- Identify responsibilities (look for clusters of fields and methods used together).
- Extract cohesive classes for each responsibility; move behavior next to its data.
- Use a [[Facade Pattern]] to keep the old entry point while you split it.
- Watch class size, dependency count and churn metrics.

## Structure
\`\`\`mermaid
flowchart TB
    G["ApplicationManager<br/>5,000 lines · 40 dependencies"]
    G --> U["Users"]
    G --> O["Orders"]
    G --> P["Payments"]
    G --> R["Reports"]
    G --> E["Email"]
    G --> C["Config"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Tiny scripts | Anything that will grow or be maintained by more than one person |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Everything in one place at first | Merge conflicts and change bottlenecks |
| No design effort | Untestable, fragile code |
|  | Violates single responsibility |

## Related patterns
- **Fix with:** [[SOLID Principles]] (single responsibility); [[Facade Pattern]] over extracted classes; [[Mediator Pattern]] with focused colleagues
- **Often found with:** [[Big Ball of Mud]]; [[Anemic Domain Model]]; [[Interface Bloat]]
- **Related anti-patterns:** [[Entity Trap]] ("CustomerManager" components)
- Catalog: [[Software Design Patterns & Anti Patterns#Object-oriented|Object-oriented anti-patterns]].
`;export{e as default};
