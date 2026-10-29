const e=`---
type: pattern
category: creational
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Ensures a class has only one instance per key (for example, one connection per database name) and provides a global point of access to those named instances."
aliases:
  - Multiton
  - Registry of Singletons
  - Keyed Singleton
source: https://en.wikipedia.org/wiki/Multiton
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> A multiton is a keyed singleton: a registry that hands out exactly one instance per key, creating it on first request. It shares the singleton's benefits and its drawbacks (global state, hidden dependencies).

## Problem
- You need exactly one instance per configuration key (per tenant, per region, per log category), not one global instance.
- Callers creating their own instances would duplicate expensive resources.

## Solution
- Keep a private, thread-safe map from key to instance (\`ConcurrentDictionary<TKey, Lazy<T>>\`).
- Expose \`GetInstance(key)\` that returns the existing instance or creates and stores one.
- Make the constructor private so instances only come from the registry.

## Structure
\`\`\`mermaid
flowchart LR
    C1["Caller A"] -- "Get('eu')" --> M["Multiton registry"]
    C2["Caller B"] -- "Get('eu')" --> M
    C3["Caller C"] -- "Get('us')" --> M
    M --> EU["Instance 'eu'"]
    M --> US["Instance 'us'"]
\`\`\`

![[Pasted image 20260607123804.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| A small, known set of keyed resources must each be shared | The key space is unbounded (the registry becomes a memory leak) |
| Per-key caches or clients (e.g. \`IHttpClientFactory\` named clients) | A DI container with keyed services can manage the lifetimes instead |

## Trade-offs
| Pro | Con |
| --- | --- |
| One instance per key, created on demand | Global state, hidden dependencies, hard to test |
| Centralized control over keyed resources | Instances are never released unless you add eviction |

## Related patterns
- **Alternatives:** keyed services in a DI container; named options; [[Object Pool]]
- **Often combined with:** [[Lazy Initialization]]; [[Flyweight Pattern]] (shared instances by key)
- **Anti-pattern to watch for:** [[Singleton Pattern]] misuse as global state; [[Object Cesspool]]
- Catalog: [[Software Design Patterns & Anti Patterns#Creational|Creational patterns]].
`;export{e as default};
