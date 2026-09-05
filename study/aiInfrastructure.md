---
title: AI Infrastructure and Evaluation
permalink: /study/aiInfrastructure
---

# AI Infrastructure and Evaluation

Use this page for the cloud-neutral production envelope around an AI system and the evaluation loop that proves changes are safe. AWS service mappings belong in [AWS AI services](/study/infrastructureAWSAiServices).

**Part 6 of 7:** [AI Agents](/study/aiAgents) → **Infrastructure and evaluation** → [AWS AI Services](/study/infrastructureAWSAiServices). This page integrates the earlier layers; it owns their security, reliability, operations, and release process rather than re-explaining their mechanics.

## 1. Production reference architecture {#section-1-architecture}

```text
user → identity → API/application → authorization → AI orchestrator
                                                    ├─ model gateway
                                                    ├─ retrieval
                                                    ├─ tools/workflows
                                                    ├─ policy/guardrails
                                                    └─ state/cache
                         ← validated response + citations + audit trace ←
```

- **Identity** proves who or what is calling.
- **Authorization** decides which model, document, tool, tenant, and operation the caller may use.
- **AI orchestrator** builds context, routes models, invokes retrieval/tools, applies policy, and records traces.
- **Model gateway** normalizes model access, quotas, timeouts, routing, fallback, and usage accounting.
- **Retrieval layer** supplies changing/private evidence and enforces document access.
- **Tool/workflow layer** performs deterministic operations and side effects.
- **Guardrails/validators** inspect requests and responses but do not replace identity, authorization, or domain rules.
- **Observability/evaluation** surrounds every component; it is not a final model-only check.

## 2. Platform adoption and ownership {#section-2-company-adoption}

A company can run several maturity patterns at once; use the least complex one that safely serves the workload.

| Pattern | Use it when | Add next |
| --- | --- | --- |
| **Bounded product integration** | One low-risk use case needs a model response. | Evaluation, data classification, tracing, and cost limits before it becomes a production dependency. |
| **Repeatable product pattern** | Several flows need the same prompts, model routes, retrieval, or policy. | Shared adapters and standards, while the product still owns its user journey and domain workflow. |
| **Shared AI platform** | Multiple teams need consistent identity propagation, approved model access, retrieval connectors, tool boundaries, telemetry, and evaluation. | A paved road with reusable controls—not a central team that owns every feature. |
| **Bounded agent extension** | Tool choice or sequence depends on runtime observations. | The deterministic workflow, authorization, durable state, approvals, and budgets described on [AI Agents](/study/aiAgents). |

Keep ownership explicit:

- **Product/domain teams** own the user journey, source quality, business rules, acceptance criteria, and outcome.
- **The shared platform** owns reusable model access, identity/policy integration, telemetry, quotas, and common evaluation/release controls.
- **Security and data teams** own classification, retention, approved providers, and high-impact-action policy.

A prototype becomes unsafe when it reaches production without those owners and controls. Conversely, do not centralize every feature before a repeated need exists. Measure adoption by completed business tasks, quality, risk, latency, and cost—not model-call volume.

## 3. Identity, authorization, and tenant isolation {#section-3-identity}

- Authenticate users, services, jobs, and agent/tool identities.
- Use:
  - **RBAC** for stable job-function permissions;
  - **ABAC** for tenant, region, classification, resource ownership, and request context;
  - both when role grants need resource-specific constraints.
- Authorize every boundary:
  - API operation;
  - model and capability;
  - retrieved document/chunk;
  - tool and exact resource;
  - state/memory record;
  - generated file or external message.
- Tenant isolation controls:
  - derive tenant from trusted identity, not a prompt field;
  - include tenant ownership in primary data keys and policies;
  - apply retrieval filters before context reaches the model;
  - separate indexes, keys, networks, or accounts when risk demands stronger isolation;
  - fail closed when tenant/ACL metadata is missing;
  - run cross-tenant leakage tests.
- Prompt instructions are never an authorization boundary.

## 4. Networking and service boundaries {#section-4-networking}

