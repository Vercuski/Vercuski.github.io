const e=`---
type: pattern
category: architectural
domain:
  - "[[Architecture]]"
  - "[[System Design]]"
  - "[[Data]]"
status: draft
summary: One coordinator (master/primary/leader) distributes work or writes to identical subordinates (replicas/workers) and owns the authoritative result or state.
aliases:
  - Master-Worker Architecture
  - Primary-Replica Architecture
  - Primary-Secondary
  - Leader-Follower Architecture
  - Leader-Follower
  - Controller-Worker
source: https://en.wikipedia.org/wiki/Master%E2%80%93slave_(technology)
created: 2026-11-15
updated: 2026-11-15
review: 2026-12-30
tags:
  - trade_off
  - to_verify
  - interview
---
> [!summary] TL;DR
> A single **coordinator** controls a set of **identical subordinates**. In the *work distribution* form (master-worker), it splits a job, hands the parts to workers in parallel and combines their results. In the *replication* form (primary-replica, leader-follower), it accepts all writes and copies them to replicas that serve reads. The industry now prefers *primary/replica*, *leader/follower* or *controller/worker* to *master/slave*.

## Problem
- A job is too large or slow for one process, but splits into independent pieces that can run in parallel.
- One database server can't serve all the reads, or a single copy of the data is a single point of failure.
- Many parties writing to the same data must agree on one authoritative order of changes.

## Solution
Two variants share the same shape: one authority, many identical subordinates.

**Work distribution (master-worker, scatter-gather)**
- The master **partitions** the job into tasks and **dispatches** them to workers (directly or through a queue).
- Workers are stateless and identical; they compute and return results.
- The master **aggregates** the results, retries failed or slow tasks, and may launch duplicates of stragglers (speculative execution).
- Examples: MapReduce and Spark (driver and executors), CI build agents, render farms, parallel test runners, \`Parallel.ForEachAsync\` inside one process.

**Data replication (primary-replica, leader-follower)**
- The primary handles **all writes** and ships its change log to replicas.
- Replicas apply the log and serve **reads**, so read capacity scales out.
- **Synchronous** replication waits for replicas before acknowledging (consistent, slower); **asynchronous** acknowledges first (fast, but replicas lag and a failover can lose recent writes).
- On primary failure a replica is **promoted**, manually or by consensus (Raft, Paxos) that elects a new leader.
- Examples: SQL Server Always On availability groups (readable secondaries), PostgreSQL streaming replication, MySQL replication, Redis replicas, MongoDB replica sets, Kafka partition leaders.

**Hardware and control systems** use the same word for bus arbitration: one device initiates communication and the others respond (I²C, SPI, Modbus).

## Structure
\`\`\`mermaid
flowchart TB
    subgraph Work[Work distribution]
        C[Client] --> M[Master]
        M -- task 1 --> W1[Worker]
        M -- task 2 --> W2[Worker]
        M -- task 3 --> W3[Worker]
        W1 & W2 & W3 -- results --> M
    end
    subgraph Data[Data replication]
        APP[Application] -- writes --> P[(Primary)]
        P -- change log --> R1[(Replica)]
        P -- change log --> R2[(Replica)]
        APP -- reads --> R1
        APP -- reads --> R2
    end
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| Work divides into independent tasks (embarrassingly parallel) | Tasks depend heavily on each other's intermediate results |
| Reads far outnumber writes and slightly stale reads are acceptable | Every read must see the latest write and synchronous replication is too slow |
| You need a hot standby for failover | Writes must scale beyond one node: shard instead ([[Shared-Nothing Architecture]]) |
| A single authority simplifies ordering and conflict handling | No node can be trusted as the authority (see [[Peer-to-Peer Architecture]]) |

## Trade-offs
| Pro | Con |
| --- | --- |
| Simple mental model: one authority, no write conflicts | The master or primary is a bottleneck and a single point of failure until failover works |
| Near-linear read or compute scale-out | Replication lag gives stale reads (read-your-writes needs routing rules) |
| Workers and replicas are interchangeable and easy to add | Failover is hard: split brain, lost writes under async replication |
| Accuracy by redundancy: compare results from several workers | Aggregation step can itself become the bottleneck |

## .NET example
**Master-worker in one process** with \`System.Threading.Channels\`: the master queues tasks, a fixed pool of workers consumes them, and the master aggregates.

\`\`\`csharp
var tasks = Channel.CreateBounded<Chunk>(capacity: 100);
var results = new ConcurrentBag<ChunkResult>();

// Workers: identical, stateless
var workers = Enumerable.Range(0, Environment.ProcessorCount).Select(_ => Task.Run(async () =>
{
    await foreach (var chunk in tasks.Reader.ReadAllAsync(ct))
        results.Add(Process(chunk));
}));

// Master: partition and dispatch, then aggregate
foreach (var chunk in Partition(job))
    await tasks.Writer.WriteAsync(chunk, ct);
tasks.Writer.Complete();
await Task.WhenAll(workers);
var total = Aggregate(results);
\`\`\`

**Primary-replica reads** with SQL Server availability groups: send writes to the primary and route read-only work to a secondary with \`ApplicationIntent=ReadOnly\`.

\`\`\`csharp
builder.Services.AddDbContext<WriteDbContext>(o =>
    o.UseSqlServer(cfg.GetConnectionString("Primary")));
builder.Services.AddDbContext<ReadDbContext>(o =>
    o.UseSqlServer(cfg.GetConnectionString("Replica")) // "...;ApplicationIntent=ReadOnly;MultiSubnetFailover=True"
     .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
\`\`\`

Across machines, the same master-worker shape is a queue with competing consumers (Azure Service Bus, RabbitMQ) or an orchestrator such as Durable Functions fan-out/fan-in.

## Related patterns
- **Alternatives:** [[Peer-to-Peer Architecture]] (no central authority); [[Shared-Nothing Architecture]] (partition writes instead of replicating them); [[Space-Based Architecture]]
- **Often combined with:** [[Database Scaling Techniques]] (read replicas, sharding); [[CQRS]] (writes to the primary, queries to replicas); [[Thread Pool]]; [[Pipes and Filters Architecture]] (workers as parallel filters)
- **Anti-pattern to watch for:** reading your own write from a lagging replica; failover without fencing (split brain). See [[CAP Theorem]] and [[Eventual Consistency Patterns]]
- Index: [[Architecture Styles Compared]]. MOC: [[Architecture]]

## Sources
- Wikipedia, *Master–slave (technology)*: https://en.wikipedia.org/wiki/Master%E2%80%93slave_(technology)
- Martin Kleppmann, *Designing Data-Intensive Applications*, ch. 5 (leaders and followers)
- F. Buschmann et al., *Pattern-Oriented Software Architecture, Vol. 1* (Master-Slave pattern)
- Microsoft Learn, *Configure read-only routing for an Always On availability group*: https://learn.microsoft.com/sql/database-engine/availability-groups/windows/configure-read-only-routing-for-an-availability-group-sql-server
`;export{e as default};
