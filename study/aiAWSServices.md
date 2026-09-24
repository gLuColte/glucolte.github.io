---
title: AWS AI Services
permalink: /study/aiAWSServices
tag:
  - Amazon Bedrock
  - Amazon SageMaker AI
  - Amazon Kendra
  - Amazon Comprehend
  - SageMaker Canvas
  - SageMaker Ground Truth
  - Amazon Augmented AI (A2I)
  - SageMaker Model Monitor
  - SageMaker Model Dashboard
  - SageMaker Model Cards
  - SageMaker Feature Store
  - Amazon Mechanical Turk
  - Amazon Rekognition
  - AWS Audit Manager
  - Amazon OpenSearch Service
  - Amazon Q Business
  - AWS Glue Data Quality
  - Amazon Bedrock Data Automation
  - prompt caching
  - intelligent prompt routing
  - asynchronous inference
  - PII redaction
  - Amazon Transcribe
  - Amazon Comprehend Medical
  - AWS AppConfig
  - LoRA adapters
  - SageMaker Pipelines
  - GraphRAG
  - AWS PrivateLink
---

# AWS AI Services

Use this page to choose AWS implementations for the architecture learned in the preceding pages. Service behavior and lifecycle notices were reviewed on **17 September 2026**, with the practice-driven API and configuration notes checked on **20 September 2026**; check the exact model, API, Region, feature, and account availability before implementation.

**Part 7 of 7:** [Infrastructure and evaluation](/study/aiInfrastructure) → **AWS AI Services**. Continue optionally to [AWS GenAI Professional preparation](/study/aiGenAIProfessional) for exam-domain study and practice.

## 1. Architecture mapped to AWS {#section-1-decisions}

<!-- Older section links are retained at their consolidated destination. -->
<span id="agent-layer-map"></span>
<span id="section-10-decision-flow"></span>

Use this map to locate the implementation decision. Each service is explained once in the sections below; the choices can be combined.

