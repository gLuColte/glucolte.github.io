---
title: SLA, SLO & SLI in System Design
permalink: /study/systemDesignSlaSloSli
---

# SLA, SLO & SLI in System Design

An **SLA (Service Level Agreement)** is a formal commitment between a service provider and its customers. It defines what level of service will be delivered, often with financial or contractual penalties if the provider fails to meet it. To design reliable systems, you start by defining SLAs and then architect infrastructure to meet those guarantees.

---

## SLA vs SLO vs SLI

* **SLI (Service Level Indicator):** The actual metric being measured.  
  * Example: Percentage of HTTP 200 responses under 300ms.
* **SLO (Service Level Objective):** The internal target for an SLI.  
  * Example: 99.9% of requests respond under 300ms in a rolling 30-day window.
* **SLA (Service Level Agreement):** The external customer contract, usually tied to SLOs with penalties.  
  * Example: If uptime drops below 99.9% in a month, customers receive service credits.

👉 SLI = metric → SLO = target → SLA = binding agreement.

---

## Key SLA Components

1. **Availability**  
   Defines uptime guarantees.  
  ```
  Availability = (Total Time – Downtime) ÷ Total Time × 100
  ```
* 99.9% → 8.77 hrs downtime/year.  
* 99.99% → 52.6 mins downtime/year.

2. **Performance**  
* Response time (e.g., P95 < 100ms).  
* Throughput (e.g., ≥500 req/sec).

3. **Error Rate**  
  Acceptable % of failed requests.  
  ```
  Error Rate = (Failed Requests ÷ Total Requests) × 100
  ```

4. **Recovery**  
* **RTO (Recovery Time Objective):** Max acceptable downtime per incident.  
* **RPO (Recovery Point Objective):** Max acceptable data loss.

5. **Other Dimensions**  
* **Durability:** e.g., S3 promises 99.999999999% object durability.  
* **Consistency:** strong vs eventual.  
* **Support SLAs:** e.g., P1 ticket response within 1 hour.

---

## SLA and System Design

1. **SLA First, Architecture Second**  
* A 99.9% SLA means tolerating up to 8.77 hrs downtime/year.  
* Higher targets require multi-AZ or multi-region redundancy.

2. **Availability Targets and Architecture**  
* **90% (36.5 days downtime/year):** Single AZ, minimal redundancy.  
* **99.9% (8.77 hrs/year):** Single AZ with fast recovery, or Multi-AZ for resilience.  
* **99.99% (52.6 mins/year):** Multi-AZ failover, automated recovery.  
* **99.999% (~5 mins/year):** Multi-region active-active, very high cost.

3. **Key Considerations**  
* Planned maintenance often excluded.  
* Unplanned downtime directly impacts SLA.  
* Buffers account for unexpected incidents.  
* Redundancy raises SLA but increases cost and complexity.

---

## Example: E-Commerce Platform

### Step 1: Define SLIs (What to Measure)

* **Availability:** % of successful HTTPS responses (measured at the edge via Route 53).  
* **Performance:**  
  - Homepage latency (P95).  
  - Checkout API latency (P95).  
* **Error Rate:** % of failed transactions.  
* **Recovery:**  
  - RTO (time to recover).  
  - RPO (max data loss).  

➡️ These are end-to-end metrics as seen by customers. Internally, engineers also watch component health (EC2, RDS, ALB, etc.), but those are *inputs*, not customer-facing outcomes.

---

### Step 2: Define SLOs (Targets for Each SLI)

Each SLO directly maps to an SLI in Step 1:

* Availability ≥ **99.95%** successful requests per month.  
* Homepage latency < **200ms P95**.  
* Checkout API latency < **100ms P95**.  
* Error rate < **0.1%** per month.  
* Recovery: RTO = **15 minutes**, RPO = **5 minutes**.  

➡️ Step 1 defines *variables*, Step 2 sets *thresholds*. If SLOs aren’t realistic, the SLA that follows will be hollow.

---

### Step 3: Define SLA (Customer-Facing Contract)

Only a subset of SLOs become contractual:  

* **Availability SLA:** ≥ **99.95% uptime** per month (~21.6 mins downtime).  
* **Remedy:** Service credits if uptime falls below 99.95%.  
* **Other SLOs:** (latency, error rate, recovery) may be tracked internally or included in premium SLAs, but are not part of the base contract.  

➡️ Customers don’t care about component health; they only care about **request success**. That’s why SLAs are expressed in terms of end-to-end outcomes, not subsystem metrics.

---

### Step 4: Architecture to Meet SLA

