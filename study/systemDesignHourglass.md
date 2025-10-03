---
title: Hourglass Design
permalink: /study/systemDesignHourglass
---


## 🧠 "Hour Glass"

> An iterative, decision-driven guide to building scalable and reliable systems.
> In a way you are transforming the data and make it "what the clients" want to see

---

### 1. 🟪 Source (Data Origin & Ingress)

**Goal**: Identify the nature, rate, and reliability of data entering the system.

| Critical Question                                    | Impact on Design                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| How many sources, and what type (IoT, user, system)? | Determines protocol and scale: MQTT/Kafka for IoT, REST for users              |
| Is the source push or pull?                          | Push → queue/broker needed. Pull → periodic scheduler or polling logic.        |
| How frequent is the data (ms, sec, min)?             | Sub-second → stream system<br>Low-freq → batch/job                             |
| Can the source apply compute (pre-filter)?           | Yes → reduce load and noise<br>No → all logic must be server-side              |
| Is each source uniquely identifiable?                | Yes → partitioning/sharding<br>No → risk of duplication or tracking complexity |

---

### 2. 🟩 Type (Schema, Format, Encoding)

**Goal**: Determine how the data is structured and what formats affect storage/querying.

| Critical Question                                         | Impact on Design                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| Is schema known and enforced?                             | Yes → SQL or schema registry (Avro/Protobuf)<br>No → NoSQL or S3 |
| Is the payload narrow (few fields) or wide (many fields)? | Narrow → Time-series DB<br>Wide → OLAP column store              |
| Do you need compact storage or human-readable?            | Compact → Protobuf, Avro<br>Readable → JSON, CSV                 |
| Are values nested or flat?                                | Nested → NoSQL/JSONB<br>Flat → SQL                               |

---

### 3. 🟥 Storage (Scale, Structure, and Retention)

**Goal**: Pick the right engine based on size, write pattern, and query behavior.

| Critical Question                                        | Impact on Design                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| What’s the expected daily volume and retention duration? | High volume or long retention → Cold storage or tiered design (S3 + DB) |
| Are writes frequent (hot) or infrequent (cold)?          | Hot → Streaming DB or Append log<br>Cold → SQL with indices             |
| Is data mutable or immutable?                            | Mutable → SQL, versioning<br>Immutable → Append-only, event stores      |
| Do queries require joins or time-based filters?          | Joins → SQL<br>Time-filtering → Time-series or partitioned DB           |
| What consistency level is required?                      | Strong → SQL<br>Eventual → NoSQL or object storage                      |

---

### 4. 🟨 Access Pattern (Read Behavior & Consumers)

**Goal**: Understand **how data is queried**, to shape indexing and compute needs.

| Critical Question                               | Impact on Design                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| Are reads real-time, periodic, or ad-hoc?       | Real-time → Cache or precompute<br>Ad-hoc → OLAP or query planner |
| Do consumers read by ID, time range, or search? | ID → Key-value<br>Time → TSDB<br>Search → Inverted index/Elastic  |
| Is access global or scoped (by user/region)?    | Scoped → Partitioned tables or row-level access                   |
| Do consumers expect computed summaries?         | Yes → Pre-aggregated views, OLAP tables, materialized views       |

Note for ingestion:

| Use Case                                      | Best Option   |
| --------------------------------------------- | ------------- |
| < 1K messages/sec, low fan-out                | SQS/SNS       |
| 1K–10K messages/sec, occasional fan-out       | Kinesis       |
| >10K messages/sec, multi-consumer, replayable | Kafka/Kinesis |

---

### 5. 🟧 API (Interface & Access Protocols)

**Goal**: Choose interface method based on interaction style and latency needs.

| Critical Question                                 | Impact on Design                                              |
| ------------------------------------------------- | ------------------------------------------------------------- |
| Are responses user-triggered or system-triggered? | User → REST/GraphQL<br>System → Webhook, Kafka, MQTT          |
| Is real-time push required?                       | Yes → WebSocket, SSE, MQTT<br>No → REST polling               |
| Can responses be precomputed?                     | Yes → Redis/materialized views<br>No → On-demand DB or Lambda |
| Do clients need batch/massive downloads?          | Yes → Async job + link<br>No → Paginated API                  |

---

### 6. 🟦 Frontend / Client Needs

**Goal**: Understand client-side data behavior, rendering, and interactivity.

