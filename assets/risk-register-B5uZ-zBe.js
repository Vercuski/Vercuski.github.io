const e=`---
title: Risk Register
summary: "Risk register template: architecture and delivery risks scored by likelihood and impact, with mitigation, owner, status and a review cadence."
about: "Give every risk an owner and a mitigation, and review the register on a fixed schedule; a register nobody reviews is just a list of worries. Close or re-score risks as the project learns more, rather than letting them accumulate."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - risk_register
---
# Risk Register — {Project Name}

| ID | Risk | Category | Likelihood | Impact | Score | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| R-1 | | Technical/Business/Security/Ops | L/M/H | L/M/H | | | | Open/Mitigated/Closed |

## 1. Risk Scoring Legend
- **Likelihood / Impact:** Low / Medium / High
- **Score:** Likelihood × Impact (or your org's standard formula)

## 2. Review Cadence
How often this register is reviewed and by whom.
`;export{e as default};
