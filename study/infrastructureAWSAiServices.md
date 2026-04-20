---
title: AWS AI Services
permalink: /study/infrastructureAWSAiServices
---

## 1. Foundation Models vs LLMs {#section-1-foundation-vs-llm}

Foundation models are massive neural networks trained on diverse data (text, code, audio, video, images) so they can be adapted to many downstream tasks. Large Language Models (LLMs) are a subset focused on token-based language tasks. Use the matrix below for quick exam recall.

<table class="study-table">
  <thead>
    <tr>
      <th>Dimension</th>
      <th>Foundation Model</th>
      <th>Large Language Model (LLM)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Scope</strong></td>
      <td>Multi-modal (text, audio, image, video, code) or unimodal</td>
      <td>Primarily language + code; some add image adapters</td>
    </tr>
    <tr>
      <td><strong>Training Task</strong></td>
      <td>Generic self-supervised objectives (masking, contrastive learning, etc.)</td>
      <td>Autoregressive next-token prediction</td>
    </tr>
    <tr>
      <td><strong>Input / Output</strong></td>
      <td>Any supported modality, embeddings, or metadata</td>
      <td>Tokens (text/code) with optional tool-calls</td>
    </tr>
    <tr>
      <td><strong>Adaptation</strong></td>
      <td>Task-specific fine-tuning, adapters, RLHF</td>
      <td>Prompting, instruction tuning, RLHF, guardrails</td>
    </tr>
    <tr>
      <td><strong>Use Cases</strong></td>
      <td>Vision, audio, multi-modal search, robotics</td>
      <td>Chatbots, Q&A, summarization, agents, code-gen</td>
    </tr>
  </tbody>
</table>

---

## 2. Training Hyperparameters You Must Know {#section-2-training-basics}

- **Epochs** – One pass over the full training set. Multiple batches make up an epoch; models iterate through many epochs until accuracy converges or validation loss stops improving.
- **Batch size** – Number of records processed per update. Small batches fit on modest GPUs and introduce more gradient noise (helpful for generalization); large batches use more memory but stabilize training.
- **Learning rate** – Size of each weight update. High rates (e.g., `1e-1`) converge quickly but can overshoot; low rates (e.g., `5e-5` for BERT) are slower but safer. Most schedulers decay the rate as training progresses.

Remember: adjusting these three knobs is often enough to fix unstable training before you consider changing the model architecture.

---

## 3. Why Transformers Matter {#section-3-transformers}

Transformers replaced recurrent networks by relying on **self-attention**, which lets every token weigh every other token in the sequence to build contextual embeddings. Positional encodings preserve word order, and encoder/decoder stacks process inputs in parallel so latency scales well on GPUs. This architecture powers modern translation, summarization, speech, and vision-language models—and is the backbone of Bedrock and SageMaker JumpStart offerings.

---

## 4. Steering LLM Output {#section-4-generation-controls}

- **Temperature (0–1)** – Scales the probability distribution before sampling. Lower values push the model toward the single most likely answer (deterministic); higher values encourage creative or varied text.
- **Top-p (nucleus sampling)** – Keeps only the smallest set of tokens whose cumulative probability is ≥ `p`. Lower `p` limits the candidate pool to highly probable tokens; higher `p` allows adventurous replies. Amazon Bedrock exposes both parameters for every supported model.

_Exam tip: Control hallucinations by lowering temperature/top-p and grounding answers with retrieved context._

### Prompt Engineering {#section-4-prompt-engineering}

- **Zero-shot** – instruction only; rely on the model’s pre-training.
- **Few-shot** – add exemplars so the model mimics the pattern.
- **Chain-of-thought** – ask for step-by-step reasoning to surface intermediate logic.
- **Few-shot + CoT** – provide worked examples with reasoning, then request the same structure for the new task.
- **RAG** – retrieve fresh/internal data and inject it into the prompt; complements prompt style by adding knowledge.
- **Prompt structure checklist** – instruction, context, constraints, output format. Validation happens afterward, not inside the prompt.
- **Use cases** – chocatalogue2025!ose prompting tweaks for reasoning changes; choose RAG when knowledge gaps exist.

---

## 5. Retrieval-Augmented Generation (RAG) {#section-5-rag}

RAG keeps foundation models up to date without re-training:

