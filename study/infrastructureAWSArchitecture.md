---
title: AWS Best Practices
permalink: /study/infrastructureAWSArchitecture
---

# AWS Architecture Best Practices {#aws-architecture-best-practices}

Concise, practical notes for designing AWS systems that are reliable, secure, and cost-efficient — aligned with AWS Solutions Architect Professional standards.

---

## 1. Network Architecture {#network-architecture}

### 1.1 Designing a VPC

Think of your VPC as a city — each subnet is a district with its own purpose.

<table class="study-table">
<thead>
<tr>
<th>Subnet Type</th>
<th>Purpose</th>
<th>Example Components</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Public</strong></td>
<td>Internet-facing resources</td>
<td>ALB, NAT Gateway, Bastion Host</td>
</tr>
<tr>
<td><strong>Private</strong></td>
<td>Internal app and API layers</td>
<td>EC2, ECS Tasks</td>
</tr>
<tr>
<td><strong>Database</strong></td>
<td>Isolated storage layer</td>
<td>RDS, Aurora</td>
</tr>
<tr>
<td><strong>Management</strong></td>
<td>Monitoring and admin tools</td>
<td>Prometheus, Grafana</td>
</tr>
</tbody>
</table>

Example layout:

```
/16 VPC (65,536 IPs)
├── /20 public subnets – across 3 AZs
├── /20 private subnets – across 3 AZs
├── /24 database subnets – across 3 AZs
└── /24 management subnets – across 3 AZs
```


**Design tips:**
- Use at least **two AZs** (three preferred).  
- Keep cross-AZ traffic low (reduces latency and cost).  
- Use **NAT Gateways** for private subnet outbound access.  
- Use **VPC Endpoints** to reach AWS services privately.

---

### 1.2 Network Security

<table class="study-table">
<thead>
<tr>
<th>Control</th>
<th>Scope</th>
<th>Behavior</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Security Groups</strong></td>
<td>Instance-level</td>
<td>Stateful, only “allow” rules.</td>
</tr>
<tr>
<td><strong>NACLs</strong></td>
<td>Subnet-level</td>
<td>Stateless, supports allow and deny.</td>
</tr>
</tbody>
</table>

Additional practices:
- **Transit Gateway** → central routing for multiple VPCs.  
- **PrivateLink / VPC Endpoints** → avoid exposing services to the internet.  

---

## 2. High Availability (HA) {#high-availability}

### 2.1 Application HA
- **ALB (L7)** → smart routing, SSL termination, sticky sessions.  
- **NLB (L4)** → static IPs, ultra-low latency.  
- **Auto Scaling** → multi-AZ distribution, health checks, rolling updates.  

### 2.2 Database HA
- **RDS Multi-AZ** → synchronous standby and failover.  
- **Read Replicas** → async scaling for reads.  
- **RDS Proxy** → efficient connection pooling.  
- App-level retry and DNS failover logic recommended.  

---

## 3. Redundancy & Disaster Recovery {#redundancy-dr}

### 3.1 Storage Redundancy
- **S3** → cross-region replication.  
- **EBS** → snapshots and lifecycle policies.  
- **EFS** → multi-AZ replication.  
- **RDS** → automated backups (7–35 days).  

### 3.2 DR Strategies

<table class="study-table">
<thead>
<tr>
<th>Strategy</th>
<th>Description</th>
<th>RTO/RPO</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Backup &amp; Restore</strong></td>
<td>Rebuild infrastructure from backups</td>
<td>High</td>
</tr>
<tr>
<td><strong>Pilot Light</strong></td>
<td>Minimal standby infrastructure</td>
<td>Medium</td>
</tr>
<tr>
<td><strong>Warm Standby</strong></td>
<td>Scaled-down live copy</td>
<td>Low</td>
</tr>
<tr>
<td><strong>Multi-site Active</strong></td>
<td>Full duplication across regions</td>
<td>Very Low (highest cost)</td>
</tr>
</tbody>
</table>

---

## 4. Security Architecture {#security-architecture}

### 4.1 Identity & Access
- Use **IAM roles**, not static keys.  
- Enforce **MFA** and least-privilege policies.  
- Use **AssumeRole** for cross-account access.  
- Leverage **service-linked roles** for AWS services.  

### 4.2 Encryption
- **At rest** → S3, EBS, RDS, EFS encryption.  
- **In transit** → TLS 1.2 or higher.  
- **KMS** → centralized key management.  
- **ACM** → automatic certificate management.  

---

## 5. Performance Optimization {#performance-optimization}

- Use **Graviton** instances or right-size with Compute Optimizer.  
- Prefer **GP3** over GP2 for EBS.  
- Apply **S3 lifecycle rules** → move cold data to Glacier.  
- Reduce data transfer costs by staying **in-region** and **private**.  

---

## 6. Cost Optimization {#cost-optimization}

- Continuously right-size using **CloudWatch** + **Compute Optimizer**.  
- Mix **On-Demand**, **Reserved**, and **Spot** instances.  
- Archive cold data with **S3 Glacier**.  
- Set up **Budgets**, **Cost Explorer**, and tagging for governance.  

---

## 7. Monitoring & Observability {#monitoring}

- **CloudWatch** → metrics, alarms, dashboards.  
- **Logs Insights** → query logs across groups.  
- **X-Ray** → distributed tracing.  
- **Synthetics** → proactive canary checks.  

---

## 8. Deployment & Operations {#deployment}

- Define infrastructure as code with **CloudFormation** or **CDK**.  
- Automate pipelines via **CodePipeline**, **CodeBuild**, **CodeDeploy**.  
- Deployment strategies:
  - **Blue/Green** → minimal downtime  
  - **Canary** → gradual rollout  
  - **Rolling** → phased updates  
  - **Immutable** → brand-new instances  

