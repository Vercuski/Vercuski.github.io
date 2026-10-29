---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Architecture]]'
status: draft
summary: "A system's behavior depends on the uncontrolled timing or ordering of events, such as two threads updating the same data, so results vary and bugs appear intermittently."
aliases:
  - Race Condition
  - Race Hazard Anti-Pattern
  - TOCTOU
source: https://en.wikipedia.org/wiki/Race_hazard
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> When the outcome depends on which of two concurrent operations happens first, the system has a race condition: lost updates, double charges, check-then-act failures. These bugs are rare in testing and common in production. Remove shared mutable state or synchronize access to it.

## Problem
- Concurrent threads, requests or services read and write shared state without coordination.
- Check-then-act sequences (`if (!exists) create`) interleave with other actors.
- Failures are intermittent and hard to reproduce.

## Solution
- Eliminate shared mutable state where possible (immutability, ownership transfer).
- Make check-and-act atomic: locks, atomic operations, database constraints, optimistic concurrency tokens.
- Use idempotency keys for distributed operations.
- Test with stress and concurrency tools.

## Structure
```mermaid
sequenceDiagram
    participant A as Request A
    participant DB as Balance = 100
    participant B as Request B
    A->>DB: read 100
    B->>DB: read 100
    A->>DB: write 100 - 30 = 70
    B->>DB: write 100 - 50 = 50
    Note over DB: lost update: should be 20
```

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Never intentionally; only where the result is provably order-independent | Any shared mutable state across threads, requests or services |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| No synchronization overhead (until it breaks) | Data corruption and lost updates |
|  | Intermittent, hard-to-reproduce bugs |
|  | Security issues (TOCTOU) |

## Related patterns
- **Fix with:** [[Lock Pattern]]; [[CPU Atomic Operation]]; [[Safe Concurrency with Exclusive Ownership]]; optimistic concurrency
- **Often found with:** [[Action at a Distance]]; [[Busy Waiting]]
- **Related anti-patterns:** [[Double-Checked Locking]] done wrong
- Catalog: [[Software Design Patterns & Anti Patterns#Generic|Generic anti-patterns]].
