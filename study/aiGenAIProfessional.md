---
title: AWS AIP-C01 Architecture Decision Guide
permalink: /study/aiGenAIProfessional
---

# AWS AIP-C01 Architecture Decision Guide

Prepare for **AWS Certified Generative AI Developer – Professional (AIP-C01)** as an architecture and production-integration exam. This page assumes the concepts from the dedicated [AI learning pages](/study/#ai), then brings them together as one architecture journey: begin with a simple model request, change the design as requirements appear, and defend each choice against plausible alternatives.

**Blueprint checked: 11 September 2026.** The current guide has five domains: Foundation Model Integration, Data Management, and Compliance (31%); Implementation and Integration (26%); AI Safety, Security, and Governance (20%); Operational Efficiency and Optimization (12%); and Testing, Validation, and Troubleshooting (11%). It validates integration of foundation models into production applications and business workflows. [Current AIP-C01 exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html).

> **The governing rule:** identify the decisive constraint first. Requirements beat defaults, rules of thumb, and fashionable architectures.

## 1. How to think in this exam {#how-to-think}

The exam is mostly not asking:

> What does service X do?

It is asking:

> Given requirements A, B, and C, which architecture satisfies them with the right cost, security, operational-overhead, latency, and reliability trade-offs?

<figure class="aws-architecture" aria-labelledby="decision-pass-caption">
  <div class="aws-architecture__title">The architecture decision pass<span class="aws-architecture__subtitle">Move from the requirement to the service—not the other way around.</span></div>
  <div class="aws-flow">
    <div class="aws-node aws-node--person"><span class="aws-person-mark">1</span><strong>Requirements</strong><small>What must the system do?</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--security"><span class="aws-person-mark">2</span><strong>Decisive constraint</strong><small>Which condition rules choices in or out?</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--integration"><span class="aws-person-mark">3</span><strong>Pattern</strong><small>Request, queue, event, workflow, agent, RAG, stream, or batch?</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--compute"><span class="aws-person-mark">4</span><strong>AWS services</strong><small>Which managed components implement the pattern?</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--ai"><span class="aws-person-mark">5</span><strong>Defend the choice</strong><small>State the trade-off and reject the runner-up.</small></div>
  </div>
  <figcaption id="decision-pass-caption">Professional-level questions test the reasoning chain. A familiar service is not the answer until the requirement makes it the right fit.</figcaption>
</figure>

Use this pass on every scenario:

1. **Underline hard constraints:** data location, approval, latency, duration, throughput, tenancy, recovery, and delivery mode.
2. **Rank soft goals:** cost, development effort, and operational overhead matter only after the hard constraints are met.
3. **Choose the pattern before the product:** synchronous request, durable workflow, queue, event bus, agent, RAG, stream, or batch.
4. **Attach controls:** identity, authorization, network path, encryption, safety, audit, monitoring, and retention.
5. **Defeat the runner-up:** name the requirement it violates or the unnecessary cost/complexity it adds.

Professional-exam qualifiers are deliberate:

| Wording | What to optimize after all hard requirements are satisfied |
|---|---|
| **MOST operationally efficient / LEAST operational overhead** | Prefer an appropriate managed integration; avoid owning schedulers, workers, clusters, or retry state without a requirement. |
| **MOST cost-effective** | Match billing to utilization; include idle capacity, token use, storage, data transfer, and operator time. |
| **LOWEST latency** | Separate time to first token, end-to-end latency, retrieval latency, and queue delay. |
| **MOST resilient** | Isolate failure, persist state, retry safely, absorb bursts, and provide fallbacks or graceful degradation. |
| **MOST secure** | Use least privilege, trusted authorization boundaries, private paths where required, encryption, safe logging, and defense in depth. |
| **Meets data residency requirements** | Determine exactly where processing, stored copies, logs, indexes, backups, and retained inference data may exist. |
| **Requires minimal development effort** | Prefer the service that natively supplies the required capability, provided it still meets control and flexibility needs. |

These are tiebreakers, not magic words. “Least operational overhead” does not make Lambda correct for a long-running stateful service; “most cost-effective” does not permit data to leave an approved geography.

## 2. Begin with the simplest architecture {#default-architecture}

Begin with one bounded synchronous request. This is a useful starting picture—not a universal answer. The rest of the page changes this architecture one requirement at a time.

<figure class="aws-architecture" aria-labelledby="baseline-caption">
  <div class="aws-architecture__title">Starting architecture: one synchronous model request<span class="aws-architecture__subtitle">The application validates the request, invokes the model, and returns the response.</span></div>
  <div class="aws-flow">
    <div class="aws-node aws-node--person"><span class="aws-person-mark">USER</span><strong>Plant engineer</strong><small>Asks a short maintenance question and waits for the answer.</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--network"><img src="./assets/aws-architecture-icons/Arch_Amazon-API-Gateway_64.svg" alt=""><strong>Amazon API Gateway</strong><small>Receives, validates, and controls API traffic.</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--compute"><img src="./assets/aws-architecture-icons/Arch_AWS-Lambda_64.svg" alt=""><strong>AWS Lambda</strong><small>Applies application logic and builds the model request.</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Amazon Bedrock</strong><small>Runs foundation-model inference.</small></div>
  </div>
  <div class="aws-support-row" aria-label="Controls supporting the request path">
    <div class="aws-control aws-control--security"><img src="./assets/aws-architecture-icons/Arch_AWS-Identity-and-Access-Management_64.svg" alt=""><strong>IAM</strong><small>Service permissions</small></div>
    <div class="aws-control aws-control--security"><img src="./assets/aws-architecture-icons/Arch_AWS-Key-Management-Service_64.svg" alt=""><strong>AWS KMS</strong><small>Encryption controls</small></div>
    <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_Amazon-CloudWatch_64.svg" alt=""><strong>Amazon CloudWatch</strong><small>Metrics, logs, and alarms</small></div>
    <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_AWS-CloudTrail_64.svg" alt=""><strong>AWS CloudTrail</strong><small>AWS API activity</small></div>
  </div>
  <p class="aws-architecture__rule"><strong>Why this is the baseline:</strong> it has one bounded operation, no durable wait, no burst buffer, no retrieval requirement, and no model-directed tool loop.</p>
  <figcaption id="baseline-caption">Start simple, then add a component only when a requirement gives it a responsibility.</figcaption>
</figure>

Most exam scenarios alter one requirement and expect one architectural change:

- A single request becomes durable multi-step work: introduce Step Functions.
- Bursts must not overload workers: introduce SQS and asynchronous consumers.
- Other systems publish business events: use EventBridge routing.
- The model chooses tools dynamically: introduce an agent boundary.
- Answers need private/current evidence: add retrieval and a knowledge base/vector store.
- The client needs early tokens: use Bedrock streaming and an end-to-end streaming transport.
- Code becomes long-running or runtime-heavy: consider ECS/Fargate rather than Lambda.
- Processing may leave one Region but not a geography: use a geographic cross-Region inference profile only after validating every destination and data-handling boundary.

### 2.1 What can change the baseline? {#requirement-matrix}

Each clue below introduces a responsibility that the baseline does not have. Treat every row as a starting hypothesis; the question's complete requirements can overturn it.

<details class="architecture-reference" markdown="1">
<summary>Open the complete requirement → architecture reference</summary>

| Question clue / requirement | Preferred pattern or service | Why it fits | Nearest wrong alternative / trade-off |
|---|---|---|---|
| Simple synchronous GenAI API | API Gateway → Lambda → Bedrock | Small stateless integration with request validation and low operational overhead. | Step Functions adds workflow state and transitions without a multi-step requirement; ECS adds a service to operate. |
| Multi-step deterministic process | Step Functions | Makes sequence, branching, retries, timeouts, and execution state explicit. | One giant Lambda hides state and partial failures and is bounded by execution duration. |
| Dynamic reasoning/tool selection | Agent | The model selects the next tool or action from current context. | Step Functions alone is best when developers already know the sequence. |
| Dynamic reasoning followed by controlled business workflow | Agent → Step Functions | Agent diagnoses or proposes; deterministic workflow validates, approves, executes, and records. | Letting the agent own irreversible actions weakens control; using only Step Functions may make dynamic diagnosis brittle. |
| Burst workload / buffering | SQS → workers | Durable buffer, backpressure, independent scaling, retries, and dead-letter handling. | Direct synchronous invocation couples producer capacity and worker capacity; EventBridge is not primarily a work queue. |
| Event-driven integration | EventBridge | Routes events from multiple producers to multiple targets by rules with loose coupling. | SQS is better when the decisive need is buffering and controlled consumption by workers. |
| Asynchronous FM processing | SQS/event-driven worker, or native async/batch feature where supported | Acknowledges quickly, persists work, and separates completion from the request. | Holding an HTTP request or Lambda open wastes capacity and risks timeouts. |
| Streaming chatbot | Bedrock `ConverseStream` or `InvokeModelWithResponseStream` + end-to-end streaming transport | Improves time to first token and incremental user feedback. | A buffered API returns only after generation; streaming does not reduce total tokens or make offline work cheaper. |
| Human approval | Step Functions callback/approval workflow | Persists state while waiting and resumes from an explicit decision. | A waiting Lambda consumes duration and loses durable workflow visibility. |
| Simple persistent application state | DynamoDB | Managed, low-latency key-value/document state with elastic scale. | S3 is object storage, not a low-latency state table; in-memory Lambda state is not durable. |
| Document/object storage | S3 | Durable object store for source documents, batch input/output, and large logs. | DynamoDB is not the natural home for large document objects. |
| Managed RAG | Bedrock Knowledge Bases | Managed ingestion, retrieval, supported vector-store integration, reranking, and source citations. | A custom pipeline is justified only when control/flexibility requirements outweigh its development and operations. |
| Private AWS service connectivity | Interface VPC endpoint powered by AWS PrivateLink | Reaches supported AWS APIs without internet gateway, NAT, or public IP. | Merely putting Lambda in a private subnet does not create a private service path and can add NAT cost. |
| Predictable sustained FM throughput | Evaluate Provisioned Throughput | Fixed-cost reserved model capacity can fit stable, measured demand. | On-demand may throttle or cost more at sustained load; provisioning for spiky/low utilization can waste money. |
| Bulk/offline workload | Bedrock batch inference where model/Region support fits | Processes many S3-backed prompts asynchronously. | Streaming optimizes delivery experience, not bulk economics; batch is not for interactive latency. |
| Data residency constraint | In-Region or geographic cross-Region design, according to the exact boundary | Keeps processing inside the permitted single Region or geography. | Global cross-Region may route worldwide and cannot be selected merely for savings. |
| API activity auditing | CloudTrail | Answers who called which AWS API, when, and from where. | Application logs or invocation logs are not the authoritative AWS API audit history. |
| Prompt/output investigation | Bedrock Model Invocation Logging | Captures supported FM request/response data and metadata when explicitly enabled. | CloudTrail identifies the API call but is not the prompt/response investigation store. |
| Latency/service-boundary tracing | X-Ray / OpenTelemetry-compatible tracing | Follows a request across instrumented boundaries and attributes time/failure. | CloudWatch aggregate metrics show symptoms but not necessarily the slow hop for one request. |
| AI safety | Bedrock Guardrails + application controls | Filters supported input/output risks; application authorization and tool validation enforce deterministic rules. | A system prompt is not an authorization control; Guardrails do not replace IAM or retrieval filtering. |

</details>

## 3. Choose execution and control flow {#serverless-vs-containers}

The first major design question is not “Which compute service is best?” It is **who or what controls progress, and what must survive failure or delay?** One request can remain a Lambda invocation; a durable process, traffic burst, event fan-out, long-lived runtime, or model-selected action needs a different pattern.

<figure class="aws-architecture" aria-labelledby="execution-caption">
  <div class="aws-architecture__title">One changed requirement leads to one architectural responsibility<span class="aws-architecture__subtitle">These services often combine; the cards identify the responsibility each one should own.</span></div>
  <div class="aws-choice-grid">
    <div class="aws-choice aws-choice--compute"><img src="./assets/aws-architecture-icons/Arch_AWS-Lambda_64.svg" alt=""><strong>AWS Lambda</strong><small>One bounded, stateless operation</small></div>
    <div class="aws-choice aws-choice--compute"><img src="./assets/aws-architecture-icons/Arch_AWS-Fargate_64.svg" alt=""><strong>AWS Fargate</strong><small>Long-lived or runtime-heavy service</small></div>
    <div class="aws-choice aws-choice--workflow"><img src="./assets/aws-architecture-icons/Arch_AWS-Step-Functions_64.svg" alt=""><strong>AWS Step Functions</strong><small>Known durable states, retries, waits, and approvals</small></div>
    <div class="aws-choice aws-choice--agent"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock-AgentCore_64.svg" alt=""><strong>Amazon Bedrock AgentCore</strong><small>Model selects a permitted tool from runtime context</small></div>
    <div class="aws-choice aws-choice--workflow"><img src="./assets/aws-architecture-icons/Arch_Amazon-Simple-Queue-Service_64.svg" alt=""><strong>Amazon SQS</strong><small>Buffer work and control consumer rate</small></div>
    <div class="aws-choice aws-choice--workflow"><img src="./assets/aws-architecture-icons/Arch_Amazon-EventBridge_64.svg" alt=""><strong>Amazon EventBridge</strong><small>Route one business event to independent consumers</small></div>
  </div>
  <p class="aws-architecture__rule"><strong>Decision rule:</strong> Lambda performs work; Step Functions controls a known workflow; an agent chooses among allowed actions; SQS absorbs work; EventBridge routes events; Fargate hosts a service.</p>
  <figcaption id="execution-caption">Choose by responsibility. “Serverless,” “managed,” or “agentic” is not enough to decide the architecture.</figcaption>
</figure>

### 3.1 Lambda and serverless architecture

Think serverless for intermittent or variable traffic, event-driven work, short-lived stateless components, pay-per-use economics, managed orchestration, and low operational overhead. It is usually a strong fit for validation, request adaptation, lightweight tool handlers, and glue between managed services.

### 3.2 ECS and Fargate container architecture

Think containers for a long-running process, persistent service, custom runtime or native dependencies, workload outside conventional Lambda duration/resource limits, a complex MCP/tool server, or specialized runtime/network behavior. Fargate removes host management but still has task, service, scaling, image, and networking concerns.

The current blueprint explicitly distinguishes **Lambda for stateless MCP servers that provide lightweight tool access** from **Amazon ECS for MCP servers that provide complex tools**. It does not say that every MCP server belongs on either one. [AIP-C01 Domain 2, Skill 2.1.7](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain2.html).

| Requirement | Lambda/serverless is stronger when… | ECS/Fargate is stronger when… |
|---|---|---|
| Runtime | Handler is short-lived and supported by Lambda. | Process must remain available, has specialized dependencies, or needs service semantics. |
| State | State lives in DynamoDB/S3/workflow state. | The application is a long-lived service—although durable business state should still be externalized. |
| Traffic | Bursty or intermittent; scale-to-demand economics matter. | Sustained utilization or controlled task/service scaling makes sense. |
| Operations | Minimal infrastructure management is decisive. | Runtime control is decisive and justifies more operational surface. |
| Failure/duration | Work can be decomposed into bounded, idempotent invocations. | Work does not fit ordinary Lambda execution boundaries or needs a continuously running server. |

> **Warning:** choose from requirements. Do not memorize “Lambda good, ECS bad.” A conventional Lambda invocation is limited to 900 seconds; durable long waits belong in workflows, queues, callbacks, or an appropriate long-running compute service—not in sleeping code. [Lambda timeout](https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html).

### 3.3 Step Functions for durable, known workflows {#step-functions}

Do not select Step Functions because the question is complicated. Select it when the system needs **explicit, durable control flow**:

- orchestrate multiple steps or models;
- follow a known deterministic workflow;
- branch based on a result;
- retry individual steps with backoff;
- catch a failure and compensate or degrade;
- enforce a timeout or stopping condition;
- pause for human approval or an external callback;
- coordinate agent reasoning with controlled actions;
- process documents through several services;
- run independent work in parallel;
- fan out over a collection; or
- preserve long-running workflow state.

#### Step Functions vocabulary

| Concept | Architecture signal | Common trap |
|---|---|---|
| `Task` | Call a service, Lambda function, activity, or nested workflow. | Putting every operation inside one Lambda forfeits service integrations and per-step controls. |
| `Choice` | Route by developer-defined conditions. | Confusing deterministic branching with model-selected agent reasoning. |
| `Parallel` | Run different independent branches concurrently and join. | Using it for identical work over a collection; that is a `Map` signal. |
| `Map` | Apply the same workflow to items; Distributed Map supports large S3-backed workloads. | Unbounded DIY fan-out that ignores concurrency, partial failure, and result handling. |
| `Retry` | Retry a specific transient failure with controlled backoff. | Retrying non-idempotent business actions without an idempotency key. |
| `Catch` | Route a failed state to fallback, compensation, or escalation. | A blanket retry that hides permanent validation failures. |
| `Timeout` / heartbeat | Bound work and detect stalled tasks. | Assuming a service's own timeout creates an end-to-end recovery design. |

<figure class="aws-architecture" aria-labelledby="workflow-caption">
  <div class="aws-architecture__title">A controlled document workflow<span class="aws-architecture__subtitle">Step Functions owns progress; individual services perform bounded tasks.</span></div>
  <div class="aws-flow">
    <div class="aws-node aws-node--storage"><img src="./assets/aws-architecture-icons/Arch_Amazon-Simple-Storage-Service_64.svg" alt=""><strong>Amazon S3</strong><small>Inspection report uploaded</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--integration"><img src="./assets/aws-architecture-icons/Arch_AWS-Step-Functions_64.svg" alt=""><strong>Step Functions</strong><small>Persist state and coordinate the process</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-flow__group">
      <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Textract_64.svg" alt=""><strong>Extract report</strong><small>Read the scanned document</small></div>
      <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Parallel checks</strong><small>Assess findings and retrieve procedures</small></div>
    </div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--security"><span class="aws-person-mark">HUMAN</span><strong>Engineer approval</strong><small>Wait without holding compute open</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--compute"><img src="./assets/aws-architecture-icons/Arch_AWS-Lambda_64.svg" alt=""><strong>Create work order</strong><small>Validated, idempotent write</small></div>
  </div>
  <figcaption id="workflow-caption">Retries, catches, branches, timeouts, and approval are workflow state—not hidden control flow inside one large function.</figcaption>
</figure>

One giant Lambda is usually inferior for durable multi-step work because partial progress, retry policy, timeouts, branching, approval state, and execution history become custom code. It also creates a wider blast radius: retrying the function can repeat already-completed side effects. A state machine exposes those boundaries and can retry only the failed idempotent step.

For work that can exceed the compute boundary or need not complete inside the client request, acknowledge asynchronously, persist a job ID, place work on SQS or start a Standard workflow, and let the client poll or receive an event/callback. Do not “solve” a long process by increasing a synchronous timeout alone.

### 3.4 Agent versus Step Functions versus Lambda {#agent-step-functions-lambda}

<figure class="aws-architecture" aria-labelledby="agent-workflow-caption">
  <div class="aws-architecture__title">Hybrid boundary: reason dynamically, act deterministically<span class="aws-architecture__subtitle">The model can diagnose; the workflow still owns approval and side effects.</span></div>
  <div class="aws-flow">
    <div class="aws-node aws-node--person"><span class="aws-person-mark">ASK</span><strong>Open-ended incident</strong><small>The diagnostic path is not known in advance.</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock-AgentCore_64.svg" alt=""><strong>Bounded agent</strong><small>Select read-only diagnostic tools and produce a structured diagnosis.</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--integration"><img src="./assets/aws-architecture-icons/Arch_AWS-Step-Functions_64.svg" alt=""><strong>Controlled workflow</strong><small>Validate, approve, execute, verify, and roll back.</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--compute"><img src="./assets/aws-architecture-icons/Arch_AWS-Lambda_64.svg" alt=""><strong>Narrow tool handlers</strong><small>Apply exact permissions, schemas, and idempotency.</small></div>
  </div>
  <div class="aws-support-row">
    <div class="aws-control aws-control--security"><img src="./assets/aws-architecture-icons/Arch_AWS-Identity-and-Access-Management_64.svg" alt=""><strong>IAM</strong><small>Limit each runtime and tool</small></div>
    <div class="aws-control aws-control--security"><img src="./assets/aws-architecture-icons/Arch_Amazon-Cognito_64.svg" alt=""><strong>Trusted identity</strong><small>Carry caller and tenant scope</small></div>
    <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_Amazon-DynamoDB_64.svg" alt=""><strong>Durable state</strong><small>Execution and idempotency records</small></div>
    <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_Amazon-CloudWatch_64.svg" alt=""><strong>Trace</strong><small>Observe reasoning and tool outcomes</small></div>
  </div>
  <figcaption id="agent-workflow-caption">Autonomy ends where deterministic authorization, approval, or irreversible action begins.</figcaption>
</figure>

| Choice | Use when | Reject when |
|---|---|---|
| Lambda | One stateless operation or adapter is enough. | You are rebuilding durable orchestration, waiting, or autonomous tool selection in code. |
| Step Functions | The sequence is known and must be observable, retryable, and controlled. | The path genuinely depends on open-ended model reasoning rather than explicit conditions. |
| Agent | The model must interpret context and decide which allowed tool/action comes next. | A fixed workflow can meet the need more predictably and cheaply. |
| Agent + Step Functions | Dynamic diagnosis/planning feeds an auditable business process. | There is no need for either dynamic reasoning or durable workflow controls. |

Agents are not a fringe topic in the current blueprint. It explicitly includes agentic systems, memory/state, MCP, Strands Agents, AWS Agent Squad, tool integration, and multi-agent coordination. The professional-level distinction is **where autonomy ends**: validate parameters, authorize each tool for the caller, constrain resources with IAM, make side effects idempotent, define stopping conditions, and trace tool activity.

## 4. Add knowledge and prepare data {#rag-trade-offs}

A model answers from its request context. When answers need private, current, or attributable evidence, the architecture needs two connected lifecycles: prepare searchable knowledge before requests arrive, then retrieve authorized evidence for each request. Choose retrieval architecture by the evidence contract, not by the word “RAG.”

<figure class="aws-architecture" aria-labelledby="knowledge-caption">
  <div class="aws-architecture__title">Knowledge architecture: build the index, then use it at request time<span class="aws-architecture__subtitle">Ingestion makes evidence searchable; query-time retrieval places only relevant, authorized evidence into model context.</span></div>
  <div class="aws-lanes">
    <div class="aws-lane">
      <div class="aws-lane__label">Asynchronous ingestion</div>
      <div class="aws-service-row">
        <div class="aws-node aws-node--storage"><img src="./assets/aws-architecture-icons/Arch_Amazon-Simple-Storage-Service_64.svg" alt=""><strong>Amazon S3</strong><small>Versioned source documents</small></div>
        <span class="aws-arrow" aria-hidden="true">→</span>
        <div class="aws-flow__group">
          <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Textract_64.svg" alt=""><strong>Amazon Textract</strong><small>Scans, forms, and tables</small></div>
          <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Transcribe_64.svg" alt=""><strong>Amazon Transcribe</strong><small>Audio to text</small></div>
        </div>
        <span class="aws-arrow" aria-hidden="true">→</span>
        <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Comprehend_64.svg" alt=""><strong>Comprehend + processing</strong><small>Detect PII; normalize and chunk in application code</small></div>
        <span class="aws-arrow" aria-hidden="true">→</span>
        <div class="aws-node aws-node--storage"><img src="./assets/aws-architecture-icons/Arch_Amazon-OpenSearch-Service_64.svg" alt=""><strong>Vector/search store</strong><small>Embeddings, raw text, and metadata</small></div>
      </div>
    </div>
    <div class="aws-lane">
      <div class="aws-lane__label">Per-request retrieval and generation</div>
      <div class="aws-service-row">
        <div class="aws-node aws-node--person"><span class="aws-person-mark">ASK</span><strong>User question</strong><small>Identity supplies trusted tenant scope.</small></div>
        <span class="aws-arrow" aria-hidden="true">→</span>
        <div class="aws-node aws-node--security"><img src="./assets/aws-architecture-icons/Arch_AWS-Identity-and-Access-Management_64.svg" alt=""><strong>Application + data authorization</strong><small>Translate trusted identity into document and metadata scope.</small></div>
        <span class="aws-arrow" aria-hidden="true">→</span>
        <div class="aws-node aws-node--storage"><img src="./assets/aws-architecture-icons/Arch_Amazon-OpenSearch-Service_64.svg" alt=""><strong>Retrieve and rerank</strong><small>Lexical, semantic, hybrid, and filters.</small></div>
        <span class="aws-arrow" aria-hidden="true">→</span>
        <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Amazon Bedrock</strong><small>Generate from the question and supplied evidence.</small></div>
      </div>
    </div>
  </div>
  <p class="aws-architecture__rule"><strong>Boundary to remember:</strong> a reranker can reorder retrieved candidates, but it cannot recover a missing, stale, filtered-out, or unauthorized document.</p>
  <figcaption id="knowledge-caption">Bedrock Knowledge Bases can manage much of this flow, but parsing, chunking, authorization, freshness, retrieval quality, and citation quality remain architectural responsibilities.</figcaption>
</figure>

| Requirement or symptom | Architecture response | Why / trade-off |
|---|---|---|
| Semantic meaning matters | Vector/semantic retrieval | Finds conceptually similar text; exact identifiers can still be missed. |
| Exact SKU, policy code, or asset ID matters | Lexical or hybrid retrieval | Preserves literal matches; lexical-only search can miss paraphrases. |
| Both intent and identifiers matter | Hybrid search where the selected store/configuration supports it | Combines raw-text and vector search, at extra index/query complexity. In Knowledge Bases, explicit hybrid support depends on vector store and a filterable text field. |
| Known metadata narrows the valid corpus | Metadata filtering before/within retrieval | Improves precision and can enforce scope; bad or missing metadata can exclude valid evidence. |
| Multi-tenant documents | Trusted identity → application/data authorization → retrieval filter/ACL → model context | Unauthorized chunks must never enter the prompt. Guardrails and “do not reveal” instructions are not tenant isolation. |
| Passage boundaries lose meaning | Change chunking/parent-child strategy | Chunking affects recall and context coherence; larger chunks consume more context and can reduce precision. |
| Candidate set contains the answer but rank is poor | Rerank a sufficiently broad candidate set | Reranking can improve ordering, with added latency and cost. |
| Correct result never enters candidates | Fix ingestion, parsing, identifier preservation, query transformation, filters, chunking, or first-stage recall | A reranker cannot recover a document it never receives. |
| Managed AWS RAG and citations | Evaluate Bedrock Knowledge Bases | Reduces ingestion/retrieval plumbing and supports `Retrieve`, `RetrieveAndGenerate`, reranking, and source citations. Custom retrieval offers more control. |
| Scale/search control is decisive | Evaluate an appropriate vector store such as OpenSearch Service/Serverless, Aurora PostgreSQL with pgvector, or another supported Knowledge Bases store | Choose by scale, latency, filtering, hybrid-search, tenancy, operations, and Region—not brand recognition. |
| Source documents change frequently | Incremental/direct ingestion where supported, or scheduled/event-driven sync with update/delete handling | Updating the S3 object alone does not prove stale chunks and vector copies are gone. Test addition, modification, and deletion. |
| Answers require attribution | Preserve source URI/version/metadata and return citations | A citation proves which source was used, not that the answer is correct; evaluate citation correctness and completeness. |

Bedrock Knowledge Bases can decouple retrieval from generation (`Retrieve`) or manage both (`RetrieveAndGenerate`); the latter includes citations to retrieved chunks. Managed convenience is not a reason to ignore chunking, filters, synchronization, vector-store capability, or authorization. [Knowledge Bases retrieval APIs](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-how-retrieval.html), [query configuration and hybrid-search limits](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-config.html), [ingestion updates and deletions](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-how-data.html).

### 4.1 Diagnose the first broken RAG boundary

`source exists → parsed correctly → current version indexed → authorized corpus → query/filter correct → candidate recall → reranking → prompt/context → generated answer → citation`

Debug the first broken boundary. Do not tune the generation model to compensate for missing or unauthorized evidence.

### 4.2 Choose preprocessing by input type {#preprocessing}

| Input/need | Service that should enter the candidate set | Architectural role |
|---|---|---|
| Scanned PDF, forms, tables | Amazon Textract | Extract structured text/forms/tables before normalization, chunking, or inference. |
| Audio | Amazon Transcribe | Convert speech to text for downstream analysis, retrieval, or summarization. |
| Image/video analysis | Amazon Rekognition | Detect labels, faces, text, moderation signals, or video events when that specialized analysis is required. |
| PII, entities, language, text preprocessing | Amazon Comprehend | Detect/extract from text before storage or model context; use requirements to distinguish it from runtime Guardrails. |
| ETL, catalogue, lineage, data transformation | AWS Glue | Prepare/catalogue datasets and coordinate data-oriented transformations. |

The service name is not the hard part. The exam decision is usually whether preprocessing is synchronous or event-driven, how failures and partial progress are handled, where sensitive data may be stored, and how updates/deletions propagate into every derived copy.

## 5. Protect users, data, and actions {#security-controls}

Security and compliance are not a final box after the model. They shape identity at entry, authorization before retrieval and tools, network paths between services, every stored copy, and the evidence retained for investigation.

<figure class="aws-architecture" aria-labelledby="controls-caption">
  <div class="aws-architecture__title">Production boundary around the GenAI request<span class="aws-architecture__subtitle">The request path sits inside identity, authorization, network, data-protection, safety, and audit controls.</span></div>
  <div class="aws-boundary">
    <div class="aws-boundary__label">Approved AWS accounts, Regions, and network paths</div>
    <div class="aws-flow">
      <div class="aws-node aws-node--person"><span class="aws-person-mark">USER</span><strong>Caller</strong><small>User, service, or job</small></div>
      <span class="aws-arrow" aria-hidden="true">→</span>
      <div class="aws-node aws-node--security"><img src="./assets/aws-architecture-icons/Arch_Amazon-Cognito_64.svg" alt=""><strong>Amazon Cognito</strong><small>Authenticate the application user</small></div>
      <span class="aws-arrow" aria-hidden="true">→</span>
      <div class="aws-node aws-node--network"><img src="./assets/aws-architecture-icons/Arch_Amazon-API-Gateway_64.svg" alt=""><strong>API and application</strong><small>Validate input and authorize tenant, data, and action</small></div>
      <span class="aws-arrow" aria-hidden="true">→</span>
      <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Retrieval, model, and tools</strong><small>Receive only permitted context and capabilities</small></div>
    </div>
    <div class="aws-control-grid" aria-label="Cross-cutting security and operations controls">
      <div class="aws-control aws-control--security"><img src="./assets/aws-architecture-icons/Arch_AWS-Identity-and-Access-Management_64.svg" alt=""><strong>IAM</strong><small>Authorize AWS actions and resources</small></div>
      <div class="aws-control aws-control--security"><img src="./assets/aws-architecture-icons/Arch_AWS-PrivateLink_64.svg" alt=""><strong>AWS PrivateLink</strong><small>Private path to supported service APIs</small></div>
      <div class="aws-control aws-control--security"><img src="./assets/aws-architecture-icons/Arch_AWS-Key-Management-Service_64.svg" alt=""><strong>AWS KMS</strong><small>Protect supported stored data</small></div>
      <div class="aws-control aws-control--security"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Bedrock Guardrails</strong><small>Apply supported input/output safety policy</small></div>
      <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_AWS-CloudTrail_64.svg" alt=""><strong>AWS CloudTrail</strong><small>Record AWS API activity</small></div>
      <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_Amazon-CloudWatch_64.svg" alt=""><strong>CloudWatch and invocation logs</strong><small>Observe operations and selected model content</small></div>
    </div>
  </div>
  <p class="aws-architecture__rule"><strong>Different controls answer different questions:</strong> authentication identifies; authorization permits; Guardrails filter supported content risks; network controls constrain paths; encryption protects stored bytes; logs provide evidence.</p>
  <figcaption id="controls-caption">None of these controls substitutes for another. Apply each at the boundary it actually governs.</figcaption>
</figure>

| Requirement | Primary control(s) | Boundary to remember |
|---|---|---|
| User authentication | Amazon Cognito or enterprise federation where appropriate | Authentication identifies a principal; it does not by itself authorize documents, models, or tools. |
| Authorization | IAM + application/data/retrieval authorization | IAM controls AWS actions/resources; application identity must be translated into tenant/document/tool scope. |
| Least privilege | Narrow IAM roles, resource policies, condition keys, endpoint policies, and separate roles per component | Do not give the agent's runtime broad credentials because its prompt says to behave. |
| Network isolation | VPC design + interface VPC endpoints powered by AWS PrivateLink | A private subnet alone can still use NAT/public service endpoints. Endpoint policy and IAM are complementary. |
| Encryption | KMS-backed encryption for supported stores/logs/resources + TLS in transit | Inventory every stored copy and its key/access policy. Encryption does not solve authorization. |
| Secrets | AWS Secrets Manager | Do not embed credentials in prompts, images, environment files, or tool schemas. Rotate and scope access. |
| Input/output safety | Bedrock Guardrails + deterministic application checks | Guardrails can filter supported content, denied topics, prompt attacks, and sensitive information; validate business rules and tool parameters in code. |
| PII in prompts/responses | Guardrails sensitive-information filters and/or Comprehend preprocessing | Choose runtime block/mask versus batch/text detection. Guardrail masking does not automatically sanitize invocation logs or traces. |
| Sensitive data at rest in S3 | Amazon Macie | Macie discovers/classifies sensitive S3 data; it is not an inline prompt filter. |
| AWS API auditing | CloudTrail | Records API activity and caller context; configure trails/selectors required for ongoing and relevant data-event coverage. |
| FM interaction investigation | Bedrock Model Invocation Logging | Must be enabled; may contain full sensitive prompts/responses and needs its own access, encryption, and retention. |
| Operational monitoring | CloudWatch metrics, logs, dashboards, alarms | Use for errors, throttles, latency, tokens, queue age, and custom quality/business signals. |
| Stored-data retention | S3 Lifecycle/Object Lock where requirements call for it, log retention, database TTL/deletion workflows | Retention and immutable regulatory records are different requirements; apply the appropriate mechanism. |

### 5.1 Map common scenarios to controls

- **GDPR/privacy:** minimize data, establish lawful handling outside the architecture question, restrict purpose/access, define deletion across source, logs, indexes, caches, backups, and audit records, and validate Region/provider boundaries.
- **European/geographic residency:** choose an approved in-Region or geographic profile and inspect every possible destination, logging location, retained inference copy, Guardrails tier, store, backup, and support process.
- **Tenant isolation:** derive tenant scope from trusted identity and enforce it before retrieval/model context and again at tools/business APIs. Never trust a tenant ID supplied only in the prompt.
- **Prompt injection:** detect/filter where supported, separate trusted instructions from untrusted content, treat retrieved documents and tool results as untrusted, constrain tools with schemas/IAM, and require approval for high-impact actions.
- **Sensitive output:** combine Guardrails with authorization, output validation/redaction, and safe error handling. Safety filtering cannot authorize disclosure.
- **Auditability:** correlate API audit events, application/workflow execution IDs, model invocations, retrieval sources, and tool outcomes without creating an uncontrolled sensitive-data lake.

Bedrock interface endpoints provide private VPC connectivity without an internet gateway or NAT, but endpoint policies still need least-privilege design. [Bedrock PrivateLink documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html). Guardrails can detect prompt attacks and PII, but documented gaps matter—for example, tool results are not automatically assessed by the prompt-attack filter, and PII masking does not rewrite Model Invocation Logs. [Prompt-attack filtering](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-prompt-attack.html), [sensitive-information filters](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-sensitive-filters.html).

### 5.2 CloudTrail versus Model Invocation Logging {#logging-boundary}

This boundary is worth memorizing precisely:

| Service | The question it answers | What it is not |
|---|---|---|
| **AWS CloudTrail** | **Who called which AWS API, when, from where, and against what resource?** | Not the primary store for inspecting actual prompt/response content. |
| **Bedrock Model Invocation Logging** | **What supported model request/response and invocation metadata should investigators inspect?** | Not enabled by default and not a substitute for account-wide API auditing. |
| **Amazon CloudWatch** | **What are the operational metrics, logs, dashboards, alarms, trends, and application symptoms?** | Aggregate monitoring alone does not reconstruct an individual distributed path. |
| **AWS X-Ray / tracing** | **Where did a request spend time or fail across instrumented service boundaries?** | Not a complete prompt archive or API audit ledger. |

Question examples:

| Question | Best first answer |
|---|---|
| “Who invoked the Bedrock API?” | CloudTrail. |
| “What prompt caused this response?” | Bedrock Model Invocation Logging, if configured for that endpoint/operation/modality. |
| “Why has token usage increased?” | CloudWatch metrics/dashboards plus invocation data or application attribution to explain the change. |
| “Where in this multi-service path is the latency?” | X-Ray/OpenTelemetry-compatible distributed tracing, with component metrics for confirmation. |
| “Which agent/tool operation failed?” | Agent/workflow trace and tool/application logs correlated by execution/trace ID. |

Model Invocation Logging is **disabled by default** and supports configured delivery to CloudWatch Logs and/or S3 for supported Bedrock Runtime invocations. Treat it as sensitive: prompts, responses, images/documents, metadata, and even pre-masking input can be exposed in logs. Restrict access, encrypt destinations, apply retention, monitor delivery failures, and avoid enabling content capture indiscriminately. [Model Invocation Logging](https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html), [Bedrock CloudTrail integration](https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html).

### 5.3 Data retention and privacy architecture {#retention-privacy}

“Bedrock does not train on my data” is not a complete retention design. Separate these stores and owners:

| Data surface | Decision to make |
|---|---|
| Bedrock request/output retention | Check the exact endpoint, model, account/project retention mode, and whether the selected model permits the required mode. |
| Application-persisted prompts/responses | Decide whether persistence is necessary; set database/object TTL or deletion workflow and least-privilege access. |
| S3 source/batch/output data | Define bucket Region, KMS key, bucket policy, versioning/replication implications, Lifecycle, and deletion/legal-hold behavior. |
| CloudWatch application logs | Avoid unnecessary content, use log data protection where appropriate, set log-group retention, and restrict query/export access. |
| Model Invocation Logs | Choose modality and destination deliberately; protect full request/response content and set destination retention. Deleting the Bedrock logging configuration does not itself erase delivered logs. |
| Vector-store/chunk copies | Propagate source update/deletion, remove stale embeddings/chunks/metadata, and validate backup/index retention. |
| Audit records | Keep the minimum evidence required for the mandated period; separate tamper-resistance requirements from ordinary expiry. |

Current Bedrock documentation defines explicit retention modes including `none` (zero data retention), `default`, and modes that permit AWS review for models that require it. A `none` policy blocks a model that requires retention unless the account/model is eligible; `store=false` alone is not documented as a ZDR guarantee. Cross-Region inference can cause retained input/output data to be stored in a destination Region. Therefore:

1. start with the legal/data classification and exact geographic boundary;
2. check the selected model's allowed/effective retention behavior;
3. choose in-Region/geographic/global routing consistently with that boundary;
4. enforce approved settings with IAM/SCP controls where appropriate;
5. inventory application, logging, vector, cache, and backup copies separately; and
6. test deletion and access, not just configuration.

Use KMS and least privilege across each stored copy, but remember that encryption does not shorten retention. Verify behavior again near exam day because availability and model terms are service-specific. [Current Bedrock data-retention modes and ZDR](https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html).

### 5.4 Region and cross-Region inference decisions {#cross-region}

<figure class="aws-architecture" aria-labelledby="region-caption">
  <div class="aws-architecture__title">Choose the inference boundary from the permitted geography<span class="aws-architecture__subtitle">Capacity and convenience are considered only after the processing-location rule is satisfied.</span></div>
  <div class="aws-choice-grid">
    <div class="aws-choice aws-choice--agent"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>In-Region inference</strong><small>Exactly one approved Region; strongest location constraint</small></div>
    <div class="aws-choice aws-choice--workflow"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Geographic profile</strong><small>Route across permitted Regions inside one approved geography</small></div>
    <div class="aws-choice aws-choice--compute"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Global profile</strong><small>Broader worldwide routing only when geography is unrestricted</small></div>
  </div>
  <p class="aws-architecture__rule"><strong>Validate the whole boundary:</strong> possible inference destinations, SCP and IAM rules, retained model data, invocation logs, vector copies, backups, Guardrails tier, latency, quotas, and model support.</p>
  <figcaption id="region-caption">Private AWS transport and encryption do not make a disallowed processing destination compliant.</figcaption>
</figure>

| Mode | Prefer when | Trade-offs / rejection test |
|---|---|---|
| In-Region | Processing must remain in one Region or direct Regional control is decisive. | Subject to that Region's availability, quotas, and model support; do not claim multi-Region resilience. |
| Geographic cross-Region inference | More capacity/resilience is needed while processing must stay inside an approved geography such as EU, US, or APAC. | Prompts/outputs can move among destination Regions in the profile; IAM/SCPs must allow the necessary resources/Regions. It does not satisfy a strict single-Region rule. |
| Global cross-Region inference | No geographic restriction exists and worldwide routing/capacity or eligible cost optimization is the priority. | Requests may be processed in supported commercial Regions worldwide. Reject it when geography is constrained. |

Capacity, availability, cost, latency, regulatory requirements, model support, quotas, and data residency all matter. Cross-Region routing stays on the AWS network and is encrypted in transit, but private transport does not make a disallowed destination compliant. CloudTrail records the source-Region request and includes the inference Region for cross-Region calls; evaluate destination-specific retention as well. Inference profiles do not currently support Provisioned Throughput, so these can be competing architecture choices. [Cross-Region inference choices](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html), [geographic considerations](https://docs.aws.amazon.com/bedrock/latest/userguide/geographic-cross-region-inference.html), [regional availability modes](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html).

> Never sacrifice a compliance requirement for cost or capacity optimization.

## 6. Select delivery, capacity, and operational feedback {#inference-modes}

Once the functional architecture is correct, decide how requests consume capacity, how users receive results, and how the team will know whether the system remains healthy and useful. These dimensions can overlap: for example, a supported on-demand request may stream and use a cross-Region inference profile.

<figure class="aws-architecture" aria-labelledby="inference-mode-caption">
  <div class="aws-architecture__title">Match inference delivery and capacity to the workload<span class="aws-architecture__subtitle">These are overlapping dimensions, not five mutually exclusive products.</span></div>
  <div class="aws-mode-grid">
    <div class="aws-mode"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>On-demand</strong><small>Interactive, variable, or early-stage demand</small></div>
    <div class="aws-mode"><img src="./assets/aws-architecture-icons/Arch_Amazon-API-Gateway_64.svg" alt=""><strong>Streaming</strong><small>Incremental tokens and lower perceived wait</small></div>
    <div class="aws-mode"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Provisioned</strong><small>Stable, measured, sustained throughput</small></div>
    <div class="aws-mode"><img src="./assets/aws-architecture-icons/Arch_Amazon-Simple-Storage-Service_64.svg" alt=""><strong>Batch</strong><small>Large offline S3-backed datasets</small></div>
    <div class="aws-mode"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Cross-Region</strong><small>Broader capacity where geography permits</small></div>
  </div>
  <p class="aws-architecture__rule"><strong>Separate the objective:</strong> streaming changes delivery; Provisioned Throughput changes capacity economics; batch changes job semantics; cross-Region inference changes the eligible processing pool.</p>
  <figcaption id="inference-mode-caption">Read the precise requirement before choosing. A workload can combine supported modes, while some combinations are unavailable.</figcaption>
</figure>

| Mode | Strong fit | Cost/performance trade-off | Nearest trap |
|---|---|---|---|
| On-demand | Interactive, unpredictable, or early-stage traffic. | Pay for use and avoid idle reservation; capacity is quota/service dependent and may throttle under bursts. | Buying fixed capacity before measuring sustained demand. |
| Provisioned Throughput | Stable, predictable, sustained token throughput or a supported custom-model deployment requirement. | Fixed hourly cost and possible commitment; size/model/Region support matter. Better predictability can justify lower utilization flexibility. | Assuming it auto-scales to any burst or works with inference profiles/batch. |
| Batch inference | Large offline dataset with S3 input/output and no interactive response requirement. | Asynchronous high-volume processing; completion latency and supported model/Region/job constraints replace request latency. | Using streaming for an overnight workload, or batch for a user waiting now. |
| Streaming | User needs incremental tokens or lower time to first byte. | Improves perceived responsiveness; requires end-to-end stream support and error handling after partial output. It does not inherently reduce total model latency/cost. | Streaming only from Bedrock while a proxy buffers the response. |
| Cross-Region inference | Regional capacity/resilience requirement; geographic/global routing is allowed. | Broader compute pool and possible eligible pricing benefit; adds destination, IAM/SCP, compliance, and latency analysis. | Choosing global routing when residency limits processing geography. |

Bedrock batch inference accepts multiple prompts and places asynchronous output in S3; it is not supported for provisioned models. Provisioned Throughput supplies a fixed-cost higher throughput level and may have commitment terms. [Batch inference](https://docs.aws.amazon.com/bedrock/latest/userguide/batch-inference.html), [Provisioned Throughput](https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html). For interactive streaming, confirm model support and propagate the stream through the application/API transport; API Gateway REST proxy integrations can support response streaming when configured with `STREAM`. [Bedrock streaming](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-api.html), [API Gateway response streaming](https://docs.aws.amazon.com/apigateway/latest/developerguide/response-transfer-mode.html).

### 6.1 Observability: instrument the question {#observability}

<figure class="aws-architecture" aria-labelledby="operations-caption">
  <div class="aws-architecture__title">Operate a change as a closed evidence loop<span class="aws-architecture__subtitle">Offline evidence controls release; production evidence confirms behavior and creates the next regression case.</span></div>
  <div class="aws-flow">
    <div class="aws-node aws-node--person"><span class="aws-person-mark">CHANGE</span><strong>Versioned change</strong><small>Prompt, model, retrieval, parser, tool, or policy</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Offline evaluation</strong><small>Compare quality, safety, latency, and cost by cohort</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--integration"><img src="./assets/aws-architecture-icons/Arch_AWS-Step-Functions_64.svg" alt=""><strong>Release gate</strong><small>Reject, canary, or promote using explicit criteria</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--ai"><img src="./assets/aws-architecture-icons/Arch_Amazon-Bedrock_64.svg" alt=""><strong>Production</strong><small>Serve representative traffic with rollback ready</small></div>
  </div>
  <div class="aws-support-row" aria-label="Production evidence sources">
    <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_Amazon-CloudWatch_64.svg" alt=""><strong>CloudWatch</strong><small>Metrics, logs, alarms, and trends</small></div>
    <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_AWS-CloudTrail_64.svg" alt=""><strong>CloudTrail</strong><small>Caller and API audit evidence</small></div>
    <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_AWS-X-Ray_64.svg" alt=""><strong>AWS X-Ray / tracing</strong><small>Latency and failure across boundaries</small></div>
    <div class="aws-control aws-control--operations"><img src="./assets/aws-architecture-icons/Arch_Amazon-DynamoDB_64.svg" alt=""><strong>Evaluation evidence</strong><small>Outcomes, feedback, cohorts, and regressions</small></div>
  </div>
  <p class="aws-architecture__rule"><strong>Close the loop:</strong> a confirmed production failure becomes a reproducible test, a control or recovery improvement, and an observable signal before the next release.</p>
  <figcaption id="operations-caption">Metrics show change, logs explain local events, traces locate boundaries, and evaluations decide whether the result was good.</figcaption>
</figure>

| Signal/source | What it should answer |
|---|---|
| CloudWatch metrics | Are invocation count, latency, tokens, errors, throttles, queue age, concurrency, or logging-delivery failures changing? |
| CloudWatch Logs | What did application/service code report around a failure, validation decision, or workflow execution? |
| CloudTrail | Which principal/service made an AWS API call, when, and from what source? |
| Model Invocation Logging | What supported prompt/input, output, model, token counts, and invocation metadata explain an FM interaction? |
| X-Ray / distributed trace | Which instrumented boundary—API, Lambda, queue consumer, retrieval, model, tool, or database—contributed latency/error? |
| Agent/workflow traces | Which reasoning/tool/workflow step was selected, attempted, retried, rejected, or completed? |

#### GenAI-specific measurements

| Layer | Useful measurements |
|---|---|
| Request/model | Input/output/cache tokens, time to first token, total latency, model latency, error/throttle rate, retries, cost per request. |
| Retrieval | Retrieval latency, candidate recall, precision/relevance, filter misses, stale-document rate, reranker effect, citation correctness. |
| Agent/tool | Task completion, tool choice correctness, parameter validation failure, tool latency, tool success/timeout rate, loop count, human escalation. |
| Workflow/async | Execution success, per-state latency/retries, queue depth and age, dead-letter count, end-to-end completion time, duplicate/compensation events. |
| Quality/safety | Groundedness/hallucination, relevance, consistency, refusal correctness, Guardrail interventions, cohort differences, policy violations. |
| Business | Resolution rate, approval rate, user feedback, conversion/deflection where appropriate, and cost per successful outcome. |

Correlate a request, workflow execution, retrieval query, model invocation, and tool action with non-sensitive IDs. Metrics alert; logs explain local events; traces locate boundaries; evaluations establish whether the answer was good. No single telemetry product answers all four.

### 6.2 Evaluation as a release decision {#evaluation}

Traditional supervised-ML metrics are not the center of this exam. Evaluate the GenAI application and its production behavior.

| Change or component | Evaluation pattern | Decision logic |
|---|---|---|
| Generation quality | Relevance, factuality, consistency, fluency, safety, task-specific rubric | Measure the properties users and policy require; averages must not hide critical cohorts. |
| RAG | Candidate/retrieval quality **plus** grounded answer and citation quality | Separate retrieval failure from generation failure. |
| Agent | Task completion, tool choice/parameters, workflow success, safety, cost/latency | A fluent final answer cannot compensate for a wrong or unauthorized action. |
| Prompt/model change | Versioned golden dataset + held-out regression tests | Compare to the accepted baseline and preserve reproducibility. |
| Model comparison | Offline comparison, then A/B or canary where risk permits | Include quality, latency, token cost, safety, and business outcome—not benchmark score alone. |
| Automated large-scale evaluation | Bedrock model/RAG evaluation or calibrated LLM-as-a-judge | Fast and scalable, but judge bias/error requires calibration against human labels. |
| High-risk or subjective evaluation | Domain-expert/human evaluation | Slower and costlier, but appropriate when nuanced judgment or accountability dominates. |
| Production change | Quality/security gate + canary/monitoring + explicit rollback criteria | Define stop/rollback conditions before exposure and test rollback. |

Amazon Bedrock evaluations support automatic, LLM-as-a-judge, human-worker, model, and RAG evaluation patterns subject to current model/Region support. [Bedrock evaluation options](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html). Use automated judges as measurements, not unquestionable ground truth.

## 7. Turn understanding into exam reflexes {#wording-reflex}

Each mapping is a **cue, not an absolute rule**. Confirm semantics and all hard requirements.

| Wording | Architecture reflex | Check before committing |
|---|---|---|
| “decouple” | SQS or EventBridge | Buffer/backpressure and worker consumption → SQS; event routing/fan-out among systems → EventBridge. |
| “buffer burst traffic” | SQS | Confirm ordering, delivery, visibility timeout, retry, idempotency, and DLQ needs. |
| “event-driven” | EventBridge | If the real need is durable work buffering, add/use SQS. |
| “orchestrate” | Step Functions | Ensure it is explicit workflow control, not merely one function call. |
| “parallel steps” | Step Functions `Parallel` | Different branches; use `Map` for the same steps over items. |
| “process collection of items” | Step Functions `Map` / suitable parallel processing | Check dataset size, concurrency, ordering, and partial-failure needs. |
| “human approval” | Step Functions callback/approval | Persist decision, timeout, escalation, and audit state. |
| “real-time incremental response” | Bedrock streaming + streaming-capable transport | Streaming must be end to end; handle partial output and disconnects. |
| “audit AWS API calls” | CloudTrail | Configure ongoing trail and necessary event selectors. |
| “inspect prompts/responses” | Model Invocation Logging | It must be enabled and protected as sensitive data. |
| “private connectivity” | VPC endpoint / PrivateLink | Verify service endpoint support, DNS, endpoint policy, route, and IAM. |
| “least privilege” | IAM and scoped resource/application policies | Include model, knowledge base, data, tool, KMS, and log access. |
| “PII” | Guardrails, Comprehend, or Macie | Runtime prompt/output → Guardrails; text pipeline → Comprehend; S3 discovery → Macie. |
| “known workflow” | Step Functions | Explicit sequence, state, retry, and branch logic are the signal. |
| “dynamic tool selection” | Agent | Bound the tools, identity, parameters, iterations, and side effects. |
| “least operational overhead” | Appropriate managed/serverless service | It must still meet duration, runtime, state, latency, and compliance constraints. |
| “predictable high throughput” | Evaluate Provisioned Throughput | Measure token demand, utilization, support, fixed cost, and commitment. |
| “offline large-volume inference” | Batch inference | Confirm supported model/Region, S3 flow, completion objective, and retry. |
| “regional capacity” | Cross-Region inference | Determine whether geographic or global routing is legally allowed. |
| “data residency” | In-Region or approved geographic design | Include processing, retained data, logs, vector copies, backups, and safeguards. |
| “grounded current knowledge” | RAG / Knowledge Base | Confirm source freshness, authorization, retrieval quality, and citations. |
| “exact identifier” | Lexical/hybrid retrieval | Verify raw text is searchable and identifier survives parsing/chunking. |
| “semantic similarity” | Vector retrieval | Confirm metadata filters, embedding fit, latency, and recall. |

## 8. Architecture scenario drills {#scenarios}

These are original study scenarios, not AWS exam questions. Read only the scenario first; then expand the reasoning.

### Scenario 1: simple Bedrock API

**Scenario:** A mobile application sends short, independent text requests. Traffic is intermittent. Responses must return synchronously, and the team wants minimal infrastructure management.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** synchronous, stateless, intermittent, minimal operations.
- **Decisive constraint:** there is only one bounded request/response operation.
- **Best architecture:** API Gateway → Lambda validation/adapter → Bedrock; CloudWatch and CloudTrail; Guardrails/IAM as required.
- **Why:** pay-per-use managed components meet the workload without workflow or service state.
- **Why alternatives fail:** Step Functions adds transitions/state with no orchestration requirement; ECS/Fargate adds a persistent service to operate.
- **What would change the answer:** long-lived custom runtime → ECS/Fargate; several durable steps → Step Functions; incremental tokens → enable an end-to-end streaming path.

</details>

### Scenario 2: controlled document workflow

**Scenario:** Uploaded contracts must be extracted, classified, checked by two models in parallel, routed by confidence, approved by a lawyer, and then written to a case system. Each step needs independent retry and audit status.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** multi-step, parallel, conditional, human approval, durable state, targeted retries.
- **Decisive constraint:** the workflow must survive waits and partial failure.
- **Best architecture:** S3 event → EventBridge → Step Functions; extraction/preprocessing tasks; `Parallel` checks; `Choice`; callback approval; idempotent Lambda/API business action.
- **Why:** workflow state and error boundaries are explicit and inspectable.
- **Why alternatives fail:** one Lambda risks timeout and repeats completed side effects; an agent adds autonomy where business rules already define the path.
- **What would change the answer:** if the path through diagnostic tools cannot be predetermined, use an agent for that reasoning stage and return to Step Functions for approval/action.

</details>

### Scenario 3: bursty asynchronous summarization

**Scenario:** A partner can submit 100,000 records in minutes. Results are due within hours, requests must not be lost, and downstream concurrency must be controlled.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** burst absorption, asynchronous completion, durability, rate control.
- **Decisive constraint:** producer rate greatly exceeds safe consumer/model rate.
- **Best architecture:** ingestion API/S3 event → SQS → bounded-concurrency workers → Bedrock → S3/DynamoDB result; DLQ, idempotency, queue-age alarm. Evaluate native batch inference if S3 job semantics and supported model/Region fit.
- **Why:** the queue decouples admission from processing and supplies backpressure.
- **Why alternatives fail:** direct Lambda-to-Bedrock fan-out can amplify throttling; EventBridge alone is routing, not the main work buffer; streaming is irrelevant.
- **What would change the answer:** if all prompts form an offline S3 dataset and job-level output is sufficient, Bedrock batch inference may reduce custom worker orchestration.

</details>

### Scenario 4: enterprise event integration

**Scenario:** When a CRM emits `CaseEscalated`, several independent consumers must react: a GenAI summary, a compliance archive, and a notification service. New consumers will be added later.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** event routing, fan-out, producer/consumer independence, extensibility.
- **Decisive constraint:** one business event must reach multiple rule-selected targets.
- **Best architecture:** CRM event → EventBridge bus/rules → separate targets; place SQS before any consumer that needs buffering or rate-controlled work.
- **Why:** the producer need not know consumers, and rules route by event semantics.
- **Why alternatives fail:** one shared queue normally distributes messages among consumers rather than independently fanning the same event to all; direct calls couple availability and deployments.
- **What would change the answer:** a single worker pool that must absorb a burst points primarily to SQS.

</details>

### Scenario 5: Lambda or ECS/Fargate

**Scenario:** A tool server loads large native libraries, maintains long-lived connections, and must remain available for many calls. A second tool simply validates a request and queries DynamoDB.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** two different runtime profiles.
- **Decisive constraint:** the complex server needs long-lived/custom-runtime behavior; the validator does not.
- **Best architecture:** ECS/Fargate service behind an appropriate endpoint/load balancer for the complex MCP/tool server; Lambda for the lightweight stateless tool.
- **Why:** compute choices follow duration, dependencies, and service lifecycle.
- **Why alternatives fail:** forcing the complex server into Lambda fights runtime/service boundaries; running the simple handler as a container adds idle/service operations.
- **What would change the answer:** short, stateless execution with Lambda-compatible dependencies moves the first tool toward Lambda; specialized host/GPU requirements might move beyond Fargate to another container/compute choice.

</details>

### Scenario 6: managed RAG or custom retrieval

**Scenario:** A small team needs citations over S3 manuals, supported metadata filters, managed ingestion, and minimal development. It has no custom ranking algorithm.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** managed ingestion/retrieval, citations, filters, low development effort.
- **Decisive constraint:** required features are managed and no custom retrieval behavior is stated.
- **Best architecture:** Bedrock Knowledge Bases with a supported vector store; authorized metadata filtering; `RetrieveAndGenerate` for managed answer/citation flow.
- **Why:** it removes custom ingestion and retrieval plumbing while meeting attribution needs.
- **Why alternatives fail:** a hand-built OpenSearch pipeline adds flexibility the scenario does not require; sending whole manuals to the model raises token/latency and context limits.
- **What would change the answer:** custom multi-index ranking, unsupported query behavior, or strict control of every retrieval stage could justify `Retrieve` plus custom orchestration or a custom OpenSearch design.

</details>

### Scenario 7: exact identifier plus semantic question

**Scenario:** Engineers search “pressure issue on pump AX-1047.” Semantic search finds similar pumps but often omits the exact asset.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** semantic intent and exact identifier must both influence retrieval.
- **Decisive constraint:** literal identifier recall is mandatory.
- **Best architecture:** preserve the identifier in parsed/raw searchable text and metadata; use hybrid retrieval or lexical lookup combined with semantic candidates; rerank after candidate collection.
- **Why:** semantic embeddings alone may underweight rare literal tokens.
- **Why alternatives fail:** a better reranker cannot recover AX-1047 if it is absent from candidates; a larger generation model does not repair retrieval recall.
- **What would change the answer:** if only conceptual similarity matters, semantic retrieval may be sufficient; if asset ID uniquely determines one record, a deterministic metadata/key lookup may be even better.

</details>

### Scenario 8: runtime safety and tool control

**Scenario:** A public support bot must block disallowed topics and PII leakage. It can propose refunds, but only within the authenticated user's account and below a threshold.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** content/PII filtering plus deterministic authorization and financial limits.
- **Decisive constraint:** probabilistic safety and business authorization are different controls.
- **Best architecture:** Guardrails on relevant input/output; trusted identity; scoped IAM/application authorization; schema/amount/account validation in the refund API; Step Functions/human approval above threshold; audit and trace.
- **Why:** Guardrails handle supported AI-safety policies while code/workflow controls enforce money and tenancy.
- **Why alternatives fail:** a prompt saying “refund only this account” is not authorization; IAM alone does not inspect harmful text; Guardrails alone do not implement transaction rules.
- **What would change the answer:** a read-only bot may not need the action workflow, but still needs safety and data authorization.

</details>

### Scenario 9: CloudTrail or invocation logs

**Scenario:** Security asks which role called Bedrock at 14:03. The application team separately asks which prompt produced an unsafe answer.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** caller audit and FM-content investigation.
- **Decisive constraint:** the questions cross two telemetry boundaries.
- **Best architecture:** CloudTrail for caller/API event; configured Model Invocation Logging for supported request/response content; correlate IDs/timestamps with application trace.
- **Why:** API provenance and interaction content are distinct records.
- **Why alternatives fail:** CloudWatch metrics do not identify the complete audit event or prompt; CloudTrail is not the prompt archive; invocation logging cannot help retroactively if it was never enabled.
- **What would change the answer:** “which hop was slow?” points to tracing; “are 429s increasing?” points first to CloudWatch metrics.

</details>

### Scenario 10: GDPR and residency

**Scenario:** EU customer content may be processed within approved EU Regions but nowhere outside the EU. Additional inference capacity is needed. Prompts, invocation logs, and vector copies contain personal data.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** EU geographic boundary, capacity, privacy/retention across derived copies.
- **Decisive constraint:** processing must remain inside the approved geography.
- **Best architecture:** eligible EU geographic cross-Region inference profile; validate every destination and SCP/IAM rule; EU-located logging/vector/S3 design; KMS, least privilege, deletion/retention controls; verify model and Guardrails data handling.
- **Why:** geographic routing can add capacity without global processing.
- **Why alternatives fail:** global cross-Region inference may process worldwide; single-Region on-demand may not meet stated capacity; encryption alone does not satisfy location/deletion.
- **What would change the answer:** a strict one-Region mandate requires in-Region inference; no geographic restriction permits evaluating global routing.

</details>

### Scenario 11: cross-Region capacity without residency limits

**Scenario:** A global consumer application experiences Regional throttling. It has no geographic processing restriction and wants greater capacity and resilience with minimal routing code.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** broader capacity/resilience, no geography constraint, low custom routing effort.
- **Decisive constraint:** Bedrock may route worldwide.
- **Best architecture:** evaluate a supported global cross-Region inference profile; configure IAM/SCPs, quotas, monitoring, and fallback behavior.
- **Why:** the managed profile selects capacity across supported commercial Regions without custom regional routers.
- **Why alternatives fail:** geographic routing unnecessarily limits the pool if no boundary/other requirement prefers it; DIY replication/routing adds operations; Provisioned Throughput is a different fixed-capacity choice and is not supported by inference profiles.
- **What would change the answer:** any geographic restriction rules out global routing; stable measured demand might justify evaluating Provisioned Throughput instead.

</details>

### Scenario 12: predictable throughput

**Scenario:** A service consumes a stable, measured token rate around the clock. On-demand throttling threatens an SLO, and the team can commit to fixed capacity.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** predictable sustained throughput and SLO, known utilization, acceptable commitment.
- **Decisive constraint:** reserved model capacity has a credible utilization case.
- **Best architecture:** size and evaluate Bedrock Provisioned Throughput for a supported model/Region; monitor tokens, utilization, throttling, latency, and cost.
- **Why:** predictable higher capacity can justify fixed hourly billing.
- **Why alternatives fail:** on-demand retains capacity variability; batch does not meet an online SLO; SQS smooths bursts but does not itself create model throughput.
- **What would change the answer:** low/intermittent use favors on-demand; residency/cross-Region capacity requirements may favor an eligible inference profile, which currently cannot be combined with Provisioned Throughput.

</details>

### Scenario 13: streaming response

**Scenario:** Users abandon a writing assistant because they wait for the complete answer. Total generation time is acceptable, but the first visible text must arrive sooner.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** low time to first token, incremental output, interactive request.
- **Decisive constraint:** delivery is buffered end to end.
- **Best architecture:** supported Bedrock streaming API → streaming-capable Lambda/container integration → API Gateway REST response streaming, SSE, or WebSocket transport appropriate to the client; trace TTFT and disconnects.
- **Why:** tokens reach the user as generated.
- **Why alternatives fail:** increasing a normal API timeout keeps buffering; batch is offline; Provisioned Throughput may affect capacity but does not by itself expose partial output.
- **What would change the answer:** if total completion deadline—not perceived responsiveness—is failing, optimize model/retrieval, parallelism, capacity, and token limits instead.

</details>

### Scenario 14: multimodal ingestion

**Scenario:** New S3 uploads contain scanned forms and call recordings. Both must become searchable, PII must be handled before indexing, and failures need per-stage retries.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** multimodal preprocessing, event-driven ingestion, PII handling, durable stages.
- **Decisive constraint:** different media require specialized processors and independently recoverable steps.
- **Best architecture:** S3 events → EventBridge → Step Functions → Textract for scans / Transcribe for audio → Comprehend or required redaction logic → normalization/chunking → embeddings → vector store/Knowledge Base; KMS and retention at every copy.
- **Why:** specialized managed services feed a visible, retryable pipeline.
- **Why alternatives fail:** asking a text model to parse raw audio is the wrong interface; one Lambda obscures partial failure and duration; indexing before PII policy runs creates a sensitive derived copy.
- **What would change the answer:** native supported multimodal model processing may simplify a stage, but storage, PII, update, and evaluation requirements still decide the pipeline.

</details>

### Scenario 15: agent or deterministic workflow

**Scenario:** Production incidents require dynamic selection among diagnostic tools. Once a cause is proposed, remediation follows a fixed change-ticket, approval, deployment, verification, and rollback sequence.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** dynamic diagnosis; deterministic, auditable, reversible business workflow.
- **Decisive constraint:** autonomy is useful only before controlled remediation.
- **Best architecture:** bounded agent/Strands implementation for diagnostic tool selection → structured diagnosis → Step Functions for ticket validation, approval, deployment, verification, and rollback.
- **Why:** each component owns the kind of decision it handles best.
- **Why alternatives fail:** a fully autonomous remediation loop weakens approvals/stopping/rollback; encoding every diagnostic branch in Step Functions becomes brittle; one Lambda has neither durable workflow nor native tool reasoning.
- **What would change the answer:** a known diagnostic checklist can also be Step Functions; a read-only exploratory assistant may end after the bounded agent.

</details>

### Scenario 16: evaluation and rollback

**Scenario:** A cheaper model improves average relevance but increases unsupported answers for one language and sometimes repeats a side-effecting tool call after timeout.

<details markdown="1">
<summary>Architecture reasoning</summary>

- **Requirements:** quality by cohort, tool correctness, safe release, rollback.
- **Decisive constraint:** critical regressions cannot be averaged away.
- **Best architecture:** block promotion; add the cohort/tool cases to a golden dataset; evaluate retrieval/generation separately; make the tool idempotent; canary only after gates pass; monitor and retain tested rollback criteria.
- **Why:** cheaper averages do not compensate for hallucination or duplicate business action.
- **Why alternatives fail:** broad A/B exposure before safety gates increases risk; LLM-as-a-judge alone may miss tool-side effects and requires human calibration.
- **What would change the answer:** if all critical gates pass and only a non-critical preference metric regresses within tolerance, a monitored canary may be appropriate.

</details>

## 9. Optional hands-on validation {#practice-project}

Use this maintenance-assistant exercise to validate the architecture decisions from the page as one connected system.

Build a synthetic two-plant assistant that answers from versioned manuals with citations and can propose a work order through a test API. In one compact implementation:

1. Compare semantic and hybrid retrieval for headings, tables, scanned pages, conflicting versions, and exact asset IDs. Update and delete documents and prove every index copy changes.
2. Use an agent for `get_asset_health`; hand the structured diagnosis to Step Functions for approval and idempotent `create_work_order`. Inject timeouts and prove no duplicate order.
3. Give each identity one plant. Test missing ACL metadata, expired entitlement, prompt injection in a manual, PII in input/logs, and cross-tenant retrieval. Enforce access before model context.
4. Measure retrieval latency, time to first token, total latency, tokens, queue age, tool success, groundedness, and cost per successful request.
5. Introduce parser, prompt, retrieval, and tool regressions. Locate the first failed boundary, add a golden case, apply a quality/security gate, and test rollback.

Produce only three artifacts: an architecture decision record with rejected alternatives, one correlated trace across workflow/retrieval/model/tool boundaries, and a before/after release report with rollback criteria.

## 10. Blueprint and readiness check {#readiness}

Use the domain links to check breadth without turning this page into a second fundamentals course:

| Domain | Weight | Architecture focus |
|---|---:|---|
| [1 — Foundation Model Integration, Data Management, and Compliance](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain1.html) | 31% | Requirements, model/deployment choice, resilience, multimodal data pipelines, vector stores, retrieval, prompt governance. |
| [2 — Implementation and Integration](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain2.html) | 26% | Agents/MCP/Strands, tools, Step Functions, Lambda/ECS, enterprise events/APIs, streaming, resilient integrations. |
| [3 — AI Safety, Security, and Governance](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain3.html) | 20% | Guardrails, defense in depth, IAM/VPC/data privacy, compliance, auditability, source attribution. |
| [4 — Operational Efficiency and Optimization](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain4.html) | 12% | Token/cost efficiency, capacity, caching, latency, batch/streaming, monitoring, tracing, vector operations. |
| [5 — Testing, Validation, and Troubleshooting](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain5.html) | 11% | GenAI/RAG/agent evaluation, regression gates, integration/retrieval diagnosis, rollback. |

Before the exam, you should be able to answer for an unseen scenario:

1. What is the decisive constraint?
2. Which architecture pattern fits it?
3. Which AWS services implement that pattern?
4. What identity, authorization, network, encryption, safety, audit, monitoring, and retention controls are required?
5. Why is the nearest plausible answer inferior, and what requirement change would make it correct?

Use AWS's [in-scope services list](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html) for breadth and the current service documentation for behavior. Older beta experiences can suggest practice areas, but they cannot overrule the current guide. The durable lesson is: **know how AWS expects production GenAI systems to be architected, and understand the trade-offs between valid architectures.**
