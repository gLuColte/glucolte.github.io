---
title: Models
permalink: /study/aiModels
---

# Models {#models}

Large Language Models (LLMs) differ in reasoning ability, speed, cost, context size and intended workload. There is no universally "best" model; model selection is usually a trade-off between **capability, latency and cost**.

The major general-purpose model families are currently **OpenAI GPT**, **Anthropic Claude**, **Google Gemini** and **DeepSeek**.

> Last updated: August 2026. Model names and prices change frequently.

## 1. Pricing {#section-1-pricing}

### 1.1 Consumer Plans {#section-1-1-consumer-plans}

Prices below are approximate **USD/month** for individual users.

<table class="study-table">
<thead>
<tr>
<th>Provider</th>
<th>Tier</th>
<th>USD / Month</th>
<th>What It Means</th>
<th>Usage</th>
</tr>
</thead>
<tbody>

<tr>
<td rowspan="4"><strong>ChatGPT</strong></td>
<td>Free</td>
<td>$0</td>
<td>Basic access to GPT models and tools</td>
<td>Limited GPT-5.x usage; stricter limits on files, images and data analysis</td>
</tr>

<tr>
<td>Go</td>
<td>$8</td>
<td>Low-cost paid tier</td>
<td>More usage than Free</td>
</tr>

<tr>
<td>Plus</td>
<td>$20</td>
<td>Main individual plan; advanced reasoning, files, images, Deep Research and other tools</td>
<td>Higher model and tool limits than Free; limits can vary</td>
</tr>

<tr>
<td>Pro</td>
<td>$100 / $200</td>
<td>Heavy professional usage and access to Pro models/features</td>
<td>$100 tier ≈ 5× Plus usage; $200 tier ≈ 20× Plus usage</td>
</tr>

<tr>
<td rowspan="3"><strong>Claude</strong></td>
<td>Free</td>
<td>$0</td>
<td>Basic Claude chat, coding, writing and image/text analysis</td>
<td>Limited usage that resets periodically</td>
</tr>

<tr>
<td>Pro</td>
<td>$20</td>
<td>Everyday professional use; more models, Projects and extended thinking</td>
<td>Higher usage than Free</td>
</tr>

<tr>
<td>Max</td>
<td>$100 / $200</td>
<td>Heavy Claude usage, higher output limits, Research and priority access</td>
<td>Approximately 5× or 20× Pro usage</td>
</tr>

<tr>
<td rowspan="4"><strong>Gemini</strong></td>
<td>Free</td>
<td>$0</td>
<td>Standard Gemini access</td>
<td>Standard compute allowance; 32K context</td>
</tr>

<tr>
<td>AI Plus</td>
<td>$7.99</td>
<td>Entry paid tier</td>
<td>≈ 2× Free usage; 128K context</td>
</tr>

<tr>
<td>AI Pro</td>
<td>$19.99</td>
<td>Regular power-user tier with larger context and advanced features</td>
<td>≈ 4× Free usage; 1M context</td>
</tr>

<tr>
<td>AI Ultra</td>
<td>$249.99</td>
<td>Highest access including Deep Think and premium generation features</td>
<td>Approximately 5×–20× AI Pro usage; 1M context</td>
</tr>

<tr>
<td><strong>DeepSeek</strong></td>
<td>Free</td>
<td>$0</td>
<td>Consumer web/app access to DeepSeek models</td>
<td>Service-dependent limits; API is separately usage-based</td>
</tr>
</tbody>
</table>

The tiers can broadly be interpreted as:

```text
Free
└── Try the service
    Limited model/tool usage
    Smaller context or stricter rate limits

Standard / Plus / Pro
└── Normal individual power user
    Higher limits
    Better model selection
    Advanced reasoning and tools

Max / Ultra / Pro High-Usage
└── Heavy professional user
    Much higher compute allowance
    Priority access
    Most capable / expensive modes
```

### 1.2 Usage Limits {#section-1-2-usage-limits}

Consumer AI services generally do **not** provide a fixed number of tokens each month.

Instead they use limits based on factors such as:

- Number of prompts
- Model used
- Thinking/reasoning level
- Length of the conversation
- File and image processing
- Deep Research or agent usage
- System demand

For example, Gemini uses a **compute-based allowance**. AI Plus receives roughly **2×** the standard allowance, AI Pro **4×**, and AI Ultra substantially more. Limits refresh periodically and more expensive reasoning modes consume the allowance faster.

