const t=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Source code with tangled, unstructured control flow (jumps, deep nesting, long methods, shared state) that is hard to follow, change or test."
aliases:
  - Spaghetti Code Anti-Pattern
source: https://en.wikipedia.org/wiki/Spaghetti_code
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Long methods with deeply nested branches, flags that change flow elsewhere and logic that jumps around make code read like a bowl of spaghetti. Untangle it with small, well-named methods, clear responsibilities and tests that lock in behavior before refactoring.

## Problem
- Long methods, deep nesting, goto-like jumps and flags.
- Control flow depends on shared state changed in many places.
- Changes break unrelated behavior; tests are hard to write.

## Solution
- Add characterization tests first.
- Extract methods with intention-revealing names; use guard clauses to flatten nesting.
- Separate responsibilities into classes.
- Replace flag-driven branching with polymorphism ([[Strategy Pattern]], [[State Pattern]]).

## Structure
\`\`\`mermaid
flowchart TB
    A["Start"] --> B{"flag1?"}
    B -- yes --> C["step"] --> D{"flag2?"}
    D -- yes --> B
    D -- no --> E["step"] --> F{"retry?"}
    F -- yes --> C
    B -- no --> E
    F -- no --> G["End"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Never by intent | Any code that will be maintained |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Fast to write without design | Hard to read, change and test |
|  | Bugs hide in tangled paths |

## Related patterns
- **Fix with:** structured code; small methods; [[SOLID Principles]]
- **Often found with:** [[Big Ball of Mud]]; [[Magic Pushbutton]]; [[Coding by Exception]]
- **Related anti-patterns:** [[Lasagna Code]] (the overcorrection)
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{t as default};
