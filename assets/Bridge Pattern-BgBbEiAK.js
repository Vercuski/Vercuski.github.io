const e=`---
type: pattern
category: structural
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Decouples an abstraction from its implementation by putting them in separate class hierarchies joined by composition, so each can vary independently."
aliases:
  - Bridge
  - Handle/Body
source: https://en.wikipedia.org/wiki/Bridge_pattern
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Instead of one inheritance tree that multiplies every abstraction by every implementation (\`WindowsCircle\`, \`LinuxCircle\`...), keep two trees and have the abstraction hold a reference to an implementor. You can then add abstractions and implementations independently. JDBC and ADO.NET drivers are classic bridges.

## Problem
- Two dimensions of variation in one hierarchy cause a class explosion: shapes × renderers, notifications × channels.
- Changing an implementation detail forces changes in every abstraction subclass.

## Solution
- Split the design into an **abstraction** hierarchy (what clients use) and an **implementor** hierarchy (platform-specific work).
- The abstraction holds an implementor reference and delegates low-level operations to it.
- Refined abstractions extend behavior using only the implementor interface.
- Choose or swap the implementor at construction time.

## Structure
\`\`\`mermaid
classDiagram
    class Shape {
        <<abstract>>
        #IRenderer renderer
        +Draw()*
    }
    class Circle { +Draw() }
    class Square { +Draw() }
    class IRenderer {
        <<interface>>
        +RenderCircle(r)
        +RenderRect(w, h)
    }
    class VectorRenderer
    class RasterRenderer
    Shape <|-- Circle
    Shape <|-- Square
    Shape o-- IRenderer : bridge
    IRenderer <|.. VectorRenderer
    IRenderer <|.. RasterRenderer
\`\`\`

![[Pasted image 20260607084734.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Two independent dimensions of variation would otherwise multiply subclasses | There's only one implementation and no sign of a second |
| Implementations must be switchable at runtime or per platform | The two dimensions aren't really independent |
| You want to hide implementation details completely from clients |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Avoids class explosion | More indirection and up-front design |
| Abstraction and implementation evolve separately | Harder to understand for simple cases |
| Implementations swap at runtime |  |

## Related patterns
- **Alternatives:** [[Strategy Pattern]] (similar shape, focused on swapping an algorithm); [[Adapter Pattern]] (retrofits instead of designing up front)
- **Often combined with:** [[Abstract Factory]] (creates matching implementors); [[Dependency Injection]]
- **Anti-pattern to watch for:** [[Accidental Complexity Anti-Pattern]] (a bridge with one implementation)
- Catalog: [[Software Design Patterns & Anti Patterns#Structural|Structural patterns]].
`;export{e as default};
