const e=`---
type: pattern
category: structural
domain:
  - '[[Design Patterns]]'
status: draft
summary: "Converts the interface of an existing class into the interface a client expects, so classes with incompatible interfaces can work together."
aliases:
  - Adapter
  - Wrapper
  - Translator
  - Wrapper Pattern
source:
  - https://en.wikipedia.org/wiki/Adapter_pattern
  - https://algomaster.io/learn/lld/adapter
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> An adapter wraps an existing object and exposes the interface the client wants, translating each call. It lets you reuse a third-party or legacy class without changing it or the client. The enterprise integration equivalent is the message translator.

## Problem
- A useful class (third-party SDK, legacy component) has the right behavior but the wrong interface for your code.
- Changing the client or the class to match is impossible or would spread a foreign API through your codebase.

## Solution
- Define the **target** interface your client uses.
- Write an adapter that implements the target and holds a reference to the **adaptee**.
- Each target method translates arguments, calls the adaptee, and translates results and errors back.
- Prefer the object adapter (composition) over the class adapter (inheritance), which C# can't do for classes anyway.

## Structure
\`\`\`mermaid
classDiagram
    class Client
    class IPaymentGateway {
        <<interface>>
        +Charge(amount) Result
    }
    class StripeAdapter {
        -StripeClient client
        +Charge(amount) Result
    }
    class StripeClient {
        +CreatePaymentIntent(cents, currency)
    }
    Client --> IPaymentGateway
    IPaymentGateway <|.. StripeAdapter
    StripeAdapter --> StripeClient : translates to
\`\`\`

![[Pasted image 20260607084715.png]]

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Integrating a third-party or legacy API behind your own interface | You control both sides and can just change the interface |
| Several sources with different interfaces must look the same to the client | The adapter would need to fake behavior the adaptee doesn't really have |
| You want to isolate a vendor so it can be replaced later |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Reuses existing code without modifying it | One more class per adapted interface |
| Keeps foreign APIs out of domain code | Translation can hide mismatched semantics (sync vs async, units, errors) |
| Single place to handle translation and error mapping |  |

## Related patterns
- **Alternatives:** [[Facade Pattern]] (simplifies a subsystem rather than matching an interface); [[Bridge Pattern]] (designed up front, not retrofitted)
- **Often combined with:** [[Decorator Pattern]]; [[Proxy Pattern]]; anti-corruption layer in [[Distributed Systems Pattern Catalog]]; [[Enterprise Integration Patterns]] (message translator)
- **Anti-pattern to watch for:** [[Lasagna Code]] (adapters around your own classes for no reason)
- Catalog: [[Software Design Patterns & Anti Patterns#Structural|Structural patterns]].
`;export{e as default};
