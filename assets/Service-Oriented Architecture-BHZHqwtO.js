const e=`---
type: pattern
category: architectural
domain:
  - '[[Architecture]]'
  - '[[System Design]]'
status: evergreen
summary: "Shares core functionality across enterprise systems via a strict service taxonomy and an enterprise service bus, trading cost, agility and performance for interoperability."
aliases:
  - SOA
  - Service Oriented Architecture
  - Service-Oriented
  - Enterprise Service Bus
  - ESB
source: '[[Lesson 164 — Service Oriented Architecture]]'
created: 2026-10-07
updated: 2026-11-15
review: 2027-11-23
tags:
  - trade_off
---
> [!summary] TL;DR
> SOA shares **core functionality across enterprise systems**: business services are implemented by coarse, shareable enterprise services, glued by an **enterprise service bus** that orchestrates and choreographs them. It excels at abstraction and interoperability between heterogeneous systems, but cost, low agility, slowness and poor testability ended its popularity. It isn't the same as service-based architecture.

## Problem
- The same core functionality (customer, policy, billing) is duplicated across systems, departments and divisions.
- Heterogeneous platforms and protocols (mainframe, Java, .NET, SOAP, REST) must take part in a single business workflow.

## Solution
- **Definition:** core functionality shared across multiple enterprise systems; born from functionality duplicated across systems, departments, divisions or the enterprise.
- **Not service-based, not "REST services":** much different from [[Service-Based Architecture]]; early REST implementations got labelled "service-oriented", muddying the term.
- **Strict service taxonomy:**
  - **Business services:** abstract, defined by business users; input and output descriptions only (XML, WSDL), no functionality.
  - **Enterprise services:** implement business services; coarse-grained and eligible to be shared across the enterprise.
  - **Application services:** fine-grained, belonging to one application.
  - **Infrastructure (shared) services:** cross-cutting concerns like auditing and monitoring.
- **Enterprise service bus (message bus):** the glue, unique to SOA. **Process choreography** coordinates business services for one business request; the **service orchestrator** coordinates the enterprise services behind a business service. These early definitions blurred orchestration vs choreography; microservices later clarified them.
- **Protocol-agnostic heterogeneous interoperability:** any UI on any platform and protocol can reach enterprise services on entirely different platforms, languages and protocols, and each system can evolve independently.
- **Shared services cut both ways:** changing one shared service can break every system that uses it, which hurts agility and time to market.
- **Is an ESB still relevant? (Lesson 154):** yes. Its capabilities, workflow orchestration, protocol-agnostic communication and contract decoupling (message transformation and enhancement), still address today's integration needs even though the technology dates from early-2000s SOA. See [[Integration Hub]].
- **Enterprise scope, not application scope** (Lesson 153): SOA's superpower is reuse of major enterprise services across divisions (e.g. one customer service for every insurance line); the taxonomy has four main service types but some engagements stretched it to ten. Five stars for abstraction, integration, interoperability and complex workflows; deployability, evolvability, performance, simplicity and testability drove it down the hype curve. Lesson learned: one service rarely satisfies every department's context. See [[Service-Based vs Service-Oriented Architecture]].
- **Is SOA dead? (Lesson 126):** no, but rarely used. Its decline began when the industry redefined SOA as "web services"; lessons learned were that enterprise-wide reuse didn't work as expected, cost and time overruns, slow change because business, shared-services, application and infrastructure teams all had to coordinate, and poor performance from layered abstraction. The ESB also covered message enhancement, protocol transformation, contract decoupling, service registry and security (e.g. a REST call reaching COBOL on a mainframe or RPG on an AS/400). Its sweet spot remains heterogeneous systems interoperating within one workflow or request, typically at large insurers and banks.
- **Roadmap view** (Lesson 89): popular around 2003; enterprise-wide reuse of concepts like policy, customer or insurer didn't work as well as expected, but SOA still fits system-wide integration of multiple heterogeneous systems across a division or the enterprise.
- **Contrast with event-driven:** SOA is largely synchronous, so its abstraction lowers performance; see [[Event-Driven Architecture]].

- **API layer as conductor (Lesson 23):** outside microservices, an ESB-style API layer (e.g. Mule, Spring Integration, Apache Camel) can act as the orchestration conductor once a request reaches it. See [[Orchestration vs Choreography]].

## Structure
\`\`\`mermaid
flowchart TB
    UI[Clients on any platform / protocol] --> BS[Business services: abstract contracts]
    BS --> ESB[Enterprise service bus: process choreography + service orchestration]
    ESB --> ES[Enterprise services: coarse-grained, shared]
    ES --> AS[Application services: fine-grained]
    ES --> IS[Infrastructure services: auditing, monitoring]
    AS --> IS
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| -------- | ---------- |
| Integrating heterogeneous systems (different platforms, languages, protocols) | Tight budget or time constraints; it is very expensive |
| Sharing core functionality across a division, department or enterprise | Agility and time to market matter (agility one star) |
| Large insurers, financial institutions, retailers, banks that interconnect many systems | Performance matters (two stars) |
| Systems must evolve independently behind abstraction | Testability matters |

## Trade-offs
| Pro | Con |
| --- | --- |
| Five stars for abstraction and interoperability | Expensive; many early projects died of cost overruns |
| Core functionality shared, not duplicated | Shared services mean one change can break many systems |
| Each system evolves independently behind contracts | Slow: abstraction layers and synchronous calls cost performance |
| | Low testability and one-star agility |

## Related patterns
- **Alternatives:** [[Service-Based Architecture]]; [[Microservices Architecture]]; [[Event-Driven Architecture]]
- **Often combined with:** [[Integration Hub]]; [[Enterprise Integration Patterns]]; [[Orchestration vs Choreography]]; [[Broker Architecture]] (the ESB is a heavyweight broker)
- **Anti-pattern to watch for:** enterprise-wide reuse that couples every system to one shared service (see [[Code Reuse in Microservices]])
- **Context:** [[Service-Based vs Service-Oriented Architecture]] · [[Events vs Messages]] · [[Domain to Architecture Isomorphism]]
- Index: [[Architecture Styles Compared]]. MOC: [[Architecture]]

## Sources
- [[Lesson 164 — Service Oriented Architecture]] (Mark Richards, Software Architecture Monday)
- [[Lesson 154 — Is an ESB Still Relevant Today]] (ESB capabilities still relevant)
- [[Lesson 153 — Service Based vs SOA]] (service-based vs SOA by scope, structure and ratings)
- [[Lesson 126 — Is SOA Dead]] (why SOA declined and when it is still viable)
- [[Lesson 89 — Becoming A Software Architect Part 4]] (Mark Richards, Software Architecture Monday): reuse lesson and integration sweet spot
- [[Lesson 23 — Orchestration vs Choreography]]: the API/ESB layer as the conductor in orchestration
`;export{e as default};
