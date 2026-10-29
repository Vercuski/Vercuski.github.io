const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Lets several independent specialist components (knowledge sources) solve a problem together by reading and writing partial solutions on a shared data store, under a controller that picks who acts next."
aliases:
  - Blackboard
  - Blackboard System
source: https://en.wikipedia.org/wiki/Blackboard_(design_pattern)
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> A shared blackboard holds the current state of a problem. Independent knowledge sources watch it, and when one can contribute it writes a partial result; a controller decides which source runs next. It suits problems with no fixed algorithm, such as speech recognition, sensor fusion and some AI planning.

## Problem
- A problem needs many kinds of expertise and has no deterministic order in which to apply them.
- Hard-wiring the specialists to call each other creates tight coupling and a fixed flow.

## Solution
- A **blackboard** holds the problem state and partial solutions.
- **Knowledge sources** are independent; each checks whether it can contribute and writes results to the blackboard.
- A **controller** monitors the blackboard and schedules the most promising knowledge source.
- Stop when the solution is good enough or no source can contribute.

## Structure
\`\`\`mermaid
flowchart TB
    BB[("Blackboard<br/>shared problem state")]
    K1["Knowledge source:<br/>acoustic"] <--> BB
    K2["Knowledge source:<br/>lexical"] <--> BB
    K3["Knowledge source:<br/>grammar"] <--> BB
    CT["Controller"] -. "schedules" .-> K1 & K2 & K3
    CT -. monitors .-> BB
\`\`\`

![[Pasted image 20260607124702.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Ill-defined problems with many partial, uncertain contributors | A known algorithm or workflow exists (use a pipeline or orchestrator) |
| Specialists should be added or removed independently | Strict performance or determinism requirements |
| Multi-agent AI systems sharing a working memory |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Specialists are decoupled and replaceable | Hard to test and debug: control flow emerges at runtime |
| Supports opportunistic, incremental problem solving | Shared state needs concurrency control |
|  | No guarantee of finding a solution |

## Related patterns
- **Alternatives:** [[Pipeline Pattern]]; [[Mediator Pattern]]; orchestration (see [[Orchestration vs Choreography]])
- **Often combined with:** [[Observer Pattern]] (sources notified of changes); [[Strategy Pattern]]
- **Anti-pattern to watch for:** [[Database-as-IPC]] (a blackboard built on a polled table)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
