const e=`---
type: pattern
category: creational
domain:
  - '[[Design Patterns]]'
status: draft
summary: "A class receives the objects it depends on from an external injector, usually through its constructor, instead of creating or locating them itself."
aliases:
  - DI
  - Dependency Injection Pattern
  - Inversion of Control
  - IoC
source: https://en.wikipedia.org/wiki/Dependency_Injection
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> A class declares what it needs (usually as constructor parameters of interface types) and something else, the composition root or a DI container, supplies the implementations. This inverts control over object creation, keeps classes loosely coupled and makes them easy to test with fakes. ASP.NET Core has a built-in container.

## Problem
- A class that calls \`new SqlOrderStore()\` is welded to that implementation and can't be tested without a database.
- Global lookups (static singletons, service locators) hide dependencies and make them hard to replace.

## Solution
- Depend on abstractions and accept them through the constructor (preferred), a property, or a method parameter.
- Wire implementations in one **composition root** at application start-up.
- Let a container manage lifetimes (transient, scoped, singleton) and dispose of objects it created.
- Keep constructors simple: no work beyond storing dependencies.

## Structure
\`\`\`mermaid
flowchart LR
    CR["Composition root<br/>DI container"] -- creates --> Impl["SqlOrderStore"]
    CR -- "injects IOrderStore" --> Svc["OrderService"]
    Svc --> I["IOrderStore"]
    Impl -. implements .-> I
    Test["Unit test"] -- "injects fake" --> Svc
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Classes have collaborators that vary by environment or need fakes in tests | Value objects and simple data types (just \`new\` them) |
| You want lifetimes and disposal managed in one place | Injecting dozens of dependencies: a sign the class does too much |
| Building with ASP.NET Core or another framework that already hosts a container |  |

## Trade-offs
| Pro | Con |
| --- | --- |
| Loose coupling and testability | Runtime wiring errors show up at start-up instead of compile time |
| Dependencies are explicit in the constructor | Container magic can hide how the graph is built |
| Centralized lifetime management | Lifetime mistakes (captive dependencies) cause subtle bugs |

## Related patterns
- **Alternatives:** Service Locator (generally an anti-pattern); [[Factory Method]]; manual constructor wiring ("pure DI")
- **Often combined with:** [[Strategy Pattern]]; [[Repository Pattern]]; [[Decorator Pattern]] (container-registered decorators); [[SOLID Principles]] (dependency inversion)
- **Anti-pattern to watch for:** [[God Object]] (a constructor with ten dependencies); [[Singleton Pattern]] used as global state instead of an injected singleton lifetime
- Context: [[Dependency Injection in ASP.NET Core]]
- Catalog: [[Software Design Patterns & Anti Patterns#Creational|Creational patterns]].
`;export{e as default};
