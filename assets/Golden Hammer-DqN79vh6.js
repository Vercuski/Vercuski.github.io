const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "A familiar tool, technology or pattern is applied to every problem whether or not it fits, because it worked before (\\"if all you have is a hammer, everything looks like a nail\\")."
aliases:
  - Law of the Instrument
  - 'Maslow''s Hammer'
  - Golden Hammer Anti-Pattern
source: https://en.wikipedia.org/wiki/Law_of_the_instrument#Computer_programming
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> The team that knows Kafka uses Kafka for everything; the architect who likes microservices splits every app. Familiarity replaces fit. Choose tools by the problem's characteristics and trade-offs, and keep learning alternatives.

## Problem
- One technology or pattern is used for every problem.
- Poor fits create workarounds, performance problems and complexity.
- Alternatives aren't evaluated.

## Solution
- Start from requirements and architecture characteristics, then choose the tool.
- Compare options with explicit trade-off analysis and record the decision in an ADR.
- Invest in learning alternatives; run spikes.
- Invite outside reviewers to challenge choices.

## Structure
\`\`\`mermaid
flowchart LR
    T["Favorite tool"] --> P1["Problem A: fits"]
    T --> P2["Problem B: forced fit"]
    T --> P3["Problem C: workaround on workaround"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| The tool genuinely fits most of your problems and the team's expertise is a real advantage | Choosing technology before understanding the problem |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Deep expertise; faster delivery for good fits | Poor fits, workarounds and complexity |
| Fewer technologies to operate | Missed better solutions |

## Related patterns
- **Fix with:** [[Trade-off Analysis]]; [[Architecture Decision Records]]
- **Often found with:** [[Silver Bullet Anti-Pattern]]; [[Cargo Cult Programming]]
- **Related anti-patterns:** [[Cart Before the Horse Anti-Pattern]]; [[Microservice All the Things Pitfall]]; [[Frozen Caveman Anti-Pattern]]
- Catalog: [[Software Design Patterns & Anti Patterns#Methodological|Methodological anti-patterns]].
`;export{e as default};
