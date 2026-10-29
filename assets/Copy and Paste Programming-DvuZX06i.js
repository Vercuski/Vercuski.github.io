const e=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Code is duplicated by copying and lightly editing existing blocks instead of creating a reusable abstraction, multiplying bugs and maintenance effort."
aliases:
  - Copy-Paste Programming
  - Copy and Paste
  - Clipboard Inheritance
source: https://en.wikipedia.org/wiki/Copy_and_paste_programming
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Copying a working block and tweaking it is fast, but every copy carries the original's bugs, and fixes must be applied to each one. Once the third copy appears, extract the shared part.

## Problem
- Similar functionality is produced by copying existing code and modifying it.
- Bugs are duplicated; fixes reach only some copies.
- The codebase grows without adding capability.

## Solution
- Apply the rule of three: on the third copy, extract a method, class or generic.
- Use parameters, generics or [[Template Method]]/[[Strategy Pattern]] for the varying part.
- Use clone-detection tools in CI.
- Distinguish real duplication of knowledge from coincidental similarity.

## Structure
\`\`\`mermaid
flowchart LR
    O["Original block (with bug)"] -- copy --> C1["Copy 1"]
    O -- copy --> C2["Copy 2"]
    O -- copy --> C3["Copy 3"]
    F["Bug fix"] --> O
    F -. "missed" .-> C2
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Spikes and throwaway code | Production code expected to evolve |
| Early exploration, before the right abstraction is clear |  |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Fast; no design needed | Duplicated bugs and inconsistent fixes |
| Copies can diverge freely | Larger codebase to maintain |

## Related patterns
- **Fix with:** extraction into shared methods or classes; [[Template Method]]; generics
- **Often found with:** [[Repeating Yourself]]; [[Cargo Cult Programming]]
- **Related anti-patterns:** [[Shotgun Surgery]]
- Catalog: [[Software Design Patterns & Anti Patterns#Methodological|Methodological anti-patterns]].
`;export{e as default};
