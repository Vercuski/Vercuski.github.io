const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Encapsulates a business rule as a reusable object that tests whether a candidate satisfies it, and combines rules with and, or and not."
aliases:
  - Specification
  - Specification Object
source: https://en.wikipedia.org/wiki/Specification_pattern
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Each rule (\`IsOverdue\`, \`IsPremiumCustomer\`) becomes a specification with \`IsSatisfiedBy(candidate)\`, and specifications combine into new ones (\`overdue.And(highValue)\`). The same rule can validate an object in memory and, as an expression tree, filter a database query through EF Core.

## Problem
- Business rules for selection and validation are duplicated across services, queries and UI.
- Combining rules ad hoc produces long, untestable boolean expressions.

## Solution
- Define \`ISpecification<T>\` with \`IsSatisfiedBy(T)\` and, for queries, an \`Expression<Func<T, bool>>\`.
- Implement each rule as a small class with a domain name.
- Add composite specifications (\`And\`, \`Or\`, \`Not\`).
- Pass specifications to repositories to build queries.

## Structure
\`\`\`mermaid
classDiagram
    class ISpecification~T~ {
        <<interface>>
        +IsSatisfiedBy(candidate) bool
        +ToExpression() Expression
    }
    class OverdueInvoice
    class HighValueInvoice
    class AndSpecification {
        -left
        -right
    }
    ISpecification~T~ <|.. OverdueInvoice
    ISpecification~T~ <|.. HighValueInvoice
    ISpecification~T~ <|.. AndSpecification
    AndSpecification o-- ISpecification~T~
\`\`\`

![[Pasted image 20260607165503.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Business rules reused for validation, selection and queries | A few simple queries that a LINQ \`Where\` expresses clearly |
| Rules combined in many ways | Specifications that wrap every query, adding a layer for nothing |
| You want rules named in domain language and unit-tested alone |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Reusable, testable, named rules | Expression-tree specifications have translation limits |
| Composable with boolean logic | Extra classes for simple predicates |
| Works with repositories and EF Core expression trees |  |

## Related patterns
- **Alternatives:** LINQ predicates or extension methods; query objects
- **Often combined with:** [[Repository Pattern]]; [[Composite Pattern]] (and/or/not); [[Interpreter Pattern]]; [[Strategy Pattern]]
- **Anti-pattern to watch for:** [[Repeating Yourself]] (the duplication specifications remove)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
