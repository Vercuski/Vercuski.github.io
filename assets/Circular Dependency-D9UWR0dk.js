const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Two or more modules depend on each other directly or indirectly, so none of them can be built, changed, tested or reused independently."
aliases:
  - Cyclic Dependency
  - Dependency Cycle
source: https://en.wikipedia.org/wiki/Circular_dependency
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> When A depends on B and B depends on A (or A→B→C→A), the modules form one tangled unit: changes ripple both ways, initialization order becomes fragile and nothing can be extracted alone. Break the cycle with an interface owned by one side, events, or by moving the shared part into its own module.

## Problem
- Modules or classes reference each other in a cycle.
- Builds and initialization get order-dependent; DI containers fail to resolve.
- The cycle prevents splitting into packages or services.

## Solution
- Apply dependency inversion: define an interface in the higher-level module and implement it in the lower one.
- Extract the shared concept into a third module both depend on.
- Replace a back-reference with an event or callback.
- Detect cycles automatically with architecture tests.

## Structure
\`\`\`mermaid
flowchart LR
    A["Orders module"] --> B["Billing module"]
    B --> C["Customers module"]
    C --> A
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Tightly cohesive classes inside one module where the cycle never crosses a boundary | Across modules, packages, assemblies or services |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Easy to add a quick call in either direction | Changes ripple both ways |
|  | Can't test, reuse or deploy parts independently |
|  | Initialization and resolution problems |

## Related patterns
- **Fix with:** [[Dependency Injection]] with interfaces; [[Observer Pattern]] (events); [[Mediator Pattern]]
- **Often found with:** [[Big Ball of Mud]]; [[God Object]]
- **Related anti-patterns:** [[Structural Decay]]; [[Service Coupling]]
- Catalog: [[Software Design Patterns & Anti Patterns#Object-oriented|Object-oriented anti-patterns]].
`;export{e as default};
