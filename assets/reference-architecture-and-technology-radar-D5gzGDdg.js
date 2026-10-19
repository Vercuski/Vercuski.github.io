const e=`---
title: Reference Architecture, Standards & Technology Radar — Project Tapline
status: approved
owner: Dana Okafor (Chief Architect, ARB chair)
version: 1.0.0
last_updated: 2026-10-07
reviewers:
  - Architecture Review Board — approved 2026-10-07
  - Priya Raman (CIO)
tags:
  - reference_architecture
  - tech_radar
---
# Reference Architecture, Standards & Technology Radar — Project Tapline

> [!summary] "How we build things here"
> The ARB's standing guidance for Tapline: what technology is approved, which patterns to reuse, what not to use, and where each technology sits on the radar. Anything not listed as **Adopt** or **Trial** needs ARB approval before use in production code. The radar is reviewed every quarter (§5.5).

## 1. Approved Technology Stack
| Category | Approved | Notes |
|---|---|---|
| Language | C# 14 on .NET 10 (LTS); T-SQL; Bicep | Move to the next LTS within 12 months of release (NFR maintainability) |
| Framework | ASP.NET Core 10 (minimal APIs); .NET worker services; Blazor Web App; .NET MAUI | MVC controllers only in legacy code (none in Tapline) |
| Data access | EF Core 10 (default); Dapper (hot paths, approved per service) | Fare Engine and Ledger use Dapper ([SAD §5](../02-core-architecture/solution-architecture-document.md)) |
| Database | Azure SQL Database (Hyperscale, Business Critical; ledger tables for financial records) | One database per context |
| Cache | Azure Managed Redis | Cache and read models only; never a system of record |
| Messaging | Azure Event Hubs Premium (streams); Azure Service Bus Premium (commands, work queues) | [ADR-0003](adr/0003-event-hubs-for-tap-ingestion.md) |
| Storage and analytics | ADLS Gen2 (immutable archives); Microsoft Fabric (lakehouse, reports) | De-identified data only in Fabric |
| Cloud provider | Microsoft Azure: East US 2 (primary), Central US (secondary) | CRT Enterprise Agreement |
| Compute | AKS (Azure CNI Overlay, Istio add-on, KEDA, Flux) | Two clusters: main zone and card-data zone |
| Identity | Entra ID, Entra External ID, Entra ID B2B; managed identities; CRT Device CA | |
| Observability | OpenTelemetry; Azure Monitor (Application Insights, Log Analytics); Managed Prometheus; Managed Grafana; Microsoft Sentinel | |
| CI/CD | GitHub Actions (OIDC to Azure); GitHub Advanced Security; Flux GitOps; Notation image signing | |
| Contracts | OpenAPI 3.1, AsyncAPI 3.0, JSON Schema, CloudEvents 1.0, RFC 9457 Problem Details | [API Specification Guide](../03-interfaces-and-integration/api-specification-guide.md) |

## 2. Approved Reference Patterns

| Pattern | Use When | When Not To | Reference Implementation |
|---|---|---|---|
| **Transactional outbox** | A service changes state *and* publishes an event | Pure read services; events derived from a stream you already consume | \`Tapline.SharedKernel.Outbox\` + Journey's \`OutboxPublisher\` |
| **Idempotent consumer** | Always, for every message consumer ([P6](architecture-principles.md)) | Never skip it | \`IdempotencyFilter\` in \`SharedKernel.Messaging\` |
| **Partitioned single writer** | State that must be updated in order per key at high volume (rider fare week) | Low-volume state: use optimistic concurrency instead | Tap Router → \`rider-taps\` → Fare Engine |
| **Deterministic re-computation** (rebuild derived state from facts) | Derived results that late or corrected input can change: fares, caps | Where the input is not retained or not immutable | \`RiderFareWeek.Apply\` + Re-rating Coordinator |
| **CQRS read models** | Read shapes very different from the write model (rider trip history, cap progress) | Simple CRUD; don't add read models "just in case" | Account read model fed by \`domain-events\` into Redis |
| **Anti-corruption layer** | Any external system or vendor model ([P12](architecture-principles.md)) | Between Tapline contexts (use contracts instead) | \`Integration/Adapters/*\`, Device Gateway's Vantor translator |
| **Strangler fig** | Replacing a legacy system gradually | Greenfield | RiverCard Bridge during 2028 ([Transition Architecture](../09-transition-and-migration/transition-architecture.md)) |
| **Process manager / saga (orchestrated)** | Multi-step workflows over time with compensation (reduced-fare application with DHS and manual review; RiverCard balance transfer) | Anything achievable in one aggregate transaction | Eligibility application workflow (Account Service) |
| **Modular monolith** | Several contexts with one owner and one cadence ([ADR-0007](adr/0007-services-by-bounded-context.md)) | Different scaling, security zone or runtime model | Account Service |
| **Claim check** | Payloads over 256 KB on Event Hubs or Service Bus (e.g. settlement files) | Ordinary events | Settlement file handling (Blob reference in event) |

**Event sourcing as the system of record** is *not* an approved general pattern. Taps are an immutable log ([P4](architecture-principles.md)), but aggregates are stored as state with an outbox. Proposals to event-source an aggregate need an ADR.

**When to split a service** ([ADR-0007](adr/0007-services-by-bounded-context.md) follow-up). Split only if at least one of these holds:
- A different scaling profile, or a different security zone.
- A different runtime model (stream vs request).
- A different owning team.
- A release cadence conflict that is measured, not imagined.

## 3. Deprecated / Disallowed Technologies
| Technology | Reason | Replacement |
|---|---|---|
| .NET Framework, WCF | Out of strategic support; Windows-only | .NET 10, ASP.NET Core, gRPC or REST |
| Oracle Database | RiverCard legacy; licensing; no CRT skills going forward | Azure SQL |
| Newtonsoft.Json | Performance; two serializers cause subtle differences | System.Text.Json (source-generated contexts) |
| AutoMapper, MediatR | Licensing changed to commercial in 2025; hide control flow and mapping errors | Hand-written mapping; direct handler calls or minimal-API endpoint filters |
| FluentAssertions v8+ | Commercial licence from v8 | Shouldly |
| Self-managed Kafka, RabbitMQ | Violates "managed services first" ([P9](architecture-principles.md)) | Event Hubs, Service Bus |
| Floating-point types for money | Rounding errors | \`Money\` (integer cents) |
| Shared databases between contexts | Violates [P5](architecture-principles.md) | Events and APIs |
| VMs for application workloads | Patch and operate burden | AKS or PaaS |
| Hand-entered card forms | PCI scope ([P3](architecture-principles.md)) | Northgate hosted payment fields |

## 4. Standards

### 4.1 Coding & API Standards
- [Coding Standards](coding-standards.md): C#, SQL naming, analyzers, tests.
- [API Specification Guide](../03-interfaces-and-integration/api-specification-guide.md): versioning, errors, authentication.
- Lint configuration: \`tapline-platform/.editorconfig\`, \`Directory.Build.props\`, \`BannedSymbols.txt\`, \`specs/.spectral.yaml\`.

### 4.2 Logging Standard
- Structured JSON through \`ILogger\` and OpenTelemetry. Required fields on every record: \`timestamp\` (UTC), \`level\`, \`service.name\`, \`service.version\`, \`deployment.environment\`, \`trace_id\`, \`span_id\`, \`event.id\`, \`message\`.
- Domain correlation: \`tap_id\`, \`charge_id\`, \`fare_rule_version_id\` where relevant.
- No Confidential or Restricted values; redaction is mandatory ([Coding Standards §5](coding-standards.md)).

### 4.3 Error Handling Standard
- APIs: RFC 9457 Problem Details with \`TAPLINE-<CONTEXT>-nnnn\` codes.
- Streams: retry, then park, then replay ([Integration Architecture §5](../03-interfaces-and-integration/integration-architecture.md)).
- Money discrepancies: never auto-corrected; raised as reconciliation exceptions.

## 5. Technology Radar

### 5.1 Adopt
> Proven, low-risk, default choice.

| Item | Quadrant | Notes |
|---|---|---|
| .NET 10, C# 14 | Languages & Frameworks | LTS until Nov 2028 |
| ASP.NET Core minimal APIs | Languages & Frameworks | Default for HTTP endpoints |
| Blazor Web App | Languages & Frameworks | Portals |
| .NET MAUI | Languages & Frameworks | Rider App, Inspection App |
| EF Core 10 / Dapper | Languages & Frameworks | Dapper for hot paths |
| Azure SQL (incl. ledger tables) | Platforms | |
| Azure Event Hubs Premium | Platforms | Streams |
| AKS + KEDA + Flux | Platforms | |
| Bicep + Azure Verified Modules + Deployment Stacks | Tools | |
| OpenTelemetry | Tools | All services |
| Testcontainers, FsCheck, NetArchTest | Tools | Testing standards |
| CloudEvents, RFC 9457, OpenAPI 3.1 | Techniques | Contracts |
| Transactional outbox, idempotent consumers | Techniques | Mandatory |

### 5.2 Trial
> Worth pursuing, understand the risks, use on a project that can handle it.

| Item | Quadrant | Notes |
|---|---|---|
| Microsoft Orleans | Languages & Frameworks | Rider fare week state as grains to cut Journey DB load ([SAD OQ-1](../02-core-architecture/solution-architecture-document.md)); spike in Phase 1 performance environment |
| Aspire (local orchestration and dashboard) | Tools | Developer inner loop only; not for production deployment |
| Application Gateway for Containers | Platforms | AKS ingress; replacing NGINX ingress, which is on Hold |
| Flagger | Tools | Progressive delivery for APIs |
| Azure Managed Redis | Platforms | New SKU replacing Azure Cache for Redis |
| Stryker.NET (mutation testing) | Tools | Fare Engine only |

### 5.3 Assess
> Worth exploring, not yet proven: spike/POC territory.

| Item | Quadrant | Notes |
|---|---|---|
| Dapr | Platforms | Only if Orleans trial fails; overlap with Istio and Event Hubs SDK |
| Fabric Real-Time Intelligence | Platforms | Live ridership dashboards from \`taps\` |
| Passkey-only rider sign-in | Techniques | Removing passwords; accessibility testing needed |
| SLSA Level 3 build provenance | Techniques | Supply-chain threat T-23 |
| AI-assisted dispute triage | Techniques | Summarize tap evidence for customer service; privacy review required first |

### 5.4 Hold
> Proceed with caution: being phased out, or not recommended for new work.

| Item | Quadrant | Notes |
|---|---|---|
| Ingress NGINX controller | Platforms | Community project retirement announced; use Application Gateway for Containers |
| Azure Service Bus for high-volume streams | Platforms | Use Event Hubs; Service Bus for commands only |
| Self-managed Kafka | Platforms | See trade study |
| AutoMapper, MediatR, FluentAssertions v8+ | Languages & Frameworks | Licensing (§3) |
| Newtonsoft.Json | Languages & Frameworks | §3 |
| Event sourcing as system of record | Techniques | Needs an ADR (§2) |
| Shared databases across contexts | Techniques | Violates P5 |

### 5.5 Change Log
| Date | Item | Moved From → To | Reason |
|---|---|---|---|
| 2026-06-10 | Azure Event Hubs Premium | Assess → Adopt | Trade study and [ADR-0003](adr/0003-event-hubs-for-tap-ingestion.md) |
| 2026-06-10 | Self-managed Kafka | — → Hold | Excluded in trade study (managed services first) |
| 2026-07-08 | Azure SQL ledger tables | Assess → Adopt | [ADR-0006](adr/0006-azure-sql-ledger-tables-for-fare-ledger.md) |
| 2026-08-14 | AutoMapper, MediatR, FluentAssertions v8+ | — → Hold | Licensing; adopted with the Coding Standards |
| 2026-09-09 | Microsoft Orleans | Assess → Trial | Journey DB write throughput risk (SAD §8) |
| 2026-10-07 | Ingress NGINX controller | Adopt → Hold | Retirement announcement; Application Gateway for Containers to Trial |

## 6. Exception Process
1. The requesting team completes an [Architecture Exception Request](../07-governance/architecture-exception-request.md): the standard being excepted, the reason, scope, risk, alternatives, compensating controls and an **expiry date**. Open-ended exceptions are not accepted.
2. The request goes on the next ARB agenda (submit at least 5 business days before). Urgent production requests can be decided by the ARB chair and CISO together and ratified at the next ARB.
3. Approved exceptions are logged in the exception register (Governance Framework) and reviewed at expiry. An exception may be renewed once. After that, either the standard changes or the system must comply.
4. Exceptions touching the card-data zone or PCI controls need the CISO's approval in addition to the ARB's.

## 7. Review Board & Cadence
| Role | Name |
|---|---|
| Chair | Dana Okafor, Chief Architect |
| Members (voting) | Priya Raman (CIO; casting vote on technology direction), Tom Whitaker (CISO; veto on security and PCI), Aisha Karimi (Lead Solution Architect), Ravi Patel (Principal Engineer), Sam Ortega (SRE Lead), Kofi Mensah (Cloud & Network Architect) |
| Members (advisory) | Team leads (Mei Chen, Hannah Cole, Diego Alvarez); Elena Brooks (Program Director); Linda Park (Partner Operator Council), voting from Phase 4 on regional matters |
| Secretary | Program Office architect analyst |

**Review cadence and submission process:**
- **Monthly ARB**, second Wednesday; extra sessions as needed. **Radar review quarterly.**
- Submissions (ADRs, trade studies, exception requests, RFCs) go to the ARB backlog at least 5 business days before the meeting.
- Decisions are recorded in [ARB minutes](../07-governance/arb-minutes-template.md) and, where architectural, as ADRs.
- The full decision-rights model is in the [Governance Framework](../07-governance/governance-framework.md).
`;export{e as default};
