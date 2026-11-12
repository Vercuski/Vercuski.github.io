const e=`---
title: Infrastructure-as-Code Notes
summary: "Infrastructure-as-code notes template: a map into the IaC repository covering module structure, state management, promotion process and secrets."
about: "The IaC repository is the real documentation; this page is the map into it. Don't copy Terraform or Bicep content here. Focus on what the code doesn't make obvious: where state lives and who can change it, how a change is promoted from dev to production, and how secrets reach the infrastructure."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - iac
---
# Infrastructure as Code — {Project Name}

> Guidance: The IaC repo itself is the living documentation. This file is
> the map into it — don't duplicate Terraform/Bicep content here.

## 1. Repository
- Location: TBD
- Tooling: Terraform / Bicep / Pulumi / CloudFormation / TBD

## 2. Module Structure
| Module | Purpose | Owner |
|---|---|---|
| TBD | TBD | TBD |

## 3. State Management
- Backend: TBD (e.g., remote state in S3 + DynamoDB lock, Terraform Cloud)
- Access control: TBD

## 4. Promotion Process
TBD — how does a change move dev → staging → prod?

## 5. Secrets Management
TBD — link to \`../05-security/security-architecture.md\`
`;export{e as default};
