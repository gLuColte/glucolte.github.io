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

Understand **what each service does, when to use it, and its request/response shape**. Open a card for capability bullets, a payload/workflow example, and relevant tier/capacity choices. AWS links provide setup details and current rates.

**Visual guides:** [Choose an access path](#identity-decision-tree) · [Identity and tokens](#identity-protocols) · [RAG chunking](#rag-chunking-explorer) · [Security and auditing](#security-compliance-map).

**Core comparisons:** [Bedrock tiers](#aws-options-bedrock-tiers) · [SageMaker hosting / GPU support](#aws-options-sagemaker-hosting) · [Step Functions Standard / Express](#aws-options-step-functions). Other comparisons stay in the service cards. Swipe wide tables sideways on small screens.

**Part 7 of 7:** [Infrastructure and evaluation](/study/aiInfrastructure) → **AWS AI Services** → [certification practice](/study/aiGenAIProfessional#default-architecture).

<span id="section-1-decisions"></span>
<span id="agent-layer-map"></span>
<span id="section-10-decision-flow"></span>
<span id="northstar-map-caption"></span>

{% include aws-learning-assets.html %}
{% include aws-ai-service-map.html %}

<section class="aws-service-section" data-zone="life" markdown="1">

<span id="aws-heading-life"></span>

## 1. Model lifecycle {#aws-map-life}

Select → adapt if needed → evaluate → release → monitor

{% include aws-service-cards.html zone_id="life" %}

#### Decision Making {#aws-decisions-life}

{% include aws-service-decisions.md zone_id="life" %}

#### Implementation Notes {#aws-notes-life}

{% include aws-service-notes/life.md %}

</section>

<section class="aws-service-section" data-zone="know" markdown="1">

<span id="aws-heading-know"></span>

## 2. Knowledge and data {#aws-map-know}

Source → prepare → ingest → store → retrieve

{% include aws-service-cards.html zone_id="know" %}

#### Decision Making {#aws-decisions-know}

{% include aws-service-decisions.md zone_id="know" %}

#### Implementation Notes {#aws-notes-know}

{% include aws-service-notes/know.md %}

</section>

<section class="aws-service-section" data-zone="run" markdown="1">

<span id="aws-heading-run"></span>

## 3. Runtime and inference {#aws-map-run}

User/API → retrieval → prompt/context → model → response

{% include aws-service-cards.html zone_id="run" %}

#### Decision Making {#aws-decisions-run}

{% include aws-service-decisions.md zone_id="run" %}

#### Implementation Notes {#aws-notes-run}

{% include aws-service-notes/run.md %}

</section>

<section class="aws-service-section" data-zone="orch" markdown="1">

<span id="aws-heading-orch"></span>

## 4. Orchestration {#aws-map-orch}

Choose who controls progress, then add durability and recovery

{% include aws-service-cards.html zone_id="orch" %}

#### Decision Making {#aws-decisions-orch}

{% include aws-service-decisions.md zone_id="orch" %}

#### Implementation Notes {#aws-notes-orch}

{% include aws-service-notes/orch.md %}

</section>

<section class="aws-service-section" data-zone="sec" markdown="1">

<span id="aws-heading-sec"></span>

## 5. Security and governance {#aws-map-sec}

Identity → resource/data authorization → private paths → safe content and retention

{% include aws-service-cards.html zone_id="sec" %}

#### Decision Making {#aws-decisions-sec}

{% include aws-service-decisions.md zone_id="sec" %}

#### Implementation Notes {#aws-notes-sec}

{% include aws-service-notes/sec.md %}

</section>

<section class="aws-service-section" data-zone="eval" markdown="1">

<span id="aws-heading-eval"></span>

## 6. Evaluation and operations {#aws-map-eval}

Prove quality before release; collect the evidence needed in production

{% include aws-service-cards.html zone_id="eval" %}

#### Decision Making {#aws-decisions-eval}

{% include aws-service-decisions.md zone_id="eval" %}

#### Implementation Notes {#aws-notes-eval}

{% include aws-service-notes/eval.md %}

</section>

<section class="aws-service-section" data-zone="pkg" markdown="1">

<span id="aws-heading-pkg"></span>

## 7. Packaged assistants {#aws-map-pkg}

Choose a supported product when its workflow fits

{% include aws-service-cards.html zone_id="pkg" %}

#### Decision Making {#aws-decisions-pkg}

{% include aws-service-decisions.md zone_id="pkg" %}

#### Implementation Notes {#aws-notes-pkg}

{% include aws-service-notes/pkg.md %}

</section>

<span id="aws-connected-examples-heading"></span>

## Connected examples {#aws-connected-examples}

Trace how the services cooperate. Each step opens the same service card used above.

{% include aws-service-examples.html %}

{% include aws-service-dialog.html %}


<span id="section-13-practice-traps"></span>
<span id="101-high-value-aip-c01-comparison-rules"></span>

## Official references {#official-references}

Reviewed **{{ site.data.aws_service_options.checked }}**. Use the AWS links beside each concept/card to check current model, Region, availability, limits, and pricing. Card notices highlight existing-customer and lifecycle restrictions.

For certification practice, use the [exam guide and architecture mindmap](/study/aiGenAIProfessional#genai-mindmap); AWS's [exam scope](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html) and [service list](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-in-scope-services.html) define coverage.
