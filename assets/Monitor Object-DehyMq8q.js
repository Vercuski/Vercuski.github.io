const e=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Synchronizes concurrent access to an object by letting only one thread at a time run any of its methods, with condition variables so methods can wait for state changes."
aliases:
  - Monitor
  - Monitor Object Pattern
  - Synchronized Object
source: https://en.wikipedia.org/wiki/Monitor_(synchronization)
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> The object owns a lock that every public method acquires, so its methods are mutually exclusive, and condition variables let a method wait (releasing the lock) until another method signals. In C#, \`Monitor\` (behind the \`lock\` keyword) with \`Monitor.Wait/Pulse\` implements it directly.

## Problem
- An object used by many threads needs its methods to run one at a time, and some methods must wait for others to change state.
- Callers shouldn't have to coordinate locks themselves.

## Solution
- Encapsulate a private lock inside the object.
- Every public method acquires it on entry and releases it on exit.
- Methods that need a condition wait on a condition variable; methods that change state signal it.
- Never expose the lock object (don't \`lock(this)\`).

## Structure
\`\`\`mermaid
classDiagram
    class BoundedBuffer {
        -object gate
        -Queue~T~ items
        +Put(item)
        +Take() T
    }
    note for BoundedBuffer "Put waits while full, Take waits while empty;
each signals the other with Monitor.Pulse"
    Producer --> BoundedBuffer
    Consumer --> BoundedBuffer
\`\`\`

![[Pasted image 20260607170650.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Thread-safe classes with internal invariants | High-contention hot paths (serialization limits throughput) |
| Bounded buffers and resource managers | Async code (\`Monitor\` is thread-affine; use async primitives) |

## Trade-offs
| Pro | Con |
| --- | --- |
| Callers get thread safety for free | All methods are serialized, even independent ones |
| Synchronization is encapsulated in one place | Nested monitor calls can deadlock |

## Related patterns
- **Alternatives:** [[Active Object]]; [[Read-Write Lock]]; concurrent collections
- **Often combined with:** [[Guarded Suspension]]; [[Lock Pattern]]
- **Anti-pattern to watch for:** [[Race Hazard]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{e as default};
