const n=`---
title: As-Built Documentation
summary: "As-built documentation template: the architecture as actually deployed, deviations from the design and why, environments, configuration and known issues."
about: "Write it at handover to record reality, which often differs from the original architecture document. The deviations table is the most valuable part: what changed, and why, saves the next team from rediscovering it."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - as_built
---
# As-Built Documentation — {Project Name}

## 1. Summary
What was actually deployed — this document should reflect reality, which
often diverges from the original architecture document.

## 2. Final Architecture
<!-- DIAGRAM: as-built architecture diagram -->

## 3. Deviations from Original Design
| Planned | Actual | Reason |
|---|---|---|
| | | |

## 4. Environment Details
| Environment | URL | Notes |
|---|---|---|
| Production | | |
| Staging | | |

## 5. Key Configuration
Non-secret configuration values, feature flags, etc.

## 6. Known Issues / Technical Debt
`;export{n as default};
