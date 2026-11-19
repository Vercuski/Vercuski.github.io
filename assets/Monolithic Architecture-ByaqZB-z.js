const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
status: draft
summary: "The whole application is built, deployed and scaled as one unit. Simple and cheap to start; layered, modular monolith, microkernel and pipeline are its structured forms."
aliases:
  - Monolith
  - Monolithic Application
  - Unitary Architecture
  - Single Deployment Unit
  - Monolith First
source: https://martinfowler.com/bliki/MonolithFirst.html
created: 2026-11-15
updated: 2026-11-15
review: 2026-12-31
tags:
  - trade_off
  - to_verify
  - interview
---
> [!summary] TL;DR
> One code base becomes **one deployable unit**, usually with one database. Everything runs in the same process, so calls are in-memory, transactions are local and there is one thing to build, test, deploy and monitor. It's the cheapest, simplest starting point. Its risk is that structure erodes as it grows. Give it a structure ([[Layered Architecture]], [[Modular Monolith Architecture]], [[Microkernel Architecture]], [[Pipes and Filters Architecture]]) and keep that structure enforced.

## Problem
- A new product or team needs to ship quickly, on a tight budget, while the domain and its boundaries are still being learned.
- Distributed architectures charge a "distribution tax" (network failures, data consistency, DevOps automation, observability) that small systems can't justify.

## Solution
- Build, test and deploy the application as **one unit**: one process (or several identical instances behind a load balancer), usually one database.
- Communication between parts is **in-process method calls**; transactions are local ACID transactions.
- **Scale by cloning** the whole unit horizontally; every instance runs every feature.
- **Choose an internal structure**, because "monolith" says how it deploys, not how it's organized:

| Structured form | Partitioned by | Note |
| --------------- | -------------- | ---- |
| Layered | Technical layer | [[Layered Architecture]] |
| Modular monolith | Domain module | [[Modular Monolith Architecture]] |
| Microkernel | Core plus plug-ins | [[Microkernel Architecture]] |
| Pipeline | Processing step | [[Pipes and Filters Architecture]] |

- **Monolith first** (Martin Fowler): start monolithic, find stable boundaries, then extract services only where scaling or team autonomy needs them. A [[Sacrificial Architecture]] is a monolith built to be replaced.
- Inside, code can still be organized with [[Clean Architecture]], [[Onion Architecture]], [[Hexagonal Architecture]] or [[Vertical Slice Architecture]].

## Structure
\`\`\`mermaid
flowchart TB
    LB[Load balancer] --> I1
    LB --> I2
    subgraph I1[Instance 1: whole application]
        A1[UI] --> B1[Business logic] --> C1[Data access]
    end
    subgraph I2[Instance 2: identical copy]
        A2[UI] --> B2[Business logic] --> C2[Data access]
    end
    C1 --> DB[(Single database)]
    C2 --> DB
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| MVPs, startups, small teams, tight time or budget | Many teams need to release independently |
| The domain and its boundaries are still unclear | Parts have very different scaling, availability or technology needs |
| Strong consistency across the whole data model matters | Fault isolation is critical: one memory leak takes down everything |
| Operational maturity (CI/CD, observability) is still low | Build and test times have grown beyond what the team tolerates |

## Trade-offs
| Pro | Con |
| --- | --- |
| Lowest cost and complexity; one thing to deploy and monitor | Deploys and scales as a whole: one change redeploys everything |
| In-memory calls: fast, no network failures | Coupling grows unless boundaries are enforced |
| Local ACID transactions; simple debugging and end-to-end tests | Low fault isolation and elasticity |
| Easy refactoring across the whole code base | Locked to one technology stack; long builds and start-up times at scale |

## .NET example
One ASP.NET Core host contains every feature; structure comes from projects or folders inside it, not from separate deployments.

\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("App")));

// Every feature registers into the same process
builder.Services.AddOrdering();
builder.Services.AddBilling();
builder.Services.AddCatalog();

var app = builder.Build();
app.MapOrderingEndpoints();
app.MapBillingEndpoints();
app.MapCatalogEndpoints();
app.Run();
\`\`\`

Keep the monolith healthy with architecture tests (NetArchTest, ArchUnitNET) that forbid cross-feature references: see [[Modular Monolith Rules in DotNet]] and [[Architecture Governance Tests]].

## Related patterns
- **Alternatives:** [[Service-Based Architecture]]; [[Microservices Architecture]]; [[Self-Contained Systems]]
- **Structured forms:** [[Layered Architecture]] · [[Modular Monolith Architecture]] · [[Microkernel Architecture]] · [[Pipes and Filters Architecture]]
- **Often combined with:** [[Legacy Migration Approaches]] (strangler fig out of a monolith); [[Sacrificial Architecture]]
- **Anti-pattern to watch for:** [[Big Ball of Mud]] (an unstructured monolith); the distributed monolith (services that must deploy together, with the costs of both styles)
- **Context:** [[Monolithic vs Distributed Architecture]] · [[Domain vs Technical Partitioning]]
- Index: [[Architecture Styles Compared]]. MOC: [[Architecture]]

## Sources
- Martin Fowler, *MonolithFirst* (2015): https://martinfowler.com/bliki/MonolithFirst.html
- Mark Richards and Neal Ford, *Fundamentals of Software Architecture* (monolithic vs distributed styles)
- Chris Richardson, *Pattern: Monolithic Architecture*: https://microservices.io/patterns/monolithic.html
`;export{e as default};
