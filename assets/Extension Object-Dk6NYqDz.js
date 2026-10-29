const e=`---
type: pattern
category: structural
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Adds new interfaces to a class hierarchy at runtime by letting objects return named extension objects, without changing the hierarchy itself."
aliases:
  - Extension Object Pattern
  - Extension Interface
source:
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Each object can be asked \`GetExtension("Printable")\` and returns an extension object implementing that capability, or null. New capabilities are added as new extension classes rather than as new members on every class in the hierarchy.

## Problem
- Clients need capabilities that only some classes in a hierarchy support, and the set keeps growing.
- Adding each capability to the base interface bloats it and forces every class to implement it.

## Solution
- Give the base class a method such as \`GetExtension(name)\` or \`GetExtension<T>()\`.
- Implement each capability as a separate extension class bound to the subject.
- Subjects register the extensions they support; clients ask for an extension and check for null.

## Structure
\`\`\`mermaid
classDiagram
    class Subject {
        +GetExtension~T~() T
    }
    class IExtension {
        <<interface>>
    }
    class PrintableExtension {
        +Print()
    }
    class ExportableExtension {
        +Export(format)
    }
    Subject o-- IExtension : registered
    IExtension <|.. PrintableExtension
    IExtension <|.. ExportableExtension
    Client --> Subject : asks for extension
\`\`\`

![[Pasted image 20260607124329.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| A hierarchy must support an open-ended set of capabilities | The set of capabilities is small and stable (just use interfaces) |
| Plug-ins add capabilities to existing objects | C# extension methods are enough (no per-object state needed) |
| Only some objects support a given capability |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Keeps the core interface small | Clients must query and handle missing extensions |
| New capabilities without changing existing classes | Capabilities are less discoverable than interface members |

## Related patterns
- **Alternatives:** [[Visitor Pattern]] (new operations on a fixed hierarchy); [[Decorator Pattern]]; C# extension methods
- **Often combined with:** [[Marker Interface]]; [[Microkernel Architecture]] (plug-in capabilities)
- **Anti-pattern to watch for:** [[Interface Bloat]] (the problem it avoids)
- Catalog: [[Software Design Patterns & Anti Patterns#Structural|Structural patterns]].
`;export{e as default};
