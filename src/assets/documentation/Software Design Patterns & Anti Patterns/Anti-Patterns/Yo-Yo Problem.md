---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
status: draft
summary: "An inheritance hierarchy is so deep and fragmented that understanding one behavior means bouncing up and down between many classes."
aliases:
  - Yo-yo
  - Deep Inheritance
source: https://en.wikipedia.org/wiki/Yo-yo_problem
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> When a method's behavior is spread over six levels of base classes with overrides and `base` calls, readers have to yo-yo up and down the hierarchy to understand it. Flatten the hierarchy and prefer composition.

## Problem
- Deep inheritance chains with overrides at many levels.
- Following the control flow of one method means opening many files.
- Changes to a base class ripple unpredictably.

## Solution
- Prefer composition and [[Delegation Pattern]] over inheritance.
- Keep hierarchies shallow (two or three levels).
- Seal classes by default; open them deliberately.
- Use [[Strategy Pattern]] or [[Decorator Pattern]] for variation.

## Structure
```mermaid
flowchart TB
    A["BaseEntity"] --> B["AuditableEntity"] --> C["VersionedEntity"] --> D["DocumentBase"] --> E["Invoice"]
    E -. "Save() calls base.Save()<br/>up and down the chain" .-> A
```

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Framework hierarchies that are stable and well documented | Application code where composition works |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Code reuse through inheritance | Hard to understand and debug |
|  | Fragile base classes |

## Related patterns
- **Fix with:** composition; [[Strategy Pattern]]; [[Decorator Pattern]]; interfaces
- **Often found with:** [[Call Super]]; [[Circle-Ellipse Problem]]
- **Related anti-patterns:** [[Lasagna Code]]
- Catalog: [[Software Design Patterns & Anti Patterns#Object-oriented|Object-oriented anti-patterns]].
