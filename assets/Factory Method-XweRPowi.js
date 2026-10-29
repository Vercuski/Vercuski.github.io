const e=`---
type: pattern
category: creational
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Defines an interface for creating a single object but lets subclasses (or a supplied function) decide which concrete class to instantiate."
aliases:
  - Factory Method Pattern
  - Virtual Constructor
  - Factory Pattern
source:
  - https://en.wikipedia.org/wiki/Factory_method
  - https://algomaster.io/learn/lld/factory-method
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> A base class calls an overridable \`Create...()\` method instead of \`new\`, so subclasses decide which concrete product to make while the base class's logic stays the same. It's the simplest way to defer "which class?" to the code that knows.

## Problem
- A class's algorithm needs to create an object, but the right concrete type depends on context the base class doesn't have.
- Hard-coded \`new\` calls force edits to the algorithm every time a new product type appears.

## Solution
- Declare a creation method (\`CreateShape()\`) that returns the product interface.
- The creator's other methods use only the product interface.
- Subclasses override the creation method to return their concrete product.
- In modern C#, a \`Func<T>\` or a static factory method often replaces the subclass.

## Structure
\`\`\`mermaid
classDiagram
    class Creator {
        <<abstract>>
        +Render()
        #CreateShape()* Shape
    }
    class CircleCreator { #CreateShape() Shape }
    class SquareCreator { #CreateShape() Shape }
    class Shape { <<interface>> +Draw() }
    Creator <|-- CircleCreator
    Creator <|-- SquareCreator
    Shape <|.. Circle
    Shape <|.. Square
    CircleCreator ..> Circle : creates
    SquareCreator ..> Square : creates
    Creator --> Shape
\`\`\`

![[Pasted image 20260607084614.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| A class can't anticipate the class of objects it must create | Only one product type exists |
| Subclasses should specify the objects they create | A DI container or a plain \`Func<T>\` already supplies the instance |
| You want a named creation point (\`FromJson\`, \`Create\`) with validation |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Open for new products without changing the creator's logic | Parallel class hierarchies (one creator per product) |
| Named creation methods read better than overloaded constructors | Subclassing just to change the product type |

## Related patterns
- **Alternatives:** [[Abstract Factory]] (families of products); [[Prototype Pattern]]; [[Dependency Injection]]
- **Often combined with:** [[Template Method]] (the factory method is often one step of a template); [[Builder Pattern]]
- **Anti-pattern to watch for:** [[Call Super]] (overrides that must call the base creator)
- Catalog: [[Software Design Patterns & Anti Patterns#Creational|Creational patterns]].
`;export{e as default};