| Architecture layer | AWS decision |
|---|---|
| Model | [Bedrock APIs and capabilities](#section-2-bedrock), or [SageMaker AI for lifecycle/serving control](#section-4-bedrock-sagemaker). |
| Agent controller | [AgentCore, Agents Classic, or deterministic orchestration](#section-3-1-agentcore-boundary). |
| Retrieval | [Knowledge Bases, OpenSearch, or Kendra](#section-8-retrieval-choice). |
| Interface, tools, and durable state | [Application services](#section-9-supporting-services). |
| Security and operations | [Identity/network controls](#section-9-1-entry) and [encryption/telemetry](#section-9-4-operations). |

```text
Authenticated application → permitted retrieval → Bedrock model
                                    ↑                  ↓
                              evidence/context   answer or tool proposal
                                    ↑                  ↓
                              tool result ← authorized business workflow
```

For the underlying responsibilities, return to the [production architecture](/study/aiInfrastructure#section-1-architecture) or [agent tool loop](/study/aiAgents#section-1-boundaries).

<figure class="aws-architecture" aria-labelledby="northstar-map-caption">
  <div class="aws-architecture__title">Northstar Assistant: one running example</div>
  <div class="aws-choice-grid">
    <div class="aws-choice aws-choice--text aws-choice--storage"><strong>1. Prepare</strong><small>S3 documents and customer messages<br><br>Glue Data Quality checks fields<br>Textract reads scanned forms</small></div>
    <div class="aws-choice aws-choice--text aws-choice--security"><strong>2. Protect</strong><small>Comprehend finds PII spans<br>Glue Sensitive Data Detection masks ETL data<br>Guardrails filters supported model interactions</small></div>
    <div class="aws-choice aws-choice--text aws-choice--storage"><strong>3. Retrieve</strong><small>Knowledge Base chunks clean documents<br>Embeddings are indexed in OpenSearch<br>Retrieve applies user authorization filters</small></div>
    <div class="aws-choice aws-choice--text aws-choice--ai"><strong>4. Generate and operate</strong><small>Bedrock generates the answer<br>AppConfig selects the model<br>CloudWatch, X-Ray, and CloudTrail explain what happened</small></div>
  </div>
  <figcaption id="northstar-map-caption">Northstar is one consistent example: every service owns one stage of the same customer-assistant pipeline.</figcaption>
</figure>

Use the Northstar flow as a memory anchor. When a question says **“protect PII before the model sees it,”** walk left to right: extract text if needed, detect or mask the PII, then build the prompt. When it says **“protect who may retrieve a document,”** move to the retrieval boundary and apply a server-side Knowledge Base filter. When it says **“audit who called the service,”** move to CloudTrail rather than a content filter.

## 2. Amazon Bedrock {#section-2-bedrock}

Bedrock provides managed access to foundation models and GenAI application capabilities. The chosen model and access path determine supported modalities, context/output limits, inference controls, tool/schema behaviour, quotas, and Regions.

### 2.1 Inference APIs and capacity {#section-2-1-inference}

<span id="211-choose-the-bedrock-api-and-capacity-mode"></span>

| Integration need | API |
|---|---|
| Consistent message interface across compatible models | `Converse`; `ConverseStream` for streamed output. |
| Model-specific invocation payload | `InvokeModel`; `InvokeModelWithResponseStream` for streaming. |
| Supported asynchronous video generation with results in S3 | `StartAsyncInvoke`; inspect job status separately. |
| Existing compatible client integration | Check the model's supported Chat Completions, Responses, or Messages interface. |

These are integration choices, not interchangeable capabilities. See the [AWS API compatibility matrix](https://docs.aws.amazon.com/bedrock/latest/userguide/models-api-compatibility.html) for supported models, bidirectional streaming, and endpoint differences.

| Traffic/capacity requirement | Bedrock option | Check |
|---|---|---|
| Variable demand without reserved capacity | On-demand inference | Model quotas and throttling. |
| Sustained demand that justifies reserved capacity | Provisioned Throughput | Model support, commitments, and expected utilization. |
| Finite dataset processed offline | Batch inference | Supported model, job format, and output handling; this is separate from a single async invocation. |
| Eligible requests distributed across Regions | Cross-Region inference profile | Destination Regions, organizational policies, IAM, and quotas. |
| Workload-level usage attribution | Application inference profile | Tags and the underlying model or routing profile. |

Use the cloud-neutral [serving and caching rules](/study/aiInfrastructure#101-serving-and-caching-decision-rules) to select a pattern. AWS details: [Provisioned Throughput](https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html), [batch inference](https://docs.aws.amazon.com/bedrock/latest/userguide/batch-inference.html), and [inference profiles](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles.html).

### 2.2 Application capabilities {#section-2-2-capabilities}

| Capability | AWS-specific role |
|---|---|
| [Prompt management](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html) | Store templates, variables, model configuration, variants, and versions. |
| [Flows](https://docs.aws.amazon.com/bedrock/latest/userguide/flows.html) | Connect prompt/model/retrieval nodes, conditions, and supported integrations in an explicit flow. |
| [Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html) | Apply supported content, topic, word, sensitive-information, and grounding policies. |
| [Evaluation](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html) | Run supported model and RAG evaluations using the workload's datasets and metrics. |
| [Customization and import](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html) | Adapt or import supported models; verify the technique and deployment path for the selected model. |

Knowledge Bases and agent capabilities have their own sections below. Guardrails filter model interactions; [IAM and application authorization](#section-9-1-entry) still decide which resources and actions a caller may use.

### 2.3 Routing, caching, and capacity solve different cost problems {#routing-caching-capacity}

| Workload clue | Capability | What changes |
|---|---|---|
| Many simple questions, fewer difficult ones | **Intelligent Prompt Routing** | Select a cheaper or stronger supported model for each prompt according to predicted response quality. |
| Same long policy prefix, different questions | **Prompt caching** | Reuse processing of the shared prefix while generating a new answer. |
| Equivalent questions with reusable answers | Application result/semantic cache | Return an authorized, current cached answer and avoid a model call. |
| Predictable sustained token demand | **Provisioned Throughput** | Reserve model capacity at an hourly cost; measure utilization and commitment economics. |

Intelligent Prompt Routing uses supported models within the same family. For a support bot with 60% routine questions and 40% complex questions, evaluate whether the cheaper route meets the simple-query rubric while the stronger route preserves complex-answer quality. Verify the supported model pair and Region; do not assume a named Haiku/Sonnet version is supported merely because both models are available in Bedrock. Savings and quality are workload-dependent. [Intelligent Prompt Routing documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-routing.html).

Prompt caching fits a **5,000-token policy reused ahead of different customer questions**. Keep the reusable prefix stable and follow the model's cache checkpoint, minimum-length, and expiry rules. Cache reads can still be billed; cache writes and uncached input/output have their own applicable rates. This is reduced repeated processing, not “pay once forever.” ElastiCache or CloudFront response caching addresses a different reusable unit. [Prompt caching documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html).

For predictable busy days and quiet nights, compare provisioned capacity plus on-demand with on-demand alone using **input/output token rates**, utilization, and billing terms. Sending night traffic to on-demand does not stop charges for an existing provisioned resource. Billing continues until deletion; committed capacity cannot simply be switched off each night. A daily create/delete strategy also needs eligible no-commitment support and provisioning lead time. High request count alone does not establish a saving. [Provisioned Throughput billing and commitments](https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html).

### 2.4 Data Automation: documents to structured fields {#data-automation}

**Amazon Bedrock Data Automation (BDA)** turns supported unstructured documents and other media into useful output. Standard output provides document representations; custom **blueprints** define fields to extract or infer, such as contract parties, dates, obligations, and payment terms. Configure the project, blueprint, S3 input/output, and permissions instead of assembling every parser and extraction step yourself. [BDA overview](https://docs.aws.amazon.com/bedrock/latest/userguide/bda.html).

Use **Textract** when OCR, forms, tables, or its supported document-analysis features meet the need. Prefer BDA when managed semantic extraction into a task-specific structure is decisive. Textract is more than raw OCR, but a Textract-only response is not automatically a complete contract-analysis workflow. Validate extracted fields before database ingestion; BDA output in S3 is not itself a database write.

File support depends on the API: the asynchronous document path supports PDF, TIFF, JPEG, PNG, and DOCX; the synchronous path has different limits and does not support DOCX. Do not generalize this to every Word format or unlimited file sizes. [BDA input requirements](https://docs.aws.amazon.com/bedrock/latest/userguide/bda-limits.html).

### 2.5 Fine-tuning changes behaviour; re-embedding changes the index {#bedrock-customization}

<figure class="aws-architecture" aria-labelledby="bedrock-map-caption">
  <div class="aws-architecture__title">Bedrock: choose the feature, then its control</div>
  <div class="aws-choice-grid">
    <div class="aws-choice aws-choice--text aws-choice--compute"><strong>Generation</strong><small>Prompt / schema / sampling<br><br>JSON Schema → output structure<br>Temperature → variation<br>Prompt cache → repeated prefix</small></div>
    <div class="aws-choice aws-choice--text aws-choice--workflow"><strong>Retrieval</strong><small>Data source → index → query<br><br>Parser → preserve structure<br>Chunking → evidence boundaries<br>Filter → permitted candidates</small></div>
    <div class="aws-choice aws-choice--text aws-choice--agent"><strong>Evaluation</strong><small>Question → comparison target<br><br>Faithfulness → retrieved context<br>Correctness → answer accuracy<br>Human rubric → persona and creativity</small></div>
  </div>
  <figcaption id="bedrock-map-caption">Read top to bottom within each card: responsibility → feature → setting or evidence.</figcaption>
</figure>

For a distinctive brand voice with paired product descriptions and desired captions, use **supervised fine-tuning** on a supported model. Continued pre-training uses an unlabelled domain corpus; few-shot prompting resends examples at inference. Prepare model-specific **JSONL**, not a generic CSV. A collection of successful captions still needs appropriate input/output examples; 1,000 records is not a universal quality guarantee or minimum across models. Verify current model customization availability. [Bedrock fine-tuning](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-model-fine-tuning.html).

**Titan Multimodal Embeddings G1** supports customization with image–caption pairs (`image-ref`, `caption`) and a validation dataset. If held-out testing confirms poor representation of a new visual domain, fine-tune, then re-embed the searchable catalogue and encode queries with the compatible customized version. Build and validate a new index before switching both paths together. Hybrid metadata search may help immediately but does not adapt the visual representation; Guardrails grounding is not a visual similarity retriever. [Titan multimodal customization](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-multiemb-models.html).

**Titan Text Embeddings V2** supports 1,024, 512, or 256 dimensions. At equal float precision, 256 dimensions use one quarter of the raw vector bytes of 1,024. Index overhead, minimum compute capacity, embedding token charges, and measured recall still determine total savings. Small corpus size alone does not prove 256 dimensions suffice. Titan Text G1 uses **1,536**, not 1,024, dimensions. [Titan text embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html).

### 2.6 Visual prompt chains and evaluation jobs {#bedrock-flows-evaluation}

**Bedrock Flows** fits a fixed prompt chain built visually inside the Bedrock console:

```text
Flow input → Draft Prompt → Safety Prompt → Condition
                  │                           ├─ Safe → Polish Prompt → output
                  └─ keep draft available ─────└─ Risky/unknown → Sanitize or review
```

Give each Prompt node its own supported model/configuration. Wire both the classification and original draft to the appropriate downstream inputs; route malformed or unknown classifications explicitly. A Condition node evaluates the configured expression—it does not infer business policy. Step Functions is stronger for broader durable AWS workflows; an agent is for model-selected actions. A model calling its own draft “Safe” is not an independent security guarantee. [Flow nodes](https://docs.aws.amazon.com/bedrock/latest/userguide/flows-nodes.html).

| Evaluation requirement | Bedrock setting | What is compared |
|---|---|---|
| Answer invents facts absent from retrieved text | Retrieve-and-generate → `Builtin.Faithfulness` | Answer claims versus retrieved evidence. |
| Retrieved passages are off topic | Retrieve-only → `Builtin.ContextRelevance` | Passages versus question. |
| Answer is inaccurate | Retrieve-and-generate → `Builtin.Correctness` | Answer quality/correctness; reference requirements depend on the evaluation configuration. |
| Answer omits parts of the question | Retrieve-and-generate → `Builtin.Completeness` | Coverage of the requested answer. |
| Creative persona judged by internal experts | Human model comparison → private work team → custom rubric/Likert ratings | Base versus candidate responses on the same held-out prompts. |

Faithfulness is not the same as general factual correctness: a true claim can still be unsupported by the supplied source. Similarity metrics cannot replace a creativity rubric. A2I can support custom human review, but a native comparison campaign avoids building that evaluation workflow yourself. [RAG metrics](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-evaluation-metrics.html) and [human rating methods](https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation-report-human-customer.html).

**Prompt regression pipeline:** version templates in Prompt management, generate candidate responses on a versioned S3 evaluation set, and run CodeBuild assertions for required facts/schema plus an appropriate Bedrock factuality evaluation. Pass supported resources or precomputed candidate outputs to the evaluation job as required by its API. Promote only after both gates pass; saving a prompt version does not run these checks automatically. [Prompt versions](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html) and [evaluation options](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html).

## 3. Amazon Bedrock AgentCore {#section-3-agentcore}

AgentCore supplies modular services around an agent. Choose only the components your implementation needs. It supports custom frameworks and models beyond Bedrock. [AWS AgentCore overview](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html).

| Component | Responsibility |
|---|---|
| Runtime / Harness | Host custom agent code / use a managed agent loop. |
| Gateway | Connect APIs, Lambda functions, and MCP tools. |
| Identity / Policy | Obtain authorized credentials / enforce deterministic rules on Gateway tool calls. |
| Memory | Store scoped conversation events and longer-lived memories. |
| Browser / Code Interpreter | Run browsing or code tasks in isolated environments. |
| Observability / Evaluations | Trace execution and assess agent/tool outcomes. |
| Registry | Catalog and govern agents, MCP servers, tools, skills, and custom resources. |
| Optimization | Generate and test versioned prompt/tool-configuration improvements from agent traces. |
| Payments | Give agents controlled access to compatible paid services with wallet and spending-limit controls. |

### 3.1 Choose the orchestration boundary {#section-3-1-agentcore-boundary}

| Option | Use it for |
|---|---|
| AgentCore | Agent execution needing managed runtime, tool connectivity, or the other modules above. |
| Bedrock Agents Classic | Existing workloads using instructions, action groups, knowledge bases, versions/aliases, and agent traces. |
| Step Functions | Known business states, retries, and approval paths; use a Standard workflow when a callback task token or long wait is required. It can invoke an agent as one bounded step. |

Standard Workflows support `.waitForTaskToken`; Express Workflows support request-response integrations but not callback task tokens or `.sync` job runs. [Step Functions integration patterns](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html).

**Current availability:** AWS states that Agents Classic is closed to new customers; existing customers may continue using it. AWS points new implementations toward AgentCore. [Agents Classic notice](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html).

### Agent traces and AgentCore telemetry have separate controls {#agent-trace-controls}

```text
Bedrock Agents Classic
└─ InvokeAgent(enableTrace=true)
   └─ response stream: persist each trace event / TracePart
      └─ orchestrationTrace
         ├─ modelInvocationInput → what was sent to the model
         ├─ invocationInput      → requested tool/action
         ├─ observation          → returned tool data / retrieval evidence
         └─ rationale            → emitted explanation of the decision

AgentCore resources
├─ Runtime → session metrics; enable richer signals/instrumentation
├─ Memory  → metrics; explicitly enable spans/logs
├─ Gateway → metrics and service spans; configure logs
└─ CloudWatch Transaction Search → one-time trace dashboard setup
```

For a refund refusal, correlate the order date in the tool **observation** with subsequent actions and emitted **rationale**. The input prompt only establishes what instructions were supplied. Persist trace events while consuming the stream, with sensitive-content controls; neither CloudTrail, model invocation logs, nor `GetAgentMemory` replaces those orchestration events. Trace variants are optional—not every event contains every stage. Generated rationale is diagnostic evidence, not proof of the model's full internal reasoning or authorization; enforce the refund rule in the tool. [Agent trace schema](https://docs.aws.amazon.com/bedrock/latest/userguide/trace-events.html).

**Checked 20 September 2026:** the current AgentCore service-data table lists Gateway **metrics and spans**, with logs requiring enablement. Older practice answers saying “Gateway metrics only” are incomplete. Runtime/agent and Memory spans/logs require explicit enablement. Transaction Search enables the documented GenAI trace experience; ADOT/OpenTelemetry instrumentation supplies detailed application spans. `DISABLE_ADOT_OBSERVABILITY=true` disables the default ADOT setup—it does not install a third-party exporter. [Service-provided signals](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-service-provided.html) and [observability setup](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-configure.html).

### 3.2 Example: plant-maintenance agent {#section-3-2-industrial-example}

A plant engineer asks why a pump is vibrating and requests a maintenance work order. Runtime hosts the controller; Gateway connects `get_asset_health`, `search_manuals`, and `create_work_order`. Plant telemetry and work-order status remain in the operational systems. The sequence shows how a model proposal reaches a business action:

<div class="image-wrapper">
  <img src="./assets/agentcore_industrial_maintenance_sequence.png" alt="Production industrial maintenance agent using Amazon Bedrock AgentCore" class="modal-trigger" data-caption="Industrial maintenance request through AgentCore with policy and human approval">
  <div class="diagram-caption" data-snippet-id="agentcore-industrial-sequence-snippet">
    🏭 Production AgentCore sequence: diagnose freely, mutate only with approval
  </div>
  <script type="text/plain" id="agentcore-industrial-sequence-snippet">
@startuml
title Industrial maintenance agent with Amazon Bedrock AgentCore
actor "Plant Engineer" as User
participant "App + Cognito\nAPI Gateway" as Edge
participant "AgentCore Runtime\nSupervisor Agent" as Runtime
participant "AgentCore Identity\nPolicy + Memory" as Controls
participant "Bedrock Model" as Model
participant "AgentCore Gateway\nBounded MCP Tools" as Gateway
participant "Knowledge + Plant Systems\nKB / OpenSearch / CMMS / SiteWise" as Systems
participant "Step Functions\nHuman Approval" as Approval
participant "CloudWatch / OTel\nCloudTrail" as Audit

User -> Edge: Ask about pump vibration
Edge -> Edge: Authenticate; derive user, role, plant
Edge -> Runtime: Request + trusted claims
Runtime -> Controls: Load plant-scoped memory and permissions
Controls --> Runtime: Context + allowed actions
Runtime -> Model: Instructions + evidence needs + tool schemas
Model --> Runtime: Proposed tool call
Runtime -> Controls: Authorize principal, plant, tool, arguments

alt Read-only diagnosis is permitted
  Controls --> Runtime: Permit
  Runtime -> Gateway: get_asset_health / search_manuals
  Gateway -> Systems: Authorized, validated request
  Systems --> Gateway: Telemetry / permitted evidence
  Gateway --> Runtime: Structured result + source IDs
else State-changing or high-impact action
  Controls --> Runtime: Require approval
  Runtime -> Approval: Proposed action + reason + scope
  Approval -> User: Request approval
  User --> Approval: Approve or reject
  Approval --> Runtime: Signed workflow decision
  Runtime -> Gateway: create_work_order + idempotency key
  Gateway -> Systems: Authorized business API call
  Systems --> Gateway: Work-order ID / rejection
  Gateway --> Runtime: Structured result
end

Runtime -> Model: Tool result; request grounded response
Model --> Runtime: Response draft
Runtime -> Controls: Store scoped summary, not plant record
Runtime -> Audit: Trace model, policy, retrieval, tool, outcome
Runtime --> Edge: Answer + evidence + action status
Edge --> User: Display result
@enduml
  </script>
</div>

The maintenance API must enforce the engineer's plant-level permissions and reconcile retries. A conversational memory is not an asset record, and an agent must not bypass industrial safety controls.

## 4. Amazon Bedrock versus SageMaker AI {#section-4-bedrock-sagemaker}

The decision is **managed model capabilities versus control over the ML lifecycle and serving environment**. Bedrock fits supported model APIs and the capabilities in section 2; SageMaker AI fits custom training code, artifacts, containers, compute, and endpoints. A system can use a SageMaker classifier alongside Bedrock generation.

<span id="41-sagemaker-ai-lifecycle-patterns"></span>
<span id="section-12-1-platforms"></span>

| Lifecycle need | SageMaker AI capability |
|---|---|
| Develop and prepare data | Studio, Data Wrangler, Processing. |
| Build predictions through a visual interface | Canvas. |
| Reuse features across training and inference | Feature Store. |
| Label data / add human prediction review | Ground Truth / Amazon A2I. |
| Start from a pretrained model | JumpStart. |
| Customize with controlled code and compute | Training jobs; Automatic Model Tuning for hyperparameter trials. |
| Version and approve artifacts | Model Registry; Model Cards for model documentation. |
| Automate lifecycle stages | Pipelines. |
| Serve online, intermittent, queued, or offline workloads | Real-time, serverless, asynchronous inference, or Batch Transform, subject to model/endpoint support. |
| Assess bias/explanations and monitor drift | Clarify and Model Monitor, with task-appropriate checks. |
| Inspect model governance and monitoring coverage | Model Dashboard. |

Match endpoint scaling, cold starts, model loading, hardware requirements, and utilization to the workload. [SageMaker AI features](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis-features.html) and [deployment options](https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html) describe the supported paths. The reason to customize a model is covered in [Models: adaptation choices](/study/aiModels#model-adaptation).

### 4.1 Choose hosting by hardware control and delivery mode {#sagemaker-inference-options}

For a fine-tuned open-weight LLM that needs **selected GPU instance types and custom endpoint scaling policies**, choose **SageMaker AI real-time endpoints**. SageMaker manages serving infrastructure while the team configures the supported instance family, model/container, and scaling policy. Direct EC2 hosting offers more host-level control with more operational work. [Real-time inference](https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints.html).

Bedrock **Custom Model Import does support compatible customized open models**, including supported Llama architectures. The reason it loses the GPU-selection scenario is that Bedrock abstracts serving infrastructure; it is not that custom import is impossible. Comprehend and Textract provide specialized analysis APIs, not arbitrary LLM hosting. [Custom Model Import](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html).

| Delivery requirement | SageMaker option | Decisive boundary |
|---|---|---|
| Low-latency synchronous response with selected serving instances | Real-time inference | Provision and scale endpoint capacity for the latency target. |
| Unpredictable arrivals; each video takes 10–30 minutes; callers can wait | **Asynchronous Inference** | Managed request queue, S3 input/output, up to 1 GB payloads and one-hour processing; configure scaling to zero. |
| Known dataset to process as a job | **Batch Transform** | Job-based offline inference without a persistent endpoint; jobs can be scheduled or triggered on demand. |

For asynchronous inference, the **service queues requests; S3 holds payloads and results**. Configure both scale-in to zero and scale-out when work arrives with no running instances. Cold starts add delay, and storage/monitoring charges can remain when endpoint compute is zero. Batch Transform is not restricted to nightly schedules, but asynchronous inference directly supplies the arrival-driven queue/endpoint pattern. A conventional Lambda invocation's 15-minute limit cannot cover a 30-minute inference task. [Asynchronous inference](https://docs.aws.amazon.com/sagemaker/latest/dg/async-inference.html), [autoscaling](https://docs.aws.amazon.com/sagemaker/latest/dg/async-inference-autoscale.html), and [Batch Transform](https://docs.aws.amazon.com/sagemaker/latest/dg/batch-transform.html).

### 4.2 SageMaker Canvas: a visual ML workflow {#sagemaker-canvas}

**SageMaker Canvas** lets users prepare data, build and evaluate supported custom models, and generate predictions without writing training code. Typical tasks include classification, numeric prediction, and time-series forecasting. It also offers ready-to-use AI models and generative-AI capabilities.

For example, a business analyst can import historical customer records, choose churn as the target, build a model, inspect its evaluation, and predict churn for new records. A visual interface does not remove responsibility for label quality, leakage, permissions, or evaluation. Choose Canvas for a supported visual workflow; use SageMaker's code-based tools when custom algorithms and training control are required. [SageMaker Canvas documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/canvas.html).

### 4.3 Feature Store: reusable inputs for training and inference {#feature-store}

A **feature** is a model input such as `purchases_last_30_days`. **SageMaker Feature Store** stores reusable feature records and metadata in feature groups, reducing repeated preparation and helping keep training and serving inputs consistent.

| Store | Purpose | Example |
|---|---|---|
| **Online store** | Low-latency access to the latest feature records | Retrieve a customer's current purchase count for a live prediction. |
| **Offline store** | Historical records in S3 for exploration, training, and batch inference | Build a dataset using features available at each historical prediction time. |

Use either store or both. Records have identifiers and event times; pipelines can ingest batches or streaming updates. Historical training queries must avoid using future information. Sharing feature definitions helps reduce **training-serving skew**, but freshness and transformation logic still need controls. A feature store's main job is reusable ML inputs; a RAG vector index's main job is similarity retrieval. [Feature Store documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store.html).

### 4.4 Ground Truth, Mechanical Turk, and A2I {#labeling-human-review}

The distinction is **training-data labels**, **human workers**, and **reviewing predictions**:

| Capability | Role | Example |
|---|---|---|
| **SageMaker Ground Truth** | Create labelled datasets with managed labelling workflows and supported task templates | Draw object bounding boxes or classify text for model training. |
| **Amazon Mechanical Turk (MTurk)** | Public crowdsourcing workforce for Ground Truth and A2I, subject to the closure notice below | Distribute annotation tasks to external workers. |
| **Amazon Augmented AI (Amazon A2I)** | Route selected predictions into human-review workflows | Send an uncertain document extraction for a person to inspect. |

Ground Truth supports human labelling and, for supported tasks, **automated data labelling**: active learning uses human-labelled examples to train a model, automatically labels sufficiently confident examples, and sends other examples to humans. Label verification/adjustment workflows help improve existing annotations. [Ground Truth overview](https://docs.aws.amazon.com/sagemaker/latest/dg/sms.html) and [automated labelling](https://docs.aws.amazon.com/sagemaker/latest/dg/sms-automated-labeling.html).

An A2I human-review workflow defines the task interface, worker instructions, and assigned work team. Built-in integrations include supported Textract document extraction and Rekognition image-moderation tasks; custom workflows can review other model outputs. Activation conditions can include uncertainty or sampling for quality checks. Review results can inform the application and later dataset curation; review alone does not retrain a model. [A2I human-review documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/a2i-use-augmented-ai-a2i-human-review-loops.html).

**Ground Truth and A2I availability, checked 17 September 2026:** current AWS notices state that both services are no longer open to new customers; existing customers can continue using them. The concepts remain relevant to existing workloads and the current AIP-C01 in-scope list. [Ground Truth notice](https://docs.aws.amazon.com/sagemaker/latest/dg/sms.html) and [A2I notice](https://docs.aws.amazon.com/sagemaker/latest/dg/a2i-use-augmented-ai-a2i-human-review-loops.html).

**Workforce** means the pool of people; a **work team** is the group assigned work. Options include a private workforce and vendor-managed workers. Exam material may also name the public MTurk workforce. **Lifecycle note, checked 17 September 2026:** AWS announces that Mechanical Turk will permanently close on **30 September 2026**. Retain the exam association, but consult the notice when selecting a workforce. Public-worker tasks must not contain confidential or personal data. [Workforce options](https://docs.aws.amazon.com/sagemaker/latest/dg/sms-workforce-management.html) and [MTurk notice and restrictions](https://docs.aws.amazon.com/sagemaker/latest/dg/sms-workforce-management-public.html).

### 4.5 Model Cards, Model Monitor, and Model Dashboard {#model-governance}

These are **SageMaker** capabilities. “Bedrock Model Monitor” and “Bedrock Model Dashboard” are not the names of these features.

| Capability | Main question | What it provides |
|---|---|---|
| **Model Cards** | What is this model intended for, and what evidence supports its use? | Model documentation: intended uses, risk rating, training details, evaluation results, and limitations. |
| **Model Monitor** | Has production data or model behaviour deviated? | Scheduled checks for data quality, model quality, bias drift, and feature-attribution drift. |
| **Model Dashboard** | Which models need attention? | A centralized view of models, deployment information, model cards, and configured monitoring status/alerts. |
| **Clarify** | Are there bias or explanation concerns? | Bias analysis and feature-attribution explanations, including supported production drift monitoring. |

**A Model Card documents; Model Monitor measures; Model Dashboard summarizes.** A card is not the model artifact or automatic certification. Model-quality monitoring needs ground-truth outcomes to compare with predictions; an input-distribution change alone does not prove accuracy fell. Dashboard visibility does not automatically configure missing monitors. [Model Cards](https://docs.aws.amazon.com/sagemaker/latest/dg/model-cards.html), [Model Monitor](https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor.html), [Model Dashboard](https://docs.aws.amazon.com/sagemaker/latest/dg/model-dashboard.html), and [Clarify](https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-configure-processing-jobs.html).

**Availability note, checked 17 September 2026:** AWS documentation states that Model Monitor and Clarify are no longer open to new customers; existing customers can continue using them. The comparison remains useful for exam terminology. For implementation, follow the [Model Monitor availability guidance](https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor-availability-change.html) and [Clarify availability guidance](https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-availability-change.html).

For Bedrock applications, use the relevant **model evaluation**, **CloudWatch metrics**, and **model invocation logging** capabilities to assess quality and operate the application. Those have different roles from SageMaker's lifecycle tools. See [Bedrock capabilities](#section-2-2-capabilities) and the [logging comparison](/study/aiGenAIProfessional#logging-boundary).

### 4.6 LoRA versions, adapter serving, and pipeline gates {#sagemaker-adapter-lifecycle}

<figure class="aws-architecture" aria-labelledby="sagemaker-map-caption">
  <div class="aws-architecture__title">SageMaker: training, governance, and serving are separate</div>
  <div class="aws-choice-grid">
    <div class="aws-choice aws-choice--text aws-choice--compute"><strong>Training</strong><small>Base weights + data<br><br>SFT / LoRA → learned artifact<br>Distributed training → gradient communication</small></div>
    <div class="aws-choice aws-choice--text aws-choice--workflow"><strong>Governance</strong><small>Pipelines → Model Registry<br><br>Evaluate → threshold gate<br>Register → approve candidate<br>Retain base + adapter identity</small></div>
    <div class="aws-choice aws-choice--text aws-choice--agent"><strong>Serving</strong><small>Endpoint → inference components<br><br>Resident base + adapters<br>InvokeEndpoint selects component<br>Scaling adds serving capacity</small></div>
  </div>
  <figcaption id="sagemaker-map-caption">Read top to bottom within each card: responsibility → feature → setting or evidence.</figcaption>
</figure>

```text
SageMaker AI
├─ Training → frozen base + LoRA updates → adapter artifact in S3
├─ Pipelines
│  └─ ProcessingStep → TrainingStep → ProcessingStep(evaluation)
│     └─ PropertyFile(metrics JSON) → ConditionStep
│        ├─ pass → register model package → approval → release pipeline
│        └─ fail → reject promotion; retain diagnostic evidence
├─ Model Registry → versions, metrics, approval, lineage references
└─ Real-time endpoint
   ├─ resident base inference component
   └─ adapter inference components → select per InvokeEndpoint request
```

A weekly 70B-model refresh need not store a full copy of frozen base weights for each LoRA version. Record the adapter, exact base version, tokenizer, serving container, training data, and evaluation evidence. **Registry registration governs the artifact; serving support performs adapter switching.** Merely registering a model does not alter a running endpoint. [Model Registry](https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry.html).

For a compatible endpoint, `CreateInferenceComponent` can link an adapter's S3 `ArtifactUrl` to `BaseInferenceComponentName`; `InvokeEndpoint` selects its `InferenceComponentName`. This lets many personas share a resident base instead of loading 50 complete models. Provision and warm enough capacity for the target latency; registration does not guarantee every adapter stays in GPU memory or every request completes instantly. Separate full fine-tunes cannot automatically become LoRA adapters. [Adapter inference components](https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints-adapt.html).

#### Approved model package → live endpoint

When a release pipeline must replace the model behind an existing endpoint, keep the **registry**, **hosting model**, **endpoint configuration**, and **live endpoint** as separate objects:

```text
DescribeModelPackage
  └─ version 7 exists and ModelApprovalStatus = Approved?
       ↓ yes
CreateModel
  └─ create a hosting model from ModelPackageName
       ↓
CreateEndpointConfig
  └─ choose model, instance type, variants, traffic, and scaling settings
       ↓
UpdateEndpoint
  └─ apply the new endpoint configuration to the existing endpoint
       ↓
Wait + DescribeEndpoint
  └─ InService → serve traffic     Failed → stop and investigate
```

**Layman analogy:** the Model Registry is the inspected recipe, `CreateModel` puts the recipe in the kitchen, `CreateEndpointConfig` specifies the kitchen equipment and staffing, and `UpdateEndpoint` reopens the existing restaurant with that setup. An approved recipe is not automatically being served. The deployment pipeline must still create the hosting objects, apply them, and verify the endpoint status. [SageMaker model deployment](https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html) and [endpoint update API](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_UpdateEndpoint.html).

**Recall test:** Which object records approval? Which object selects the GPU? Which call changes the live endpoint? The answers are **Model Package**, **Endpoint Config**, and **UpdateEndpoint**.

In SageMaker Pipelines, evaluation commonly runs in a second **ProcessingStep**, with a **PropertyFile** for metrics and a **ConditionStep** to gate model registration. SDK versions differ in registration helpers (`RegisterModel` or registration through `ModelStep`). Set the desired approval state, such as `PendingManualApproval`, explicitly. Registering a release candidate is separate from deploying it; failed training artifacts are not automatically deleted. [Pipeline steps](https://docs.aws.amazon.com/sagemaker/latest/dg/build-and-manage-steps-types.html) and [property files](https://docs.aws.amazon.com/sagemaker/latest/dg/build-and-manage-propertyfile.html).

### 4.7 Distributed training and pre-deployment bias gates {#sagemaker-training-bias}

| Phase | Capability / control | Boundary |
|---|---|---|
| Large distributed training | Supported GPU training instances with EFA; SMDDP for data-parallel communication | Gradient synchronization differs from request-serving autoscaling. Large models may also need sharding/model parallelism. |
| Interactive serving | Real-time endpoint + target tracking, e.g. `SageMakerVariantInvocationsPerInstance` | Add serving replicas; benchmark token sizes, concurrency, warm capacity, and scaling delay. |
| Bias evaluation before release | Clarify processing job on held-out data; configure protected facets and supported metrics | Write report to S3, then compare metrics against policy thresholds before deployment. |
| Production bias drift | Model Monitor / supported monitoring pipeline | Detect later changes; cannot substitute for the pre-release gate. |

A successful processing job means analysis completed, not that bias passed. In an existing Step Functions workflow, use `CreateProcessingJob` with the appropriate wait pattern, read the metrics, then a `Choice` routes to halt/review or deployment. Select available metrics and facet configurations deliberately; multiple attributes may require multiple configurations. Apply the availability notices in [model governance](#model-governance). [Clarify processing](https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-processing-job-configure-analysis.html), [distributed training](https://docs.aws.amazon.com/sagemaker/latest/dg/distributed-training.html), and [endpoint autoscaling](https://docs.aws.amazon.com/sagemaker/latest/dg/endpoint-auto-scaling.html).

**Latency reality check:** real-time hosting is the correct serving category, but a 175B generative model is not guaranteed sub-millisecond end-to-end latency. That requirement needs measurement and likely a different fast decision path. Serverless Inference is neither a training cluster nor a GPU serving option; Spot-based fault-tolerant training is a different capacity decision.

## 5. Retrieval: Knowledge Bases, OpenSearch, and Kendra {#section-8-retrieval-choice}

<span id="section-5-bedrock-kb"></span>
<span id="section-6-opensearch"></span>
<span id="section-7-kendra"></span>

| Service | Choose it when | Integration responsibility |
|---|---|---|
| **Bedrock Knowledge Bases** | Supported managed ingestion and retrieval meet the RAG workload. | Configure sources, parsing/chunking, embeddings, store, filters, sync, and evaluation. |
| **OpenSearch Service** | Direct index design, lexical/vector/hybrid ranking, filters, facets, and query control matter. | Own the ingestion and query pipeline around search; compare managed domains with Serverless feature/cost constraints. |
| **Kendra** | Enterprise connectors, organizational search, and supported document-ACL integration dominate. | Verify connector/index/API support, ACL ingestion, and user/group synchronization. |
| **Q Business** | A packaged enterprise assistant with conversational answers, citations, and connectors is the requirement in an exam scenario. | Configure identity, permissions, and sources; account for the availability notice in [section 7](#section-12-service-map). |

These operate at different levels. Knowledge Bases can use supported stores or retrievers; a custom application can query OpenSearch or Kendra and then invoke a model. Do not create multiple copies of a corpus without explicit ownership and freshness requirements.

**Kendra availability, checked 17 September 2026:** Kendra entered maintenance mode on 30 June 2026 and is closed to new customers from 30 July 2026. Existing customers remain supported; AWS recommends Amazon Bedrock Knowledge Bases for new search applications while documenting feature gaps that must be assessed during migration. Kendra remains in the current AIP-C01 in-scope list, so its behavior is still exam-relevant. [Kendra availability and migration guidance](https://docs.aws.amazon.com/kendra/latest/dg/kendra-availability-change.html).

For Bedrock integration, `Retrieve` returns evidence for application-controlled context assembly; `RetrieveAndGenerate` combines retrieval and generation. Check source attribution, supported reranking/search options, and the source/store/model combination. [Knowledge Bases documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html).

Use custom retrieval when required parsing, entitlement logic, ranking, query transformations, or ingestion guarantees exceed the managed path. Test missing ACL metadata and stale group membership explicitly. [OpenSearch hybrid search](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-configure-neural-search.html) and [Kendra user-context filtering](https://docs.aws.amazon.com/kendra/latest/dg/user-context-filter.html) describe service-specific controls.

Parsing, chunking, ANN indexes, reranking, and retrieval metrics are taught on [AI Knowledge Bases](/study/aiKnowledgebases).

### 5.1 Assistant, retriever, or vector index? {#assistant-retriever-vector-store}

For employee questions over **SharePoint, Confluence, and S3**, “conversational answers with citations and minimal application development” points to **Q Business** among those exam choices. Knowledge Bases supplies managed RAG capabilities for an application; OpenSearch supplies search/index capabilities. Kendra can return answer passages as well as ranked documents and can serve as a RAG retriever, but is not by itself the packaged generative assistant described here. [Q Business overview](https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/what-is.html) and [Kendra query responses](https://docs.aws.amazon.com/kendra/latest/dg/query-responses-types.html).

For **similar-product or article recommendations**, Bedrock embeddings represent meaning; **OpenSearch Service** indexes vectors and performs k-NN retrieval. Existing search integration plus keyword/vector **hybrid search** strengthens that choice. Kinesis transports records; Athena analyzes data; ordinary S3 Intelligent-Tiering manages object storage cost. They do not provide this search index. Amazon S3 Vectors is a separate vector capability, so avoid the blanket claim that S3 has no vector search. [OpenSearch vector search](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/knn.html) and [S3 Vectors](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors.html).

RDS PostgreSQL and Aurora PostgreSQL can use supported **pgvector** versions; relational joins and existing transactional data can make them appropriate. Millions of embeddings alone do not prove OpenSearch is faster or cheaper. Choose it here for the combined search requirements, then benchmark latency, recall, filtering, and cost. [RDS PostgreSQL extensions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Appendix.PostgreSQL.CommonDBATasks.Extensions.html).

### 5.2 Kendra Search Analytics {#kendra-search-analytics}

**Search Analytics** shows how people use a Kendra search application and where it fails them. View trends in the console or retrieve metrics using `GetSnapshots`.

| Signal | Investigate |
|---|---|
| Frequent queries with zero results | Missing content, ingestion gaps, vocabulary, or access filters. |
| Low click-through / high zero-click rate | Relevance or presentation problems; also check whether an instant answer already satisfied the query. |
| Top queries and clicked documents | Demand, useful content, and opportunities to improve navigation. |
| Query-volume trends | Adoption changes or application failures. |

The application must send click feedback with `SubmitFeedback` to collect click-through data. Analytics supports diagnosis; it does not replace relevance-labelled retrieval evaluation or automatically fix ranking. Availability depends on index type and search API. [Kendra Search Analytics documentation](https://docs.aws.amazon.com/kendra/latest/dg/search-analytics.html).

### 5.3 Knowledge Bases: configure the layer that failed {#kb-internals}

```text
Bedrock Knowledge Bases
├─ Data source / ingestion configuration
│  ├─ parsingConfiguration → FM/BDA parser for tables and visual structure
│  ├─ chunkingConfiguration → FIXED_SIZE / HIERARCHICAL / SEMANTIC / NONE
│  └─ source metadata → classification, manual_id, version
├─ bedrock-agent client
│  ├─ StartIngestionJob → incremental source sync
│  └─ GetIngestionJob   → completion, failures, statistics
└─ bedrock-agent-runtime client
   ├─ Retrieve → retrievalConfiguration.vectorSearchConfiguration
   │  ├─ filter → server-derived authorization scope
   │  ├─ numberOfResults → candidate count
   │  └─ rerankingConfiguration → supported reranking
   ├─ RetrieveAndGenerate → retrieval + model response + citations
   └─ Rerank → scored candidates for application-controlled pruning
```

**Parsing versus chunking:** if PDF table rows lose their column relationships, configure a supported FM parser or BDA at the **data source**, before chunking and embedding. Semantic chunking cannot reconstruct discarded table layout, and OpenSearch index settings do not parse PDFs. [Advanced parsing](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-advanced-parsing.html).

**Hierarchy versus GraphRAG:** standard hierarchical vector retrieval searches small children and substitutes larger parents; multiple child matches may collapse to fewer returned results. Neptune Analytics GraphRAG retrieves **children without parent substitution**. For wider GraphRAG context, create self-contained chunks containing the necessary section wording; larger parent settings alone do not help. The managed graph-build structure is not an arbitrary edge-schema editor. [Chunking behaviour](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-chunking.html) and [GraphRAG constraints](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-build-graphs.html).

Changing chunking strategy requires recreating the data source and re-ingesting, not simply editing a connected source and syncing. Plan cleanup or a replacement index to avoid stale copies. Respect model, API, and store limits; do not treat 8,192 as a universal documented maximum for every parent/child configuration. [Ingestion configuration restrictions](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-data-source-customize-ingestion.html) and [hierarchical level API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent_HierarchicalChunkingLevelConfiguration.html).

**Authorization belongs in the request:** attach an S3 sidecar such as `manual.pdf.metadata.json` with `metadataAttributes`, then derive the filter from trusted identity in the backend:

```json
{
  "retrievalConfiguration": {
    "vectorSearchConfiguration": {
      "filter": {"equals": {"key": "classification", "value": "general"}},
      "numberOfResults": 10
    }
  }
}
```

This example scopes a junior user's retrieval. Senior users need their own permitted set; do not accept a client-selected classification as authorization. Restrict direct index/KB access that could bypass the backend and fail closed on missing metadata. S3 permissions govern the source, not the already-indexed chunks; a data-source setting is not a per-user query filter. Filter execution details depend on the store, so avoid a universal claim about ordering before all similarity calculations. [Retrieval filters](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-config.html).

**Freshness needs orchestration:** use S3 events → SQS → controlled worker → `StartIngestionJob`. Coalesce uploads per source, pace API calls, check running jobs, retry throttles, and schedule another sync if changes arrive during a job. SQS alone is not a rate limiter. The documented classic Knowledge Bases quotas include **0.1 StartIngestionJob requests/second** and one concurrent job per KB/data source; distinguish these from newer Managed Knowledge Bases quotas. Measure source-to-search lag. Lambda is not the only possible caller: Step Functions AWS SDK integration can orchestrate supported Bedrock Agent APIs. [Quotas](https://docs.aws.amazon.com/general/latest/gr/bedrock.html) and [Step Functions SDK integrations](https://docs.aws.amazon.com/step-functions/latest/dg/supported-services-awssdk.html).

**Context pruning:** retrieve broadly, rescore with a reranker, then apply a tested relevance threshold and token budget. The standalone `Rerank` response exposes `relevanceScore`; application filtering is needed for a custom threshold. A fixed cut from 30 candidates to 5 can lose evidence, but a reranker can also make mistakes—measure recall and grounded answer quality rather than promise perfect preservation. [Rerank API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_Rerank.html).

For straightforward S3 PDF Q&A, `RetrieveAndGenerate` avoids custom retrieval-to-generation plumbing. Cost still includes parsing, embeddings, index compute/storage, retrieval, and generation; OpenSearch Serverless does not mean no index overhead or universally near-zero idle cost. Compare the actual collection configuration and workload. [OpenSearch Serverless capacity](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-scaling.html).

### 5.4 HNSW memory pressure at scale {#opensearch-hnsw-tuning}

For tens of millions of vectors, inspect native-memory pressure, graph/index size, shard placement, query concurrency, and recall before changing hardware.

| Control | When it acts | Trade-off |
|---|---|---|
| `ef_search` | Query-time search effort, depending on engine | More candidates can improve recall at higher latency. |
| `ef_construction` | Graph build | More build effort can improve graph quality; changing it does not rebuild old graphs automatically. |
| `m` | Graph connectivity at build time | More links increase graph memory and can improve recall. |
| Primary shards + node capacity | Index distribution | A new index/reindex can spread graphs across sufficient nodes; too many shards add overhead and fan-out. |
| Memory-optimized instances | Hosting capacity | Fit the measured memory bottleneck; extra shards on the same full nodes do not create RAM. |

Retain appropriate replicas for availability/read capacity. An HNSW graph's native memory is not simply JVM heap, and zero replicas increases recovery/availability risk rather than guaranteeing immediate permanent data loss. IVF is a legitimate alternative, but S3 Intelligent-Tiering is not an OpenSearch hot vector index. Engine and version affect tuning behaviour. [OpenSearch k-NN guidance](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/knn.html) and [OpenSearch vector methods](https://docs.opensearch.org/latest/field-types/supported-field-types/knn-methods/).

## 6. Supporting services by architecture role {#section-9-supporting-services}

<span id="section-11-checklist"></span>

Apply the [production release process](/study/aiInfrastructure#section-15-production-eval) using the following AWS controls.

### 6.1 Entry, identity, and network {#section-9-1-entry}

| Service | Role and boundary |
|---|---|
| API Gateway | API integration, request validation, and throttling; match endpoint type to streaming and timeout needs. |
| Cognito | Application sign-in and identity tokens; derive tenant claims from trusted identity. |
| IAM | Authorize AWS principals, API actions, and resources; distinguish runtime, tool, and deployment roles. |
| WAF | Filter abusive public web traffic; application controls still handle model/tool abuse. |
| VPC endpoints / PrivateLink | Private paths to supported services; retain IAM and outbound-destination controls. |

The application must also authorize the exact business record/action. An IAM permission to invoke a model does not grant a user access to every document it could retrieve.

#### Private inference: endpoint, DNS, and identity {#private-inference}

For `InvokeModel`/`Converse`, create **`com.amazonaws.<region>.bedrock-runtime`**, enable private DNS, and allow the application to reach its interface ENIs over HTTPS. The `bedrock` control-plane endpoint does not handle these inference requests; KB/agent build and runtime APIs use their respective `bedrock-agent` and `bedrock-agent-runtime` services.

Use both a network security group and an endpoint policy scoped to the application IAM role, required actions, and model resources. Streaming requires the corresponding streaming permission. The role still needs its identity permissions; an endpoint policy constrains use of that path and does not independently grant all access or disable other public paths. Interface endpoints use private DNS/ENIs, not an S3-style gateway endpoint route-table entry. [Bedrock PrivateLink endpoint names and policies](https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html).

If the same workload needs reserved model capacity, evaluate Provisioned Throughput separately. Size by token throughput and measured latency, not requests/minute alone; private networking does not reserve inference capacity.

### 6.2 Compute and integration {#section-9-2-compute}

| Service | Role |
|---|---|
| Lambda | Short event handlers, validation, ingestion transforms, and tool adapters. |
| ECS / EKS | Containerized parsers, workers, gateways, and custom serving; EKS adds Kubernetes control and operational responsibilities. |
| SQS | Buffer work and manage consumer retries; configure visibility timeout, dead-letter handling, and queue-age alarms. |
| SNS | Fan out notifications to subscribers. |
| EventBridge | Route events by rules between application components. |

Durable workflow orchestration is covered by [Step Functions in section 3](#section-3-1-agentcore-boundary).

#### Events, buffering, and WebSocket delivery {#event-stream-controls}

| Need | Integration | Setting or boundary |
|---|---|---|
| Upload starts a Standard workflow | S3 → EventBridge rule → Step Functions | Enable bucket EventBridge delivery; match `source: aws.s3`, `detail-type: Object Created`, bucket/key. |
| Only `final/` uploads, controlled inference consumption | EventBridge rule → SQS → Lambda | Prefix matches the actual object key; configure consumer concurrency, pacing, retries, DLQ, and idempotency. |
| Direct bucket notifications | S3 → Lambda, SNS, or standard SQS | No direct Step Functions or SQS FIFO destination; EventBridge can target FIFO. |
| Stream a response to the current WebSocket caller | Lambda reads Bedrock event stream → API Gateway Management API | Use `requestContext.connectionId` and `post_to_connection` for incremental delivery. |

SQS buffers bursts; batch size/concurrency alone do not enforce a token-per-minute quota. API Gateway throttling can reject excess load but does not add Bedrock capacity. SNS has delivery retries, but is not a consumer-paced work queue. A state machine does not start itself by polling SQS; use an event source or EventBridge Pipes. [S3 notification destinations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html).

For WebSockets, use `InvokeModelWithResponseStream` or a supported Converse stream, decode model-specific events, and send chunks without waiting for the full response. Allow enough Lambda time; the WebSocket route integration still has a **29-second maximum**. Longer work should acknowledge and dispatch a worker, persisting the connection/job mapping where needed. Persisting only `connectionId` does not let a second Lambda resume an interrupted model stream. Handle disconnects (`GoneException`), frame limits, and end/error messages. [WebSocket callback API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html) and [quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-execution-service-websocket-limits-table.html).

#### Runtime model configuration and A/B cohorts {#appconfig-routing}

Use **AppConfig hosted configuration** for a tier→model mapping and **multi-variant feature flags** for controlled experiments. The Lambda extension caches configuration and serves it on `localhost:2772`; use stable session/user context for consistent cohort assignment. Authenticate the subscription tier server-side and allowlist model IDs. [AppConfig variants](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-creating-multi-variant-feature-flags.html).

A change requires a configuration deployment and propagates according to its strategy and extension polling interval; it is **not instantaneous across all warm environments**. It avoids an application-code deployment once the routing integration exists. REST API Gateway stage variables can also supply model mappings (`event.stageVariables` in a proxy event); they describe a stage, not an authenticated user's entitlement. [Extension caching](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-integration-lambda-extensions-how-it-works.html) and [stage variables](https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html).

Direct SDK retrieval can work, but per-request network calls add overhead; use the supported agent/extension for local variant evaluation. CloudFormation updates and Lambda environment updates change deployed resources. An ALB cannot target a Bedrock model ARN. **CloudWatch Evidently ended support on 16 October 2025**; it is not a current alternative. [Evidently notice](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Evidently.html).

### 6.3 Data and state {#section-9-3-data}

<span id="section-12-5-security"></span>

| Service | Role |
|---|---|
| S3 | Source documents, evaluation datasets, artifacts, and batch input/output; manage versions and lifecycle. |
| DynamoDB | Task status, conversation records, and idempotency keys with conditional writes and deliberate expiry. |
| Aurora / RDS | Transactional records and entitlements; supported PostgreSQL vector extensions may also fit relational retrieval workloads. |
| Glue | Data preparation, catalogue, lineage, and quality workflows feeding ingestion/evaluation. |
| Macie | Discover sensitive data in S3 and trigger a findings-response workflow. |

#### Validate records before inference {#data-quality}

**AWS Glue Data Quality** evaluates declarative rules over pipeline data. Required patient fields, valid dates, and accepted medical codes are data-quality requirements; Guardrails content policy and CloudWatch pipeline health answer different questions.

- Use DQDL rules such as `ColumnExists` and `IsComplete` for required columns and non-null values.
- Use type/format rules and `CustomSql` where needed for actual date validity; a matching date pattern alone does not establish a valid calendar date.
- Use allowed values or reference-data checks for valid codes; the team supplies and maintains the authoritative code set.
- Configure pipeline failure or quarantine on failed rules before downstream inference. Evaluation results do not automatically block every consumer.

Lambda can implement validation, but Glue Data Quality fits the requirement for a managed dataset-validation framework. For lightweight per-request whitespace/case normalization, use Lambda instead; preserve identifiers and meaningful punctuation. [DQDL rule reference](https://docs.aws.amazon.com/glue/latest/dg/dqdl-rule-types.html) and [Glue quality evaluation in ETL](https://docs.aws.amazon.com/glue/latest/dg/tutorial-data-quality.html).

#### Reject empty training records and redact within ETL {#glue-quality-redaction}

For CSV review text, `IsComplete` checks null completeness; an empty string can pass. **`ColumnLength "review_text" > 0`** rejects empty strings and treats NULL as zero length. Trim whitespace or add an appropriate rule if whitespace-only reviews are invalid. Define the allowed failure threshold and configure the Glue ETL evaluation to **fail before downstream training**; merely publishing a score/alarm is not a gate. Supported threshold syntax varies by rule, so use validated DQDL or row-level outcomes rather than assuming every rule accepts the same `with threshold` suffix. [ColumnLength](https://docs.aws.amazon.com/glue/latest/dg/dqdl-rule-types-ColumnLength.html) and [ETL quality checks](https://docs.aws.amazon.com/glue/latest/dg/tutorial-data-quality.html).

In an existing Glue ETL job, use **Sensitive Data Detection** with a masking/redaction action (`REDACT` with `redactText` in the detection API) and write only the sanitized output to the training prefix. Audit-only detection does not change values; hashing is pseudonymization, not encryption or a guarantee of anonymity. DataBrew can mask data, but a separate preparation job adds orchestration when the requirement is an in-job transform. [Glue sensitive-data detection](https://docs.aws.amazon.com/glue/latest/dg/aws-glue-api-sensitive-data-example.html).

#### Source discovery, versioned lineage, and access evidence {#source-audit}

For a pre-ingestion S3 audit, use a **Macie discovery job at 100% sampling depth** with the managed identifiers for CCNs and SSNs. This selects all **eligible** objects, not every possible byte regardless of format, permissions, encryption, or service limits. Review skipped/failed objects and image-only PDFs; Macie is not OCR. Automated discovery samples for broad visibility. Findings provide actionable object reports; stored discovery results also support coverage audits. S3 result retention is governed by your retention policy, not an unavoidable 90-day deletion. [Job scope](https://docs.aws.amazon.com/macie/latest/user/discovery-jobs-scope.html), [supported formats](https://docs.aws.amazon.com/macie/latest/user/discovery-supported-storage.html), and [results retention](https://docs.aws.amazon.com/macie/latest/user/discovery-results-repository-s3.html).

For traceable maintenance answers, connect three controls:

```text
Glue Data Catalog → registered dataset + schema/metadata versions
S3 versioned source → chunk {manual_id, version, source URI} → cited answer
CloudTrail data events + retrieval/application audit → who accessed what
```

Glue catalogue versions are metadata versions; preserve actual document versions with S3 Versioning or immutable artifact references. Supply chunk metadata explicitly rather than assume S3 object tags propagate. Enable relevant CloudTrail **data events**; ordinary event history is not S3 object-read auditing. Vector retrieval need not reread the source PDF, so correlate actual index/KB access and returned source IDs too. CloudTrail is not automatically immutable storage—use integrity validation and appropriate retention/access controls. DynamoDB Streams records changes, not reads. [Glue Data Catalog](https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html) and [CloudTrail data events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html).

### 6.4 Encryption, secrets, and operations {#section-9-4-operations}

<figure class="aws-architecture" aria-labelledby="observability-map-caption">
  <div class="aws-architecture__title">Evidence: select the artifact that answers the question</div>
  <div class="aws-choice-grid">
    <div class="aws-choice aws-choice--text aws-choice--compute"><strong>Metrics</strong><small>CloudWatch<br><br>Token counts / latency / alarms<br>Aggregates show a change</small></div>
    <div class="aws-choice aws-choice--text aws-choice--workflow"><strong>Logs and traces</strong><small>Invocation logs / instrumented spans<br><br>Logs Insights → expensive calls<br>SDK spans → slow dependency</small></div>
    <div class="aws-choice aws-choice--text aws-choice--agent"><strong>Agent decisions</strong><small>InvokeAgent trace stream<br><br>Observation → received evidence<br>Rationale → emitted explanation<br>Action → attempted operation</small></div>
  </div>
  <figcaption id="observability-map-caption">Read top to bottom within each card: responsibility → feature → setting or evidence.</figcaption>
</figure>

| Service | Role |
|---|---|
| KMS / Secrets Manager | Encryption-key policies / stored credentials and rotation. |
| CloudWatch | Operational logs, metrics, alarms, dashboards, and supported tracing. |
| CloudTrail | Supported AWS API activity for investigation and audit. |
| Config | Resource-configuration history and compliance-rule evaluation. |
| Artifact / Audit Manager | AWS compliance reports and agreements / collection of audit evidence. |
| Security Hub / Inspector | Aggregated security findings / workload vulnerability scanning. |
| Cost Explorer / Cost Anomaly Detection | Cost analysis / unusual-spend detection. |

Keep sensitive payloads out of routine telemetry. Use the [shared trace design](/study/aiInfrastructure#section-11-observability) to connect operational signals to the model, retrieval, and tool decisions.

#### Token alarms versus billing analysis {#token-monitoring}

Use **CloudWatch** for Bedrock token-consumption dashboards and threshold alarms. For `bedrock-runtime`, metric names include **`InputTokenCount`**, **`OutputTokenCount`**, and **`Invocations`** in the `AWS/Bedrock` namespace. Use the appropriate model dimensions and `Sum` over the alarm period; feature-level attribution needs application instrumentation or supported application inference profiles. Cache token metrics matter when estimating spend. [Bedrock runtime metrics](https://docs.aws.amazon.com/bedrock/latest/userguide/monitoring-runtime-metrics.html).

Token thresholds are operational cost signals, not exact dollar bills: models and token categories have different rates. Use **Cost Explorer** for billed-spend analysis/forecasting and **AWS Budgets** for budget alerts. X-Ray traces request paths; CloudTrail audits API activity. Neither replaces token metrics and alarms. [Application inference profiles](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles.html) and [AWS cost management](https://docs.aws.amazon.com/cost-management/latest/userguide/what-is-costmanagement.html).

#### Diagnose token growth and per-call latency {#invocation-diagnostics}

For an ad-hoc verbosity investigation, enable supported **model invocation logging** to CloudWatch Logs and compare before/after windows in Logs Insights:

```sql
fields @timestamp, input.inputTokenCount, output.outputTokenCount
| stats count(*) as requests,
    avg(input.inputTokenCount) as avgInput,
    avg(output.outputTokenCount) as avgOutput
  by bin(1h)
```

Record prompt version through supported request metadata/application correlation for stronger attribution. New logging cannot reconstruct old per-request records; use existing aggregate metrics if no prior logs exist. Metric alarms detect a rise; Logs Insights investigates which invocations changed. S3/Athena is valid for other reporting/retention requirements. Payload logging can contain raw sensitive text, so select access/retention and redaction boundaries first. [Invocation log schema](https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html).

For Summarize → Translate → Format latency, instrument **each SDK call**, not just the Lambda invocation. In the exam's Python X-Ray pattern: enable Active tracing, set permissions, and patch supported SDK clients at initialization (`patch_all()` or targeted `patch(['boto3'])`). Add named spans for logical stages. Manual spans can also time calls accurately if scoped correctly; `patch_all()` is not the only valid instrumentation. Streaming requires observing consumption/end-to-end latency as well as request setup. AWS recommends OpenTelemetry migration; X-Ray SDKs/daemon entered maintenance mode on 25 February 2026. [Python SDK instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-python-patching.html) and [X-Ray SDK lifecycle](https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon.html).

#### Shared implementation standards {#shared-ai-components}

Publish versioned **CDK constructs** for infrastructure defaults and a companion **runtime library** for model calls, guardrail use, sanitized telemetry, and correlation. Distribute packages through CodeArtifact with documented upgrades and CI policy checks. CDK provisions resources; it does not itself instantiate the application's runtime SDK client. CloudWatch metric/subscription filters do not erase raw logs already ingested. Sanitize before logging or configure an appropriate data-protection policy with its access limitations. AWS Config evaluates resource configuration, not every `InvokeModel` payload. [CDK constructs](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html), [CodeArtifact](https://docs.aws.amazon.com/codeartifact/latest/ug/welcome.html), and [log data protection](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/mask-sensitive-log-data.html).

### 6.5 AWS Audit Manager: organize audit evidence {#audit-manager}

**AWS Audit Manager** collects and organizes evidence against controls in an assessment based on a standard or custom framework. Automated sources include supported CloudTrail activity, Config/Security Hub checks, and AWS configuration data; teams can add manual evidence and review material for assessment reports.

For an AI application, configuration evidence might show that logging is enabled, while a manually supplied evaluation report and approval record explain the release decision. Evidence collection does not itself establish compliance or prove that a model is fair.

- **CloudTrail:** records supported AWS API activity.
- **Audit Manager:** organizes evidence about your use of AWS for assessment and review.
- **AWS Artifact:** provides AWS's compliance reports and agreements.

Sources: [Audit Manager overview](https://docs.aws.amazon.com/audit-manager/latest/userguide/what-is.html) and [evidence and assessment concepts](https://docs.aws.amazon.com/audit-manager/latest/userguide/concepts.html).

**Availability, checked 17 September 2026:** Audit Manager is in maintenance mode and cannot be set up in new accounts or additional Regions from 30 April 2026. Existing configured accounts can continue using it subject to the documented account, organization, and Region limits. AWS recommends evaluating AWS Config Conformance Packs for technical compliance controls, but explicitly notes that they do not replace Audit Manager's full framework evidence and audit-reporting functions. [Audit Manager availability guidance](https://docs.aws.amazon.com/audit-manager/latest/userguide/audit-manager-availability-change.html).

## 7. Other AI services: compact lookup {#section-12-service-map}

<span id="section-12-2-language"></span>
<span id="section-12-3-purpose-built"></span>
<span id="section-12-4-operations-learning"></span>

Use a purpose-built API or packaged assistant when it already meets the task. This is an orientation list; the [AWS AI service overview](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html) provides the broader catalogue and lifecycle notices.

| Service | Primary use |
|---|---|
| Comprehend | Text classification, named entities, key phrases, sentiment, and PII detection. |
| Comprehend Medical | Clinical entities, relationships, and PHI extraction. |
| Textract | OCR and document structure; `AnalyzeDocument` handles forms/tables, `AnalyzeExpense` invoices/receipts. |
| Transcribe / Polly | Speech to text / text to speech. |
| Translate | Text translation. |
| Lex | Intent/slot-based voice and text conversations. |
| Rekognition | Image and supported stored-video analysis, plus supported custom visual labels; verify feature-level availability. |
| Personalize | Recommendations and personalized ranking. |
| Connect | Contact-centre workflows and conversation assistance/analytics. |
| Q Business | Existing-customer organizational assistant with connected enterprise content; the service is in maintenance mode. |
| Quick | Current managed work assistant for connected enterprise data, analysis, workflows, and agentic actions. |
| Q Developer | Coding and supported AWS development assistance. |

**Q Business availability, checked 17 September 2026:** Q Business is closed to new customers; existing customers remain supported, and AWS recommends Amazon Quick for new implementations and migration. Both appear in the current AIP-C01 in-scope list. [Q Business availability and migration guidance](https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/qbusiness-availability-change.html).

### 7.1 Recognition: text entities versus computer vision {#recognition-extraction}

“Recognition” needs an input type. **Named entity recognition (NER)** is an NLP task; **Amazon Rekognition** is the AWS computer-vision service.

| Task | Service | Example |
|---|---|---|
| **Named entity recognition** | Comprehend | In “Maya joined Acme in Sydney,” identify a person, organization, and location. |
| **Key phrase extraction** | Comprehend | Extract a noun phrase such as “the delayed delivery” from a customer message. |
| **Object/scene recognition** | Rekognition | Detect a bicycle or a street scene in an image; supported detections include confidence scores and object locations. |
| **Document text and structure** | Textract | Extract the text and table cells of a scanned invoice before downstream language analysis. |

Comprehend entity detection assigns types to text spans. Key phrase extraction returns noun phrases and confidence scores; it does not require a predefined entity type and is not a generated summary. Use `DetectEntities` and `DetectKeyPhrases` for their respective tasks. [Comprehend entities](https://docs.aws.amazon.com/comprehend/latest/dg/how-entities.html) and [key phrases](https://docs.aws.amazon.com/comprehend/latest/dg/how-key-phrases.html).

Rekognition analyzes visual content, with capabilities including labels, faces, image text, and moderation. A face detection is not automatically identification of a named person. For a scanned contract, OCR followed by Comprehend can extract named parties; detecting objects in a photograph is a different task. [Rekognition visual labels](https://docs.aws.amazon.com/rekognition/latest/dg/labels.html).

The core service remains available, but **Rekognition Streaming Events and Batch Image Content Moderation are closed to new customers**. Do not infer availability of those features from general Rekognition image/video support. [AWS services in maintenance](https://docs.aws.amazon.com/general/latest/gr/maintenance_services.html).

### 7.2 Detect and redact before inference or logging {#pii-redaction}

| Need | Service/control | Boundary |
|---|---|---|
| Locate names, phone numbers, and addresses in incoming text | **Comprehend PII detection** | Returns entity types, confidence, and offsets; application code can mask those spans before calling the FM. |
| Block or mask supported sensitive information in model interactions | **Bedrock Guardrails** | Configure sensitive-information filters; the application must use the sanitized result. |
| Discover sensitive objects already in S3 | **Macie** | Storage discovery/findings, not inline redaction before a log write. |
| Read a scan / find workload vulnerabilities / audit API calls | Textract / Inspector / CloudTrail | These roles do not replace a text-redaction stage. |

Comprehend supports real-time PII detection and asynchronous redaction jobs. Guardrails can independently detect and mask supported PII; it does not consume Comprehend offsets as an automatic log-cleaning integration. For “detect with Comprehend, redact with Guardrails,” explicitly wire and verify the application stages. [Comprehend PII](https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html) and [Guardrails sensitive-information filters](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-sensitive-filters.html).

The safe application path is **raw text → detection/redaction → sanitized prompt or transcript → permitted destination**. Guardrails does not retroactively scrub logs, and invocation logging can retain original content. Check errors, traces, and logging configuration as well as the successful response path. [Invocation logging](https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html).

<figure class="aws-architecture" aria-labelledby="pii-example-caption">
  <div class="aws-architecture__title">Northstar example: “We must not send customer PII to Bedrock”</div>
  <div class="aws-choice-grid">
    <div class="aws-choice aws-choice--text aws-choice--storage"><strong>Incoming message</strong><small>“Maya Chen, 0412 555 019, cannot access her account.”</small></div>
    <div class="aws-choice aws-choice--text aws-choice--security"><strong>Detect</strong><small>Comprehend PII detection returns NAME and PHONE with offsets.</small></div>
    <div class="aws-choice aws-choice--text aws-choice--workflow"><strong>Redact</strong><small>Application code replaces the spans before prompt construction, or uses a verified Guardrails masking stage.</small></div>
    <div class="aws-choice aws-choice--text aws-choice--ai"><strong>Invoke safely</strong><small>Bedrock receives “Customer [NAME] cannot access her account.” Logs and traces must follow the same policy.</small></div>
  </div>
  <figcaption id="pii-example-caption">The decisive question is “where must the data be safe?” Detection finds the span; redaction changes the text; logging and authorization are separate controls.</figcaption>
</figure>

Medical record numbers and other clinical identifiers require verified entity coverage; do not assume generic Comprehend detects every PHI type. Evaluate **Comprehend Medical `DetectPHI`** and custom patterns where needed. Redaction is one control, not a guarantee of complete detection or HIPAA compliance. [Comprehend Medical PHI detection](https://docs.aws.amazon.com/comprehend-medical/latest/dev/textanalysis-phi.html).

### 7.3 Transcription and clinical batch sanitization {#transcription-phi-pipeline}

```text
S3 audio → StartTranscriptionJob → output JSON in destination S3
                                      ↓ object-created event
                             extract text + labelled turns → Bedrock

Mono conversation → ShowSpeakerLabels=true, MaxSpeakerLabels=2
                 → spk_0 / spk_1 → verified role mapping → prompt

PDF/image → Textract ─┐
Word → format parser ├→ UTF-8 English text in S3
                     └→ StartPHIDetectionJob → entity types + offsets
                        → restricted audit metadata + redacted text → KB ingestion
```

**Transcribe:** mono audio needs diarization; channel identification requires distinct recorded channels. Carry speaker labels into the model context and verify doctor/patient roles—`spk_0` is not guaranteed to mean Doctor. Plain transcript text alone can discard attribution; a model can read JSON, but explicitly assembled turns are easier to validate. Use `OutputBucketName`/`OutputKey` and filtered destination events to avoid a source/output trigger loop. A Transcribe completion EventBridge rule is also valid and can handle failure states; the output-bucket pattern is simply a direct fit for an existing S3 pipeline. [Speaker settings](https://docs.aws.amazon.com/transcribe/latest/APIReference/API_Settings.html) and [Transcribe events](https://docs.aws.amazon.com/transcribe/latest/dg/monitoring-events.html).

**Comprehend Medical:** `StartPHIDetectionJob` reads batch text from S3 and writes entity results; use `BeginOffset`/`EndOffset`, confidence, and types for redaction and reports. Medical record numbers and SSNs can both be `ID`; the API does not return a separate HIPAA-category field for every entity. Maintain offset alignment and secure any audit data containing original entity text. Textract does not parse DOC/DOCX; use an appropriate parser/conversion step. Knowledge Bases ingestion is not automatic PHI sanitization. [Batch PHI API](https://docs.aws.amazon.com/comprehend-medical/latest/api/API_StartPHIDetectionJob.html) and [PHI entities](https://docs.aws.amazon.com/comprehend-medical/latest/dev/textanalysis-phi.html).

### 7.4 Q Developer: transformation, review, and issue implementation {#q-developer-capabilities}

| Requirement | Capability in the practice scenario | Boundary |
|---|---|---|
| Java 8/11 → Java 17 modernization | Transformation workflow (`/transform` in supported interfaces) | Language/dependency migration, not just inline suggestions. |
| Security/code-quality review | Review workflow (`/review` in supported interfaces) | Findings and remediation suggestions; verify supported language and scan scope. |
| Implement a GitHub issue within the repository | Authorized Q Developer GitHub integration | Use the feature-development label or `/q dev`; issue context → proposed PR. |

An issue URL is not an access grant. IDE development and installed repository integration are distinct workflows; neither guarantees all tests or security issues are resolved. Commands and supported targets evolve. Current docs mark GitHub integration as preview and announce Q Developer IDE plugin end of support on **30 April 2027**; check migration guidance before new adoption. [Java transformation](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/transform-java.html), [GitHub development](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/github-feature-development.html), and [IDE lifecycle](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html).

## 8. Continue to certification preparation {#section-13-practice-traps}

<span id="101-high-value-aip-c01-comparison-rules"></span>

Use [AWS GenAI Professional preparation](/study/aiGenAIProfessional) for the exam blueprint, domain exercises, scenario practice, and readiness checks. Keep this page as the service reference when answering those scenarios.

## Official references {#official-references}

Service documentation is linked beside each decision above. For exam scope, use the [current AIP-C01 guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html) and its [in-scope service list](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html).
