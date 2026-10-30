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

**Architecture before services.** Find the layer that owns the problem. Each cluster keeps related tiles beside one **if this → choose that** tree. Open a service tile for its role, payload/workflow, capacity options, and AWS references. Interactive diagrams sit within their related sections.

<span id="section-1-decisions"></span>
<span id="agent-layer-map"></span>
<span id="section-10-decision-flow"></span>
<span id="northstar-map-caption"></span>

{% include aws-learning-assets.html %}
{% include aws-ai-service-map.html %}

<section class="aws-service-section" data-zone="life" markdown="1">

<span id="aws-heading-life"></span>
<span id="aws-decisions-life"></span>
<span id="aws-choice-configuration-choice"></span>
<span id="aws-choice-quality-gap"></span>

## 1. Model lifecycle {#aws-map-life}

Select → customize → evaluate → release → monitor

{% include aws-service-cards.html zone_id="life" %}

</section>

<section class="aws-service-section" data-zone="know" markdown="1">

<span id="aws-heading-know"></span>
<span id="aws-decisions-know"></span>
<span id="aws-choice-rag-diagnosis"></span>
<span id="aws-choice-extraction-choice"></span>

## 2. Knowledge / data flow {#aws-map-know}

Source → preprocess → ingest → store → retrieve

{% include aws-service-cards.html zone_id="know" %}

<span id="chunking-implementation"></span>
{% include aws-chunking-explorer.html %}

</section>

<section class="aws-service-section" data-zone="run" markdown="1">

<span id="aws-heading-run"></span>
<span id="aws-decisions-run"></span>
<span id="aws-choice-output-diagnosis"></span>
<span id="aws-choice-capacity-choice"></span>
<span id="aws-choice-latency-diagnosis"></span>
<span id="aws-choice-delivery-choice"></span>

## 3. Runtime / inference flow {#aws-map-run}

User/API → retrieval → prompt/context → model → response

{% include aws-service-cards.html zone_id="run" %}

</section>

<section class="aws-service-section" data-zone="orch" markdown="1">

<span id="aws-heading-orch"></span>
<span id="aws-decisions-orch"></span>
<span id="aws-choice-mcp-hosting"></span>
<span id="aws-choice-event-choice"></span>
<span id="aws-choice-recovery-choice"></span>

## 4. Pillar · Orchestration {#aws-map-orch}

Who chooses the next step? State · retries · approvals

{% include aws-service-cards.html zone_id="orch" %}

</section>

<section class="aws-service-section" data-zone="sec" markdown="1">

<span id="aws-heading-sec"></span>
<span id="aws-decisions-sec"></span>
<span id="aws-choice-identity-checks"></span>

## 5. Pillar · Security / governance {#aws-map-sec}

Identity · access · isolation · content safety

{% include aws-service-cards.html zone_id="sec" %}

<span id="identity-access-guide"></span>
{% include aws-identity-decisions.html %}

<span id="identity-protocol-guide"></span>
{% include aws-identity-protocols.html %}

<span id="identity-core-guide"></span>
{% include aws-identity-overview.html %}

</section>

<section class="aws-service-section" data-zone="eval" markdown="1">

<span id="aws-heading-eval"></span>
<span id="aws-decisions-eval"></span>
<span id="aws-choice-quality-or-operations"></span>
<span id="aws-choice-trustworthy-output"></span>

## 6. Pillar · Evaluation & observability {#aws-map-eval}

Quality before release + evidence from production

{% include aws-service-cards.html zone_id="eval" %}

<span id="audit-manager"></span>
{% include aws-security-evidence.html %}

</section>

<section class="aws-service-section" data-zone="pkg" markdown="1">

<span id="aws-heading-pkg"></span>
<span id="aws-decisions-pkg"></span>

## 7. Packaged apps {#aws-map-pkg}

Buy versus build

{% include aws-service-cards.html zone_id="pkg" %}

</section>

<span id="aws-connected-examples-heading"></span>

## Connected architectures {#aws-connected-examples}

Trace the handoffs. Each node opens the same service card used in the clusters.

{% include aws-service-examples.html %}
{% include aws-service-reference-dialog.html %}
{% include aws-service-dialog.html %}

<span id="section-13-practice-traps"></span>
<span id="101-high-value-aip-c01-comparison-rules"></span>

## References and practice {#official-references}

Cards and guides link to AWS for current contracts, limits, availability, and rates. Capacity comparisons include [Bedrock tiers](#aws-options-bedrock-tiers), [SageMaker hosting/GPU support](#aws-options-sagemaker-hosting), and [Step Functions modes](#aws-options-step-functions). Reviewed **{{ site.data.aws_service_options.checked }}**.

**Study sequence:** [Infrastructure and evaluation](/study/aiInfrastructure) → **AWS AI Services** → [AIP-C01 architecture and practice](/study/examProfessionalGenAi#genai-mindmap). AWS's [exam scope](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html) defines certification coverage.
