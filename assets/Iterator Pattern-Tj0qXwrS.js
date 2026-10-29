const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Provides a way to access the elements of a collection sequentially without exposing how the collection is stored."
aliases:
  - Iterator
  - Cursor
  - Enumerator
source:
  - https://en.wikipedia.org/wiki/Iterator_pattern
  - https://algomaster.io/learn/lld/iterator
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> An iterator tracks the position in a traversal and hands out one element at a time, so clients loop over lists, trees or streams the same way. In C#, \`IEnumerable<T>\`/\`IEnumerator<T>\`, \`foreach\` and \`yield return\` are the built-in implementation.

## Problem
- Clients need to traverse different collections (arrays, trees, paged API results) without knowing their internals.
- Putting traversal logic in the collection limits it to one traversal at a time and one order.

## Solution
- Define an iterator interface (\`MoveNext\`, \`Current\`).
- Each collection creates iterators for itself (\`GetEnumerator()\`).
- Each iterator holds its own traversal state, so several traversals can run at once.
- In C#, write iterator methods with \`yield return\` and let the compiler generate the state machine.

## Structure
\`\`\`mermaid
classDiagram
    class IEnumerable~T~ {
        <<interface>>
        +GetEnumerator() IEnumerator~T~
    }
    class IEnumerator~T~ {
        <<interface>>
        +MoveNext() bool
        +Current T
    }
    class TreeCollection
    class InOrderIterator
    IEnumerable~T~ <|.. TreeCollection
    IEnumerator~T~ <|.. InOrderIterator
    TreeCollection ..> InOrderIterator : creates
    Client --> IEnumerable~T~
\`\`\`

![[Pasted image 20260607085007.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Uniform traversal across different structures | Index-based random access is what's actually needed |
| Several traversal orders or simultaneous traversals |  |
| Lazy streams of data (paging, files, generators) |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Hides collection internals | Modifying a collection during iteration fails or misbehaves |
| Supports lazy evaluation and multiple traversals | Deferred execution can surprise (multiple enumeration, late exceptions) |
| Language support makes it nearly free in C# |  |

## Related patterns
- **Alternatives:** exposing the underlying collection; index-based loops
- **Often combined with:** [[Composite Pattern]] (tree traversal); [[Visitor Pattern]]; [[Factory Method]] (creating iterators); see [[DotNet Collection Interfaces]]
- **Anti-pattern to watch for:** [[Object Orgy]] (exposing internal collections directly)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
