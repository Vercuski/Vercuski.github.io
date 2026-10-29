const e=`---
type: pattern
category: creational
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Delays creating an object or computing a value until the first time it is needed, then caches the result for later use."
aliases:
  - Lazy Loading
  - Lazy Instantiation
source: https://en.wikipedia.org/wiki/Lazy_initialization
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Expensive work happens on first access rather than at start-up, and later accesses reuse the result. In .NET, \`Lazy<T>\` handles thread-safe creation for you. The GoF catalog describes the same idea as the *virtual proxy* form of [[Proxy Pattern]].

## Problem
- Creating every expensive object up front slows start-up and wastes memory on objects that may never be used.
- Hand-written "if null, create" checks are repeated and are not thread-safe.

## Solution
- Hold a placeholder (null, \`Lazy<T>\`, or a proxy) instead of the real object.
- On first access, create the object and store it; return the stored instance afterwards.
- Make creation thread-safe when shared (\`Lazy<T>\` with \`ExecutionAndPublication\`, or \`LazyInitializer\`).

## Structure
\`\`\`mermaid
flowchart LR
    C["Caller"] --> G{"Value created?"}
    G -- no --> F["Run factory<br/>(once, thread-safe)"] --> S["Store value"] --> R["Return value"]
    G -- yes --> R
\`\`\`

![[Pasted image 20260607124145.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Creation is expensive and the object is often not needed | The object is always needed: creating it eagerly is simpler and fails fast |
| Start-up time matters (apps, plugins, large caches) | First-call latency is unacceptable (latency-critical paths) |
| Dependencies are optional at runtime |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Faster start-up and lower memory for unused objects | First access pays the cost, possibly at a bad time |
| \`Lazy<T>\` gives thread safety for free | Errors surface later, far from configuration |
|  | Exceptions can be cached by \`Lazy<T>\` depending on mode |

## Related patterns
- **Alternatives:** eager initialization; [[Object Pool]] for reusable instances
- **Often combined with:** [[Proxy Pattern]] (virtual proxy); [[Singleton Pattern]] (lazy singleton); [[Multiton Pattern]]
- **Anti-pattern to watch for:** [[Double-Checked Locking]] written by hand instead of using \`Lazy<T>\`
- Catalog: [[Software Design Patterns & Anti Patterns#Creational|Creational patterns]].
`;export{e as default};
