const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Domain objects hold only data with getters and setters while all business logic lives in separate service classes, losing the benefits of object-oriented design."
aliases:
  - Anemic Domain Model Anti-Pattern
  - Anaemic Domain Model
source: https://en.wikipedia.org/wiki/Anemic_domain_model
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Entities become property bags and "services" do all the work on them, so invariants aren't protected, rules are duplicated across services, and any code can put an object into an invalid state. Move behavior into the entities that own the data. For CRUD-heavy apps a simple model can be a reasonable choice.

## Problem
- Entities expose public setters and contain no behavior.
- Business rules are spread across services, duplicated and easy to bypass.
- Objects can be put into invalid states by any caller.

## Solution
- Put behavior with the data it changes (\`order.AddLine(...)\`, \`order.Submit()\`).
- Protect invariants with private setters and guard clauses.
- Keep application services thin: orchestration, transactions and I/O only.
- Use value objects for concepts like money and email addresses.

## Structure
\`\`\`mermaid
classDiagram
    class Order {
        +Id
        +Status
        +Lines
        +Total
    }
    class OrderService {
        +AddLine(order, line)
        +Submit(order)
        +CalculateTotal(order)
    }
    OrderService --> Order : manipulates fields
    note for Order "data only: no behavior, public setters"
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Simple CRUD apps or data transfer objects | Rich domains with invariants and complex rules |
| Transaction-script designs where the domain is thin |  |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Simple to understand and to serialize | Invariants unprotected |
| Fits CRUD scaffolding | Business rules duplicated across services |
|  | Procedural code dressed up as objects |

## Related patterns
- **Fix with:** rich domain model; [[Clean Architecture]] with behavior in the core
- **Often found with:** [[Servant Pattern]] overuse; [[Repository Pattern]] treated as the domain; [[Object Orgy]]
- **Related anti-patterns:** [[Anemic Events]] (the event-level cousin); [[Entity Trap]]
- Catalog: [[Software Design Patterns & Anti Patterns#Object-oriented|Object-oriented anti-patterns]].
`;export{e as default};
