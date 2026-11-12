---
title: Deployment / Topology
summary: "Deployment topology template: environments, regions and availability zones, how services map onto infrastructure, scaling and environment parity."
about: "Show how the containers from the C4 diagrams land on real infrastructure in each environment. Record the deliberate differences between staging and production, such as data volumes or sandbox versus live third parties, so an incident isn't misdiagnosed as a code problem."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - deployment_topology
---
# Deployment Topology — {Project Name}

> Guidance: Show environments (dev/staging/prod), regions, and how
> containers/services map onto physical or cloud infrastructure.

## 1. Environments
| Environment | Purpose | URL | Notes |
|---|---|---|---|
| Dev | TBD | TBD | TBD |
| Staging | TBD | TBD | TBD |
| Production | TBD | TBD | TBD |

## 2. Topology Diagram

```
[Diagram: regions, availability zones, load balancers, service instances]
```

## 3. Scaling Strategy
- Horizontal vs vertical: TBD
- Auto-scaling triggers: TBD

## 4. Environment Parity
> Guidance: Note deliberate differences between staging and prod (data
> volume, third-party sandbox vs live) so incidents aren't misdiagnosed.

TBD
