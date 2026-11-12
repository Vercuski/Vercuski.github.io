const t=`---
title: Transition Architecture
summary: "Transition architecture template: the interim architecture states between current and target, with temporary components and exit criteria for each."
about: "Use it when a migration happens in waves and the system must stay operational throughout. Document each interim state as a real architecture, including temporary bridges and dual-running components, and define the exit criteria that trigger the next transition."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - transition
---
# Transition Architecture — {Project Name}

## 1. Purpose
Describes interim architecture state(s) between current and target
(TOGAF Phases E/F equivalent) — useful when migration happens in waves and
the system must remain operational throughout.

## 2. Transition State N: \\<Name\\>

<!-- DIAGRAM: interim architecture diagram -->

- **Timeframe:**
- **What's changed from previous state:**
- **Temporary components/bridges:**
- **Exit criteria (what triggers the next transition):**

Repeat per transition state.
`;export{t as default};
