---
title: Network Architecture
summary: "Network architecture template: network zones and trust boundaries, allowed traffic between them, connectivity, load balancing, DNS and firewall rules."
about: "Start from trust boundaries: public internet, DMZ, application tier, data tier, and exactly what may cross each one. A zone table with allowed inbound and outbound traffic is easier to review than a firewall rule dump, and gives the security architecture and threat model a shared picture."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - network_architecture
---
# Network Architecture — {Project Name}

> Guidance: Show trust boundaries — public internet, DMZ, private
> subnets, data tier — and what's allowed to cross them.

## 1. Overview
<!-- DIAGRAM: network topology / VPC/VNet zone diagram -->

## 2. Network Zones
| Zone | Contents / Purpose | Inbound Allowed From | Outbound Allowed To |
|---|---|---|---|
| Public | | Internet (443 only) | |
| App tier / Private | | Public zone | Data tier |
| Data tier | | App tier only | None |

## 3. Connectivity
VPN, peering, VPC/VNet design, subnetting.

## 4. Load Balancing & Traffic Management

## 5. DNS Strategy

## 6. Firewall / Security Group Rules Summary

## 7. Ingress/Egress Rules
