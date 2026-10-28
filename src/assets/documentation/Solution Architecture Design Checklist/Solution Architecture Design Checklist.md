---
type: reference
domain:
- '[[Architecture]]'
- '[[Toolkit]]'
status: draft
summary:
aliases:
- Solution Architecture Project Questions
created: 2026-09-25
updated: 2026-09-25
tags: []
---
# Solution Architecture Design Checklist

| Field     | Value                        |
| --------- | ---------------------------- |
| Project   |                              |
| Architect |                              |
| Date      |                              |
| Status    | Draft / In Review / Approved |

---
## Part 1: Before Design (Context and Constraints)

### Business and Purpose
- [ ] What business problem are we solving, and how will we know it's solved (measurable outcomes)?
- [ ] What happens if we don't build this, or build it six months later?
- [ ] Is this a strategic differentiator or a commodity capability we could buy?
- [ ] What's the expected lifespan: throwaway, 3 years, 10+ years?

### Stakeholders and Organization
- [ ] Who are the decision-makers, and who can veto?
- [ ] What team(s) will build and own this, and what are their skills?
- [ ] How is the team structured? (Conway's Law will shape the architecture whether we plan for it or not.)
- [ ] What existing standards, approved tech stacks, or enterprise constraints apply?

### Constraints
- [ ] What are the hard constraints on budget, timeline, regulation, licensing, and hosting?
- [ ] What's fixed versus negotiable?
- [ ] Are there compliance requirements ([HIPAA](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act), [PCI](https://en.wikipedia.org/wiki/Payment_Card_Industry_Security_Standards_Council), [SOC 2](https://en.wikipedia.org/wiki/System_and_organization_controls), [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation)) that dictate data handling or residency?

### Quality Attributes
- [ ] What are the concrete targets for availability, latency, throughput, and recovery (RTO/RPO)?
- [ ] Which quality attributes matter most, and which will we trade away when they conflict?
- [ ] What load is expected at launch, at peak, and in 2–3 years?
- [ ] What's the cost of downtime or data loss per hour?

### Data
- [ ] Who owns each piece of data, and what's the system of record?
- [ ] What are the consistency requirements: strong, eventual, or does it vary by domain?
- [ ] What are the data volume, growth rate, and retention/archival rules?
- [ ] What's sensitive, and how must it be classified, encrypted, and audited?

### Integration and Environment
- [ ] What upstream and downstream systems do we depend on, and how reliable are they?
- [ ] What are the contracts (sync vs. async, versioning, SLAs) with those systems?
- [ ] What legacy systems must we coexist with or migrate from?

### Operations
- [ ] Who runs this in production, and who gets paged at 3 a.m.?
- [ ] How will we deploy, observe, and roll back?
- [ ] What does "healthy" look like, and how will we measure it?

---
## Part 2: During Design (Decisions and Validation)

### Decisions
- [ ] What are the key architectural decisions, and have we recorded them (ADRs) with alternatives and trade-offs?
- [ ] Which decisions are expensive to reverse, and have they gotten proportionate scrutiny?
- [ ] Can we defer any decision until we have more information?
- [ ] Are we choosing this pattern or technology because it fits, or because it's familiar or fashionable?

### Boundaries and Structure
- [ ] Do our service and module boundaries align with business domains (bounded contexts)?
- [ ] Where is coupling unavoidable, and is it explicit?
- [ ] Could this be a modular monolith first, with extraction later?

### Risk and Failure
- [ ] What are the biggest technical risks, and how do we spike or prototype to reduce them early?
- [ ] What happens when each dependency is slow, down, or returns garbage?
- [ ] What are the single points of failure?
- [ ] What's the threat model, and where are the trust boundaries?

### Validation
- [ ] How will we verify that the architecture meets the quality attribute targets (load tests, fitness functions, chaos testing)?
- [ ] Have stakeholders reviewed the design against real scenarios, not just diagrams?
- [ ] What assumptions have we made, and how will we know if they're wrong?

### Evolution and Cost
- [ ] How will this design accommodate likely changes over the next 2–3 years?
- [ ] What's the total cost of ownership, including infrastructure, licensing, and operational headcount?
- [ ] What technical debt are we knowingly taking on, and what's the plan to pay it down?
- [ ] How will new developers understand this system in a year?

---
## Notes and Open Items

| #   | Question / Issue | Owner | Status |
| --- | ---------------- | ----- | ------ |
| 1   |                  |       |        |
| 2   |                  |       |        |
| 3   |                  |       |        |
