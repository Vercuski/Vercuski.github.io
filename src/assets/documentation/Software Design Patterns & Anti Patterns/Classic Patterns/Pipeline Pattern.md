---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
  - '[[Architecture]]'
status: draft
summary: "Wraps request handlers in an ordered chain of behaviors so cross-cutting concerns such as validation, logging and transactions run before or after every handler without being written into it."
aliases:
  - Pipeline Behavior
  - Pipeline Design Pattern
  - Middleware Pipeline
source: https://medium.com/@bonnotguillaume/software-architecture-the-pipeline-design-pattern-from-zero-to-hero-b5c43d8a4e60
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Each request passes through an ordered list of behaviors (validation, logging, caching, transactions) before it reaches its handler, and each behavior can act on the way in and on the way out. Handlers stay focused on business logic. ASP.NET Core middleware and MediatR pipeline behaviors are the common .NET forms.

## Problem
- Every command or query handler needs the same cross-cutting steps: validate input, log, time, open a transaction, handle errors.
- Copying those steps into each handler duplicates code and lets them drift apart.

## Solution
- Define a behavior interface whose method receives the request and a `next` delegate.
- Each behavior does its pre-work, calls `next()`, then does its post-work (or short-circuits, e.g. on a validation failure).
- Register behaviors in order; the framework composes them around the handler.
- Keep each behavior generic over the request type so one implementation covers every handler.

## Structure
```mermaid
flowchart LR
    R["Request"] --> V["Validation behavior"]
    V --> L["Logging behavior"]
    L --> T["Transaction behavior"]
    T --> H["Handler"]
    H -.response.-> T -.-> L -.-> V -.-> R
```

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Many handlers share the same pre- and post-processing | Only one or two handlers need the concern; a direct call is clearer |
| You already route requests through a mediator or middleware host | Ordering between behaviors is hard to reason about and nobody owns it |
| Cross-cutting concerns must apply uniformly and be switchable in one place |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Handlers contain only business logic | Behavior order matters and is easy to get wrong |
| One implementation per concern, applied everywhere | Hidden control flow: reading a handler doesn't show what runs around it |
| Behaviors are individually testable and reorderable | Each layer adds a small call and allocation overhead |

## Related patterns
- **Alternatives:** [[Decorator Pattern]] applied per service; aspect-oriented interception
- **Often combined with:** [[Mediator Pattern]] (MediatR); [[Chain of Responsibility]]; [[Result Pattern]] (behaviors short-circuit with a failure result); [[ASP.NET Core Middleware Order]]
- **Anti-pattern to watch for:** [[Lasagna Code]] (so many behaviors that a simple request crosses ten layers)
- Catalog: [[Software Design Patterns & Anti Patterns#Enterprise application patterns|Enterprise application patterns]].