- Decide for every dependency whether access is:
  - public internet;
  - private service endpoint;
  - private network/peering;
  - controlled outbound proxy or egress gateway.
- Apply:
  - service-to-service authentication;
  - TLS in transit;
  - network allowlists and segmentation;
  - DNS and certificate validation;
  - explicit outbound destinations for tools and agents;
  - request/response size and timeout limits.
- Private networking reduces exposure; it does not fix excessive IAM permissions, prompt injection, or data leakage through an allowed destination.
- Treat model providers, vector stores, MCP servers, plugins, and external tools as separate trust boundaries.

## 5. Data protection and secrets {#section-5-data-protection}

- Classify data before it enters prompts, indexes, fine-tuning datasets, caches, or logs.
- For PII, secrets, regulated data, and customer content:
  - minimize collection and prompt exposure;
  - redact, tokenize, or mask where the original value is unnecessary;
  - encrypt in transit and at rest;
  - define storage location, retention, deletion, and backup behaviour;
  - record data lineage and access;
  - review provider retention/training terms.
- Keep secrets out of:
  - prompts and retrieved chunks;
  - model-visible environment descriptions;
  - client code;
  - traces and error messages;
  - long-term agent memory.
- Use short-lived credentials and workload identity where possible; rotate stored secrets.
- Store complete sensitive payloads only when required. Prefer controlled references or redacted trace views.

## 6. AI-specific security threats {#section-6-security}

- **Direct prompt injection**: user asks the model to ignore policy.
- **Indirect prompt injection**: retrieved document, email, web page, or tool result contains malicious instructions.
- **Jailbreaking**: a user attempts to bypass the model or application's intended behavioural and safety restrictions.
- **Data exfiltration**: model sends sensitive context through a permitted tool, URL, or external message.
- **Tool abuse**: valid tool call performs an unauthorized or unsafe operation.
- **Poisoning**: attacker changes source documents, memory, evaluation data, or fine-tuning data.
- **Model/supply-chain risk**: compromised model artifact, container, library, MCP server, or parser.
- **Denial of wallet/service**: large prompts, recursive agents, repeated tools, or expensive model routes consume quotas and budget.
- Controls:
  - separate trusted instructions from untrusted content;
  - least privilege and narrow tools;
  - validate destinations and arguments outside the model;
  - require approval for high-impact actions;
  - sign/version artifacts and review dependencies;
  - apply token, time, step, request, and spend limits;
  - test attacks continuously, not only before launch.

Delimiters and a clear instruction hierarchy help the model distinguish instructions from data, but neither is an enforcement boundary. Treat all model-visible content as potentially hostile; enforce authorization, allowed destinations, and action policy in deterministic application and tool controls.

## 7. Scalability and quota management {#section-7-scalability}

- Capacity planning must include:
  - concurrent requests;
  - input/output token rate;
  - provider/model quotas;
  - retrieval and reranking load;
  - tool/database limits;
  - queue depth and worker concurrency.
- Patterns:
  - rate-limit by user, tenant, model route, and cost risk;
  - place long-running/non-interactive work on queues;
  - use backpressure instead of unlimited retries;
  - batch embedding and offline inference where supported;
  - scale stateless orchestration horizontally;
  - partition hot tenants or workloads;
  - reserve/provision capacity only when utilization and SLA justify it.
- Watch correlated bursts: one user request may fan out into many retrieval queries, model calls, and tools.

## 8. Reliability and degraded modes {#section-8-reliability}

- Set deadlines for the full request and shorter timeouts for each dependency.
- Retry only transient failures:
  - use exponential backoff with jitter;
  - respect provider retry guidance;
  - bound attempts and remaining deadline;
  - never blindly retry non-idempotent side effects.
