---
title: Model Guidelines
permalink: /study/aiModelGuidelines
tag:
  - model providers
  - model selection
  - reasoning effort
  - subscription plans
  - token pricing
---

# Model Guidelines

**Last verified: 24 September 2026.** Prices are **USD**. Check the model picker and usage dashboard before a long session; access varies by account, client and rollout. For model theory and hosting, see [AI Models and Providers](/study/aiModels).

## 1. OpenAI / Codex Workload Guide

<div class="provider-table-scroll" markdown="1">

| Workload | Input | Expected output | Suggested model | Effort |
|---|---|---|---|---|
| Document reading | Documents / PDFs | Find, summarize, explain, compare | **GPT-6 Sol** | Medium |
| Document deep analysis | Documents / PDFs | Infer, investigate, resolve contradictions | **GPT-6 Sol** | High |
| Document + web | Documents + current sites | Verify, cross-reference, synthesize | **GPT-6 Sol** | Medium |
| Document + web deep analysis | Documents + web | Investigate complex/conflicting evidence | **GPT-6 Sol** | High |
| Document writing | Notes / sources / draft | Draft, rewrite, polish, structure | **GPT-6 Sol** | Medium |
| Analytical writing | Sources + ambiguous problem | Determine approach, analyze, write | **GPT-6 Sol** | High |
| Code analysis · ~100K LOC | Local repository | Locate code, architecture, flows | **GPT-6 Sol** | Medium |
| Code analysis · ~500K LOC | Local repository | Cross-module architecture/dependencies | **GPT-6 Sol** | Medium–High |
| Code analysis · ~1M+ LOC | Local repository | System-level and cross-module understanding | **GPT-6 Sol** | High |
| Development · ~100K LOC | Repository + requirement | Implement, test, validate | **GPT-6 Sol** | Medium–High |
| Development · ~500K LOC | Repository + requirement | Multi-module change, test, debug | **GPT-6 Sol** | High |
| Development · ~1M+ LOC | Repository + complex task | Investigate, design, implement, validate | **GPT-6 Sol** | High |
| Hard agentic development | Large repo + ambiguous problem | Autonomous investigation → design → implementation → validation | **GPT-6 Astra** | High; Max when justified |

</div>

