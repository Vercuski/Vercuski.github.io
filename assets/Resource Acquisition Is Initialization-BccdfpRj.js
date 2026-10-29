const e=`---
type: pattern
category: creational
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Ties a resource's lifetime to an object's scope, acquiring it in the constructor and releasing it automatically when the object goes out of scope."
aliases:
  - RAII
  - Scope-Bound Resource Management
  - SBRM
  - Dispose Pattern
source: https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Acquire the resource (file, lock, connection) when the owning object is created and release it when the object is destroyed, so cleanup happens on every exit path, including exceptions. In C++ destructors do this; in C#, \`IDisposable\` with \`using\` declarations is the equivalent.

## Problem
- Manual release calls get skipped on early returns and exceptions, leaking handles, locks and connections.
- Cleanup code duplicated in every \`finally\` block is easy to get wrong.

## Solution
- Wrap each resource in an object that acquires it on construction.
- Release it in the destructor (C++) or \`Dispose\`/\`DisposeAsync\` (C#).
- Use scope-based syntax (\`using var\`, \`await using\`) so release is automatic.
- Make release idempotent and never throw from it.

## Structure
\`\`\`mermaid
flowchart LR
    S["Scope starts"] --> A["Constructor<br/>acquires resource"]
    A --> U["Use resource"]
    U --> E{"Scope ends:<br/>return or exception"}
    E --> D["Destructor / Dispose<br/>releases resource"]
\`\`\`

![[Pasted image 20260607124237.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Any resource that must be released: files, sockets, locks, transactions, pooled objects | Managed memory alone (the GC handles it; don't add finalizers without unmanaged resources) |
| Code with multiple exit paths or exceptions | Resources whose lifetime must outlive any single scope |

## Trade-offs
| Pro | Con |
| --- | --- |
| Deterministic, exception-safe cleanup | In C#, forgetting \`using\` silently defers release to the finalizer or never |
| Removes repetitive \`try/finally\` code | Ownership of disposable objects must be clear |

## Related patterns
- **Alternatives:** explicit \`try/finally\`; finalizers (last resort only)
- **Often combined with:** [[Object Pool]] (return on dispose); [[Lock Pattern]] (scoped lock guards); [[Proxy Pattern]]
- **Anti-pattern to watch for:** [[Error Hiding]] (swallowing exceptions in Dispose)
- Catalog: [[Software Design Patterns & Anti Patterns#Creational|Creational patterns]].
`;export{e as default};
