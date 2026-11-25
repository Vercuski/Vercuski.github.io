const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
  - '[[DotNet & CSharp]]'
status: draft
summary: "Organize code by feature, not layer: each request's endpoint, handler, mapping and validation live in one slice; add Domain and Infrastructure projects only when needed."
aliases:
  - VSA
  - Vertical Slices
  - Vertical Slice
  - Feature Slices
  - Feature Folders
  - VSA + Clean Architecture
  - Vertical Slices vs Clean Architecture
source: '[[Clean Architecture vs Vertical Slices (Anton Martyniuk)]]'
created: 2026-11-02
updated: 2026-11-07
review: 2026-11-16
tags:
  - trade_off
  - to_verify
---
> [!summary] TL;DR Group code by **feature**, not by layer. Each use case (Create Shipment, Get Shipment) is a slice holding its own endpoint, handler, mapping and validators, so a change to one feature stays in one folder. Start with pure slices in a single API project; when domain rules grow, keep the slices and add separate **Domain** and **Infrastructure** projects, with slices talking through a **PublicApi** and side effects going through **events**.

## Problem

- In layer-first designs ([[Clean Architecture]], [[Onion Architecture]], [[Layered Architecture]]) one endpoint is split into controller, service, repository and DTO, often across four projects.
- A small feature change touches several projects ([[Shotgun Surgery]]), and many layers only forward calls ([[Lasagna Code]]).
- Understanding one feature means hopping across the solution, for people and for AI coding agents alike.

## Solution

