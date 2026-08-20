---
title: System Design Interviews with C4
permalink: /study/systemDesignInterviewTips
---

# System Design Interviews with C4 {#interview-tips}

A strong system design answer should move through clear levels of abstraction instead of mixing users, services, databases, classes, and infrastructure on one diagram. The [C4 model](https://c4model.com/introduction) gives us that structure:

1. **Context:** the system in its world.
2. **Container:** the applications and data stores inside the system.
3. **Component:** the major building blocks inside one container.
4. **Code:** implementation detail inside one component.

This is a better backbone than treating source, storage, logic, presentation, infrastructure, and interview technique as parallel steps. Those are still useful **design concerns**, but they should be considered at the appropriate C4 zoom level.

One qualification matters: C4 is a way to **describe and communicate** architecture, not a complete design method or a mandatory four-step process. Requirements, sizing, data flow, security, reliability, and trade-offs still drive the design. In most interviews, Context and Container are enough; zoom into Components only for the riskiest part, and use Code only when it genuinely explains an algorithm or data structure.

---

## The Interview Flow {#the-interview-flow}

Use this sequence:

~~~
0. Scope and constraints
1. Context
2. Container
3. Component, only where risk justifies it
4. Code, rarely
5. Dynamic and deployment views, when useful
6. Review and wrap up
~~~

The rule is simple: **finish the story at one zoom level before moving inward**. Tell the interviewer when you zoom in and name the parent element you are opening.

| Stage | Main question | Typical output |
|---|---|---|
| Scope | What are we building, for whom, and under what constraints? | Functional requirements, quality goals, assumptions, scale |
| Context | How does the system fit into the world? | People, system boundary, external systems, major relationships |
| Container | What runs or stores data inside the system? | Applications, services, jobs, queues, caches, and data stores |
| Component | How does one high-risk container work internally? | Major responsibilities and their relationships |
| Code | Which implementation detail needs explanation? | Class, function, algorithm, state machine, or schema detail |
| Supporting views | How does a scenario execute and where does it run? | Dynamic or deployment diagram |
| Wrap-up | Is the design plausible and what does it trade off? | Bottlenecks, failure modes, decisions, next steps |

---

## Core Mindset {#core-mindset}

- Clarify the problem before drawing architecture.
- Make assumptions explicit when exact answers are unavailable.
- Think aloud and treat the interviewer as a design partner.
- Tie every box to a requirement; do not add technology decoratively.
- Prefer explicit trade-offs over absolute claims.
- Keep each diagram at one abstraction level.
- Start broad and zoom in only after the current view is understood.
- Spend detail where uncertainty or risk is highest.
- Use rough numbers to test plausibility, not to create false precision.

---

## Step 0: Scope and Constraints {#step-0-scope-and-constraints}

C4 starts with a system boundary, but requirements tell you where that boundary belongs and what must happen inside it.

### Functional scope

Ask enough high-value questions to identify:

- Primary users and their goals.
- Critical use cases and user journeys.
- Features explicitly in and out of scope.
- Inputs, outputs, and external integrations.
- Web, mobile, machine-to-machine, batch, or realtime clients.

Summarize before designing:

~~~
I will design X for Y users, supporting A, B, and C.
D and E are out of scope.
The critical journey is A -> B -> C.
~~~

### Quality attributes

Make vague words measurable:

- **Scale:** users, requests per second, events per second, object count, event size, and growth.
- **Latency:** target p50, p95, or p99 for critical operations.
- **Availability:** which journeys must remain available and the acceptable downtime.
- **Durability:** which data cannot be lost.
- **Consistency:** where stale reads or conflicting writes are unacceptable.
- **Security and privacy:** identity, authorization, tenancy, compliance, retention, and deletion.
- **Cost and delivery constraints:** team size, existing stack, time, and operating budget.

Use [Numbers That Matter](/study/systemDesignNumbersThatMatter) for quick sizing and [SLA, SLO & SLI](/study/systemDesignSlaSloSli) for measurable reliability targets.

### Back-of-the-envelope sizing

Calculate only numbers that can change the architecture:

~~~
average QPS = requests per day / 86,400
peak QPS = average QPS x peak factor
daily ingest = events per second x bytes per event x 86,400
retained storage = daily ingest x retention x replication/index overhead
bandwidth = requests per second x response bytes
~~~

State the consequence of each estimate. “100K writes/second suggests partitioned ingestion” is useful; an isolated number is not.

---

## Level 1: System Context {#level-1-system-context}

The Context diagram answers: **What is the system, who uses it, and what does it depend on?**

Draw:

- One box for the software system in scope.
- People or roles that use it.
- External software systems it communicates with.
- Directed, labelled relationships that describe intent.

Do not draw internal APIs, databases, queues, caches, frameworks, or classes here. Those belong at deeper levels.

### Context checklist

- What business or user responsibility does the system own?
- Who initiates each critical use case?
- Which external systems supply or receive information?
- Where are the trust and ownership boundaries?
- Which relationships are synchronous, asynchronous, batch, or manual?
- Which critical requirement motivates the design?

A good relationship label says **why** the interaction exists, such as “submits ride request” or “sends payment authorization”, rather than the generic “uses”.

End this level by walking through one critical journey and confirming the boundary:

~~~
At the Context level, the rider requests a trip from the Ride Platform.
The platform obtains payment authorization from the Payment Provider
and sends status notifications through the Notification Provider.
Does this boundary match the problem you want me to solve?
~~~

---

## Level 2: Containers {#level-2-containers}

The Container diagram answers: **What are the major runnable applications and data stores inside the system, and how do they collaborate?**

In C4, a container is not necessarily Docker. It is an application or data store that runs code or holds data: a web app, mobile app, API, worker, database, object store, queue, or search index.

For each container, show:

- A specific name.
- Its responsibility.
- Its technology, when the choice matters.
- Directed and labelled relationships.
- The system boundary around all in-scope containers.

This is usually the most valuable interview diagram because it exposes service boundaries, data ownership, communication style, and the high-level read/write paths.

### Design the main paths

Walk through the critical use case rather than listing disconnected boxes:

1. Where does the request or event enter?
2. Which container validates and authorizes it?
3. Which container owns the business decision?
4. What is the source of truth?
5. Which derived stores, caches, indexes, or events are updated?
6. How does the result reach the user or downstream system?
7. What happens if a dependency is slow, unavailable, or returns twice?

Separate read and write paths when they differ. Label protocols only when relevant, such as HTTPS/JSON, gRPC, WebSocket, or events on a named topic.

### Data and request-flow lens {#data-and-request-flow-lens}

The useful part of the old Hourglass model becomes a checklist within the C4 views, not a competing sequence of abstraction levels:

| Concern | Context view | Container view | Component view |
|---|---|---|---|
| Source | Person or external system that starts the flow | Ingress application, API, upload, topic, or job | Validator, adapter, consumer, or handler |
| Type | Business information crossing the boundary | Payload/event family, size, rate, and serialization | Schema validation and evolution |
| Storage | Usually omitted | Source of truth, derived stores, cache, index, retention | Repository, partition/index strategy, invalidation |
| Access pattern | Major user/system relationship | Read/write API, lookup shape, stream, or batch path | Query, key, cursor, ranking, or aggregation logic |
| Transformation | System responsibility | Service/worker pipeline and sync/async boundary | Domain rules, enrichment, deduplication, state transition |
| Presentation | Person or external consumer receiving value | Web/mobile/API/notification/export container | Presenter, formatter, subscription, or delivery adapter |

For each important flow, define **Data A -> Data B**:

- What does one producer emit?
- What does that become across all producers?
- What must be canonical, and what can be rebuilt?
- How will consumers request or subscribe to the result?
- What is computed on write, on read, on a schedule, or continuously?
- What freshness, ordering, consistency, and permission rules apply?

This keeps data reasoning intact while ensuring every decision appears at the correct zoom level.

### Choosing containers from requirements

Choose technology only after identifying workload and access pattern:

- Use a relational store when transactions, constraints, and relational access dominate.
- Use a key-value/document store when partitioned key access and horizontal scale dominate.
- Use object storage for large immutable blobs.
- Add a cache only for repeated reads that tolerate a freshness strategy.
- Add a queue or stream only when buffering, asynchronous work, or independent consumers justify it.
- Add a search index only when query requirements exceed the source-of-truth store.
- Split a service when a business boundary, scaling profile, ownership boundary, or reliability requirement justifies independent operation.

A container diagram is not improved by having more boxes. Each boundary creates operational and consistency costs.

---

## Level 3: Components {#level-3-components}

The Component diagram answers: **How does one selected container fulfil its responsibilities?**

First name the container you are opening. Do not show components from several containers on the same component diagram.

Useful components are cohesive responsibility boundaries, for example:

- API/controller or message consumer.
- Authorization policy.
- Domain service.
- Matching, ranking, pricing, or scheduling engine.
- Repository or external-system adapter.
- Publisher and retry coordinator.

Choose this level only for the highest-risk part of the design. Good interview deep dives include:

- Feed fanout.
- Seat reservation and payment coordination.
- Message ordering.
- Geo-spatial dispatch.
- Rate-limit decisions.
- Cache invalidation.
- Search indexing and ranking.
- Idempotent event processing.

At this level, discuss the contracts and hard trade-offs: data model, indexes, partition keys, concurrency control, ordering, idempotency, retries, backpressure, consistency, and failure recovery.

~~~
The riskiest container is Reservation Service because concurrent buyers
can claim the same seat. I will zoom into that container and show the
hold, inventory, payment, and expiry components.
~~~

---

## Level 4: Code {#level-4-code}

The Code diagram answers: **How is one component implemented?**

This level may show classes, functions, interfaces, tables, algorithms, or a state machine. It is rarely needed in a system design interview and becomes stale quickly. Use it when the implementation mechanism is itself the design risk, such as:

- Token-bucket state and atomic update logic.
- Consistent-hashing ring.
- Reservation state machine.
- Conflict-resolution algorithm.
- Critical schema or index layout.

Do not descend to code just because C4 has a fourth level. Stop at the level that communicates the decision.

---

## Supporting Views {#supporting-views}

The four C4 levels describe static structure. Real systems also need behaviour and runtime placement.

### Dynamic diagram

Use a numbered sequence of interactions for one important scenario:

- Successful write and read paths.
- Retry after timeout.
- Duplicate event handling.
- Cache miss and fill.
- Payment succeeds but confirmation fails.
- Regional failover or degraded mode.

A dynamic view should reuse the same names as the Context, Container, and Component views. It is often clearer than adding more arrows to a static diagram.

### Deployment diagram

Use a deployment view when infrastructure changes the answer:

- Regions, availability zones, and failover.
- Replicas, shards, and partition placement.
- CDN and edge locations.
- Public/private networks and trust boundaries.
- Autoscaling, load balancing, and service discovery.
- Deployment, migration, rollback, and disaster recovery.

Do not mix AWS or Kubernetes nodes into the logical Container diagram. First show what the software is; then show where instances run.

### System landscape

Use a landscape view only when several peer software systems and organizational ownership boundaries matter. For a single-system interview prompt, Context is normally sufficient.

---

## Cross-Cutting Qualities {#cross-cutting-qualities}

These concerns are not extra C4 levels. Apply them to every relevant element and relationship:

- **Security:** authentication, authorization, encryption, secrets, abuse prevention, audit, privacy, and deletion.
- **Scalability:** the dimension that grows, partition key, hot spots, fanout, backpressure, and scaling limit.
- **Reliability:** timeouts, retries with jitter, idempotency, replication, failover, recovery, and degraded modes.
- **Observability:** user-facing SLIs, metrics, logs, traces, queue lag, data freshness, and actionable alerts.
- **Operability:** configuration, schema migration, deployment, rollback, capacity, and cost.
- **Data governance:** ownership, lineage, retention, residency, correction, and rebuildability.

Attach these to concrete elements. For example, “the worker retries with an idempotency key and sends exhausted messages to a dead-letter queue” is stronger than a floating “reliability” box.

---

## A Practical 45-Minute Sequence {#practical-45-minute-sequence}

| Time | Activity |
|---|---|
| 0-7 min | Clarify scope, critical journeys, quality goals, and assumptions |
| 7-12 min | Estimate the few numbers that affect the architecture |
| 12-17 min | Draw and validate the Context view |
| 17-29 min | Draw the Container view and walk read/write paths |
| 29-39 min | Deep dive into one risky container with Components or a Dynamic view |
| 39-45 min | Test failures, bottlenecks, security, trade-offs, and summarize |

Treat the timing as a guide. Follow the interviewer’s signals and spend time where the discussion creates evidence of engineering judgment.

---

## Diagram Discipline {#diagram-discipline}

Each diagram should include:

- A title naming the diagram type and scope.
- A clear boundary for the element being described.
- Element type, name, and concise responsibility.
- Technology where relevant.
- One-way arrows with descriptions that match their direction.
- A legend if colour, shape, or line style carries meaning.

Keep names consistent across every view. Avoid ambiguous boxes such as “backend”, “business logic”, “data”, or “cloud”. Never place a database beside a class or a person beside an internal component on the same static diagram.

---

## Wrap Up {#wrap-up}

A strong closing takes 30-60 seconds:

1. Restate the scope and critical journey.
2. Summarize the Context and Container decisions.
3. Name the deepest design risk and its mitigation.
4. Identify the likely bottleneck or failure mode.
5. State the main trade-off.
6. Explain what you would explore next.

~~~
This design keeps booking inventory strongly consistent while allowing
catalogue reads and notifications to be eventually consistent. The main
risk is the reservation-to-payment transition, so the design uses
short-lived holds, idempotent commands, and reconciliation. With more
time, I would validate multi-region recovery and capacity under the
on-sale spike.
~~~

---

## Final Review Checklist {#final-review-checklist}

Before finishing, check:

- Does every diagram stay at one abstraction level?
- Is the system boundary explicit?
- Are all elements named and described?
- Are relationships directed and labelled?
- Can you trace the critical journey end to end?
- Are the source of truth and derived data clear?
- Do storage choices match access patterns and consistency needs?
- Are scale estimates connected to design decisions?
- Are retries idempotent and failure modes recoverable?
- Are security and observability attached to concrete paths?
- Did you explain what the design optimizes for and sacrifices?
- Did you stop zooming when further detail stopped adding value?

---

## Official C4 References {#official-c4-references}

- [Introduction and the four zoom levels](https://c4model.com/introduction)
- [Core and supporting diagram types](https://c4model.com/diagrams)
- [Diagram review checklist](https://c4model.com/diagrams/checklist)
- [C4 diagram FAQ](https://c4model.com/diagrams/faq)

---

## Why These Interview Habits Matter {#why-these-interview-habits-matter}

These are not really system-design scenario questions. They explain why the interview habits above matter and how to use them during the interview.

<details>
  <summary><strong>Why should you ask clarifying questions before designing?</strong></summary>

Because different requirements produce different architectures. A system for 10K users can be much simpler than one for 100M users. A read-heavy product may need caching and replicas; a write-heavy product may need queues, partitions, and append-only storage. Clarifying questions prevent solving the wrong problem.
</details>

<details>
  <summary><strong>What should you do if the interviewer does not give exact numbers?</strong></summary>

Make reasonable assumptions and say them out loud. For example: "I will assume 10M daily active users, 100M reads/day, and 1M writes/day. If that is too high or low, I can adjust the design." This shows you can move forward without pretending the unknowns do not matter.
</details>

<details>
  <summary><strong>How do you decide between SQL and NoSQL?</strong></summary>

Use SQL when you need strong consistency, transactions, relational queries, constraints, and flexible joins. Use NoSQL when the access pattern is simple, scale is very high, schema flexibility matters, or partitioned key-value/document access fits naturally. The answer should include tradeoffs, not just a product name.
</details>

<details>
  <summary><strong>When should you introduce a cache?</strong></summary>

Use a cache when reads are frequent, data can tolerate some staleness, and the same data is requested repeatedly. Mention the tradeoff: caches improve latency and reduce database load, but introduce invalidation, consistency, memory cost, and operational complexity.
</details>

<details>
  <summary><strong>When should you use a queue or stream?</strong></summary>

Use a queue or stream when work can be processed asynchronously, when you need buffering during traffic spikes, or when multiple consumers need to react to the same event. The tradeoff is that the system becomes eventually consistent and needs retry, idempotency, ordering, and dead-letter handling.
</details>

<details>
  <summary><strong>How do you talk about consistency tradeoffs?</strong></summary>

State which data must be strongly consistent and which data can be eventually consistent. Payments, inventory reservation, and account balances often need stronger guarantees. Feeds, counters, analytics, search indexes, and notifications can often lag slightly.
</details>

<details>
  <summary><strong>How do you identify bottlenecks?</strong></summary>

Trace the read and write paths and look for shared resources: database writes, hot partitions, cache misses, queue lag, external APIs, large fanout, and cross-region calls. Then connect each bottleneck to a mitigation such as caching, sharding, batching, backpressure, async processing, or graceful degradation.
</details>

<details>
  <summary><strong>How should you handle failures in the design?</strong></summary>

Identify what happens when each major dependency fails. Use timeouts, retries with jitter, circuit breakers, idempotency keys, dead-letter queues, health checks, failover, and degraded modes. Also mention observability so the team knows when failure is happening.
</details>

<details>
  <summary><strong>How do you avoid overengineering?</strong></summary>

Tie every component to a requirement. If scale is modest, start with a simpler design and explain when you would add complexity. Interviewers usually prefer a design that grows with requirements over a design that adds every possible distributed systems pattern upfront.
</details>

<details>
  <summary><strong>What is a good way to wrap up a system design answer?</strong></summary>

Summarize the architecture, the main data flow, key tradeoffs, bottlenecks, and next improvements. A good wrap-up shows ownership: you understand what the design handles well and where it still has risk.
</details>

---

## System Design Concept Checks {#system-design-concept-checks}

These are closer to concept questions an interviewer might ask directly. They are not full scenario prompts, but they test whether you understand common building blocks and their tradeoffs.

<details>
  <summary><strong>What is the difference between vertical scaling and horizontal scaling?</strong></summary>

Vertical scaling means making one machine bigger: more CPU, memory, disk, or network. It is simple but has an upper limit and can become expensive. Horizontal scaling means adding more machines and distributing traffic or data across them. It scales further, but introduces coordination, load balancing, partitioning, and failure handling.
</details>

<details>
  <summary><strong>What is the difference between replication and sharding?</strong></summary>

Replication copies the same data to multiple nodes. It improves read capacity, availability, and failover. Sharding splits different data across different nodes. It improves write capacity and total storage capacity. Replication answers "how do we copy data?" Sharding answers "how do we divide data?"
</details>

<details>
  <summary><strong>What is consistent hashing and why is it useful?</strong></summary>

Consistent hashing maps keys and servers onto a logical ring so keys move minimally when servers are added or removed. It is useful for distributed caches, storage partitions, and load distribution because it avoids remapping almost every key during scaling events.
</details>

<details>
  <summary><strong>What is the difference between strong consistency and eventual consistency?</strong></summary>

Strong consistency means reads return the latest committed write, which is important for payments, inventory, bookings, and account balances. Eventual consistency means replicas may temporarily disagree but converge later, which is often acceptable for feeds, counters, search indexes, notifications, and analytics. Strong consistency is easier to reason about but can cost latency and availability.
</details>

<details>
  <summary><strong>What is idempotency and why does it matter?</strong></summary>

An idempotent operation can be retried safely without applying the side effect twice. This matters because distributed systems retry after timeouts, network failures, and worker crashes. Payment creation, order submission, ticket booking, and message delivery often need idempotency keys.
</details>

<details>
  <summary><strong>What is backpressure?</strong></summary>

Backpressure is a way for overloaded parts of a system to slow down or reject incoming work instead of failing completely. Queues, rate limits, bounded worker pools, load shedding, and retry-after responses are common backpressure tools.
</details>

<details>
  <summary><strong>What is the difference between a queue and a pub/sub stream?</strong></summary>

A queue usually distributes each message to one worker from a consumer group, which is useful for background jobs. A pub/sub stream lets multiple independent consumers process the same event, which is useful for fanout, analytics, search indexing, notifications, and audit pipelines.
</details>

<details>
  <summary><strong>What is cache invalidation?</strong></summary>

Cache invalidation is the process of removing or updating stale cached data after the source of truth changes. Common strategies include TTLs, write-through caching, write-around caching, explicit deletes, versioned keys, and event-driven invalidation. The hard part is balancing freshness, latency, and operational complexity.
</details>

<details>
  <summary><strong>What is a hot partition?</strong></summary>

A hot partition happens when too much traffic goes to one shard, key, tenant, user, or time range. It can overload one database partition even if the total cluster has enough capacity. Fixes include better partition keys, salting, spreading writes, caching hot reads, and isolating heavy tenants.
</details>

<details>
  <summary><strong>What are p50, p95, and p99 latency?</strong></summary>

p50 is the median request latency. p95 means 95% of requests are faster than that value. p99 means 99% are faster and 1% are slower. Tail latency matters because users often feel the slow requests, and multi-service request paths can make p99 much worse.
</details>

---

## Scenario Practice Questions {#scenario-practice-questions}

These are full scenario-style prompts. The collapsed answer is not the only correct design; it is a structured way to think through scope, Context, Containers, trade-offs, and possible deep dives. Additional sizing-heavy examples appear in [Detailed Scenario Design Checks](#system-design-scenarios).

<details>
  <summary><strong>Design a notification system for email, SMS, and push notifications.</strong></summary>

<div markdown="1">

**Clarify**
- Channels: email, SMS, push, in-app?
- Volume: notifications per second, burst traffic, peak campaigns.
- Priority: transactional vs marketing vs low-priority digest.
- Delivery guarantees: at-least-once, best effort, or exactly-once user experience?
- User controls: preferences, unsubscribe, quiet hours, locale.

**High-Level Design**
- `Notification API` accepts requests and validates payloads.
- `Template Service` renders channel-specific content.
- `Preference Service` filters by user settings and compliance rules.
- `Queue / Stream` buffers work by channel and priority.
- `Delivery Workers` call email/SMS/push providers.
- `Status Store` tracks sent, failed, retried, bounced, or delivered.

**Deep Dive**
- Idempotency keys to avoid duplicate sends.
- Retry with exponential backoff and jitter.
- Dead-letter queue for poison messages.
- Provider fallback for SMS/email vendors.
- Rate limits per provider and per tenant.
- Metrics: send rate, failure rate, provider latency, queue lag.

**Tradeoff**
- Async delivery absorbs spikes and improves reliability, but users may see delayed notifications.

</div>
</details>

<details>
  <summary><strong>Design a rate limiter for an API platform.</strong></summary>

<div markdown="1">

**Clarify**
- Limit subject: user, IP, API key, tenant, endpoint, region.
- Limit type: requests/sec, requests/day, concurrent requests, bandwidth.
- Burst behavior: allow short bursts or enforce strict caps?
- Scope: single region or global?
- Response: hard block, soft throttle, or `429 Too Many Requests`.

**High-Level Design**
- `API Gateway / Middleware` checks the limit before routing.
- `Rate Limit Store` keeps counters or token buckets in Redis.
- `Policy Store` defines limits by tenant, plan, endpoint, or API key.
- `Decision Engine` returns allow, reject, or throttle.
- Response includes quota headers such as remaining limit and reset time.

**Example**
- Requirement: each API key gets `100 requests/minute`, with a small burst allowance.
- Key format: `rate_limit:{api_key}:{endpoint}`.
- On each request, the gateway checks the key before calling the backend.
- If allowed, forward the request and return headers such as:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 73`
  - `X-RateLimit-Reset: 1710000060`
- If rejected, return `429 Too Many Requests` with `Retry-After`.

**Algorithm Choices**

<table class="study-table">
  <thead>
    <tr>
      <th>Algorithm</th>
      <th>How It Works</th>
      <th>Pros</th>
      <th>Cons</th>
      <th>Use When</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Fixed Window Counter</td>
      <td>Count requests in fixed time buckets, e.g. 100 requests from 10:00:00 to 10:00:59.</td>
      <td>Very simple, cheap, easy with Redis <code>INCR</code> + TTL.</td>
      <td>Boundary bursts: user can send 100 requests at 10:00:59 and 100 more at 10:01:00.</td>
      <td>Simple APIs where approximate limiting is acceptable.</td>
    </tr>
    <tr>
      <td>Sliding Window Log</td>
      <td>Store timestamps for each request and remove timestamps older than the window.</td>
      <td>Very accurate.</td>
      <td>High memory cost for busy users because every request timestamp is stored.</td>
      <td>Strict limits for low or moderate traffic keys.</td>
    </tr>
    <tr>
      <td>Sliding Window Counter</td>
      <td>Use current and previous fixed windows, weighted by how far through the current window you are.</td>
      <td>More accurate than fixed window, cheaper than sliding log.</td>
      <td>Still approximate.</td>
      <td>Good default for high-traffic APIs that need smoother limits.</td>
    </tr>
    <tr>
      <td>Token Bucket</td>
      <td>Tokens refill at a steady rate. Each request consumes a token. Requests are rejected when the bucket is empty.</td>
      <td>Allows controlled bursts while enforcing average rate.</td>
      <td>Needs careful bucket size and refill-rate tuning.</td>
      <td>Public APIs where short bursts should be allowed.</td>
    </tr>
    <tr>
      <td>Leaky Bucket</td>
      <td>Requests enter a queue and are processed at a fixed rate, like water leaking from a bucket.</td>
      <td>Smooths traffic and protects downstream services.</td>
      <td>Can add latency; queue overflow still needs rejection.</td>
      <td>When the backend needs a steady request rate.</td>
    </tr>
  </tbody>
</table>

**Deep Dive**
- Atomic Redis operations or Lua scripts to avoid race conditions.
- Token bucket: good default when burst allowance matters.
- Sliding window counter: good default when smoother fairness matters.
- Fixed window: simple, but boundary bursts are possible.
- Sliding window log: accurate, but can be memory-heavy.
- Leaky bucket: smooths backend traffic but may add queueing latency.
- Hot keys for large tenants.
- Local fallback if Redis is unavailable.
- Multi-region limits and eventual consistency.

**Tradeoff**
- Strict global limits are more accurate but add coordination and latency. Approximate local limits are faster but less exact.

</div>
</details>

<details>
  <summary><strong>Design a file storage and sharing service like Google Drive or Dropbox.</strong></summary>

<div markdown="1">

**Clarify**
- File size limit and total storage per user.
- Sharing model: private, link-based, team folders, public links.
- Version history and deletion recovery.
- Desktop/mobile sync and offline support.
- Whether collaborative editing is in scope.

**High-Level Design**
- `Upload API` creates signed upload URLs.
- Client uploads chunks directly to `Object Storage`.
- `Metadata Service` stores folders, file records, owners, permissions, and versions.
- `Sharing Service` handles access rules and public links.
- `Workers` scan files, generate thumbnails, index content, and clean up expired versions.
- `CDN` accelerates downloads and previews.

**Deep Dive**
- Resumable multipart upload.
- Content hash for deduplication.
- Permission checks on every download/share action.
- Versioning and restore.
- Conflict handling for offline sync.
- Lifecycle policies for old versions and deleted files.

**Tradeoff**
- Object storage is scalable and cheap for file bytes, but metadata and permissions need careful consistency.

</div>
</details>

<details>
  <summary><strong>Design a chat system for one-to-one and group messaging.</strong></summary>

<div markdown="1">

**Clarify**
- One-to-one only, groups, or large channels?
- Real-time requirement and offline delivery.
- Message history retention.
- Read receipts, typing indicators, presence.
- Attachments and media.
- End-to-end encryption requirement.

**High-Level Design**
- Clients connect to `WebSocket Gateways`.
- `Message Service` validates, assigns message IDs, and persists messages.
- `Conversation Store` partitions history by conversation ID.
- `Stream / Queue` fans messages out to recipients.
- `Presence Service` tracks online users.
- `Push Notification Service` handles offline delivery.

**Deep Dive**
- Ordering within a conversation.
- Idempotent message send on retry.
- WebSocket connection routing.
- Group fanout strategy for small vs large groups.
- Offline sync from last-read cursor.
- Read receipts and typing events as lightweight ephemeral data.

**Tradeoff**
- Ordering within each conversation is usually enough. Global ordering across all chats is expensive and unnecessary.

</div>
</details>

<details>
  <summary><strong>Design a ticket booking system for concerts or events.</strong></summary>

<div markdown="1">

**Clarify**
- Assigned seats or general admission?
- Event size and expected on-sale spike.
- Hold duration before payment.
- Payment flow and refund/cancellation rules.
- Waiting room or queueing required?
- Resale or ticket transfer support?

**High-Level Design**
- `Catalog Service` serves event and seat-map reads.
- `Waiting Room / Rate Limiter` protects high-demand events.
- `Reservation Service` places short-lived holds on seats.
- `Payment Service` charges the user.
- `Ticket Service` confirms tickets after payment.
- `Notification Service` sends confirmation and receipt.

**Deep Dive**
- Seat inventory and locking model.
- Hold expiration with TTL.
- Payment idempotency.
- Recovery when payment succeeds but ticket confirmation fails.
- Fraud checks and bot protection.
- Read replicas/cache for event browsing.

**Tradeoff**
- Seat ownership needs strong consistency. Browsing, recommendations, and confirmation emails can be eventually consistent.

</div>
</details>

<details>
  <summary><strong>Design a video streaming service.</strong></summary>

<div markdown="1">

**Clarify**
- Upload + watch, or watch-only?
- Video length and quality levels.
- Global audience and CDN requirements.
- Live streaming in scope?
- Recommendations, comments, likes, watch history.
- Copyright, moderation, and private videos.

**High-Level Design**
- `Upload Service` stores raw video in object storage.
- `Transcoding Queue` triggers async processing.
- `Transcoding Workers` generate multiple renditions and thumbnails.
- `Metadata Store` tracks video title, owner, status, renditions, visibility.
- `Playback Service` returns manifests and signed CDN URLs.
- `CDN` serves video chunks close to users.

**Deep Dive**
- Chunked upload and resumability.
- Adaptive bitrate streaming.
- Transcoding failure/retry.
- CDN cache behavior.
- Authorization for private videos.
- Watch history and analytics pipeline.

**Tradeoff**
- Pre-transcoding multiple renditions improves playback quality and latency, but increases storage and processing cost.

</div>
</details>

<details>
  <summary><strong>Design a collaborative document editor.</strong></summary>

<div markdown="1">

**Clarify**
- Real-time collaboration or async editing?
- Max collaborators per document.
- Offline editing and merge requirements.
- Version history and comments.
- Permissions: owner, editor, viewer.
- Rich media support.

**High-Level Design**
- `Document Service` stores metadata, permissions, and snapshots.
- Clients connect to `Collaboration Service` over WebSocket.
- Edits are sent as operations and ordered per document.
- Active collaborators receive broadcast updates.
- `Snapshot Worker` periodically compacts operation logs into snapshots.
- `Version Store` keeps history and restore points.

**Deep Dive**
- Operational transform or CRDTs.
- Operation ordering and conflict resolution.
- Reconnect and replay from last known version.
- Presence and cursor positions.
- Offline merge.
- Permission enforcement on every session.

**Tradeoff**
- Real-time editing improves UX, but conflict resolution and offline support are complex.

</div>
</details>

<details>
  <summary><strong>Design a leaderboard for a game.</strong></summary>

<div markdown="1">

**Clarify**
- Global, regional, friend-based, or seasonal leaderboard?
- Real-time ranking or periodic updates?
- Score write frequency.
- Tie-breaking rules.
- Anti-cheat requirements.
- Historical rankings needed?

**High-Level Design**
- `Score API` receives score submissions from game servers.
- `Validation Service` checks score legitimacy.
- `Leaderboard Store` uses Redis sorted sets for current rankings.
- `Event Store` persists score events for audit and replay.
- `Snapshot Job` saves historical leaderboard states.

**Deep Dive**
- Partition by game, region, season, or mode.
- Idempotent score updates.
- Best score vs latest score.
- Rank lookup by user.
- Cache rebuild from durable events.
- Suspicious score detection.

**Tradeoff**
- Redis gives fast rank reads, but durable event storage is needed for recovery and fraud investigation.

</div>
</details>

<details>
  <summary><strong>Design a web crawler for indexing websites.</strong></summary>

<div markdown="1">

**Clarify**
- Crawl scope: one site, many sites, or the public web?
- Freshness target.
- Robots.txt and politeness requirements.
- Duplicate handling.
- Output: search index, analytics, or archive.
- Dynamic pages in scope?

**High-Level Design**
- `Seed URL Store` starts the crawl.
- `Frontier Queue` prioritizes URLs.
- `Crawler Workers` fetch pages with per-domain throttling.
- `Parser` extracts links and page content.
- `Dedup Service` normalizes URLs and checks content hashes.
- `Object Storage` keeps raw pages; `Index Pipeline` processes parsed documents.

**Deep Dive**
- URL normalization.
- Per-host rate limits.
- Robots.txt caching.
- Retry and timeout policy.
- Duplicate page detection.
- Crawl priority and recrawl scheduling.

**Tradeoff**
- Crawling faster improves freshness, but can violate politeness rules or overload target sites.

</div>
</details>

<details>
  <summary><strong>Design an autocomplete service for a search box.</strong></summary>

<div markdown="1">

**Clarify**
- Latency target, usually very low.
- Data source: search logs, product names, locations, documents.
- Personalization required?
- Typo tolerance and multilingual support.
- Update frequency and freshness.
- Query volume and peak traffic.

**High-Level Design**
- `Ingestion Job` collects candidate suggestions.
- `Ranking Job` scores by popularity, freshness, and business rules.
- `Suggestion Index` stores prefix-searchable terms.
- `Autocomplete API` serves top suggestions with low latency.
- `Cache` stores hot prefixes.

**Deep Dive**
- Trie, prefix index, or search engine.
- Hot prefix caching.
- Ranking and filtering.
- Bad-query and abuse filtering.
- Incremental index updates.
- p99 latency monitoring.

**Tradeoff**
- A precomputed index is fast, but fresh trends may lag unless incremental updates are supported.

</div>
</details>


---

## Detailed Scenario Design Checks {#system-design-scenarios}

These detailed examples preserve the useful sizing and data-flow analysis from the former Hourglass page. Start each one with Context and Container diagrams, then use the table to test the design. The concern rows are **not** C4 levels; they are checks applied to elements at the appropriate zoom.

---

### Scenario 1: Realtime Temperature Monitoring (IoT Sensors) {#scenario-1-realtime-temperature-monitoring-iot-sensors}

**Goal**: Build a system for **1M IoT devices** reporting temperature every 10s across NSW.
- **Realtime heatmap** (~10s latency)
- **Historical dashboard** (daily/weekly/monthly)
- **Retention**: 6 months

**Data A → Data B**

- **Data A:** raw sensor readings: `device_id`, timestamp, temperature, and device metadata.
- **Data B:** live regional heatmap cells, historical aggregates, alertable trends, and dashboard-ready time-series views.

<table class="study-table">
<thead>
<tr>
<th>Design Concern</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Context: source</strong></td>
<td>One sensor publishes one reading over MQTT<br>Single-device payload: <code>{ device_id, lat, lon, timestamp, temperature }</code></td>
<td>Estimate one reading first: <code>device_id</code> (<code>8 B</code>) + lat/lon doubles (<code>16 B</code>) + temperature double (<code>8 B</code>) + timestamp (<code>8 B</code>) = ~40 B before overhead. JSON is often ~100-200 B because field names and punctuation are included.</td>
</tr>
<tr>
<td><strong>Container: data type</strong></td>
<td>Structured time-series across 1M devices<br>1M devices / 10s = ~100K readings/sec<br>Fixed schema with timestamp, location, and numeric temperature<br>JSON at ingest → binary at storage</td>
<td>Type scales the single reading: ~100K readings/sec × 86,400 sec ≈ 8.64B readings/day. At ~100 B each, raw ingest is ~864 GB/day before replicas and indexes.</td>
</tr>
<tr>
<td><strong>Container: storage</strong></td>
<td>Realtime latest-value table (~16 MB)<br>Daily aggregation (~2.9 GB / 180 days)<br>Metadata (~20 MB)<br>Raw readings optional: much larger if retained</td>
<td>Storage follows retention: latest-value storage stays tiny, aggregate storage is compact, but retaining all raw readings for 180 days would be ~155 TB before replicas/indexes.</td>
</tr>
<tr>
<td><strong>Container/Component: transformation</strong></td>
<td>Realtime updates per reading<br>Daily min/max aggregation<br>Redis for fast compare<br>Batch writes → TimescaleDB</td>
<td>Low latency ingest + efficient aggregation</td>
</tr>
<tr>
<td><strong>Container: access pattern</strong></td>
<td>REST polling every 10s (map)<br>REST queries (historical)</td>
<td>Polling is simple, cost-efficient for low concurrency</td>
</tr>
<tr>
<td><strong>Context/Container: delivery</strong></td>
<td>Web map grid updated every 10s<br>Historical dashboard with calendar filter</td>
<td>Lightweight visualization for end users</td>
</tr>
<tr>
<td><strong>Cross-cutting: security</strong></td>
<td>No login<br>API throttling (CloudFront + WAF)<br>MQTT cert-based auth</td>
<td>Basic protection, open data model</td>
</tr>
<tr>
<td><strong>Cross-cutting: scalability</strong></td>
<td>~100K writes/sec<br>Kafka/Kinesis buffer<br>Partition DB by device_id + time<br>Stateless API, autoscaling</td>
<td>Horizontal scalability and decoupling</td>
</tr>
<tr>
<td><strong>Cross-cutting: reliability</strong></td>
<td>MQTT at-least-once<br>Retry pipeline<br>Re-runnable daily jobs</td>
<td>Ensures data completeness under failure</td>
</tr>
<tr>
<td><strong>Cross-cutting: observability</strong></td>
<td>Metrics: ingest rate, write latency, last_seen<br>Logs: ingestion + API</td>
<td>Full visibility into data pipeline health</td>
</tr>
<tr>
<td><strong>Deployment view</strong></td>
<td>AWS IoT Core or EMQX → Kinesis/Kafka → ECS/Fargate → TimescaleDB<br>IaC: Terraform/CDK</td>
<td>Cloud-native, modular, reproducible</td>
</tr>
</tbody>
</table>

---

### Scenario 2: Twitter-like Microblogging Platform {#scenario-2-twitter-like-microblogging-platform}

**Goal**: Design a social platform similar to Twitter.
- **Realtime feed updates**
- **Millions of posts/day**
- **Support search, hashtags, user timelines**

**Data A → Data B**

- **Data A:** user actions: posts, likes, follows, replies, media uploads, hashtags, and mentions.
- **Data B:** personalized timelines, searchable posts, notifications, counters, and profile/user timeline views.

<table class="study-table">
<thead>
<tr>
<th>Design Concern</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Context: source</strong></td>
<td>One user emits one action: create post, like, follow, reply, or upload media<br>Example post payload: <code>{ author_id, text, media_ids, created_at }</code></td>
<td>Estimate one post first: IDs/timestamp are ~24 B, 280 chars of English UTF-8 is ~280 B, worst-case UTF-8 can be ~1.1 KB, and media pointers/counters add tens to hundreds of bytes.</td>
</tr>
<tr>
<td><strong>Container: data type</strong></td>
<td>Mixed event stream across millions of users<br>Post, like, follow, reply, and media events have related but different schemas<br>Text fields need UTF-8 sizing; hashtags/mentions become indexed fields</td>
<td>Type scales the event family: a post metadata row is roughly ~0.5-2 KB. At 10M posts/day and ~1 KB average, post metadata is ~10 GB/day before indexes.</td>
</tr>
<tr>
<td><strong>Container: storage</strong></td>
<td>OLTP DB (Postgres/CockroachDB) for metadata<br>Object store (S3) for media<br>ElasticSearch for search/index</td>
<td>Storage separates workloads: if 10% of 10M posts include 1 MB media, media adds ~1 TB/day, which dominates metadata storage.</td>
</tr>
<tr>
<td><strong>Container/Component: transformation</strong></td>
<td>Fanout service builds timelines<br>Kafka for async event distribution</td>
<td>Logic can multiply writes: 10M posts/day × 200 followers average ≈ 2B timeline write events/day, so fanout should be async.</td>
</tr>
<tr>
<td><strong>Container: access pattern</strong></td>
<td>REST (post, follow)<br>WebSocket/GraphQL (feed updates)</td>
<td>REST reliable for writes; streaming API for low-latency feeds</td>
</tr>
<tr>
<td><strong>Context/Container: delivery</strong></td>
<td>Web + mobile apps<br>Infinite scroll timeline, notifications</td>
<td>Optimized UX for engagement</td>
</tr>
<tr>
<td><strong>Cross-cutting: security</strong></td>
<td>OAuth2 login<br>Rate limiting (API Gateway)<br>WAF for spam</td>
<td>Standard identity + abuse protection</td>
</tr>
<tr>
<td><strong>Cross-cutting: scalability</strong></td>
<td>Sharded user/tweet DB<br>CDN for media<br>Async fanout to caches</td>
<td>Ensures horizontal scale to millions of users</td>
</tr>
<tr>
<td><strong>Cross-cutting: reliability</strong></td>
<td>Durable Kafka log<br>Retry for writes<br>Timeline cache fallback</td>
<td>Feed always eventually consistent</td>
</tr>
<tr>
<td><strong>Cross-cutting: observability</strong></td>
<td>Metrics: post latency, fanout lag<br>Logs: auth, API, feed delivery</td>
<td>Critical for SLO monitoring</td>
</tr>
<tr>
<td><strong>Deployment view</strong></td>
<td>AWS: API Gateway + Lambda/ECS, DynamoDB/Postgres, S3, ElasticSearch</td>
<td>Mix of serverless + managed DB for scale</td>
</tr>
</tbody>
</table>

---

### Scenario 3: eCommerce Platform {#scenario-3-ecommerce-platform}

**Goal**: Design a modern eCommerce system.
- **Product catalog, cart, checkout**
- **User accounts, payments**
- **Scalable search + inventory**

**Data A → Data B**

- **Data A:** product updates, browsing events, cart changes, checkout requests, inventory changes, and payment callbacks.
- **Data B:** searchable catalog pages, available inventory, cart state, confirmed orders, receipts, and fulfillment events.

<table class="study-table">
<thead>
<tr>
<th>Design Concern</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Context: source</strong></td>
<td>One producer emits one event: product update, product view, add-to-cart, checkout request, inventory update, or payment callback</td>
<td>Estimate one product record first: IDs and numeric fields are small, title is ~100 B, description can be ~1-4 KB, attributes JSON ~0.5-3 KB, and media URLs ~300 B-1 KB.</td>
</tr>
<tr>
<td><strong>Container: data type</strong></td>
<td>Structured event families: product/catalog records, cart events, order commands, inventory mutations, payment callbacks<br>Catalog is read-heavy; checkout/payment is correctness-heavy</td>
<td>Type separates scale profiles: catalog rows are often ~2-10 KB, cart events are small and ephemeral, while checkout/payment events need strict validation.</td>
</tr>
<tr>
<td><strong>Container: storage</strong></td>
<td>RDBMS (Aurora/MySQL) for orders/payments<br>DynamoDB for cart sessions<br>S3 for product media</td>
<td>Storage follows object type: 1M products × ~5 KB average ≈ 5 GB catalog metadata, while 1M × 3 images × 500 KB ≈ 1.5 TB media.</td>
</tr>
<tr>
<td><strong>Container/Component: transformation</strong></td>
<td>Inventory service decrements stock<br>Async order events via SNS/SQS</td>
<td>Checkout math drives correctness: 10K checkout/min ≈ 167 checkout/sec, but browsing/search reads may be 100x higher.</td>
</tr>
<tr>
<td><strong>Container: access pattern</strong></td>
<td>REST (catalog, cart, order)<br>GraphQL (flexible queries for product search)</td>
<td>REST for critical workflows; GraphQL for frontend flexibility</td>
</tr>
<tr>
<td><strong>Context/Container: delivery</strong></td>
<td>Web + mobile storefront<br>Search, cart, checkout flows</td>
<td>Responsive UX, optimized conversions</td>
</tr>
<tr>
<td><strong>Cross-cutting: security</strong></td>
<td>OAuth2 login, MFA for admin<br>PCI-DSS compliant payment handling<br>WAF + Shield</td>
<td>Protects sensitive user/payment data</td>
</tr>
<tr>
<td><strong>Cross-cutting: scalability</strong></td>
<td>Autoscaling ALB/NLB<br>ElasticSearch for catalog search<br>CDN for static assets</td>
<td>Handles traffic spikes during sales</td>
</tr>
<tr>
<td><strong>Cross-cutting: reliability</strong></td>
<td>Multi-AZ RDS<br>Order queue with DLQ<br>Event replay for payments</td>
<td>Ensures orders are never lost</td>
</tr>
<tr>
<td><strong>Cross-cutting: observability</strong></td>
<td>Metrics: checkout latency, error rate<br>Logs: API + payment gateway</td>
<td>Monitors user impact and failures</td>
</tr>
<tr>
<td><strong>Deployment view</strong></td>
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

**Data A → Data B**

- **Data A:** long URL, owner, optional alias/TTL, redirect request, and click metadata such as timestamp, referrer, device, and geo.
- **Data B:** short code mapping, low-latency redirect response, QR/shareable link, and aggregated click analytics.

<table class="study-table">
<thead>
<tr>
<th>Design Concern</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Context: source</strong></td>
<td>One client request creates a mapping or resolves a code<br>Create payload: <code>{ long_url, owner_id, ttl }</code><br>Redirect request: <code>GET /{code}</code></td>
<td>Estimate one mapping first: short code is 7 ASCII chars (~7 B), owner ID is ~8 B, timestamps/TTL ~16 B, and long URL is often ~100-2,000 chars.</td>
</tr>
<tr>
<td><strong>Container: data type</strong></td>
<td>Two main data shapes: mapping records and click events<br>Mapping records are small but durable; click events are append-only and much higher volume</td>
<td>Type separates durable mappings from click logs: mapping rows are often ~200 B-2 KB, while click events with IP/referrer/user-agent/geo are often ~300 B-1 KB.</td>
</tr>
<tr>
<td><strong>Container: storage</strong></td>
<td>DynamoDB (PK=code) for mapping; S3 for logs</td>
<td>Storage separates hot lookups and analytics: 100M URLs × ~500 B ≈ 50 GB mapping metadata; 1B click logs/day × ~500 B ≈ 500 GB/day in logs.</td>
</tr>
<tr>
<td><strong>Container/Component: transformation</strong></td>
<td>Code gen via base62/ULID; optional custom alias; async analytics (Kinesis)</td>
<td>Code-space math guides collision strategy: 62^7 ≈ 3.5T possible codes, enough for 100M URLs with a large safety margin.</td>
</tr>
<tr>
<td><strong>Container: access pattern</strong></td>
<td>REST + 301/302 redirect; rate-limits per owner</td>
<td>Browser-native redirect semantics; abuse protection</td>
</tr>
<tr>
<td><strong>Context/Container: delivery</strong></td>
<td>Simple web console + CLI; QR export</td>
<td>Low-friction creation and sharing</td>
</tr>
<tr>
<td><strong>Cross-cutting: security</strong></td>
<td>Auth (API keys/OAuth); domain allowlist; malware scanning</td>
<td>Prevents phishing/abuse; protects brand domains</td>
</tr>
<tr>
<td><strong>Cross-cutting: scalability</strong></td>
<td>CloudFront → Lambda@Edge redirect cache; hot keys sharded</td>
<td>Edge-cached redirects minimize origin load/latency</td>
</tr>
<tr>
<td><strong>Cross-cutting: reliability</strong></td>
<td>Multi-Region table (global tables); DLQ for failed writes</td>
<td>Regional failover; durable retry</td>
</tr>
<tr>
<td><strong>Cross-cutting: observability</strong></td>
<td>Metrics: p50/p99 redirect latency, 4xx/5xx; click streams</td>
<td>Track UX and abuse; support analytics</td>
</tr>
<tr>
<td><strong>Deployment view</strong></td>
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

**Data A → Data B**

- **Data A:** raw documents, webpages, titles, body text, metadata, facets, links, and uploaded files.
- **Data B:** searchable index entries, ranked result sets, highlighted snippets, facets, autosuggest terms, and vector-search candidates.

<table class="study-table">
<thead>
<tr>
<th>Design Concern</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Context: source</strong></td>
<td>One crawler fetch, webhook event, or batch upload produces one raw document or document update</td>
<td>Estimate one document first: document ID ~8-16 B, title ~100 B, body text often ~10 KB, facets/tags ~100-500 B, URL ~100-2,000 chars, metadata JSON ~0.5-2 KB.</td>
</tr>
<tr>
<td><strong>Container: data type</strong></td>
<td>Document corpus across many sources<br>Fields include title, body, URL, facets, metadata, language, and optional embedding</td>
<td>Type scales one document into a corpus: use ~10-20 KB per raw document for rough sizing; fields support keyword, filter, ranking, and vector search.</td>
</tr>
<tr>
<td><strong>Container: storage</strong></td>
<td>OpenSearch/Elastic (inverted index) + vector index; S3 cold store</td>
<td>Storage can rival raw content: 100M docs × 10 KB ≈ 1 TB raw; search index may add ~300 GB-1 TB; 768-dim float vectors add ~307 GB before index overhead.</td>
</tr>
<tr>
<td><strong>Container/Component: transformation</strong></td>
<td>ETL: clean, dedupe, tokenize, embed; incremental indexing</td>
<td>Higher relevance; fast refresh with partial updates</td>
</tr>
<tr>
<td><strong>Container: access pattern</strong></td>
<td>Search REST: q, filters, sort; autosuggest endpoint</td>
<td>Standard search UX; low-latency responses</td>
</tr>
<tr>
<td><strong>Context/Container: delivery</strong></td>
<td>Web UI: search box, facets, highlighting; pagination</td>
<td>Discoverability and relevance feedback</td>
</tr>
<tr>
<td><strong>Cross-cutting: security</strong></td>
<td>Signed requests; per-tenant filter; index-level RBAC</td>
<td>Isolation and least privilege</td>
</tr>
<tr>
<td><strong>Cross-cutting: scalability</strong></td>
<td>Sharded indexes; warm replicas; query cache/CDN for hot queries</td>
<td>Throughput and low tail latency</td>
</tr>
<tr>
<td><strong>Cross-cutting: reliability</strong></td>
<td>Multi-AZ cluster; snapshot to S3; blue/green index swaps</td>
<td>Safe reindex; fast recovery</td>
</tr>
<tr>
<td><strong>Cross-cutting: observability</strong></td>
<td>Metrics: QPS, p99, recall@k/CTR; slow logs; relevancy dashboards</td>
<td>Quality and performance tuning</td>
</tr>
<tr>
<td><strong>Deployment view</strong></td>
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

**Data A → Data B**

- **Data A:** driver locations, rider pickup/dropoff requests, driver availability, trip events, traffic signals, and payment events.
- **Data B:** nearby driver candidates, match decisions, ETA, price quote, live trip state, route updates, and notifications.

<table class="study-table">
<thead>
<tr>
<th>Design Concern</th>
<th>Design Choice</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Context: source</strong></td>
<td>One mobile app emits one event: driver location update, rider request, driver accept, trip status update, or payment event</td>
<td>Estimate one location event first: driver ID ~8 B, lat/lon ~8-16 B, timestamp ~8 B, speed/heading/status ~10-30 B, request metadata ~20-100 B.</td>
</tr>
<tr>
<td><strong>Container: data type</strong></td>
<td>Regional event stream across active riders and drivers<br>Location events are high-frequency; trip/payment events are lower-frequency but more correctness-sensitive</td>
<td>Type separates high-volume telemetry from durable lifecycle events: compact location events are ~60-150 B, while JSON events are often ~150-300 B.</td>
</tr>
<tr>
<td><strong>Container: storage</strong></td>
<td>Redis/KeyDB (geo sets) for live locations; Postgres for trips/payments; S3 for telemetry</td>
<td>Storage follows frequency: 100K active drivers / 5s = 20K location writes/sec; at ~150 B each ≈ 3 MB/sec, ~259 GB/day before replicas/log overhead.</td>
</tr>
<tr>
<td><strong>Container/Component: transformation</strong></td>
<td>Stream (Kafka): location smoothing, ETA calc, surge pricing; ML for ETA/dispatch</td>
<td>Logic should stay regional: dispatch queries nearby drivers by city/zone rather than scanning the global location set.</td>
</tr>
<tr>
<td><strong>Container: access pattern</strong></td>
<td>REST: request/cancel trip, quote; WebSocket: live driver ETA/track</td>
<td>Seamless UX for requests + realtime updates</td>
</tr>
<tr>
<td><strong>Context/Container: delivery</strong></td>
<td>Mobile map with live driver markers; push notifications</td>
<td>High-frequency updates with low battery impact</td>
</tr>
<tr>
<td><strong>Cross-cutting: security</strong></td>
<td>JWT auth; signed location updates; fraud detection rules</td>
<td>Protects users and platform integrity</td>
</tr>
<tr>
<td><strong>Cross-cutting: scalability</strong></td>
<td>Region-sharded dispatch; partition by city/zone; edge caches for maps/tiles</td>
<td>Reduces cross-region chatter; scales horizontally</td>
</tr>
<tr>
<td><strong>Cross-cutting: reliability</strong></td>
<td>Leader election per region; idempotent trip ops; DLQs for events</td>
<td>Failover and consistent trip lifecycle</td>
</tr>
<tr>
<td><strong>Cross-cutting: observability</strong></td>
<td>Metrics: match time, cancel rate, ETA error; traces for dispatch path</td>
<td>Operational and model quality monitoring</td>
</tr>
<tr>
<td><strong>Deployment view</strong></td>
<td>API Gateway + ECS/EKS, Redis Geo, Kafka, Postgres/Aurora, S3, CloudFront, Pinpoint/SNS</td>
<td>Mix of in-memory geo + durable stores</td>
</tr>
</tbody>
</table>
