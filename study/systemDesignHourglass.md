---
title: Hourglass Design
permalink: /study/systemDesignHourglass
---

# Hourglass Design {#hour-glass}

An iterative, decision-driven guide to building scalable and reliable systems.  
The process transforms raw data into the **shape that clients and consumers require**.

---

### 1. Source (Data Origin & Ingress) {#section-1-source-data-origin-ingress}

**Goal**: Identify the nature, rate, and reliability of incoming data.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>How many sources, and what type (IoT, user, system)?</td>
<td>Determines protocol and scale: MQTT/Kafka for IoT, REST for users</td>
</tr>
<tr>
<td>Is the source push or pull?</td>
<td>Push → queue/broker required<br>Pull → scheduler or polling logic</td>
</tr>
<tr>
<td>How frequent is the data?</td>
<td>Sub-second → streaming system<br>Low-frequency → batch jobs</td>
</tr>
<tr>
<td>Can the source apply pre-compute or filtering?</td>
<td>Yes → reduce load and noise<br>No → all filtering must be server-side</td>
</tr>
<tr>
<td>Is each source uniquely identifiable?</td>
<td>Yes → partitioning/sharding<br>No → risk of duplication or tracking issues</td>
</tr>
</tbody>
</table>

---

### 2. Type (Schema, Format, Encoding) {#section-2-type-schema-format-encoding}

**Goal**: Define how data is structured and encoded for storage and querying.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>Is schema known and enforced?</td>
<td>Yes → SQL or schema registry (Avro/Protobuf)<br>No → NoSQL or S3 object storage</td>
</tr>
<tr>
<td>Is the payload narrow or wide?</td>
<td>Narrow → Time-series DB<br>Wide → OLAP columnar store</td>
</tr>
<tr>
<td>Do you need compact storage or human-readable?</td>
<td>Compact → Protobuf, Avro<br>Readable → JSON, CSV</td>
</tr>
<tr>
<td>Are values nested or flat?</td>
<td>Nested → NoSQL/JSONB<br>Flat → SQL</td>
</tr>
</tbody>
</table>

---

### 3. Storage (Scale, Structure, Retention) {#section-3-storage-scale-structure-retention}

**Goal**: Choose the right storage engine based on size, retention, and query patterns.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>What’s the expected daily volume and retention?</td>
<td>High volume or long retention → Cold storage or tiered design (S3 + DB)</td>
</tr>
<tr>
<td>Are writes frequent or infrequent?</td>
<td>Hot → Streaming DB or append log<br>Cold → SQL with indices</td>
</tr>
<tr>
<td>Is data mutable or immutable?</td>
<td>Mutable → SQL, versioning<br>Immutable → Append-only, event store</td>
</tr>
<tr>
<td>Do queries require joins or time-based filters?</td>
<td>Joins → SQL<br>Time filtering → Time-series DB or partitioning</td>
</tr>
<tr>
<td>What consistency level is required?</td>
<td>Strong → SQL<br>Eventual → NoSQL or object storage</td>
</tr>
</tbody>
</table>

---

### 4. Access Pattern (Read Behavior & Consumers) {#section-4-access-pattern-read-behavior-consumers}

**Goal**: Understand how data will be queried and consumed.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>Are reads real-time, periodic, or ad-hoc?</td>
<td>Real-time → Cache or precompute<br>Ad-hoc → OLAP or query planner</td>
</tr>
<tr>
<td>Do consumers read by ID, time, or search?</td>
<td>ID → Key-value<br>Time → Time-series DB<br>Search → Inverted index (Elasticsearch)</td>
</tr>
<tr>
<td>Is access global or scoped (user/region)?</td>
<td>Scoped → Partitioned tables or row-level access</td>
</tr>
<tr>
<td>Do consumers expect summaries/aggregates?</td>
<td>Yes → Pre-aggregated views or OLAP materialization</td>
</tr>
</tbody>
</table>

**Ingestion Guideline**:

<table class="study-table">
<thead>
<tr>
<th>Use Case</th>
<th>Best Option</th>
</tr>
</thead>
<tbody>
<tr>
<td>&lt; 1K messages/sec, low fan-out</td>
<td>SQS/SNS</td>
</tr>
<tr>
<td>1K–10K messages/sec, occasional fan-out</td>
<td>Kinesis</td>
</tr>
<tr>
<td>&gt;10K messages/sec, multi-consumer, replayable</td>
<td>Kafka or Kinesis</td>
</tr>
</tbody>
</table>

---

