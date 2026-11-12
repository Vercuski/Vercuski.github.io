const e=`---
title: Use Cases / User Stories
summary: "Use case and user story template: actors, preconditions, main and alternate flows, plus user stories with Given/When/Then acceptance criteria."
about: "Use the use case format when flows have meaningful alternates, preconditions or several actors; use user stories for smaller, independent increments. Link each use case to the non-functional requirements it exercises so performance and security expectations stay attached to real behavior."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - use_cases
  - user_stories
---

# Use Cases / User Stories — {Project Name}

## 1 Use Case Template
Copy this block per use case.

### 1.1 UC-1: \\<Title\\>
- **Actor(s):**
- **Preconditions:**
- **Main Flow:**
  1.
  2.
- **Alternate Flows:**
- **Postconditions:**
- **Related NFRs:**

---

## 2. User Story Format (alternative)
> As a <role>, I want <capability>, so that <benefit>.

**Acceptance Criteria (Given/When/Then):**
- Given ..., when ..., then ...
`;export{e as default};
