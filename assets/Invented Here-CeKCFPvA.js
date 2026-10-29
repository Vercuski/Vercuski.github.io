const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "An organization rejects anything built in-house and insists on external products, even when an internal solution would fit better or already exists."
aliases:
  - Invented Here Anti-Pattern
  - Invented-Here Syndrome
source: https://en.wikipedia.org/wiki/Invented_here
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> The mirror image of not-invented-here: in-house work is assumed to be inferior, so the organization buys or adopts external tools that fit poorly, or ignores a capable internal team. Evaluate options on merit, including the internal ones.

## Problem
- Internal solutions are dismissed by default, regardless of fit or cost.
- Poorly fitting vendor products need heavy customization.
- Internal expertise is undervalued and leaves.

## Solution
- Evaluate build, buy and reuse options against the same criteria.
- Count total cost of ownership, including customization and lock-in.
- Recognize and invest in internal capabilities that are differentiating.

## Structure
\`\`\`mermaid
flowchart LR
    N["Need"] --> I["Internal solution<br/>fits well"]
    N --> V["Vendor product<br/>poor fit"]
    D["Decision bias"] -- "always" --> V
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Commodity capabilities where a market product clearly fits | Differentiating capabilities or where an internal solution already works |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Vendor support and shared roadmaps | Poor fit and expensive customization |
| Less code to own | Vendor lock-in |
|  | Demoralized internal teams |

## Related patterns
- **Fix with:** balanced build-vs-buy evaluation; [[Trade-off Analysis]]
- **Often found with:** [[Golden Hammer]]
- **Related anti-patterns:** [[Not Invented Here]] (the opposite bias)
- Catalog: [[Software Design Patterns & Anti Patterns#Methodological|Methodological anti-patterns]].
`;export{n as default};
