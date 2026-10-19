---
title: Capacity Planning — Project Tapline
status: approved
owner: Sam Ortega (SRE Lead)
version: 1.0.0
last_updated: 2026-12-11
reviewers:
  - Kofi Mensah (Cloud & Network Architect) — approved 2026-12-09
  - Ravi Patel (Principal Engineer, Fare Engine) — approved load-test results 2026-12-09
  - Jordan Hale (CFO) — approved §4 on 2026-12-10
  - Architecture Review Board — accepted for Gate 0, 2026-12-09
tags:
  - capacity_planning
---
# Capacity Planning — Project Tapline

> [!summary] Headroom at Gate 0
> Tapline isn't live yet, so "current load" is RiverCard's 2025 traffic (the load Tapline inherits) plus the November 2026 load tests. The pipeline sustained **1,500 taps per second** (90,000/min) in the performance environment: **7.5× the design capacity** and about 80× today's normal peak. The first bottleneck is Journey DB log writes, followed by Northgate's 50/s verification limit after mass reconnects. Cloud cost is forecast at **$1.97M in 2028**, within the $2.1M budget, and **$2.37M in 2030** without action, so reservations are needed from 2028.

## 1. Current Load Profile

From RiverCard 2025 data (taps and boardings) and Tapline load tests (November 2026, performance environment sized like production).

| Metric | Current (2025 normal) | Peak |
|---|---|---|
| Taps per minute (systemwide) | ~1,100 (weekday 07:30–08:30) | ~3,000 (stadium egress, 22:00–22:30); RiverCard's record was 3,410 on 2025-12-31 |
| Taps per second | ~18 | ~57 |
| Taps per day | ~320k weekday; ~150k Saturday; ~95k Sunday | 410k (2025-07-04) |
| Validator uploads per second (batches) | ~85 (5,200 validators, every 15 s or 50 taps) | ~600 (mass reconnect after an APN outage) |
| Heartbeats per second | ~17 (5,200 devices every 5 min) | — |
| Rider API requests per second (forecast) | ~40 (300k accounts, 2027) | ~400 (Monday 07:00–08:00 balance and trip checks) |
| Concurrent app users (forecast) | ~6,000 | ~25,000 (fare-change days, service disruptions) |
| Data volume: taps | ~96M a year; ~1.2 KB each → ~115 GB a year raw | — |
| Data volume: ledger | ~150M transactions a year; ~0.6 KB → ~90 GB a year | — |
| Data volume: Journey DB working set | ~13 months of rider weeks → ~180 GB | — |

**Load-test results** (2026-11-16 to 2026-11-20; synthetic riders replaying a 2025 week at multiples of real speed):

| Test | Load | Result |
|---|---|---|
| Sustained throughput | 1,500 taps/s for 2 h | p95 tap-to-account 4.1 s; Journey DB log write 71%; 32 Fare Engine pods; **pass** |
| Design-capacity soak | 200 taps/s for 24 h | p95 tap-to-account 1.2 s; no growth in memory or lag; **pass** |
| Mass reconnect | 1,200 validators reconnect within 60 s, each with 1,500 stored taps (1.8M taps) | Backlog cleared in 8 min 40 s; gateway peaked at 11 pods; **pass** (NFR-SCALE-01 scenario: ≤ 10 min) |
| Stadium surge | 3,000 taps/min plus 120 reconnecting buses | p99 tap-to-account 38 s; **pass** |
| New-card burst | 40,000 never-seen cards in 10 min (event with many visitors) | Northgate verification queue peaked at 21 min (50/s limit); charges unaffected; **pass, with note** (§3) |
| Breaking point | Ramped to failure | Journey DB log write saturates at ~2,100 taps/s; Event Hubs at 4 PU throttles at ~2,600 taps/s |

## 2. Growth Projections
| Timeframe | Expected Growth | Assumptions |
|---|---|---|
| 6 months (mid-2027, pilot) | ~4% of systemwide taps (Route 12 + Blue Line) | Pilot lines only; RiverCard still carries everything else |
| 12 months (end of 2027) | ~60% of systemwide taps on Tapline | Garage rollout waves 1–4 complete; RiverCard cards still used heavily |
| 2028 (Phase 2–3) | 100% of CRT taps (~96–98M a year); accounts 600k | RiverCard off at year end; 1.5% ridership growth from easier payment (Business Case) |
| 2030 (Phase 4) | ~120M taps a year; normal peak ~1,400/min; surge ~4,000/min; accounts 1.2M | Six partners add ~22M trips; Keel adds ~1M; organic growth ~1.5% a year |
| Design limit | 250M taps a year; 12,000/min sustained | NFR scalability table |

