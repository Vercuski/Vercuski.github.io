const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Code split into so many thin layers of abstraction that even a simple change must pass through all of them, adding indirection without adding value."
aliases:
  - Lasagna Code Anti-Pattern
  - Too Many Layers
source: https://en.wikipedia.org/wiki/Spaghetti_code#Lasagna_code
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Controller → service → manager → repository → generic repository → DbContext, each layer just forwarding the call. Every new field touches six files. Keep layers that carry a real responsibility and collapse the rest.

## Problem
- Layers and abstractions added by default rather than for a reason.
- Most layers only forward calls and map objects.
- Simple changes require edits across many files; performance and readability suffer.

## Solution
- Ask what each layer is responsible for; remove pass-through layers.
- Use vertical slices for features where layers add nothing.
- Allow a closed layer to be opened (layer bypass) where justified.
- Add abstractions when a second implementation or a real boundary appears.

## Structure
\`\`\`mermaid
flowchart LR
    C["Controller"] --> S["Service"] --> M["Manager"] --> R["Repository"] --> G["GenericRepository"] --> D["DbContext"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Each layer has a distinct, real responsibility (as in a well-designed [[Layered Architecture]]) | Layers that only forward calls |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Looks well structured | Change amplification across layers |
| Clear placement rules for code | Indirection, mapping and boilerplate |
|  | Harder debugging |

## Related patterns
- **Fix with:** vertical slice architecture; fewer, meaningful layers; [[Clean Architecture]] applied pragmatically
- **Often found with:** [[Poltergeist Anti-Pattern]]; [[Cargo Cult Programming]]; [[Repository Pattern]] over EF Core
- **Related anti-patterns:** [[Accidental Complexity Anti-Pattern]]; [[Spaghetti Code]] (the opposite failure)
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{e as default};
