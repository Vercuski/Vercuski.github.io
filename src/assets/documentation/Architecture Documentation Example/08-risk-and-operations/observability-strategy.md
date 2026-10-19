---
title: Observability Strategy — Project Tapline
status: approved
owner: Sam Ortega (SRE Lead)
version: 1.0.0
last_updated: 2026-11-13
reviewers:
  - Aisha Karimi (Lead Solution Architect) — approved 2026-11-11
  - Diego Alvarez (Edge Team lead) — approved fleet telemetry 2026-11-11
  - Tom Whitaker (CISO) — approved §3 (what must never be logged) on 2026-11-12
  - Architecture Review Board — adopted 2026-11-13
tags:
  - observability
  - monitoring
---
# Observability Strategy — Project Tapline

> [!summary] How we know Tapline is healthy
> Three layers of signals:
> 1. **Business:** are taps becoming correct fares and money?
> 2. **Pipeline:** is the stream flowing and keeping up?
> 3. **Service and resource:** RED and USE metrics.
>
> All of it is instrumented with OpenTelemetry and stored in Azure Monitor and Managed Prometheus. Every tap carries its `tap_id` through every span, so any single fare can be followed from the validator to the bank deposit. Alerts fire on symptoms tied to [SLOs](sla-slo-sli-definitions.md), and every alert has a runbook.

## 1. Purpose & Scope
Covers operational observability for all Tapline environments: validators and handhelds (fleet telemetry), cloud services in both AKS clusters, data stores, streams, and external dependencies as seen from Tapline. Production and staging are monitored 24/7; lower environments use the same instrumentation without paging. Security audit logging is out of scope; it is covered in the [Security Architecture §8](../05-security/security-architecture.md).

## 2. Metrics Strategy
- **Model used:**
  - **RED** (rate, errors, duration) for request-driven services and stream consumers.
  - **USE** (utilization, saturation, errors) for resources.
  - **Business KPIs** above both, because a healthy pipeline can still produce wrong fares.
- **Tooling:**
  - OpenTelemetry SDK for .NET (metrics, traces, logs) → OpenTelemetry Collector (gateway deployment per cluster) → Azure Monitor Managed Prometheus (metrics) and Application Insights / Log Analytics (traces, logs).
  - Grafana (Azure Managed Grafana) for dashboards.

| Signal | Metric | Source | Notes |
|---|---|---|---|
| Rate | `taps_received_total` (by mode, operator); `http_server_request_duration_seconds_count` | Device Gateway; all APIs | Taps per minute is the heartbeat of the business |
| Errors | `devicegw_upload_total{status!="2xx"}`; `consumer_parked_total`; HTTP 5xx | Gateway; stream consumers; APIs | Any parked message is an error |
| Duration/Latency | `tap_to_account_seconds` (histogram); `tap_upload_lag_seconds`; HTTP duration | Journey; Gateway; APIM | SLO SLIs come from these histograms |
| Saturation | Event Hubs consumer lag per partition; Journey DB log write %; AKS node CPU/memory; APIM capacity; Event Hubs PU utilization | Azure Monitor; KEDA | Lag is the leading indicator for the Fare Engine |
| **Business** | Accept/deny rates by reason; first-ride declines (count, $); cap events; daily charges (count, $); reconciliation differences ($); deny-list size | Fare Engine, Payments, Ledger, Deny List | Reviewed daily by Revenue Operations |
| **Fleet** | Validators online/offline; stored-tap backlog; deny-list version lag; firmware version; decision time p99; tamper and fault codes; clock drift vs GPS | Validator heartbeats (every 5 min) via Device Gateway | Converted to metrics by the Device Management Service |

**Cardinality limits:**
- No `tap_id`, `media_token`, `account_id` or `validator_id` as metric labels. They belong in traces and logs.
- Validator-level views are built from heartbeat logs, not metrics.
- Labels are allow-listed per metric in the shared instrumentation library (`Tapline.SharedKernel.Telemetry`).

## 3. Logging Strategy
- **Tooling:** `Microsoft.Extensions.Logging` with source-generated `[LoggerMessage]` → OpenTelemetry → Log Analytics. No Serilog sinks; one pipeline.
- **Structured logging format:** JSON, with the required fields from the [Reference Architecture §4.2](../06-decisions-and-standards/reference-architecture-and-technology-radar.md): `timestamp`, `level`, `service.name`, `service.version`, `deployment.environment`, `trace_id`, `span_id`, `event.id`, `message`. Domain identifiers (`tap_id`, `charge_id`) as properties where relevant.
- **Log levels & when to use each:**

