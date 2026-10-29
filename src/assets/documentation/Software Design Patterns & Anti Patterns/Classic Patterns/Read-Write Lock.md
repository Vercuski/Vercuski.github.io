---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Lets many threads read shared data concurrently while giving a writer exclusive access, improving throughput for read-heavy data."
aliases:
  - Readers-Writer Lock
  - RW Lock
  - Shared-Exclusive Lock
  - ReaderWriterLockSlim
source: https://en.wikipedia.org/wiki/Read-write_lock
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Readers share the lock; a writer waits until all readers leave and then blocks everyone else until it finishes. It pays off when reads vastly outnumber writes and read sections are non-trivial. In .NET, `ReaderWriterLockSlim` implements it; for many cases, immutable snapshots swapped atomically are simpler.

## Problem
- A plain lock serializes readers too, even though concurrent reads are safe.
- Read-mostly caches and configuration become bottlenecks.

## Solution
- Readers acquire a shared (read) lock; any number can hold it.
- Writers acquire an exclusive (write) lock, waiting for readers to drain.
- Choose a fairness policy so writers aren't starved.
- Optionally support upgradeable read locks for read-then-maybe-write logic.

## Structure
```mermaid
flowchart LR
    R1["Reader 1"] & R2["Reader 2"] & R3["Reader 3"] -- "shared read lock" --> D[("Shared data")]
    W["Writer"] -- "exclusive write lock<br/>(waits for readers)" --> D
```

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Read-heavy shared data with occasional writes | Short critical sections (a plain lock is faster) |
| Read sections long enough that lock overhead matters | Write-heavy data |
|  | Async code (`ReaderWriterLockSlim` is thread-affine) |

## Trade-offs
| Pro | Con |
| --- | --- |
| Concurrent reads improve throughput | Higher overhead per acquisition than a simple lock |
|  | Writer starvation or reader starvation depending on policy |
|  | Upgrade deadlocks |

## Related patterns
- **Alternatives:** [[Lock Pattern]]; immutable snapshots with copy-on-write and an atomic swap; concurrent collections
- **Often combined with:** [[Monitor Object]]; [[Caching Patterns]]
- **Anti-pattern to watch for:** [[Premature Optimization]] (an RW lock where a plain lock was fine)
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
