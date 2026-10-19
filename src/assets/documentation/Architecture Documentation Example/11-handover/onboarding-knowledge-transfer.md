---
title: Onboarding / Knowledge Transfer — Project Tapline
status: approved
owner: Ravi Patel (Principal Engineer, Fare Engine)
version: 1.2.0
last_updated: 2028-08-01
reviewers:
  - Team leads (Mei Chen, Hannah Cole, Diego Alvarez, Sam Ortega) — approved 2028-07-28
  - Tomás Reyes (Test & Quality Lead) — approved §2 on 2028-07-28
  - Two new engineers (onboarded July 2028) — walked through it and fixed the steps that broke
tags:
  - knowledge_transfer
  - onboarding
---
# Onboarding / Knowledge Transfer — Project Tapline

> [!tip] Your first week
> **Day 1:** read §1 and the four "must read" documents. **Day 2:** get the system running locally (§2) and simulate a tap. **Day 3–4:** pair on a small change with your team, and sit in on the hardware lab. **Day 5:** shadow on-call for a settlement window (02:30–06:30). You're ready when you can explain why Tapline needs two tap streams and why you must never compute a service date yourself.

**Change history:** v1.0 (2027-03-01) for pilot hires. v1.1 (2027-12-10) added the time-handling rules after INC-2027-1107-01. v1.2 (2028-08-01) updated for the Phase 2 as-built and the delivery partner hand-off.

## 1. System Overview (Quick Start)
**Tapline in five sentences.**
1. Riders tap a bank card, phone, CRT card or app ticket on a Vantor validator. The validator decides accept or deny **locally**, in under 300 ms, from a signed deny list. It never calls the cloud during a tap.
2. Taps are stored on the validator and uploaded to the Device Gateway. They land in Event Hubs (`taps`), are re-keyed by rider (`rider-taps`) and rated by the **Fare Engine**: trips, transfers, daily and weekly caps.
3. Fares become entries in an **append-only ledger**. Every night (03:30–06:00) card charges are built, checked by the **cap guard**, sent to Northgate, reconciled and posted to the ERP.
4. Card numbers never enter CRT systems: P2PE readers, media tokens and Northgate payment tokens.
5. RiverCard, the old system, still works through the RiverCard Bridge until 2028-10-31, and is switched off on 2028-12-31.

**Must read** (in this order):
1. [Solution Architecture Document](../02-core-architecture/solution-architecture-document.md), then the [As-Built](as-built-documentation.md) for what changed.
2. [Domain Model](../02-core-architecture/domain-model.md). Learn the glossary; it is the vocabulary of the code.
3. [Sequence Diagrams](../02-core-architecture/sequence-diagrams.md), flows 1, 3 and 5.
4. [Incident Postmortem INC-2027-1107-01](../08-risk-and-operations/incident-postmortem.md). It's the best explanation of why our time rules exist.

**Read when relevant:** the [Container Diagram](../02-core-architecture/c4-model/container-diagram.md), [ADR Log](../06-decisions-and-standards/adr/adr-log.md), [Coding Standards](../06-decisions-and-standards/coding-standards.md) (v2.0 rules for time are in [ADR-0008](../06-decisions-and-standards/adr/0008-time-handling-utc-instants-and-service-day-boundaries.md)), [Test Strategy](../10-testing-and-validation/test-strategy.md), [Observability Strategy](../08-risk-and-operations/observability-strategy.md), and your team's runbooks.

## 2. Local Dev Setup
**Prerequisites:**
- .NET 10 SDK (the version pinned in `global.json`).
- Docker Desktop or Podman, with 8 GB of RAM allocated.
- Azure CLI.
- Git, with your GitHub account in the `crt-transit` organization and 2FA enabled.
- Your IDE: Visual Studio 2026, Rider, or VS Code with C# Dev Kit.

**Steps:**
1. **Clone:**
   ```bash
   git clone https://github.com/crt-transit/tapline-platform.git
   cd tapline-platform
   dotnet tool restore
   ```
2. **Trust the dev certificate:** `dotnet dev-certs https --trust`.
3. **Run everything locally** with the Aspire app host. It starts SQL Server, Azurite, Redis and the Event Hubs emulator in containers, plus every service, with seeded fare rules and synthetic riders:
   ```bash
   dotnet run --project src/AppHost/Tapline.AppHost.csproj
   ```
   The Aspire dashboard opens at `https://localhost:17023`, showing services, logs and traces. First start takes about 4 minutes while images download.