| Level | When to Use |
|---|---|
| Error | An operation failed and needs attention: message parked, settlement step failed, dependency down after retries. Linked to an alert. |
| Warning | Recovered or degraded: retry succeeded, late tap re-rated, cache fallback used, validator clock drift > 2 s |
| Information | Business-significant, low-volume events: fare rule version published, charge file sent, deny-list full build. **Never per tap.** |
| Debug | Diagnostic detail; off in production; switchable per service for 1 hour by the on-call engineer |

- **Correlation strategy:** W3C trace context everywhere. Through Event Hubs, the `traceparent` travels in the CloudEvents envelope, so a tap's trace continues across asynchronous hops. Log records automatically carry the current trace and span IDs.
- **What must never be logged:**
  - Restricted data: payment tokens, encrypted card data, keys.
  - Confidential data in clear: email, phone, names, eligibility category, unredacted media tokens.
  - Secrets and access tokens.

  The redaction rules and the Device Gateway's card-data field exclusion are in [Coding Standards §5](../06-decisions-and-standards/coding-standards.md), cross-referenced with the classification in [Security Architecture §5](../05-security/security-architecture.md).

## 4. Tracing Strategy
- **Tooling:** OpenTelemetry (.NET SDK, Azure SDK instrumentation for Event Hubs, SQL and HTTP) → OpenTelemetry Collector → Application Insights.
- **Sampling strategy:** **tail-based** in the Collector, so the decision is made after seeing the whole trace.

| Traces | Kept | Why |
|---|---|---|
| Errors, parked messages, re-ratings | 100% | Needed for every investigation |
| Taps slower than the tap-to-account SLO (> 60 s) | 100% | SLO investigations |
| Money flows (charges, top-ups, refunds, settlement) | 100% | Low volume, high value |
| Normal taps | 2% | ~6,400 a day is enough for latency analysis; the tap itself is always findable by `tap_id` in the archive and Journey DB |
| API requests | 10% (100% of errors) | |

- **Trace context propagation:**
  - HTTP: `traceparent` / `tracestate` headers.
  - Event Hubs: in the CloudEvents envelope.
  - Validators: they don't emit traces, so the Device Gateway starts the trace and records `tapped_at`, so upload delay is visible as a span attribute.
  - Settlement files: the batch trace ID is written to the file header and the reconciliation records.
- **Key traced flows:** the five flows in [Sequence Diagrams](../02-core-architecture/sequence-diagrams.md). Flow 1 (tap to rated fare) and flow 3 (nightly settlement) have dedicated trace views in Grafana.

## 5. Dashboards
| Dashboard | Purpose | Audience | Owner | Link |
|---|---|---|---|---|
| **Tapline Overview** | Taps/min, accept rate, tap-to-account latency, SLO status, open incidents | Everyone; NOC wall screen | SRE | `grafana/d/tapline-overview` |
| **Edge / Fleet** | Validators online by garage and line; backlog; firmware rings; faults; decision time | Edge Team; Bus and Rail Operations | Edge Team | `grafana/d/edge-fleet` |
| **Edge / Deny List** | Published version, propagation lag distribution, validators behind, signature errors, list size | Edge Team; on-call | Edge Team | `grafana/d/edge-denylist` |
| **Journey Pipeline** | Lag per partition, throughput, re-ratings, parked messages, Journey DB saturation | Journey Team; on-call | Journey Team | `grafana/d/journey-pipeline` |
| **Money / Nightly Settlement** | Charge build, file status, results, settlement match, GL post; timeline against cut-offs | Money Team; Revenue Operations | Money Team | `grafana/d/money-settlement` |
| **Revenue Assurance** | First-ride declines, debt recovered, cap events, adjustments, refunds by reason | Revenue Operations; CRO | Money Team | Power BI workspace *Tapline Revenue* |
| **Rider Experience** | API availability and latency, app errors by version, sign-in failures | Rider Team | Rider Team | `grafana/d/rider-experience` |
| **SLO Overview** | Every SLO, budget remaining, burn rate | Program Board; ARB | SRE | `grafana/d/slo-overview` |

