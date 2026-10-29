const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Passes a request along a chain of handlers until one handles it, so the sender is not coupled to the specific receiver."
aliases:
  - Chain of Responsibility Pattern
  - CoR
  - Filter Chain
source:
  - https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern
  - https://algomaster.io/learn/lld/chain-of-responsibility
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Handlers are linked in a chain; each decides whether to handle the request, pass it on, or both. The sender only knows the first handler. Servlet filter chains, approval escalation and ASP.NET Core middleware are well-known forms.

## Problem
- Several objects might handle a request and the right one depends on the request or runtime conditions.
- Putting all the \`if/else\` routing in the sender couples it to every possible handler.

## Solution
- Define a handler interface with \`Handle(request)\` and a reference to the next handler.
- Each concrete handler processes what it can and otherwise forwards to the next.
- Build the chain at configuration time; the client calls only the head.
- Decide what happens if nobody handles the request (default handler or error).

## Structure
\`\`\`mermaid
flowchart LR
    C["Client"] --> H1["Team lead<br/>up to $1k"]
    H1 -- "too large" --> H2["Manager<br/>up to $10k"]
    H2 -- "too large" --> H3["Director<br/>any amount"]
    H1 -- handled --> X["Done"]
    H2 -- handled --> X
    H3 -- handled --> X
\`\`\`

![[Pasted image 20260607084934.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| More than one object may handle a request, chosen at runtime | Every request must be handled and you can't guarantee a catch-all |
| Handlers and their order should be configurable | Long chains on hot paths where the lookup cost matters |
| Filters or middleware that each do part of the work |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Decouples sender from receivers | No guarantee of handling |
| Add, remove or reorder handlers easily | Harder to trace which handler acted |
| Each handler has one responsibility | Order dependence |

## Related patterns
- **Alternatives:** [[Command Pattern]] with a dispatcher; [[Mediator Pattern]]
- **Often combined with:** [[Pipeline Pattern]]; [[Front Controller]]; [[Composite Pattern]] (pass requests up the parent chain); [[Decorator Pattern]]
- **Anti-pattern to watch for:** [[Coding by Exception]] (special-case handlers piling up)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
