const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Errors or missing results are cached as if they were valid, so a transient failure keeps being served long after the underlying problem has been fixed."
aliases:
  - Caching Failure Anti-Pattern
  - Negative Caching Gone Wrong
source: https://en.wikipedia.org/wiki/Caching_failure
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> A dependency fails once, the error or empty response is cached, and every caller gets the failure until the entry expires, or forever if it never does. Cache failures only deliberately and briefly (negative caching with a short TTL), and never cache exceptions by accident.

## Problem
- Error responses, nulls or exceptions get stored in the cache.
- The fault persists after the dependency recovers.
- \`Lazy<T>\` or memoized tasks can cache a faulted result permanently.

## Solution
- Cache only successful results by default.
- If you cache negatives (not found), use a short TTL and a distinct marker.
- Evict or refresh on error; use \`LazyThreadSafetyMode.PublicationOnly\` or retry-aware memoization.
- Add an explicit invalidation path.

## Structure
\`\`\`mermaid
flowchart LR
    C["Caller"] --> K{"In cache?"}
    K -- miss --> D["Dependency<br/>(temporarily down)"]
    D -- "error" --> S["Stored in cache"]
    K -- "hit: error again,<br/>after recovery" --> C
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Deliberate negative caching with short TTLs (to protect a dependency from repeated misses) | Caching exceptions or transient errors without expiry |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Protects a struggling dependency from load | Prolonged outages |
|  | Confusing behavior after recovery |

## Related patterns
- **Fix with:** [[Caching Patterns]] with error-aware policies; circuit breaker (see [[System Design Failure Modes]])
- **Often found with:** [[Lazy Initialization]] with exception caching; [[Error Hiding]]
- **Related anti-patterns:** [[Common Caching Problems]]
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{e as default};
