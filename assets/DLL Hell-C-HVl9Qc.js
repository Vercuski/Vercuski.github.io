const n=`---
type: pattern
category: anti-pattern
domain:
  - '[[Design Patterns]]'
  - '[[Engineering Practices]]'
  - '[[DotNet & CSharp]]'
status: draft
summary: "Windows applications break because shared DLLs are overwritten or registered with incompatible versions, a form of dependency hell from before side-by-side assemblies."
aliases:
  - DLL Hell Anti-Pattern
source: https://en.wikipedia.org/wiki/DLL_hell
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - anti_pattern
---
> [!summary] TL;DR
> One installer replaces a shared system DLL and other applications that relied on the old version stop working. .NET's strong-named assemblies, the GAC and side-by-side manifests addressed it; modern .NET avoids it with app-local dependencies and self-contained deployment.

## Problem
- Applications share DLLs in a common location.
- Installing or updating one application replaces a DLL others depend on.
- COM registration points every application to a single version.

## Solution
- Deploy dependencies app-locally (modern .NET does this by default).
- Use self-contained or framework-dependent deployment with version roll-forward rules.
- Use side-by-side assemblies and manifests for native components.
- Containerize applications with conflicting native dependencies.

## Structure
\`\`\`mermaid
flowchart LR
    I["Installer for App B"] -- "overwrites" --> S[("C:\\Windows\\System32\\shared.dll")]
    A["App A (needs old version)"] --> S
    B["App B (needs new version)"] --> S
    S -. "App A breaks" .-> A
\`\`\`

## When to use / when not to
| Tolerable when | Harmful when |
| --- | --- |
| Never by choice | Shared, global installation of native libraries |

## Trade-offs
| Why it's tempting | What it costs |
| --- | --- |
| Disk and memory savings from sharing (historically) | Applications broken by unrelated installs |

## Related patterns
- **Fix with:** app-local deployment; containers; self-contained .NET apps
- **Often found with:** [[Dependency Hell]]; [[JAR Hell]]
- **Related anti-patterns:** [[Extension Conflict]]
- Catalog: [[Software Design Patterns & Anti Patterns#Configuration management|Configuration management anti-patterns]].
`;export{n as default};
