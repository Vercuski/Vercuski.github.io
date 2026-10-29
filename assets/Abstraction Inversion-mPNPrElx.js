const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Architecture]]'
status: draft
summary: "An interface hides functionality users need, so they rebuild simple low-level constructs on top of the complex high-level ones it does expose."
aliases:
  - Abstraction Inversion Anti-Pattern
source: https://en.wikipedia.org/wiki/Abstraction_inversion
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> When an abstraction exposes only high-level operations, users who need something simpler end up reimplementing it awkwardly on top, such as building a counter out of a full database transaction. The fix is to expose the simpler building block, or let users reach the layer below.

## Problem
- A component offers complex operations but omits a simple primitive its users need.
- Users compose the complex operations to recreate the primitive, which is slower and buggier than exposing it.
- The real dependency (on the low-level capability) is hidden behind the high-level API.

## Solution
- Expose the simple primitive alongside the higher-level operations.
- Layer high-level operations on top of the primitives, not the other way round.
- Ask users how they actually use the interface before deciding what to hide.

## Structure
\`\`\`mermaid
flowchart TB
    U["User needs: simple increment"] --> H["High-level API<br/>only offers full transactions"]
    H --> L["Low-level primitive<br/>(atomic increment, hidden)"]
    U -. "should call directly" .-> L
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Deliberate safety boundary where users must not reach the primitive | Users regularly rebuild a primitive from complex calls |
|  | Performance suffers from the workaround |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| A smaller, more controlled public surface | Inefficient, convoluted workarounds |
|  | Duplicated low-level logic in every consumer |

## Related patterns
- **Fix with:** exposing primitives at the right layer; [[Facade Pattern]] on top of, not instead of, the lower-level API
- **Often found with:** [[Inner-Platform Effect]]; [[Interface Bloat]] (the overcorrection)
- **Related anti-patterns:** [[Accidental Complexity Anti-Pattern]]; [[Reinventing the Square Wheel]]
- Catalog: [[Software Design Patterns & Anti Patterns#Generic|Generic anti-patterns]].
`;export{e as default};
