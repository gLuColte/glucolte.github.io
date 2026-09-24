---
title: AI Models and Providers
permalink: /study/aiModels
tag:
  - model selection
  - small and large language models
  - multimodal models
  - generative models
  - generative adversarial networks (GANs)
  - embedding models
  - reasoning models
  - fine-tuning
  - regularization
  - reinforcement learning from human feedback (RLHF)
  - training validation and test data
  - model providers
  - LoRA adapters
---

# AI Models and Providers

<aside class="technique-callout">
  <strong>Related reference</strong>
  <span><a href="/study/modelGuidelines">Model Guidelines</a> covers workload-based model and effort choices, pricing, and plans.</span>
</aside>

This page explains model characteristics, provider roles, hosting and portability.

**Part 3 of 7:** [Prompt engineering](/study/aiPromptEngineering) → **Models and providers** → [Knowledge bases](/study/aiKnowledgebases). This page is about choosing or adapting a model; it does not re-teach retrieval, tool loops, or platform operations.

## 1. Model, provider, and cloud are different {#section-1-boundaries}

- **Model**: the trained artifact and inference behaviour.
- **Model provider**: the organisation that trains, publishes, or serves a model family.
- **Cloud/model platform**: the commercial and technical access path around the model.
- Example:
  - Claude is an Anthropic model family;
  - it can be consumed directly from Anthropic or through Amazon Bedrock;
  - the access path changes API shape, regions, quotas, billing, networking, and governance;
  - it does not make Bedrock the model.

```text
workload → model capability → provider/model family → access path → production controls
```

### 1.1 What belongs to the model {#section-1-1-model-package}

