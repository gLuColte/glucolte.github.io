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

**Which AI model and reasoning effort should I use for this task?**

**Last verified: 5 October 2026.** Prices are **USD**. Model access varies by account, client and rollout. For model theory and hosting, see [AI Models and Providers](/study/aiModels).

## 1. How to Choose

> **Start with the cheapest model and reasoning effort likely to solve the task. Escalate based on uncertainty and reasoning difficulty, not repository size alone.**

**Scope × uncertainty → reasoning effort → model tier.** Ask how much *relevant* context the model must understand and whether the solution path is known. Then choose:

<div class="provider-table-scroll model-choice-table" markdown="1">

| If the task is… | Start with… |
|---|---|
| Cheap, bounded and obvious | **Luna · Medium** / **Haiku 4.5 · default** |
| Normal serious engineering | **GPT-6.1 Sol / Sonnet 5.5** · Medium |
| Difficult investigation, architecture or debugging | **GPT-6.1 Sol / Opus 5.5** · High |
| Exceptional ambiguity, cross-system complexity or long autonomous work; or High has fallen short | **Astra / Fable 5.1** · High, then tune |

</div>

- **Medium:** The task and likely path are reasonably clear. Execute and verify.
- **High:** Investigate, compare alternatives or determine the solution before executing.
- **Frontier / strongest model:** Use for exceptional ambiguity, cross-system complexity, long autonomous work or insufficient results at High.

Model tier and effort are separate choices: **GPT-6.1 Sol High** means Sol with High effort; **Frontier** names a model tier. Haiku 4.5 has no effort control, and effort levels are not equivalent across providers.

## 2. Rule of Thumb: Scope × Uncertainty

> **Known scope + known path → Medium.**
>
> **Unknown scope OR unknown path → High.**
>
> **Unknown scope + unknown path + cross-system complexity → consider Frontier.**

The file and LOC bands below are **rough rules of thumb, not empirical limits**. “Relevant LOC” means code the model must inspect or change to solve the task, including dependencies it needs to trace. File counts and LOC are approximate signals of connected context, not a conversion to prompt tokens. Routine search to locate a known feature can stay at Medium; **unknown scope** means the model must discover which components or interactions explain the problem.

<div class="provider-table-scroll" markdown="1">

| Approximate relevant scope | Clear path | Some investigation | Unknown solution |
|---|---|---|---|
| 1–5 files / under 5k relevant LOC | Medium | Medium | High |
| 5–20 files / about 5k–30k LOC | Medium | High | High |
| 20–50 files / about 30k–100k LOC | High | High | High |
| 50+ files / 100k+ relevant LOC | High | High | High; consider Frontier if cross-system |

</div>

A 2-million-line monorepo with a clear feature touching four known files may need only **Medium**. A 40k-line service with an intermittent duplicate-order bug should start at **High** if the cause could be API logic, queues, workers, retries, concurrency or the database. Repository size affects navigation; it does not automatically require a frontier model. For code, search and index first, then inspect the relevant files, dependencies and tests.

The mnemonic is a starting default. **Substantial integration work can justify High even with a known path**, which is why the larger scope bands suggest it. Repetitive, tightly specified edits across many files can still use Medium.

**What to count for other work**

LOC means **lines of code**. For documents and research, estimate the relevant material and the connections the model must understand:

<div class="provider-table-scroll" markdown="1">

| Material | Useful measure of scope | What raises reasoning effort? |
|---|---|---|
| Code | Relevant files, LOC, modules and dependencies | Discovering causes; tracing interactions across modules |
| Documents / PDFs | Relevant pages or sections; words for text volume | Dense concepts, tables, equations or conflicting passages |
| Research / web | Sources and claims that must be checked | Reconciling conflicting evidence; deciding what conclusion is justified |
| Ontology / domain model | Concepts, relationships, constraints and exceptions | Designing the relationships or resolving inconsistent definitions |

</div>