The system is engineered to satisfy the SLA (Step 3) by aligning infrastructure to the SLOs (Step 2):

* **Frontend:** CloudFront CDN → improves availability and latency SLOs.  
* **APIs:** Multi-AZ ECS/EC2 behind ALB → ensures API availability.  
* **Database:** Aurora Multi-AZ → automatic failover meets recovery SLOs (RTO/RPO).  
* **Storage:** S3 → supports durability promises (11 nines).  
* **Payments:** Primary + backup providers → protects error rate SLO.  
* **Monitoring:** CloudWatch + Route 53 health checks → enforce availability at the edge.  

➡️ This isn’t random architecture — each choice directly maps back to the metrics that underpin the SLA.

---

### Customer-Facing SLA (External View)

* **Metric**: % of successful HTTPS requests (Route 53 checks).  
* **Promise**: ≥ **99.95% uptime** per month.  
* **Enforcement**: Credits issued if the target is missed.  

👉 Customers never see the internal math. They only see whether they can load the homepage and complete checkout.

---

### Internal SLA Baseline (AWS as Our Provider)

As AWS customers, we rely on **provider SLAs** to know our lower bound:  

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
  <thead>
    <tr style="background-color: #f8f9fa;">
      <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Service</th>
      <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">SLA (Published by AWS)</th>
      <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">CloudFront</td>
      <td style="border: 1px solid #ddd; padding: 12px;">99.9%</td>
      <td style="border: 1px solid #ddd; padding: 12px;"><a href="https://aws.amazon.com/cloudfront/sla/" target="_blank">CloudFront SLA</a></td>
    </tr>
    <tr style="background-color: #f8f9fa;">
      <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">ALB (Elastic Load Balancing)</td>
      <td style="border: 1px solid #ddd; padding: 12px;">99.99%</td>
      <td style="border: 1px solid #ddd; padding: 12px;"><a href="https://aws.amazon.com/elasticloadbalancing/sla/" target="_blank">ALB SLA</a></td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">EC2 (per AZ)</td>
      <td style="border: 1px solid #ddd; padding: 12px;">99.99%</td>
      <td style="border: 1px solid #ddd; padding: 12px;"><a href="https://aws.amazon.com/compute/sla/" target="_blank">EC2 SLA</a></td>
    </tr>
    <tr style="background-color: #f8f9fa;">
      <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">RDS Multi-AZ</td>
      <td style="border: 1px solid #ddd; padding: 12px;">99.99%</td>
      <td style="border: 1px solid #ddd; padding: 12px;"><a href="https://aws.amazon.com/rds/sla/" target="_blank">RDS SLA</a></td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">S3</td>
      <td style="border: 1px solid #ddd; padding: 12px;">99.99% availability,<br/>11 nines durability</td>
      <td style="border: 1px solid #ddd; padding: 12px;"><a href="https://aws.amazon.com/s3/sla/" target="_blank">S3 SLA</a></td>
    </tr>
  </tbody>
</table>

With **Multi-AZ deployments**, availability improves because both AZs would need to fail simultaneously for the service to be unavailable. If each AZ has **99.99% availability (0.9999)**, then the probability of *both* failing at the same time is:

```
Joint failure = (1 – 0.9999) × (1 – 0.9999)
              = 0.0001 × 0.0001
              = 0.00000001  (0.000001%)
```

So effective availability is:

```
Multi-AZ Availability ≈ 1 – Joint failure
                      ≈ 1 – 0.00000001
                      ≈ 99.999999%  (8 nines)
```

That’s why AWS often markets **Multi-AZ RDS or EC2 setups** as “highly available” — the redundancy pushes the number of nines up dramatically.

---

### Engineering roll-up (approx)

When combining multiple services, the system’s effective availability is roughly the product of each component’s availability:

```
System Availability ≈ CloudFront × ALB × EC2(Multi-AZ) × RDS(Multi-AZ) × S3
≈ 0.999 × 0.9999 × 0.99999999 × 0.99999999 × 0.9999
≈ 99.88%
```

➡️ This illustrates a **gap**: even though individual services have strong SLAs, the multiplicative effect drags the total down. To confidently offer an external **99.95% SLA** (or higher), you need **extra redundancy** such as multi-region, edge caching, or graceful degradation (e.g., read-only mode if the database is down).

---

### Key Insight

* **Externally:** SLA is measured end-to-end at the edge → customer outcomes.  
* **Internally:** Engineers validate feasibility by multiplying provider SLAs.  
* **Professional Risk View:** If AWS guarantees ~99.88% and we promise 99.95%, we must close the delta with multi-region or fallback strategies — otherwise the SLA is wishful thinking.
