const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Leadership]]'
status: draft
summary: "People who report bad news (bugs, risks, missed estimates, failing tests) are blamed or punished, so problems stop being reported until they become crises."
aliases:
  - Shooting the Messenger Anti-Pattern
  - Blame the Messenger
source: https://en.wikipedia.org/wiki/Shooting_the_messenger
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> If the tester who finds a critical bug or the engineer who flags a schedule risk gets the blame, people learn to stay quiet. Problems surface late and cost more. Reward early reporting and run blameless reviews.

## Problem
- Bearers of bad news are blamed for the news.
- Teams hide problems, inflate status reports and suppress failing tests or alerts.

## Solution
- Thank and reward early reporting of problems.
- Run blameless post-incident reviews focused on systems, not people.
- Make risk visible (risk registers, dashboards) as routine.
- Leaders model receiving bad news calmly.

## Structure
\`\`\`mermaid
flowchart LR
    R["Engineer reports risk"] --> B["Blamed"]
    B --> S["Team stops reporting"]
    S --> C["Problems surface late as crises"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Never | Always |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Short-term comfort for leadership | Late discovery of problems |
|  | Loss of trust and psychological safety |

## Related patterns
- **Fix with:** blameless culture; [[Risk Storming]]; [[Servant Leadership]]
- **Often found with:** [[Error Hiding]] (the technical mirror)
- **Related anti-patterns:** [[Email-Driven Architecture Anti-Pattern]] (decisions and warnings lost in mail)
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{e as default};
