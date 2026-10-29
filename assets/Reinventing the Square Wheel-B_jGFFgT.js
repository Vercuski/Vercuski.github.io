const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Effort is spent re-creating something that already exists, and the result is worse than the established solution."
aliases:
  - Reinventing the Wheel
  - Square Wheel
source: https://en.wikipedia.org/wiki/Reinventing_the_square_wheel
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Reinventing the wheel wastes effort; reinventing the *square* wheel produces something that also works worse, such as a homegrown date library with time-zone bugs or a custom encryption scheme. Look for existing solutions before building, and understand why they are designed the way they are.

## Problem
- Developers build their own version of a solved problem without checking for existing solutions.
- The result lacks the edge cases, performance and security the established solution handles.

## Solution
- Search for existing libraries, platform features and standards first.
- Learn why the established solution looks the way it does before replacing it.
- Never roll your own cryptography, date/time or security protocols.

## Structure
\`\`\`mermaid
flowchart LR
    N["Need: date math"] --> L["Existing library<br/>(NodaTime, BCL)"]
    N --> S["Homegrown version"]
    S --> X["Time-zone and DST bugs"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Learning exercises | Security, cryptography, date/time and other solved, subtle problems |
| When no existing solution fits real constraints |  |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Learning and full control | Worse quality than existing solutions |
|  | Wasted effort and ongoing maintenance |

## Related patterns
- **Fix with:** established libraries and standards
- **Often found with:** [[Not Invented Here]]; [[Inner-Platform Effect]]
- **Related anti-patterns:** [[Abstraction Inversion]]
- Catalog: [[Software Design Patterns & Anti Patterns#Methodological|Methodological anti-patterns]].
`;export{e as default};
