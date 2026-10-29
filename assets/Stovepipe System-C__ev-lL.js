const t=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Architecture]]'
status: draft
summary: "An isolated, self-contained system built for one purpose that shares no data or functionality with other systems and is hard to integrate or extend."
aliases:
  - Stovepipe
  - Stovepipe Enterprise
  - Silo System
source: https://en.wikipedia.org/wiki/Stovepipe_system
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Each department builds its own system with its own data, so the organization ends up with silos that duplicate functionality and can't talk to each other without fragile point-to-point bridges. The fix is shared integration standards and data ownership across the enterprise. For the architecture-level version, see [[Stovepipe Architecture Anti-Pattern]].

## Problem
- Systems are built independently for single purposes with proprietary data and interfaces.
- The same data and functions are duplicated across systems.
- Integration requires custom, brittle point-to-point links.

## Solution
- Define enterprise integration standards (APIs, events, canonical formats).
- Assign clear ownership of shared data and expose it as services.
- Use an integration layer rather than ad hoc links.

## Structure
\`\`\`mermaid
flowchart LR
    subgraph HR
        H["HR system + DB"]
    end
    subgraph Sales
        S["CRM + DB"]
    end
    subgraph Finance
        F["ERP + DB"]
    end
    H -. "custom export" .-> F
    S -. "nightly file" .-> F
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Genuinely standalone systems with no integration needs | Systems that share customers, products or employees with others |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Teams deliver independently and quickly at first | Duplicate data and functionality |
|  | Expensive, fragile integration |
|  | No single source of truth |

## Related patterns
- **Fix with:** [[Integration Hub]]; [[Enterprise Integration Patterns]]; [[Integration Styles]]
- **Often found with:** [[Not Invented Here]]; [[Repeating Yourself]]
- **Related anti-patterns:** [[Stovepipe Architecture Anti-Pattern]]
- Catalog: [[Software Design Patterns & Anti Patterns#Generic|Generic anti-patterns]].
`;export{t as default};
