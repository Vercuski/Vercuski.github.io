const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Defines the skeleton of an algorithm in a base-class method and lets subclasses override specific steps without changing the algorithm's overall structure."
aliases:
  - Template Method Pattern
  - Hook Method
source:
  - https://en.wikipedia.org/wiki/Template_method
  - https://algomaster.io/learn/lld/template-method
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> The base class owns the fixed sequence of steps in a non-virtual method and calls abstract or virtual "hook" methods for the parts that vary. Subclasses fill in the steps. ASP.NET Core's \`BackgroundService.ExecuteAsync\` is a template-method hook.

## Problem
- Several classes implement the same algorithm with small differences, duplicating the shared steps.
- The order of steps must stay consistent across variants.

## Solution
- Write the algorithm as a non-overridable method in the base class.
- Make the varying steps abstract (must override) or virtual hooks (may override).
- Subclasses implement only the steps that differ.

## Structure
\`\`\`mermaid
classDiagram
    class DataExporter {
        <<abstract>>
        +Export()
        #ReadData()
        #Format(data)*
        #Write(output)
    }
    class CsvExporter {
        #Format(data)
    }
    class JsonExporter {
        #Format(data)
    }
    DataExporter <|-- CsvExporter
    DataExporter <|-- JsonExporter
\`\`\`

![[Pasted image 20260607085143.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Several variants share an algorithm's structure | Variation is better swapped at runtime (use [[Strategy Pattern]]) |
| Frameworks that call user code at fixed points | Deep hierarchies of templates |
| You must enforce the order of steps |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Removes duplication of the shared steps | Inheritance coupling; hard to combine variations |
| Enforces structure | Subclasses may break the algorithm's assumptions |
|  | The flow is split between base and subclasses |

## Related patterns
- **Alternatives:** [[Strategy Pattern]] (composition instead of inheritance); delegates passed in
- **Often combined with:** [[Factory Method]] (often one of the steps); [[Pipeline Pattern]]
- **Anti-pattern to watch for:** [[Call Super]]; [[Yo-Yo Problem]]
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
