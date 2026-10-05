---
title: AWS AIP-C01 Architecture Decision Guide
permalink: /study/aiGenAIProfessional
tag:
  - AWS Certified Generative AI Developer Professional
  - AIP-C01
  - Amazon Bedrock
  - Amazon SageMaker AI
  - retrieval-augmented generation (RAG)
  - generative AI security
  - AI governance
  - model evaluation
  - AWS Step Functions
  - prompt caching
  - agent tracing
---

# AWS AIP-C01 Architecture Decision Guide

Prepare for **AWS Certified Generative AI Developer – Professional (AIP-C01)** by learning to defend architecture decisions. Use **Northstar Assistant** throughout: a customer asks a question, the application retrieves permitted evidence, Bedrock generates a response, and controlled tools may act on it. Start with the [AI learning pages](/study/#ai) for concepts and the [AWS service reference](/study/aiAWSServices) for implementation details.

**Blueprint checked: 5 October 2026.** The five domain weights are **31% / 26% / 20% / 12% / 11%**. The focus is integrating foundation models into production applications and workflows. Use the [current AWS exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html) as the authority; study shortcuts are starting hypotheses.

## 0. GenAI Mindmap {#genai-mindmap}

Start here. Locate the architecture layer, name the constraint, and check managed capabilities and supported extensions before taking custom ownership. Use **Mental Map** for the whole system; switch to **Study** to explore a layer and its exam traps.

{% include genai-mindmap.html %}

## 1. Read the constraint before choosing the service {#how-to-think}

For every scenario, complete this reasoning chain:

1. **Hard constraint:** what must hold? Consider identity, data location, duration, approval, latency, recovery, and delivery mode.
2. **Pattern:** bounded request, durable workflow, queue, event routing, agent, retrieval, stream, or batch?
3. **Implementation:** which AWS services own those responsibilities?
4. **Controls:** where do authorization, safety, encryption, audit, retention, and recovery apply?
5. **Runner-up:** which requirement does the nearest alternative violate? What change would make it appropriate?

“Least operational overhead,” “most cost-effective,” and “lowest latency” are tiebreakers after hard requirements are met. Separate first visible token, total response time, queue delay, and retrieval latency. Cost includes idle capacity, tokens, storage, transfer, and operations.

**Architecture framework:** the **AWS Well-Architected Generative AI Lens** applies GenAI guidance across all six Well-Architected pillars and the model/application lifecycle. It extends the framework; model selection, RAG, and responsible AI are topics within it, not replacement pillars. Use it to review a PoC and production design against measured quality, latency, cost, and business goals. [Generative AI Lens](https://aws.amazon.com/about-aws/whats-new/2025/04/well-architected-generative-ai-lens/).

## 2. Learn the exam traps by domain {#default-architecture}

<span id="scenarios"></span>

Choose a domain, then a trap from the cheat sheet. **Try a multiple-choice question** tests a scenario with competing requirements and four possible actions. A correct answer explains the deciding clue, the alternatives, what would change the decision, and the service flow. Open **Learn the distinction** to compare the named AWS services, see when each fits, and identify the misleading shortcut.

{% include aip-domain-practice.html %}

### Select the model and manage the prompt {#model-prompt-decisions}

| Need | Decision | Check before choosing |
|---|---|---|
| A task needs a foundation model | Compare supported models on representative held-out inputs | Capability/modality, context and output limits, safety, latency, token cost, Region/API support. Public benchmark rank alone is insufficient. |
| Private, current, or attributable knowledge | Retrieve evidence into context | Freshness, entitlement, candidate recall, context budget, and citation correctness. |
| Format, examples, or tone need adjustment | Start with prompting and supported structured output | Validate schema **and** factual/business meaning. Low temperature reduces variation; it does not guarantee truth or identical results. |
| Evaluated prompting is insufficient for stable behavior/style | Consider supported customization | Data quality, evaluation benefit, lifecycle cost, and deployment support. RAG and customization can combine. |
| Versioned reusable instructions | Bedrock Prompt Management | Templates, variables, variants, versions, and reproducible configuration. A version is not proof of approval or quality. |
| Visual prompt → retrieval → tool/condition chain | Bedrock Flows | Supported typed nodes and branching; use an agent when the model must select the next action. |
| Common supported-model chat API | `Converse` / `ConverseStream` | The application supplies relevant message history; the inference call is not a persistent conversation store. `InvokeModel` can also implement chat with a model-specific contract. |

Treat prompts, model IDs/configuration, retrieval settings, tools, and policies as versioned release inputs. Evaluate before promotion, implement required approval in the delivery workflow, and retain a tested rollback target. [Prompt Management](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html), [Flows](https://docs.aws.amazon.com/bedrock/latest/userguide/flows.html), [Converse](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html).

**Sampling controls:** temperature adjusts randomness; top-p limits cumulative probability mass; top-k limits the candidate token count where supported. Output-token limits cap generation length and can truncate an answer. Model contracts differ; these settings do not certify factuality. [Parameter fundamentals](/study/aiFundamentals#section-6-1-temperature-top-p).

## 3. Choose who controls progress {#serverless-vs-containers}

<span id="requirement-matrix"></span>
<span id="agent-step-functions-lambda"></span>

| Responsibility | Strong candidate | Boundary / runner-up |
|---|---|---|
| One bounded stateless operation | Lambda | Externalize durable state. A conventional invocation is limited to 15 minutes; long waits need a workflow or suitable compute. |
| Long-lived/custom runtime or complex MCP service | ECS/Fargate where the runtime fits | A persistent connection/process is different from external session state. GPU/host-specific requirements need suitable hosting. |
| Known durable sequence, branches, retries, approval | Step Functions | Developers control the states; complexity alone is not a reason to add orchestration. |
| Model-selected tools based on observations | Bedrock Agents or a framework such as Strands | Limit tools, caller scope, parameters, iterations, time, and tokens. AgentCore supplies runtime/memory/observability capabilities; it is not itself model reasoning. |
| Dynamic diagnosis followed by controlled action | Bounded agent → validated proposal → Step Functions | The business API still enforces authorization, approval, and idempotency. |
| Absorb bursts and pace workers | SQS | Queue age, visibility timeout, DLQ, retries, and rate control matter. Concurrency alone is not a model token-rate limit. |
| Route events to independent targets | EventBridge | Add queues where consumers need buffering. A shared worker queue distributes work instead of independently broadcasting it to every consumer. |

Strands supports custom single- and multi-agent patterns; AWS Agent Squad coordinates routing among specialized agents. Choose by the required coordination pattern and managed/custom boundary, then evaluate handoffs and outcomes. A framework label does not supply business authorization. [Orchestration comparison](/study/aiAWSServices#section-3-1-agentcore-boundary).

### Durable workflows and approval {#step-functions}

**Standard** supports long-running state, `.sync` integrations, and `.waitForTaskToken` callbacks. **Express** has a five-minute execution limit and does not support `.sync` or callback task tokens. Standard can run up to one year. [Workflow types](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html).

Use `Choice` for deterministic conditions, `Parallel` for different independent branches, and `Map` for applying a workflow to collection items. Define per-step `Retry`, `Catch`, and deadlines. Make external side effects idempotent: an execution guarantee does not remove uncertainty after a downstream timeout or configured retry.

For approval, pass a protected callback token to an authenticated approval service. Return the decision with `SendTaskSuccess`, then branch on approved/rejected; use `SendTaskFailure` for task failure. Set a deadline. The workflow waits without keeping Lambda running. [Callback pattern](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html#connect-wait-token).

### Events, asynchronous work, and shared access {#business-events}

`CaseEscalated → EventBridge rule → summary/archive/notification targets`. Targets perform the work; EventBridge routes it. Put SQS before a target when demand must be buffered and drained at a safe rate. Configure retries, DLQ handling, and idempotency.

For long work, acknowledge with a job ID, persist state, and let the caller poll or receive a callback/event. A bigger synchronous timeout is not a durable job design. A supported offline S3 dataset may fit Bedrock batch inference instead of custom workers.

<span id="genai-gateway"></span>
**GenAI gateway versus direct integration:** several teams needing common entitlement, model abstraction, routing, request/token admission, and attribution justify a shared API Gateway + application router/accounting layer. A single application without those shared requirements can be simpler. API request throttles and Budgets alerts do not by themselves implement a hard per-team token-spend cap. AppConfig can change routing configuration without a code release; the application still reads and applies it. [Runtime configuration and cohorts](/study/aiAWSServices#appconfig-routing).

Implementation reference: [agents and AgentCore](/study/aiAWSServices#section-3-1-agentcore-boundary), [events and streaming](/study/aiAWSServices#event-stream-controls), [compute and integration](/study/aiAWSServices#section-9-2-compute).

## 4. Add evidence and diagnose retrieval {#rag-trade-offs}

**Ingestion:** source → extract/validate/redact → chunk → embed → index with source/version/ACL metadata. **Request:** trusted identity → authorized corpus → candidates → optional rerank → context → generation → checked citations. These are different lifecycles.

| Need or symptom | First decision | Qualification |
|---|---|---|
| Managed ingestion, retrieval, and citations | Bedrock Knowledge Bases with a supported store | Custom chunking alone does not force custom RAG: supported Lambda transformations can supply it. |
| Unsupported ranking/query behavior or pipeline control | Custom orchestration with `Retrieve`, or custom retrieval | Added control has development and operations cost. |
| Semantic intent | Vector retrieval | Evaluate domain/language fit and candidate recall. |
| Exact asset ID/SKU/policy code | Exact lookup, lexical, or supported hybrid retrieval | Preserve identifiers in searchable text/metadata. Hybrid is not universally superior. |
| Wrong order, correct evidence in candidates | Reranking | Reorders existing candidates; adds latency/cost. |
| Correct evidence absent | Check ingestion, freshness, ACLs/filters, query, chunking, and recall | Reranking and a larger generator cannot recover unseen evidence. |
| Chunk boundaries lose context | Evaluate chunking/overlap or parent-child retrieval | Larger chunks can dilute precision and consume tokens; semantic chunking is not a universal default. |
| Changed/deleted source still returned | Verify completed sync/update/delete handling and derived copies | An S3 update alone does not prove index refresh. |
| Multi-tenant knowledge | Backend authorization → filter/ACL → retrieval | The ingestion role's access does not authorize every caller to every vector. |

**Embedding dimensions:** Titan Text Embeddings V2 supports **1,024 / 512 / 256** output dimensions; G1 uses 1,536. Compare retrieval quality, storage, and latency on your corpus. More dimensions do not guarantee better domain accuracy, and similarity thresholds are not portable between models/datasets. [Titan embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html).

Use `Retrieve` to test retrieval separately from generation; use `RetrieveAndGenerate` when the managed combined path fits. A citation identifies a source, then verify it supports the claim. Knowledge Bases can support [custom Lambda transformation/chunking](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-custom-transformation.html); see [retrieval configuration and limitations](/study/aiAWSServices#kb-internals).

### Prepare data before creating derived copies {#preprocessing}

| Input / requirement | Candidate | Boundary |
|---|---|---|
| Scans, forms, tables | Textract | Preserve layout/table relationships and validate fields. |
| Recordings in a text pipeline | Transcribe | Preserve speaker turns; labels are not verified business roles. Check native audio support before requiring this intermediary. |
| Semantic structured extraction from supported media | Bedrock Data Automation | Projects/blueprints and S3 output; validate before database/index writes. |
| Text entities or PII | Comprehend or domain-specific detector | Detection locates spans; apply and verify redaction before inference, storage, or indexing. |
| Lightweight normalization/schema validation | Lambda/application code | Preserve meaningful identifiers/case; Comprehend does not normalize arbitrary queries. |
| Dataset rules, ETL, catalogue | Glue / Glue Data Quality | Explicitly fail or quarantine invalid data; a quality report is not automatically a gate. |

<span id="knowledge-service-boundary"></span>
**Assistant versus retriever versus store:** Q Business supplies a packaged enterprise assistant in an exam scenario; Kendra is an enterprise retriever; Knowledge Bases supplies RAG in your application; OpenSearch or Aurora/pgvector supplies search/vector storage according to requirements. Check availability/migration notices for new implementations. [Comparison](/study/aiAWSServices#assistant-retriever-vector-store).

Data details: [Data Automation](/study/aiAWSServices#data-automation), [Glue quality/redaction](/study/aiAWSServices#glue-quality-redaction), [transcription/PHI](/study/aiAWSServices#transcription-phi-pipeline), [source evidence](/study/aiAWSServices#source-audit).

## 5. Protect each boundary with the right control {#security-controls}

| Question | Primary control | Do not substitute |
|---|---|---|
| Who is the caller? | Cognito / appropriate federation | Authentication is not document/tool entitlement. |
| Which actions/resources and business data may they use? | IAM + application/data authorization | Prompts and Guardrails do not enforce all tenant/business permissions. |
| Which content risks should be filtered? | Bedrock Guardrails + deterministic checks | Configure supported input/output policies. Schema compliance does not establish factual correctness. |
| Where is the sensitive data? | **S3 discovery: Macie; text pipeline: Comprehend; model I/O: Guardrails** | Detection is not verified redaction; filtered output does not sanitize all logs. |
| Must the API path be private? | Interface VPC endpoint / PrivateLink, private DNS, network/endpoint policies | A private subnet alone does not create the private service path. |
| How are bytes and secrets protected? | KMS/encryption, TLS, Secrets Manager, least privilege | Encryption does not establish entitlement, residency, or deletion. |
| Must permissions be limited across accounts or for a role? | SCP / permissions boundary | These limit applicable permissions; they do not grant them. Explicit denies and IAM evaluation still apply. |
| Is resource configuration compliant? | AWS Config rules for supported resources or custom checks | Config does not inspect every model prompt. |
| Suspicious behavior or aggregated findings? | GuardDuty for supported threats; Security Hub for supported findings | Neither is an inline content filter or a detector of every GenAI attack. |

Use WAF where the selected entry-point integration supports it for request filtering/rate protection; it does not replace semantic prompt-attack checks. For responsible AI, evaluate fairness by cohort, document capabilities/limitations and intended use, preserve source/tool evidence, and escalate high-risk decisions to accountable humans. Traces expose emitted events and rationale, not guaranteed access to every hidden model thought. [Governance artifacts](/study/aiAWSServices#model-governance).

<span id="data-security-decisions"></span>
**Prompt injection can arrive in user input, retrieved documents, or tool results.** Treat these sources as untrusted, separate them from instructions, apply supported safety checks at relevant stages, and bound tool authority in code/IAM. Tool results are not automatically covered by every prompt-attack path; check limitations. An instruction to “never disclose the system prompt” is not a guaranteed security boundary. [Prompt-attack limitations](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-prompt-attack.html).

Lake Formation row/column filters apply through integrated query engines; they do not block an agent with independent direct S3 access. Remove bypass paths and test authorization before retrieval and at business APIs. [Underlying data access](https://docs.aws.amazon.com/lake-formation/latest/dg/access-control-underlying-data.html).

### Ask the right question of telemetry {#logging-boundary}

<span id="observability"></span>
<span id="diagnostic-artifact"></span>

| Question | Evidence |
|---|---|
| Who called which AWS API, when, from where? | **CloudTrail**, with required event coverage/selectors. |
| What prompt/response produced this result? | **Bedrock Model Invocation Logging**, explicitly enabled for supported calls and protected. |
| Are latency, tokens, throttles, errors, or queue age changing? | **CloudWatch metrics/alarms**; custom quality signals require evaluation/instrumentation. |
| Which hop was slow or failed? | Instrumented **X-Ray/OpenTelemetry spans**. Lambda tracing alone does not expose every SDK call or hidden model stage. |
| Why did the agent choose/fail a tool? | **Agent trace** + tool logs/workflow history, correlated by IDs. Persist required trace events; memory summaries are different evidence. |
| Which prompt versions drive cost or unsafe responses across calls? | **Logs Insights** over configured invocation/application logs. |

Invocation logging is disabled by default and can expose sensitive input/output, including pre-masking input. Protect supported CloudWatch/S3 destinations with access, encryption, retention, and delivery monitoring. Prefer non-sensitive correlation IDs; content capture is a deliberate policy decision. [Invocation logging](https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html), [CloudTrail integration](https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html), [agent trace controls](/study/aiAWSServices#agent-trace-controls).

### Retention and geographic processing {#retention-privacy}

<span id="cross-region"></span>

| Allowed processing | Candidate | Rejection test |
|---|---|---|
| Exactly one approved Region | In-Region inference | Geographic/global profiles can process elsewhere. |
| Approved Regions inside one geography | Eligible geographic profile, checking every destination | An EU/US/APAC label is insufficient if only a subset of destinations is approved. |
| No geographic restriction | Evaluate global/geographic profiles against capacity/cost/latency | Global routing is not permitted by a geographic restriction. |

Cross-Region inference broadens the eligible compute pool; it does not independently fail over the source-Region application/endpoint. Check support, quotas, destinations, IAM/SCPs, and model handling. Private encrypted transport does not make an unapproved destination acceptable. Inference profiles currently do not support Provisioned Throughput. [Cross-Region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html).

Inventory **source objects, chunks/vectors, application state, caches, invocation/application logs, retained model data, backups, and audit records**. Each needs location, access, retention, and update/delete handling. “Not used for training” is not a complete retention guarantee. Check exact model/endpoint retention modes and eligibility; `store=false` alone is not a universal zero-retention guarantee. Immutability/legal hold and routine expiry are different requirements. [Bedrock retention modes](https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html).

## 6. Match optimization to the work being repeated {#inference-modes}

Delivery, capacity, routing, and caching are different dimensions. A supported on-demand call may stream and use a cross-Region profile.

| Objective | Candidate | Check / trade-off |
|---|---|---|
| Flexible intermittent traffic | On-demand | Quotas and throttling still apply. |
| Stable measured token throughput | Provisioned Throughput | Hourly billing, support, sizing, commitment; no universal 60–70% break-even. Reservation alone does not guarantee lower p99. |
| Offline S3 dataset | Bedrock batch inference | Model/Region support, job semantics, record reconciliation, completion objective. Avoid universal discount/latency claims. |
| Earlier visible output | Bedrock streaming + end-to-end transport | Handle buffering, partial failure, and disconnects; streaming does not inherently make generation faster/cheaper. |
| Broader eligible compute pool | Cross-Region profile | Geographic controls and source-endpoint recovery remain separate. |
| Simpler queries need less capability | Intelligent Prompt Routing or custom routing/cascade | Evaluate both query groups; native routing has model-pair/family restrictions. Custom logic does not inherently need Step Functions. |

<span id="hosting-decision"></span>
**Custom weights do not automatically mean SageMaker.** Bedrock supports eligible customization/import. SageMaker endpoints fit custom serving, chosen GPU instances, or endpoint scaling control. For arrival-driven long jobs, evaluate Asynchronous Inference; for a known dataset, Batch Transform. [Hosting choices](/study/aiAWSServices#sagemaker-inference-options), [Bedrock custom import](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html).

### Three different reusable units {#cost-patterns}

| What repeats? | Pattern | Does a hit skip generation? |
|---|---|---|
| Identical long prefix; questions differ | **Bedrock prompt caching** | No. Reuses supported prefix processing; verify checkpoints, TTL, hits, and billing. |
| Equivalent questions; answer remains valid | **Semantic response caching** | Yes. Calibrate similarity and test meaning, scope, freshness, and unsafe reuse. |
| Identical complete scoped input/configuration | **Result fingerprinting / exact response cache** | Yes, if a valid entry exists. Exact input does not guarantee a hit after expiry, eviction, or invalidation. |

Response-cache keys need **tenant/entitlement, corpus version, model/prompt/policy configuration, and expiry**. A cache must not bypass authorization or preserve deleted content. An embedding cache avoids re-embedding unchanged compatible text rather than caching the answer. [Caching and routing](/study/aiAWSServices#routing-caching-capacity).

Measure **tokens/cost per successful outcome**, first-token and total latency, cache hits, retries/throttles, queue age, retrieval quality, and tool completion. Bedrock CloudWatch token metrics are `InputTokenCount` and `OutputTokenCount`; use supported profiles/application attribution for teams/features. Cost Explorer analyzes billing, Budgets alerts, and a gateway implements admission. [Token monitoring](/study/aiAWSServices#token-monitoring).

**Lambda reserved concurrency** allocates and caps a function's concurrency; it does not pre-initialize environments. **Provisioned concurrency** initializes environments to reduce cold starts, but spillover can use on-demand environments. Neither reserves Bedrock capacity. [Lambda concurrency](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html).

## 7. Evaluate the boundary that failed {#evaluation}

Use a versioned **golden dataset** of representative questions, expert-validated answers, source evidence, and tool outcomes. Keep final held-out tests separate from tuning examples. Compare with the accepted baseline by cohort, including language, tenant, rare IDs, safety cases, and side effects.

| Defect / question | Measure or inspect | First response |
|---|---|---|
| Relevant evidence missing | Recall, ingestion status, filters, source versions | Find the first missing boundary; fix retrieval before generation. |
| Retrieved context contains noise | Context precision/relevance, ranking, chunk boundaries | Evaluate retrieval/reranking/pruning while preserving evidence. |
| Answer invents claims despite evidence | **Faithfulness** against supplied sources | Test context use and grounding checks; a cited answer can still be false. |
| Answer does not address the question | **Answer relevance** | Check intent/task rubric; correctness and source support are distinct. |
| Fluent answer, wrong action | Task completion, tool selection/parameters, authorization, idempotency | Inspect actual outcomes/trace and enforce deterministic checks. |
| Large-scale semantic assessment | Calibrated **LLM-as-a-judge** | Explicit rubrics, human calibration, judge-error/bias checks. |
| High-risk judgment or reference labels | Domain experts / humans | Use guidelines and adjudication; human labels are not infallible. |
| Fast repeatable regressions | Assertions and suitable automated metrics | BLEU/ROUGE capture overlap, not semantic truth/tool correctness. |

### Choose comparison, rollout, and validation deliberately {#quality-gate-decisions}

| Method | Purpose | Control |
|---|---|---|
| Offline comparison | Compare before exposure | Same held-out cases, sources, and rubric. |
| A/B | Compare live variants' outcomes | Stable cohorts, attribution, sufficient evidence, prior safety gates. No mandatory 50/50 split. |
| Canary deployment | Limit rollout exposure | Small live cohort, stop/rollback criteria, gradual promotion. |
| Shadow | Compare mirrored requests without returning candidate output | Isolate writes/side effects; duplicated inference still has data/cost implications. |
| Blue/green | Switch between prepared environments | Validate rollback and state compatibility. |
| Synthetic canary | Scheduled integration/availability probe | Meaningful checks; uptime alone does not prove factual quality. |

Version changes, run quality/security gates, and promote only after critical checks pass. Confirmed failures become regression cases. Block a release that improves averages but breaks a critical cohort or repeats a business write.

Supported Bedrock model/RAG evaluations offer automated, judge, and human approaches; verify the resource, dataset, metric, and Region contract. Faithfulness measures source support, relevance measures question alignment, and correctness measures against references. A grounding score is not a calibrated probability of truth. [Evaluation options](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html), [judge metrics](https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation-metrics.html).

Lifecycle details: [SageMaker evaluation/approval](/study/aiAWSServices#sagemaker-adapter-lifecycle), [bias checks](/study/aiAWSServices#sagemaker-training-bias), [constraint regressions](/study/aiInfrastructure#constraint-regression).

## 8. Keep configuration traps as a lookup {#wording-reflex}

<span id="service-internals"></span>
<span id="data-configuration-decisions"></span>

<details class="architecture-reference" markdown="1">
<summary>Open the API/configuration checks after practising the decisions</summary>

| Clue | Exact boundary | More detail |
|---|---|---|
| S3 upload starts a state machine | S3 EventBridge delivery → rule → Step Functions; direct bucket notification cannot target a state machine. | [Events](/study/aiAWSServices#event-stream-controls) |
| Bursts under `final/` | Filter object keys, buffer, then pace; direct S3 notifications cannot target SQS FIFO. | [Events](/study/aiAWSServices#event-stream-controls) |
| WebSocket tokens | Decode stream events; `post_to_connection` uses connection ID. Storing an ID does not resume the model stream. | [Transport](/study/aiAWSServices#event-stream-controls) |
| Models/cohorts change without release | AppConfig deployment + polling/extension + routing; not instantaneous global mutation. | [AppConfig](/study/aiAWSServices#appconfig-routing) |
| Headless on-premises credentials | Roles Anywhere uses a trusted CA/X.509 certificate; directory integration alone is not this exchange. | [Roles Anywhere](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html) |
| Immediate API acknowledgement | Valid proxy response or appropriate direct integration; async acceptance is not business completion. | [API formats](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) |
| Claim-type clarification | Validate intent/entities, keep authoritative state, branch, then request missing fields. | [Flows](/study/aiAWSServices#bedrock-flows-evaluation) |
| Stale S3 Knowledge Base | Coalesce/pace `StartIngestionJob`, check completion/failures, verify update/delete. | [KB configuration](/study/aiAWSServices#kb-internals) |
| PDF columns detach | Fix extraction/advanced parsing before chunking/indexing. | [Parsing](/study/aiAWSServices#kb-internals) |
| Child snippets lack context | Evaluate hierarchical parent substitution; GraphRAG has a different contract. | [Retrieval](/study/aiAWSServices#kb-internals) |
| Empty records/PII enter training | Explicit Glue failure/quarantine/redaction gate; `IsComplete` alone does not validate non-empty text. | [Glue gates](/study/aiAWSServices#glue-quality-redaction) |
| Private role-restricted inference | Runtime endpoint + private DNS/network + scoped endpoint policy/IAM; remove bypass paths. | [Private inference](/study/aiAWSServices#private-inference) |
| New prompt invents source facts | Source-fact/business assertions plus factuality evaluation before promotion. | [Regression gates](/study/aiInfrastructure#constraint-regression) |
| Weekly model/LoRA release | Evaluation → governed artifact/approval → compatible serving/deployment; Registry alone does not update endpoints or hot-swap adapters. | [Lifecycle](/study/aiAWSServices#sagemaker-adapter-lifecycle) |
| Consistent team redaction/logging | Versioned infrastructure constructs + runtime wrappers + CI checks. | [Shared components](/study/aiAWSServices#shared-ai-components) |
| IDE review/edit/test | Q Developer capabilities, reviewed diff, executed tests; avoid obsolete command syntax. | [Developer tools](/study/aiAWSServices#q-developer-capabilities) |

</details>

## 9. Validate one connected implementation {#practice-project}

Build a synthetic two-tenant Northstar assistant with versioned manuals and a test work-order API:

1. Compare retrieval on exact IDs, tables, conflicting versions, source updates, and deletion.
2. Use a bounded diagnostic agent, then approval and an idempotent write. Inject a timeout and prove no duplicate action.
3. Test missing ACL metadata, cross-tenant prompts, document injection, and PII in input/logs. Enforce scope before context.
4. Measure first-token/total latency, tokens/cost, queue age, retrieval quality, tool outcomes, and faithfulness.
5. Introduce a prompt/parser/tool regression, locate its first failed boundary, add a golden case, block promotion, and test rollback.

Keep three artifacts: a decision record with rejected alternatives, a correlated trace, and a before/after release report with rollback criteria.

## 10. Check blueprint breadth and readiness {#readiness}

| Domain | Weight | Be able to defend |
|---|---:|---|
| [1 — Foundation Model Integration, Data Management, and Compliance](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain1.html) | 31% | Model/prompt choice, validation, vector stores, retrieval, prompt governance. |
| [2 — Implementation and Integration](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain2.html) | 26% | Agents/MCP/tools, execution boundaries, enterprise integrations, APIs, recovery. |
| [3 — AI Safety, Security, and Governance](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain3.html) | 20% | Safety/access, privacy/residency, organization controls, audit, responsible AI. |
| [4 — Operational Efficiency and Optimization](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain4.html) | 12% | Tokens/caching, capacity economics, delivery latency, monitoring/tracing. |
| [5 — Testing, Validation, and Troubleshooting](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain5.html) | 11% | Retrieval/generation diagnosis, agent outcomes, evaluation, rollout/rollback. |

You are ready when an unseen scenario lets you name **the constraint, pattern, services, controls, rejected runner-up, and requirement change that would reverse your answer**.

Use the [in-scope services list](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html) for breadth. In-scope is not a recommendation for a new deployment: consult [maintenance notices](https://docs.aws.amazon.com/general/latest/gr/maintenance_services.html) and the [service reference](/study/aiAWSServices#section-12-service-map). Recheck exact model, feature, Region, API, and account support near exam day.
