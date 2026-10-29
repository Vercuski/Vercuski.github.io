const e=`---
type: pattern
category: behavioral
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Defines a one-to-many dependency so that when one object (the subject) changes state, all its registered observers are notified automatically."
aliases:
  - Observer
  - Publish/Subscribe
  - Pub/Sub
  - Publish-Subscribe
  - Event Listener
source:
  - https://en.wikipedia.org/wiki/Observer_pattern
  - https://en.wikipedia.org/wiki/Publish/subscribe
  - https://algomaster.io/learn/lld/observer
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Observers subscribe to a subject, and the subject notifies all of them on each change without knowing what they do. C# events, \`IObservable<T>\`/\`IObserver<T>\` and Rx are built-in forms; across processes the same idea becomes publish/subscribe messaging.

## Problem
- When one object changes, an unknown or changing set of other objects must react.
- Having the subject call each dependent directly couples it to all of them.

## Solution
- The subject keeps a list of observers and offers subscribe/unsubscribe.
- On a state change, it notifies each observer (push the data, or let observers pull it).
- Observers implement a notification interface (or a C# event handler).
- Unsubscribe deterministically to avoid leaks.

## Structure
\`\`\`mermaid
classDiagram
    class IObserver {
        <<interface>>
        +Update(price)
    }
    class StockTicker {
        -List~IObserver~ observers
        +Subscribe(o)
        +Unsubscribe(o)
        -Notify()
    }
    class Dashboard
    class AlertService
    StockTicker o-- IObserver
    IObserver <|.. Dashboard
    IObserver <|.. AlertService
\`\`\`

![[Pasted image 20260607085053.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Changes in one object must update others that the subject shouldn't know | Ordering of reactions matters and must be guaranteed |
| UI binding, domain events, plug-in hooks | Chains of observers that trigger each other (cascading updates) |
| In-process events (use messaging across processes) |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Loose coupling between subject and observers | Memory leaks from forgotten subscriptions (lapsed listener) |
| Add observers without changing the subject | Unpredictable notification order and cascades |
|  | Harder to trace what happens on a change |

## Related patterns
- **Alternatives:** [[Mediator Pattern]]; polling; [[Point-to-Point vs Publish-Subscribe Messaging]] for cross-service events
- **Often combined with:** [[Binding Properties]]; [[Event-Driven Architecture]]; [[Command Pattern]]; [[Mediator Pattern]]
- **Anti-pattern to watch for:** [[Action at a Distance]]; [[Swarm of Gnats Anti-Pattern]] (too many fine-grained events)
- Catalog: [[Software Design Patterns & Anti Patterns#Behavioral|Behavioral patterns]].
`;export{e as default};
