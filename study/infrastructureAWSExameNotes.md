---
title: AWS SA Pro Notes
permalink: /study/infrastructureAWSSAProExamNotes
---

# AWS Exam Notes

- **Migration Phases:** Assess → Mobilize → Migrate & Modernize.  
- **Effort vs Benefit:** Rehost Low/Low, Replatform Med/Med, Refactor High/High, Repurchase Med/High, Retire Low/High, Retain None/None.  
- **ADS (Application Discovery Service)** – before migration; collects inventory, dependencies; used for planning in Migration Hub.  
- **MGN (Application Migration Service)** – performs **actual migration (lift-and-shift)**; not used for **planning** (use **ADS / Migration Hub** instead).  
- **Migration Flow:** ADS → Migration Evaluator → Migration Hub → MGN → Optimize.  
- **Analogy:** ADS = home inspection 🏠, MGN = moving company 🚚.  
- **API Gateway Caching** – built-in; caches backend responses for TTL (0–3600 s); reduces backend load; customizable cache keys; flush manually; billed hourly.  
- **ACM (AWS Certificate Manager)** – certificates are **regional**; CloudFront uses **us-east-1**.  
- **SCP (Service Control Policy)** – defines **max permissions** for IAM users/roles; **does not grant** permissions; use with **IAM policies** for access control; avoid blocking entire services.  
- **RDS Snapshot** – point-in-time backup (stored in S3).  
- **RDS Retain / Deletion Protection** – prevents DB deletion; not a backup.  
- **ECS Anywhere** – run/manage ECS containers on-prem; consistent control plane; supports hybrid migration.  
- **Control Tower Logs & Inspector:** Control Tower → CloudWatch/CloudTrail (monitoring); Inspector → vulnerability scanning.  
- **Direct Connect VIF:** **Public VIF** for public AWS services (S3, DynamoDB); **Private VIF** for VPC private IPs.  
- **S3 Search** – not effective; only use when **cost or retrieval specificity** matters.  
- **SG (Security Group)** – cannot filter by **URL**; filters only by **IP, port, or protocol**.  
- **Forward Proxy / NAT** – **forward proxy** filters outbound traffic; provides **caching**, **URL filtering**, **IDS/IPS**, **DLP**, **monitoring**, and **threat protection**. Instances behind a **NAT Gateway** can make **outbound**, but not **inbound**, connections.  
- **Network ACL (NACL)** – rules tied to **NLB target subnets** should **not allow direct client access**; allow only between **NLB** and **EC2 subnets**.  
- **CloudFormation Restore** – even with templates, **restoring backups** from **S3** can take a long time.  

<div class="image-wrapper">
  <img src="./Screenshot%202025-10-13%20A.png" alt="AWS Migration Overview" class="modal-trigger" data-caption="AWS Migration - Source Udemey - Tutorial Dojo Practice Exam Solutions">
  <div class="image-caption">🌐 AWS Migration Overview - Source Udemey - Tutorial Dojo Practice Exam Solutions </div>
</div>

- **S3 Versioning Example** – bucket with 4 files (**MNL-NA.config**, **MNL-LA.config**, **MNL-EUR.config**, **MNL-ASIA.config**) gets **Version ID = null** after enabling versioning.  
- **CloudFront Security Practices:**  
  - Use **signed URLs or cookies** for private content.  
  - Prefer **CloudFront URLs** over **S3 URLs**.  
  - Enforce **HTTPS** using Viewer Protocol Policy (**Redirect HTTP→HTTPS** or **HTTPS Only**).  
  - Use **Origin Access Control (OAC)** instead of bucket ACLs to restrict access.  
