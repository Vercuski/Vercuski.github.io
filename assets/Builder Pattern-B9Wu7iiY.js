const e=`---
type: pattern
category: creational
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Separates the step-by-step construction of a complex object from its final representation, so the same construction process can produce different results and avoid long constructors."
aliases:
  - Builder
source:
  - https://en.wikipedia.org/wiki/Builder_pattern
  - https://algomaster.io/learn/lld/builder
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Instead of a constructor with a dozen optional parameters, a builder collects the parts through named steps and produces the object at the end with \`Build()\`. The builder can validate before creating, and different builders can turn the same steps into different products. \`StringBuilder\` and \`WebApplication.CreateBuilder\` are everyday .NET examples.

## Problem
- Objects with many optional parts lead to telescoping constructors or half-initialized objects set through properties.
- Construction rules (required parts, valid combinations) end up scattered across callers.

## Solution
- Create a builder with one method per construction step, each returning the builder for chaining.
- Keep intermediate state in the builder; create the product only in \`Build()\`, after validation.
- Optionally add a **director** that runs a standard sequence of steps (e.g. "default report").
- Different concrete builders can produce different representations from the same steps.

## Structure
\`\`\`mermaid
classDiagram
    class Director {
        +Construct(builder)
    }
    class IBuilder {
        <<interface>>
        +SetHeader(text) IBuilder
        +AddSection(text) IBuilder
        +Build() Report
    }
    class HtmlReportBuilder
    class PdfReportBuilder
    Director --> IBuilder
    IBuilder <|.. HtmlReportBuilder
    IBuilder <|.. PdfReportBuilder
    HtmlReportBuilder ..> Report : creates
    PdfReportBuilder ..> Report : creates
\`\`\`

![[Pasted image 20260607084549.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| An object has many optional parts or a multi-step assembly | The object has a few required fields; a constructor or record is clearer |
| The finished object should be immutable and always valid | C# object initializers with \`required\` members already express the construction |
| The same steps should produce different representations |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Readable, self-documenting construction | Extra class per product |
| Validation in one place before the object exists | Builder and product can drift when fields are added |
| Supports immutable products | Easy to forget to call \`Build()\` or to reuse a builder unintentionally |

## Related patterns
- **Alternatives:** constructors with named/optional arguments; \`required\` init properties; [[Factory Method]]
- **Often combined with:** [[Fluent Interface]] (builder methods return the builder); [[Composite Pattern]] (building trees); [[Abstract Factory]]
- **Anti-pattern to watch for:** [[Sequential Coupling]] (steps that silently must be called in one order)
- Catalog: [[Software Design Patterns & Anti Patterns#Creational|Creational patterns]].
`;export{e as default};