| Critical Question                              | Impact on Design                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Does the UI require low-latency/live updates?  | Yes → Push via WebSocket/SSE or fast polling                            |
| Does the client render large lists/maps/feeds? | Yes → Use pagination, infinite scroll, viewport filtering               |
| Is there advanced filtering or search?         | Yes → Use client-friendly search engines (Typesense, Meilisearch, etc.) |
| Do users expect offline access or sync?        | Yes → Service Workers + LocalStorage / IndexedDB                        |
| Are client views customized per user/role?     | Yes → Personalization and RBAC filtering at query-level                 |

---

### 7. 🔐 Security (Auth, Privacy, Protection)

**Goal**: Define minimum protection and tenant isolation.

| Critical Question                        | Impact on Design                                                 |
| ---------------------------------------- | ---------------------------------------------------------------- |
| Who can access the data and how?         | Public → Read-only APIs + WAF<br>Private → Auth with JWT/API Key |
| Does data belong to specific users/orgs? | Yes → Row-level security or schema-per-tenant                    |
| Is access logged and monitored?          | Yes → Append-only audit trail or log forwarding                  |
| Do you need protection from abuse?       | Yes → Throttling, WAF, API gateway, CAPTCHA                      |

---

### 8. 📈 Scalability (Throughput & Growth)

**Goal**: Forecast data/traffic growth and proactively plan for scale-out.

| Critical Question                                              | Impact on Design                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Is data or traffic expected to grow linearly or exponentially? | Exponential → Shard early, avoid monoliths                                      |
| Is the workload CPU, memory, or I/O bound?                     | CPU → Worker scale<br>I/O → Queue or backpressure<br>Memory → Cache or batching |
| Can the system be horizontally scaled easily?                  | Yes → Stateless microservices, partitioned DBs, autoscaling nodes               |
| Are there natural partitioning keys?                           | Yes → Device ID, region, tenant → enables scalable sharding                     |

---

### 9. 🔁 Reliability & Fault Tolerance

**Goal**: Ensure continuity of service and graceful degradation.

| Critical Question                                | Impact on Design                                         |
| ------------------------------------------------ | -------------------------------------------------------- |
| What’s the impact of a failed service/component? | High → Use retries, failover, fallback, circuit breakers |
| Can events be retried safely?                    | Yes → Idempotency keys or sequence markers               |
| Is durability more important than availability?  | Yes → Synchronous replication, WAL, backups              |
| How are dependent services isolated?             | Queues, bulkheads, rate limits, timeouts                 |

---

### 10. 🪵 Observability (Monitoring, Logging, Tracing)

**Goal**: Expose system behavior and enable root-cause analysis.

| Critical Question                        | Impact on Design                                              |
| ---------------------------------------- | ------------------------------------------------------------- |
| Do you need alerts on abnormal behavior? | Yes → Metric thresholds, anomaly detection, dead man’s switch |
| Can you trace requests across systems?   | Yes → Correlation IDs, OpenTelemetry, X-Ray                   |
| Is structured logging important?         | Yes → Use centralized log collector (Loki, ELK, Datadog)      |
| Are business-level metrics required?     | Yes → Emit custom app metrics, not just infra metrics         |

---

### 11. 🚀 Deployment & Infrastructure

**Goal**: Define environment, rollout strategy, and deployment control.

| Critical Question                         | Impact on Design                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| Is this cloud-native, hybrid, or on-prem? | Cloud → Use managed services<br>Hybrid/on-prem → Consider container orchestration |
| Is multi-region a hard requirement?       | Yes → Global DNS, active-active setup, replication strategy                       |
| Is IaC and CI/CD expected?                | Yes → Use Terraform/CDK, GitHub Actions/ArgoCD for pipelines                      |
| How fast do changes need to deploy?       | Fast → Canary releases, feature flags, rollback support                           |

---

## Scenario 1: Realtime Temperature Monitoring with IoT Sensors

Design a system that collects temperature data from 1 million IoT devices across NSW and publishes:

- A real-time pixelated temperature heatmap (~10s latency).
- A historical dashboard with daily/weekly/monthly min/max temperatures per region.
- Historical retention: 6 months.

### 1. **Source**

**What produces the data?**

- **1M IoT devices** deployed across NSW
- Each emits a temperature reading every **10 seconds**
- Format:

  ```json
  {
    "device_id": "abc123",
    "timestamp": 1723049840,
    "temperature": 26.5
  }
  ```

**Protocol Chosen**: `MQTT`

**Why**: Lightweight, supports millions of persistent low-power clients, ideal for IoT telemetry.

---

### 2. **Type**

**What kind of data?**

- **Structured, time-series**
- Schema is **fixed** and simple
- JSON at ingest, but stored in optimized binary

---

