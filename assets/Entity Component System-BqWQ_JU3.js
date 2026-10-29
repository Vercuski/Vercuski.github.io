const e=`---
type: pattern
category: architectural
domain:
  - '[[Design Patterns]]'
  - '[[Architecture]]'
status: draft
summary: "Models objects as plain entity IDs that own data-only components, while systems run the behavior over every entity that has a given set of components."
aliases:
  - ECS
  - Entity-Component-System
source: https://en.wikipedia.org/wiki/Entity_component_system
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> An entity is just an ID, components are plain data attached to it, and systems are loops that process every entity with a matching component set. It replaces deep inheritance hierarchies with composition and lays data out for cache-friendly batch processing, which is why game engines use it.

## Problem
- Game-world objects (player, enemy, projectile, pickup) share behavior in overlapping ways that a class hierarchy can't model without duplication or a diamond of base classes.
- Adding a capability to one kind of object ("this crate can now burn") means changing the hierarchy.
- Objects with virtual methods scattered across the heap are slow to iterate thousands of times per frame.

## Solution
- **Entity:** an identifier with no data or behavior of its own.
- **Component:** a plain data struct (\`Position\`, \`Velocity\`, \`Health\`) attached to an entity; an entity's "type" is just the set of components it has.
- **System:** a function that queries all entities having a component set (e.g. \`Position + Velocity\`) and updates them; systems run in a fixed order each tick.
- A **world** (registry) stores components, often in contiguous arrays per component type or per archetype, so systems iterate memory sequentially.

## Structure
\`\`\`mermaid
flowchart LR
    W["World / registry"] --> E1["Entity 42"]
    W --> E2["Entity 43"]
    E1 --- P1["Position"]
    E1 --- V1["Velocity"]
    E2 --- P2["Position"]
    E2 --- H2["Health"]
    MS["Movement system<br/>Position + Velocity"] -.queries.-> W
    DS["Damage system<br/>Health"] -.queries.-> W
\`\`\`

![[Pasted image 20260618091715.png|601]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Many objects share behavior in mix-and-match combinations (games, simulations) | A typical line-of-business app with a stable domain model |
| Per-frame processing of thousands of objects where cache locality matters | A handful of objects whose behavior is best kept with their data (rich domain model) |
| Designers need to assemble new object kinds from data, without code changes |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Composition replaces brittle inheritance hierarchies | Behavior is far from data, so logic for one "thing" is spread across systems |
| Data-oriented layout gives cache-friendly, parallelizable systems | System ordering and cross-system communication need explicit design |
| New behaviors are new systems; existing ones stay untouched | Steeper learning curve and debugging is harder than plain objects |

## Related patterns
- **Alternatives:** classic object hierarchies; [[Composite Pattern]] plus [[Strategy Pattern]] for component-based objects without a data-oriented store
- **Often combined with:** [[Object Pool]] (recycling entities); [[Observer Pattern]] (events between systems); [[Flyweight Pattern]] (shared assets)
- **Anti-pattern to watch for:** [[God Object]] (a "GameObject" class that does everything); [[Yo-Yo Problem]] in the hierarchies ECS replaces
- Catalog: [[Software Design Patterns & Anti Patterns#Enterprise application patterns|Enterprise application patterns]].
`;export{e as default};
