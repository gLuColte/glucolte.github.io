---
title: AWS AI Services
permalink: /study/infrastructureAWSAiServices
---

# AWS AI Services

Use this page to choose AWS implementations for the architecture learned in the preceding pages. Service details were checked against AWS documentation on **5 September 2026**; check the exact model, API, Region, and account availability before implementation.

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

## 2. Amazon Bedrock {#section-2-bedrock}

Bedrock provides managed access to foundation models and GenAI application capabilities. The chosen model and access path determine supported modalities, context/output limits, inference controls, tool/schema behaviour, quotas, and Regions.

### 2.1 Inference APIs and capacity {#section-2-1-inference}

<span id="211-choose-the-bedrock-api-and-capacity-mode"></span>

| Integration need | API |
|---|---|
| Consistent message interface across compatible models | `Converse`; `ConverseStream` for streamed output. |
| Model-specific invocation payload | `InvokeModel`; `InvokeModelWithResponseStream` for streaming. |
| Supported long-running generation with results in S3 | `StartAsyncInvoke`; inspect job status separately. |
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

### 3.1 Choose the orchestration boundary {#section-3-1-agentcore-boundary}

| Option | Use it for |
|---|---|
| AgentCore | Agent execution needing managed runtime, tool connectivity, or the other modules above. |
| Bedrock Agents Classic | Existing workloads using instructions, action groups, knowledge bases, versions/aliases, and agent traces. |
| Step Functions | Known business states, retries, callbacks, and approval paths; it can invoke an agent as one bounded step. |

**Current availability:** AWS states that Agents Classic is closed to new customers; existing customers may continue using it. AWS points new implementations toward AgentCore. [Agents Classic notice](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html).

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
| Label data / add human prediction review | Ground Truth / Amazon A2I. |
| Start from a pretrained model | JumpStart. |
| Customize with controlled code and compute | Training jobs; Automatic Model Tuning for hyperparameter trials. |
| Version and approve artifacts | Model Registry; Model Cards for model documentation. |
| Automate lifecycle stages | Pipelines. |
| Serve online, intermittent, queued, or offline workloads | Real-time, serverless, asynchronous inference, or Batch Transform, subject to model/endpoint support. |
| Assess bias/explanations and monitor drift | Clarify and Model Monitor, with task-appropriate checks. |

Match endpoint scaling, cold starts, model loading, hardware requirements, and utilization to the workload. [SageMaker AI features](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis-features.html) and [deployment options](https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html) describe the supported paths. The reason to customize a model is covered in [Models: adaptation choices](/study/aiModels#model-adaptation).

## 5. Retrieval: Knowledge Bases, OpenSearch, and Kendra {#section-8-retrieval-choice}

<span id="section-5-bedrock-kb"></span>
<span id="section-6-opensearch"></span>
<span id="section-7-kendra"></span>

| Service | Choose it when | Integration responsibility |
|---|---|---|
| **Bedrock Knowledge Bases** | Supported managed ingestion and retrieval meet the RAG workload. | Configure sources, parsing/chunking, embeddings, store, filters, sync, and evaluation. |
| **OpenSearch Service** | Direct index design, lexical/vector/hybrid ranking, filters, facets, and query control matter. | Own the ingestion and query pipeline around search; compare managed domains with Serverless feature/cost constraints. |
| **Kendra** | Enterprise connectors, organizational search, and supported document-ACL integration dominate. | Verify connector/index/API support, ACL ingestion, and user/group synchronization. |

These operate at different levels. Knowledge Bases can use supported stores or retrievers; a custom application can query OpenSearch or Kendra and then invoke a model. Do not create multiple copies of a corpus without explicit ownership and freshness requirements.

For Bedrock integration, `Retrieve` returns evidence for application-controlled context assembly; `RetrieveAndGenerate` combines retrieval and generation. Check source attribution, supported reranking/search options, and the source/store/model combination. [Knowledge Bases documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html).

Use custom retrieval when required parsing, entitlement logic, ranking, query transformations, or ingestion guarantees exceed the managed path. Test missing ACL metadata and stale group membership explicitly. [OpenSearch hybrid search](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-configure-neural-search.html) and [Kendra user-context filtering](https://docs.aws.amazon.com/kendra/latest/dg/user-context-filter.html) describe service-specific controls.

Parsing, chunking, ANN indexes, reranking, and retrieval metrics are taught on [AI Knowledge Bases](/study/aiKnowledgebases).

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

### 6.2 Compute and integration {#section-9-2-compute}

| Service | Role |
|---|---|
| Lambda | Short event handlers, validation, ingestion transforms, and tool adapters. |
| ECS / EKS | Containerized parsers, workers, gateways, and custom serving; EKS adds Kubernetes control and operational responsibilities. |
| SQS | Buffer work and manage consumer retries; configure visibility timeout, dead-letter handling, and queue-age alarms. |
| SNS | Fan out notifications to subscribers. |
| EventBridge | Route events by rules between application components. |

Durable workflow orchestration is covered by [Step Functions in section 3](#section-3-1-agentcore-boundary).

### 6.3 Data and state {#section-9-3-data}

<span id="section-12-5-security"></span>

| Service | Role |
|---|---|
| S3 | Source documents, evaluation datasets, artifacts, and batch input/output; manage versions and lifecycle. |
| DynamoDB | Task status, conversation records, and idempotency keys with conditional writes and deliberate expiry. |
| Aurora / RDS | Transactional records and entitlements; supported PostgreSQL vector extensions may also fit relational retrieval workloads. |
| Glue | Data preparation, catalogue, lineage, and quality workflows feeding ingestion/evaluation. |
| Macie | Discover sensitive data in S3 and trigger a findings-response workflow. |

### 6.4 Encryption, secrets, and operations {#section-9-4-operations}

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

## 7. Other AI services: compact lookup {#section-12-service-map}

<span id="section-12-2-language"></span>
<span id="section-12-3-purpose-built"></span>
<span id="section-12-4-operations-learning"></span>

Use a purpose-built API or packaged assistant when it already meets the task. This is an orientation list; the [AWS AI service overview](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html) provides the broader catalogue and lifecycle notices.

| Service | Primary use |
|---|---|
| Comprehend | Text classification, entities, sentiment, and PII detection. |
| Comprehend Medical | Clinical entities, relationships, and PHI extraction. |
| Textract | OCR and document structure; `AnalyzeDocument` handles forms/tables, `AnalyzeExpense` invoices/receipts. |
| Transcribe / Polly | Speech to text / text to speech. |
| Translate | Text translation. |
| Lex | Intent/slot-based voice and text conversations. |
| Rekognition | Image/video analysis and supported custom visual labels. |
| Personalize | Recommendations and personalized ranking. |
| Connect | Contact-centre workflows and conversation assistance/analytics. |
| Q Business | Managed organizational assistant with connected enterprise content. |
| Q Developer | Coding and supported AWS development assistance. |

## 8. Continue to certification preparation {#section-13-practice-traps}

<span id="101-high-value-aip-c01-comparison-rules"></span>

Use [AWS GenAI Professional preparation](/study/aiGenAIProfessional) for the exam blueprint, domain exercises, scenario practice, and readiness checks. Keep this page as the service reference when answering those scenarios.

## Official references {#official-references}

Service documentation is linked beside each decision above. For exam scope, use the [current AIP-C01 guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html) and its [in-scope service list](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html).