**Count volume; judge connections and uncertainty.** A file is only a container: one PDF can hold hundreds of pages. Document lines vary with formatting, so pages, sections or words are more useful rough measures. Tokens help estimate model context and API cost, but do not measure reasoning difficulty. The code bands above do not translate into document-page limits. [Token counting, including PDFs](https://platform.claude.com/docs/en/build-with-claude/token-counting).

Summarizing a known chapter in a 300-page manual can use **Medium**. Explaining conflicting results in a five-page paper can need **High**. Mapping terms into an established ontology can use Medium; deciding its concepts, relationships and exceptions should start at High. These examples are task heuristics, not validated thresholds.

## 3. Model & Effort Mapping

**Pick the nearest scenario.** Below, **Sol = GPT-6.1 Sol**, **Sonnet = Sonnet 5.5**, **Opus = Opus 5.5**; Haiku is 4.5 and Fable is 5.1. Model pairs are OpenAI / Anthropic starting choices.

<div class="provider-table-scroll" markdown="1">

| Workload | Input | Expected output | Suggested model | Effort |
|---|---|---|---|---|
| Routine extraction / small edit | Specified fields or known files | Extract, classify, apply an obvious change | Luna / Haiku | Medium / default |
| Document / PDF reading | Selected pages or sections | Find, summarize, explain, compare | Sol / Sonnet | Medium |
| Document deep analysis | Dense papers or documents | Infer, trace arguments, resolve contradictions | Sol / Sonnet | High |
| Document + web | Documents + current sources | Verify, cross-reference, synthesize | Sol / Sonnet | Medium |
| Investigative research | Open question + incomplete or conflicting sources | Determine what evidence supports; resolve competing explanations | Sol / Opus | High |
| Document writing | Notes, sources or draft | Draft, rewrite, polish, structure | Sol / Sonnet | Medium |
| Analytical writing | Evidence + ambiguous question | Determine the argument, analyze, write | Sol / Sonnet | High |
| Code analysis: known scope | Relevant files + specific question | Locate code, explain architecture or flows | Sol / Sonnet | Medium |
| Code investigation | Unfamiliar modules or unknown bug source | Discover scope, trace dependencies, diagnose | Sol / Opus | High |
| Development: clear path | Known files + defined requirement | Implement, test, validate | Sol / Sonnet | Medium |
| Architecture / ontology / complex change | Connected modules, concepts or systems | Compare designs, define relationships, implement and validate | Sol / Opus | High |
| Exceptional autonomous work | Substantial ambiguity across systems; lower tiers fall short | Investigate → design → execute → validate over many steps | Astra / Fable | High; tune upward if justified |

</div>

These are **cost-conscious rules of thumb**, not provider equivalence claims. Start at the listed setting, then adjust for relevant scope and uncertainty. Simple extraction can use the routine row; difficult document analysis can move from Sonnet High to Opus High. A large repository or long PDF alone does not require Frontier.

**Escalate when the reasoning falls short:** raise Medium to High on the same model when it misses dependencies or cannot choose a sound approach. Consider a stronger tier if High still fails, or start there for an exceptional task. Missing requirements, inaccessible files and broken tools need to be resolved directly; extra reasoning alone will not supply them.

## 4. Provider-Specific Reference

### OpenAI / Codex

<div class="provider-table-scroll" markdown="1">

| Tier | Model / API ID | Best starting point | Effort notes |
|---|---|---|---|
| Efficient | GPT-6 Luna `gpt-6-luna` | Focused, high-volume, well-bounded work | Medium default; `none`, low, high, xhigh and max also supported |
| General | GPT-6.1 Sol `gpt-6.1-sol` | Serious engineering and professional work | Medium default; supports low, medium, high, xhigh and max |
| Strongest | GPT-6 Astra `gpt-6-astra` | Most demanding reasoning, coding and long workflows | Low through max; start at High for exceptional work |

</div>

GPT-6.1 Sol replaces the older GPT-6 Sol recommendation here. OpenAI lists Luna for cost-sensitive work, Sol for a balance of intelligence and cost, and Astra for the most demanding work. These API models are current; app availability and exposed effort settings depend on the client and account. [OpenAI models](https://developers.openai.com/api/docs/models) · [GPT-6.1 Sol and effort](https://developers.openai.com/api/docs/models/gpt-6.1-sol) · [Work / Codex availability](https://learn.chatgpt.com/docs/models).

### Anthropic / Claude

<div class="provider-table-scroll" markdown="1">

| Tier | Model / API ID | Best starting point | Effort notes |
|---|---|---|---|
| Efficient | Claude Haiku 4.5 `claude-haiku-4-5` | Fast, bounded work | No API effort control |
| General | Claude Sonnet 5.5 `claude-sonnet-5-5` | Well-specified coding and synthesis | API default High; set Medium explicitly for clear agentic work |
| Difficult | Claude Opus 5.5 `claude-opus-5-5` | Investigation, architecture and long-running engineering | API default Medium; raise to High when needed |
| Strongest | Claude Fable 5.1 `claude-fable-5-1` | Demanding reasoning and long-horizon agentic work | API default High; tune against results |

</div>

Anthropic recommends Opus 5.5 for most workloads; this guide uses Sonnet 5.5 Medium as a cost-conscious starting point for well-specified engineering. Sonnet's API default is High, so set Medium explicitly where the client allows. Sonnet, Opus and Fable support low, medium, high, xhigh and max; Haiku uses different thinking controls. [Claude models and IDs](https://platform.claude.com/docs/en/models/overview) · [Claude effort](https://platform.claude.com/docs/en/build-with-claude/effort) · [Anthropic cost and intelligence guidance](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence).

> **Optional delegation:** For substantial independent tracks, delegate bounded repository search, dependency mapping or test triage to smaller models; have the lead agent integrate and verify findings. Keep one dependent change with one agent. Subagents add token usage. [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) · [Anthropic guidance](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence).

## 5. Pricing

**First-party Standard API text prices per 1 million tokens, USD.** OpenAI rates assume **up to 272K input tokens**. Claude base rates cover the full supported context window: 200K for Haiku 4.5, 1M for Sonnet 5.5, Opus 5.5 and Fable 5.1. Input is uncached; cached input is a cache **read**; output includes billed reasoning or thinking tokens. [OpenAI pricing](https://developers.openai.com/api/docs/pricing) · [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) · [Claude context windows](https://platform.claude.com/docs/en/models/overview).

<div class="provider-table-scroll" markdown="1">

| Provider | Model / API ID | Input | Cached input | Cache write* | Output | Relative rates |
|---|---|---:|---:|---:|---:|---:|
| OpenAI | GPT-6 Luna `gpt-6-luna` | $0.10 | $0.01 | $0.125 | $0.50 | 0.05× |
| OpenAI | GPT-6.1 Sol `gpt-6.1-sol` | $2 | $0.10 | $2.50 | $10 | 1× |
| OpenAI | GPT-6 Astra `gpt-6-astra` | $10 | $1 | $12.50 | $50 | 5× |
| Claude | Haiku 4.5 `claude-haiku-4-5` | $1 | $0.10 | $1.25 | $5 | 0.5× |
| Claude | Sonnet 5.5 `claude-sonnet-5-5` | $2 | $0.20 | $2.50 | $10 | 1× |
| Claude | Opus 5.5 `claude-opus-5-5` | $4 | $0.20 | $5 | $20 | 2× |
| Claude | Fable 5.1 `claude-fable-5-1` | $10 | $0.25 | $12.50 | $50 | 5× |

</div>

*Cache-write rates above use OpenAI's **30-minute** cache lifetime and Claude's **5-minute** cache. Claude 1-hour writes cost 2× base input. [OpenAI caching](https://developers.openai.com/api/docs/guides/prompt-caching) · [Claude caching prices](https://platform.claude.com/docs/en/about-claude/pricing#prompt-caching).

- **Long context:** OpenAI requests over 272K input tokens cost 2× input/cache rates and 1.5× output for the **whole request**. The listed Claude models have no long-context premium within their supported window.
- **Other processing:** Batch is discounted; OpenAI Flex is also discounted. Fast/Ultrafast, regional processing and server tools can change the bill. The table assumes Standard processing and excludes tool fees.
- **Relative rates:** Uncached input and output rates compared with GPT-6.1 Sol = 1×. Actual cost depends on cache use, token counts, effort and retries. Newer Claude models can tokenize the same text into about 30% more tokens than Haiku 4.5 or Sonnet 4.6, depending on content.

Compare measured **cost per solved task**. [OpenAI pricing tiers](https://developers.openai.com/api/docs/pricing) · [Claude pricing details](https://platform.claude.com/docs/en/about-claude/pricing).

## 6. Plans & Usage

**Choose the model first; choose a plan from your actual usage.** Start with Plus / Pro for regular work; consider a higher plan when you repeatedly hit included limits. Check the model picker and live usage dashboard before upgrading. Prices below are US monthly list prices; regional pricing, taxes and annual discounts can differ.

<div class="provider-table-scroll" markdown="1">

| Provider | Plan | Price / month | Access and usage guide |
|---|---|---:|---|
| OpenAI | Plus | $20 | GPT-6.1 Sol, Luna and available Astra access in Work/Codex; suited to a few focused sessions weekly; variable included limits and optional credits |
| OpenAI | Pro 100 | $100 | More included usage than Plus for frequent work; optional credits |
| OpenAI | Pro 200 | $200 | More included usage than Pro 100; new subscriptions available; some accounts temporarily retain a grandfathered allowance |
| OpenAI | Pro 500 | $500 | Highest Pro included usage; Astra Ultrafast access |
| Claude | Pro | $20 | Claude Code shares the plan allowance; Fable 5.1 uses paid usage credits from the start |
| Claude | Max 5x | $100 | 5× Pro per-session allowance, plus a weekly cap; Fable can use up to 50% of the shared weekly allowance |
| Claude | Max 20x | $200 | 20× Pro per-session allowance, plus a weekly cap; same Fable allocation rule |

</div>

**Usage and billing:**

- **OpenAI:** Work and Codex share included usage. Purchased ChatGPT credits have a separate rate card; API-key usage is billed separately in API dollars. Plus has variable five-hour usage and may have weekly limits. Pro currently has no five-hour limit, but other allowances apply.
- **Claude:** Chat and Claude Code share plan limits, with five-hour session resets and weekly limits. Optional usage credits use standard API rates. An `ANTHROPIC_API_KEY` in Claude Code can switch a session to API billing. Fable's Max allocation is part of the shared weekly allowance; credits are needed after that allocation is exhausted.
- **Planning:** Published message ranges are illustrative, not fixed limits. Context, reasoning, tools, speed mode and caching affect usage; there is no reliable plan-to-token conversion.

[OpenAI plans and usage](https://learn.chatgpt.com/docs/pricing) · [OpenAI Pro tiers](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers) · [Claude plans](https://support.claude.com/en/articles/11049762-choose-a-claude-plan) · [Claude Max limits](https://support.claude.com/en/articles/11049741-what-is-the-max-plan) · [Fable plan rules](https://support.claude.com/en/articles/15424964-claude-fable-models-on-your-plan) · [Claude Code billing](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan).