**Seasonal and event peaks** are known in advance: stadium events (about 45 a year), July 4th, New Year's Eve, university move-in week, and fare-change days (app traffic). They are scheduled in the operations calendar, with pre-scaling (§3).

## 3. Scaling Strategy

**Horizontal vs vertical:** horizontal for every compute workload; vertical for databases and Event Hubs, resized ahead of known events. Autoscaling triggers are in [Deployment Topology §3](../04-infrastructure-and-network/deployment-topology.md).

**Bottleneck components**, in the order they would bind:

| # | Component | Limit observed | Headroom over 2030 surge (~67 taps/s) | Plan |
|---|---|---|---|---|
| 1 | **Journey DB log write** (Hyperscale, 8 vCores) | ~2,100 taps/s | ~31× | Scale to 16 vCores for planned events; Orleans trial (SAD OQ-1) could remove one write per tap |
| 2 | **Event Hubs** (4 PU) | ~2,600 taps/s | ~39× | 8 PU for planned events; partition count (32) sufficient to 2030 |
| 3 | **Northgate verification rate** (50/s, ICD-001) | 3,000 new cards/min | Bursts of new cards queue, but charges don't depend on them | Ask Northgate for 100/s burst during planned events (Joint Change Board, Q1 2027) |
| 4 | **Device Gateway TLS handshakes** after mass reconnect | 11 pods at 600 batches/s | Not a limit: autoscale 3–12 | Keep max 12; add connection jitter in ICD-002 (validators wait 0–60 s after reconnect) |
| 5 | **Rider API** (APIM 2 units) | ~1,800 requests/s in test | ~4.5× over forecast peak | Add a unit for fare-change days |

**Not bottlenecks:**
- Validators: each one only handles its own door.
- The deny list: at 5M entries it is about 40 MB compressed. Today's projection is 1.2M entries in 2030.
- The ledger: about 6 transactions a second on average, and 1,400 a second during re-rating storms, well within Business Critical capacity.

## 4. Cost Implications

Cloud cost forecast (Azure list prices, December 2026, no reservations), against the **$2.1M a year** cloud budget (NFR-COST-01):

| Component | 2027 (pilot + rollout) | 2028 (full CRT) | 2030 (all partners) |
|---|---|---|---|
| AKS main zone (incl. Central US standby) | $240k | $420k | $510k |
| AKS card-data zone | $110k | $180k | $210k |
| Azure SQL (Journey Hyperscale; Account and Ledger Business Critical; geo-replicas) | $310k | $520k | $640k |
| Event Hubs Premium (4 PU + geo-replica) | $95k | $95k | $120k |
| API Management Premium (2 units) | $67k | $67k | $100k |
| Front Door Premium + WAF | $30k | $40k | $50k |
| Azure Managed Redis | $35k | $60k | $75k |
| Storage (ADLS archives, Blob) | $15k | $35k | $60k |
| Microsoft Fabric capacity | $60k | $100k | $100k |
| Monitoring (Log Analytics, App Insights, Prometheus, Grafana, Sentinel) | $140k | $210k | $240k |
| Managed HSM (2 regions) | $56k | $56k | $56k |
| Networking (Azure Firewall Premium, ExpressRoute ports, egress) | $150k | $190k | $210k |
| **Total** | **$1.31M** | **$1.97M** | **$2.37M** |

**Actions to stay within budget:**
- **From 2028:** 3-year reservations for SQL vCores and AKS node pools (baseline only; autoscaled capacity stays pay-as-you-go). Estimated saving 22–28% on those lines: about **$270k a year in 2028** and **$330k in 2030**. That brings 2030 to about **$2.04M**.
- **Ongoing:**
  - Monthly FinOps review (SRE and Finance).
  - Log ingestion caps and tail sampling ([Observability Strategy §7](observability-strategy.md)).
  - Turn off the performance environment between test runs (it is created on demand).
- **Cost per tap** at 2028 volumes: about **$0.020** before reservations and $0.017 after, against RiverCard's vendor fees of about $0.085 per tap (Business Case).

**Review:** this plan is revisited at each phase gate, after any load test, and when real production data replaces the RiverCard baseline (first revision after the pilot, target Q3 2027).
