const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Short-lived classes with no state or real responsibility exist only to call methods on other classes, adding indirection and clutter without adding value."
aliases:
  - Poltergeist
  - Gypsy Wagon
  - Proliferation of Classes
source: https://en.wikipedia.org/wiki/Poltergeist_(computer_programming)
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> A poltergeist appears briefly to kick off a process and then vanishes, such as a \`ProcessStarter\` whose only job is to call \`Processor.Run()\`. It adds a class, an allocation and a hop for nothing. Remove it and let the caller invoke the real operation directly.

## Problem
- Classes that hold no state and just forward a call or two.
- Extra indirection hides where the work really happens.
- Often called controllers, starters, managers or initializers.

## Solution
- Inline the poltergeist: have the caller call the real class directly.
- Move any real behavior it contains into the class that owns the data.
- Keep intermediaries only when they add a real responsibility (validation, transaction, translation).

## Structure
\`\`\`mermaid
flowchart LR
    C["Caller"] --> P["OrderProcessStarter<br/>(no state, one line)"] --> R["OrderProcessor.Run()"]
    C -. "call directly" .-> R
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Rarely; a seam deliberately introduced for testing or a framework entry point | Classes whose only job is to invoke another class |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Can feel like separation of concerns | Unnecessary classes and indirection |
|  | Harder navigation and debugging |

## Related patterns
- **Fix with:** direct calls; [[Delegation Pattern]] only where behavior is added
- **Often found with:** [[Lasagna Code]]; [[Cargo Cult Programming]]
- **Related anti-patterns:** [[Accidental Complexity Anti-Pattern]]
- Catalog: [[Software Design Patterns & Anti Patterns#Object-oriented|Object-oriented anti-patterns]].
`;export{e as default};
