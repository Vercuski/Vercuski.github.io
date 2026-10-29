const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "An organization rejects external solutions, libraries and standards and rebuilds them in-house, out of distrust or pride rather than real need."
aliases:
  - NIH
  - NIH Syndrome
  - Not Invented Here Syndrome
source: https://en.wikipedia.org/wiki/Not_invented_here#In_computing
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Writing your own logging framework, ORM or message broker when mature ones exist costs years of maintenance for something that doesn't differentiate the business. Build what's core to your value; adopt proven components for the rest.

## Problem
- Teams reimplement commodity components (logging, DI, JSON, auth) instead of using established ones.
- The in-house versions lag in features, security fixes and documentation.
- Effort goes into plumbing rather than the product.

## Solution
- Default to proven libraries and platform features for commodity concerns.
- Build only what differentiates the business or where nothing fits.
- Evaluate libraries for maintenance, license and security, not just features.
- Contribute upstream instead of forking.

## Structure
\`\`\`mermaid
flowchart LR
    N["Need: logging"] --> E["Mature library<br/>(Serilog, OpenTelemetry)"]
    N --> B["Build our own"]
    B --> C["Years of maintenance,<br/>missing features, security gaps"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| The capability is core to your competitive advantage | Commodity infrastructure and well-solved problems |
| No external option meets hard constraints (licensing, regulation, performance) |  |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Full control and fit | High build and maintenance cost |
| No external dependency | Fewer features and slower security fixes |

## Related patterns
- **Fix with:** adopting proven libraries (see [[Essential DotNet Backend Libraries]]); build-vs-buy analysis
- **Often found with:** [[Reinventing the Square Wheel]]; [[Stovepipe System]]
- **Related anti-patterns:** [[Invented Here]] (the opposite bias)
- Catalog: [[Software Design Patterns & Anti Patterns#Methodological|Methodological anti-patterns]].
`;export{e as default};
