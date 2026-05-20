---
title: Interview Tips
permalink: /study/systemDesignInterviewTips
---

# Interview Tips {#interview-tips}

System design interviews are not speed tests. Answering fast does not give extra points if the design is shallow, unscoped, or ignores tradeoffs. Interviewers usually care more about how you reason: whether you ask the right questions, make explicit assumptions, compare options, and adjust when new constraints appear.

The goal is not to build a perfect real-world production system in 45 minutes. The goal is to show a clear design process.

---

## Core Mindset {#core-mindset}

- Do not jump straight into solution mode.
- Do not think in silence; explain what you are considering.
- Always clarify the problem before drawing.
- Ask at least 10 useful questions before committing to a design.
- Make assumptions explicit when the interviewer does not provide an answer.
- Treat the interviewer like a teammate, not a judge waiting for one exact answer.
- Prefer tradeoffs over absolute claims. Say what each option improves and what it costs.
- Start broad, then go deep only after the interviewer agrees on the high-level shape.

---

## Step 1: Understand the Problem and Establish Scope {#step-1-understand-the-problem-and-establish-scope}

Ask the right questions, make reasonable assumptions, and gather the information needed to design the system. You are not expected to build every detail of a real-world product; you are being evaluated on process, prioritization, and engineering judgment.

Good scoping questions:

- What specific features are we building?
- Which features are explicitly out of scope?
- Is this for mobile, web, internal users, external users, or all of them?
- How many users does the product have today?
- How many daily active users, monthly active users, or requests per second should we expect?
- How fast does the company expect to scale? What are the expected numbers in 3 months, 6 months, and 1 year?
- Is the workload read-heavy, write-heavy, or balanced?
- What latency target matters to users?
- What availability target matters to the business?
- What data must be durable?
- What data can be eventually consistent?
- Are there privacy, compliance, or security requirements?
- What is the existing technology stack?
- Are there existing services we should reuse to simplify the design?
- Which part of the system is most important to optimize: cost, speed, reliability, developer velocity, or correctness?

After asking, summarize the scope:

```
I will design X for Y users, supporting A, B, and C features.
I will assume read traffic is higher than write traffic.
I will prioritize availability and low read latency over strict consistency.
```

---

## Step 2: Propose a High-Level Design and Get Buy-In {#step-2-propose-a-high-level-design-and-get-buy-in}

Collaborate with the interviewer. Come up with an initial blueprint, ask for feedback, and make sure you are both solving the same problem before going deeper.

What to do:

- Draw a box diagram with the key components.
- List the high-level areas before deep diving: API, data model, storage, cache, async processing, scaling, reliability, observability.
- Show the main request flow from client to backend to storage.
- Separate read path and write path if they differ.
- Identify the API boundary.
- Identify storage choices and why they fit the access pattern.
- Do quick back-of-the-envelope calculations to evaluate scale.
- Mention the main use cases and walk one or two through the design.
- Ask: "Does this high-level direction match what you want me to focus on?"

Useful structure:

```
Client -> API Gateway / Load Balancer -> Service Layer -> Storage
                                      -> Cache
                                      -> Queue / Stream
                                      -> Workers
                                      -> Search / Analytics
```

Use [Numbers That Matter](/study/systemDesignNumbersThatMatter) for quick sizing estimates.

---

## Step 3: Design Deep Dive {#step-3-design-deep-dive}

At this stage, you and the interviewer should be on the same wavelength. Now identify the most important components and go deeper.

Do not get carried away with unnecessary implementation details. This is a system design interview, not a framework or syntax interview. Go deep where the design risk is highest.

Good areas to deep dive:

- Data model and key entities.
- API contracts for critical flows.
- Database choice and indexing strategy.
- Cache strategy and invalidation.
- Queue or stream processing.
- Partitioning and sharding.
- Consistency model.
- Rate limiting and abuse protection.
- Failure handling and retries.
- Observability: metrics, logs, tracing, alerts.
- Deployment and rollback strategy.

How to choose the deep dive:

1. List the high-level areas first.
2. Ask the interviewer what they want to focus on.
3. If they do not specify, pick the most important area and deep dive confidently.

```
The riskiest part of this design is X because Y.
I will focus there first unless you would rather explore another part.
```

---

## Step 4: Wrap Up {#step-4-wrap-up}

The interviewer may ask you to identify bottlenecks and discuss improvements. A strong wrap-up shows that you understand the design is not finished just because the boxes are drawn.

Cover:

- Recap the design in 30-60 seconds.
- Identify likely bottlenecks.
- Discuss error cases and failure modes.
- Mention operational concerns: monitoring, logs, alerts, CI/CD, rollback.
- Explain what you would improve next with more time.
- Revisit tradeoffs: what the design optimizes for and what it sacrifices.

Good closing sentence:

```
This design prioritizes fast reads and high availability. The main tradeoff is extra complexity around cache invalidation and async processing. If we had more time, I would go deeper into failure recovery and data consistency.
```

---

## DOs {#dos}

- Always ask for clarification.
- Understand the requirements before designing.
- Repeat the requirements back to confirm alignment.
- Let the interviewer know what you are thinking.
- Suggest multiple approaches when there is a meaningful tradeoff.
- Start with the big picture first.
- List the possible deep-dive areas before choosing one.
- Ask the interviewer where they want to go deeper.
- Go into component detail only after the high-level design is agreed.
- Bounce ideas off the interviewer.
- Use rough numbers to test whether the design is plausible.
- Call out tradeoffs explicitly.

---

## DON'Ts {#donts}

- Do not jump into solution mode immediately.
- Do not silently draw for several minutes.
- Do not optimize for one requirement while ignoring others.
- Do not pretend a design has no tradeoffs.
- Do not dive into database schema, class design, or code too early.
- Do not choose technology because it is popular; connect it to the access pattern and constraints.
- Do not spend the whole interview on one component unless the interviewer asks for it.

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

These are full scenario-style prompts. The collapsed answer is not the only correct design; it is a structured way to think through scope, high-level architecture, tradeoffs, and deep-dive topics. This list avoids the detailed scenarios already covered in [Hourglass Design](/study/systemDesignHourglass).

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
