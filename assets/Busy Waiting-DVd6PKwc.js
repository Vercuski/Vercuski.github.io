const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "A thread repeatedly checks a condition in a tight loop while waiting for it to become true, wasting CPU instead of blocking or being notified."
aliases:
  - Busy-Waiting
  - Spinning
  - Busy Loop
source: https://en.wikipedia.org/wiki/Busy_waiting
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> \`while (!done) { }\` burns a CPU core doing nothing useful, starves other threads and can hide memory-visibility bugs. Wait on an event, a semaphore, a task or a channel instead, or poll with a delay if polling is unavoidable.

## Problem
- A loop spins checking a flag, queue or file until something changes.
- Consumes CPU, battery and thread-pool threads; may never see the change without memory barriers.

## Solution
- Block or await on a signaling primitive (\`SemaphoreSlim\`, \`ManualResetEventSlim\`, \`TaskCompletionSource\`, \`Channel<T>\`).
- Use notifications (events, file system watchers, message queues).
- If you must poll, poll with a delay and backoff (\`PeriodicTimer\`).
- Use \`SpinWait\` only for very short expected waits in low-level code.

## Structure
\`\`\`mermaid
flowchart LR
    L["while (!ready) { }"] --> L
    L -. "replace with" .-> A["await signal.WaitAsync()"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Low-level spinlocks where the wait is expected to be a few cycles | Waiting for I/O, other threads or external events |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Lowest latency for very short waits | Wastes CPU and starves other work |
|  | Memory-visibility bugs without barriers |

## Related patterns
- **Fix with:** [[Guarded Suspension]]; [[Observer Pattern]]; [[Reactor Pattern]]
- **Often found with:** [[Database-as-IPC]] (polling a table)
- **Related anti-patterns:** [[Race Hazard]]
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{e as default};
