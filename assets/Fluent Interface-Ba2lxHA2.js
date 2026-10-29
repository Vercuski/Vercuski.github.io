const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Designs an API around method chaining, where each call returns a context for the next, so code reads like a small domain-specific language."
aliases:
  - Fluent API
  - Method Chaining
source: https://en.wikipedia.org/wiki/Fluent_interface
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Each method returns the object (or a new context object) so calls chain into readable sentences: \`services.AddControllers().AddJsonOptions(...)\` or LINQ's \`Where(...).OrderBy(...)\`. Returning different context types can also guide callers through valid sequences.

## Problem
- Configuration or query APIs with many small calls are noisy and hard to read.
- Callers can't easily see which operations make sense next.

## Solution
- Return \`this\` (or a new immutable instance) from each configuring method.
- Name methods so chains read as sentences.
- Optionally return step-specific interfaces so only valid next steps are offered (a step builder).
- End with a terminal operation (\`Build\`, \`ToList\`, \`Execute\`) where appropriate.

## Structure
\`\`\`mermaid
flowchart LR
    S["Query.From(orders)"] --> W[".Where(paid)"] --> O[".OrderBy(date)"] --> T[".Take(10)"] --> X[".ToList()"]
\`\`\`

![[Pasted image 20260607165314.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Configuration, builders, query construction, test assertions | Methods with meaningful return values or side effects that chaining hides |
| Guiding callers through a sequence of valid steps | Debugging-heavy code: long chains are hard to step through |

## Trade-offs
| Pro | Con |
| --- | --- |
| Readable, discoverable code | Harder to debug and to read stack traces |
| Can encode valid call orders in types | Mutable fluent objects shared across chains cause surprises |
|  | More API design effort |

## Related patterns
- **Alternatives:** object initializers; named arguments
- **Often combined with:** [[Builder Pattern]]; [[Specification Pattern]] (fluent composition of rules); [[Interpreter Pattern]] (internal DSLs)
- **Anti-pattern to watch for:** [[Sequential Coupling]] (hidden ordering rules in a chain)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
