const n=`---
title: "C4 Model — Level 2: Container Diagram"
summary: "C4 model level 2 container diagram template: applications, data stores and services, their technologies, and how they communicate."
about: "This is usually the most useful single diagram for a development team. List each container's technology and responsibility, and for every connection record the protocol and what flows across it. It is also the natural starting point for a threat model's data flow diagram."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - container_diagram
  - containerization
  - c4_model
---
# C4 Model — Level 2: Container Diagram — {Project Name}

## 1. Purpose
Zooms into the system to show the high-level technical building blocks
(applications, data stores, microservices) and how they communicate.

\`\`\`
[Diagram or link to Structurizr/Lucidchart/Mermaid source]
\`\`\`

## 2. Containers
| Container | Technology | Responsibility |
|---|---|---|
| Web App | | |
| API | | |
| Database | | |
| Message Broker | | |

## 3. Communication
| From | To | Protocol | Description |
|---|---|---|---|
| | | | |
`;export{n as default};
