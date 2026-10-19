---
title: Coding Standards — Project Tapline
status: approved
owner: Ravi Patel (Principal Engineer, Fare Engine)
version: 1.0.0
last_updated: 2026-08-14
reviewers:
  - Mei Chen, Hannah Cole, Diego Alvarez (team leads) — approved 2026-08-12
  - Sam Ortega (SRE Lead) — approved §5 on 2026-08-13
  - Tom Whitaker (CISO) — approved §5 (data in logs) on 2026-08-13
  - Architecture Review Board — adopted 2026-08-12
tags:
  - coding_practices
  - standards
---
# Coding Standards — Project Tapline

> [!summary] Scope
> Applies to all CRT-built code in `tapline-platform` and `tapline-apps`: C# on .NET 10, plus SQL and Bicep where noted. Most rules are enforced by analyzers and CI, not by reviewers' memory (§8). When this document and an analyzer disagree, fix one of them, never ignore the warning. Architecture-level rules (layers, contracts) are in the [4+1 Development View](../02-core-architecture/4plus1-views.md) and the [Architecture Principles](architecture-principles.md).

## 1. General Principles
1. **Clarity over cleverness.** Code is read by auditors and future CRT staff, not just today's team.
2. **The domain core is pure.** Domain and fare-calculation code does no I/O, reads no clock and holds no static state. Inputs in, results out. This is what makes fares deterministic ([P4](architecture-principles.md)).
3. **Nullable reference types are on** everywhere. `!` (null-forgiving) needs a comment explaining why it's safe.
4. **Immutability by default:** `record` / `record struct` for values and events; `readonly` fields; `IReadOnlyList<T>` in public signatures.
5. **Async all the way.** No `.Result`, `.Wait()` or `async void` (except event handlers in MAUI). Every async method takes a `CancellationToken` and passes it on.
6. **Dependency injection** through constructors. No service locator; no `static` singletons.
7. **Money rules:**
   - Money is always the `Money` type from `Tapline.SharedKernel`: integer cents plus currency.
   - Never `double` or `float` for money. Never `decimal` arithmetic in the domain; parse to cents at the boundary.
   - Amounts in APIs, events and SQL are integer cents (`amountCents`, `bigint`).
8. **Time rules:**
   - **Never read the clock directly.** Inject `TimeProvider` (`timeProvider.GetUtcNow()`). `DateTime.Now`, `DateTime.UtcNow` and `DateTimeOffset.Now` are banned by analyzer (§8).
   - **Instants are `DateTimeOffset` in UTC.** Store and transmit UTC.
   - **CRT's time zone** is `TimeZoneInfo.FindSystemTimeZoneById("America/New_York")`, using the IANA ID (works on Linux containers).
   - **Converting local to UTC** at system boundaries (e.g. Vantor tap times in the Device Gateway ACL) uses `TimeZoneInfo.ConvertTimeToUtc(localDateTime, crtZone)`.
   - **Service days and fare weeks** are calculated only by `ServiceDayClock` in `Tapline.Journey.Domain`. No other code derives a service date.

```csharp
// Tapline.SharedKernel
public readonly record struct Money(long Cents, string Currency = "USD")
{
    public static Money Zero => new(0);
    public static Money operator +(Money a, Money b) => a.Currency == b.Currency
        ? new(a.Cents + b.Cents, a.Currency)
        : throw new InvalidOperationException("Currency mismatch");
    public static Money Min(Money a, Money b) => a.Cents <= b.Cents ? a : b;
    public override string ToString() => $"{Cents / 100m:F2} {Currency}"; // display only
}

// Tapline.Journey.Domain
public static class ServiceDayClock
{
    private static readonly TimeSpan DayStartsAt = TimeSpan.FromHours(3);

    public static DateOnly ServiceDateFor(DateTimeOffset tapUtc, TimeZoneInfo zone)
    {
        var local = TimeZoneInfo.ConvertTime(tapUtc, zone);
        return DateOnly.FromDateTime(local.DateTime - DayStartsAt);
    }
}
```

