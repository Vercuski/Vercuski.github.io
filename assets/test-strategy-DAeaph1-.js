const e=`---
title: Test Strategy
summary: "Test strategy template: testing levels from unit to chaos, NFR validation, load and security testing, test environments, test data and exit criteria."
about: "Most test strategies cover only functional correctness. The architecture-relevant part is showing how each non-functional requirement will be validated, with load, resilience and security tests whose pass criteria come straight from the NFR scenarios."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - test_strategy
---
# Test Strategy — {Project Name}

> Guidance: Most test strategies only cover functional correctness. The
> architecture-relevant part is validating the NFRs from
> \`../01-requirements/non-functional-requirements.md\` — that's the focus
> of this doc.

## 1. Testing Levels
| Level | Scope | Owner | Tooling |
|---|---|---|---|
| Unit | | | |
| Integration | | | |
| Contract | | | (e.g., Pact) |
| E2E | | | |
| Performance/Load | | | |
| Security | | | |
| Chaos/Resilience | | | |

## 2. NFR Validation
How each non-functional requirement will be validated.

| NFR | Test Approach | Pass Criteria |
|---|---|---|

### 2.1 Load / Performance Testing
- Tooling: TBD (k6, JMeter, Gatling)
- Scenarios tested: TBD (link back to quality attribute scenarios)
- Pass/fail criteria: TBD

### 2.2 Chaos / Resilience Testing
- Tooling: TBD (Chaos Monkey, Gremlin, manual game days)
- Failure modes injected: TBD
- Expected behavior: TBD

### 2.3 Security Testing
- Penetration testing cadence: TBD
- SAST/DAST tooling: TBD
- Dependency scanning: TBD

### 2.4 Accessibility Testing (if applicable)
TBD

## 3. Test Environments
See \`../04-infrastructure-and-network/deployment-topology.md\`.

## 4. Test Data Strategy
TBD — synthetic data, anonymized production data, generation strategy.

## 5. Entry/Exit Criteria
> Guidance: What must be true for this to be considered "tested enough"
> to ship?

- Entry: TBD
- Exit: TBD
`;export{e as default};
