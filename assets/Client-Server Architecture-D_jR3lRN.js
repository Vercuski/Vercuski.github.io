const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
  - '[[System Design]]'
status: draft
summary: "Clients request services; servers own the resources and answer. The base topology under the web, databases and most APIs, from two-tier fat clients to N-tier."
aliases:
  - Client/Server Architecture
  - Client Server
  - Two-Tier Architecture
  - Three-Tier Architecture
source: https://en.wikipedia.org/wiki/Client%E2%80%93server_model
created: 2026-11-13
updated: 2026-11-15
review: 2026-12-21
tags:
  - trade_off
  - to_verify
---
> [!summary] TL;DR
> The foundational distributed topology: **clients** start requests, **servers** own the shared resources (data, compute, business rules) and respond. Most other styles sit on top of it. Its main design choices are how many tiers there are and how much logic lives on the client (thick) versus the server (thin). Its main risk is a server that becomes a bottleneck or single point of failure.

## Problem
- Many users need shared access to data and services that must be secured, kept consistent and managed in one place.
- Clients on different devices shouldn't each hold their own copy of the data and business rules.

## Solution
- **Roles are asymmetric:** clients initiate, servers listen. A server can itself be a client of another server (a web server calling a database).
- **Tiers** are physical deployment boundaries (not to be confused with *layers*, which are logical; see [[Layered Architecture]] and [[Logical vs Physical Architecture]]):

| Variant | Shape | Era / example |
| --- | --- | --- |
| **One-tier** | UI, logic and data on one machine | Desktop apps with a local file or SQLite |
| **Two-tier** | Thick client (UI + logic) → database server | 1990s VB6/PowerBuilder/Delphi apps on SQL Server; stored procedures as the "server tier" |
| **Three-tier** | Thin client → application server → database | Classic web apps; ASP.NET + SQL Server |
| **N-tier** | Adds tiers: CDN, API gateway, cache, services | Modern web and mobile backends |

- **Thick vs thin client:** thick clients (desktop, SPA, mobile) give rich, responsive UIs and offline use but duplicate validation and need distribution and versioning. Thin clients (server-rendered HTML) centralize logic but depend on the network for every interaction.
- **Stateless servers scale out**: if session state lives in the client (token) or an external store (Redis), any server instance can serve any request behind a load balancer. This is the "stateless" constraint in [[REST Architectural Style]].
- **Contrast with peer-to-peer:** P2P nodes are both client and server and there is no central authority. See [[Peer-to-Peer Architecture]].
- **Communication** is usually request/response (HTTP, gRPC, TDS for SQL Server) but can add server push (WebSockets, SignalR, Server-Sent Events).

## Structure
\`\`\`mermaid
flowchart LR
    subgraph Clients
        B[Browser SPA]
        M[Mobile app]
        D[Desktop app]
    end
    LB[Load balancer]
    subgraph AppTier["Application tier (stateless)"]
        S1[API instance 1]
        S2[API instance 2]
    end
    DB[(Database tier)]
    C[(Cache)]
    B & M & D --> LB --> S1 & S2
    S1 & S2 --> C
    S1 & S2 --> DB
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| Data or rules must be centrally owned, secured and audited | Clients must work fully offline and sync later (consider local-first or P2P sync) |
| Many clients share one data set | No organization can or should run a central server (P2P) |
| You need central updates without redeploying clients (thin clients) | Extreme fan-out where a central server is the bottleneck and can't scale out |

## Trade-offs
| Pro | Con |
| --- | --- |
| Central control of data, security and versioning | Server is a bottleneck and single point of failure unless replicated |
| Simple mental model; every developer knows it | Network latency on every call; chatty clients suffer |
| Clients can be thin and cheap | Thick clients need distribution, update and compatibility strategy |
| Stateless servers scale horizontally | Stateful servers (sticky sessions) limit scaling and failover |

## .NET example
Three-tier: Blazor WebAssembly client → ASP.NET Core API → SQL Server, with the API kept stateless.
\`\`\`csharp
// Server (application tier): stateless, so any instance can serve any request
builder.Services.AddDbContext<ShopDb>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("Shop")));
builder.Services.AddStackExchangeRedisCache(o => o.Configuration = builder.Configuration["Redis"]);
builder.Services.AddAuthentication().AddJwtBearer();   // client carries identity; no server session

app.MapGet("/products/{id:int}", async (int id, ShopDb db, CancellationToken ct) =>
    await db.Products.FindAsync([id], ct) is { } p ? Results.Ok(p) : Results.NotFound());

// Client tier (Blazor WASM): a typed HttpClient to the server
public sealed class ProductsClient(HttpClient http)
{
    public Task<Product?> Get(int id, CancellationToken ct) =>
        http.GetFromJsonAsync<Product>($"products/{id}", ct);
}
\`\`\`

## Related patterns
- **Alternatives:** [[Peer-to-Peer Architecture]]
- **Often combined with:** [[Layered Architecture]] (logical layers deployed as tiers); [[REST Architectural Style]]; [[Broker Architecture]]
- **Anti-pattern to watch for:** chatty clients that ignore the [[Fallacies of Distributed Computing]]
- **Context:** [[Logical vs Physical Architecture]] · [[Scalability]]
- Index: [[Architecture Styles Compared]]. MOC: [[Architecture]]

## Sources
- [Client–server model](https://en.wikipedia.org/wiki/Client%E2%80%93server_model) (Wikipedia)
- Roy T. Fielding, [Architectural Styles and the Design of Network-based Software Architectures](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm) (2000), chapter 3 (client-server and layered client-server styles)
- [[Architecture Styles Compared]] (style list)
`;export{e as default};
