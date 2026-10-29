const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Defines an object that encapsulates how a set of objects interact, so they communicate through the mediator instead of referring to each other directly."
aliases:
  - Mediator
  - MediatR
source: https://en.wikipedia.org/wiki/Mediator_pattern
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Colleagues send messages to a mediator, and the mediator decides who else needs to know. Many-to-many dependencies become one-to-many, and interaction rules live in one place. A chat room and a dialog coordinating its controls are classic examples; in .NET, MediatR applies the idea to request dispatch.

## Problem
- Objects that all talk to each other form a tangle of references that is hard to change or reuse.
- Interaction rules are spread across every participant.

## Solution
- Define a mediator interface for the messages colleagues send.
- Colleagues hold a reference to the mediator only, not to each other.
- The concrete mediator knows the colleagues and implements the coordination logic.
- For request dispatch (MediatR style), the mediator routes each request type to its single handler.

## Structure
\`\`\`mermaid
flowchart TB
    M["ChatRoom mediator"]
    U1["User A"] <--> M
    U2["User B"] <--> M
    U3["User C"] <--> M
    U4["Bot"] <--> M
\`\`\`

![[Pasted image 20260607085021.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Many objects interact in complex but well-defined ways | Only two or three objects interact simply |
| You want to reuse colleagues without their collaborators | A mediator that only forwards requests to handlers you could inject directly |
| Decoupling request senders from handlers (in-process command/query dispatch) |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Reduces coupling between colleagues | The mediator can grow into a god object |
| Centralizes interaction logic | Indirection makes call paths harder to follow ("go to definition" stops at the mediator) |
| Colleagues become reusable |  |

## Related patterns
- **Alternatives:** [[Observer Pattern]] (distributed notification instead of central control); direct injection of handlers; [[Facade Pattern]]
- **Often combined with:** [[Pipeline Pattern]] (MediatR behaviors); [[Command Pattern]]; [[CQRS]]; [[Observer Pattern]]
- **Anti-pattern to watch for:** [[God Object]]; [[Poltergeist Anti-Pattern]]
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