### 5. API (Interface & Access Protocols) {#section-5-api-interface-access-protocols}

**Goal**: Select interaction method and latency model.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>Are responses user- or system-triggered?</td>
<td>User → REST/GraphQL<br>System → Webhook, Kafka, MQTT</td>
</tr>
<tr>
<td>Is real-time push required?</td>
<td>Yes → WebSocket, SSE, MQTT<br>No → REST polling</td>
</tr>
<tr>
<td>Can responses be precomputed?</td>
<td>Yes → Redis, materialized views<br>No → On-demand compute</td>
</tr>
<tr>
<td>Do clients need batch or large downloads?</td>
<td>Yes → Async job + signed URL<br>No → Paginated API</td>
</tr>
</tbody>
</table>

---

### 6. Frontend / Client Needs {#section-6-frontend-client-needs}

**Goal**: Ensure smooth rendering and interactive experience.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>Does the UI need low-latency/live updates?</td>
<td>Yes → Push (WebSocket/SSE) or fast polling</td>
</tr>
<tr>
<td>Does client render large lists/maps?</td>
<td>Yes → Pagination, infinite scroll, viewport filtering</td>
</tr>
<tr>
<td>Is advanced filtering or search required?</td>
<td>Yes → Search engines (Typesense, Meilisearch, Elasticsearch)</td>
</tr>
<tr>
<td>Is offline access required?</td>
<td>Yes → Service Workers + IndexedDB/LocalStorage</td>
</tr>
<tr>
<td>Are views personalized per user/role?</td>
<td>Yes → RBAC and query-level filters</td>
</tr>
</tbody>
</table>

---

### 7. Security (Auth, Privacy, Protection) {#section-7-security-auth-privacy-protection}

**Goal**: Define minimum protection and tenant isolation.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>Who can access the data?</td>
<td>Public → Read-only APIs + WAF<br>Private → Auth (JWT/API Key, IAM)</td>
</tr>
<tr>
<td>Does data belong to specific users/orgs?</td>
<td>Yes → Row-level security or tenant-specific schemas</td>
</tr>
<tr>
<td>Is access logged/monitored?</td>
<td>Yes → Append-only audit trail, log forwarding</td>
</tr>
<tr>
<td>Do you need abuse protection?</td>
<td>Yes → Throttling, WAF, API Gateway, CAPTCHA</td>
</tr>
</tbody>
</table>

---

### 8. Scalability (Throughput & Growth) {#section-8-scalability-throughput-growth}

**Goal**: Forecast growth and plan scale-out.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>Is growth linear or exponential?</td>
<td>Exponential → Plan early sharding, avoid monoliths</td>
</tr>
<tr>
<td>Is workload CPU, memory, or I/O bound?</td>
<td>CPU → Worker scaling<br>I/O → Queue or backpressure<br>Memory → Cache or batching</td>
</tr>
<tr>
<td>Can the system scale horizontally?</td>
<td>Yes → Stateless microservices, partitioned DBs</td>
</tr>
<tr>
<td>Are there natural partition keys?</td>
<td>Yes → Device ID, region, tenant → scalable sharding</td>
</tr>
</tbody>
</table>

---

### 9. Reliability & Fault Tolerance {#section-9-reliability-fault-tolerance}

**Goal**: Ensure continuity of service and graceful degradation.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>What is the impact of a failed service/component?</td>
<td>High → Retries, failover, fallback, circuit breakers</td>
</tr>
<tr>
<td>Can events be retried safely?</td>
<td>Yes → Idempotency keys, sequence markers</td>
</tr>
<tr>
<td>Is durability more important than availability?</td>
<td>Yes → Sync replication, WAL, backups</td>
</tr>
<tr>
<td>How are dependencies isolated?</td>
<td>Queues, bulkheads, rate limits, timeouts</td>
</tr>
</tbody>
</table>

---

### 10. Observability (Monitoring, Logging, Tracing) {#section-10-observability-monitoring-logging-tracing}

**Goal**: Enable root-cause analysis and system visibility.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>Do you need alerts on abnormal behavior?</td>
<td>Yes → Metrics, anomaly detection, dead man’s switch</td>
</tr>
<tr>
<td>Can you trace requests across systems?</td>
<td>Yes → Correlation IDs, OpenTelemetry, AWS X-Ray</td>
</tr>
<tr>
<td>Is structured logging important?</td>
<td>Yes → Central log collector (Loki, ELK, Datadog)</td>
</tr>
<tr>
<td>Are business-level metrics needed?</td>
<td>Yes → Emit custom application KPIs</td>
</tr>
</tbody>
</table>