4. **Simulate taps** with `tapgen` (simulated validators that sign taps with dev device keys):
   ```bash
   # One tap
   dotnet tapgen tap --media bank_card --token dev-card-001 --route 12 --at "2028-08-04T08:10:00-04:00"
   # A rider's day that reaches the daily cap
   dotnet tapgen scenario daily-cap --token dev-card-001 --date 2028-08-04
   # The fall-back night, the scenario every engineer should run once
   dotnet tapgen scenario fall-back --date 2027-11-07 --riders 200
   ```
   Then open the Rider Portal at `https://localhost:7101`, sign in as `rider1@dev.local` (password in `src/AppHost/README.md`; dev-only), and see the trips and cap progress.
5. **Control time.** The local clock is controllable for the whole stack: `dotnet tapgen clock set "2027-11-07T00:45:00-04:00" --rate 60` runs one hour per minute. Use it for anything near midnight, 03:00 or a clock change.
6. **Run the tests:**
   ```bash
   dotnet test                                    # unit, property-based (100k weeks), architecture
   dotnet test --filter Category=Integration      # needs the containers from step 3
   ```
   Property-based failures print a seed. Re-run with `FSCHECK_REPLAY=<seed>` and add the seed to the regression set.
7. **Make a change** on a branch, open a pull request, and follow the [code review checklist](../06-decisions-and-standards/coding-standards.md). CI runs everything above, plus CodeQL, contract checks and `oasdiff`.

**You won't have locally:** real validators (use the hardware lab; book through the Edge Team), Northgate (a mock locally, certification in test), or any production data (never available outside production; see the FAQ).

## 3. Key Repositories
| Repo | Purpose | Link |
|---|---|---|
| `tapline-platform` | All CRT-built cloud services (.NET 10 solution), event contracts, OpenAPI/AsyncAPI specs, Helm charts and environment overlays, architecture docs (`docs/architecture/`, including ADRs) | `github.com/crt-transit/tapline-platform` |
| `tapline-apps` | Rider App and Inspection App (.NET MAUI); Rider, Back-Office and Partner portals (Blazor) | `github.com/crt-transit/tapline-apps` |
| `tapline-edge` | Validator configuration releases, deny-list format, Vantor integration test kit, `tapgen` device profiles | `github.com/crt-transit/tapline-edge` |
| `tapline-infra` | Bicep modules, deployment stacks, firewall policy, alert rules | `github.com/crt-transit/tapline-infra` |
| `tapline-ops` | The `tapline-ops` CLI used in runbooks (replay, deny-list, ledger verify, DR) | `github.com/crt-transit/tapline-ops` |

## 4. Who to Ask
| Area | Contact |
|---|---|
| Fare Engine, Tap Router, fare rules, time handling | Ravi Patel (Journey Team lead) |
| Accounts, media, eligibility, apps and portals, Rider/Partner APIs | Mei Chen (Rider Team lead) |
| Payments, ledger, settlement, Northgate, RiverCard migration money | Hannah Cole (Money Team lead) |
| Validators, Device Gateway, deny list, Vantor, hardware lab | Diego Alvarez (Edge Team lead) |
| AKS, observability, SLOs, DR, on-call | Sam Ortega (SRE Lead) |
| Network, landing zone, IaC | Kofi Mensah (Cloud & Network Architect) |
| Tests, hardware-lab bookings, test data | Tomás Reyes (Test & Quality Lead) |
| Architecture questions, ADRs, ARB agenda | Aisha Karimi (Lead Solution Architect); Dana Okafor (Chief Architect) |
| Security, PCI, anything touching card data | Tom Whitaker (CISO) and the security team: `#tapline-security` |
| Fare policy and what riders are promised | Grace Liu (Director, Fare Policy & Equity) |
| "Is this a business decision?" | Your team lead first, then Elena Brooks (Program Director) |

Chat: `#tapline-dev` (general), `#tapline-<team>`, `#tapline-incident` (incidents only).

## 5. Glossary
The canonical glossary is the [Domain Model §2](../02-core-architecture/domain-model.md). These are the terms new engineers most often get wrong:

