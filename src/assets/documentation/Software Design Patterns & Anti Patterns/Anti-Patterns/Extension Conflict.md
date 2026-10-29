---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
status: draft
summary: "Plug-ins or extensions that modify the same part of a host system interfere with each other, causing crashes or incorrect behavior when installed together."
aliases:
  - Extension Conflict Anti-Pattern
  - Plug-in Conflict
source: https://en.wikipedia.org/wiki/Extension_conflict
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> Two plug-ins both patch the same function, hook the same event in incompatible ways or ship different versions of a shared library, and the host breaks only when both are installed. Hosts prevent it with well-defined extension points, isolation and version contracts.

## Problem
- Extensions patch or override the same host behavior.
- Shared dependencies in different versions are loaded into one process.
- Failures appear only with particular combinations of extensions.

## Solution
- Offer explicit, versioned extension points instead of letting plug-ins patch internals.
- Isolate plug-ins (`AssemblyLoadContext` in .NET, separate processes).
- Define ordering and conflict rules; detect conflicts at install time.
- Test common extension combinations.

## Structure
```mermaid
flowchart LR
    H["Host app"] --- P["Extension point"]
    E1["Plug-in A<br/>patches Save()"] --> H
    E2["Plug-in B<br/>also patches Save()"] --> H
    H -. "conflict when both installed" .-> X["Crash / wrong behavior"]
```

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Never by choice | Plug-in systems without isolation or contracts |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Open extensibility (the reason plug-ins exist) | Unpredictable failures in combination |
|  | Support burden |

## Related patterns
- **Fix with:** [[Microkernel Architecture]] with defined contracts; isolated load contexts
- **Often found with:** [[Dependency Hell]]; [[DLL Hell]]
- **Related anti-patterns:** [[Extension Object]] misuse
- Catalog: [[Software Design Patterns & Anti Patterns#Configuration management|Configuration management anti-patterns]].