---

### 11. Deployment & Infrastructure {#section-11-deployment-infrastructure}

**Goal**: Define environment and rollout strategy.

<table class="study-table">
<thead>
<tr>
<th>Critical Question</th>
<th>Impact on Design</th>
</tr>
</thead>
<tbody>
<tr>
<td>Is it cloud-native, hybrid, or on-prem?</td>
<td>Cloud → Use managed services<br>Hybrid → Consider containers, orchestration</td>
</tr>
<tr>
<td>Is multi-region required?</td>
<td>Yes → Global DNS, active-active, replication</td>
</tr>
<tr>
<td>Is IaC/CI/CD expected?</td>
<td>Yes → Terraform/CDK, pipelines (GitHub Actions, ArgoCD)</td>
</tr>
<tr>
<td>How fast must changes deploy?</td>
<td>Fast → Canary releases, feature flags, rollback support</td>
</tr>
</tbody>
</table>

# System Design Scenarios {#system-design-scenarios}

These scenarios illustrate how to apply the **Hourglass Design Method** to real-world systems, from IoT to social platforms to eCommerce.  
Each table follows the same structure: **Block → Design Choice → Justification**.

---

## Scenario 1: Realtime Temperature Monitoring (IoT Sensors) {#scenario-1-realtime-temperature-monitoring-iot-sensors}

**Goal**: Build a system for **1M IoT devices** reporting temperature every 10s across NSW.  
- **Realtime heatmap** (~10s latency)  
- **Historical dashboard** (daily/weekly/monthly)  
- **Retention**: 6 months  

<table class="study-table">
<thead>
<tr>
<th>Block</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Source</strong></td>
<td>MQTT protocol, 1M IoT devices<br>JSON payload: <code>{ device_id, timestamp, temperature }</code></td>
<td>MQTT is lightweight, supports millions of persistent low-power clients</td>
</tr>
<tr>
<td><strong>Type</strong></td>
<td>Structured time-series, fixed schema<br>JSON at ingest → binary at storage</td>
<td>Efficient parsing and optimized storage</td>
</tr>
<tr>
<td><strong>Storage</strong></td>
<td>Realtime table (~16 MB)<br>Daily aggregation (~2.9 GB / 180 days)<br>Metadata (~20 MB)<br><strong>Total ≈ 3.5 GB</strong></td>
<td>Tiered storage: hot (real-time) vs cold (aggregates)</td>
</tr>
<tr>
<td><strong>Preprocessing / Compute</strong></td>
<td>Realtime updates per reading<br>Daily min/max aggregation<br>Redis for fast compare<br>Batch writes → TimescaleDB</td>
<td>Low latency ingest + efficient aggregation</td>
</tr>
<tr>
<td><strong>API</strong></td>
<td>REST polling every 10s (map)<br>REST queries (historical)</td>
<td>Polling is simple, cost-efficient for low concurrency</td>
</tr>
<tr>
<td><strong>Client</strong></td>
<td>Web map grid updated every 10s<br>Historical dashboard with calendar filter</td>
<td>Lightweight visualization for end users</td>
</tr>
<tr>
<td><strong>Security</strong></td>
<td>No login<br>API throttling (CloudFront + WAF)<br>MQTT cert-based auth</td>
<td>Basic protection, open data model</td>
</tr>
<tr>
<td><strong>Scalability</strong></td>
<td>~100K writes/sec<br>Kafka/Kinesis buffer<br>Partition DB by device_id + time<br>Stateless API, autoscaling</td>
<td>Horizontal scalability and decoupling</td>
</tr>
<tr>
<td><strong>Reliability</strong></td>
<td>MQTT at-least-once<br>Retry pipeline<br>Re-runnable daily jobs</td>
<td>Ensures data completeness under failure</td>
</tr>
<tr>
<td><strong>Observability</strong></td>
<td>Metrics: ingest rate, write latency, last_seen<br>Logs: ingestion + API</td>
<td>Full visibility into data pipeline health</td>
</tr>
<tr>
<td><strong>Infrastructure</strong></td>
<td>AWS IoT Core or EMQX → Kinesis/Kafka → ECS/Fargate → TimescaleDB<br>IaC: Terraform/CDK</td>
<td>Cloud-native, modular, reproducible</td>
</tr>
</tbody>
</table>

---

## Scenario 2: Twitter-like Microblogging Platform {#scenario-2-twitter-like-microblogging-platform}

