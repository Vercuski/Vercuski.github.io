const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Behavior in one part of a program changes unexpectedly because of an operation in a distant, seemingly unrelated part, usually through shared mutable or global state."
aliases:
  - Spooky Action at a Distance
source: https://en.wikipedia.org/wiki/Action_at_a_distance_(computer_science)
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> A setting changed in one module silently alters behavior in another, because both touch the same global variable, static field, singleton or shared mutable object. Bugs show up far from their cause. Limit shared mutable state and make dependencies explicit.

## Problem
- Global variables, static mutable fields or shared mutable objects connect distant code invisibly.
- Changing one place breaks another with no visible link between them.
- Debugging requires knowing the whole program's history.

## Solution
- Make state local and dependencies explicit (pass them in, inject them).
- Prefer immutable data; copy when sharing.
- Encapsulate necessary shared state behind an interface with clear rules.
- Avoid ambient context unless it's well scoped (e.g. \`AsyncLocal<T>\` for correlation IDs).

## Structure
\`\`\`mermaid
flowchart LR
    A["Module A<br/>Culture.Current = 'de-DE'"] --> G[("Global / static state")]
    G --> B["Module B<br/>decimal parsing now fails"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Deliberate, well-documented ambient context with narrow scope | Mutable globals, static caches and shared mutable objects |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Convenient access without parameter plumbing | Bugs far from their cause |
|  | Hard to test and to reason about |
|  | Concurrency problems |

## Related patterns
- **Fix with:** [[Dependency Injection]]; immutable data; [[Thread-Specific Storage]] with clear scoping
- **Often found with:** [[Singleton Pattern]] misuse; [[Race Hazard]]; [[Object Orgy]]
- **Related anti-patterns:** [[Shotgun Surgery]]
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{e as default};