ChatGPT similarly applies model-specific and tool-specific limits. Free users receive limited access within a time window, while Plus and Pro increase the available compute. Exact message caps may change based on capacity.

Claude follows a similar model: Pro increases usage above Free, while Max provides approximately **5× or 20×** the usage available on Pro.

> Therefore, "$20/month" should not be interpreted as unlimited model inference. Consumer subscriptions purchase a **usage allowance and feature access**, while APIs are billed directly by tokens.

Sources: [ChatGPT Free Tier](https://help.openai.com/en/articles/9275245-chatgpt-free-tier-faq), [ChatGPT Plus](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus), [Claude Pricing](https://www.anthropic.com/pricing), [Gemini Usage Limits](https://support.google.com/gemini/answer/16275805).

### 1.3 API Pricing {#section-1-3-api-pricing}

API pricing is based on how many tokens the model processes.

- **Input tokens** — everything sent into the model, including your prompt, conversation history, system instructions and retrieved documents.
- **Output tokens** — everything the model generates back as its response.
- **Cached input** — previously processed input that can be reused, usually at a lower price.

For example, if a model costs $2 / 1M input tokens and $10 / 1M output tokens, a request using 100,000 input tokens and generating 10,000 output tokens would cost:

```text
Input:  100,000 × $2 / 1M  = $0.20
Output:  10,000 × $10 / 1M = $0.10
Total = $0.30
```

In simple terms:

```text
Input  = what you give the model
Output = what the model gives you
```

Output tokens are generally more expensive because generating new tokens requires more computation than processing the input.

Typical text API price per **1 million tokens**:

<table class="study-table">
<thead>
<tr><th>Provider</th><th>Model</th><th>Input</th><th>Output</th><th>Position</th></tr>
</thead>
<tbody>
<tr><td>OpenAI</td><td><strong>GPT-5.6 Sol</strong></td><td>$5.00</td><td>$30.00</td><td>Flagship</td></tr>
<tr><td>OpenAI</td><td><strong>GPT-5.6 Terra</strong></td><td>$2.00</td><td>$12.00</td><td>Balanced</td></tr>
<tr><td>OpenAI</td><td><strong>GPT-5.6 Luna</strong></td><td>$0.20</td><td>$1.20</td><td>High-volume / cheap</td></tr>
<tr><td>Anthropic</td><td><strong>Claude Fable 5</strong></td><td>$10.00</td><td>$50.00</td><td>Maximum capability</td></tr>
<tr><td>Anthropic</td><td><strong>Claude Opus 5</strong></td><td>$5.00</td><td>$25.00</td><td>Complex work</td></tr>
<tr><td>Anthropic</td><td><strong>Claude Sonnet 5</strong></td><td>$2.00*</td><td>$10.00*</td><td>Balanced</td></tr>
<tr><td>Anthropic</td><td><strong>Claude Haiku 4.5</strong></td><td>$1.00</td><td>$5.00</td><td>Fast / cheap</td></tr>
<tr><td>DeepSeek</td><td><strong>V4 Pro</strong></td><td>$0.435</td><td>$0.87</td><td>Higher capability</td></tr>
<tr><td>DeepSeek</td><td><strong>V4 Flash</strong></td><td>$0.14</td><td>$0.28</td><td>High-volume / cheap</td></tr>
</tbody>
</table>

\* Sonnet 5 introductory pricing until 31 August 2026; standard pricing becomes $3 input / $15 output.

Google Gemini pricing varies more by model and context size; see the official pricing page rather than treating one price as representative.

Sources: [OpenAI API Pricing](https://developers.openai.com/api/docs/pricing), [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing), [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing), [DeepSeek API Pricing](https://api-docs.deepseek.com/quick_start/pricing). ([OpenAI Developers](https://developers.openai.com/api/docs/models?utm_source=chatgpt.com))

---

## 2. Purpose {#section-2-purpose}

Model families generally contain several sizes rather than one model.

<table class="study-table">
<thead>
<tr>
<th>Family</th>
<th>Tier</th>
<th>Profile</th>
<th>Key Strengths</th>
<th>Trade-off</th>
<th>Best For</th>
</tr>
</thead>
<tbody>
<tr class="family-row-gpt"><td rowspan="3"><strong>GPT-5.6</strong></td><td>Sol</td><td>Flagship</td><td>Maximum reasoning, coding and tools</td><td>Highest cost and latency</td><td>Difficult reasoning and coding</td></tr>
<tr class="family-row-gpt"><td>Terra</td><td>Balanced</td><td>Strong capability with practical speed and cost</td><td>Less capable than Sol</td><td>General-purpose work</td></tr>
<tr class="family-row-gpt"><td>Luna</td><td>Efficient</td><td>Fast and inexpensive</td><td>Lower reasoning ceiling</td><td>High-volume workloads</td></tr>
<tr class="family-row-claude"><td rowspan="4"><strong>Claude</strong></td><td>Fable</td><td>Flagship</td><td>Deep reasoning and long-horizon agents</td><td>Highest cost and slower responses</td><td>Complex research and agents</td></tr>
<tr class="family-row-claude"><td>Opus</td><td>Advanced</td><td>Complex analysis, coding and engineering</td><td>More expensive than Sonnet</td><td>Complex engineering</td></tr>
<tr class="family-row-claude"><td>Sonnet</td><td>Balanced</td><td>Strong coding and general tools</td><td>Less capable than Opus</td><td>Everyday coding</td></tr>
<tr class="family-row-claude"><td>Haiku</td><td>Efficient</td><td>Fast and economical</td><td>Lower capability ceiling</td><td>Real-time and batch tasks</td></tr>
<tr class="family-row-gemini"><td rowspan="3"><strong>Gemini</strong></td><td>Pro</td><td>Flagship</td><td>Strong reasoning, multimodal capability and long context</td><td>Higher cost and latency</td><td>Complex multimodal work</td></tr>
<tr class="family-row-gemini"><td>Flash</td><td>Balanced</td><td>Fast multimodal and agentic workloads</td><td>Less capable than Pro</td><td>General applications</td></tr>
<tr class="family-row-gemini"><td>Flash-Lite</td><td>Efficient</td><td>Very fast and low cost</td><td>Lower reasoning ceiling</td><td>Classification and extraction</td></tr>
<tr class="family-row-deepseek"><td rowspan="2"><strong>DeepSeek V4</strong></td><td>Pro</td><td>Advanced</td><td>Strong reasoning, coding and tool use</td><td>Higher cost and lower concurrency</td><td>Reasoning and coding</td></tr>
<tr class="family-row-deepseek"><td>Flash</td><td>Efficient</td><td>Fast, inexpensive, with optional thinking</td><td>Lower capability than Pro</td><td>Cost-sensitive workloads</td></tr>
</tbody>
</table>

Model tiers are usually differentiated by training quality, reasoning budget, inference compute, context limits, tool support, latency and price—not by parameter count alone. Proprietary providers generally do not publish exact parameter counts, so this page focuses on observable behavior and practical trade-offs.

The pattern is broadly:

```text
High Capability
      ↑
Flagship / Pro / Opus / Sol
      |
Balanced / Sonnet / Terra / Flash
      |
Mini / Haiku / Luna / Flash-Lite
      ↓
High Speed + Low Cost
```

Provider naming is marketing rather than a technical standard; models at similarly named tiers are not necessarily equivalent. ([Claude Platform](https://platform.claude.com/docs/en/about-claude/models/overview.md?utm_source=chatgpt.com))

---

## 3. Token Usage {#section-3-token-usage}

A **token** is a small unit of text processed by a model. English text averages roughly a few characters per token, although tokenisation varies between models and languages.

API cost is approximately:

```text
Cost =
    input_tokens × input_price
  + output_tokens × output_price
```

There are several important token types:

<table class="study-table">
<thead><tr><th>Token</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td><strong>Input</strong></td><td>Prompt, conversation history, documents and retrieved context</td></tr>
<tr><td><strong>Output</strong></td><td>Tokens generated by the model</td></tr>
<tr><td><strong>Cached input</strong></td><td>Reused prompt/context, normally significantly cheaper</td></tr>
<tr><td><strong>Thinking / reasoning</strong></td><td>Internal reasoning compute; billing treatment varies by provider</td></tr>
</tbody>
</table>

The **context window** is the maximum amount of information available to the model during one interaction.

Large context is useful for:

- Large codebases
- Long documents
- Agent history
- RAG / retrieved documents

However, a larger context window does **not** automatically mean better reasoning. Sending unnecessary context also increases latency and cost.

---

## 4. Performance {#section-4-performance}

Model capability changes quickly, so benchmarks should be treated as indicators rather than absolute rankings.

Representative current generations:

<table class="study-table">
<thead><tr><th>Provider</th><th>Generation</th><th>Release</th><th>Main Characteristic</th></tr></thead>
<tbody>
<tr><td>Anthropic</td><td><strong>Claude Fable 5</strong></td><td>Jun 2026</td><td>Highest-end Claude</td></tr>
<tr><td>Anthropic</td><td><strong>Claude Opus 5</strong></td><td>Jul 2026</td><td>Frontier coding / knowledge work</td></tr>
<tr><td>OpenAI</td><td><strong>GPT-5.6</strong></td><td>Jul 2026</td><td>Reasoning, coding and professional work</td></tr>
<tr><td>DeepSeek</td><td><strong>V4</strong></td><td>Apr–Jul 2026</td><td>Strong open-weight cost/performance</td></tr>
<tr><td>Google</td><td><strong>Gemini 3.1 Pro</strong></td><td>Feb 2026</td><td>Reasoning + multimodal + long context</td></tr>
</tbody>
</table>

OpenAI GPT-5.6 itself contains **Sol, Terra and Luna**, while Claude uses families such as **Fable, Opus, Sonnet and Haiku**. A version number therefore does not tell the full story — the model tier matters as well. ([OpenAI](https://openai.com/index/gpt-5-6/?utm_source=chatgpt.com))

One useful independent comparison is the **Artificial Analysis Intelligence Index**. As of August 2026, frontier models such as Claude Opus/Fable and GPT-5.6 occupy the upper end of its intelligence measurements, while models such as DeepSeek V4 compete particularly strongly on **cost per task**. ([Artificial Analysis](https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v4-1-1?utm_source=chatgpt.com))

Common benchmark categories include:

<table class="study-table">
<thead><tr><th>Benchmark Type</th><th>Measures</th></tr></thead>
<tbody>
<tr><td><strong>GPQA</strong></td><td>Difficult scientific reasoning</td></tr>
<tr><td><strong>Humanity's Last Exam</strong></td><td>Broad expert-level reasoning</td></tr>
<tr><td><strong>SWE / coding benchmarks</strong></td><td>Software engineering ability</td></tr>
<tr><td><strong>Terminal-Bench</strong></td><td>Agentic computer / terminal tasks</td></tr>
<tr><td><strong>MMMU</strong></td><td>Multimodal reasoning</td></tr>
<tr><td><strong>Arena / Elo</strong></td><td>Human preference between outputs</td></tr>
</tbody>
</table>

No single benchmark represents overall model quality.

---

## 5. Rule of Thumb {#section-5-rule-of-thumb}

For most applications:

<table class="study-table">
<thead><tr><th>Requirement</th><th>Start With</th></tr></thead>
<tbody>
<tr><td>Hardest reasoning</td><td>GPT-5.6 Sol / Claude Opus or Fable</td></tr>
<tr><td>Coding / agents</td><td>GPT-5.6 Sol / Claude Opus or Sonnet</td></tr>
<tr><td>General everyday work</td><td>GPT-5.6 Terra / Claude Sonnet / Gemini Flash</td></tr>
<tr><td>Very large context / multimodal</td><td>Gemini</td></tr>
<tr><td>Cheapest API workloads</td><td>DeepSeek V4 Flash / GPT-5.6 Luna</td></tr>
<tr><td>High-volume simple tasks</td><td>Luna / Haiku / Flash-Lite</td></tr>
<tr><td>Self-hosting / open weights</td><td>DeepSeek and other open-weight families</td></tr>
</tbody>
</table>

A useful selection rule is:

```text
1. Choose the cheapest model that reliably completes the task.
2. Increase model capability when quality becomes insufficient.
3. Use reasoning effort only when the task actually needs reasoning.
4. Minimise unnecessary context.
5. Measure models against your own workload, not only public benchmarks.
```

For current comparisons, the most useful references are:

- [Artificial Analysis](https://artificialanalysis.ai/) — intelligence, speed, latency and API cost
- [OpenAI Models](https://developers.openai.com/api/docs/models) — official GPT model catalogue
- [Anthropic Models](https://platform.claude.com/docs/en/about-claude/models/overview) — official Claude model catalogue
- [Google Gemini Models](https://ai.google.dev/gemini-api/docs/models) — official Gemini catalogue
- [DeepSeek API](https://api-docs.deepseek.com/) — official DeepSeek models and pricing
