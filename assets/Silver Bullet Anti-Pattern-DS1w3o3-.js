const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "A team or organization expects one tool, technique, framework or process to solve a fundamental difficulty of software development on its own."
aliases:
  - Silver Bullet
  - No Silver Bullet
source: https://en.wikipedia.org/wiki/No_Silver_Bullet
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> "Microservices will fix our delivery speed," "AI will remove the need for design," "the new framework will solve quality." Fred Brooks argued there's no single development that yields an order-of-magnitude improvement, because the hard part is essential complexity. Treat new tools as trade-offs, not cures.

## Problem
- A new technology or method is adopted in the hope that it will solve deep problems (unclear requirements, poor design, weak practices).
- When it doesn't, the next silver bullet is sought.
- Root causes remain unaddressed.

## Solution
- Diagnose the root cause before choosing a remedy.
- Evaluate new tools by their trade-offs against your specific characteristics.
- Expect incremental improvements from many practices combined.
- Measure outcomes after adoption.

## Structure
\`\`\`mermaid
flowchart LR
    P["Hard problem<br/>(essential complexity)"] --> T1["Tool A will fix it"]
    T1 --> D1["Disappointment"] --> T2["Tool B will fix it"]
    T2 --> D2["Disappointment"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Never as an expectation; tools can help, but as trade-offs | Technology choices made to fix organizational or design problems |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Energizes teams briefly | Root causes ignored |
|  | Costly churn between technologies |

## Related patterns
- **Fix with:** [[Trade-off Analysis]]; root-cause analysis; [[Problem-Solving Techniques]]
- **Often found with:** [[Golden Hammer]]; [[Cargo Cult Programming]]
- **Related anti-patterns:** [[Microservice All the Things Pitfall]]; [[Accidental Complexity Anti-Pattern]]
- Catalog: [[Software Design Patterns & Anti Patterns#Methodological|Methodological anti-patterns]].
`;export{e as default};