1. Ingest documents (PDFs, FAQs, catalogs) and chunk them with metadata.
2. Create embeddings and store them in a vector index such as OpenSearch Serverless, Aurora Postgres + pgvector, or Knowledge Bases for Amazon Bedrock.
3. When the user asks a question, retrieve the most relevant chunks.
4. Pass the question + retrieved context to the LLM so the answer cites fresh data.

This pattern is cheaper than fine-tuning every time the knowledge base changes and is the default recommendation on the exam for “most current answers at low cost.”

_Exam tip: Always justify RAG when the requirement is “fresh data without retraining.”_

### Responsible AI and Governance {#section-5-governance}

- Enforce data validation/cleansing pipelines before training or inference to reduce bias and drift.
- Maintain written data quality standards as core AI governance controls.
- Responsible AI pillars: fairness, explainability, privacy, robustness, safety, accountability.
- Apply guardrails/admin controls (e.g., Bedrock guardrails, Amazon Q Business policies) to suppress sensitive or off-topic outputs.

### Security and Compliance {#section-5-security}

- **Layered controls** – access policies (IAM, VPC), data protection (encryption, redaction), detailed logging, and compliance evidence.
- **Data logging** – record prompts, model invocations, and decisions for monitoring, troubleshooting, and audits.
- **AWS Artifact** – self-service access to AWS SOC, ISO, and PCI reports when proving compliance.
- Highlight logging + Artifact in exam answers that mention regulators, internal audits, or shared responsibility clarifications.

---

## 6. Specializing a Foundation Model {#section-6-specialization}

### 6.1 Domain Adaptation Fine-Tuning {#section-6-1-domain-adaptation}

- Start with a general foundation model, then fine-tune on labeled domain-specific prompts/responses.
- Best when you have curated task data (support tickets, contracts, medical summaries) and need the model to follow strict formats or voice.
- Requires fewer tokens than pre-training because you are only nudging existing weights.

### 6.2 Continued Pre-Training {#section-6-2-continued-pretraining}

- Feed the model a large unlabeled corpus from your domain to extend its vocabulary and context understanding before supervised fine-tuning.
- Use this when jargon-heavy data (legal, biotech, oil & gas) is missing from the public corpus. You still need to run a fine-tune afterward for task instructions.

Exam tip: choose fine-tuning for adapting behavior on known tasks; choose continued pre-training when the base knowledge is insufficient.

### Evaluation Metrics {#section-6-3-evaluation-metrics}

- **Efficiency** – latency, throughput, or cost-per-token; use when speed/cost limits exist.
- **Task metrics** – accuracy, F1, BLEU, ROUGE for technical fit-for-purpose checks.
- **Business/operational metrics** – ARPU, CSAT, deflection; expect exam questions to mix technical and business KPIs to ensure you map each requirement to the correct metric type.
- Remember: ARPU is a business KPI, not a model performance metric.

### Agents and Real-Time Augmentation {#section-6-4-agents}

- AI agents connect model reasoning to tools, APIs, workflows, and databases to execute tasks.
- Typical flow: parse natural language intent → map to tool or API call → send results back through the model for explanation.
- Use retrieval or tool calls when real-time or transactional data is required; prompting alone cannot access live systems.
- Bedrock Agents or custom orchestration can translate user input into API/SQL calls, keeping humans in the loop for approvals.

---

## 7. Embeddings and BERT {#section-7-embeddings}

Embedding models convert words, sentences, or images into dense vectors so that similar items land close together in multi-dimensional space. BERT (Bidirectional Encoder Representations from Transformers) generates contextual embeddings by looking at words both before and after the target token. Because embeddings change with context, BERT excels at intent detection, entity recognition, and semantic search where static word vectors fail.

---

## 8. AWS Service Map {#section-8-aws-services}

- Amazon Bedrock – managed foundation-model access for generative apps without training from scratch.
- Amazon SageMaker – custom ML build/train/tune/deploy lifecycle.
- Amazon Lex – conversational interface builder using intents and slots.
- Amazon Kendra – enterprise search with intelligent retrieval over connected document stores.
- Amazon Q Business – managed enterprise AI assistant with connectors, RBAC, and admin guardrails.
- Amazon Comprehend – NLP service for sentiment, key phrases, classification, and entity extraction.