> **Medium = execute a reasonably clear task. High = determine what the answer or solution should be, then execute it.** Repository size increases navigation work but does not by itself justify the most expensive model. For code: repository → search/index → relevant files → dependencies → context → reason → act. [OpenAI model guidance](https://learn.chatgpt.com/docs/models).

## 2. Claude Workload Guide

<div class="provider-table-scroll" markdown="1">

| Workload | Input | Expected output | Suggested model | Effort |
|---|---|---|---|---|
| Document reading | Documents / PDFs | Find, summarize, explain, compare | **Claude Sonnet 5** | Medium |
| Document deep analysis | Documents / PDFs | Infer, investigate, resolve contradictions | **Claude Sonnet 5** | High |
| Document + web | Documents + current sites | Verify, cross-reference, synthesize | **Claude Sonnet 5** | Medium |
| Document + web deep analysis | Documents + web | Investigate complex/conflicting evidence | **Claude Sonnet 5** | High |
| Document writing | Notes / sources / draft | Draft, rewrite, polish, structure | **Claude Sonnet 5** | Medium |
| Analytical writing | Sources + ambiguous problem | Determine approach, analyze, write | **Claude Sonnet 5** | High |
| Code analysis · ~100K LOC | Local repository | Locate code, architecture, flows | **Claude Sonnet 5** | Medium |
| Code analysis · ~500K LOC | Local repository | Cross-module architecture/dependencies | **Claude Sonnet 5** | Medium–High |
| Code analysis · ~1M+ LOC | Local repository | System-level and cross-module understanding | **Claude Sonnet 5** | High |
| Development · ~100K LOC | Repository + requirement | Implement, test, validate | **Claude Sonnet 5** | Medium–High |
| Development · ~500K LOC | Repository + requirement | Multi-module change, test, debug | **Claude Sonnet 5** | High |
| Development · ~1M+ LOC | Repository + complex task | Investigate, design, implement, validate | **Claude Opus 5.5** | Medium; High for difficult dependencies |
| Hard agentic development | Large repo + ambiguous problem | Autonomous investigation → design → implementation → validation | **Claude Opus 5.5** | Medium → High |
| Frontier escalation | Long-horizon task that Opus 5.5 at higher effort could not solve | Reinvestigate, resolve, validate | **Claude Fable 5.1** | High default; tune to task |

</div>

Claude's adaptive thinking and model-specific effort controls are not identical to OpenAI's. Sonnet 5, Opus 5.5 and Fable 5.1 support effort; Haiku 4.5 does not use the same control. Use the setting your Claude client exposes. These model choices are personal cost-conscious defaults, not a provider equivalence claim. [Claude model lineup](https://platform.claude.com/docs/en/models/overview) · [Claude effort](https://platform.claude.com/docs/en/build-with-claude/effort) · [Anthropic cost guidance](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence).

> **Optional delegation prompt:** “If this task has substantial independent tracks, delegate repository search, dependency mapping or test triage to bounded subagents. Use GPT-6 Luna for simple Codex scans, GPT-6 Sol Medium for harder Codex analysis, or Claude Sonnet 5 Medium for Claude workers. Have the lead agent integrate and verify their findings. Keep a single dependent change with one agent.” Subagents add token usage; use them when parallel work or isolated context helps. [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) · [Anthropic delegation guidance](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence).

## 3. Models & Pricing

**First-party Standard API text prices per 1M tokens, USD.** Cached means a prompt-cache **read**. Output includes billed reasoning/thinking tokens. Relative cost compares uncached input and output rates with GPT-6 Sol = 1×; it does not compare quality, tokenizers or subscriptions. [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) · [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing).

<div class="provider-table-scroll" markdown="1">

| Provider | Model / API ID | Input | Cached input | Output | Reasoning / effort | Relative cost |
|---|---|---:|---:|---:|---|---:|
| OpenAI | GPT-6 Luna `gpt-6-luna` | $0.10 | $0.01 | $0.50 | none–max; focused work | 0.05× |
| OpenAI | GPT-6 Sol `gpt-6-sol` | $2 | $0.20 | $10 | none–max; general work | 1× |
| OpenAI | GPT-6 Astra `gpt-6-astra` | $10 | $1 | $50 | low–max; hardest work | 5× |
| Claude | Haiku 4.5 `claude-haiku-4-5` | $1 | $0.10 | $5 | No effort control; fast work | 0.5× |
| Claude | Sonnet 5 `claude-sonnet-5` | $2 | $0.20 | $10 | Adaptive; general work | 1× |
| Claude | Opus 5.5 `claude-opus-5-5` | $4 | $0.20 | $20 | Adaptive; Medium default | 2×* |
| Claude | Fable 5.1 `claude-fable-5-1` | $10 | $0.25 | $50 | Adaptive; frontier work | 5×* |

</div>

*Cached-read ratios differ. Cache **writes** cost extra: GPT-6 and Claude 5-minute writes are 1.25× input; Claude 1-hour writes are 2× input. OpenAI GPT-6 prompts over 272K input tokens have higher rates for the whole request. Anthropic says its newer tokenizer can produce about 30% more tokens for the same text, depending on content. Tools, web search, regional processing and speed tiers may add cost. [OpenAI pricing](https://developers.openai.com/api/docs/pricing) · [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing).

## 4. Plans & Usage

<div class="provider-table-scroll" markdown="1">

| Provider | Plan | Price / month | Model access | Usage allowance | Coding / agent usage |
|---|---|---:|---|---|---|
| OpenAI | Plus | $20 | GPT-6 Sol/Luna in Work/Codex; Astra access varies by rollout/client | Variable five-hour usage; Sol **15–150** estimated local messages | A few focused sessions/week; optional ChatGPT credits |
| OpenAI | Pro 5x | $100 | Plus models and Pro features | ~5× Plus; Sol **70–700** estimated local messages/five hours | Frequent sessions; optional credits |
| OpenAI | Pro 20x | $200 | Pro features; **new sign-ups/upgrades paused** as of 10 Sep 2026 | ~20× Plus; Sol **300–3,000** estimated local messages/five hours | Existing heavy-use subscribers |
| Claude | Pro | $20 | Current models; **Fable 5.1 requires paid usage credits** | Variable five-hour and weekly limits | Claude Code shares allowance with Claude |
| Claude | Max 5x | $100 | Current models; Fable included within a 50% weekly cap | 5× Pro per-session usage; weekly cap | Frequent Claude Code / research |
| Claude | Max 20x | $200 | Same model access as Max 5x | 20× Pro per-session usage; weekly cap | Daily intensive Claude Code |

</div>

**Billing boundary:** ChatGPT Work and Codex share included usage; extra **ChatGPT credits** have a separate token rate card. API-key use is separately billed in **API dollars**. Claude chat and Claude Code share plan limits; optional **usage credits** after the limit use standard API rates. An `ANTHROPIC_API_KEY` in Claude Code can switch the session to API billing. These systems have no trustworthy plan-to-token conversion. Check live usage before upgrading. [OpenAI plans, limits and credit rates](https://learn.chatgpt.com/docs/pricing) · [OpenAI Pro $200 pause](https://help.openai.com/en/articles/7242622-why-did-my-chatgpt-plus-or-chatgpt-pro-renewal-transaction-fail) · [Claude Pro](https://support.claude.com/en/articles/8325606-what-is-the-pro-plan) · [Claude Max](https://support.claude.com/en/articles/11049741-what-is-the-max-plan) · [Fable plan rules](https://support.claude.com/en/articles/15424964-claude-fable-models-on-your-plan) · [Claude Code billing](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan).