For self-hosting, select a compatible checkpoint, tokenizer, chat format, and serving runtime. [Fundamentals explains why the model pipeline is coupled](/study/aiFundamentals#section-3-1-coupling); the migration consequences are covered under [portability](#section-8-portability).

### 1.2 Who owns and hosts what {#section-1-2-ownership}

- **Model creator/publisher**:
  - trains or releases the model family and defines its model artifacts/licence.
- **Direct API provider**:
  - serves its own or licensed models behind an API;
  - owns runtime concerns such as batching, capacity, upgrades, moderation, and exposed parameters.
- **Cloud model platform**:
  - provides access to models from one or more creators with cloud identity, networking, billing, governance, and regional availability;
  - does not become the creator of every model it hosts.
- **Self-hosting operator**:
  - runs compatible open-weight artifacts and owns serving engines, hardware, quantization, scaling, patching, and safety controls.
- The same model family can be available through several access paths, but API features, versions, latency, quotas, and governance can differ.

## 2. Select by workload, not leaderboard {#section-2-selection}

- Start with representative tasks and explicit acceptance thresholds.
- Choose the smallest, fastest, least expensive model that passes quality and safety requirements.
- Evaluate the full system because prompt, retrieval, tools, and model behaviour interact.
- Public benchmarks are useful for shortlisting, but may not represent:
  - domain terminology;
  - long documents;
  - exact identifiers;
  - tool schemas;
  - refusal policy;
  - production latency and throttling.

Core dimensions:

- **Task quality**: correctness, relevance, completeness, groundedness, and consistency.
- **Reasoning**: performance on multi-step constraints, planning, calculations, and ambiguous tasks.
- **Instruction following**: ability to respect policy, format, length, and evidence requirements.
- **Context performance**: usable recall across long input, not only the advertised maximum.
- **Modalities**: text, image, audio, video, and document input/output requirements.
- **Tool use**: correct tool selection, argument accuracy, recovery from tool errors, and parallel calls.
- **Structured output**: schema-valid output plus semantic field correctness.
- **Latency**: time to first token, tokens per second, and p95/p99 end-to-end time.
- **Throughput**: concurrent requests, quota, batching, and provisioned capacity.
- **Cost**: input/output tokens, retries, reasoning tokens, retrieval, tools, and idle capacity.
- **Operations**: availability, regional support, versioning, deprecation, observability, and support.

## 3. Model categories {#section-3-categories}

Categories overlap: they describe a workload role or inference behaviour rather than mutually exclusive architectures.

| Category | Select it for | Main selection risk |
|---|---|---|
| **General-purpose** | Varied generation, extraction, coding, and multimodal tasks | Broad capability does not imply low latency or cost. |
| **Reasoning** | Difficult planning, coding, and multi-step constraints | Extra inference compute can be wasted on simple tasks. |
| **Small language model** | High-volume classification, routing, or narrow transformations | Ambiguous and long-tail tasks may need escalation. |
| **Embedding** | Representing queries/documents for retrieval or clustering | A new embedding space normally requires corpus re-embedding. |
| **Reranking** | Improving precision within a retrieved candidate set | Added candidate-scoring cost and latency. |
| **Specialised** | Speech, vision, or another bounded domain task | Narrow coverage outside the target workload. |

Embedding and reranking mechanics belong on [Knowledge Bases](/study/aiKnowledgebases).

- A **reasoning model** is usually still an autoregressive transformer, but its training and serving encourage more useful intermediate deliberation:
  - reinforcement learning or related post-training can reward decomposition, checking, and correction;
  - more reasoning effort/test-time compute can generate more internal tokens before the final answer;
  - later tokens can attend to earlier reasoning and correct course, but the model does not literally rewrite earlier token IDs in place;
  - provider internals vary and may include hidden reasoning, verifiers, search, or other techniques.

- **Internal multi-step reasoning** occurs inside one model call and consumes inference time/tokens; providers may expose only a summary or no reasoning trace.
- **External multi-step execution** is an application, workflow, or agent loop across model calls and tools. It is not a model category; the application owns authorization, state, limits, and retries. Learn that boundary on [AI Agents](/study/aiAgents).

Reasoning effort, sampling controls, tool/schema support, and context/output limits vary by model and serving API; their names are not portable guarantees.

Primary examples: [OpenAI reasoning training and test-time compute](https://openai.com/index/learning-to-reason-with-llms/), the [DeepSeek-R1 paper](https://arxiv.org/abs/2501.12948), and [Gemini thinking controls](https://ai.google.dev/gemini-api/docs/thinking).

### 3.1 Small versus large language models {#small-large-language-models}

**SLM** and **LLM** describe relative scale; there is no universal parameter-count boundary. Size does not define whether a model can generate text, use tools, or accept images.

| Decision | Smaller language model | Larger language model |
|---|---|---|
| Workload fit | Narrow extraction, classification, routing, or domain tasks | Broad language coverage and difficult, varied tasks |
| Resource demand | Usually lower memory and compute; can suit local or edge deployment | Usually greater memory and compute requirements |
| Tradeoff | May need task tuning and escalation for difficult cases | Extra capability may not justify serving cost for simple tasks |

Benchmark the actual deployment: hardware, quantization, context size, and serving efficiency affect speed. A well-adapted small model can outperform a larger one on a narrow task; parameter count alone does not establish accuracy or safety. [Microsoft's small/large language-model overview](https://learn.microsoft.com/en-us/azure/aks/concepts-ai-ml-language-models).

### 3.2 Generative, embedding, and multimodal models {#generation-embedding-multimodal}

These terms answer different questions: **what output does the model produce**, and **which data types can it process**?

| Role | Typical input → output | Use |
|---|---|---|
| **Generative model** | Prompt/context → new text, image, audio, or other content | Draft an answer, summarize a document, or synthesize an image. |
| **Embedding model** | Text/image/other supported input → numerical vector | Similarity search, clustering, and retrieval. The vector itself is not a written answer. |
| **Multimodal model** | More than one modality, such as text and images | Answer a question about a photograph, or map image/text into a shared embedding space. |

In vector-based RAG, an embedding model encodes the query and content; a **retriever searches the index** for related evidence, and a generative model writes the response. RAG can also use lexical or structured retrieval without an embedding model. A multimodal embedding model can support retrieving images from text queries without generating images. [AWS embeddings overview](https://aws.amazon.com/what-is/embeddings/) and [Titan Multimodal Embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-multiemb-models.html).

Check **input and output modalities separately**: accepting images and returning text does not imply image generation. “Multimodal” does not guarantee support for every combination of text, images, audio, and video. AWS lists these separately in its [Nova model capability table](https://docs.aws.amazon.com/nova/latest/nova2-userguide/what-is-nova-2.html).

#### Generative model families {#generative-model-families}

Generative AI is broader than LLMs. For example, a **generative adversarial network (GAN)** trains a generator to produce samples and a discriminator to distinguish generated samples from training examples. The discriminator's learning signal guides the generator; successful training is not guaranteed. This is different from the next-token prediction objective in the LLM walkthrough. [Original GAN paper](https://arxiv.org/abs/1406.2661).

### 3.3 Adapt the model only when the problem calls for it {#model-adaptation}

<span id="31-adapt-the-model-only-when-the-problem-calls-for-it"></span>

Choose according to what needs to change:

| Approach | What changes? | Choose it when | Do not choose it when |
|---|---|---|---|
| **Prompt engineering** | Current request only | A clear instruction, examples, or output schema can solve the task | Prompt wording alone cannot supply missing current/private facts; combine it with retrieval or tools |
| **RAG** | Current runtime context | Knowledge changes often, is private, needs citations, or must respect document ACLs | Retrieval alone will not reliably teach stable style or repeated input→output behaviour |
| **Supervised fine-tuning (SFT)** | Selected model weights | Many labelled examples should make a narrow task, terminology, tone, or structure more consistent | You need a searchable, frequently changing knowledge base |
| **Continued pre-training** | Model weights, using a large domain corpus | The model needs broad domain-language adaptation before downstream tasks | A small set of instructions or current documents is sufficient |

**Instruction tuning** is a form of post-training that teaches a model to follow instructions and preferred response patterns. In practice, SFT often uses instruction/input → desired-output examples. It is not a document lookup mechanism.

**Parameter-efficient fine-tuning (PEFT)** is a family of methods that trains a small subset of existing or added parameters. **LoRA** is one such method: it learns low-rank weight updates while freezing the base weights. These approaches can reduce training memory and adaptation storage, but still require evaluation, versioning, and rollback. [PEFT methods](https://huggingface.co/docs/peft/index).

**Catastrophic forgetting** is a customization risk: aggressive or narrow training can degrade capabilities the base model previously had. Keep holdout tests for both the target task and important general/safety behaviours.

For AWS-specific customization capabilities and lifecycle decisions, see [AWS AI Services](/study/infrastructureAWSAiServices#section-4-bedrock-sagemaker).

#### Style examples versus adapter lifecycle {#style-and-adapters}

A paired product-description → brand-caption dataset is supervised adaptation even when the desired change is **tone**, rather than a new factual domain. Continued pre-training uses a different learning objective over an unlabelled corpus. Fine-tuning can reduce repeated demonstration tokens, but training, serving, and evaluation costs still determine whether it pays off.

With **LoRA**, store one frozen base and version the small learned updates separately. The deployable identity is the combination of base, adapter, tokenizer, and serving configuration. A registry records that identity and approval evidence; a compatible serving runtime loads and selects adapters. These are separate responsibilities. Multiple full fine-tuned checkpoints do not automatically become interchangeable adapters. See [AWS customization](/study/infrastructureAWSAiServices#bedrock-customization) and [adapter lifecycle](/study/infrastructureAWSAiServices#sagemaker-adapter-lifecycle).

### 3.4 Training, validation, and test sets {#training-data-splits}

<span id="training-data-evaluation-data-and-training-controls"></span>

| Item | Purpose | Development rule |
|---|---|---|
| **Training set** | Updates model parameters | The examples the model learns from |
| **Validation set** | Selects hyperparameters, checkpoints, thresholds, or early stopping | Does not directly update weights during that training run; it influences model selection |
| **Test set** | Estimates performance after development choices are fixed | Keep it held out from training and tuning |
| **Epoch** | One full pass through the training set | More epochs add compute; held-out quality may improve, plateau, or deteriorate |
| **Training batch size** | Examples processed together during training | The effective batch per update also depends on gradient accumulation and distributed workers; serving has a separate inference-batching concept |
| **Learning rate** | Step size of each parameter update | Too high can destabilize training; too low learns slowly |

Use a representative, deduplicated, permissioned dataset. Check label quality, class/edge-case coverage, PII/licensing, and train/validation/test leakage before interpreting a good score.

A **separate fixed validation set is optional**, depending on the training workflow. Cross-validation can rotate validation folds within the development data; some managed jobs create a split for you. A fixed training recipe may use a train/test split without tuning. Optional does **not** mean that repeated tuning against the test set is valid: once its results drive development, it is serving as validation data. Check each algorithm/API's dataset requirements. [Google's dataset-splitting guidance](https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets) and [scikit-learn cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html).

For example, split 1,000 independent examples into 700 training, 150 validation, and 150 test examples; choose the learning rate using validation, then report the locked model's test result. These percentages are illustrative. Split time-series data chronologically and keep related records together when random splitting would leak information. Fit preprocessing on training data only.

### 3.5 Regularization versus reward {#regularization-reward}

| Concept | Question it answers | Example |
|---|---|---|
| **Regularization** | How do we discourage overfitting or constrain updates? | L1/L2 penalties on weights, dropout, or early stopping. |
| **Reward** | Which outcomes should an RL policy prefer? | Score successful task completion, or use a reward model trained on human preferences. |

For a weight penalty, a simplified training objective is `minimize prediction_loss + λ × penalty`. L2 penalizes squared weight magnitudes; L1 penalizes absolute magnitudes and can encourage sparse weights. Stronger regularization can reduce variance but too much can cause underfitting. [Google's regularization lesson](https://developers.google.com/machine-learning/crash-course/overfitting/regularization).

The two can coexist: RL may **maximize expected reward while penalizing excessive divergence from a reference policy**. A negative reward is still an outcome signal; it is not automatically a technique for reducing overfitting. Improving a reward score also does not prove real-world quality if the model exploits flaws in the scoring rule. [AWS's RLHF training walkthrough](https://aws.amazon.com/blogs/machine-learning/improving-your-llms-with-rlhf-on-amazon-sagemaker/).

### 3.6 Reinforcement learning from human feedback (RLHF) {#rlhf}

A common LLM alignment workflow is:

1. Begin with a pretrained model, often with supervised instruction fine-tuning.
2. Ask humans to compare candidate responses using a rubric such as helpfulness and safety.
3. Train a **reward model** to predict those preferences.
4. Use reinforcement learning to update the language model toward higher reward, usually constraining how far it moves from a reference model.
5. Evaluate on held-out tasks, safety cases, and relevant user groups.

Human preferences supply the training signal; a person does not have to approve every token during ordinary inference. RLHF changes weights, whereas a human reviewing one production prediction may only correct that result. Feedback must enter a training workflow to change the model. Preference bias and reward exploitation remain risks. [AWS's RLHF overview](https://aws.amazon.com/what-is/reinforcement-learning-from-human-feedback/).

**Direct preference optimization (DPO)** is a related approach that learns directly from preference pairs without the classic separate reward-model-and-RL loop. Human feedback does not always imply RLHF. [AWS comparison of preference-training approaches](https://aws.amazon.com/blogs/machine-learning/fine-tune-large-language-models-with-reinforcement-learning-from-human-or-ai-feedback/).

### 3.7 Make a customized model smaller only after measuring quality

<span id="make-a-customized-model-smaller-only-after-measuring-quality"></span>

- **Distillation** trains a *student* using a teacher's outputs or other learned signals. For compression, the student is usually smaller; distillation does not inherently require different model sizes. Choose it when measured task quality justifies the serving savings.
- **Quantization** stores or computes weights with lower precision. It usually reduces memory and can improve throughput, but can reduce quality or hardware compatibility.
- Neither guarantees current knowledge. Distillation transfers what its teaching data supports; quantization changes numerical representation. Re-evaluate quality, safety, latency, and cost after either change.

## 4. Open weights versus managed models {#section-4-deployment}

- **Managed hosted API**:
  - fastest implementation path;
  - no GPU serving or model patching;
  - constrained by provider quotas, regions, API changes, and data terms.
- **Cloud model platform**:
  - central identity, billing, governance, regional integration, and model choice;
  - introduces platform-specific capabilities and uneven model availability.
- **Self-hosted open weights**:
  - control over version, deployment location, serving, quantization, and some customization;
  - requires accelerator capacity, autoscaling, batching, monitoring, patching, and safety controls;
  - may be justified by data boundaries, sustained volume, offline use, or specialized latency;
  - is rarely cheaper at low or unpredictable utilization.
- Open-weight does not necessarily mean open-source or unrestricted:
  - inspect licence terms;
  - permitted use;
  - redistribution;
  - training-data transparency;
  - derivative-model obligations.

## 5. Provider landscape {#section-5-providers}

Treat this as an ecosystem map, not a permanent ranking.

| Organisation | Famous model families | Typical shape | Common access paths |
|---|---|---|---|
| **OpenAI** | **GPT** | Hosted general-purpose reasoning, coding, multimodal, structured-output, and tool models | OpenAI API and OpenAI applications |
| **Anthropic** | **Claude** | Hosted reasoning, coding, long-context, and agent/tool workloads | Claude API, Amazon Bedrock, Google Cloud, and other supported platforms |
| **Google / Google DeepMind** | **Gemini** and **Gemma** | Gemini includes managed multimodal models; Gemma provides open-weight models | Gemini API / Vertex AI for supported Gemini models; local, self-hosted, or supported hosted deployment for Gemma |
| **DeepSeek** | **DeepSeek** | Reasoning/coding with low-cost APIs and open-weight options | DeepSeek API, compatible API formats, and self/third-party hosting |
| **Meta** | **Llama** | Open-weight ecosystem with many sizes and community serving stacks | Self-hosting and many cloud/model hosts |
| **Mistral AI** | **Mistral and Mixtral** families | Hosted and open-weight models, often emphasizing efficient deployment | Mistral API, self-hosting, and cloud/model hosts |
| **Cohere** | **Command, Embed, and Rerank** | Enterprise generation plus dedicated retrieval and ranking models | Cohere API and supported cloud platforms |
| **Amazon** | **Nova** and **Titan** | Generation and embedding models; supported modalities depend on the exact model | Amazon Bedrock and other documented model-specific access paths |

- GPT is a model family; ChatGPT is an application that uses models and additional product services.
- Claude is Anthropic's model family; Claude.ai is an application, while Claude can also be invoked through other platforms.
- Gemini is used as both a model-family and product brand, so record the exact API model ID and access path.
- For every evaluation, record the exact model ID, API/access path, Region, date, and configuration.

Provider references: [Claude models](https://platform.claude.com/docs/en/models/overview), [Gemini](https://ai.google.dev/gemini-api/docs/models), [Gemma](https://ai.google.dev/gemma/docs), [Cohere](https://docs.cohere.com/docs/models), and [Mistral](https://docs.mistral.ai/models). Family membership does not guarantee that every model supports the same features or access paths.

## 6. Compare cost using the workload {#section-6-pricing}

Provider price cards change too often to be study material. Use the current official pricing page for the exact model and Region, then apply the same workload calculation:

```text
request cost ≈
    input_tokens  / 1,000,000 × input_rate
  + output_tokens / 1,000,000 × output_rate
```

- Use the provider's billable token categories: reasoning tokens may already be included in billed output, and cached input may have a separate rate. Do not count the same tokens twice. Add applicable tool, retrieval, retry, capacity, and data-transfer charges.
- Compare **cost per successful task**, using realistic input/output distributions and failure rates—not only a headline token price.
- Consumer subscriptions are product access, not interchangeable API credits.

For caching, capacity, queues, and cost controls across the whole system, continue to [AI Infrastructure and Evaluation](/study/aiInfrastructure#section-10-cost).

Official references:

- [OpenAI models and prices](https://developers.openai.com/api/docs/models)
- [Anthropic Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [DeepSeek models and pricing](https://api-docs.deepseek.com/quick_start/pricing/)

## 7. Routing, cascades, and fallback {#section-7-routing}

```text
request → policy + difficulty classifier
          ├─ simple classification/extraction → small model
          ├─ vector retrieval                → embedding model + index search
          ├─ reorder candidates              → reranker
          ├─ normal generation               → general model
          └─ difficult reasoning             → reasoning model
                                      failure ↓
                              tested semantic fallback
```

- Route using task type, risk, context length, latency budget, and measured confidence.
- Use cascades when a cheap first pass can reliably identify uncertain cases.
- Set an escalation budget; repeated model retries can cost more than using the stronger model once.
- A fallback must preserve a tested contract:
  - supported modalities;
  - tool names and schemas;
  - structured-output behaviour;
  - safety/refusal policy;
  - context and output limits.
- A configured second model is not a fallback until it has passed the same regression suite.

## 8. Portability and lock-in {#section-8-portability}

- Separate three kinds of portability:
  - **API portability**: another adapter can send messages and receive output.
  - **Behavioural portability**: the replacement preserves quality, tools, schemas, safety, and latency for the workload.
  - **Artifact compatibility**: tokenizer, weights, and runtime formats can actually be loaded together; this mainly matters when self-hosting.
- Put a thin internal boundary around:
  - messages and content parts;
  - timeouts, retries, and cancellation;
  - tracing and token/cost accounting;
  - tool and structured-output schemas;
  - model selection and fallback;
  - safety policy.
- Keep provider-native features behind explicit adapters.
- Store prompts, tool schemas, and evaluation datasets outside provider consoles where practical.
- Expect portability work because models and serving access paths differ in:
  - tokenization and context behaviour;
  - streaming events;
  - tool-call semantics;
  - multimodal formats;
  - reasoning controls;
  - safety refusals;
  - rate limits and errors.
- When changing generation models:
  - retain raw text/messages and tokenize them with the target model; never migrate cached token IDs blindly;
  - recalculate context and output limits;
  - retest prompts, tool schemas, structured output, safety, latency, and cost;
  - invalidate model-specific prompt/token caches;
  - re-embed a RAG corpus only if its dedicated embedding model or preprocessing changes—not merely because the generation model changed.
- Do not reduce every provider to the lowest common denominator if a native feature creates measurable value; isolate and test the dependency instead.

## 9. Enterprise decision checklist {#section-9-enterprise}

- Quality:
  - Does it pass the workload regression set and worst-case slices?
- Data:
  - Are prompts retained, logged, or used for training?
  - Where is data processed and stored?
- Security:
  - Are private connectivity, encryption keys, audit logs, and least-privilege access supported?
- Reliability:
  - What are quotas, rate limits, SLAs, regional availability, and deprecation policies?
- Operations:
  - Can requests, tokens, model versions, errors, and safety decisions be traced?
- Commercial:
  - What is cost per successful task under realistic prompt/output sizes and retry rates?
- Exit:
  - Can prompts, evaluation data, traces, and routing be moved?
  - Which native features would need replacement?

See [AI evaluation and infrastructure](/study/aiInfrastructure) for workload testing and production controls. AWS-specific access decisions are in [AWS AI services](/study/infrastructureAWSAiServices).