### 3. **Storage**

**How is the data stored, and what format?**

#### a. **Real-Time Table**

| Field        | Type   | Size               |
| ------------ | ------ | ------------------ |
| device_id    | UInt32 | 4B                 |
| temp         | Float  | 4B                 |
| last_updated | UnixTS | 8B                 |
| Total        |        | **16B** per device |

→ `1M devices * 16B = 16 MB` (not GB!)

#### b. **Historical Data**

For each sensor:

- Store **daily min/max** → 2 floats + 2 timestamps
  → 16B per day → `1M * 180 days * 16B = 2.88 GB`

Add device metadata table:

- device_id, uuid, lat, long → 20B × 1M → **\~20 MB**

#### ✅ Final Estimation:

| Table           | Estimated Size |
| --------------- | -------------- |
| Realtime Table  | \~16 MB        |
| Daily Table     | \~2.88 GB      |
| Weekly/Monthly  | Aggregated     |
| Device Metadata | \~20 MB        |
| **Total**       | **\~3.5 GB**   |

---

### 4. **Preprocessing / Compute**

**What processing is done pre-store or during ingestion?**

- Real-time table: **UPDATE on each incoming reading**
- Daily table: compare reading to current min/max → update if necessary
- Weekly/monthly: daily aggregation jobs (batch via scheduled job)

**Tech Suggestion**:

- AWS Lambda or ECS service for MQTT message processing
- Use `Redis` for fast in-memory compare/write for real-time updates
- Then batch-write to TimescaleDB / Postgres

---

### 5. **API (Data Interface)**

**How does the frontend consume the data?**

- **Realtime map**:

  - Uses **REST API** with client polling every 10 seconds
  - Endpoint hits `realtime_table`

- **Historical dashboard**:

  - REST endpoint to query `daily_table`, `weekly_table`

**Why polling over WebSocket?**

- Map is pixelated & low-resolution, not per-device → avoid 1M WebSocket updates
- 100 users/hour is low load
- Polling at 10s interval is simpler, cheaper to maintain, and sufficient

---

### 6. **Client / Presentation**

**What are the frontend requirements?**

- Web map view: grid overlay updated every 10s
- Historical dashboard with calendar filter
- No user authentication

---

### 7. **Security**

- No login needed, but:
  - Throttle API to avoid DoS (e.g., CloudFront + WAF)
- Edge - MQTT broker authentication with certs

---

### 8. **Scalability**

- Write-heavy system (1M writes every 10s = \~100K writes/sec)
- Use **Kafka** or **Kinesis** as buffer between MQTT and DB
- DB partitioned on `device_id` and time
- Stateless API → auto-scalable

---

### 9. **Reliability**

- MQTT → At Least Once delivery
- Ingest pipeline retry logic
- If device fails → last_seen timestamp in DB
- If aggregation job fails → re-run from daily table

---

### 10. **Observability**

- Metrics:

  - MQTT message rate
  - Write latency
  - Failed writes
  - Last_seen_age per sensor

- Logs:

  - Ingestion pipeline
  - API access logs

---

### 11. **Environment / Infra**

- Cloud-native (AWS):

  - **MQTT**: AWS IoT Core or EMQX
  - **Buffer**: Kinesis or Kafka
  - **Processing**: ECS, Fargate, or Lambda
  - **Storage**: PostgreSQL + TimescaleDB
  - **API**: FastAPI or Flask on Fargate
  - **Infra**: IaC with Terraform/CDK

---

### Summary Table

| Block         | Design Choice                              | Justification                      |
| ------------- | ------------------------------------------ | ---------------------------------- |
| Source        | MQTT sensors                               | Lightweight, IoT standard          |
| Type          | Fixed JSON schema                          | Efficient parsing                  |
| Storage       | PostgreSQL + Timescale                     | Time-series optimized              |
| Compute       | Real-time update + daily aggregation jobs  | Low-latency + batch                |
| API           | REST (polling every 10s)                   | Simpler infra, 100 users only      |
| Client        | Grid map + calendar dashboard              | Low interaction                    |
| Security      | Public API with WAF + MQTT certs           | Lightweight protection             |
| Scalability   | Kafka → TimescaleDB                        | Decouples writes, horizontal scale |
| Reliability   | Retry + health checks + last seen tracking | Graceful failure handling          |
| Observability | Metrics + alerts + logs                    | Easy monitoring                    |
| Environment   | AWS IoT Core, ECS, Terraform               | Modular & reproducible             |

---

## Scenario 2: Twitter Platform

## Scenario 3: eCommerce Platform
