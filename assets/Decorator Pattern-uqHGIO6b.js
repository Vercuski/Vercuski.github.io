const e=`---
type: pattern
category: structural
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Attaches extra responsibilities to an object dynamically by wrapping it in objects with the same interface, as a flexible alternative to subclassing."
aliases:
  - Decorator
source:
  - https://en.wikipedia.org/wiki/Decorator_pattern
  - https://algomaster.io/learn/lld/decorator
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> A decorator implements the same interface as the object it wraps, adds behavior before or after delegating, and can itself be wrapped. Stacking decorators (caching around logging around the real service) adds features without changing the class or multiplying subclasses. .NET \`Stream\` wrappers (\`BufferedStream\`, \`GZipStream\`) are decorators.

## Problem
- You need optional extra behavior (caching, logging, retry, compression) on some instances, in various combinations.
- Subclassing for every combination explodes, and editing the class mixes concerns.

## Solution
- Decorators implement the component interface and hold a reference to an inner component.
- Each method adds its behavior and delegates to the inner component.
- Compose decorators at the composition root in the order you need.
- In .NET DI, register decorators explicitly or with a library such as Scrutor.

## Structure
\`\`\`mermaid
classDiagram
    class IOrderService {
        <<interface>>
        +Place(order)
    }
    class OrderService
    class LoggingDecorator {
        -IOrderService inner
        +Place(order)
    }
    class RetryDecorator {
        -IOrderService inner
        +Place(order)
    }
    IOrderService <|.. OrderService
    IOrderService <|.. LoggingDecorator
    IOrderService <|.. RetryDecorator
    LoggingDecorator o-- IOrderService : wraps
    RetryDecorator o-- IOrderService : wraps
\`\`\`

![[Pasted image 20260607084805.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Behavior must be added to some objects, not the whole class | The interface is large: every decorator must implement every member |
| Features combine in many ways | Order-dependent stacks that nobody can reason about |
| Cross-cutting concerns around one service interface |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Open/closed: add behavior without modifying classes | Many small objects; stack traces get deeper |
| Combine features at runtime | Wrapping order matters |
| Each decorator has a single responsibility | Identity checks fail (the decorator isn't the inner object) |

## Related patterns
- **Alternatives:** [[Pipeline Pattern]] (generic behaviors for every request); subclassing; [[Strategy Pattern]] (swap the core rather than wrap it)
- **Often combined with:** [[Composite Pattern]]; [[Chain of Responsibility]]; [[Dependency Injection]]
- **Anti-pattern to watch for:** [[Lasagna Code]]; [[Yo-Yo Problem]] (the subclass explosion decorators avoid)
- Catalog: [[Software Design Patterns & Anti Patterns#Structural|Structural patterns]].
`;export{e as default};
