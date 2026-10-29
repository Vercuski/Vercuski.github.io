const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Architecture]]'
status: draft
summary: "Code validates or sanitizes user input in an ad hoc, inconsistent way, so invalid or malicious input slips through somewhere."
aliases:
  - Input Kludge Anti-Pattern
source:
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Each screen or endpoint handles input its own way, if at all, so some paths trim, some check length, and some forget entirely. The result is crashes on odd input and security holes such as injection. Validate at the boundary, consistently, with one mechanism.

## Problem
- Validation logic is scattered, duplicated and incomplete across entry points.
- Edge cases (empty strings, Unicode, huge values, special characters) cause failures or vulnerabilities.

## Solution
- Validate all input at the system boundary with a single mechanism (e.g. FluentValidation, data annotations, a validation pipeline behavior).
- Use allow-lists and typed parsing instead of ad hoc string checks.
- Parameterize queries and encode output rather than "sanitizing" strings.
- Test with fuzzing and boundary cases.

## Structure
\`\`\`mermaid
flowchart LR
    I1["Form A<br/>trims only"] --> S["Core logic"]
    I2["API B<br/>no checks"] --> S
    I3["Import C<br/>length check"] --> S
    S --> X["Crashes, injection,<br/>bad data"]
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Never acceptable for production input | Any user- or partner-supplied data |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Quick to write each check inline | Security vulnerabilities |
|  | Inconsistent behavior and data quality |
|  | Duplicated validation logic |

## Related patterns
- **Fix with:** validation in a [[Pipeline Pattern]] behavior; [[Specification Pattern]]; typed request models
- **Often found with:** [[Magic Pushbutton]]; [[Repeating Yourself]]
- **Related anti-patterns:** [[Error Hiding]]
- Catalog: [[Software Design Patterns & Anti Patterns#Generic|Generic anti-patterns]].
`;export{n as default};
