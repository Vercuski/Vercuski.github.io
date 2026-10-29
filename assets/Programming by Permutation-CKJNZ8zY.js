const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Code is changed by trial and error, trying small variations until it seems to work, without understanding why it failed or why the change fixed it."
aliases:
  - Programming by Accident
  - Shotgun Debugging
  - Programming by Coincidence
source: https://en.wikipedia.org/wiki/Programming_by_permutation
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Flipping \`<\` to \`<=\`, adding a \`+1\`, or reordering calls until the test goes green produces code that works by accident and breaks on the next edge case. Reproduce the problem, understand the cause, then make one deliberate fix.

## Problem
- Developers tweak code randomly until tests pass.
- The underlying cause is never understood.
- Fixes are fragile and bugs return in other forms.

## Solution
- Reproduce the bug with a failing test.
- Form a hypothesis and verify it with a debugger or logging.
- Make one deliberate change and explain why it works.
- Pair with someone or ask for review when stuck.

## Structure
\`\`\`mermaid
flowchart LR
    B["Bug"] --> T["Try random change"]
    T --> R{"Test passes?"}
    R -- no --> T
    R -- yes --> S["Ship: cause unknown"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Quick exploration of an unfamiliar API, followed by understanding | Fixing production bugs |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Sometimes finds a fix quickly | Fragile code that works by accident |
|  | No learning; bugs recur |

## Related patterns
- **Fix with:** structured debugging; test-first bug fixes
- **Often found with:** [[Cargo Cult Programming]]; [[Coding by Exception]]
- **Related anti-patterns:** [[Error Hiding]]
- Catalog: [[Software Design Patterns & Anti Patterns#Methodological|Methodological anti-patterns]].
`;export{n as default};
