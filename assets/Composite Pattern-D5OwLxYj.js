const e=`---
type: pattern
category: structural
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Composes objects into tree structures and lets clients treat individual objects and groups of objects uniformly through one interface."
aliases:
  - Composite
  - Object Tree
source:
  - https://en.wikipedia.org/wiki/Composite_pattern
  - https://algomaster.io/learn/lld/composite
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Leaves and containers implement the same component interface, and a container forwards operations to its children. Client code can call \`GetSize()\` on a file or a whole folder without checking which it has. File systems, UI trees and org charts are typical.

## Problem
- Data is naturally a part-whole hierarchy (folders containing files and folders).
- Client code full of \`if (item is Folder)\` checks gets complicated and breaks when new node types appear.

## Solution
- Define a **component** interface with the operations clients need.
- **Leaf** classes implement it directly.
- **Composite** classes implement it by iterating over their children and combining results; they also manage children (add, remove).
- Clients work only with the component interface.

## Structure
\`\`\`mermaid
classDiagram
    class IFileSystemItem {
        <<interface>>
        +GetSize() long
    }
    class File {
        +GetSize() long
    }
    class Folder {
        -List~IFileSystemItem~ children
        +Add(item)
        +GetSize() long
    }
    IFileSystemItem <|.. File
    IFileSystemItem <|.. Folder
    Folder o-- IFileSystemItem : children
\`\`\`

![[Pasted image 20260607084748.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| You need to represent part-whole hierarchies | The structure isn't really a tree |
| Clients should ignore the difference between single objects and groups | Leaves and composites need very different interfaces |
| Operations apply recursively (size, render, price) |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Uniform client code | The common interface can become too general (leaves with meaningless \`Add\`) |
| Easy to add new node types | Hard to restrict which children a composite may contain |
| Recursive operations come naturally |  |

## Related patterns
- **Alternatives:** plain recursive data structures with pattern matching
- **Often combined with:** [[Iterator Pattern]] (walking the tree); [[Visitor Pattern]] (operations over the tree); [[Decorator Pattern]]; [[Builder Pattern]] (building trees); [[Flyweight Pattern]] (shared leaves)
- **Anti-pattern to watch for:** [[Interface Bloat]] (child-management methods forced onto leaves)
- Catalog: [[Software Design Patterns & Anti Patterns#Structural|Structural patterns]].
`;export{e as default};
