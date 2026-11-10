---
title: AWS Certified CloudOps Engineer – Associate (SOA-C03)
permalink: /study/examAssociateCloudOps
tag:
  - AWS Certified CloudOps Engineer Associate
  - SOA-C03
  - Amazon CloudWatch
  - AWS Systems Manager
  - AWS CloudFormation
  - AWS Backup
  - cloud operations
---

# AWS Certified CloudOps Engineer – Associate (SOA-C03)

Learn **symptom → evidence → control → verified result**. Follow a two-AZ workload, compare the closest alternatives, then practise the deciding constraint. Cards contain service features, small examples and AWS references.

**Checked: {{ site.data.cloudops_study.followupChecked }}.** Scope follows the [SOA-C03 guide]({{ site.data.cloudops_study.guide }}) and [revisions]({{ site.data.cloudops_study.revision }}). Exercises are local simulations; no AWS account is needed.

[Operating model](#soa-theory) · [Deciding constraint](#soa-decision-method) · [Service cards](#soa-services) · [Six labs](#soa-labs) · [Practice](#soa-practice-section) · [Coverage](#soa-coverage) · [Architecture explorer](#soa-exam-architecture)

<link rel="stylesheet" href="{{ '/assets/aip-study-flow.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/aws-ai-service-map.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/dva-study.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/dva-architecture-explorer.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/cloudops-study.css' | relative_url }}">
<div class="dva-study soa-study" id="soa-study" markdown="1">

## 1. Understand the operating environment {#soa-theory}

**Provision → operate → observe → investigate → remediate → recover.** Select a responsibility, then reveal the AWS services. Workload traffic, changes and evidence are separate flows.

{% include cloudops-theory-map.html %}

## 2. Read the deciding constraint {#soa-decision-method}

Name **the affected scope, operation, failure and evidence** before changing anything. A timeout, AccessDenied and stale data need different investigations.

| Distinction | Deciding clue | Start with |
|---|---|---|
| Metrics / logs / traces | Trend / event detail / one slow request | Dimensions and statistic / matching log / downstream spans. |
| Audit / configuration history | Who changed it / what settings existed | CloudTrail / Config timeline. |
| Availability / capacity / performance | Keep serving / handle more / finish faster | Healthy targets / scaling activity / first saturated dependency. |
| Backup / replication / failover | Historical undo / another copy / service continuity | Recovery point / replication lag / failover evidence. |
| RTO / RPO | Maximum outage / tolerable data loss | Measured recovery time / usable recovery timestamp. |
| Identity / permissions / network | Who / allowed action / reachable path | Trust and policies / SG, NACL, routes and DNS. |

Restore service first; prevent recurrence next. **API success is not proof of application recovery.**

## 3. Connect theory to services {#soa-services}

Use the decision tables, then open a card for features and an example. Optional exercises expand in place; examples are excerpts with illustrative identifiers.

<span id="soa-labs"></span>
**Local exercises:** [Alarm evaluation](#soa-lab-alarm) · [Failure capacity](#soa-lab-capacity) · [RTO/RPO](#soa-lab-recovery) · [Stack recovery](#soa-lab-stack) · [Encrypted access](#soa-lab-access) · [Network path](#soa-lab-network).

### 3.1 Monitoring & performance — 22% {#soa-monitoring}

Signal → correlated evidence → bounded repair → measured outcome

| When the requirement is… | Start with… | Deciding boundary |
|---|---|---|
| Trend / threshold | CloudWatch metrics + alarm | Check dimensions, statistic, period and missing data. |
| Individual slow request | Logs + trace | Correlate the actual dependency; sampling may hide a trace. |
| API change / resource history | CloudTrail / Config | Actor and configuration are different evidence. |
| Sustained performance limit | Compute, EBS, storage or DB metrics | Fix the first saturated dependency; measure before resizing. |

{% include cloudops-service-zone.html id='monitoring' %}

#### Implementation notes

Collect before investigating. Cross-account observability needs regional source links; a dashboard alone does not establish them. Verify notification delivery and the repaired workload.

{% include cloudops-lab.html id='alarm' %}

### 3.2 Reliability & recovery — 22% {#soa-reliability}

Healthy capacity → failure isolation → protected history → tested recovery

| When the requirement is… | Start with… | Deciding boundary |
|---|---|---|
| Traffic growth | Scaling + a proportional metric | More instances cannot fix a saturated shared database by themselves. |
| Host/AZ failure | Healthy targets + Multi-AZ dependencies | Measure surviving capacity, not only instance count. |
| Logical deletion | Version / snapshot / PITR restore | A healthy replica may contain the same deletion. |
| Regional disaster | Approved DR runbook | Choose by tested RTO, RPO, cost and dependency readiness. |

{% include cloudops-service-zone.html id='reliability' %}

#### Implementation notes

Test the restored data and application. Include permissions, networking, reconnection and endpoint cutover in the recovery clock; a replica can contain the same logical deletion.

{% include cloudops-lab.html id='capacity' %}

{% include cloudops-lab.html id='recovery' %}

### 3.3 Deployment & automation — 22% {#soa-deployment}

Versioned definition → reviewed change → rollout → health gate → rollback / reconcile

| When the requirement is… | Start with… | Deciding boundary |
|---|---|---|
| Preview infrastructure impact | Change set / CDK diff | Preview does not execute or guarantee success. |
| Rollback itself failed | Repair prerequisite + continue rollback | Reconcile skipped resources before the next update. |
| Maintain existing nodes | Systems Manager | Agent, identity and outbound connectivity are prerequisites. |
| Many accounts / Regions | StackSets, RAM and trusted roles | Deploying copies differs from sharing an existing resource. |

{% include cloudops-service-zone.html id='deployment' %}

#### Implementation notes

Pin versions, test a small target, limit rollout concurrency and retain rollback inputs. Verify the workload after the stack or runbook finishes.

{% include cloudops-lab.html id='stack' %}

### 3.4 Security & compliance — 16% {#soa-security}

Known principal → trusted session → permitted operation → protected data → compliance evidence

| When the requirement is… | Start with… | Deciding boundary |
|---|---|---|
| Cannot assume role | Caller policy + target trust | Trust is not the role’s downstream permission policy. |
| Encrypted read denied | Data access + KMS key access | Key state/context/policy still apply. |
| Unapproved configuration | Config evaluation + safe remediation | An aggregator alone neither records nor repairs. |
| Finding needs action | Match finding source to control | Patch, restrict or investigate; verify the actual outcome. |

{% include cloudops-service-zone.html id='security' %}

#### Implementation notes

Check the principal, trust, action/resource policy and any restricting controls separately. Keep secrets out of investigation logs.

{% include cloudops-lab.html id='access' %}

### 3.5 Networking & delivery — 18% {#soa-networking}

Name → route → filter → listener → target → return path

| When the requirement is… | Start with… | Deciding boundary |
|---|---|---|
| Name fails; IP succeeds | DNS / Resolver / delegation | Changing SG rules does not repair a wrong DNS answer. |
| Timeout on a reachable name | Routes + SG/NACL + listener | Check response path and ephemeral ports too. |
| Private AWS API access | Gateway or interface endpoint | Endpoint policy limits access; it does not grant IAM permissions. |
| Wrong cached response | CloudFront behaviour / cache key | Lower TTL cannot correct a missing variation dimension. |

{% include cloudops-service-zone.html id='networking' %}

#### Implementation notes

Trace the actual source, destination and return path. Compare NAT, endpoint and cross-AZ costs. A modelled reachable path still needs a real application test.

{% include cloudops-lab.html id='network' %}

## 4. Practise the boundary {#soa-practice-section}

**{{ site.data.cloudops_study.practice.size }} original questions.** Answer once, identify the deciding clue and reject the closest alternative. Multiple-answer questions state the required count; focused follow-ups do not predict exam frequency.

{% include cloudops-practice.html %}

## 5. Exam scope and next topics {#soa-coverage}

SOA-C03 tests operating, configuring, investigating and recovering **existing workloads**. The five domain weights appear above. [Official scope]({{ site.data.cloudops_study.guide }}) checked **{{ site.data.cloudops_study.checked }}**; follow-up notes checked **{{ site.data.cloudops_study.followupChecked }}**.

<details class="soa-optional" markdown="1">
<summary>Task-by-task coverage & next exercises · 13 official tasks</summary>

The June 2026 revisions include AI workload monitoring, Kiro, DevOps Agent, S3 Files, conformance packs and Security Agent (now documented under AWS Continuum). These receive introductory coverage; the table identifies deeper practice.

<div class="dva-table-wrap" tabindex="0" role="region" aria-label="All official SOA-C03 task statements mapped to lessons and practice" markdown="0">
<table><thead><tr><th>Official task</th><th>Lesson / references</th><th>Practice depth</th><th>Next hands-on step</th></tr></thead><tbody>
{% for task in site.data.cloudops_study.tasks %}<tr><td><a href="{{ task.url }}">{{ task.id }} · {{ task.title | escape }}</a></td><td><a href="#soa-{{ task.domain }}">Domain lesson</a><br>{% for key in task.cards %}<a href="#soa-service-{{ key }}">{{ site.data.cloudops_study.cards[key].name | escape }}</a>{% unless forloop.last %} · {% endunless %}{% endfor %}</td><td>{{ task.depth }}<br>{% for lab in task.labs %}<a href="#soa-lab-{{ lab }}">{{ lab }} lab</a> · {% endfor %}{% for q in task.questions %}<a href="#soa-question-{{ q }}">{{ q }}</a>{% unless forloop.last %} · {% endunless %}{% endfor %}</td><td>{{ task.next | escape }}</td></tr>{% endfor %}
</tbody></table></div>

**Scope boundary.** Operate supplied designs and controls. Designing new distributed/hybrid architectures or CI/CD platforms, software development, governance definition and billing administration are outside the stated role. Operating scaling and optimising existing workloads remain in scope.

**Next practice.** EKS, Terraform, FSx variants, hybrid connectivity, AI tooling and specialised network protection need hands-on follow-up. Use the [in-scope services](https://docs.aws.amazon.com/aws-certification/latest/sysops-administrator-associate-03/soa-03-in-scope-services.html) with task skills and [out-of-scope guidance](https://docs.aws.amazon.com/aws-certification/latest/sysops-administrator-associate-03/soa-03-out-of-scope-services.html).

</details>

### Explore the architecture {#soa-exam-architecture}

**{{ site.data.cloudops_architecture.scenarios.size }} flows · six comparisons.** Search a service or feature to narrow the scenarios. Select a flow, then run or inspect its steps. Icons open the same service references.

{% include cloudops-architecture-explorer.html %}

### Service reference library {#soa-reference-library}

{% include cloudops-reference.html %}

</div>
<script id="soa-study-data" type="application/json">{{ site.data.cloudops_study | jsonify }}</script>
<script src="{{ '/assets/cloudops-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/cloudops-study.js' | relative_url }}" defer></script>
<script src="{{ '/assets/dva-architecture-explorer.js' | relative_url }}" defer></script>
