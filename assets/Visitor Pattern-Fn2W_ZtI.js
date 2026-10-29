const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Separates an operation from the object structure it works on, so new operations can be added to a stable set of element classes without changing them."
aliases:
  - Visitor
  - Double Dispatch
source: https://en.wikipedia.org/wiki/Visitor_pattern
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Each element class has an \`Accept(visitor)\` method that calls back \`visitor.Visit(this)\`, so the right overload runs for each concrete type (double dispatch). New operations, such as exporting to PDF or HTML, are new visitor classes. Roslyn syntax walkers and expression-tree visitors are .NET examples.

## Problem
- You keep adding operations (export, validate, price) across a stable hierarchy of element types.
- Adding each operation to every element class scatters unrelated logic through them.

## Solution
- Define a visitor interface with one \`Visit\` method per concrete element type.
- Each element implements \`Accept(visitor)\` by calling the matching \`Visit\`.
- Each new operation is a visitor implementation.
- Traverse the structure (often a composite) and call \`Accept\` on each element.

## Structure
\`\`\`mermaid
classDiagram
    class IDocumentVisitor {
        <<interface>>
        +Visit(Paragraph p)
        +Visit(Image i)
        +Visit(Table t)
    }
    class IElement {
        <<interface>>
        +Accept(visitor)
    }
    class PdfExporter
    class HtmlExporter
    IDocumentVisitor <|.. PdfExporter
    IDocumentVisitor <|.. HtmlExporter
    IElement <|.. Paragraph
    IElement <|.. Image
    IElement <|.. Table
    IElement ..> IDocumentVisitor : Accept calls Visit
\`\`\`

![[Pasted image 20260607085205.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Element types are stable but operations change often | Element types change often (every new type changes every visitor) |
| Operations need type-specific behavior across a composite structure | C# pattern matching on types already expresses the operation simply |
| Compilers, syntax trees, document models |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| New operations without changing elements | Adding an element type breaks all visitors |
| Related behavior grouped in one visitor | Visitors may need access to element internals |
|  | Double dispatch is unfamiliar to many developers |

## Related patterns
- **Alternatives:** \`switch\` with type patterns; [[Extension Object]]; virtual methods on elements
- **Often combined with:** [[Composite Pattern]]; [[Interpreter Pattern]]; [[Iterator Pattern]]
- **Anti-pattern to watch for:** [[Shotgun Surgery]] (what adding operations without a visitor causes)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
