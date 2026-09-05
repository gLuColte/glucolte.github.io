---
title: AWS GenAI Professional Preparation
permalink: /study/aiGenAIProfessional
---

# AWS GenAI Professional Preparation

Prepare for **AWS Certified Generative AI Developer – Professional (AIP-C01)** by applying the [seven-page AI learning sequence](/study/#ai) to production scenarios. Use [AWS AI Services](/study/infrastructureAWSAiServices) as the implementation reference; this page owns exam planning, practice, and readiness checks.

**Blueprint checked: 5 September 2026.** The exam guide describes 65 scored questions plus 10 unscored questions, with a minimum scaled passing score of 750 out of 1,000. That is not a raw 75% accuracy target. AWS's target profile includes two or more years building production applications and one year implementing GenAI solutions. [Official exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html).

## 1. Establish the prerequisite skills {#prerequisites}

Start with the introduction if you cannot yet explain tokens/context, model selection, prompting, retrieval, and bounded tool execution. For this professional track, also be comfortable reading IAM policies, tracing an API request, working with S3 and queues, deploying through infrastructure as code, and investigating logs and metrics.

The guide excludes developing/training models from scratch and advanced ML techniques as target job tasks. It does include deploying and managing customized foundation models. Focus on application integration and operational decisions; revisit training theory only when a scenario depends on it. [Exam scope](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html).

## 2. Map the blueprint to the notes {#domains}

The labels below abbreviate AWS's domain names. Weights indicate the share of scored content, not a required allocation of study time. Follow each official domain link for its full task and skill list.

| Domain | Weight | Task coverage | Read here |
|---|---:|---|---|
| [1 — Models, data, and compliance](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain1.html) | 31% | 1.1 architecture; 1.2 model selection/configuration; 1.3 data preparation; 1.4 vector stores; 1.5 retrieval; 1.6 prompt governance. | [Models](/study/aiModels), [prompts](/study/aiPromptEngineering), [retrieval](/study/aiKnowledgebases). |
| [2 — Implementation and integration](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain2.html) | 26% | 2.1 agents/tools; 2.2 deployment; 2.3 enterprise integration; 2.4 model APIs; 2.5 application patterns and development tools. | [Agents](/study/aiAgents), [platform adoption](/study/aiInfrastructure#section-2-company-adoption), [AWS APIs](/study/infrastructureAWSAiServices#section-2-1-inference). |
| [3 — Safety and governance](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain3.html) | 20% | 3.1 input/output safety; 3.2 privacy; 3.3 governance/compliance; 3.4 responsible AI. | [Security and data protection](/study/aiInfrastructure#section-3-identity), [judges/human review](/study/aiInfrastructure#section-14-judging), [AWS controls](/study/infrastructureAWSAiServices#section-9-supporting-services). |
| [4 — Efficiency and operations](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain4.html) | 12% | 4.1 cost/resources; 4.2 performance; 4.3 monitoring. | [Latency](/study/aiInfrastructure#section-9-latency), [cost/caching](/study/aiInfrastructure#section-10-cost), [observability](/study/aiInfrastructure#section-11-observability). |
| [5 — Evaluation and troubleshooting](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain5.html) | 11% | 5.1 evaluation systems; 5.2 diagnosis and repair. | [Evaluation architecture](/study/aiInfrastructure#section-12-evaluation), [RAG metrics](/study/aiKnowledgebases#evaluation-does-the-system-retrieve-and-answer-well), [agent metrics](/study/aiAgents#section-9-evaluation). |

Use the linked notes for the concepts, then study the official skills for breadth. In particular, practise multimodal ingestion, incremental index updates/deletion, enterprise identity federation, fairness comparisons, model documentation, and developer tooling; the introductory notes are not a complete exam syllabus.

Do not memorize a second service catalogue. Review AWS's [in-scope services](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html), marking unfamiliar ones by the task they support. A listed service does not imply every feature will be tested.

## 3. Build one practice project across all five domains {#practice-project}

Use a fictional maintenance assistant with synthetic manuals for two plants. It answers questions with citations and can propose a work order through a test API. The following are exercises to perform, not a report of an already deployed or validated system.

### Domain 1 exercise: choose evidence and model

Create manuals containing headings, a table, a scanned page, conflicting versions, and an exact asset ID. Compare two chunking/retrieval configurations and two candidate generation models on the same questions. Replace one document and delete another, then verify the index reflects both changes.

Produce a short decision record: requirements, selected model/access path, ingestion strategy, retrieval measurements, and why customization is or is not justified. Include a versioned prompt and an embedding migration plan. These exercises extend the architecture/data skills in [Domain 1](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain1.html).

### Domain 2 exercise: integrate an action

Add `get_asset_health` and `create_work_order` tools. Define schemas and business validation, then put approval and durable status around work-order creation. Inject a timeout after the test API accepts the order; demonstrate that recovery creates no duplicate order. Compare an explicit workflow with an agent for the diagnostic portion.

Keep a deployment manifest and one trace showing the request, tool proposal, approval decision, API result, and final response. Add a tested fallback path for model throttling. Relate your implementation choices to [Domain 2](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain2.html).

### Domain 3 exercise: test access and responsible behaviour

Give each test identity access to one plant. Insert a manual that asks the assistant to reveal another plant's records. Also test missing ACL metadata, an expired user entitlement, PII in an input, and sensitive content entering logs. Record the enforcing component and expected outcome for each case.

Compare answer/refusal quality across language and user cohorts. Write a model/system limitation note and a retention/deletion policy for the synthetic data. Keep evidence showing access failures are blocked independently of model wording. These tasks support [Domain 3](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain3.html).

### Domain 4 exercise: improve a measured bottleneck

Measure retrieval time, time to first token, total task latency, token use, and cost for a fixed workload. Change one factor—context size, routing, retrieval depth, or caching—and compare results against the baseline. Re-run after a document update and a permission change to check cache invalidation.

Produce a before/after table with quality alongside performance and cost. Add a quota-pressure or queue-age alarm and show how it leads to a useful operator response. Explain how the experiment addresses [Domain 4](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain4.html).

### Domain 5 exercise: qualify and repair a release

Introduce three regressions separately: a parser drops a table condition, a prompt invents missing evidence, and a tool retry repeats an action. Locate the first failed boundary using traces, then create a regression case and repair it. Calibrate an automated judge against human labels, including disagreements.

Produce a release decision with component results, end-to-end outcomes, security gates, and rollback criteria. Test the rollback itself. Tie the evidence to [Domain 5](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain5.html).

## 4. Practise choosing under constraints {#scenarios}

These are original study scenarios, not official AWS questions. For each, identify the decisive requirement, choose a response, and explain why the nearest alternative fails. Use the linked lesson only after answering.

### Scenario A: changing policies and inconsistent format

A support assistant must cite weekly policy updates. Its answers also vary in tone. Which problem should retrieval solve, and what should you try for the tone first?

<details markdown="1">
<summary>Check the reasoning</summary>

Use retrieval for the versioned policy evidence, and evaluate a prompt/template change for tone. Consider fine-tuning only if the stable behaviour remains inadequate under measured prompting. The two requirements need separate evidence of improvement. [Adaptation choices](/study/aiModels#model-adaptation).

</details>

### Scenario B: excellent similarity, wrong customer

A search result perfectly matches the question but belongs to another customer. The model has a Guardrail and a “never reveal private data” instruction. Where should access be blocked?

<details markdown="1">
<summary>Check the reasoning</summary>

At the application/retrieval authorization boundary, before the result reaches model context. Derive customer scope from trusted identity and test the missing-ACL case. Neither relevance nor a model instruction grants access. [Tenant isolation](/study/aiInfrastructure#section-3-identity).

</details>

### Scenario C: known workflow, ambiguous diagnosis

Diagnosis needs different tools depending on the observations, but approval and work-order creation follow a fixed process. Should one autonomous loop own the entire task?

<details markdown="1">
<summary>Check the reasoning</summary>

Use bounded agent decisions for diagnosis and a deterministic workflow for approval and creation. On AWS, an AgentCore agent can participate in a Step Functions workflow; the maintenance API owns transaction validation. [Orchestration choices](/study/infrastructureAWSAiServices#section-3-1-agentcore-boundary).

</details>

### Scenario D: faster display, same overnight backlog

A team switches an archive summarizer to streaming, expecting cheaper processing of millions of stored records. What requirement did it optimize, and what should it investigate instead?

<details markdown="1">
<summary>Check the reasoning</summary>

Streaming changes incremental delivery. For the archive, evaluate supported batch inference, throughput, job recovery, and total cost at the required quality. Keep interactive latency separate from offline completion deadlines. [Bedrock inference options](/study/infrastructureAWSAiServices#section-2-1-inference).

</details>

### Scenario E: a better reranker finds nothing

An exact equipment identifier is absent from the first-stage candidates. Increasing reranker quality has no effect. Where should the next experiment run?

<details markdown="1">
<summary>Check the reasoning</summary>

Check source ingestion, identifier preservation, query filters, and lexical/hybrid candidate retrieval. A reranker can reorder only the candidates it receives. Compare candidate recall before scoring final-answer quality. [Retrieval methods](/study/aiKnowledgebases#how-can-we-retrieve-relevant-information).

</details>

### Scenario F: a cheaper release with a hidden regression

A model replacement reduces average cost and improves average correctness. One language cohort has more unsupported answers, and a permission-denial test now fails. Should the release pass?

<details markdown="1">
<summary>Check the reasoning</summary>

Reject the security regression and investigate the affected cohort against its acceptance criteria. Averages cannot compensate for unauthorized disclosure. Preserve the baseline and fix or roll back before promotion. [Release gates](/study/aiInfrastructure#section-15-production-eval).

</details>

## 5. Turn practice into a study plan {#study-plan}

1. **Diagnose:** try the official practice material linked from the [AWS certification page](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/). Record confidence as well as correctness.
2. **Classify misses:** tag each by domain/task, misunderstood constraint, confused service boundary, or missing hands-on experience.
3. **Repair:** revisit the owning lesson or official service documentation, then perform the smallest experiment that resolves the uncertainty.
4. **Retest:** use unseen questions and explain rejected alternatives. Recalling an answer is weaker evidence than recognizing a changed constraint.

Keep a compact error log:

| Task ID | Decisive constraint missed | Evidence/documentation | Next exercise | Retest result |
|---|---|---|---|---|
| Example: 1.5 | Exact asset identifier absent from candidates | Retrieved ranks and query trace | Add lexical retrieval and compare recall | Record after retest |

## 6. Readiness check {#readiness}

You should be able to:

- Defend a design from requirements through AWS service choice and a rejected alternative.
- Show measured evidence for retrieval quality, action correctness, security, latency, and cost.
- Diagnose an unfamiliar failure from a trace and propose a testable repair.
- Explain model/API/Region limitations and a workable fallback or rollback.
- Complete timed, unseen practice with stable results across domains, then explain the misses.

These are study criteria, not a pass guarantee. Use the current official blueprint when revising: a new product release does not automatically change exam scope. For example, the service page records the [Agents Classic availability notice](/study/infrastructureAWSAiServices#section-3-1-agentcore-boundary); older practice material may still use its terminology and architecture.
