const e=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Combines several observers so that properties on different objects stay synchronized, with a change to one property propagating to the bound ones."
aliases:
  - Binding Properties Pattern
  - Data Binding
  - Property Binding
source: https://en.wikipedia.org/wiki/Binding_properties_pattern
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Two or more properties are bound so that changing one updates the others, one-way or two-way. UI data binding (\`INotifyPropertyChanged\` in WPF and MAUI) is the familiar form. The binding must avoid infinite update loops and handle updates arriving from different threads.

## Problem
- Values held by different objects must stay consistent (a slider and a text box, a view model and a model).
- Writing manual synchronization code for each pair is repetitive and misses updates.

## Solution
- Each source property raises a change notification.
- A binding object observes the source and writes the target (and the reverse for two-way binding).
- Suppress re-entrant updates to prevent ping-pong loops.
- Marshal updates onto the right thread (for example the UI thread).

## Structure
\`\`\`mermaid
flowchart LR
    A["Slider.Value"] -- "PropertyChanged" --> B["Binding"]
    B -- "set" --> T["TextBox.Text"]
    T -- "PropertyChanged" --> B
    B -- "set (two-way)" --> A
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| UI data binding between view and view model | Complex dependency graphs where cascaded updates become unpredictable |
| Keeping derived or mirrored values consistent |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Declarative synchronization | Update loops and cascades |
| Less glue code | Debugging bindings is hard (silent failures) |
|  | Thread-affinity issues |

## Related patterns
- **Alternatives:** explicit update methods; reactive streams (Rx)
- **Often combined with:** [[Observer Pattern]]; [[Mediator Pattern]]
- **Anti-pattern to watch for:** [[Action at a Distance]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{e as default};