- Use circuit breakers to stop repeated calls to a failing dependency.
- Use idempotency keys and durable status for asynchronous jobs; [agent recovery](/study/aiAgents#section-8-failures) covers tool side effects.
- Use the [model fallback contract](/study/aiModels#section-7-routing) to qualify an alternate model. Decide separately whether stale cached evidence, search-only results, queued completion, or human escalation meets the workload’s freshness and quality requirements.
- Design explicit degraded modes and tell the user when quality or freshness is reduced.

## 9. Latency engineering {#section-9-latency}

```text
total latency = network + identity + retrieval + reranking + context build
              + model input processing + model output generation + tools
```

- Measure p50, p95, and p99 for every component and end-to-end task.
- Optimize the actual bottleneck:
  - reduce network hops or use regional/private paths;
  - cache query-independent embeddings and stable results;
  - tune ANN candidate count and reranking depth;
  - remove duplicated/irrelevant context;
  - route simple tasks to smaller models;
  - parallelize only independent safe reads;
  - stream output for faster perceived response;
  - move long tasks to asynchronous jobs.
- Streaming improves time to first visible token but does not reduce total compute or make output safe before validation.
- Output tokens are sequential and often dominate generation latency; cap verbosity when the task allows it.

## 10. Cost engineering {#section-10-cost}

Start with [model-call pricing](/study/aiModels#section-6-pricing), then add the costs outside that call: ingestion, embeddings, reranking, storage/indexing, tools, queues, logs, transfer, idle capacity, and human review. Attribute retries and agent loops to the originating task.

Use the latency measurements above to avoid paying for unnecessary work. Routing choices belong in [Models](/study/aiModels#section-7-routing); serving and caching choices follow below. Report total cost per successful task by tenant and task type so an expensive cohort is visible.

### 10.1 Serving and caching decision rules

| Need | Prefer | Why |
|---|---|---|
| User waits for a short answer | **Synchronous inference**, often streaming | Immediate request/response path; streaming improves perceived responsiveness |
| Long-running, bursty, or non-interactive work | **Asynchronous job + queue** | Decouples callers from duration and absorbs load; needs durable status/idempotency |
| Large known dataset | **Batch inference** | Throughput/cost optimization where per-item immediate response is unnecessary |
| Identical safe request repeats | **Result cache** | Avoids an unnecessary model invocation |
| Semantically equivalent safe question repeats | **Semantic cache** | Matches meaning, not only identical bytes; evaluate false matches carefully |
| Stable common prompt prefix | **Prompt/prefix cache** where the provider supports it | Reuses repeated input processing; sensitive/tenant context must not cross boundaries |

- **Context pruning** removes stale, duplicate, or low-value history/evidence before the model call. It reduces token cost and prefill latency, but can remove needed context—evaluate it against a golden set.
- Cache keys and scopes must include the factors that change correctness: tenant/identity, authorization, document version/freshness, prompt/model version, and relevant inference configuration.
- Never serve cached output across users or permissions merely because the text is similar.

## 11. Observability {#section-11-observability}

- Give each request one trace ID across:
  - identity and authorization decisions;
  - prompt/template and model version;
  - token counts and decoding configuration;
  - retrieved candidates, filters, scores, and citations;
  - reranker and routing decisions;
  - tool proposals, approvals, execution, and results;
  - retries, errors, latency, and cost;
  - user feedback and final outcome.
- Log metadata by default; store sensitive prompt/response payloads only with explicit access and retention controls.
- Operational signals:
  - error, timeout, throttle, and refusal rates;
  - p50/p95/p99 latency;
  - queue age and saturation;
  - quota headroom;
  - tool success and invalid arguments;
  - cost per completed task;
  - retrieval and groundedness indicators.
- A trace should make it possible to answer: which user, model, prompt, documents, tools, policy decisions, and configuration produced this outcome?

## 12. Evaluation architecture {#section-12-evaluation}

```text
change: prompt / model / parser / chunking / index / tool / policy
                                  ↓
versioned evaluation suite → compare baseline and slices → deploy or reject
                                  ↓
                      canary + production feedback
```

- Evaluation levels:
  - **component**: parser, retriever, reranker, classifier, schema validator, tool;
  - **end-to-end**: final answer or completed task;
  - **security/safety**: authorization, leakage, injection, refusal, harmful action;
  - **operational**: latency, throughput, quota, reliability, and cost.
- Build datasets from:
  - real anonymized tasks;
  - domain-expert examples;
  - known incidents and regressions;
  - difficult edge cases and adversarial inputs;
  - no-answer and permission-denied cases.
- Version:
  - dataset and rubric;
  - prompt/template;
  - model ID and parameters;
  - parser/chunk/index configuration;
  - tool schemas and software version.

The evaluation suite composes specialist measurements; it does not duplicate them:

- [Knowledge bases](/study/aiKnowledgebases#evaluation-does-the-system-retrieve-and-answer-well) own retrieval, grounding, citation, and answer-quality metrics.
- [AI Agents](/study/aiAgents#section-9-evaluation) own tool selection, action correctness, loop termination, and approval/escalation metrics.
- This page owns cross-cutting test datasets, judge/human calibration, release gates, incident learning, and production signals.

## 13. Business and adaptability metrics

| Metric | What it answers |
|---|---|
| **Efficiency** | Are compute, storage, energy, time, and human-review resources producing enough successful work for their cost? |
| **Conversion rate** | What percentage of users complete the desired action, such as a purchase or sign-up? |
| **User satisfaction** | Do users report that the experience and output are useful? |
| **Cross-domain performance** | Does quality remain acceptable across distinct contexts such as healthcare, finance, and entertainment? |

These measure different things. A system can be efficient but unpopular, or satisfy users while consuming too many resources.

## 14. LLM-as-judge and human evaluation {#section-14-judging}

- LLM judges are useful for scalable rubric-based scoring and pairwise comparison.
- Risks:
  - preference for verbosity or style;
  - position/order bias;
  - self/model-family agreement bias;
  - weak domain understanding;
  - sensitivity to rubric wording;
  - non-deterministic scores.
- Controls:
  - define observable rubric levels;
  - blind model identity and randomize answer order;
  - include calibrated examples;
  - compare multiple judges or deterministic checks;
  - measure agreement with expert humans;
  - manually review disagreements and high-impact failures.
- Human evaluation:
  - use domain experts for ambiguous or safety-sensitive tasks;
  - sample routine traffic;
  - provide consistent grading guidance;
  - track inter-rater agreement;
  - turn confirmed failures into regression cases.

## 15. Production evaluation and release gates {#section-15-production-eval}

Use the business measures from [section 13](#13-business-and-adaptability-metrics), the operational signals from [observability](#section-11-observability), and the specialist RAG/agent measures linked in [evaluation architecture](#section-12-evaluation). Add user correction, abandonment, and confirmed incidents to identify failures missed offline.

- Segment by task, tenant, language, document type, risk, model route, and difficulty.
- Release process:
  - keep prompts, model routes, retrieval configuration, tool schemas, evaluation suites, and deployment manifests versioned;
  - use CI/CD to run validation, security checks, and regression gates before promotion;
  - use Infrastructure as Code for repeatable runtime, network, identity, quota/alarm, and data-policy configuration;
  - run offline regression suite;
  - reject security regressions regardless of average quality;
  - compare quality, latency, and cost against baseline;
  - canary, shadow, or blue/green deployment on representative traffic;
  - monitor slices and rollback criteria;
  - promote only after evidence supports the change.
- Every production incident should create:
  - a root-cause category;
  - a reproducible test case;
  - a control or recovery improvement;
  - an observable alert where possible.

## 16. Troubleshoot the layer that failed

```text
Bad result / failed task
        ↓
Was the needed evidence retrieved and authorized?
  No → parsing / chunking / query / filter / ranking problem
  Yes
        ↓
Did the prompt and selected model use the evidence correctly?
  No → context construction / prompt / model / decoding problem
  Yes
        ↓
Did an agent or tool choose/execute the correct action?
  No → schema / permission / workflow / tool-result problem
  Yes
        ↓
Did the platform meet the request contract?
  No → timeout / throttling / quota / retry / cache / deployment problem
```

Use the [request trace](#section-11-observability) to locate the first failed boundary, then add a regression case at that layer. Continue to [AWS AI Services](/study/infrastructureAWSAiServices) to implement these controls on AWS.