**Goal**: Design a social platform similar to Twitter.  
- **Realtime feed updates**  
- **Millions of posts/day**  
- **Support search, hashtags, user timelines**  

<table class="study-table">
<thead>
<tr>
<th>Block</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Source</strong></td>
<td>User posts (tweets), likes, follows<br>Ingest via REST API + WebSockets</td>
<td>REST for write operations; WebSocket for live updates</td>
</tr>
<tr>
<td><strong>Type</strong></td>
<td>JSON payloads (id, user_id, timestamp, text, media_url)<br>Hashtags/mentions indexed</td>
<td>Schema is semi-structured but consistent enough for indexing</td>
</tr>
<tr>
<td><strong>Storage</strong></td>
<td>OLTP DB (Postgres/CockroachDB) for metadata<br>Object store (S3) for media<br>ElasticSearch for search/index</td>
<td>Separate transactional vs. search workloads</td>
</tr>
<tr>
<td><strong>Preprocessing / Compute</strong></td>
<td>Fanout service builds timelines<br>Kafka for async event distribution</td>
<td>Decouples writes from personalized feed building</td>
</tr>
<tr>
<td><strong>API</strong></td>
<td>REST (post, follow)<br>WebSocket/GraphQL (feed updates)</td>
<td>REST reliable for writes; streaming API for low-latency feeds</td>
</tr>
<tr>
<td><strong>Client</strong></td>
<td>Web + mobile apps<br>Infinite scroll timeline, notifications</td>
<td>Optimized UX for engagement</td>
</tr>
<tr>
<td><strong>Security</strong></td>
<td>OAuth2 login<br>Rate limiting (API Gateway)<br>WAF for spam</td>
<td>Standard identity + abuse protection</td>
</tr>
<tr>
<td><strong>Scalability</strong></td>
<td>Sharded user/tweet DB<br>CDN for media<br>Async fanout to caches</td>
<td>Ensures horizontal scale to millions of users</td>
</tr>
<tr>
<td><strong>Reliability</strong></td>
<td>Durable Kafka log<br>Retry for writes<br>Timeline cache fallback</td>
<td>Feed always eventually consistent</td>
</tr>
<tr>
<td><strong>Observability</strong></td>
<td>Metrics: post latency, fanout lag<br>Logs: auth, API, feed delivery</td>
<td>Critical for SLO monitoring</td>
</tr>
<tr>
<td><strong>Infrastructure</strong></td>
<td>AWS: API Gateway + Lambda/ECS, DynamoDB/Postgres, S3, ElasticSearch</td>
<td>Mix of serverless + managed DB for scale</td>
</tr>
</tbody>
</table>

---

## Scenario 3: eCommerce Platform {#scenario-3-ecommerce-platform}

**Goal**: Design a modern eCommerce system.  
- **Product catalog, cart, checkout**  
- **User accounts, payments**  
- **Scalable search + inventory**  

<table class="study-table">
<thead>
<tr>
<th>Block</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Source</strong></td>
<td>Users browsing, adding to cart, checkout actions<br>External payment gateway callbacks</td>
<td>Standard REST ingestion with webhook integration</td>
</tr>
<tr>
<td><strong>Type</strong></td>
<td>Structured JSON for users/products<br>Catalog with categories, variants</td>
<td>Strong schema required for payments + orders</td>
</tr>
<tr>
<td><strong>Storage</strong></td>
<td>RDBMS (Aurora/MySQL) for orders/payments<br>DynamoDB for cart sessions<br>S3 for product media</td>
<td>Transactional consistency for payments; NoSQL for ephemeral cart</td>
</tr>
<tr>
<td><strong>Preprocessing / Compute</strong></td>
<td>Inventory service decrements stock<br>Async order events via SNS/SQS</td>
<td>Event-driven ensures reliable order flow</td>
</tr>
<tr>
<td><strong>API</strong></td>
<td>REST (catalog, cart, order)<br>GraphQL (flexible queries for product search)</td>
<td>REST for critical workflows; GraphQL for frontend flexibility</td>
</tr>
<tr>
<td><strong>Client</strong></td>
<td>Web + mobile storefront<br>Search, cart, checkout flows</td>
<td>Responsive UX, optimized conversions</td>
</tr>
<tr>
<td><strong>Security</strong></td>
<td>OAuth2 login, MFA for admin<br>PCI-DSS compliant payment handling<br>WAF + Shield</td>
<td>Protects sensitive user/payment data</td>
</tr>
<tr>
<td><strong>Scalability</strong></td>
<td>Autoscaling ALB/NLB<br>ElasticSearch for catalog search<br>CDN for static assets</td>
<td>Handles traffic spikes during sales</td>
</tr>
<tr>
<td><strong>Reliability</strong></td>
<td>Multi-AZ RDS<br>Order queue with DLQ<br>Event replay for payments</td>
<td>Ensures orders are never lost</td>
</tr>
<tr>
<td><strong>Observability</strong></td>
<td>Metrics: checkout latency, error rate<br>Logs: API + payment gateway</td>
<td>Monitors user impact and failures</td>
</tr>
<tr>
<td><strong>Infrastructure</strong></td>
<td>AWS: ALB + ECS, Aurora, DynamoDB, S3, ElasticSearch, CloudFront</td>
<td>Mix of managed + serverless services for resilience</td>
</tr>
</tbody>
</table>

