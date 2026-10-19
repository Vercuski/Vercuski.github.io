const e=`---
title: "Runbook: Deny-List Distribution Stalled"
status: approved
owner: Diego Alvarez (Edge Team lead)
version: 1.1.0
last_updated: 2027-02-10
reviewers:
  - Sam Ortega (SRE Lead) — v1.0 author, 2026-08-28
  - Tom Whitaker (CISO) — approved §6.4 (manual publish) 2026-08-28
  - Edge on-call engineers — v1.1 updated after the hardware-lab drill of 2027-02-03
tags:
  - runbook_template
---
# Runbook — Deny-List Distribution Stalled

> [!warning] Why this matters
> While deny-list distribution is stalled, **blocked and debt-laden cards keep working** on validators (threat T-06, residual risk R-2). Boarding is never affected. The cost is revenue and blocked-card risk, which grows the longer it lasts, so this is Sev2: act within 15 minutes, any time of day.

**Change history:** v1.0 (2026-08-28) written from the design. v1.1 (2027-02-10) added cause 7 (Front Door caching the manifest) found in the hardware-lab drill, the \`tapline-ops\` commands, and the 2-hour escalation to the CRO.

## 1. When to Use This Runbook
Any of these alerts (see [Observability Strategy §6](observability-strategy.md)):
- **\`DenyListPublishStalled\`:** published version has not advanced for 20 minutes while changes are pending.
- **\`DenyListFreshnessLow\`:** fewer than 95% of online validators are within 15 minutes of the latest version, for 15 minutes.
- **\`DenyListSignatureRejected\`:** validators reporting fault code \`DL-SIG\` (signature rejected) above 10 devices.

## 2. Symptoms
- The *Edge / Deny List* dashboard shows the *published version* line flat, or the *validators behind* count rising.
- Customer service reports riders whose blocked cards still work, or riders who paid a debt but are still denied (removals not arriving).
- Validators report \`DL-SIG\` or \`DL-GAP\` (version gap) faults in heartbeats.

## 3. Likely Causes
| # | Cause | Typical sign |
|---|---|---|
| 1 | Deny List Service pods crashed, stuck, or lost their leader lease | No \`deny-list-published\` events; pod restarts or no leader |
| 2 | \`domain-events\` consumer lag: changes not reaching the service | Lag on consumer group \`denylist\` |
| 3 | Managed HSM signing failures (throttling, permission, key disabled) | \`HsmSignFailed\` errors in service logs |
| 4 | Blob write failure (permissions, private endpoint, storage outage) | \`BlobWriteFailed\`; manifest timestamp old |
| 5 | Validators rejecting signatures after a signing-key rotation | Many \`DL-SIG\` faults; started at a rotation |
| 6 | Field path to \`edge-files\` blocked (DC firewall rule F2 changed) | Version published but *all* field validators behind; Azure-side looks healthy |
| 7 | Front Door serving a cached manifest (caching rule changed) | Manifest in Blob is new; \`curl\` via Front Door returns the old version |

## 4. Prerequisites
- **Access needed:**
  - PIM role **Tapline Edge Operator** (production, main zone) for the AKS \`fleet\` namespace, Blob read and Front Door purge.
  - **Tapline Deny-List Publisher** (two-person, needs approval) only for §6.4.
- **Tools needed:**
  - \`kubectl\` (cluster \`aks-tapline-main-eus2\`)
  - \`az\` CLI
  - \`tapline-ops\` CLI ≥ 2.3
  - Grafana dashboard *Edge / Deny List*
  - Access to the Device Management console

## 5. Diagnosis Steps
1. **Confirm and scope.** Open *Edge / Deny List*. Is the *published version* flat (causes 1–4), or published but not reaching validators (causes 5–7)?
2. **Check the service:**
   \`\`\`bash
   kubectl -n fleet get pods -l app=deny-list-service
   kubectl -n fleet logs -l app=deny-list-service --since=30m | grep -E "Error|HsmSign|BlobWrite|Lease"
   tapline-ops denylist status          # published version, pending changes, leader, last error
   \`\`\`
3. **Check consumer lag** (cause 2):
   \`\`\`bash
   tapline-ops streams lag --hub domain-events --group denylist
   \`\`\`
4. **Check the published files** (causes 4 and 7):
   \`\`\`bash
   tapline-ops denylist manifest --source blob    # what Blob holds
   tapline-ops denylist manifest --source edge    # what Front Door serves
   \`\`\`
   If the versions differ → cause 7.
5. **Check validator faults** (cause 5): in Device Management, filter heartbeats by fault \`DL-SIG\` / \`DL-GAP\` over the last hour. Did a key rotation run (check the *Key rotations* annotation on the dashboard)?
6. **Check the field path** (cause 6). From the hardware-lab validator (ring 0), or with CRT Network Operations from the DC jump host:
   \`\`\`bash
   curl -sI https://edge-files.crt-transit.example/denylist/manifest.json
   \`\`\`
   If it fails from the DC but works from Azure, call CRT Network Operations (§9).

## 6. Resolution Steps

### 6.1 Service crashed or stuck (cause 1)
1. Restart the deployment: \`kubectl -n fleet rollout restart deploy/deny-list-service\`.
2. Watch \`tapline-ops denylist status\` until a new version publishes (normally within 5 minutes; the service catches up with all pending changes in one delta).
3. If the leader lease is held by a dead pod: \`tapline-ops denylist lease release\` (safe; another pod takes over).

### 6.2 Consumer lag (cause 2)
1. If lag is growing, scale: \`kubectl -n fleet scale deploy/deny-list-service --replicas=4\` (only the leader publishes; the others help consume).
2. Look for parked messages: \`tapline-ops streams parked --group denylist\`. Follow *Parked messages: triage and replay*.

### 6.3 HSM or Blob failures (causes 3 and 4)
1. **HSM:** check Azure Service Health for Managed HSM, then the HSM key status (\`az keyvault key show --hsm-name hsm-tapline-main-eus2 --name denylist-signing\`). If the key is disabled or permissions changed, **stop and escalate to the CISO**. Don't re-enable keys yourself.
2. **Blob:** check the storage account's private endpoint and role assignments. If it is an Azure storage incident, wait for recovery. Validators keep their last list; consider §6.4 if the outage exceeds 1 hour and changes are urgent (e.g. a stolen-card wave).

### 6.4 Emergency manual publish (two-person, CISO pre-approved)
Use only if the service can't publish for more than 1 hour and there are urgent additions (stolen or compromised media).
1. Request the *Tapline Deny-List Publisher* role in PIM. A second engineer (or the Edge lead) approves.
2. Run \`tapline-ops denylist publish-full --reason "<incident id>"\`. It builds the full list from the Account and Payments databases, signs it in the HSM and writes full list + manifest. It refuses to run without the second approval token.
3. Validators download the full list on their next poll. Expect 5–10 minutes.

### 6.5 Validators rejecting signatures (cause 5)
1. Check the manifest's \`signingKeyId\` against the key IDs validators trust (Device Management → *Trust store* report).
2. If a rotation published with a key the fleet doesn't trust yet: **roll back the signing key** with \`tapline-ops denylist signing-key use --previous\`, then publish a full list (§6.4 not needed; the service publishes normally).
3. Raise a Sev3 for the rotation procedure. The new key's public part must reach the fleet's trust store at least 7 days before use.

### 6.6 Field path blocked (cause 6)
1. Escalate to CRT Network Operations with the failing \`curl\` output. Rule F2 must allow \`edge-files.crt-transit.example:443\` from the APN, station and terminal ranges.
2. Nothing to do on the Azure side.

### 6.7 Front Door serving a stale manifest (cause 7)
1. Purge the manifest path:
   \`\`\`bash
   az afd endpoint purge -g rg-tapline-edge-prod --profile-name afd-tapline \\
     --endpoint-name edge-files --content-paths "/denylist/manifest.json"
   \`\`\`
2. Check the Front Door rule set \`edge-files-rules\`: the manifest must have \`Cache-Control: no-cache\` and caching disabled. Deltas and full lists are immutable and may be cached. If the rule set was changed, revert it through \`tapline-infra\` (no portal changes, per IaC Notes) and raise a Sev3.

## 7. Verification
- \`tapline-ops denylist status\` shows the published version advancing and **pending changes = 0**.
- *Edge / Deny List* dashboard:
  - Freshness SLI back above 99% within 15–20 minutes. Validators poll every 5 minutes with jitter; offline vehicles catch up when they reconnect.
  - \`DL-SIG\` / \`DL-GAP\` faults back to baseline (< 5).
- Spot check (in production, don't block a test medium): pick a medium blocked during the incident (\`tapline-ops denylist pending --since <start>\`) and confirm, in Device Management, that a sample of 10 online validators report a deny-list version that includes it.

## 8. Rollback
- **Restart or scale (6.1, 6.2):** no rollback needed.
- **Signing-key rollback (6.5):** reversible. Move forward to the new key once the trust store has propagated.
- **Manual full publish (6.4):** if the manual list was wrong (e.g. built from a lagging replica), publish again from the service once healthy. Validators always take the newest valid version.
- **Never** delete a published delta or manifest. The version chain must stay intact. To undo an entry, publish a newer delta that removes it.

## 9. Escalation
| Condition | Escalate To | Contact Method |
|---|---|---|
| Not resolved within 30 minutes | Edge Team lead (Diego Alvarez) | PagerDuty escalation policy *Edge* (level 2) |
| HSM key disabled, permissions changed, or signature anomaly not explained by a rotation | CISO (Tom Whitaker); treat as a possible security incident | PagerDuty *Security*, plus phone |
| Field path blocked | CRT Network Operations | NOC phone line (24/7); ticket in ServiceNow, *Network – Tapline* |
| Validators rejecting valid, correctly signed files | Vantor Technical Support (P1) | Vantor support portal + P1 phone, citing ICD-002 |
| Stalled more than 2 hours | Chief Revenue Officer (Miguel Serrano) informed, for revenue-risk awareness | Incident commander notifies by phone |

## 10. Related
- Dashboard: \`grafana/d/edge-denylist\`
- Alert definition: \`tapline-infra/modules/observability/monitoring/alerts/edge-denylist.bicep\`
- Flow: [Sequence Diagrams §4](../02-core-architecture/sequence-diagrams.md); decision: [ADR-0004](../06-decisions-and-standards/adr/0004-offline-first-validators-with-signed-deny-lists.md)
- Related incidents: none in production as of v1.1. Hardware-lab drill 2027-02-03 (cause 7 found).
- *Runbook index:* the full list of Tapline runbooks is in the Observability Strategy §6 alert table.
`;export{e as default};
