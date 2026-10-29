const e=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Decouples method invocation from method execution by queuing calls from clients and running them on the object's own thread through a scheduler, returning futures for results."
aliases:
  - Active Object Pattern
  - Concurrent Object
  - Actor
source: https://en.wikipedia.org/wiki/Active_Object
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Clients call methods on a proxy, which turns each call into a request on a queue and returns a future (in .NET, a \`Task\`). A scheduler on the active object's own thread runs requests one at a time, so the object's state needs no locks. Actor frameworks and \`Channel<T>\`-based workers are modern forms.

## Problem
- An object is used from many threads, and locking every method is error-prone and blocks callers.
- Callers shouldn't wait while long operations run.

## Solution
- A **proxy** exposes the interface and converts each call into a method request.
- Requests go into an **activation queue**.
- A **scheduler** on a dedicated thread dequeues and runs them against the **servant** (the real implementation).
- Each call returns a **future** that completes with the result.

## Structure
\`\`\`mermaid
flowchart LR
    C1["Client thread A"] -- "call" --> P["Proxy"]
    C2["Client thread B"] -- "call" --> P
    P -- "method request" --> Q[["Activation queue"]]
    P -. "returns future / Task" .-> C1
    S["Scheduler<br/>own thread"] -- dequeues --> Q
    S --> SV["Servant<br/>single-threaded state"]
\`\`\`

![[Pasted image 20260607165621.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| An object's state is accessed from many threads | Calls are short and contention is low (a lock is simpler) |
| Callers should not block on long operations | Throughput needs parallel execution inside the object |
| Serializing access is simpler than fine-grained locking |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| No locks in the servant | Queue latency and memory |
| Asynchronous, non-blocking callers | A slow request delays all others |
| Ordering of requests is explicit | More moving parts (proxy, queue, scheduler, futures) |

## Related patterns
- **Alternatives:** [[Monitor Object]] (synchronous, lock-based); actor model frameworks (Orleans, Akka.NET)
- **Often combined with:** [[Scheduler Pattern]]; [[Thread Delegate Pattern]] (\`Channel<T>\` workers); [[Proxy Pattern]]; [[Command Pattern]] (method requests)
- **Anti-pattern to watch for:** [[Busy Waiting]] (polling the queue instead of awaiting it)
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{e as default};