---

### Scenario 4: Short URL Service (URL Shortener) {#scenario-a-short-url}

**Goal**: Map long URLs to short codes with **low latency**, **high write QPS**, and **massive read QPS**.  
- **Create** short code, **redirect** instantly  
- **Unique codes**, collision-resistant  
- **Analytics** (clicks, geo, referrer)  

<table class="study-table">
<thead>
<tr>
<th>Block</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Source</strong></td>
<td>REST API: <code>POST /shorten</code>, <code>GET /{code}</code></td>
<td>Simple CRUD over HTTPS; easy client integration</td>
</tr>
<tr>
<td><strong>Type</strong></td>
<td>JSON: <code>{ long_url, owner_id, ttl }</code></td>
<td>Minimal schema for fast validation and storage</td>
</tr>
<tr>
<td><strong>Storage</strong></td>
<td>DynamoDB (PK=code) for mapping; S3 for logs</td>
<td>Single-digit ms reads; elastic scale; cheap analytics storage</td>
</tr>
<tr>
<td><strong>Preprocessing / Compute</strong></td>
<td>Code gen via base62/ULID; optional custom alias; async analytics (Kinesis)</td>
<td>Collision avoidance; decouple hot path from analytics</td>
</tr>
<tr>
<td><strong>API</strong></td>
<td>REST + 301/302 redirect; rate-limits per owner</td>
<td>Browser-native redirect semantics; abuse protection</td>
</tr>
<tr>
<td><strong>Client</strong></td>
<td>Simple web console + CLI; QR export</td>
<td>Low-friction creation and sharing</td>
</tr>
<tr>
<td><strong>Security</strong></td>
<td>Auth (API keys/OAuth); domain allowlist; malware scanning</td>
<td>Prevents phishing/abuse; protects brand domains</td>
</tr>
<tr>
<td><strong>Scalability</strong></td>
<td>CloudFront → Lambda@Edge redirect cache; hot keys sharded</td>
<td>Edge-cached redirects minimize origin load/latency</td>
</tr>
<tr>
<td><strong>Reliability</strong></td>
<td>Multi-Region table (global tables); DLQ for failed writes</td>
<td>Regional failover; durable retry</td>
</tr>
<tr>
<td><strong>Observability</strong></td>
<td>Metrics: p50/p99 redirect latency, 4xx/5xx; click streams</td>
<td>Track UX and abuse; support analytics</td>
</tr>
<tr>
<td><strong>Infrastructure</strong></td>
<td>API Gateway + Lambda, DynamoDB, Kinesis, S3, CloudFront, WAF</td>
<td>Serverless, cost-efficient at any scale</td>
</tr>
</tbody>
</table>

---

### Scenario 5: Search Engine (Vertical Site/Search Service) {#scenario-b-search-engine}

**Goal**: Index documents/webpages and provide **full-text search** with **filters**, **ranking**, and **autosuggest**.  
- **Ingest & crawl** sources  
- **Index** fields + vectors  
- **Query**: keyword + semantic, filters, facets  

