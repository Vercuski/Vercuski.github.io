const n=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Encapsulates a request as an object, so requests can be passed around, queued, logged, retried and undone."
aliases:
  - Command
  - Action
  - Transaction Pattern
source:
  - https://en.wikipedia.org/wiki/Command_pattern
  - https://algomaster.io/learn/lld/command
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Turn "do X with these arguments" into an object with an \`Execute()\` method (and optionally \`Undo()\`). The invoker triggers commands without knowing what they do, which enables queues, macros, undo stacks and audit logs. CQRS commands and \`ICommand\` in WPF/MAUI are everyday examples.

## Problem
- UI elements, schedulers or queues need to trigger actions without being coupled to the code that performs them.
- You need undo, retries, logging or deferred execution of operations.

## Solution
- Define a command interface (\`Execute\`, optionally \`Undo\`).
- Each concrete command stores its receiver and parameters.
- The **invoker** (button, queue, scheduler) holds and runs commands.
- Keep executed commands in a history to support undo or replay.

## Structure
\`\`\`mermaid
classDiagram
    class ICommand {
        <<interface>>
        +Execute()
        +Undo()
    }
    class PasteCommand {
        -Document doc
        -string text
        +Execute()
        +Undo()
    }
    class Invoker {
        -Stack~ICommand~ history
        +Run(command)
        +UndoLast()
    }
    class Document
    ICommand <|.. PasteCommand
    PasteCommand --> Document : receiver
    Invoker o-- ICommand
\`\`\`

![[Pasted image 20260607084950.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Undo/redo, macros, or transactional replay | Simple direct calls with no need for queuing, undo or logging |
| Queuing, scheduling or sending operations to other processes | Every method becoming a command class for no benefit |
| Decoupling UI actions from business logic |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Decouples invoker from receiver | Many small classes |
| Supports undo, queuing, logging and retries | Undo logic is hard to get right for side effects |
| Commands compose into macros |  |

## Related patterns
- **Alternatives:** delegates/lambdas (\`Action\`); [[Strategy Pattern]] (algorithm, not a request)
- **Often combined with:** [[Memento Pattern]] (state for undo); [[Mediator Pattern]] (command dispatch); [[CQRS]]; [[Chain of Responsibility]]
- **Anti-pattern to watch for:** [[Poltergeist Anti-Pattern]] (command classes that only call one method)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{n as default};