- One folder per feature or use case, containing everything that request needs: Endpoint, Handler, Mapping, Validators.
- Slices are independent and kept small; shared code is extracted only when duplication actually hurts.
- Each slice chooses its own data access (for example, querying \`DbContext\` directly rather than through a mandatory repository).
- **Hybrid (VSA + Clean Architecture):** slices stay in the app (API) project. A Domain project holds entities, value objects and domain events; an Infrastructure project holds the \`DbContext\`, persistence and external services. Slices use another slice or module only through its PublicApi contract, and side effects travel as events.

### Origin and principles

- **Origin:** named by Jimmy Bogard, who describes it as cutting the application "vertically": one slice runs from the endpoint down to the database.
- **Axis of change:** code that changes together lives together. Changing a feature's behavior means touching one slice, not one file in each layer folder.
- **Duplication over the wrong abstraction:** avoid generic, multi-layer abstractions (base services, generic repositories); write straightforward feature-specific code and extract shared code later.
- **Commands and queries separate naturally:** each slice is one request/handler pair → [[CQRS]].

## Structure

### Pure vertical slices

\`\`\`mermaid
flowchart TB
    subgraph APP["Application (App / API Project)"]
        direction LR
        subgraph CS["Create Shipment"]
            direction TB
            cs1[Endpoint] ~~~ cs2[Handler] ~~~ cs3[Mapping] ~~~ cs4[Validators]
        end
        subgraph GS["Get Shipment"]
            direction TB
            gs1[Endpoint] ~~~ gs2[Handler] ~~~ gs3[Mapping] ~~~ gs4[Validators]
        end
        subgraph US["Update Shipment"]
            direction TB
            us1[Endpoint] ~~~ us2[Handler] ~~~ us3[Mapping] ~~~ us4[Validators]
        end
    end
    R["★ Best default for most .NET apps"]
    APP ~~~ R

    classDef proj fill:#e3ecfb,stroke:#3b6fd8,color:#1c3c7a
    classDef slice fill:#f4f7fd,stroke:#3b6fd8,color:#1c3c7a
    classDef part fill:#ffffff,stroke:#9fb6e6,color:#1c3c7a
    classDef result fill:#3b6fd8,stroke:#1c3c7a,color:#ffffff
    class APP proj
    class CS,GS,US slice
    class cs1,cs2,cs3,cs4,gs1,gs2,gs3,gs4,us1,us2,us3,us4 part
    class R result
\`\`\`

### VSA + Clean Architecture

\`\`\`mermaid
flowchart TB
    subgraph APP["App (API) Project"]
        direction LR
        subgraph CS["Create Shipment"]
            direction TB
            cs1[Endpoint] ~~~ cs2[Handler] ~~~ cs3[Mapping] ~~~ cs4[Validators]
        end
        subgraph GS["Get Shipment"]
            direction TB
            gs1[Endpoint] ~~~ gs2[Handler] ~~~ gs3[Mapping] ~~~ gs4[Validators]
        end
        subgraph US["Update Shipment"]
            direction TB
            us1[Endpoint] ~~~ us2[Handler] ~~~ us3[Mapping] ~~~ us4[Validators]
        end
    end

    subgraph DOM["Domain Project"]
        direction TB
        d1[Entities] ~~~ d2[Value Objects] ~~~ d3[Domain Events]
    end

    subgraph INF["Infrastructure Project"]
        direction TB
        i1[DbContext] ~~~ i2[Persistence] ~~~ i3[External Services]
    end

    CS --> DOM
    GS --> DOM
    US --> INF
    GS -. "PublicApi" .-> CS
    GS -.-> US
    INF -- "Events" --> US

    R["★ Use when complexity justifies it"]
    DOM ~~~ R

    classDef proj fill:#fdf3d8,stroke:#d4a017,color:#5c4300
    classDef slice fill:#ece8fb,stroke:#7b68c8,color:#2e2266
    classDef dom fill:#ece8fb,stroke:#7b68c8,color:#2e2266
    classDef infra fill:#e3f5e6,stroke:#3a9a4f,color:#1d4d27
    classDef part fill:#ffffff,stroke:#b7b0d9,color:#2e2266
    classDef result fill:#d4a017,stroke:#5c4300,color:#ffffff
    class APP proj
    class CS,GS,US slice
    class DOM dom
    class INF infra
    class cs1,cs2,cs3,cs4,gs1,gs2,gs3,gs4,us1,us2,us3,us4,d1,d2,d3,i1,i2,i3 part
    class R result
\`\`\`

### Typical folder layout

\`\`\`text
MyApp/
├── Features/
│   ├── Products/
│   │   ├── Create/
│   │   │   ├── CreateProductCommand.cs
│   │   │   ├── CreateProductHandler.cs
│   │   │   └── CreateProductEndpoint.cs
│   │   ├── GetById/
│   │   └── Delete/
│   └── Orders/
│       ├── ShipOrder/
│       └── CancelOrder/
├── Common/      ← truly global infrastructure only (e.g. pipeline behaviors)
├── Data/        ← AppDbContext and shared entities
└── Program.cs
\`\`\`

## When to use / when not to

|Use when|Avoid when|
|---|---|
|Most API-style .NET apps; the source's recommended default|Rich business rules shared by many features: move to the hybrid and add a Domain project|
|You want a feature change to stay in one folder|Nothing stops slices reaching into each other's internals (add architecture tests first)|
|AI-assisted development, where an agent can load one feature folder||
|Hybrid: complexity justifies separate Domain and Infrastructure projects||

## Trade-offs

|Pro|Con|
|---|---|
|A feature change stays in one place|Some logic gets duplicated across slices|
|Small, focused classes per request|Without rules, slices couple directly to each other|
|Easy for humans and AI agents to navigate|Cross-cutting concerns (auth, logging, transactions) move to middleware or pipeline behaviors|
|Layers added only where complexity calls for them|Less familiar to teams raised on layered templates|
|Remove a feature by deleting its folder|"God slices" that grow to do too much; split them by use case|
|A new developer can learn a feature from one folder|Logic leaks back into shared controllers or \`Common/\` without discipline|

### Layered vs vertical slice

||Layered (N-tier / Clean)|Vertical slice|
|---|---|---|
|Organized by|Technical concern (\`Controllers/\`, \`Services/\`, \`Repositories/\`)|Feature or use case (\`Features/Products/Create/\`)|
|Adding a feature|Files in several layers or projects|Mostly one feature folder|
|Refactoring risk|Shared services and repositories can break unrelated features|Changes stay inside the slice|
|Tracing one request|Jump across 4+ folders|Endpoint, handler and logic side by side|

## .NET example

One slice as a minimal API endpoint with FluentValidation and EF Core (\`Shipment\` and \`ShippingDbContext\` are assumed):

\`\`\`csharp
// Features/Shipments/CreateShipment.cs: everything for this request in one place
public static class CreateShipment
{
    public sealed record Request(string OrderId, string Address);
    public sealed record Response(Guid Id);

    public sealed class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.OrderId).NotEmpty();
            RuleFor(x => x.Address).NotEmpty();
        }
    }

    public static void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("/shipments", Handle);

    private static async Task<IResult> Handle(
        Request request,
        IValidator<Request> validator,
        ShippingDbContext db,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var shipment = new Shipment(request.OrderId, request.Address); // mapping
        db.Shipments.Add(shipment);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/shipments/{shipment.Id}", new Response(shipment.Id));
    }
}
\`\`\`

## Related patterns

- **Alternatives:** [[Clean Architecture]]; [[Onion Architecture]]; [[Layered Architecture]]
- **Often combined with:** [[CQRS]] (each slice is one command or query); [[Modular Monolith Rules in DotNet]] (slices inside modules, public APIs, events for side effects); [[Architecture Governance Tests]] (keep slices from referencing each other)
- **Anti-pattern to watch for:** [[Lasagna Code]] and [[Shotgun Surgery]], which VSA is meant to avoid; slices calling into another slice's internals
- **See also:** [[7 .NET Habits to Reconsider]] (layer-first folders); [[Architecture Styles Compared]]

## Sources

- [[Clean Architecture vs Vertical Slices (Anton Martyniuk)]]
- [[Vertical Slice Architecture (AI Overview)]]
- Jimmy Bogard, [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/) (the original essay)
- Milan Jovanović, [Vertical Slice Architecture](https://milanjovanovic.tech/blog/vertical-slice-architecture)
- Adrián Bailador, [Vertical Slice Architecture](https://adrianbailador.github.io/blog/47-vertical-slice-architecture/)
- Reference .NET template: [nadirbad/VerticalSliceArchitecture](https://github.com/nadirbad/VerticalSliceArchitecture)
`;export{e as default};
