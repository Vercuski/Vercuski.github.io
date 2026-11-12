const e=`---
title: Disaster Recovery & Business Continuity Plan
summary: "Disaster recovery and business continuity plan template: RTO and RPO targets, disaster scenarios, backups, recovery procedures, roles and communication."
about: "Write a recovery procedure for each scenario you plan for, such as a region outage, data corruption or ransomware, rather than one generic plan. Then test it: a DR plan that has never been tested is a hypothesis, not a plan."
status: draft
owner: TBD
version: 1.0.0
last_updated: TBD
reviewers: TBD
tags:
  - disaster_recovery
---
# Disaster Recovery Plan — {Project Name}

## 1. Objectives
| Metric | Target |
|---|---|
| RTO (Recovery Time Objective) | |
| RPO (Recovery Point Objective) | |

## 2. Disaster Scenarios Covered
| Scenario | Likelihood | Response Summary | Plan Reference |
|---|---|---|---|
| Region outage | | | Below |
| Data corruption | | | Below |
| Ransomware / security incident | | | Below |

## 3. Backup Strategy
- What's backed up: TBD
- Frequency: TBD
- Retention: TBD
- Storage location (must differ from primary): TBD
- Encryption: TBD

## 4. Recovery Procedures

### 4.1 Scenario: Region Outage
1. TBD (failover trigger — automatic or manual?)
2. TBD
3. TBD

### 4.2 Scenario: Data Corruption
1. TBD

### 4.3 Scenario: Ransomware / Security Incident
1. TBD

## 5. Roles & Responsibilities During an Incident
| Role | Responsibility |
|---|---|
| | |

## 6. Testing Schedule
> Guidance: A DR plan that's never been tested is a hypothesis, not a
> plan.

- Last tested: TBD
- Next scheduled test: TBD
- Test type: tabletop / partial failover / full failover

## 7. Communication Plan
| Audience | Channel | Owner |
|---|---|---|
| Internal eng | TBD | TBD |
| Customers | TBD | TBD |
| Leadership | TBD | TBD |
`;export{e as default};
