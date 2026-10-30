---
title: AWS Developer Associate (DVA-C02)
permalink: /study/examAssociateDeveloper
tag:
  - AWS Certified Developer Associate
  - DVA-C02
  - AWS Lambda
  - Amazon API Gateway
  - AWS CloudFormation
  - Amazon DynamoDB
  - Amazon Cognito
  - application development
---

# AWS Certified Developer Associate (DVA-C02)

Learn the responsibility first, then choose the AWS feature that satisfies it. This guide connects **theory → service decisions → payloads → practice**. Service tiles open one reference containing its role, key features, comparison, example and AWS links.

**Checked: {{ site.data.dva_study.checked }}.** The [official DVA-C02 guide](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html) defines exam scope. Use [the study roadmap](#coverage) to plan your next topics.

<link rel="stylesheet" href="{{ '/assets/aip-study-flow.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/aws-ai-service-map.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/dva-study.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/dva-architecture-explorer.css' | relative_url }}">
<div class="dva-study" id="dva-study" markdown="1">

## 1. Understand the application {#theory}

Trace three connected flows: **developer delivery → deployed application → user requests and background work**. Provisioning creates resources and permissions; release promotion changes which version receives traffic. Production evidence guides recovery and the next change. Select a box to study its responsibility, or trace a situation across lanes.

{% include dva-theory-map.html %}

## 2. Read the deciding constraint {#decision-method}

Before choosing a service, name **the principal, operation, state, failure mode and evidence**. Then explain why the closest alternative fails.

| Theory | Ask in the scenario | Typical boundary |
|---|---|---|
| Availability vs capacity | Must some requests succeed, or must the full baseline keep serving? | Rolling can preserve availability while reducing capacity. |
| Immutable vs mutable | Are old instances changed, or does a new fleet/version coexist? | A replacement fleet and an additional batch have different isolation/cost. |
| Authentication vs authorization | Is this identity trusted, and may it perform this action on this data? | JWT validation, AWS IAM access and record entitlement are separate checks. |
| State vs acceleration | Is this the authoritative value, a replica or a cached copy? | Replication lag and cache staleness affect correctness. |
| Delivery vs completion | Was work accepted, processed, committed and acknowledged? | A retry can repeat a side effect; use idempotency and recorded outcomes. |
| Signal vs evidence | Do you need a trend, one request, a slow stage or an administrative change? | Metrics, access logs, traces and CloudTrail answer different questions. |

Use **least overhead** only after hard constraints are met. Prefer supported capabilities; measure the actual bottleneck before adding capacity or changing platforms.

## 3. Connect theory to services {#services}

The chooser rules stay visible. Open a tile for details and a sample contract. Examples are deliberately small; configuration excerpts and pseudocode are labelled where they omit deployment context.

### 3.1 Release & infrastructure {#delivery-services}

Source → template → artifact/version → test → traffic shift → rollback

**Define the application, then run it.** SAM and CDK describe infrastructure; their deployed resources do the work. CDK can define serverless applications, and SAM can include ordinary CloudFormation resources.

| Responsibility | Service/tool | Deciding difference |
|---|---|---|
| Define serverless infrastructure | [SAM](#dva-service-sam) | YAML shorthand + transform + local development tools |
| Define infrastructure in code | [CDK](#dva-service-cdk) | Programming-language constructs → CloudFormation |
| Provision the declared stack | [CloudFormation](#dva-service-cfn) | Creates/updates the actual AWS resources |
| Execute functions | [Lambda](#dva-service-lambda) | Managed function execution |
| Run a virtual machine | [EC2](#dva-service-ec2) | OS/instance control |
| Orchestrate containers | [ECS](#dva-service-containers) | Schedules tasks/services on chosen capacity |
| Supply managed container compute | [Fargate](#dva-service-fargate) | Runs supported containers without managing EC2 hosts |

{% include dva-service-zone.html id='delivery' %}

#### Implementation notes {#delivery-notes}

CodePipeline coordinates delivery; CodeBuild builds/tests; CloudFormation/CDK/SAM manage declared resources; CodeDeploy or platform-native deployment promotes the application revision. These can cooperate. AppConfig rolls out runtime configuration separately. Keep the database lifecycle independent of a disposable environment and retain a compatible rollback target.

{% include dva-deployment-lab.html %}

### 3.2 Request & compute {#runtime-services}

Client → front door → healthy execution → data → response

{% include dva-service-zone.html id='runtime' %}

#### Implementation notes {#runtime-notes}

Use a separate REST API stage for incompatible testing; stage variables supply environment configuration. Apply a canary when testing a percentage of live production traffic. Choose REST when its usage plans, managed cache or VTL body templates are required. Use scoped cache keys and verify [REST vs HTTP support](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html).

For compute, distinguish **routing, provisioning, scaling and storage**. Lambda layers package dependencies; memory affects conventional function CPU. An ASG adds EC2 instances; ALB sends requests to healthy targets. EFS keeps supported container tasks on shared persistent files, while task-local storage is disposable.

### 3.3 State & data access {#data-services}

Access pattern → key/index or SQL endpoint → consistency → cache/lifetime

{% include dva-service-zone.html id='data' %}

#### Implementation notes {#data-notes}

For the game catalogue, `GameName + Version` identifies a version; `GameName` queries versions; `Category + GameName` on a GSI lists by category. Project the fields that the index must return. A GSI is eventually consistent. TTL removes expired items asynchronously; enforce application expiry even while an item still exists.

Route read-heavy SQL to a read replica when lag is acceptable. A traditional Multi-AZ standby supports failover; a Multi-AZ **DB cluster** can also serve reads. Cache-aside adds a separate lookup and invalidation path; it does not replace the relational endpoint.

### 3.4 Asynchronous work {#async-services}

Producer → queue/stream → worker → durable result → acknowledgement

{% include dva-service-zone.html id='async' %}

#### Implementation notes {#async-notes}

On SQS, finish and record the outcome before deleting the message. Set visibility for processing time and extend it when appropriate; visibility does not remove the need for idempotency. Use an atomic conditional claim and recoverable result/status rather than read-before-write. For Kinesis batches, match per-entry results to input records and retry only failures with backoff and jitter.

{% include dva-queue-lab.html %}

### 3.5 Identity, protection & evidence {#security-services}

Identity → trust/token validation → action/data authorization → protected access → evidence

{% include dva-service-zone.html id='security' %}

#### Implementation notes {#security-notes}

Separate the caller of your API from the role your code uses to call AWS. A role trust policy controls who can assume it; permission policies control subsequent actions. Boundaries and SCPs limit applicable permissions without granting them. Security groups and NACLs filter network traffic; encryption protects data. Neither grants application entitlement.

{% include dva-identity-lab.html %}

Store rotating credentials in Secrets Manager and static named configuration in Parameter Store as appropriate. For S3, distinguish resulting default encryption from a policy requiring explicit upload headers: `AES256` means SSE-S3; `aws:kms` means SSE-KMS. For large client-encrypted data, envelope encryption uses a data key protected by a KMS key.

#### Find the right evidence {#operations-notes}

| Investigation | Start with | Then verify |
|---|---|---|
| How much traffic, latency or error rate? | CloudWatch metrics | Time window, dimensions, ALB vs target errors. |
| Which client/path/status/timing? | ALB access logs | Logging enabled, target/path and request correlation. |
| Where did request time go? | Correlated application logs + distributed trace | Downstream instrumentation and matching trace IDs. |
| Who changed an AWS setting? | CloudTrail | Relevant event type/coverage; application requests use their own access logs. |
| Why is a target unhealthy? | Target health reason + configuration | Security groups, NACLs, port, health path and success matcher. |

See the [AWS security/audit comparison](/study/aiAWSServices#security-compliance-map) for Config, Audit Manager, Artifact and findings services.

## 4. Practise the boundary {#practice}

Choose a scenario and answer once. Explain the deciding constraint, reject the nearest alternative and name a change that would reverse your choice.

{% include dva-practice.html %}

## 5. Exam scope and next topics {#coverage}

The exam weights are **Development 32% · Security 26% · Deployment 24% · Troubleshooting and Optimization 18%**. The [official guide](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html) emphasizes implementing, testing, deploying and debugging applications; designing networking or an entire CI/CD platform is outside the stated target role.

**Scope verified {{ site.data.dva_study.examCheck.checked }}:** AWS still lists **DVA-C02**. The current [revision notes]({{ site.data.dva_study.examCheck.revisions }}) include Amazon Q Developer assistance/testing, EventBridge, application-level authorization, structured logging and runtime configuration. Use the [in-scope service list]({{ site.data.dva_study.examCheck.services }}) alongside the four domain descriptions. The map organizes responsibilities; its lanes are not separate exam domains.

| Domain | Covered here | Topics to expand |
|---|---|---|
| [Development — 32%](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02-domain1.html) | API integration, Lambda, stores, queues/streams, routing/workflows, idempotency. | SDK pagination/error handling, Query vs Scan, read consistency, Lambda invocation/error lifecycles, concurrency and hands-on Q Developer-assisted development. |
| [Security — 26%](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02-domain2.html) | Cognito, IAM, encryption, secrets, network filtering. | Cross-account roles/key permissions, TLS/certificates, token scopes, tenant-level authorization, sanitization and sensitive logging. |
| [Deployment — 24%](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02-domain3.html) | Beanstalk, versions/aliases, stages, IaC, CodePipeline/CodeBuild/CodeDeploy and AppConfig boundaries. | Exercise artifact packaging, local/integration tests, hooks, alarms and rollback in an existing delivery workflow. |
| [Troubleshooting — 18%](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02-domain4.html) | Health checks, evidence, CPU tuning, throttling/backlog. | Instrumentation, tracing, custom metrics, log queries, service quotas and concurrency bottlenecks; validate with before/after measurements. |

SAM remains explicit in the [Deployment domain](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02-domain3.html): staging deployments, test events and IaC template updates. The service list is non-exhaustive; a missing name there does not mean the skill is excluded.

### Explore the architecture {#exam-architecture}

Explore scope, placement and communication on one map. The **25 scenarios** and comparison mode connect the same resources; each arrow has an explicit meaning. Use the existing service cards for deeper examples and current AWS references.

{% include dva-architecture-explorer.html %}

{% include dva-service-reference.html %}

</div>
<script id="dva-study-data" type="application/json">{{ site.data.dva_study | jsonify }}</script>
<script src="{{ '/assets/dva-study.js' | relative_url }}" defer></script>
<script src="{{ '/assets/dva-architecture-explorer.js' | relative_url }}" defer></script>
