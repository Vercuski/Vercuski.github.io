const n=`---
type: pattern
category: structural
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Routes every web request through a single handler that performs common processing (authentication, routing, logging) and then dispatches to the right command or controller."
aliases:
  - Front Controller Pattern
source: https://en.wikipedia.org/wiki/Front_controller
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Instead of one entry point per page, a single front controller receives all requests, runs shared logic once, and dispatches to a handler chosen by routing. ASP.NET Core's routing middleware plus MVC controllers is a front controller.

## Problem
- With one script or handler per page, shared concerns (security, localization, error handling) are duplicated in every entry point.
- Navigation and routing rules are scattered.

## Solution
- Send every request to one controller (a servlet, a middleware pipeline, a router).
- Run common processing there, usually as a chain of filters.
- Map the request to a command or action handler and dispatch.
- Render the response through a shared view mechanism.

## Structure
\`\`\`mermaid
flowchart LR
    R["HTTP request"] --> FC["Front controller<br/>auth · logging · routing"]
    FC --> D{"Dispatcher"}
    D --> H1["Orders handler"]
    D --> H2["Customers handler"]
    D --> H3["Reports handler"]
    H1 & H2 & H3 --> V["View / response"]
\`\`\`

![[Pasted image 20260607124434.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Web applications with shared request processing | A tiny app with one or two endpoints |
| Centralized routing and security rules | When your framework already provides it (don't build another one on top) |
| You need to add or change cross-cutting steps in one place |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Cross-cutting logic in one place | Single point of failure and potential bottleneck |
| Centralized, consistent routing | Routing configuration can become complex |
| Easy to add filters |  |

## Related patterns
- **Alternatives:** page controller (one controller per page)
- **Often combined with:** [[Chain of Responsibility]] (filters); [[Command Pattern]] (dispatched actions); [[Pipeline Pattern]]; [[ASP.NET Core Middleware Order]]
- **Anti-pattern to watch for:** [[God Object]] (business logic creeping into the controller)
- Catalog: [[Software Design Patterns & Anti Patterns#Structural|Structural patterns]].
`;export{n as default};
