const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Uses an interface only to hold constants and implements it to get unqualified access to them, leaking implementation details into every implementing class's public contract."
aliases:
  - Constant Interface Anti-Pattern
  - Constants Interface
source: https://en.wikipedia.org/wiki/Constant_interface
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Implementing an interface just to use its constants makes those constants part of the class's public API, and every subclass inherits the namespace pollution. Put constants in a static class, an enum, or configuration, where they belong.

## Problem
- An interface with no methods, only constants, is "implemented" for convenience.
- Constants become part of the implementing type's public contract and can't be removed without breaking clients.

## Solution
- Put constants in a static class (\`static class Limits\`) or as members of the type they belong to.
- Use enums for closed sets of values.
- Use \`using static\` in C# for unqualified access without inheritance.
- Move environment-dependent values to configuration.

## Structure
\`\`\`mermaid
classDiagram
    class IConstants {
        <<interface>>
        MAX_RETRIES = 3
        TIMEOUT_MS = 500
    }
    IConstants <|.. OrderService
    IConstants <|.. PaymentService
    note for IConstants "Implemented only to get the constants"
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Rarely, if ever, in C# (\`using static\` gives the same convenience) | Always prefer static classes, enums or configuration |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Short, unqualified constant names | Pollutes the public API of implementers |
|  | Misuses interfaces (no behavior) |
|  | Hard to remove later |

## Related patterns
- **Fix with:** static classes; enums; options/configuration
- **Often found with:** [[Magic Number]]; [[Hard Coding]]
- **Related anti-patterns:** [[Marker Interface]] (another interface without behavior, used deliberately)
- Catalog: [[Software Design Patterns & Anti Patterns#Object-oriented|Object-oriented anti-patterns]].
`;export{n as default};