| Term | Definition |
|---|---|
| Media token | Tapline's identifier for whatever was tapped. For bank cards, an irreversible keyed hash made inside the validator's reader. Never a card number. |
| Rider key | The account ID if the medium is linked to an account, otherwise the media token. Caps are counted per rider key. |
| Service day | 03:00 to 03:00 local time. **Can be 23, 24 or 25 hours long.** Only `ServiceDayClock` computes it. |
| Fare week | Monday 03:00 to Monday 03:00 local. |
| Re-rating | Recomputing a rider's week from its taps after a late or corrected tap. Same code path as normal rating. |
| `FareAdjusted` | The *difference* produced by re-rating, posted as new ledger entries. |
| First-ride risk | Accepting an unknown card offline, then finding it declined at charge time. Accepted up to 0.3% (ADR-0004). |
| Deny list | Signed list of tokens validators must refuse. Full list nightly, deltas every 5 minutes. |
| Cap guard | The last check in Settlement Jobs that stops any charge above the cap from leaving CRT. |
| Rider Charter | CRT's public promise, including "never more than the cap". A breach is a Sev2 with automatic refunds. |
| Card-data zone (CDE) | Separate subscription and cluster for Payments, Ledger and Settlement. Restricted data lives only here. |
| RiverCard Bridge | Temporary service that lets V7s accept old RiverCards until 2028-10-31. |
| Sealed week | A rider week more than 30 days old; late taps for it need manual adjustment. |

## 6. FAQ
**Why can't I just calculate the service date in my code?**
Because service days are 23 or 25 hours twice a year. We overcharged about 2,140 riders in November 2027 because one component did "start + 24 hours". Ask `ServiceDayClock` for the interval. The analyzer will stop you anyway ([ADR-0008](../06-decisions-and-standards/adr/0008-time-handling-utc-instants-and-service-day-boundaries.md)).

**Why are there two tap streams?**
Validators know only the media token, but caps are per account across several cards. The Tap Router re-keys taps by rider key so that one Fare Engine instance owns each rider: one writer, in order, no locks. See [Container Diagram §3](../02-core-architecture/c4-model/container-diagram.md).

**Why does a validator accept a card that later turns out to be declined?**
Boarding can't wait for the network. We accept the first-ride risk (about 0.14% of card revenue) and put the card on the deny list after a decline ([ADR-0004](../06-decisions-and-standards/adr/0004-offline-first-validators-with-signed-deny-lists.md)).

**A ledger entry is wrong. How do I fix it?**
You don't edit it. The database won't let you. Fix the cause, then re-rate (which posts `FareAdjusted`) or create a reviewed adjustment batch. Both appear as new, balanced transactions ([ADR-0006](../06-decisions-and-standards/adr/0006-azure-sql-ledger-tables-for-fare-ledger.md)).

**Can I get production data to debug something?**
No. Use the `tap_id` or trace ID in Application Insights, the synthetic data in staging, or `tapgen` to reproduce. For a real rider issue, customer service starts a support session and the owning team investigates in production with PIM elevation. Raw-archive access is break-glass and needs the CISO.

**Where is card data, and can I see it?**
Nowhere you can reach. Encrypted card data passes through the Device Gateway to Payments and on to Northgate; it is never logged or stored. If you see anything that looks like a card number in a log, trace or test fixture, stop and tell `#tapline-security`.

**What do I do when a message is parked?**
Follow *Parked messages: triage and replay*. Find the cause, fix it, then `tapline-ops streams replay`. Every consumer is idempotent, so replay is safe.

**When can I deploy to production?**
Tuesday–Thursday, 10:00–15:00. Never 02:30–06:30, and never within 24 hours of a planned event or a clock change. Deployment is a pull request to the production overlay; Flux does the rest ([Deployment Topology §3.1](../04-infrastructure-and-network/deployment-topology.md)).

**Why Bicep and not Terraform?**
A CRT-wide standard: Azure-only, the landing zone is already Bicep, and there's no state file to protect ([IaC Notes §1](../04-infrastructure-and-network/infrastructure-as-code-notes.md)).

**What are EX-001 and EX-002?**
Approved exceptions to our standards:
- **EX-001:** the ferry's old V5 validators use TLS 1.2 and upload only at dock.
- **EX-002:** the RiverCard Bridge reads Castellan's database replica.

Both expire with the things they cover ([Governance Framework §6](../07-governance/governance-framework.md)).

**What happens at a clock change?**
A game day the week before (TC-RES-008), and the *Clock-change watch* runbook on the night: Journey and Money on-call are awake from 00:30 to 04:00, and charges are held for manual release in the morning. Next one: 2028-11-05.

**Something in the docs doesn't match the code.**
Trust the code, then fix the docs in the same pull request, or tell the document's owner (frontmatter `owner`). Architecture documents live in `tapline-platform/docs/architecture/` for exactly this reason ([ADR-0001](../06-decisions-and-standards/adr/0001-record-architecture-decisions.md)).