<table class="study-table">
  <thead>
    <tr>
      <th>Service</th>
      <th>Category</th>
      <th>What to Remember</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Amazon Bedrock</strong></td>
      <td>Foundation Models</td>
      <td>Serverless access to Titan, Anthropic, Meta, Cohere, Mistral models; built-in RAG and guardrails.</td>
    </tr>
    <tr>
      <td><strong>Amazon SageMaker</strong></td>
      <td>Build/Train/Deploy</td>
      <td>Custom training, fine-tuning, autopilot, and JumpStart model zoo.</td>
    </tr>
    <tr>
      <td><strong>Amazon Transcribe</strong></td>
      <td>Speech-to-Text</td>
      <td>Streaming/batch transcription with channel identification and redaction.</td>
    </tr>
    <tr>
      <td><strong>Amazon Comprehend</strong></td>
      <td>Natural Language</td>
      <td>Entity detection, sentiment, key phrases, PII redaction; supports custom classification.</td>
    </tr>
    <tr>
      <td><strong>Amazon Kendra</strong></td>
      <td>Enterprise Search</td>
      <td>High-accuracy semantic search with connectors, relevance tuning, and FAQs.</td>
    </tr>
    <tr>
      <td><strong>Amazon Rekognition</strong></td>
      <td>Vision</td>
      <td>Image/video labels, face search, unsafe content, text detection.</td>
    </tr>
    <tr>
      <td><strong>Amazon Textract</strong></td>
      <td>Document AI</td>
      <td>Structured extraction (forms, tables) beyond OCR.</td>
    </tr>
    <tr>
      <td><strong>Amazon Polly</strong></td>
      <td>Text-to-Speech</td>
      <td>Neural voices, Speech Marks for lip-sync, Lex integration.</td>
    </tr>
    <tr>
      <td><strong>Amazon Lex</strong></td>
      <td>Conversational</td>
      <td>Build chat/voice bots with slots, Lambda fulfillment, multi-lingual support.</td>
    </tr>
    <tr>
      <td><strong>Amazon Q Business</strong></td>
      <td>Enterprise AI Assistant</td>
      <td>Managed assistants with connectors, RBAC, guardrails, and analytics.</td>
    </tr>
    <tr>
      <td><strong>Amazon Translate</strong></td>
      <td>Machine Translation</td>
      <td>Real-time and batch translation with active custom terminology.</td>
    </tr>
  </tbody>
</table>

_Exam tip: Know the basic capability of each managed AI service—questions often ask you to swap Rekognition (vision) vs Textract (document parsing) vs Comprehend (text NLP)._ 

## Exam Traps {#section-exam-traps}

- Prompt validation is post-processing; exam answers that list it as a core prompt element are wrong.
- ARPU belongs to business KPI dashboards, not ML evaluation tables.
- RAG adds knowledge; prompt tweaks only change reasoning style—never claim prompting alone provides fresh data.

## Memory Hooks {#section-memory-hooks}

- Bedrock = FM platform
- SageMaker = custom ML platform
- Lex = chatbot flow
- Kendra = retrieval/search
- Comprehend = NLP extraction
- Amazon Q Business = enterprise AI assistant
- RAG = retrieve then generate
- Agents = LLM + tools/API bridges
- Efficiency metric = latency/cost focus
- Data logging = audit trail

## 9. LLM Conversation Flow Diagram {#section-9-llm-diagram}

Use this UML snippet to visualize how user prompts move through retrieval, inference, and back to the UI.

<div class="image-wrapper">
  <img src="./assets/llm_conversation_flow.png" alt="llm_conversation_flow" class="modal-trigger" data-caption="🧠 LLM Conversation Flow">
  <div class="diagram-caption" data-snippet-id="llm_conversation_flow">
    🧠 LLM Conversation Flow
  </div>
  <script type="text/plain" id="llm_conversation_flow">
@startuml
title LLM + RAG request lifecycle

actor User
participant "Application UI" as UI
participant "Retriever\n(Vector DB)" as RETRIEVE
participant "LLM Gateway\n(Bedrock/SageMaker)" as LLM
participant "Post-Processing" as POST

