const e=`---
title: Infrastructure as Code — Project Tapline
status: approved
owner: Kofi Mensah (Cloud & Network Architect)
version: 1.1.0
last_updated: 2026-10-16
reviewers:
  - Sam Ortega (SRE Lead) — approved 2026-10-15
  - Tom Whitaker (CISO) — approved §5 on 2026-10-15
  - Platform Team — reviewed 2026-10-16
tags:
  - iac
---
# Infrastructure as Code — Project Tapline

> [!summary] The map, not the territory
> Everything in Azure for Tapline is defined in **Bicep** in the \`tapline-infra\` repository and deployed through **GitHub Actions** as **Azure Deployment Stacks**. Kubernetes workloads are deployed by **Flux** (GitOps) from manifests in \`tapline-platform/deploy/\`. Nobody changes production infrastructure by hand: portal access is read-only, and deny settings on the stacks block changes made outside the pipeline. This page explains where things are; the repositories themselves are the documentation.

**Change history:** v1.0 (2026-09-10) first version. v1.1 (2026-10-16) added the firewall-policy module split, nightly drift detection and the break-glass procedure.

## 1. Repository
- **Location:**
  - \`github.com/crt-transit/tapline-infra\` (private): Azure infrastructure.
  - \`github.com/crt-transit/tapline-platform/deploy/\`: Kubernetes manifests (Helm charts plus Kustomize overlays per environment), reconciled by Flux.
  - \`github.com/crt-transit/tapline-edge\`: validator configuration, deny-list format and Vantor test kit. Not infrastructure, but versioned and released the same way.
- **Tooling:**
  - **Bicep**, using **Azure Verified Modules (AVM)** wherever one exists. CRT wraps AVM modules in thin modules that set CRT defaults: private endpoints on, public access off, diagnostics to Log Analytics, zone redundancy on, and tags.
  - **Azure Deployment Stacks** manage the lifecycle of each environment's resource groups: create, update, delete resources removed from code, and **deny settings** that block changes outside the pipeline.
  - **PSRule for Azure** and **Azure Policy** validate templates in CI and at deployment.
  - **Flux** (AKS GitOps extension) for cluster workloads; **Helm** for packaging.
- **Why Bicep, not Terraform:** Tapline is Azure-only, CRT's Azure landing zone is already in Bicep, and Bicep needs no state file to protect (see §3). Recorded in the Platform Team's ADR in the CRT landing-zone repository; not a Tapline ADR, because it is a CRT-wide standard.

## 2. Module Structure

\`\`\`text
tapline-infra/
├── modules/                       CRT wrappers around AVM modules
│   ├── network/
│   │   ├── spoke-vnet/            VNet, subnets, NSGs, UDRs, peering to hub
│   │   ├── private-endpoint/      PE + private DNS zone group
│   │   └── firewall-policy/       Rule collection groups per spoke (F1–F14)
│   ├── compute/
│   │   ├── aks-cluster/           AKS with CNI Overlay, Istio add-on, Flux, KEDA, workload identity
│   │   └── apim/                  API Management (internal VNet mode)
│   ├── data/
│   │   ├── sql-database/          Server, database, failover group, auditing, ledger option
│   │   ├── eventhubs-premium/     Namespace, hubs, consumer groups, geo-replication, Capture
│   │   ├── storage/               ADLS/Blob with immutability policies and lifecycle rules
│   │   └── redis/
│   ├── security/
│   │   ├── key-vault/
│   │   └── managed-hsm/           (CDE only; HSM key ceremony is manual, see §5)
│   ├── edge/
│   │   └── front-door/            Profile, endpoints, WAF policy, Private Link origins
│   └── observability/
│       └── monitoring/            Log Analytics, App Insights, Managed Prometheus, Grafana, alerts
├── stacks/                        One deployment stack per scope
│   ├── shared-global/             Front Door, public DNS
│   ├── region-network/            Spokes for a region (hub is owned by the CRT landing zone)
│   ├── main-zone/                 Main zone resources for an environment and region
│   ├── cde-zone/                  Card-data zone resources (separate subscription)
│   └── monitoring/
├── environments/
│   ├── dev.bicepparam
│   ├── test.bicepparam
│   ├── hwlab.bicepparam
│   ├── perf.bicepparam
│   ├── staging-eus2.bicepparam  staging-cus.bicepparam
│   └── prod-eus2.bicepparam     prod-cus.bicepparam
├── policy/                        Tapline-specific Azure Policy assignments (deny public IPs, require PE, tags)
└── .github/workflows/             validate.yml, deploy.yml, drift.yml
\`\`\`

| Module | Purpose | Owner |
|---|---|---|
| \`network/*\` | Spokes, subnets, NSGs, routes, private endpoints, firewall rule collections | Kofi Mensah (Platform) |
| \`compute/aks-cluster\` | Both AKS clusters, add-ons, node pools, workload identity | Platform Team |
| \`compute/apim\` | API gateway and its policies (rate limits, JWT validation) | Platform Team, with Rider Team for API policies |
| \`data/sql-database\` | All Azure SQL databases, including ledger-table and failover-group settings | Platform Team; Money Team reviews Ledger DB changes |
| \`data/eventhubs-premium\` | Streams, partitions, consumer groups, Capture to ADLS, geo-replication | Platform Team; Journey Team reviews partition changes |
| \`data/storage\` | Archives (immutable), deny-list files, documents (lifecycle delete) | Platform Team |
| \`security/*\` | Key Vaults, Managed HSM | Platform Team; changes approved by the CISO |
| \`edge/front-door\` | Public endpoints and WAF | Platform Team; CISO approves WAF exclusions |
| \`observability/monitoring\` | Workspaces, dashboards, alert rules from SLOs | Sam Ortega (SRE) |
| \`stacks/cde-zone\` | Everything in PCI scope | Platform Team. **Every change needs CISO approval** (CODEOWNERS). |

**Ownership is enforced by CODEOWNERS.** A pull request touching \`stacks/cde-zone/\`, \`security/\` or \`firewall-policy/\` can't merge without approval from the CISO's delegate.

## 3. State Management
- **Backend:** Bicep keeps no state file. **Azure Resource Manager is the state.** Deployment Stacks track which resources each stack manages, so a resource removed from code is deleted (or detached, for databases and archives; see below) on the next deployment.
- **Protecting data resources:** stacks for data resources use \`actionOnUnmanage: detach\`, not \`delete\`, so deleting a database from code never deletes the data. Removing a data resource is a separate, manual, two-person change.
- **Drift:**
  - **Deny settings** (\`denyWriteAndDelete\`) on production stacks block portal or CLI changes, even by subscription owners. The only exceptions are the pipeline's identity and the break-glass group.
  - A **nightly \`drift.yml\`** workflow runs \`what-if\` against every environment and raises an issue for any difference.
- **Access control:**
  - Pipelines authenticate to Azure with **OIDC workload identity federation**. There are no stored credentials; each GitHub environment maps to a separate managed identity with rights only to its own subscriptions.
  - Humans have **Reader** in production. Elevation to Contributor goes through Entra Privileged Identity Management: just-in-time, maximum 4 hours, approval by the SRE Lead, and logged.
  - **Break-glass:** two emergency accounts, credentials sealed with the CISO, used only during a declared incident. Their use is reviewed afterwards.

## 4. Promotion Process

Infrastructure and application changes follow the same path, with different gates:

\`\`\`mermaid
flowchart LR
    pr["Pull request"] --> val["validate.yml<br/>bicep build · PSRule ·<br/>what-if on dev and prod"]
    val --> rev["Review<br/>(CODEOWNERS)"]
    rev --> merge["Merge to main"]
    merge --> dev["Deploy dev<br/>(automatic)"]
    dev --> test["Deploy test<br/>(automatic, then nightly suite)"]
    test --> hw["Deploy hardware lab<br/>(automatic)"]
    hw --> stg["Deploy staging<br/>(approval: SRE on-call)"]
    stg --> prod["Deploy production<br/>(approval: change advisory;<br/>change window)"]
\`\`\`

| Step | What happens | Gate |
|---|---|---|
| Pull request | \`bicep build\`, PSRule for Azure (Well-Architected and CRT rules), \`what-if\` against dev **and** production. The production what-if is posted as a PR comment, so reviewers see the real impact. | Two approvals; CODEOWNERS |
| Dev → test → hardware lab | Automatic after merge. Application deployments use the same flow through Flux image updates. | Automated tests green |
| Staging | Deployment stack update | Manual approval by SRE on-call |
| Production | Deployment stack update in East US 2, then Central US | CRT Change Advisory Board for normal changes, or pre-approved "standard change" templates such as scaling and certificate rotation. Change windows as in [Deployment Topology §3.1](deployment-topology.md). |

- **Application promotion** is a pull request to \`tapline-platform/deploy/overlays/<env>\` that bumps image tags. Flux reconciles it. Images are signed (Notation) and AKS admission policy rejects unsigned images.
- **Rollback:**
  - Infrastructure: re-run the previous commit's stack deployment.
  - Applications: revert the overlay commit.
  - Database schema: never rolled back. Expand-and-contract makes forward fixes safe.

## 5. Secrets Management
- **No secrets in any repository.** Gitleaks runs in CI and as a pre-commit hook, and GitHub secret scanning with push protection is on.
- **Workloads authenticate with managed identities** (AKS workload identity) to Azure SQL, Event Hubs, Storage, Key Vault and Redis. There are no connection strings with passwords.
- **Third-party credentials** (DHS API key, CornerPay HMAC secret, Vantor client secret) live in **Key Vault**. Northgate's client certificate and webhook HMAC key live in the **card-data zone Key Vault**. Workloads read them through the Secrets Store CSI driver, with rotation alerts 30 days before expiry.
- **Signing keys** (taps verification CA, deny-list signing, ledger digest signing) live in **Managed HSM** and never leave it. The HSM security domain is created in a **manual key ceremony**: three of five custodians, witnessed, recorded. It is deliberately not automated in IaC.
- **Device certificates** for validators are issued by CRT's device CA (rooted in Managed HSM) during provisioning in the hardware lab. Vantor never handles CRT private keys.
- Full design: [Security Architecture](../05-security/security-architecture.md).
`;export{e as default};
