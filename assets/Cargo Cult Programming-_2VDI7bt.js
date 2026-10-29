const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Code, patterns or rituals are copied into a program without understanding why they exist, so they serve no purpose in the new context or even cause harm."
aliases:
  - Cargo Cult
  - Cargo-Cult Programming
source: https://en.wikipedia.org/wiki/Cargo_cult_programming
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Adding \`ConfigureAwait(false)\` everywhere, wrapping everything in try/catch, or creating interfaces for every class because "that's how it's done" without knowing why is cargo cult programming. Understand the reason for a practice before adopting it, and remove what doesn't apply.

## Problem
- Patterns, snippets and conventions are copied because they appear in other code or tutorials.
- Nobody can explain why the code is there.
- Unneeded code adds noise and sometimes bugs.

## Solution
- Ask "what problem does this solve here?" before adding a pattern or snippet.
- Document the reason for non-obvious practices (ADRs, comments).
- Review and remove ritual code during refactoring.
- Encourage learning the underlying concepts.

## Structure
\`\`\`mermaid
flowchart LR
    T["Tutorial / old project"] -- "copy without understanding" --> C["New code"]
    C --> N["Ritual code: no purpose,<br/>sometimes harmful"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Following a team convention deliberately, while learning why | Copying code you can't explain into production |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Feels safe and fast | Useless or harmful code |
|  | Spreads misconceptions |

## Related patterns
- **Fix with:** understanding first principles; [[Architecture Decision Records]] for conventions
- **Often found with:** [[Copy and Paste Programming]]; [[Golden Hammer]]; [[Programming by Permutation]]
- **Related anti-patterns:** [[Frozen Caveman Anti-Pattern]]
- Catalog: [[Software Design Patterns & Anti Patterns#Programming|Programming anti-patterns]].
`;export{n as default};