User -> UI: Ask question
UI -> RETRIEVE: search embeddings (top-k)
RETRIEVE --> UI: relevant context
UI -> LLM: prompt + context + controls\n(temp, top-p, max tokens)
LLM --> UI: streamed tokens
UI -> POST: apply guardrails\n(citations, formatting)
POST --> User: final answer + sources

@enduml
  </script>
</div>

---
## 9. Prompt Engineering Essentials {#section-9-prompt-engineering}

- **Zero-shot vs few-shot** – Zero-shot relies purely on instructions, ideal for broad Q&A; few-shot includes curated examples so the model mirrors tone or schema. Prefer few-shot when responses must follow strict formatting.
- **System vs user prompts** – System prompts set persona/policies; user prompts keep transient context. Adjust system prompts for compliance tone without retraining.
- **Structured outputs** – Describe the schema (JSON/YAML) and list mandatory/optional fields; combine with Bedrock Guardrails or Lex slot validation to reject malformed payloads.
- **Decoding controls** – Temperature, top-p, max tokens, and stop sequences govern creativity, latency, and runaway responses. Exams often ask you to lower temperature and add stop sequences to cap emails or policies.
- **Tool/function calling** – Document available functions (name + parameters). The LLM decides whether to call a tool and returns JSON so the orchestrator can act. Key concept for Bedrock Agents and custom controllers.

_Exam tip: Keep prompts short, move reusable policy text to templates, and cap `max_tokens` to avoid surprise billing._

---

## 10. RAG Architecture & Tuning {#section-10-rag-architecture}

- **Chunking + overlap** – Target 200–500 token chunks with 10–20% overlap so passages maintain context without blowing up storage.
- **Embeddings + vector stores** – Use Titan Text Embeddings, Cohere Embed, or open-source (bge/e5) with OpenSearch Serverless, Aurora pgvector, Neptune Analytics, or Bedrock Knowledge Bases.
- **Top-k retrieval + metadata filters** – Start with `k=3–5`, then filter by product, locale, or classification labels to cut noise.
- **Reranking + hybrid search** – Combine dense vectors with keyword/BM25 or use rerankers when rare terms or legal phrases matter.
- **Latency vs cost** – Larger vectors improve recall but add milliseconds and storage fees. Cache popular context windows; pre-compute embeddings offline.

<div class="image-wrapper">
  <img src="./assets/rag_architecture.png" alt="rag_architecture" class="modal-trigger" data-caption="🧱 RAG Architecture">
  <div class="diagram-caption" data-snippet-id="rag_architecture">
    🧱 RAG Architecture
  </div>
  <script type="text/plain" id="rag_architecture">
@startuml
title End-to-end RAG flow

actor User
participant "Client App" as APP
participant "Chunk & Embed" as INGEST
participant "Vector Store" as VECTOR
participant "LLM Endpoint" as LLM

== Ingestion ==
APP -> INGEST: Upload docs + metadata
INGEST -> VECTOR: Store embeddings + filters

== Query ==
User -> APP: Question
APP -> VECTOR: similarity search (top-k + filter)
VECTOR --> APP: relevant chunks
APP -> LLM: prompt + chunks + decoding controls
LLM --> APP: grounded answer + citations
APP --> User: response (low hallucination)

@enduml
  </script>
</div>

_Exam tip: Answer “Use Bedrock Knowledge Bases” whenever the question stresses managed ingestion + retrieval._

---

## 11. Agents & Tool Use {#section-11-agents}

- **Agent vs RAG** – Use RAG for better context inside a single response. Use agents when you need planning, multi-step workflows, or to call APIs/DBs dynamically.
- **Tool calling patterns** – The agent interprets intent, chooses a tool (Lambda/HTTPS/Step Functions), executes it, ingests the result, and may loop until complete.
- **AWS mapping** – Bedrock Agents orchestrate reasoning, call Lambda for business logic, Step Functions for long-running jobs, and can integrate RAG for grounding.

This diagram is worth keeping because it clarifies a common point of confusion: the **agent** is the controller/orchestrator, the **model** is the reasoning engine, **tools** perform actions, **state** holds short-term working memory, and the **vector DB** acts as a retrieval index for long-term knowledge.

Concrete example: in a coding assistant, a user asks to fix a login bug, the model suggests inspecting `auth.py`, the agent reads the file with a tool, stores the result in state, optionally retrieves related docs from the vector index, and then calls the model again with the updated context.

