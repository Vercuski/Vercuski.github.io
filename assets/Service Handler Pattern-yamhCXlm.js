const e=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Has a server spawn a dedicated handler, usually a thread, for each client session, which handles that client's requests until the session ends (thread-per-session)."
aliases:
  - Thread-per-Session
  - Thread-per-Connection
  - Service Handler
source:
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> An acceptor waits for connections and hands each one to a new handler that serves only that client. It's simple to write because each handler runs straightforward blocking code, but threads are expensive, so it scales poorly beyond a few thousand concurrent sessions.

## Problem
- A server must serve many clients concurrently, and handling them one at a time makes clients wait.

## Solution
- An acceptor listens and accepts connections.
- For each connection, create a service handler (thread or task) that owns that session.
- The handler runs sequential, blocking request-handling code and exits when the session closes.
- Cap the number of handlers or use a pool to protect the server.

## Structure
\`\`\`mermaid
flowchart LR
    C1["Client 1"] & C2["Client 2"] & C3["Client 3"] --> A["Acceptor"]
    A -- spawns --> H1["Handler thread 1"]
    A -- spawns --> H2["Handler thread 2"]
    A -- spawns --> H3["Handler thread 3"]
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Modest numbers of long-lived sessions | Thousands of concurrent connections (use [[Reactor Pattern]] or async I/O) |
| Simplicity of sequential per-client code matters more than scale | Untrusted clients that can exhaust threads |

## Trade-offs
| Pro | Con |
| --- | --- |
| Simple, sequential code per client | Thread cost limits scalability |
| Isolation between sessions | Unbounded spawning enables denial of service |

## Related patterns
- **Alternatives:** [[Reactor Pattern]]; [[Thread Pool]]; async I/O
- **Often combined with:** [[Thread-Specific Storage]] (per-session state); [[Thread Pool]] (bounded handlers)
- **Anti-pattern to watch for:** [[Busy Waiting]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{e as default};
