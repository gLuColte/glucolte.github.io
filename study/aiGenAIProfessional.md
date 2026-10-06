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

Use this **AWS Certified Generative AI Developer – Professional (AIP-C01)** recap to practise defending architecture decisions before the exam. Use **Northstar Assistant** throughout: a customer asks a question, the application retrieves permitted evidence, Bedrock generates a response, and controlled tools may act on it. Start with the [AI learning pages](/study/#ai) for concepts and the [AWS service reference](/study/aiAWSServices) for implementation details.

**Blueprint checked: 6 October 2026.** The five domain weights are **31% / 26% / 20% / 12% / 11%**. Focus on integrating foundation models into production applications, including customization deployment and lifecycle controls. Model development/training and advanced ML are outside the exam’s stated scope; the model diagnostics here provide supporting context. Use the [current AWS exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html) as the authority; study shortcuts are starting hypotheses.

## 0. GenAI Mindmap {#genai-mindmap}

Start with the **requirements**, then compare models using approved representative data. The **model lifecycle** selects, optionally customizes, evaluates, deploys, and monitors the model. Prompt engineering and RAG shape the runtime context. The four supporting pillars apply throughout. Select a map box or diagnostic situation to reveal its decision boundary. Prompt → RAG → fine-tune is a starting heuristic, subject to the requirement and measured results.

{% include genai-mindmap.html %}

## 1. Read the constraint before choosing the service {#how-to-think}

For every scenario, complete this reasoning chain:

1. **Hard constraint:** what must hold? Consider identity, data location, duration, approval, latency, recovery, and delivery mode.
2. **Pattern:** bounded request, durable workflow, queue, event routing, agent, retrieval, stream, or batch?
3. **Ownership:** does a managed capability fit? If not, is there a supported extension? Own only the layer that still needs custom behavior, then choose its AWS services.
4. **Controls:** where do authorization, safety, encryption, audit, retention, and recovery apply?
5. **Runner-up:** which requirement does the nearest alternative violate? What change would make it appropriate?

“Least operational overhead,” “most cost-effective,” and “lowest latency” are tiebreakers after hard requirements are met. Separate first visible token, total response time, queue delay, and retrieval latency. Cost includes idle capacity, tokens, storage, transfer, and operations.

**Architecture framework:** the **AWS Well-Architected Generative AI Lens** applies GenAI guidance across all six Well-Architected pillars and the model/application lifecycle. It extends the framework; model selection, RAG, and responsible AI are topics within it, not replacement pillars. Use it to review a PoC and production design against measured quality, latency, cost, and business goals. [Generative AI Lens](https://aws.amazon.com/about-aws/whats-new/2025/04/well-architected-generative-ai-lens/).

## 2. Learn the exam traps by domain {#default-architecture}

<span id="scenarios"></span>

Use the domain recap for quick recall, then test the boundary in a scenario. The practice questions are original, single-answer exercises; the real exam also includes multiple-response questions.

{% include aip-domain-recap.html %}

{% include aip-domain-practice.html %}

### Select the model and manage the prompt {#model-prompt-decisions}

Treat prompts, model IDs/configuration, retrieval settings, tools, and policies as versioned release inputs. Evaluate before promotion, implement required approval in the delivery workflow, and retain a tested rollback target. [Prompt Management](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html), [Flows](https://docs.aws.amazon.com/bedrock/latest/userguide/flows.html), [Converse](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html).

**Sampling controls:** temperature adjusts randomness; top-p limits cumulative probability mass; top-k limits the candidate token count where supported. Output-token limits cap generation length and can truncate an answer. Model contracts differ; these settings do not certify factuality. [Parameter fundamentals](/study/aiFundamentals#section-6-1-temperature-top-p).

## 3. Choose who controls progress {#serverless-vs-containers}

<span id="requirement-matrix"></span>
<span id="agent-step-functions-lambda"></span>

Strands supports custom single- and multi-agent patterns; AWS Agent Squad coordinates routing among specialized agents. Choose by the required coordination pattern and managed/custom boundary, then evaluate handoffs and outcomes. AgentCore Runtime hosts an agent; the agent implementation or managed harness controls its loop. Neither supplies business authorization. Check customer eligibility for Agents Classic. [AgentCore and Agents Classic](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-classic-maintenance-mode.html), [orchestration comparison](/study/aiAWSServices#section-3-1-agentcore-boundary).

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

**Embedding dimensions:** Titan Text Embeddings V2 supports **1,024 / 512 / 256** output dimensions; G1 uses 1,536. Compare retrieval quality, storage, and latency on your corpus. More dimensions do not guarantee better domain accuracy, and similarity thresholds are not portable between models/datasets. [Titan embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html).

Use `Retrieve` to test retrieval separately from generation; use `RetrieveAndGenerate` when the managed combined path fits. A citation identifies a source, then verify it supports the claim. Knowledge Bases can support [custom Lambda transformation/chunking](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-custom-transformation.html); see [retrieval configuration and limitations](/study/aiAWSServices#kb-internals).

### Prepare data before creating derived copies {#preprocessing}

<span id="knowledge-service-boundary"></span>
**Assistant versus retriever versus store:** Q Business supplies a packaged enterprise assistant for an eligible existing customer; Kendra is an enterprise retriever; Knowledge Bases supplies RAG in your application; OpenSearch or Aurora/pgvector supplies search/vector storage according to requirements. Check availability/migration notices for new implementations. [Comparison](/study/aiAWSServices#assistant-retriever-vector-store).

Data details: [Data Automation](/study/aiAWSServices#data-automation), [Glue quality/redaction](/study/aiAWSServices#glue-quality-redaction), [transcription/PHI](/study/aiAWSServices#transcription-phi-pipeline), [source evidence](/study/aiAWSServices#source-audit).

## 5. Protect each boundary with the right control {#security-controls}

Use WAF where the selected entry-point integration supports it for request filtering/rate protection; it does not replace semantic prompt-attack checks. For responsible AI, evaluate fairness by cohort, document capabilities/limitations and intended use, preserve source/tool evidence, and escalate high-risk decisions to accountable humans. Traces expose emitted events and rationale, not guaranteed access to every hidden model thought. [Governance artifacts](/study/aiAWSServices#model-governance).

<span id="data-security-decisions"></span>
**Prompt injection can arrive in user input, retrieved documents, or tool results.** Treat these sources as untrusted, separate them from instructions, apply supported safety checks at relevant stages, and bound tool authority in code/IAM. Tool results are not automatically covered by every prompt-attack path; check limitations. An instruction to “never disclose the system prompt” is not a guaranteed security boundary. [Prompt-attack limitations](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-prompt-attack.html).

Lake Formation row/column filters apply through integrated query engines; they do not block an agent with independent direct S3 access. Remove bypass paths and test authorization before retrieval and at business APIs. [Underlying data access](https://docs.aws.amazon.com/lake-formation/latest/dg/access-control-underlying-data.html).

### Ask the right question of telemetry {#logging-boundary}

<span id="observability"></span>
<span id="diagnostic-artifact"></span>

Invocation logging is disabled by default and can expose sensitive input/output, including pre-masking input. Protect supported CloudWatch/S3 destinations with access, encryption, retention, and delivery monitoring. Prefer non-sensitive correlation IDs; content capture is a deliberate policy decision. [Invocation logging](https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html), [CloudTrail integration](https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html), [agent trace controls](/study/aiAWSServices#agent-trace-controls).

### Retention and geographic processing {#retention-privacy}

<span id="cross-region"></span>

Cross-Region inference broadens the eligible compute pool; it does not independently fail over the source-Region application/endpoint. Check support, quotas, destinations, IAM/SCPs, and model handling. Private encrypted transport does not make an unapproved destination acceptable. Inference profiles currently do not support Provisioned Throughput. [Cross-Region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html).

Inventory **source objects, chunks/vectors, application state, caches, invocation/application logs, retained model data, backups, and audit records**. Each needs location, access, retention, and update/delete handling. “Not used for training” is not a complete retention guarantee. Check exact model/endpoint retention modes and eligibility; `store=false` alone is not a universal zero-retention guarantee. Immutability/legal hold and routine expiry are different requirements. [Bedrock retention modes](https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html).

## 6. Match optimization to the work being repeated {#inference-modes}

Delivery, capacity, routing, and caching are different dimensions. A supported on-demand call may stream and use a cross-Region profile.

<span id="hosting-decision"></span>
**Custom weights do not automatically mean SageMaker.** Bedrock supports eligible customization/import. SageMaker endpoints fit custom serving, chosen GPU instances, or endpoint scaling control. For arrival-driven long jobs, evaluate Asynchronous Inference; for a known dataset, Batch Transform. [Hosting choices](/study/aiAWSServices#sagemaker-inference-options), [Bedrock custom import](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html).

### Three different reusable units {#cost-patterns}

Response-cache keys need **tenant/entitlement, corpus version, model/prompt/policy configuration, and expiry**. A cache must not bypass authorization or preserve deleted content. An embedding cache avoids re-embedding unchanged compatible text rather than caching the answer. [Caching and routing](/study/aiAWSServices#routing-caching-capacity).

Measure **tokens/cost per successful outcome**, first-token and total latency, cache hits, retries/throttles, queue age, retrieval quality, and tool completion. Bedrock CloudWatch token metrics are `InputTokenCount` and `OutputTokenCount`; use supported profiles/application attribution for teams/features. Cost Explorer analyzes billing, Budgets alerts, and a gateway implements admission. [Token monitoring](/study/aiAWSServices#token-monitoring).

**Lambda reserved concurrency** allocates and caps a function's concurrency; it does not pre-initialize environments. **Provisioned concurrency** initializes environments to reduce cold starts, but spillover can use on-demand environments. Neither reserves Bedrock capacity. [Lambda concurrency](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html).

## 7. Evaluate the boundary that failed {#evaluation}

Use a versioned **golden dataset** of representative questions, expert-validated answers, source evidence, and tool outcomes. Keep final held-out tests separate from tuning examples. Compare with the accepted baseline by cohort, including language, tenant, rare IDs, safety cases, and side effects.

### Choose comparison, rollout, and validation deliberately {#quality-gate-decisions}

Version changes, run quality/security gates, and promote only after critical checks pass. Confirmed failures become regression cases. Block a release that improves averages but breaks a critical cohort or repeats a business write.

Supported Bedrock model/RAG evaluations offer automated, judge, and human approaches; verify the resource, dataset, metric, and Region contract. Faithfulness measures source support, relevance measures question alignment, and correctness measures against references. A grounding score is not a calibrated probability of truth. Bedrock contextual grounding checks require source, query, and response for supported use cases; conversational QA/chatbot use cases are not supported. [Grounding limitations](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-contextual-grounding-check.html). [Evaluation options](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html), [judge metrics](https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation-metrics.html).

Lifecycle details: [SageMaker evaluation/approval](/study/aiAWSServices#sagemaker-adapter-lifecycle), [bias checks](/study/aiAWSServices#sagemaker-training-bias), [constraint regressions](/study/aiInfrastructure#constraint-regression).

## 8. Check the exact contract {#wording-reflex}

<span id="service-internals"></span>
<span id="data-configuration-decisions"></span>

After choosing the pattern, verify the model, Region, API, store, and integration contract. A supported service name does not prove a particular configuration works. Keep prompt/model/retrieval settings reproducible, and distinguish accepted requests from completed business outcomes.

## 9. Optional: validate one connected implementation {#practice-project}

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

For an unfamiliar scenario, practise naming **the constraint, pattern, services, controls, rejected runner-up, and requirement change that would reverse your answer**. Check your readiness with timed mixed practice, including multiple-response questions.

Use the [in-scope services list](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html) for breadth. In-scope is not a recommendation for a new deployment: consult [maintenance notices](https://docs.aws.amazon.com/general/latest/gr/maintenance_services.html) and the [service reference](/study/aiAWSServices#section-12-service-map). Recheck exact model, feature, Region, API, and account support near exam day.