<div class="image-wrapper">
  <img src="./assets/ai_agent_architecture.png" alt="ai_agent_architecture" class="modal-trigger" data-caption="🧭 Agent vs Model vs Tools vs Vector DB">
  <div class="diagram-caption" data-snippet-id="ai_agent_architecture">
    🧭 Agent vs Model vs Tools vs Vector DB
  </div>
  <script type="text/plain" id="ai_agent_architecture">
@startuml
title Agent vs AI Model vs Tools vs Vector DB

actor User

box "Client / Interface Layer" #E3F2FD
participant "CLI / App\n(Kiro CLI, Cursor,\nChatGPT UI)" as CLI
end box

box "Agent Layer\n(wrapper/controller)" #E8F5E9
participant "Agent Runtime\nstate + workflow" as Agent
participant "Agent Configuration\nrole, rules,\npermissions,\nmodel choice" as Config
participant "Context Builder\nprompt assembly" as Context
end box

box "Retrieval / Memory Layer" #FFF3E0
database "Vector DB / Retrieval Index\nQdrant, Weaviate,\npgvector, Chroma" as VectorDB
database "Session Memory / Task State\nhistory, summaries,\nprevious tool results" as State
end box

box "Tool Layer\nthings the agent can operate" #F3E5F5
participant "Tools\nfile read/write,\nterminal, MCP,\nAPIs, tests" as Tools
end box

box "AI Model Provider Layer\nactual intelligence engine" #FFEBEE
participant "AI Model\nGPT / Claude / Gemini\nstateless per call" as Model
end box

== Agent starts ==

User -> CLI: Send task
CLI -> Agent: Start agent session

Agent -> Config: Load config
Config --> Agent: Role, rules, allowed tools,\nmodel choice, permissions

Agent -> State: Load session/task state
State --> Agent: History, summaries,\nprevious progress

note over Config,Agent
Config is not the AI.
It tells the agent how to behave.
end note

== Build first model call ==

Agent -> Context: Build prompt package

Context -> VectorDB: Search relevant chunks
VectorDB --> Context: Relevant docs/code/context

Context -> State: Load useful history
State --> Context: Prior messages / summaries

Context --> Agent: Final prompt package

Agent -> Model: Call #1\nrequest + retrieved context + state
Model --> Agent: Response:\nInspect auth.py token validation

note over Model
The model is stateless between calls
unless context is resent.
end note

== Agent uses tools ==

Agent -> Tools: Read auth.py
Tools --> Agent: auth.py contents

Agent -> State: Store tool result / task progress
State --> Agent: Updated state saved

== Second model call ==

Agent -> Context: Rebuild prompt package
Context -> State: Load updated state
State --> Context: File contents + previous response
Context -> VectorDB: Optional search again
VectorDB --> Context: More relevant context

Context --> Agent: Updated prompt package

Agent -> Model: Call #2\nrequest + file contents + prior step
Model --> Agent: Response:\nPatch token check and run tests

== Tool use again ==

Agent -> Tools: Edit auth.py
Tools --> Agent: Diff

Agent -> Tools: Run auth tests
Tools --> Agent: Test output

Agent -> State: Save diff + test output
State --> Agent: Updated state saved

== Final model call ==

Agent -> Context: Rebuild final context
Context -> State: Load latest state
State --> Context: Diff + test output + summary
Context --> Agent: Final prompt package

Agent -> Model: Call #3\nlatest context + result
Model --> Agent: Final answer

Agent -> CLI: Return result
CLI -> User: Show answer / diff / status

note over Agent,Model
Agent = controller/orchestrator.
AI Model = reasoning engine.
Tools = action surface.
State = short-term working memory.
Vector DB = retrieval index.
end note

@enduml
  </script>
</div>

<div class="image-wrapper">
  <img src="./assets/agent_tool_chain.png" alt="agent_tool_chain" class="modal-trigger" data-caption="🤖 Agent Tool Chain">
  <div class="diagram-caption" data-snippet-id="agent_tool_chain">
    🤖 Agent Tool Chain
  </div>
  <script type="text/plain" id="agent_tool_chain">
@startuml
title Bedrock Agent invoking tools

actor User
participant "Bedrock Agent" as AGENT
participant "RAG Retriever" as RAG
participant "Lambda Tool" as LAMBDA
participant "Step Functions" as STEP
participant "Final Response" as RESP

