const e=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Avoids runtime locking by guaranteeing, through the type system or design, that only one thread owns and can access a piece of data at any time."
aliases:
  - Exclusive Ownership
  - Ownership Transfer
  - Share by Communicating
source:
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> If you can prove that data is never accessed by two threads at once, because ownership is handed from one to the other rather than shared, no lock is needed. Rust's borrow checker enforces this at compile time; in .NET you get it by design, for example by passing messages through a \`Channel<T>\` and never touching an item after sending it.

## Problem
- Locks add overhead and deadlock risk, but unprotected shared data causes races.

## Solution
- Give each piece of mutable data exactly one owner at a time.
- Transfer ownership explicitly (send it on a channel, move it) instead of sharing references.
- Share only immutable data between threads.
- Enforce with the compiler (Rust) or with conventions, analyzers and code review (C#).

## Structure
\`\`\`mermaid
flowchart LR
    P["Producer thread<br/>owns buffer"] -- "send (ownership moves)" --> C[["Channel"]]
    C --> W["Worker thread<br/>now sole owner"]
    P -. "must not touch buffer after send" .-> X(("✗"))
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Pipelines and producer-consumer flows | Data genuinely needs concurrent shared mutation |
| Performance-sensitive code where locks are costly | Teams can't enforce the ownership convention without compiler help |
| Languages with ownership types |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| No lock overhead or deadlocks | In C#, safety relies on discipline, not the compiler |
| Clear reasoning about who can change what | Requires restructuring around message passing |

## Related patterns
- **Alternatives:** [[Lock Pattern]]; [[Monitor Object]]; immutable data
- **Often combined with:** [[Messaging Design Pattern]]; [[Thread Delegate Pattern]]; [[Active Object]]; [[Compute Kernel]]
- **Anti-pattern to watch for:** [[Race Hazard]]; [[Action at a Distance]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{e as default};
