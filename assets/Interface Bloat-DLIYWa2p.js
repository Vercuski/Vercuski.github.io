const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Architecture]]'
status: draft
summary: "An interface accumulates so many operations that it becomes hard to implement, understand and use, and most clients use only a small part of it."
aliases:
  - Fat Interface
  - Interface Pollution
source: https://en.wikipedia.org/wiki/Interface_bloat
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> An interface that tries to be useful to everyone ends up with dozens of members, forcing every implementation to provide them all and every client to depend on all of them. Split it into small, role-based interfaces (the interface segregation principle).

## Problem
- Every new requirement adds members to the same interface.
- Implementations throw \`NotImplementedException\` for members they can't support.
- Clients depend on far more than they use, so unrelated changes ripple to them.

## Solution
- Split the interface by client role (\`IReadOrders\`, \`IWriteOrders\`).
- Keep interfaces small and cohesive; compose larger ones only where needed.
- Move convenience overloads to extension methods.

## Structure
\`\`\`mermaid
flowchart LR
    F["IOrderService<br/>40 members"] -->|"split by role"| R["IOrderReader"]
    F --> W["IOrderWriter"]
    F --> E["IOrderExporter"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| A deliberately broad facade for a single primary client | Interfaces with several implementations or many kinds of clients |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| One place to find everything | Hard to implement and mock |
|  | Violates interface segregation |
|  | Unrelated changes affect all clients |

## Related patterns
- **Fix with:** role interfaces; [[SOLID Principles]] (interface segregation); [[Facade Pattern]] over small interfaces
- **Often found with:** [[God Object]]; [[Composite Pattern]] misuse
- **Related anti-patterns:** [[Abstraction Inversion]] (the opposite failure)
- Catalog: [[Software Design Patterns & Anti Patterns#Generic|Generic anti-patterns]].
`;export{e as default};
