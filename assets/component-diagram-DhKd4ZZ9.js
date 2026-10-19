const e=`---
title: "C4 Model — Level 3: Component Diagram — Project Tapline"
status: approved
owner: Ravi Patel (Principal Engineer, Fare Engine)
version: 1.0.0
last_updated: 2026-09-25
reviewers:
  - Aisha Karimi (Lead Solution Architect) — approved 2026-09-23
  - Journey Team — reviewed 2026-09-24
  - Dana Okafor (Chief Architect) — approved 2026-09-25
tags:
  - component_diagram
  - c4_model
---

# C4 Model — Level 3: Component Diagram — Project Tapline

## 1. Purpose
Zooms into the **Fare Engine**, the container where Tapline's most important business logic lives: building trips, applying transfers and caps, and re-rating late taps. It is the only container drawn at this level for now. The Device Gateway and Ledger Service are candidates for later, if their internals become hard to explain without a diagram.

## 2. Container: Fare Engine

A .NET 10 worker service on AKS. It runs one instance per \`rider-taps\` partition, up to 32 instances, using the Event Hubs processor's partition ownership. Within an instance, taps for different rider keys are processed concurrently, and taps for the same rider key are processed one at a time, in order.

\`\`\`mermaid
flowchart TB
    rt[["rider-taps<br/>(Event Hubs)"]]
    de[["domain-events<br/>(Event Hubs)"]]
    jdb[("Journey DB")]
    pol["Fare Policy Service"]
    gtfs["GTFS reference data"]

    subgraph fe["Fare Engine"]
        consumer["Tap Consumer<br/><i>EventProcessorClient</i>"]
        dedup["Duplicate Filter"]
        sched["Rider-Key Scheduler<br/><i>one queue per rider key</i>"]
        clock["Service-Day Clock"]
        rules["Fare Rule Resolver<br/><i>versioned cache</i>"]
        cat["Fare Category Resolver"]
        builder["Trip Builder"]
        calc["Fare Calculator"]
        cap["Cap Accumulator"]
        rerate["Re-rating Coordinator"]
        repo["Rider Fare Week Repository<br/><i>Dapper, optimistic concurrency</i>"]
        outbox["Outbox Publisher"]
        policyListener["Policy and Eligibility Listener"]
    end

    rt --> consumer --> dedup --> sched
    sched --> rerate
    rerate --> repo
    rerate --> clock
    rerate --> builder
    builder --> rules
    builder --> calc
    calc --> cat
    calc --> rules
    calc --> cap
    rerate --> outbox
    repo <--> jdb
    outbox --> jdb
    outbox --> de
    de --> policyListener
    policyListener --> rules
    policyListener --> cat
    pol -. "startup load" .-> rules
    gtfs -. "operator for route" .-> builder
\`\`\`

## 3. Components
| Component | Responsibility | Depends On |
|---|---|---|
| **Tap Consumer** | Reads taps from its assigned \`rider-taps\` partitions and checkpoints only after a tap's result is committed. | Event Hubs, Duplicate Filter |
| **Duplicate Filter** | Drops taps already processed, using \`tap_id\` against a 7-day processed-tap table and an in-memory bloom filter. | Journey DB |
| **Rider-Key Scheduler** | Gives each rider key its own in-memory queue, so different riders are processed in parallel and the same rider strictly in order. Caps concurrency at 64 rider keys per instance. | Re-rating Coordinator |
| **Re-rating Coordinator** | The entry point for every tap. Loads the rider fare week and decides whether this is a new tap at the end of the timeline (normal rating) or a tap that lands before taps already rated (re-rating). Asks the Trip Builder to rebuild from the earliest affected point, compares the new result with the previous one, and hands the differences to the Outbox Publisher. | Repository, Service-Day Clock, Trip Builder, Outbox Publisher |
| **Service-Day Clock** | Maps a tap's UTC instant to its service day (03:00–02:59 local) and fare week (Monday 03:00 local), using the tap's recorded local offset. | — |
| **Trip Builder** | Groups the week's taps into trips using the transfer window of the operator where each trip began, in tap-time order. Assigns each trip a new trip ID when it is built. | Fare Rule Resolver, GTFS reference data |
| **Fare Calculator** | Prices each trip using the fare rule version in effect at its first tap and the rider's fare category at that time, then applies caps. | Fare Rule Resolver, Fare Category Resolver, Cap Accumulator |
| **Cap Accumulator** | Keeps daily and weekly running totals and reduces a fare so neither cap is exceeded. Pure function of the ordered trip list. | — |
| **Fare Rule Resolver** | Returns the fare rule version in effect at an instant, for an operator. Holds every version in memory: a few hundred, under 5 MB. | Fare Policy Service (load), Policy and Eligibility Listener |
| **Fare Category Resolver** | Returns full or reduced for a rider key at an instant, from eligibility history. | Policy and Eligibility Listener, Journey DB |
| **Policy and Eligibility Listener** | Consumes \`FareRuleVersionPublished\` and \`EligibilityChanged\` to keep the resolvers current. | \`domain-events\` |
| **Rider Fare Week Repository** | Loads and saves the rider fare week aggregate in one transaction with optimistic concurrency (\`row_version\`). Uses Dapper rather than EF Core on this hot path. | Journey DB |
| **Outbox Publisher** | Writes \`FareCalculated\`, \`FareAdjusted\`, \`CapReached\` and \`TripCompleted\` into an outbox table in the same transaction as the aggregate, then relays them to \`domain-events\`. | Journey DB, Event Hubs |

**Design rules for this container**
- **The Trip Builder, Fare Calculator, Cap Accumulator and Service-Day Clock are pure.** They take the week's taps and the rules as input and return trips and fares, with no I/O and no clock reads. This makes them deterministic (NFR-INTEG-01) and testable with property-based tests ([Test Strategy](../../10-testing-and-validation/test-strategy.md)).
- **Normal rating and re-rating are the same code path.** A normal tap is just a re-rate whose earliest affected point is the end of the timeline. That removes a whole class of "the two paths disagree" bugs.
- **Nothing outside the Fare Engine calculates fares.** The app's cap progress and the Payments Service's charges both use the Fare Engine's events.

## 4. Key Interactions
See [Sequence Diagrams §1](../sequence-diagrams.md) (tap to rated fare) and [§5](../sequence-diagrams.md) (re-rating a late tap) for the primary flows through this container.

**Throughput budget** (design capacity of 12,000 taps a minute, i.e. 200 a second, NFR-SCALE-01):

| Step | Budget per tap | Notes |
|---|---|---|
| Load rider fare week | 4 ms | One indexed read (≈ 6 KB) |
| Rebuild and price (pure) | < 1 ms | Typical week has fewer than 40 taps |
| Save week + outbox | 6 ms | One transaction |
| **Total** | **≈ 11 ms** | 64 concurrent rider keys × 8 instances ≈ 46,000 taps a second in theory. Journey DB write capacity is the real limit; load tested at 1,500 taps a second (see [Capacity Planning](../../08-risk-and-operations/capacity-planning.md)). |

> Guidance: Level 4 (Code) diagrams are rarely worth hand-maintaining —
> generate them from IDE tooling if you need them at all.
`;export{e as default};
