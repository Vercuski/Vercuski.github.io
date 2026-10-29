const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "A single conceptual change requires many small edits scattered across many classes or files, because one responsibility is spread throughout the codebase."
aliases:
  - Shotgun Surgery Code Smell
source: https://en.wikipedia.org/wiki/Shotgun_surgery
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Adding a field or changing a rule means touching ten files in five folders, and missing one introduces a bug. The responsibility is scattered. Gather it into one place so a change in one concept means a change in one module.

## Problem
- One responsibility is spread across many classes.
- Changes require coordinated edits in many places; some get missed.

## Solution
- Move related behavior and data into one class or module (move method, move field).
- Organize code by feature or domain rather than technical layer where changes are feature-shaped.
- Use [[Visitor Pattern]] or polymorphism when an operation is spread across types.

## Structure
\`\`\`mermaid
flowchart TB
    CH["Change: add 'discount code'"] --> A["Controller"]
    CH --> B["DTO"]
    CH --> C["Validator"]
    CH --> D["Service"]
    CH --> E["Entity"]
    CH --> F["Mapping"]
    CH --> G["SQL script"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Unavoidable across deliberate boundaries (contracts and their consumers) | Within one module or feature |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Each class stays small | High change cost |
|  | Missed edits cause bugs |

## Related patterns
- **Fix with:** cohesive modules; vertical slices; [[Domain vs Technical Partitioning]]
- **Often found with:** [[Repeating Yourself]]; [[Lasagna Code]]
- **Related anti-patterns:** [[God Object]] (the opposite: one class changed for every reason)
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{e as default};