User -> AGENT: Complex task
AGENT -> RAG: fetch context (optional)
RAG --> AGENT: supporting data
AGENT -> LAMBDA: call tool (JSON params)
LAMBDA --> AGENT: tool output
AGENT -> STEP: orchestrate long workflow
STEP --> AGENT: completion state
AGENT -> RESP: compose answer + actions
RESP --> User: explanation + citations

@enduml
  </script>
</div>

_Exam tip: If the requirement says “call internal APIs and external SaaS with reasoning,” pick Bedrock Agents with Lambda tools._

---

## 12. Evaluation & Hallucination Control {#section-12-eval}

- **Offline evaluation** – Score prompts/models against golden datasets for accuracy, BLEU/ROUGE, or custom rubric. Automate in SageMaker pipelines.
- **Human + LLM-as-judge** – SMEs validate edge cases; LLM judges accelerate regression testing but must be calibrated.
- **Grounding + citations** – Return snippet IDs or URLs so auditors can verify answers. Bedrock Knowledge Bases can include citations automatically.
- **Temperature + guardrails** – Keep temperature/top-p low for factual tasks and add Guardrails for profanity/PII filters or JSON schemas.

_Exam tip: When compliance reviewers are mentioned, respond with “human-in-the-loop evaluation plus logged citations.”_

---

## 13. Responsible AI, Privacy, Security {#section-13-responsible-ai}

- **Bias/fairness** – Audit datasets, compare outputs across demographic slices, and document mitigations.
- **PII governance** – Mask prompts, encrypt data (KMS), route calls through VPC endpoints/PrivateLink, and restrict IAM roles for agents/tools.
- **Hallucination + safety** – Pair RAG grounding with Guardrails to block unsafe content and require human review for high-risk actions.
- **AWS mapping** – Use Bedrock Guardrails, IAM least privilege, CloudTrail logging, and encrypted vector stores/S3 buckets.

---

## 14. Cost Optimization for GenAI {#section-14-cost}

- **Token drivers** – Shorten system prompts, trim few-shot examples, and cap max tokens. Every unused token is direct cost.
- **Caching** – Cache embeddings, retrieval hits, and deterministic responses to avoid re-querying the LLM.
- **Model sizing** – Start with smaller models (e.g., 13B) and scale up only if KPIs demand it. Use distillation or parameter-efficient fine-tuning for narrow tasks.
- **Batch vs real-time** – Batch summarize archives or compliance logs; reserve real-time endpoints for interactive needs. SageMaker and Bedrock both support asynchronous invocations.
- **RAG vs fine-tune vs prompt** – RAG minimizes retraining when knowledge updates frequently, fine-tuning lowers per-request tokens for repetitive tasks, and improved prompting can defer expensive training entirely.

_Exam tip: Mention “use Bedrock serverless invocation + caching” whenever the question references “spiky demand” or “cost control.”_

---

## 15. Decision Matrix {#section-15-decision-matrix}

<table class="study-table">
  <thead>
    <tr>
      <th>Approach</th>
      <th>When to Choose</th>
      <th>Exam Trigger Words</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Prompting</strong></td>
      <td>General knowledge, low customization, rapid experimentation.</td>
      <td>“No training budget,” “quick prototype.”</td>
    </tr>
    <tr>
      <td><strong>RAG</strong></td>
      <td>Fresh proprietary data, citations, large document sets.</td>
      <td>“Latest manuals,” “ground answers,” “no retraining.”</td>
    </tr>
    <tr>
      <td><strong>Fine-tuning</strong></td>
      <td>Strict formats, domain tone, curated labeled data.</td>
      <td>“Consistent summaries,” “approved style guide.”</td>
    </tr>
    <tr>
      <td><strong>Continued Pretraining</strong></td>
      <td>Missing vocabulary/jargon, massive unlabeled domain corpus.</td>
      <td>“Industry-specific terms,” “expand base knowledge.”</td>
    </tr>
    <tr>
      <td><strong>Agents</strong></td>
      <td>Multi-step reasoning, tool invocation, integrations.</td>
      <td>“Plan workflow,” “call APIs,” “take actions.”</td>
    </tr>
  </tbody>
</table>

---
