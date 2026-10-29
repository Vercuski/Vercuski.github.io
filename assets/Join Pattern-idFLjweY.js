const n=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Expresses concurrency through message passing, where a handler (chord) fires only when messages have arrived on all of a specified set of channels."
aliases:
  - Join-Pattern
  - Join Calculus
  - Chords
source: https://en.wikipedia.org/wiki/Join-pattern
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Define channels and join rules: "when a message is on *both* \`request\` and \`workerReady\`, run this." The runtime matches messages and runs the body, so synchronization is declarative rather than built from threads and locks. It comes from the join calculus (Cω, Joins library); TPL Dataflow's \`JoinBlock\` and \`Task.WhenAll\` echo the idea.

## Problem
- Coordinating several concurrent message sources with threads, locks and condition variables is error-prone.

## Solution
- Declare asynchronous channels that carry messages.
- Declare chords: a set of channels plus a body that runs when each has a message.
- The runtime atomically consumes one message from each channel in the chord and runs the body.

## Structure
\`\`\`mermaid
flowchart LR
    A[["Channel: request"]] --> J{"Join:<br/>both present?"}
    B[["Channel: workerReady"]] --> J
    J -- yes --> H["Chord body<br/>dispatch request to worker"]
\`\`\`

![[Pasted image 20260607170430.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Coordinating multiple asynchronous message streams | Platforms without a join library (hand-rolled joins are complex) |
| Synchronization rules that read more clearly as "when A and B" | Simple fan-in where \`Task.WhenAll\` suffices |

## Trade-offs
| Pro | Con |
| --- | --- |
| Declarative synchronization | Niche, unfamiliar model |
| No explicit locks | Limited mainstream library support |

## Related patterns
- **Alternatives:** TPL Dataflow; \`Task.WhenAll\`; actors; [[Messaging Design Pattern]]
- **Often combined with:** [[Active Object]]; [[Reactor Pattern]]
- **Anti-pattern to watch for:** [[Race Hazard]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{n as default};
