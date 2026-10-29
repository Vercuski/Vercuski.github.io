const e=`---
type: pattern
category: creational
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Keeps a set of initialized, reusable objects and lends them out on request, avoiding the cost of repeatedly creating and destroying expensive resources."
aliases:
  - Object Pool Pattern
  - Resource Pool
  - Connection Pool
source: https://en.wikipedia.org/wiki/Object_pool
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Rather than allocating a new expensive object each time, callers rent one from a pool and return it when done. Connection pools and thread pools are specialized forms. In .NET, \`ArrayPool<T>\` and \`ObjectPool<T>\` (Microsoft.Extensions.ObjectPool) are ready-made.

## Problem
- Creating some objects is expensive (database connections, large buffers, threads) and they are needed briefly but often.
- Frequent allocation causes GC pressure and latency spikes.

## Solution
- Create a pool that holds idle instances and a policy for creating new ones up to a limit.
- \`Rent()\` returns an idle instance or creates one; \`Return()\` resets the instance and puts it back.
- Reset state on return so the next borrower gets a clean object.
- Decide what happens when the pool is exhausted: wait, grow, or fail.

## Structure
\`\`\`mermaid
flowchart LR
    C["Client"] -- "Rent()" --> P["Pool<br/>idle instances"]
    P -- instance --> C
    C -- "Return() after reset" --> P
    P -- "create if empty<br/>and under limit" --> F["Factory"]
\`\`\`

![[Pasted image 20260607123950.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Objects are expensive to create and used briefly | Objects are cheap; the modern GC handles short-lived objects well |
| Allocation rate shows up in GC or latency profiles | Objects hold state that is hard to reset reliably |
| A resource has a hard concurrency limit (connections) |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Lower allocation and creation cost | Stale state if reset is incomplete |
| Caps resource usage | Leaks if callers forget to return objects |
|  | Contention on the pool under high concurrency |

## Related patterns
- **Alternatives:** plain allocation; [[Flyweight Pattern]] (share immutable state instead of reusing mutable objects)
- **Often combined with:** [[Thread Pool]] (a specialized object pool); [[Resource Acquisition Is Initialization]] (return to the pool on dispose); [[Factory Method]]
- **Anti-pattern to watch for:** [[Object Cesspool]] (returning objects without resetting them)
- Catalog: [[Software Design Patterns & Anti Patterns#Creational|Creational patterns]].
`;export{e as default};