<table class="study-table">
<thead>
<tr>
<th>Block</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Source</strong></td>
<td>Crawler / webhooks / batch uploads (S3)</td>
<td>Multiple ingestion modes for coverage and freshness</td>
</tr>
<tr>
<td><strong>Type</strong></td>
<td>JSON docs: title, body, facets, embedding</td>
<td>Supports keyword and vector (semantic) search</td>
</tr>
<tr>
<td><strong>Storage</strong></td>
<td>OpenSearch/Elastic (inverted index) + vector index; S3 cold store</td>
<td>Hybrid BM25 + ANN; cheap archive</td>
</tr>
<tr>
<td><strong>Preprocessing / Compute</strong></td>
<td>ETL: clean, dedupe, tokenize, embed; incremental indexing</td>
<td>Higher relevance; fast refresh with partial updates</td>
</tr>
<tr>
<td><strong>API</strong></td>
<td>Search REST: q, filters, sort; autosuggest endpoint</td>
<td>Standard search UX; low-latency responses</td>
</tr>
<tr>
<td><strong>Client</strong></td>
<td>Web UI: search box, facets, highlighting; pagination</td>
<td>Discoverability and relevance feedback</td>
</tr>
<tr>
<td><strong>Security</strong></td>
<td>Signed requests; per-tenant filter; index-level RBAC</td>
<td>Isolation and least privilege</td>
</tr>
<tr>
<td><strong>Scalability</strong></td>
<td>Sharded indexes; warm replicas; query cache/CDN for hot queries</td>
<td>Throughput and low tail latency</td>
</tr>
<tr>
<td><strong>Reliability</strong></td>
<td>Multi-AZ cluster; snapshot to S3; blue/green index swaps</td>
<td>Safe reindex; fast recovery</td>
</tr>
<tr>
<td><strong>Observability</strong></td>
<td>Metrics: QPS, p99, recall@k/CTR; slow logs; relevancy dashboards</td>
<td>Quality and performance tuning</td>
</tr>
<tr>
<td><strong>Infrastructure</strong></td>
<td>ECS/EKS crawlers, Lambda ETL, OpenSearch, S3, API Gateway, CloudFront</td>
<td>Managed search + serverless ETL</td>
</tr>
</tbody>
</table>

---

### Scenario 6: Ride-Sharing (Dispatch & Matching) {#scenario-c-ride-sharing}

**Goal**: Match **riders ↔ drivers** in real time with **ETA estimates**, **pricing**, and **tracking**.  
- **High write** (location updates) + **low-latency reads** (nearby drivers)  
- **Geo-index** + **surge pricing**  
- **Trip lifecycle** events  

<table class="study-table">
<thead>
<tr>
<th>Block</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Source</strong></td>
<td>Mobile apps (drivers/riders) → gRPC/HTTP + WebSocket</td>
<td>Bi-directional updates; efficient on mobile</td>
</tr>
<tr>
<td><strong>Type</strong></td>
<td>JSON/Protobuf: lat/lon, speed, status; trip events</td>
<td>Compact on-wire; structured for stream processing</td>
</tr>
<tr>
<td><strong>Storage</strong></td>
<td>Redis/KeyDB (geo sets) for live locations; Postgres for trips/payments; S3 for telemetry</td>
<td>Fast geo-nearby; durable transactional store</td>
</tr>
<tr>
<td><strong>Preprocessing / Compute</strong></td>
<td>Stream (Kafka): location smoothing, ETA calc, surge pricing; ML for ETA/dispatch</td>
<td>Low-latency decisions; adaptive pricing</td>
</tr>
<tr>
<td><strong>API</strong></td>
<td>REST: request/cancel trip, quote; WebSocket: live driver ETA/track</td>
<td>Seamless UX for requests + realtime updates</td>
</tr>
<tr>
<td><strong>Client</strong></td>
<td>Mobile map with live driver markers; push notifications</td>
<td>High-frequency updates with low battery impact</td>
</tr>
<tr>
<td><strong>Security</strong></td>
<td>JWT auth; signed location updates; fraud detection rules</td>
<td>Protects users and platform integrity</td>
</tr>
<tr>
<td><strong>Scalability</strong></td>
<td>Region-sharded dispatch; partition by city/zone; edge caches for maps/tiles</td>
<td>Reduces cross-region chatter; scales horizontally</td>
</tr>
<tr>
<td><strong>Reliability</strong></td>
<td>Leader election per region; idempotent trip ops; DLQs for events</td>
<td>Failover and consistent trip lifecycle</td>
</tr>
<tr>
<td><strong>Observability</strong></td>
<td>Metrics: match time, cancel rate, ETA error; traces for dispatch path</td>
<td>Operational and model quality monitoring</td>
</tr>
<tr>
<td><strong>Infrastructure</strong></td>
<td>API Gateway + ECS/EKS, Redis Geo, Kafka, Postgres/Aurora, S3, CloudFront, Pinpoint/SNS</td>
<td>Mix of in-memory geo + durable stores</td>
</tr>
</tbody>
</table>