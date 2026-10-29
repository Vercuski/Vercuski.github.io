const e=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Uses an explicit scheduler object to decide when each waiting thread may run a section of single-threaded code, enforcing a chosen ordering policy."
aliases:
  - Scheduler
  - Task Scheduler
source: https://en.wikipedia.org/wiki/Scheduler_pattern
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Threads that need a shared single-threaded resource ask a scheduler for permission, and the scheduler grants access one at a time according to a policy such as FIFO, priority or deadline. It's a lock whose order you control. .NET \`TaskScheduler\` implementations and limited-concurrency schedulers apply the same idea to tasks.

## Problem
- A plain lock grants access in arbitrary order, but some resources need a specific order (priorities, fairness, deadlines).

## Solution
- Threads call \`Enter()\` on the scheduler before the critical section and \`Done()\` afterwards.
- The scheduler queues waiting threads according to its policy.
- On \`Done()\`, it wakes the next thread chosen by the policy.

## Structure
\`\`\`mermaid
flowchart LR
    T1["Thread (priority 1)"] & T2["Thread (priority 3)"] & T3["Thread (priority 2)"] -- "Enter()" --> S["Scheduler<br/>policy: priority"]
    S -- "grants one at a time" --> R["Single-threaded resource"]
    R -- "Done()" --> S
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Access to a resource must follow a policy (priority, fairness) | Any order is fine (a lock is simpler) |
| Controlling concurrency level for tasks (a limited-concurrency scheduler) |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Explicit, testable ordering policy | Overhead per access |
| Separates policy from the protected code | Policy bugs cause starvation |

## Related patterns
- **Alternatives:** [[Lock Pattern]]; priority queues; [[Ambulance Pattern]] (priority at the messaging level)
- **Often combined with:** [[Active Object]] (its scheduler); [[Thread Pool]]
- **Anti-pattern to watch for:** [[Busy Waiting]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{e as default};