## 6. Alerting & Escalation
| Alert | Threshold | Severity | Runbook | Escalation Path |
|---|---|---|---|---|
| Deny-list distribution stalled | Published version not advanced for 20 min while changes are pending, **or** freshness SLI < 95% for 15 min | Sev2 | [Deny-list distribution stalled](runbook-template.md) | Edge on-call → Edge lead → CISO if signatures are involved |
| Tap ingestion failing | Gateway success < 99% for 5 min, or SLO fast burn | Sev2 | *Device Gateway upload failures* | Edge on-call → SRE |
| Journey lag high | `rider-taps` lag > 60 s on any partition for 10 min | Sev3 (Sev2 if > 5 min) | *Fare Engine lag* | Journey on-call |
| Messages parked | Any message parked on `taps`, `rider-taps` or `domain-events` | Sev3 | *Parked messages: triage and replay* | Owning team on-call |
| Fare reproducibility mismatch | Any mismatch in the daily sample | Sev2 | *Fare reproducibility mismatch* | Journey on-call → Ravi Patel |
| Charge file not acknowledged | No Northgate acknowledgement by 04:30 | Sev2 | *Charge file not acknowledged* | Money on-call → Northgate P1 |
| Reconciliation difference | Any non-zero difference at day close | Sev3 | *Reconciliation exception* | Revenue Operations → Money on-call |
| Validators offline spike | > 5% of a garage's validators offline during service hours | Sev3 | *Validator offline spike* | Edge on-call → CRT Network Operations |
| Region health | Azure Service Health event for East US 2 affecting Tapline services | Sev1 candidate | [DR Plan §4.1](disaster-recovery-plan.md) | Incident commander |
| SLO budget burn | 14.4× (page) / 6× (ticket) | Per SLO | Service's runbook | Owning team |

- **On-call rotation:**
  - Each product team runs a weekly primary/secondary rotation (24/7) in PagerDuty. SRE runs a separate platform rotation.
  - **Heightened coverage 02:30–06:30** for the Money Team during the settlement window: a secondary engineer is awake by schedule, not just reachable.
  - Incident command uses CRT's incident process. Sev1 and Sev2 get an incident commander from the SRE rotation.
- **Alert fatigue review cadence:** monthly review of every alert that fired. Any alert that fired without needing action, or that needed action without paging, is retuned or deleted. Target: under 2 pages per on-call week per team.

## 7. Retention & Cost
| Data Type | Retention Period | Storage Tier | Rationale |
|---|---|---|---|
| Metrics | 18 months | Managed Prometheus (default retention) | Year-over-year comparison for capacity and events |
| Logs | 30 days interactive, then 1 year | Log Analytics Analytics tier → archive tier | Incident investigation; matches NFR-SEC-06 for operational logs |
| Traces | 30 days | Application Insights | Investigations happen within days; the `tap_id` record in the archive outlives the trace |
| Fleet heartbeats | 90 days interactive, 1 year archive | Log Analytics Basic tier | Device fault history and warranty claims |

- **Cost controls:**
  - Tail sampling (§4).
  - No per-tap log lines.
  - Basic-tier logs for high-volume, low-query data (heartbeats, Front Door access logs).
  - Allow-listed metric labels.
  - Daily ingestion caps per workspace, with alerts at 80%.
  - Monthly cost review against the observability budget (~$210k a year at Phase 2; see [Capacity Planning §4](capacity-planning.md)).

## 8. Ownership
| Area | Owning Team | Escalation Contact |
|---|---|---|
| Metrics platform (Managed Prometheus, Collector) | Platform Team | Sam Ortega |
| Logging platform (Log Analytics) | Platform Team | Sam Ortega |
| Tracing platform (Application Insights) | Platform Team | Sam Ortega |
| Instrumentation library (`SharedKernel.Telemetry`) | Platform Team, with Journey Team | Sam Ortega / Ravi Patel |
| Fleet telemetry pipeline | Edge Team | Diego Alvarez |
| Dashboards | Each owning team (see §5) | Team leads |
| Alert rules (in IaC) | Each owning team; reviewed by SRE | Team leads |

## 9. Related
- [Non-Functional Requirements §6](../01-requirements/non-functional-requirements.md) (Observability)
- [Security Architecture §8](../05-security/security-architecture.md) (Audit & Logging)
- [SLOs, SLAs & Error Budgets](sla-slo-sli-definitions.md)
- [Runbook: Deny-list distribution stalled](runbook-template.md)
- [Incident Postmortem](incident-postmortem.md)
