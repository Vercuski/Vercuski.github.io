const e=`---
title: API Specification Guide — Project Tapline
status: approved
owner: Aisha Karimi (Lead Solution Architect)
version: 1.0.0
last_updated: 2026-10-02
reviewers:
  - Mei Chen (Rider Team lead) — approved 2026-09-30
  - Diego Alvarez (Edge Team lead) — approved 2026-09-30
  - Hannah Cole (Money Team lead) — approved 2026-10-01
  - Tom Whitaker (CISO) — approved §4 on 2026-10-01
tags:
  - api_specification_guide
---
# API Specifications — Project Tapline

> [!summary] This is a pointer, not the spec
> The contracts themselves are machine-readable files in \`tapline-platform/specs/\`: OpenAPI 3.1 for REST, AsyncAPI 3.0 for events, and JSON Schema for event payloads. They are linted in CI, used to generate clients and mocks, and checked by contract tests. This page explains where they are and the rules every Tapline API follows. Integration patterns are in the [Integration Architecture](integration-architecture.md).

## 1. Inventory

| API | Type | Spec Location | Owning Team | Status |
|---|---|---|---|---|
| Rider API | REST | \`specs/openapi/rider-api.v1.yaml\` | Rider Team | Draft (Stable at Phase 1) |
| Back-Office API: Accounts | REST | \`specs/openapi/backoffice-accounts.v1.yaml\` | Rider Team | Draft |
| Back-Office API: Fare Policy | REST | \`specs/openapi/backoffice-farepolicy.v1.yaml\` | Journey Team | Draft |
| Back-Office API: Payments and Ledger | REST | \`specs/openapi/backoffice-money.v1.yaml\` | Money Team | Draft |
| Back-Office API: Device Fleet | REST | \`specs/openapi/backoffice-fleet.v1.yaml\` | Edge Team | Draft |
| Device API | REST (mutual TLS) | \`specs/openapi/device-api.v1.yaml\` | Edge Team | Draft; frozen by ICD-002 |
| Inspection API | REST | \`specs/openapi/inspection-api.v1.yaml\` | Edge Team | Draft |
| Partner API | REST | \`specs/openapi/partner-api.v1.yaml\` | Money Team | Planned (Phase 4) |
| Fare Data API (public) | REST, read-only | \`specs/openapi/fare-data-api.v1.yaml\` | Journey Team | Draft |
| GTFS-Fares v2 feed | Static files (zip) | Generated; format by the GTFS specification | Journey Team | Draft |
| CornerPay Load Webhook | REST webhook (inbound) | \`specs/openapi/cornerpay-webhook.v1.yaml\` | Money Team | Planned (ICD-004) |
| Tapline domain events | Async (Event Hubs, CloudEvents) | \`specs/asyncapi/tapline-events.yaml\` + \`src/Contracts/schemas/**\` | Each producing team | Draft (v1 events) |
| Northgate interfaces (consumed) | REST, SFTP files | \`specs/external/northgate/\` (Northgate-owned formats) | Money Team | Stable ([ICD-001](interface-control-document.md)) |

**How specs are produced**
- **Code-first for our REST APIs.** ASP.NET Core 10 generates OpenAPI 3.1 at build time (\`Microsoft.AspNetCore.OpenApi\`). The build writes the document to \`specs/openapi/\`, and CI fails if the committed file differs from the generated one. The committed spec is therefore always the truth, and changes to it are reviewed like code.
- **Schema-first for events.** JSON Schemas are written by hand in \`src/Contracts/schemas/\`, and C# types are generated from them. This keeps the contract independent of any one consumer's language.
- **Linting:** Spectral with CRT's ruleset (\`specs/.spectral.yaml\`) checks naming, problem-details responses, pagination, security schemes and examples.
- **Mocks:** a Prism mock server is published for every OpenAPI spec, so the app teams can build against an API before it exists.
- **Breaking-change check:** \`oasdiff\` runs on every pull request and blocks breaking changes to a published major version.

## 2. Versioning Strategy

- **URI major version:** \`/v1/…\`. The major version changes only for a breaking change.
- **Contract version:** \`info.version\` in each spec uses semantic versioning. Minor for additive changes, patch for documentation fixes.
- **What counts as breaking:** removing or renaming a field, endpoint or enum value; making an optional field required; changing a type or format; tightening validation; changing authentication or scopes; changing the meaning of a field.
- **What doesn't:** adding endpoints, optional request fields, response fields or new error codes. Clients must ignore unknown fields. This is in the client contract and is tested in the app.
- **Events:** see [Integration Architecture §6](integration-architecture.md). The version is in the event type (\`…fare-calculated.v1\`), and evolution is backward-compatible only.

## 3. Deprecation Policy

| API | Minimum support for an old major version after its replacement ships | Notes |
|---|---|---|
| Rider API | **12 months** | Phone apps update slowly. The app checks a minimum supported version and prompts riders to update 60 days before cut-off. |
| Partner API | **12 months** | Partners need budget cycles to change. Notice is also given through the Partner Operator Council. |
| Fare Data API (public) | **12 months** | Announced on the open-data portal and GTFS mailing list. |
| Back-Office, Inspection APIs | **Until the matching client release is live** | CRT controls both sides. |
| Device API | **Per ICD-002** | Validator firmware changes need Vantor releases and fleet rollout. Expect 6 months or more. |

Deprecated endpoints return the \`Deprecation\` header (RFC 9745) and a \`Sunset\` header (RFC 8594) with the removal date, plus a \`Link\` to the migration notes. Usage of deprecated endpoints is tracked per client ID, and owners of remaining clients are contacted directly 90 and 30 days before sunset.

## 4. Authentication & Authorization

| API | Who calls it | Authentication | Authorization |
|---|---|---|---|
| Rider API | Riders via app and portal | OAuth 2.0 authorization code + PKCE, Entra External ID; access tokens 15 min; refresh tokens bound to device | Scopes \`rider.read\`, \`rider.write\`, \`payments.topup\`. A rider can only reach their own account; enforced in the service, not just at the gateway. |
| Back-Office APIs | CRT staff | Entra ID, phishing-resistant MFA; Back-Office Portal acts on behalf of the user | App roles: \`cs.agent\`, \`cs.supervisor\`, \`fare.analyst\`, \`fare.approver\`, \`revenue.analyst\`, \`fleet.operator\`. Two-person rules enforced in the service (FR-CS-02, FR-POL-02). |
| Partner API | Partner finance systems | OAuth 2.0 client credentials (Entra ID B2B app registration per partner) | Scope \`partner.statements.read\`; data filtered to the caller's operator code |
| Device API | Validators | Mutual TLS with a per-device X.509 certificate issued by CRT's device CA | Device must be registered and active; tap signatures verified per device |
| Inspection API | Inspection App | Entra ID (inspector sign-in) + device certificate | Role \`inspector\`; returns only paid/not-paid data (FR-INSP-02) |
| Fare Data API | Anyone | None (public); API key optional for higher rate limits | Read-only, Public data only |
| CornerPay webhook | CornerPay | Mutual TLS + HMAC-SHA256 signature with timestamp | Fixed source; idempotent by CornerPay load ID |

Rate limits are applied at API Management per client and per user. Full security design: [Security Architecture](../05-security/security-architecture.md).

## 5. Error Handling Convention

Every Tapline REST API returns errors as **Problem Details (RFC 9457)** with \`Content-Type: application/problem+json\`, so each client writes one error handler. RFC 9457 replaced RFC 7807 and is compatible with it.

\`\`\`json
{
  "type": "https://api.crt-transit.example/problems/medium-limit-reached",
  "title": "Medium limit reached",
  "status": 409,
  "detail": "An account can have at most 5 linked cards or devices. Remove one to add another.",
  "instance": "/v1/accounts/acct_7Q2M9X/media",
  "code": "TAPLINE-ACCT-0004",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "errors": null
}
\`\`\`

**Rules**
- **\`type\`** is a stable URI per problem. Its page documents the cause and the fix. **\`code\`** is the machine-readable code: \`TAPLINE-<CONTEXT>-nnnn\`. Clients branch on \`code\`, never on \`title\` or \`detail\`.
- **\`detail\`** is safe to show to the user and is translated per the request's \`Accept-Language\` (English, Spanish, Vietnamese, Simplified Chinese). It never contains internal details, stack traces, tokens or other people's data.
- **\`traceId\`** is the W3C trace context, so support can find the request in Application Insights.
- **Validation errors** use status 400, code \`TAPLINE-VALIDATION\`, and an \`errors\` object keyed by field (the ASP.NET Core \`ValidationProblemDetails\` shape).
- **Status codes:**

  | Code | Meaning |
  |---|---|
  | 400 | Validation |
  | 401 | Not authenticated |
  | 403 | Not allowed |
  | 404 | Not found, or not yours (never reveal which) |
  | 409 | Business rule conflict |
  | 412 | Concurrency (stale \`If-Match\`) |
  | 422 | Not used; business-rule failures return 409 |
  | 429 | Rate limited, with \`Retry-After\` |
  | 503 | Dependency down, with \`Retry-After\` |

- **Idempotency:** every \`POST\` that moves money or changes state accepts an \`Idempotency-Key\` header. A repeat within 24 hours returns the original response.
- **Pagination:** cursor-based (\`?cursor=…&limit=…\`), returning \`next\` in the body. No offset pagination on large collections.

**Error code catalog** is generated from code into \`specs/errors.md\`. Examples:

| Code | Status | Meaning |
|---|---|---|
| \`TAPLINE-ACCT-0004\` | 409 | Medium limit reached (FR-ACCT-02) |
| \`TAPLINE-ACCT-0011\` | 409 | Medium already linked to another account |
| \`TAPLINE-PAY-0002\` | 409 | Top-up amount outside $5–$100 (FR-PAY-02) |
| \`TAPLINE-PAY-0009\` | 503 | Payment processor unavailable; try again |
| \`TAPLINE-POL-0003\` | 409 | Fare rule version needs a second approver (FR-POL-02) |
| \`TAPLINE-ELIG-0005\` | 202 | Eligibility check pending with DHS (not an error; returned as a status resource) |

## 6. Example OpenAPI Skeleton

The Rider API's trips endpoint as it appears in the generated spec (abridged):

\`\`\`yaml
openapi: 3.1.0
info:
  title: Tapline Rider API
  version: 1.3.0
  description: Accounts, media, trips and payments for riders.
servers:
  - url: https://api.crt-transit.example/rider/v1
security:
  - riderAuth: [rider.read]
paths:
  /accounts/{accountId}/trips:
    get:
      summary: List the rider's trips, newest first
      operationId: listTrips
      parameters:
        - { name: accountId, in: path, required: true, schema: { type: string } }
        - { name: from, in: query, schema: { type: string, format: date } }
        - { name: cursor, in: query, schema: { type: string } }
        - { name: limit, in: query, schema: { type: integer, minimum: 1, maximum: 100, default: 25 } }
      responses:
        '200':
          description: A page of trips
          content:
            application/json:
              schema: { $ref: '#/components/schemas/TripPage' }
        '404':
          description: Account not found or not yours
          content:
            application/problem+json:
              schema: { $ref: '#/components/schemas/ProblemDetails' }
components:
  securitySchemes:
    riderAuth:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://login.crt-transit.example/oauth2/v2.0/authorize
          tokenUrl: https://login.crt-transit.example/oauth2/v2.0/token
          scopes:
            rider.read: Read your account and trips
            rider.write: Change your account and cards
            payments.topup: Add money to your account
  schemas:
    Money:
      type: object
      required: [amountCents, currency]
      properties:
        amountCents: { type: integer }
        currency: { type: string, const: USD }
    Trip:
      type: object
      required: [tripId, serviceDate, startedAt, operator, fare, capped]
      properties:
        tripId: { type: string }
        serviceDate: { type: string, format: date }
        startedAt: { type: string, format: date-time }
        operator: { type: string, examples: [CRT] }
        taps:
          type: array
          items: { $ref: '#/components/schemas/TapSummary' }
        fare: { $ref: '#/components/schemas/Money' }
        capped: { type: boolean, description: True when a cap reduced this fare }
    TapSummary:
      type: object
      properties:
        tappedAt: { type: string, format: date-time }
        stopName: { type: string }
        routeName: { type: [string, 'null'] }
    TripPage:
      type: object
      required: [items]
      properties:
        items: { type: array, items: { $ref: '#/components/schemas/Trip' } }
        next: { type: [string, 'null'], description: Cursor for the next page }
    ProblemDetails:
      type: object
      required: [type, title, status, code]
      properties:
        type: { type: string, format: uri }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }
        instance: { type: string }
        code: { type: string, pattern: '^TAPLINE-[A-Z]+-\\d{4}$|^TAPLINE-VALIDATION$' }
        traceId: { type: string }
\`\`\`

And the matching AsyncAPI entry for one event (abridged from \`specs/asyncapi/tapline-events.yaml\`):

\`\`\`yaml
asyncapi: 3.0.0
info:
  title: Tapline domain events
  version: 1.0.0
channels:
  domainEvents:
    address: domain-events
    messages:
      fareCalculated:
        name: crt.tapline.journey.fare-calculated.v1
        contentType: application/cloudevents+json
        payload:
          $ref: '../../src/Contracts/schemas/journey/fare-calculated.v1.json'
operations:
  publishFareCalculated:
    action: send
    channel: { $ref: '#/channels/domainEvents' }
    messages:
      - $ref: '#/channels/domainEvents/messages/fareCalculated'
\`\`\`
`;export{e as default};
