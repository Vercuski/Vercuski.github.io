const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "A literal number with an important but unexplained meaning appears directly in code instead of being given a named constant."
aliases:
  - Magic Numbers
  - Unnamed Numerical Constant
source: https://en.wikipedia.org/wiki/Magic_number_(programming)
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> What does \`if (status == 3)\` or \`timeout = 86400\` mean? Unexplained literals hide intent and get duplicated, so changing one means hunting for every copy. Replace them with named constants, enums or configuration.

## Problem
- Numeric literals encode business meaning (status codes, limits, durations) without names.
- The same value is duplicated; changing it misses some copies.

## Solution
- Introduce named constants (\`const int MaxRetries = 3\`).
- Use enums for coded values.
- Use \`TimeSpan.FromDays(1)\` and similar expressive types.
- Move tunable values to configuration.

## Structure
\`\`\`mermaid
flowchart LR
    M["if (status == 3)<br/>timeout = 86400"] -. "becomes" .-> N["if (status == OrderStatus.Shipped)<br/>timeout = TimeSpan.FromDays(1)"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Obvious values like 0, 1 or -1 in context, or well-known formulas | Values with business or protocol meaning |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Quick to type | Hidden intent |
|  | Duplication and missed updates |

## Related patterns
- **Fix with:** named constants; enums; options/configuration
- **Often found with:** [[Magic Strings]]; [[Hard Coding]]
- **Related anti-patterns:** [[Constant Interface]]
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{n as default};
