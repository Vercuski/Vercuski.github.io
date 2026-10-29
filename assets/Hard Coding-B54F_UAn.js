const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Data that should come from configuration or input, such as URLs, credentials, limits or file paths, is embedded directly in source code."
aliases:
  - Hard Code
  - Hardcoding
  - Hard-Coding
source: https://en.wikipedia.org/wiki/Hard_code
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Connection strings, API keys, tax rates and paths written into code mean every change needs a rebuild and deploy, environments can't differ, and secrets end up in source control. Move them to configuration, options classes and a secret store.

## Problem
- Environment-specific values, credentials and business parameters live in source code.
- Changes need a rebuild and redeploy; environments can't diverge.
- Secrets leak into version control.

## Solution
- Use configuration (\`appsettings.json\`, environment variables) bound to options classes.
- Store secrets in a secret manager (Azure Key Vault, AWS Secrets Manager, user secrets in development).
- Use named constants for true constants that never vary.
- Follow the [[Twelve-Factor App]] config principle.

## Structure
\`\`\`mermaid
flowchart LR
    C["Source code<br/>conn = 'Server=prod;Pwd=...'"] -. "move to" .-> A["appsettings + env vars"]
    C -. "move to" .-> K["Secret store"]
    A & K --> O["Options classes injected at runtime"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| True constants that never change (mathematical constants, protocol values) | Anything environment-specific, secret or business-tunable |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Simple and explicit | Redeploy for every change |
|  | Secrets exposed in source control |
|  | Can't vary by environment |

## Related patterns
- **Fix with:** configuration and options; secret stores; [[Twelve-Factor App]]
- **Often found with:** [[Magic Number]]; [[Magic Strings]]
- **Related anti-patterns:** [[Soft Coding]] (the overcorrection)
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{n as default};
