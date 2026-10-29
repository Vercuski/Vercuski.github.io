const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Code catches errors and then swallows them, logs too little, or replaces them with generic messages, so failures go unnoticed and their cause is lost."
aliases:
  - Exception Swallowing
  - Swallowed Exceptions
  - Error Hiding Anti-Pattern
source: https://en.wikipedia.org/wiki/Error_hiding
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> \`catch (Exception) { }\` and \`catch { return null; }\` make a program look healthy while it silently loses data. The real cause is gone by the time anyone notices. Catch only what you can handle, log with context, and let the rest propagate to a global handler.

## Problem
- Empty catch blocks or catch-all handlers that return defaults.
- Exceptions rethrown without the inner exception, losing stack traces.
- Users and operators get no signal that something failed.

## Solution
- Catch only exceptions you can meaningfully handle; let others bubble up.
- Log with context and the full exception; use \`throw;\` to rethrow.
- Use a global exception handler (ASP.NET Core \`IExceptionHandler\`, ProblemDetails) at the boundary.
- Use the [[Result Pattern]] for expected failures instead of hiding exceptions.

## Structure
\`\`\`mermaid
flowchart LR
    O["Operation fails"] --> C["catch (Exception) { }"]
    C --> R["Return default / continue"]
    R --> X["Silent data loss,<br/>no log, no alert"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Best-effort side work (telemetry) where failure must not break the main flow, and it's still logged | Core business operations and data writes |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Program keeps running | Silent data corruption |
|  | Lost diagnostics; long debugging sessions |

## Related patterns
- **Fix with:** [[Result Pattern]]; global exception handling; [[Logging Best Practices]]
- **Often found with:** [[Caching Failure]]; [[Shooting the Messenger]]
- **Related anti-patterns:** [[Null Object]] misused to mask failures
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{n as default};
