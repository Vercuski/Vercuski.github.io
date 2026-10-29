---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Objects expose their internal data so freely (public fields, mutable collections) that any code can read and modify them, destroying encapsulation."
aliases:
  - Object Orgy Anti-Pattern
  - Promiscuous Objects
source: https://en.wikipedia.org/wiki/Object_orgy
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> When everything is public and mutable, every class reaches into every other, invariants can't be enforced, and a change to one object's internals breaks code everywhere. Encapsulate state behind behavior and expose read-only views.

## Problem
- Public fields, public setters and exposed mutable collections.
- Other classes modify state directly, bypassing rules.
- Internal representation can't change without breaking callers.

## Solution
- Make fields private; expose behavior instead of setters ("tell, don't ask").
- Expose collections as `IReadOnlyList<T>` and copy on the way out.
- Use `init`-only and immutable types where possible.
- Follow the [[Law of Demeter]].

## Structure
```mermaid
flowchart LR
    A["ReportService"] -- "order.Lines.Add(...)" --> O["Order<br/>public fields"]
    B["Importer"] -- "order.Total = 0" --> O
    C["Controller"] -- "order.Status = 'Paid'" --> O
```

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Plain DTOs and records used only to carry data | Domain objects with invariants |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Easy access from anywhere | No encapsulation; invariants broken |
|  | High coupling to internals |

## Related patterns
- **Fix with:** encapsulation; immutable types; [[Iterator Pattern]] instead of exposing collections
- **Often found with:** [[Anemic Domain Model]]; [[Action at a Distance]]
- **Related anti-patterns:** [[God Object]]
- Catalog: [[Software Design Patterns & Anti Patterns#Object-oriented|Object-oriented anti-patterns]].
