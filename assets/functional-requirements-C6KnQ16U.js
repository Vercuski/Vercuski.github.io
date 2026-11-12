const e=`---
title: Functional Requirements Specification (FRS)
summary: "Functional requirements specification (FRS) template: requirements with acceptance criteria and a traceability matrix from business requirements to tests."
about: "Use it once business requirements are agreed. Every functional requirement should name the business requirement it serves and have acceptance criteria that a tester could check. The traceability matrix is what lets you answer which tests cover a requirement, and which requirements nobody asked for."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - functional_requirements
---

# Functional Requirements Specification — {Project Name}

## 1. Overview

## 2. Functional Requirements
| ID | Requirement | Source (BR-ID) | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-1 | | | | |

## 3. Traceability Matrix
Maps functional requirements back to business requirements and forward to
test cases.

| FR ID | BR ID | Test Case ID |
|---|---|---|
| | | |
`;export{e as default};