- **S3 + CloudFront Optimization** – partition S3 by **month**; CloudFront caches **latest content** for faster delivery.  
- **Small File Transfer (Snowball Edge)** – batch small files together to reduce **encryption overhead** and **speed up transfers**.  
- **Inbound Endpoint** – allows **corporate DNS** to resolve **AWS resources (EC2, RDS, etc.)**.  
- **Outbound Endpoint** – forwards **DNS queries from VPC to on-prem** via rules.  
- **CloudFront Query Strings** – each **unique parameter value** creates a **separate cache version**; only cache parameters that **change responses**.  
- **Lambda@Edge** – extension of **AWS Lambda** (Node.js/Python); runs at **edge locations** to reduce latency; auto-scales from few to thousands of requests/sec.  
- **Lambda@Edge Optimization** – improve cache hit ratio by **alphabetizing query strings** and **lowercasing parameters**.  
- **Amazon ElastiCache** – managed **in-memory datastore** for **Redis/Memcached**; improves DB performance with low-latency reads.  
  - **Memcached** – simple, fast, distributed caching.  
  - **Redis** – richer data structures, persistence, pub/sub, clustering.  
- **Elastic Beanstalk** – in-place updates cause downtime; use **blue/green deployment** → deploy new env + **swap CNAMEs** for instant switch.  
- **Lightsail** – simplifies **EC2 + LB setup**; designed for **Dev/Test**, not **production**. Avoid weighted Route 53 shifting for production.  
- **SSL Certificates & ELB** – ELB certificate not mandatory; avoid **self-signed certs** for public sites.  
- **EC2 Instance Role Credentials** – EC2 fetches **temporary credentials** via instance metadata:  
```
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
```
- **Web Identity Federation** – users sign in via **Amazon/Facebook/Google/OIDC IdP**; exchange token via **AssumeRoleWithWebIdentity** for **temporary AWS creds** (no hard-coded keys).  
- **AWS Control Tower** – manages **multi-account setups**; doesn’t automatically assign IAM permissions to member accounts.  
- **ALB Multi-Cert Support** – upload multiple **SSL certs**; ALB auto-selects best via **SNI (Server Name Indication)**.  
- **FSx for Lustre** – temporarily **loads data from S3**, shares across app tier, and uses S3 for **long-term storage** → cost-efficient hybrid setup.  
- **AWS Storage Gateway Restore** – cannot link **S3 directly to EC2**; create **snapshot → EBS Volume → attach** to instance.  
- **RDS Replica Promotion** – no **auto-promotion** for cross-region replicas; must **manually promote**, causing reboot (may exceed RTO/RPO).  
- **Traffic Mirroring** – copies **EC2 network traffic** from ENIs → send to **monitoring/security appliances**.  
- **AWS Security Hub** – centralizes **security findings** from **GuardDuty, Config, Inspector, partners** → unified compliance view.  
- **AWS IoT Core** – connects **IoT devices** to AWS; supports **secure messaging, routing, offline handling**; includes **device gateway** + **message broker**.  
- **Disaster Recovery (RTO 30 min)** – restoring from **EC2 snapshots** is cheaper/faster than **hot-standby** (which runs continuously).  
- **FSx Resize** – no auto-scaling; **manually resize** via console, API, or CLI.  
- **Redshift KMS Encryption** – KMS keys are **region-specific**; for **cross-region snapshot copy**, create a **snapshot copy grant** with destination key.  
- **VPC VGW Limit** – only one **Virtual Private Gateway** per **VPC**.  
- **AWS Config Managed Rules** – predefined checks (e.g., **approved-amis-by-id**); use **Lambda** for auto-remediation.  
- **AWS Service Catalog** – defines **products + tagging policies**; ensures consistent tags across accounts.  
- **AWS Config vs Tagging** – Config **detects untagged resources**, but can’t **add tags**; use **Lambda/SSM Automation** to fix.  
- **Dynamic Website Limitation (S3)** – if users can **submit comments**, site is **dynamic** → use **EC2/Lambda**, not **S3 + CloudFront static hosting**.  
- **KMS with On-Prem HSM** – import **keys from on-prem HSMs** to **AWS KMS** for compliance + control; supports **key rotation**, **auditing**, and **S3 encryption policies**.  
- **CVE Assessment** – **AWS Config** cannot run CVE scans; use **Amazon Inspector** for vulnerability assessments on EC2.