const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
  - '[[DotNet & CSharp]]'
status: draft
summary: "Ports and Adapters: the application core exposes ports (interfaces); adapters connect UIs, databases and external systems, so the core runs and tests with no infrastructure."
aliases:
  - Ports and Adapters
  - Ports & Adapters
  - Ports and Adapters Architecture
  - Hexagonal
source: https://alistair.cockburn.us/hexagonal-architecture/
created: 2026-11-13
updated: 2026-11-13
review: 2026-12-19
tags:
  - trade_off
  - to_verify
---
> [!summary] TL;DR
> Alistair Cockburn's **Ports and Adapters** (2005): the application core talks to the outside world only through **ports** (interfaces it owns). **Adapters** plug technologies into those ports: HTTP, a database, a queue, a test harness. The core has no idea which adapter is attached, so it can be driven by tests as easily as by a UI. Onion and Clean Architecture refine the same idea.

## Problem
- Business logic leaks into UI code and into data-access code, so it can't be tested or reused without a running web server and database.
- Swapping a technology (SQL Server to Cosmos DB, REST to gRPC, a vendor API) means editing business code.
- Layered designs treat the database as the "bottom" everything depends on, so the domain ends up shaped by the schema.

## Solution
- Put the use cases and domain model in an **application core** that depends on nothing technical.
- The core declares **ports**:
    - **Driving (primary, inbound) ports:** what the application offers, e.g. \`IPlaceOrder\`. Called *by* the outside.
    - **Driven (secondary, outbound) ports:** what the application needs, e.g. \`IOrderRepository\`, \`IPaymentGateway\`. Implemented *by* the outside.
- **Adapters** translate between a technology and a port:
    - Driving adapters: ASP.NET Core endpoint, gRPC service, message consumer, CLI, test.
    - Driven adapters: EF Core repository, HTTP client to a payment provider, SMTP sender, in-memory fake.
- Wiring happens at the composition root (\`Program.cs\`): pick an adapter for each port.
- The hexagon shape has no meaning beyond "many sides, none special": there is no top or bottom, only inside and outside. Cockburn's point is that the UI and the database are symmetric; both are just adapters.

## Structure
\`\`\`mermaid
flowchart LR
    subgraph Driving["Driving adapters"]
        API[ASP.NET Core endpoint]
        MQ[Message consumer]
        T[Unit test]
    end
    subgraph Core["Application core"]
        IP(["Inbound port<br/>IPlaceOrder"])
        UC[Use case<br/>PlaceOrderHandler]
        DM[Domain model]
        OP1(["Outbound port<br/>IOrderRepository"])
        OP2(["Outbound port<br/>IPaymentGateway"])
        IP --> UC --> DM
        UC --> OP1
        UC --> OP2
    end
    subgraph Driven["Driven adapters"]
        EF[EF Core repository]
        PAY[Stripe HTTP client]
        FAKE[In-memory fakes]
    end
    API --> IP
    MQ --> IP
    T --> IP
    EF -. implements .-> OP1
    PAY -. implements .-> OP2
    FAKE -. implements .-> OP1
\`\`\`

### How it relates to Onion and Clean
| | Hexagonal (2005) | Onion (2008) | Clean (2012) |
| --- | --- | --- | --- |
| Core idea | Inside vs outside, through ports | Concentric layers, dependencies inward | The Dependency Rule across four rings |
| Structure of the core | Not prescribed | Domain model → domain services → application services | Entities → use cases |
| Vocabulary | Ports, adapters, driving/driven | Layers, infrastructure at the edge | Interface adapters, frameworks and drivers |

All three put the domain at the center and invert dependencies on infrastructure. Hexagonal says least about the inside of the core, which makes it the most flexible starting point. See [[Clean Architecture]].

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| Many external dependencies (several databases, queues, third-party APIs) | Simple CRUD where the "domain" is the table |
| You want the core tested fast, without containers or databases | Short-lived tools and prototypes |
| A technology is likely to change, or the same logic must be driven by several channels (API, queue, batch) | The team won't keep ports technology-neutral (an \`IQueryable\` port defeats the point) |
| Long-lived domain with real business rules | |

## Trade-offs
| Pro | Con |
| --- | --- |
| Core is testable in isolation with fakes on every port | More interfaces, DTOs and mapping code |
| Technologies swap behind adapters without touching the core | Port granularity is easy to get wrong (one giant port, or one per method) |
| Symmetric: UI and database get the same treatment | Generic repository ports can leak persistence concerns inward |
| Clear seams for contract and integration tests on each adapter | Indirection can make simple flows harder to follow |

## .NET example
\`\`\`csharp
// Core: ports owned by the application
public interface IPlaceOrder            // driving port
{
    Task<OrderId> Handle(PlaceOrder command, CancellationToken ct);
}

public interface IOrderRepository       // driven port
{
    Task Add(Order order, CancellationToken ct);
}

public interface IPaymentGateway        // driven port
{
    Task<PaymentResult> Charge(Money amount, string customerRef, CancellationToken ct);
}

// Core: use case, depends only on ports
public sealed class PlaceOrderHandler(IOrderRepository orders, IPaymentGateway payments) : IPlaceOrder
{
    public async Task<OrderId> Handle(PlaceOrder cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId, cmd.Lines);
        var payment = await payments.Charge(order.Total, cmd.CustomerRef, ct);
        order.MarkPaid(payment.Reference);
        await orders.Add(order, ct);
        return order.Id;
    }
}

// Driven adapter (Infrastructure project)
public sealed class EfOrderRepository(ShopDbContext db) : IOrderRepository
{
    public async Task Add(Order order, CancellationToken ct)
    {
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
    }
}

// Driving adapter + composition root (Api project)
builder.Services.AddScoped<IPlaceOrder, PlaceOrderHandler>();
builder.Services.AddScoped<IOrderRepository, EfOrderRepository>();
builder.Services.AddHttpClient<IPaymentGateway, StripePaymentGateway>();

app.MapPost("/orders", (PlaceOrder cmd, IPlaceOrder useCase, CancellationToken ct)
    => useCase.Handle(cmd, ct));
\`\`\`
Typical solution layout: \`Shop.Core\` (domain, use cases, ports), \`Shop.Adapters.Persistence\`, \`Shop.Adapters.Payments\`, \`Shop.Api\`. Architecture tests (NetArchTest or ArchUnitNET) assert that \`Shop.Core\` references no adapter project.

## Related patterns
- **Alternatives:** [[Layered Architecture]] · [[Vertical Slice Architecture]]
- **Refinements of the same idea:** [[Onion Architecture]] · [[Clean Architecture]] · [[Entity-Boundary-Control Architecture]]
- **Often combined with:** [[Dependency Injection]] · [[Repository Pattern]] · [[CQRS]] · [[Functional Core, Imperative Shell]]
- **Anti-pattern to watch for:** ports that expose technology types (\`DbSet\`, \`HttpResponseMessage\`), which drags infrastructure back into the core
- Hub: [[Architecture Styles Compared]] · [[Architectural Abstraction]]

## Sources
- Alistair Cockburn, [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) (2005)
- Cockburn and Garrido de Paz, *Hexagonal Architecture Explained* (2024)
- [[Architecture Styles Compared]] (complexity rating and main cost)
`;export{e as default};