---

## 9. Common Patterns {#common-patterns}

<table class="study-table">
<thead>
<tr>
<th>Pattern</th>
<th>AWS Services</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Microservices</strong></td>
<td>API Gateway + ECS/EKS + SQS/SNS</td>
<td>Async, scalable design</td>
</tr>
<tr>
<td><strong>Serverless</strong></td>
<td>Lambda + API Gateway</td>
<td>Pay per use</td>
</tr>
<tr>
<td><strong>Event-Driven</strong></td>
<td>SQS, SNS, EventBridge</td>
<td>Decoupled services</td>
</tr>
</tbody>
</table>

---

## 10. Design Principles (Rules of Thumb) {#design-principles}

### 10.1 Availability Zones (AZs)

**Nominal AZs** = the number of AZs actively used in your architecture, leaving one **buffer AZ** for fault tolerance.

Formula:
```
Nominal AZs = Total AZs - 1
Instances per AZ = Required Instances ÷ Nominal AZs
```


**Example:**

You’re in a region with **6 AZs** and your app needs **5 EC2 instances**.

```
Nominal AZs = 6 - 1 = 5
Instances per AZ = 5 ÷ 5 = 1 instance per AZ
```


If one AZ fails, your app still runs evenly across 4 remaining AZs — maintaining stability and availability.

---

### 10.2 Subnets per Tier

```
Subnets = (Number of Tiers) × (Number of AZs)
```

**Example:**
```
2 tiers (app + DB) × 3 AZs = 6 subnets
```


---

### 10.3 Tiering Logic

- Traditional → 3-tier (Presentation / Logic / Data).  
- In AWS → be requirements-driven.  
- Private DB subnets → isolate for compliance and security.  
- More subnets = better control, not automatically higher HA.  

---

## 11. Best Practices Summary {#best-practices-summary}

<table class="study-table">
<thead>
<tr>
<th>Principle</th>
<th>Why It Matters</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Design for failure</strong></td>
<td>Expect AZ or instance failure — assume things will break and plan redundancy.</td>
</tr>
<tr>
<td><strong>Implement elasticity</strong></td>
<td>Scale with demand using Auto Scaling and managed services.</td>
</tr>
<tr>
<td><strong>Automate with IaC</strong></td>
<td>Use CloudFormation or CDK to reduce manual errors and enforce consistency.</td>
</tr>
<tr>
<td><strong>Monitor everything</strong></td>
<td>Visibility ensures reliability — track metrics, logs, and alarms proactively.</td>
</tr>
<tr>
<td><strong>Optimize for cost</strong></td>
<td>Efficiency drives sustainability — right-size, schedule, and review usage regularly.</td>
</tr>
</tbody>
</table>

**Common pitfalls:**
- Running only in one AZ → single point of failure.  
- Over-provisioning → wasted cost.  
- Security added late → higher risk.  
- No observability → blind troubleshooting.  
- Tight coupling → poor scalability.  

---


## 12. Migration & Modernization Notes {#migration-modernization}

- **Phases** – Assess → Mobilize → Migrate & Modernize; gather business case, build landing zone, then execute wave plans.
- **6 Rs decision matrix** – Rehost (lift/shift), Replatform (minimal tweaks), Refactor (cloud-native), Repurchase (SaaS), Retire, Retain. Match effort vs benefit.
- **Discovery & planning** – *Application Discovery Service* (ADS) inventories servers/dependencies feeding **Migration Hub** wave plans.
- **Workload movement**:
  - **MGN (Application Migration Service)** – block-level replication for lift/shift; handles cutover tests.
  - **SMS** – incremental replication for on-prem VMware/Hyper-V to EC2.
  - **DMS** – homogeneous/heterogeneous database migrations plus CDC replication.
  - **ECS Anywhere / EKS Anywhere** – run AWS-managed containers on-prem to ease phased migrations.
- **Governance** – **Control Tower** builds multi-account landing zones with guardrails (note: it does not grant IAM access automatically).

---

## 13. Identity, Security & Governance Notes {#identity-security}

- **SCPs** set maximum permissions; combine with IAM policies for effective rights. Remember that SCP evaluation is cumulative: Root SCPs apply to every OU/account, child OUs inherit parent SCPs, and explicit denies in any ancestor override everything beneath.
- **Parameter Store vs Secrets Manager** – config/simple secrets vs sensitive secrets with rotation/integration.
- **IAM role vs instance profile** – role = permission set; instance profile = container that attaches a role to EC2.
- **Web identity federation** – OIDC/SAML apps call `AssumeRoleWithWebIdentity` for short-lived creds.
- **KMS** – central envelope encryption (EBS/S3/RDS); import external keys when compliance demands.
- **Macie / GuardDuty / Inspector / Security Hub** – data classification, threat intel, vuln scanning, findings aggregation.
- **AWS Config** – drift/compliance detection; remediate via Lambda/SSM (Config itself is read-only).
- **Service Catalog** – standardized products with launch constraints/tags across accounts.

### 13.1 Identity Center & Directories {#identity-center}

- **IAM Identity Center (AWS SSO)** – one identity source at a time: built-in directory, AWS Managed AD/AD Connector, or external IdP (SAML/SCIM).
- **AD Connector for SSO** – when using on-prem AD via connector you cannot simultaneously plug in a third-party IdP; pick one source.
- **AWS Managed Microsoft AD trusts** – support external and forest trusts (one/both directions) with on-prem AD or another managed AD.
- **Granting management account access** – invited accounts create `OrganizationAccountAccessRole` so the management account can assume it for break-glass admin.

---
