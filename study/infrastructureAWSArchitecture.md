---
title: AWS Best Practices
permalink: /study/infrastructureAWSArchitecture
---

# AWS Architecture Best Practices {#aws-architecture-best-practices}

Concise study notes for designing reliable, secure, and cost-optimized AWS architectures — aligned with Professional Certification.

---

## 1. Network Architecture {#network-architecture}

### 1.1 VPC Design Principles
- Public subnets → internet-facing resources (ALB, NAT, bastion)  
- Private subnets → application servers, internal services  
- Database subnets → isolated, no internet access  
- Management subnets → monitoring, logging, admin tools  

Subnet sizing example:

```bash
/16 VPC (65,536 IPs)
├── /20 public subnets – 3 AZs
├── /20 private subnets – 3 AZs
├── /24 database subnets – 3 AZs
└── /24 management subnets – 3 AZs
```

Multi-AZ:
- At least 2 AZs (recommended 3)  
- Minimize cross-AZ traffic (adds cost + latency)  

### 1.2 Network Security
- Security groups → stateful, least privilege  
- NACLs → stateless, subnet-level, explicit allow/deny  
- VPC features → NAT for outbound, VPC Endpoints for private AWS access, Transit Gateway for central routing  

---

## 2. High Availability (HA) {#high-availability}

### 2.1 Application HA
- ALB → L7 HTTP/HTTPS routing, SSL termination  
- NLB → L4 TCP/UDP, high performance  
- Auto Scaling → multi-AZ placement, health checks, rolling updates  

### 2.2 Database HA
- RDS Multi-AZ → synchronous standby  
- Read replicas → async, scale reads  
- RDS Proxy → connection pooling  
- Application → retry logic and DNS failover  

---

## 3. Redundancy & Disaster Recovery {#redundancy-dr}

### 3.1 Storage Redundancy
- S3 cross-region replication  
- EBS snapshots  
- EFS multi-AZ replication  
- RDS backups (7–35 days)  

### 3.2 DR Strategies
- Backup & restore → cheapest, highest RTO/RPO  
- Pilot light → minimal infra, spin up on failover  
- Warm standby → scaled-down infra in DR region  
- Multi-site active → full redundancy, most expensive  

---

## 4. Security Architecture {#security-architecture}

### 4.1 Identity & Access
- Use roles instead of long-lived users  
- Enforce MFA, apply least privilege  
- Cross-account access with AssumeRole  
- Service-linked roles, instance profiles, Lambda roles  

### 4.2 Encryption
- At rest → EBS, RDS, S3, EFS  
- In transit → TLS/SSL  
- KMS → key management  
- ACM → certificate management  

---

## 5. Performance Optimization {#performance-optimization}
- Compute → right-size, Graviton, Spot, predictive scaling  
- Storage → GP3 > GP2, provisioned IOPS for DBs, S3 lifecycle rules  
- Data transfer → prefer intra-region/private, avoid cross-region  

---

## 6. Cost Optimization {#cost-optimization}
- Right-size resources using CloudWatch and Compute Optimizer  
- Use pricing models: RIs, Savings Plans, Spot  
- Optimize storage: Glacier, lifecycle, deduplication  
- Governance: budgets, alerts, tagging  

---

## 7. Monitoring & Observability {#monitoring}
- CloudWatch metrics, alarms, anomaly detection, dashboards  
- Centralized log groups, Logs Insights  
- X-Ray distributed tracing  
- Synthetic and real-user monitoring  

---

## 8. Deployment & Operations {#deployment}
- Infrastructure as code → CloudFormation, CDK  
- CI/CD → CodePipeline, CodeBuild, CodeDeploy  
- Deployment models → blue/green, canary, rolling, immutable  

---

## 9. Common Patterns {#common-patterns}
- Microservices → API Gateway, service mesh, async with SQS/SNS  
- Serverless → Lambda with API Gateway (REST/HTTP/WebSocket)  
- Event-driven → decouple via events/queues  

---

## 10. Design Principles (Rules of Thumb) {#design-principles}

### 10.1 How many AZs?
- Tolerate N-1 AZ failures  
- Example: Region has 6 AZs, keep 1 as buffer → 5 usable AZs  
- If app needs 5 instances → deploy 1 per AZ  

Formula:  

Nominal AZs = Total AZs – Buffer
Instances per AZ = Required ÷ Nominal AZs

### 10.2 How many subnets?
- Subnets = App tiers × AZs  
- Example: 2 tiers (app + DB) × 3 AZs = 6 subnets  

### 10.3 Tiering
- On-prem apps → 3-tier (presentation / logic / data)  
- In AWS → requirements-driven  
- Private DB subnets → compliance/security driven  
- More subnets = granular routing and security, not automatic HA  

---

## 11. Best Practices Summary {#best-practices-summary}

Principles:
1. Design for failure  
2. Implement elasticity  
3. Automate with IaC  
4. Monitor everything  
5. Optimize cost  

Common pitfalls:
- Single AZ or subnet → SPOF  
- Over-provisioning → wasted cost  
- Security bolted on late  
- No observability  
- Tight coupling between services  
