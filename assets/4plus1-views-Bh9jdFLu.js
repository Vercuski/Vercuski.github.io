const e=`---
title: 4+1 Architectural View Model
summary: "4+1 architectural view model template: logical, process, development and physical views, tied together by key scenarios."
about: "Use Kruchten's 4+1 model instead of, or alongside, C4 when your stakeholders already know it. Each view has its own audience, from developers to operations. The '+1' scenarios matter most: pick a handful of key use cases and show how they run through all four views."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - 4plus1
---

# 4+1 View Model — {Project Name}

> Guidance: Use this instead of, or alongside, C4 if your stakeholders are
> already familiar with Kruchten's model. The "+1" is scenarios that tie
> the other four together.

## 1. Logical View
> Object/class model, key abstractions. Audience: developers, designers.

TBD

## 2. Process View
> Concurrency, processes, threads — runtime behavior. Audience:
> integrators, performance engineers.

TBD

## 3. Development View
> Module/package/layer organization, build structure. Audience:
> developers, project management.

TBD

## 4. Physical View
> Mapping of software to hardware/infrastructure. Audience: system
> engineers, ops.

TBD

## 5. Scenarios (+1)
> A handful of key use cases that exercise all four views — the glue and
> validation.

| Scenario | Views Exercised | Notes |
|---|---|---|
| TBD | Logical, Process | TBD |
`;export{e as default};
