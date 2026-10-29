const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "So much logic and so many values are moved into configuration, rules tables or scripts that the configuration itself becomes an unmaintainable, untested program."
aliases:
  - Softcoding
  - Soft Code
  - Soft-Coding
source: https://en.wikipedia.org/wiki/Softcoding
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Avoiding hard coding at all costs leads to business logic expressed in XML, database rows or spreadsheet formulas, with no compiler, no tests and no version history. Configure what genuinely varies by environment or customer, and keep logic in code.

## Problem
- Business rules and control flow live in configuration files, database tables or custom scripts.
- Configuration changes bypass testing, review and deployment pipelines.
- Behavior is hard to trace or debug.

## Solution
- Keep logic in code; configure only values that genuinely vary.
- Version and validate configuration; test with it.
- If business users must change rules, use a proper, tested rules engine with governance.
- Ship code changes quickly with CI/CD rather than avoiding deployments.

## Structure
\`\`\`mermaid
flowchart LR
    H["Hard coding<br/>(values in code)"] --> B["Balance:<br/>logic in code, values in config"]
    B --> S["Soft coding<br/>(logic in config)"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Values that differ by environment, tenant or deployment | Expressing control flow and business logic in config |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Change without redeploying | Untested, unversioned logic |
|  | No tooling or type safety |
|  | Becomes a bad programming language |

## Related patterns
- **Fix with:** code plus fast delivery; options classes for real configuration
- **Often found with:** [[Inner-Platform Effect]]; [[Interpreter Pattern]] overuse
- **Related anti-patterns:** [[Hard Coding]] (the opposite failure)
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{n as default};
