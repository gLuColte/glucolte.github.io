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

Use this page to practise **why one architecture fits and the nearest alternative fails**. The mindmap explains responsibilities; domain exercises test your decisions. Use [AWS AI Services](/study/aiAWSServices#service-map) for the interactive service chooser and API/configuration notes.

**Blueprint checked: 22 October 2026.** AIP-C01 focuses on integrating foundation models into production applications. Model development/training and advanced ML are outside its stated scope; understand customization and deployment boundaries without turning this into a training-specialist syllabus. The [AWS exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html) defines scope.

## 0. Understand the system {#genai-mindmap}

Select a box to inspect its responsibility, then choose a related situation and trace the evidence. The model lifecycle governs the version used at runtime; knowledge ingestion prepares evidence; a request assembles context and produces an answer or tool proposal. Supporting controls apply throughout.

{% include genai-mindmap.html %}

## 1. Read constraints before service names {#how-to-think}

For each scenario, answer five questions:

1. **Must hold:** which identity, residency, duration, approval, latency, or recovery requirement eliminates an option?
2. **Pattern:** bounded task, durable workflow, event routing, queue, agent, retrieval, stream, or batch?
3. **Ownership:** does a managed capability fit? Can a supported extension fill the gap? Own only what remains.
4. **Controls:** where must authorization, safety, audit, retention, and recovery be enforced?
5. **Alternative:** what requirement does the runner-up violate, and what change would make it appropriate?

Apply the qualifier **after** hard constraints:

| Qualifier | Compare |
|---|---|
| Least operational overhead | What the team must run, patch, scale, and recover. |
| Least application change | Which client/API contracts and integrations must change. |
| Least development effort | What must be implemented beyond supported built-in features. |
| Lowest latency / cost | The specified latency boundary or cost per successful outcome. |

Count responsibilities, not diagram boxes. Separate first-token latency, total response time, queue delay, and retrieval time. Use the [Well-Architected Generative AI Lens](https://aws.amazon.com/about-aws/whats-new/2025/04/well-architected-generative-ai-lens/) for a broader design review across the six pillars.

## 2. Practise by exam domain {#default-architecture}

<span id="scenarios"></span>

Try a question before opening its explanation. State the deciding clue, reject the nearest alternative, and explain what would change the answer. These original exercises are single-answer practice; the exam also includes multiple-response questions.

{% include aip-domain-recap.html %}

{% include aip-domain-practice.html %}

## 3. Defend the execution boundary {#serverless-vs-containers}

<span id="requirement-matrix"></span>
<span id="agent-step-functions-lambda"></span>
<span id="step-functions"></span>
<span id="business-events"></span>
<span id="genai-gateway"></span>

Ask **who chooses the next step** and **who retains progress**. A model-selected tool loop, a durable approval workflow, an event router, and a paced queue solve different problems. A complex task can combine them. Verify authorization and authoritative outcome before retrying a write.

Work through Northstar Assistant: diagnose with permitted evidence → propose an action → validate scope and arguments → approve where required → execute idempotently → report the actual result. Compare the [service chooser](/study/aiAWSServices#aws-map-orch), [workflow contracts](/study/aiAWSServices#step-functions-controls), and [maintenance sequence](/study/aiAWSServices#section-3-2-industrial-example).

## 4. Locate the first failed evidence boundary {#rag-trade-offs}

<span id="preprocessing"></span>
<span id="knowledge-service-boundary"></span>

Trace **source → extraction → chunking/metadata → embeddings/index → authorized candidates → reranking/context → answer**. Find where correct evidence first disappeared or changed. Missing candidates, poor ordering, and unsupported generation require different fixes. Check source/version and citation support before choosing a larger model.

Use the mindmap to investigate; use [Knowledge Bases configuration](/study/aiAWSServices#kb-internals) for API settings and [the service comparison](/study/aiAWSServices#assistant-retriever-vector-store) for assistant/retriever/store boundaries.

## 5. Place controls where they take effect {#security-controls}

<span id="data-security-decisions"></span>
<span id="logging-boundary"></span>
<span id="observability"></span>
<span id="diagnostic-artifact"></span>
<span id="retention-privacy"></span>
<span id="cross-region"></span>

For every obligation, name its enforcement point: caller identity, document scope, tool authority, safe content, private transport, approved processing location, or retention of each copy. One control rarely covers them all. Treat user input, retrieved content, and tool results as untrusted; test bypass paths and critical tenants/cohorts.

Choose evidence by the investigation: trend, caller activity, captured interaction, or slow stage. Service details: [identity/network](/study/aiAWSServices#section-9-1-entry), [Guardrails coverage](/study/aiAWSServices#guardrails-controls), [telemetry](/study/aiAWSServices#section-9-4-operations), [retention](/study/aiAWSServices#retention-controls), [Region profiles](/study/aiAWSServices#cross-region-profile).

## 6. Optimize the stated bottleneck {#inference-modes}

<span id="hosting-decision"></span>
<span id="cost-patterns"></span>

Identify what repeats and what is slow before choosing a lever. Prefix processing, finished answers, and embeddings are different cacheable units. Delivery mode, capacity reservation, and geographic routing are independent decisions. Include retries, idle resources, and failed outcomes in the comparison.

Compare [runtime choices](/study/aiAWSServices#aws-map-run), [caching](/study/aiAWSServices#routing-caching-capacity), [hosting](/study/aiAWSServices#sagemaker-inference-options), and [token versus billing evidence](/study/aiAWSServices#token-monitoring).

## 7. Prove quality and verify the release {#evaluation}

<span id="quality-gate-decisions"></span>
<span id="model-prompt-decisions"></span>
<span id="wording-reflex"></span>
<span id="service-internals"></span>
<span id="data-configuration-decisions"></span>

Use versioned representative golden cases and a separate held-out test set. Check evidence, answer quality, safety, cohorts, and actual tool outcomes. Version prompts, model/configuration, retrieval, tools, and policies together. A successful job, approved artifact, or valid schema does not prove the intended safe behavior reached production.

Offline gates precede controlled rollout. A/B compares live outcomes; a canary limits exposure; shadow requests need isolated/suppressed writes. Verify the actual route/version and compatible rollback. Turn confirmed failures into regression cases. See [evaluation contracts](/study/aiAWSServices#bedrock-flows-evaluation), [deployment objects](/study/aiAWSServices#sagemaker-adapter-lifecycle), and [prompt controls](/study/aiAWSServices#model-prompt-controls).

## 8. Optional: validate one connected implementation {#practice-project}

Build a synthetic two-tenant Northstar assistant with versioned manuals and a test work-order API:

1. Test exact IDs, tables, conflicting versions, source updates, and deletion.
2. Combine bounded diagnosis, approval, and an idempotent write; inject a timeout and check the authoritative result.
3. Test missing ACL metadata, cross-tenant retrieval, document injection, and sensitive input/logs.
4. Measure retrieval quality, task completion, first-token/total latency, queue age, and cost per successful outcome.
5. Introduce a regression, locate the first failure, block promotion, and verify rollback.

Keep a decision record with rejected alternatives, a correlated trace, and a before/after release report. The [connected service examples](/study/aiAWSServices#aws-connected-examples) show implementation combinations.

## 9. Check breadth and readiness {#readiness}

| Domain | Weight | Be able to defend |
|---|---:|---|
| [1 — Foundation Model Integration, Data Management, and Compliance](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain1.html) | 31% | Model/prompt choice, validation, vector stores, retrieval, prompt governance. |
| [2 — Implementation and Integration](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain2.html) | 26% | Agent/tool boundaries, enterprise APIs, orchestration, and recovery. |
| [3 — AI Safety, Security, and Governance](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain3.html) | 20% | Safety, access, privacy, residency, organization controls, audit, responsible AI. |
| [4 — Operational Efficiency and Optimization](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain4.html) | 12% | Tokens/caching, capacity economics, delivery latency, and monitoring. |
| [5 — Testing, Validation, and Troubleshooting](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain5.html) | 11% | Evaluation, diagnosis, release gates, rollout, and rollback. |

You are ready when you can explain the constraint, defend the design, reject the nearest alternative, and say what would change your answer across all five domains.
