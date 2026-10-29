const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Puts functionality shared by a group of classes into a separate servant (helper) class that operates on objects passed to it, instead of implementing it in each class."
aliases:
  - Servant
  - Helper Class
  - Utility Class
source: https://en.wikipedia.org/wiki/Design_pattern_Servant
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> A servant class offers an operation (\`Move(IMovable item, Point to)\`) for every class that implements a small interface. The served classes stay simple and the behavior lives in one place. Static helper and utility classes are common forms.

## Problem
- Several unrelated classes need the same behavior, and putting it in each one duplicates code.
- A shared base class would force an unnatural hierarchy.

## Solution
- Define an interface describing what the servant needs from served objects (e.g. \`Position\`).
- Served classes implement that interface.
- The servant implements the operation once, taking served objects as parameters.

## Structure
\`\`\`mermaid
classDiagram
    class IMovable {
        <<interface>>
        +Position
    }
    class MoveServant {
        +MoveTo(item, point)
        +MoveBy(item, dx, dy)
    }
    IMovable <|.. Triangle
    IMovable <|.. Ellipse
    IMovable <|.. Rectangle
    MoveServant ..> IMovable : operates on
\`\`\`

![[Pasted image 20260607085108.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Shared behavior across classes that don't share a base class | The behavior belongs to the objects (rich domain model) |
| Behavior that naturally takes the object as a parameter | Helper classes that turn into dumping grounds |

## Trade-offs
| Pro | Con |
| --- | --- |
| Behavior in one place | Pushes logic away from data |
| Served classes stay small | Static helpers are hard to mock |

## Related patterns
- **Alternatives:** C# extension methods; default interface methods; [[Delegation Pattern]]
- **Often combined with:** [[Visitor Pattern]]; [[Strategy Pattern]]
- **Anti-pattern to watch for:** [[Anemic Domain Model]]; [[God Object]] (a \`Utils\` class that grows forever)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
