const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Captures an object's internal state in a snapshot (memento) without breaking encapsulation, so the object can be restored to that state later."
aliases:
  - Memento
  - Snapshot
  - Token
source: https://en.wikipedia.org/wiki/Memento_pattern
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> The originator creates a memento holding its state; a caretaker stores mementos without looking inside; the originator can later restore from one. It's the standard way to build undo and checkpoints. Immutable C# records make snapshots cheap.

## Problem
- You need undo or rollback, but exposing an object's internal fields so something else can save them breaks encapsulation.

## Solution
- The **originator** has \`Save()\` returning a memento and \`Restore(memento)\`.
- The **memento** holds the state and is opaque to everyone but the originator.
- The **caretaker** (undo stack, history) stores mementos and decides when to restore.
- Limit history size or store diffs when state is large.

## Structure
\`\`\`mermaid
classDiagram
    class Editor {
        -string content
        -int cursor
        +Save() EditorMemento
        +Restore(memento)
    }
    class EditorMemento {
        <<record>>
        content
        cursor
    }
    class History {
        -Stack~EditorMemento~ snapshots
        +Push(memento)
        +Pop() EditorMemento
    }
    Editor ..> EditorMemento : creates
    History o-- EditorMemento
\`\`\`

![[Pasted image 20260607085035.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Undo/redo or checkpoints | State is huge and snapshots are frequent (memory cost) |
| Transactional rollback of an in-memory object | State includes external resources that can't be restored |
| State must stay encapsulated |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Preserves encapsulation | Memory cost of snapshots |
| Simplifies the originator (caretaker manages history) | Caretaker can't know how expensive a memento is |

## Related patterns
- **Alternatives:** [[Command Pattern]] with inverse operations; event sourcing (see [[Distributed Systems Pattern Catalog]])
- **Often combined with:** [[Command Pattern]] (undo); [[Iterator Pattern]] (state of a traversal); [[Prototype Pattern]]
- **Anti-pattern to watch for:** [[Object Orgy]] (public state instead of a memento)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
