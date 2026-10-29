---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
status: draft
summary: "A base class requires every subclass override to call the base method for the code to work correctly, a requirement that is easy to forget and impossible for the compiler to enforce."
aliases:
  - Call Super Anti-Pattern
  - Call Base
source: https://en.wikipedia.org/wiki/Call_super
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> If overriding `OnStart()` only works when you remember `base.OnStart()`, the design relies on every subclass author's memory. Use a template method instead: the base class calls a separate hook that subclasses override, so the required code always runs.

## Problem
- Overrides must call `base.Method()` (at the right time) or the object breaks.
- Nothing enforces it; forgotten calls produce subtle bugs.

## Solution
- Make the public method non-virtual and have it call a protected virtual hook.
- Put the mandatory logic in the non-virtual method, before or after the hook.
- Document optional hooks; provide empty default implementations.

## Structure
```mermaid
classDiagram
    class Widget {
        +Initialize()
        #OnInitialize()
    }
    class Button {
        #OnInitialize()
    }
    Widget <|-- Button
    note for Widget "Initialize() runs required setup,
then calls the OnInitialize() hook:
no base call needed"
```

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Framework conventions that are well known and documented (some UI lifecycles) | Your own base classes where a hook method is possible |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Simple to write the base class | Fragile: forgotten calls break behavior silently |
|  | Order of the base call matters and is unclear |

## Related patterns
- **Fix with:** [[Template Method]] with hook methods
- **Often found with:** [[Yo-Yo Problem]]; deep inheritance
- **Related anti-patterns:** [[Sequential Coupling]]
- Catalog: [[Software Design Patterns & Anti Patterns#Object-oriented|Object-oriented anti-patterns]].