## 2. Naming Conventions
| Element | Convention | Example |
|---|---|---|
| Namespaces, projects | `Tapline.<Context>.<Layer>` | `Tapline.Journey.Domain` |
| Types, methods, properties | PascalCase | `RiderFareWeek.Apply` |
| Private fields | `_camelCase` | `_fareRules` |
| Locals, parameters | camelCase | `tapUtc` |
| Interfaces | `I` prefix | `IFareRuleResolver` |
| Async methods | `Async` suffix | `LoadWeekAsync` |
| Domain events (C#) | Past tense, `Event` suffix not used | `FareCalculated`, `MediumBlocked` |
| Commands | Imperative | `BlockMedium`, `ApproveFareRuleVersion` |
| Event types (wire) | `crt.tapline.<context>.<kebab-event>.v<n>` | `crt.tapline.journey.fare-calculated.v1` |
| REST paths | Lowercase, kebab-case, plural nouns | `/v1/accounts/{accountId}/media` |
| JSON properties | camelCase; amounts end in `Cents`; instants end in `At` (UTC ISO 8601) | `cappedFareCents`, `tappedAt` |
| SQL tables and columns | `snake_case`, singular table names (CRT SQL standard) | `rider_fare_week.weekly_total_cents` |
| SQL constraints | `pk_`, `fk_`, `uq_`, `ix_`, `ck_` + table + columns | `uq_ledger_transaction_source_event_id` |
| Configuration keys | Section:Key, PascalCase | `FareEngine:MaxConcurrentRiderKeys` |
| Test methods | `Method_Scenario_ExpectedResult` | `Apply_ThirdTapReachesDailyCap_ChargesRemainderOnly` |

**Use the ubiquitous language.** Class and variable names use the terms in the [Domain Model glossary](../02-core-architecture/domain-model.md): `Medium`, not `Card`; `Trip`, not `Journey`; `Charge`, not `Transaction`.

## 3. Project/Solution Structure
- Layout as in the [4+1 Development View](../02-core-architecture/4plus1-views.md): `src/<Context>/{Domain,Application,Infrastructure,<Host>}`.
- **Dependencies point inward:** Domain ← Application ← Infrastructure / Host. Enforced by architecture tests (§6).
- A context may reference only `Tapline.SharedKernel` and `Tapline.Contracts` from outside itself.
- **Central Package Management** (`Directory.Packages.props`): one version of each package across the solution. New packages need a team lead's approval and must be on the [tech radar](reference-architecture-and-technology-radar.md) as Adopt or Trial.
- **Shared build settings** in `Directory.Build.props`: `Nullable=enable`, `TreatWarningsAsErrors=true`, `AnalysisLevel=latest-recommended`, deterministic builds, and SourceLink.
- **One host project per deployable**, with no business logic in hosts: wiring, configuration and endpoints only.
- **Minimal APIs** for HTTP endpoints, grouped per feature with `MapGroup`. No MVC controllers in new code.

## 4. Error Handling
- **Expected business outcomes are results, not exceptions.** Domain methods return `Result<T>` with a typed `DomainError`, e.g. `MediumLimitReached` or `RefundNeedsSecondApprover`. Exceptions are for the unexpected: bugs, infrastructure failure, broken invariants.
- **At the API edge,** results map to Problem Details (RFC 9457) with stable `TAPLINE-*` codes ([API Specification Guide §5](../03-interfaces-and-integration/api-specification-guide.md)). Unhandled exceptions are caught by one `IExceptionHandler` that returns a generic 500 problem with the trace ID and logs the detail. Exception messages are never returned to callers.
- **Never swallow exceptions.** A `catch` either handles the case completely, adds context and rethrows, or logs and converts to a result at a boundary. `catch (Exception) { }` fails the build (analyzer CA1031 configured as an error outside boundary code).
- **Stream consumers:** retry transient failures with backoff, then park the message with the error ([Integration Architecture §5](../03-interfaces-and-integration/integration-architecture.md)). Never skip a message silently, and never block a partition indefinitely.
- **Outbound HTTP** uses `Microsoft.Extensions.Http.Resilience` standard pipelines. No hand-written retry loops.
- **Guard clauses** use `ArgumentNullException.ThrowIfNull` and `ArgumentOutOfRangeException.ThrowIfNegative` and similar.

## 5. Logging Standards
- **`ILogger<T>` with source-generated `[LoggerMessage]` methods** for every log statement on hot paths: no string interpolation in log calls, and a stable `EventId` per message.
- **Structured properties, allow-listed.**
  - Confidential and Restricted data must never be logged.
  - Types holding such data are annotated with data-classification attributes and redacted by `Microsoft.Extensions.Compliance.Redaction`. Media tokens are HMAC-redacted; card and contact data are erased.
  - The Device Gateway's logging middleware explicitly excludes the encrypted card-data field (threat T-07), and a unit test asserts it.
- **Correlation:** every log record carries the W3C trace ID (automatic through OpenTelemetry). Journey and Payments logs also carry `tap_id` or `charge_id` as structured properties.
- **Levels:**
  | Level | Use for | Production default |
  |---|---|---|
  | Trace | Development only | Off |
  | Debug | Diagnostic detail | Off; switchable per service at runtime |
  | Information | Business-significant events (fare version published, settlement sent) | On; never per tap |
  | Warning | Recovered problems (retry succeeded, late tap re-rated) | On |
  | Error | Failed operations needing attention (message parked) | On; alert-linked |
  | Critical | Service cannot function | On; paging |
- **Per-tap events are metrics and traces, not log lines.** At 320k taps a day, logging each one costs money and hides real problems.

## 6. Testing Standards
| Level | Tooling | Expectation |
|---|---|---|
| **Unit** | xUnit v3, Shouldly, NSubstitute | Every domain rule. Domain tests use no mocks; the domain has no dependencies to mock. |
| **Property-based** | FsCheck | **Required** for the Fare Engine core: generated tap sequences must satisfy the invariants below |
| **Integration** | Testcontainers (SQL Server, Azurite, Redis), Event Hubs emulator | Repositories, outbox relay, consumers end to end within a context |
| **Contract** | JSON Schema validation of produced and consumed events; OpenAPI diff (`oasdiff`) | Every producer and consumer of an event or API |
| **Architecture** | NetArchTest | Layer direction, context isolation, no vendor SDK types in Domain |
| **Hardware-in-the-loop** | Hardware lab | Owned by the Edge Team ([Test Strategy](../10-testing-and-validation/test-strategy.md)) |

**Fare Engine invariants** checked by property-based tests over generated weeks of taps (random times, media, operators, late arrivals and duplicates):
1. Daily and weekly totals never exceed the caps for the fare category.
2. **Determinism:** rating the same taps twice gives identical results.
3. **Arrival order doesn't matter:** the final result is the same whatever order taps arrive in.
4. **Duplicates don't matter:** replaying any tap changes nothing.
5. **Re-rating differences sum correctly:** the sum of all `FareCalculated` and `FareAdjusted` amounts equals the result of rating the final tap set from scratch.
6. **Service-day boundary:** taps at 02:59:59 and 03:00:00 local fall in different service days.

**Time in tests:** use `FakeTimeProvider` (`Microsoft.Extensions.TimeProvider.Testing`) for code that reads the time. Pure domain code takes instants as parameters.

**Coverage:** ≥ 80% line coverage for `Journey.Domain`, `Ledger.*` and `Payments.Domain`; ≥ 60% elsewhere (NFR maintainability). Stryker.NET mutation testing runs on `Journey.Domain` monthly, with a mutation score target of 70% or more.

## 7. Code Review Checklist
- [ ] The change does what the linked work item says, and nothing unrelated
- [ ] Names use the ubiquitous language; no new synonyms for glossary terms
- [ ] Domain code is pure: no I/O, no clock, no static state
- [ ] Money uses `Money` / integer cents; no `double` or `float` anywhere near amounts
- [ ] Time uses `TimeProvider` and UTC instants; local-time conversion only at boundaries or in `ServiceDayClock`
- [ ] Every new message or state-changing request is idempotent (unique ID, constraint or key)
- [ ] Events and APIs: schema or spec updated; change is backward-compatible or versioned
- [ ] No Confidential or Restricted data in logs, events, exceptions or test fixtures
- [ ] Errors: expected outcomes are results; exceptions aren't swallowed; problem details returned at the edge
- [ ] Tests at the right level, including a property-based test if Fare Engine rules changed
- [ ] Database changes are expand-and-contract; ledger tables changed only additively
- [ ] Observability: new metrics, traces or alerts where behavior is new; runbook updated if an alert was added
- [ ] Security-sensitive change (auth, card-data zone, signing)? Security reviewer added

## 8. Linting / Formatting Tools
| Tool | Purpose | Enforced |
|---|---|---|
| `.editorconfig` (repo root) | Formatting and C# style rules | IDE + `dotnet format --verify-no-changes` in CI |
| Microsoft .NET analyzers (`AnalysisLevel=latest-recommended`) | Correctness, performance, security | Build (warnings are errors) |
| Roslynator, Meziantou.Analyzer, SonarAnalyzer.CSharp | Additional quality and bug rules | Build |
| `Microsoft.CodeAnalysis.BannedApiAnalyzers` | Bans `DateTime.Now`, `DateTime.UtcNow`, `DateTimeOffset.Now`, `Thread.Sleep`, `Newtonsoft.Json.*`, `System.Random` in domain projects | Build |
| NetArchTest | Architecture rules | Test stage |
| Gitleaks | Secrets | Pre-commit + CI |
| Spectral, `oasdiff` | API spec rules, breaking changes | CI |
| SQLFluff (T-SQL dialect) | SQL style (`snake_case`, keywords upper case) | CI for `.sql` migrations |
| PSRule for Azure, `bicep lint` | Bicep | CI in `tapline-infra` |

Suppressing a rule needs `#pragma warning disable` with a justification comment, or a scoped `.editorconfig` entry reviewed by a team lead. Solution-wide suppressions need ARB approval.
