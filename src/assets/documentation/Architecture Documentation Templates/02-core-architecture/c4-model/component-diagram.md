---
title: "C4 Model — Level 3: Component Diagram"
summary: "C4 model level 3 component diagram template: the internal components of one container, their responsibilities and dependencies."
about: "Repeat it for each container that is complex or important enough to need explaining; simple containers don't need one. Link the key interactions to sequence diagrams rather than drawing every call, and skip level 4 code diagrams unless your tools can generate them."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - component_diagram
  - c4_model
---

# C4 Model — Level 3: Component Diagram — {Project Name}

## 1. Purpose
Zooms into a single container to show its internal components and their
interactions. Repeat this template per significant container.

## 2. Container: \<Name\>

```
[Diagram or link to Structurizr/Lucidchart/Mermaid source]
```

## 3. Components
| Component | Responsibility | Depends On |
|---|---|---|
| | | |

## 4. Key Interactions
See `../sequence-diagrams.md` for the sequence diagram(s) of the primary
flow(s) through this container.

> Guidance: Level 4 (Code) diagrams are rarely worth hand-maintaining —
> generate them from IDE tooling if you need them at all.
