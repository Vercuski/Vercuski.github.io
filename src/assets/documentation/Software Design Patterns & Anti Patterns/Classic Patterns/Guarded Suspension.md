---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Makes an operation that needs both a lock and a precondition wait, releasing the lock while suspended, until another thread makes the precondition true."
aliases:
  - Guarded Suspension Pattern
  - Guarded Wait
  - Condition Variable
source: https://en.wikipedia.org/wiki/Guarded_suspension
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> If `Take()` is called on an empty queue, the caller waits rather than failing, and wakes when another thread adds an item and signals. The wait releases the lock so producers can make progress. `Monitor.Wait/Pulse`, `SemaphoreSlim`, `BlockingCollection` and `Channel<T>` all implement it.

## Problem
- An operation can only proceed once a condition holds (queue not empty, buffer not full), and the condition depends on other threads.
- Spinning on the condition wastes CPU; failing immediately pushes retry logic onto callers.

## Solution
- Acquire the lock and loop while the guard condition is false, waiting on a condition variable (the wait releases the lock).
- Threads that change the state signal waiters.
- Re-check the condition after waking (spurious wake-ups, competing consumers).
- Prefer higher-level primitives such as `Channel<T>.Reader.ReadAsync`.

## Structure
```mermaid
flowchart LR
    T["Consumer: Take()"] --> L["Acquire lock"] --> G{"Queue empty?"}
    G -- yes --> W["Wait (releases lock)"]
    W -- "signalled by producer" --> G
    G -- no --> D["Dequeue item"] --> U["Release lock"]
    P["Producer: Add()"] --> S["Enqueue, signal waiters"]
```

![[Pasted image 20260607165715.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Producer-consumer queues and bounded buffers | Callers can't afford to wait (use [[Balking Pattern]] or a timeout) |
| Resources that become available later | Async code: use awaitable primitives instead of blocking threads |

## Trade-offs
| Pro | Con |
| --- | --- |
| No busy waiting | Risk of indefinite waits and deadlocks |
| Callers get a simple blocking or awaitable API | Lost-wakeup bugs if signalling is wrong |

## Related patterns
- **Alternatives:** [[Balking Pattern]]; timeouts; message queues
- **Often combined with:** [[Monitor Object]]; [[Thread Pool]] (work queues); [[Thread Delegate Pattern]]; [[Producer Control Flow Pattern]]
- **Anti-pattern to watch for:** [[Busy Waiting]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
