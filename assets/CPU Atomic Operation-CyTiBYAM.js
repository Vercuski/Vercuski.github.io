const e=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Uses hardware atomic instructions (increment, exchange, compare-and-swap) to read and modify primitive values safely from many threads without locks."
aliases:
  - Atomic Operation
  - Interlocked
  - Compare-and-Swap
  - CAS
  - Lock-Free Update
source: https://docs.microsoft.com/en-us/dotnet/api/system.threading.interlocked?view=net-5.0
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> CPUs guarantee that certain operations on integers and references complete indivisibly, so two threads can both increment a counter without losing updates. In C#, the \`Interlocked\` class exposes them (\`Increment\`, \`Exchange\`, \`CompareExchange\`). They're also the building blocks of locks and lock-free data structures.

## Problem
- \`count++\` is a read, an add and a write; two threads interleaving those steps lose updates.
- A full lock around a single integer update is heavyweight.

## Solution
- Use atomic primitives for single-variable updates (\`Interlocked.Increment(ref count)\`).
- Use compare-and-swap loops for conditional updates: read, compute, \`CompareExchange\`, retry if another thread changed it.
- Use \`Volatile.Read/Write\` when only visibility (not atomic read-modify-write) is needed.
- Switch to a lock when several variables must change together.

## Structure
\`\`\`mermaid
flowchart LR
    R["Read current value"] --> C["Compute new value"]
    C --> X{"CompareExchange:<br/>still equal to read value?"}
    X -- yes --> D["Swap applied atomically"]
    X -- "no (another thread won)" --> R
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Counters, flags and single-reference swaps under contention | Invariants spanning several variables (use a lock) |
| Building lock-free structures or one-time initialization | Complex CAS loops that few people can verify |

## Trade-offs
| Pro | Con |
| --- | --- |
| Very fast, no blocking | Only for single variables |
| No deadlocks | CAS loops can spin under heavy contention |
|  | Subtle memory-ordering bugs |

## Related patterns
- **Alternatives:** [[Lock Pattern]]; [[Read-Write Lock]]; [[Monitor Object]]
- **Often combined with:** [[Balking Pattern]]; [[Double-Checked Locking]]; [[Thread-Specific Storage]] (per-thread counters merged later)
- **Anti-pattern to watch for:** [[Race Hazard]]; [[Busy Waiting]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{e as default};
