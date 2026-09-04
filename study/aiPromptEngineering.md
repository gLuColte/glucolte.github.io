---
title: AI Prompt Engineering
permalink: /study/aiPromptEngineering
---

# AI Prompt Engineering

Prompt engineering is how an application turns a user need into clear model input. It happens **before** the LLM request is tokenized. For what happens after text enters the model, see [AI Fundamentals](/study/aiFundamentals).

**Part 2 of 7:** [Fundamentals](/study/aiFundamentals) → **Prompt engineering** → [Models](/study/aiModels). This page owns the request's input contract; retrieval, agent execution, and production controls are covered later in the sequence.

It is not about finding “magic words.” It is about clearly communicating the task, context, constraints, and expected output to the model.

This page builds one customer-support prompt from a vague request into a reusable input contract. The same approach applies to summarising, extracting, drafting, and many other LLM tasks.

## 1. Big picture: from task to better prompt

<div class="prompt-diagram prompt-flow" role="img" aria-label="Prompt-engineering workflow from real-world task through evaluation and refinement">
  <div class="prompt-node"><strong>Real-world task</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Define the task</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Provide relevant context</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Set instructions / boundaries</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Add examples if needed</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Define output contract</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node prompt-node--accent"><strong>Send to model</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Evaluate result</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node prompt-node--success"><strong>Refine if necessary</strong></div>
</div>

Start with the simplest clear prompt that can solve the task. Evaluate real outputs, then add only the missing piece: examples for consistency, constraints for boundaries, a reasoning technique for genuinely multi-step work, or a template for repeated use.

## 2. Build one prompt together

Our task is to classify this ticket:

```text
My account was charged twice and I cannot log in.
```

### 2.1 Start naive

```text
Classify this ticket:
"My account was charged twice and I cannot log in."
```

This leaves too much unspecified: what does “classify” mean, which labels are valid, and what should the result look like?

### 2.2 Define the task and allowed outputs

```text
Classify the customer-support ticket.

Allowed categories:
- Urgent
- General Inquiry
- Feedback
```

Giving a closed label set makes the task testable and reduces format drift.

### 2.3 Add context, boundaries, and separate the data

```text
Classify the customer-support ticket into one allowed category:
Urgent, General Inquiry, or Feedback.

Use only information contained in the ticket.
Do not invent missing information.

<ticket>
My account was charged twice and I cannot log in.
</ticket>
```

Clear delimiters keep the ticket as **data**, rather than letting it silently blend into the instructions. In an application, user input and retrieved text should not be trusted as instructions.

### 2.4 Define the output contract

```text
Return valid JSON only:
{
  "category": "Urgent | General Inquiry | Feedback",
  "reason": "brief explanation grounded in the ticket"
}
```

Together, the reusable prompt is:

```text
You classify customer-support tickets.

Task:
Classify the ticket into exactly one allowed category.

Allowed categories:
- Urgent
- General Inquiry
- Feedback

Rules:
- Use only information in the ticket.
- Do not invent missing information.

Current ticket:
<ticket>
My account was charged twice and I cannot log in.
</ticket>

Output contract:
Return valid JSON only:
{
  "category": "Urgent | General Inquiry | Feedback",
  "reason": "brief explanation grounded in the ticket"
}
```

The likely category is `Urgent`, but the important lesson is the construction process. The prompt states what to do, what information is available, the boundaries, and how success must be expressed.

## 3. Prompt anatomy: the reusable input contract

A useful prompt usually includes only the components the model needs:

<div class="prompt-diagram prompt-flow prompt-anatomy" role="img" aria-label="Prompt anatomy showing role, task, context, examples, current input, and output contract before the language model">
  <div class="prompt-node"><strong>Role / system context</strong>You classify customer-support tickets.</div>
  <div class="prompt-node"><strong>Task</strong>Classify into one allowed category.</div>
  <div class="prompt-node"><strong>Context / rules</strong>Definitions, source material, and boundaries.</div>
  <div class="prompt-node"><strong>Examples — optional</strong>Input → expected output.</div>
  <div class="prompt-node prompt-node--data"><strong>Current input</strong><code>&lt;ticket&gt;...&lt;/ticket&gt;</code></div>
  <div class="prompt-node"><strong>Output contract</strong><code>{"category": "...", "reason": "..."}</code></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node prompt-node--accent"><strong>LLM</strong></div>
</div>

- Put the task and success criteria in plain language.
- Include relevant context or source text, not every piece of available information.
- Separate instructions, reference material, and user data with headings or delimiters.
- State the output shape: for example, a one-sentence answer, a table, or a schema.

Not every prompt needs every box. A short, clear zero-shot instruction is often best; add components only when the result needs them.

### 3.1 Roles and context management

- **System/developer instructions**: application-owned behaviour, policy, task framing, and output contract.
- **User message**: the caller's request and supplied data.
- **Retrieved documents, history, and tool results**: useful context, but still potentially untrusted content—not higher-priority instructions.
- Select only context that changes the answer. Keep the newest, most relevant, permitted evidence; summarize or remove stale history; reserve room for the output.

> A useful prompt is a **controlled context budget**, not a dump of every conversation message and document. Context-window mechanics are covered in [AI Fundamentals](/study/aiFundamentals#section-9-context-window).

## 4. Add examples only when clear instructions are not enough {#shots}

A **shot** is an input → desired-output example inside the prompt. Examples demonstrate a pattern; they do not retrain the model or update its weights.

| Technique | What the prompt contains | Best use |
|---|---|---|
| **Zero-shot** | Instructions only; no examples | A clear, familiar task where the format is simple. |
| **One-shot** | One example | A small formatting or classification cue. |
| **Few-shot** | Several representative examples | A task with a specific label set, tone, structure, or edge cases. |

### Zero-shot: start here

```text
Classify this support ticket as Urgent, General Inquiry, or Feedback.

Ticket: "My account was charged twice and I cannot log in."
Answer:
```

### One-shot: show one pattern

```text
Classify each support ticket as Urgent, General Inquiry, or Feedback.

Ticket: "How do I change my email address?" → General Inquiry

Ticket: "My account was charged twice and I cannot log in." →
```

### Few-shot: cover meaningful differences

```text
Classify each ticket as Urgent, General Inquiry, or Feedback.

Ticket: "The checkout page is unavailable." → Urgent
Ticket: "How do I change my email address?" → General Inquiry
Ticket: "The new dashboard is much easier to use." → Feedback

Ticket: "My account was charged twice and I cannot log in." →
```

- Start zero-shot; add examples only when the output is inconsistent.
- Use examples that cover meaningful differences, not near-duplicates.
- Few-shot examples consume context tokens, add cost, and can anchor the model to a poor pattern.
- For an obscure or changing technical framework, a few official code examples can ground format and syntax. Use retrieved/current official documentation and validation when factual freshness matters; examples alone do not make a model current.

## 5. Improve boundaries and output reliability {#negative-prompting}

Explicit constraints tell the model what to avoid. Pair them with a safe fallback, so the model knows what to do instead.

```text
Use only the supplied product documentation.
Do not invent product features, prices, or citations.
If the documentation does not answer the question, say: "I don't have enough information."
```

For the ticket prompt, `Use only information in the ticket` and `Do not invent missing information` are the same idea. The output contract is another constraint: it specifies a shape the application can parse.

When an application needs machine-readable output, request a schema or use a provider's structured-output feature. Valid syntax does not guarantee factual, safe, or authorized content.

## 6. Use reasoning techniques only for multi-step work {#chain-of-thought}

**Chain-of-thought (CoT) prompting** asks a model to break a multi-step problem into intermediate reasoning steps before answering. It is most useful for maths, constraint checking, and multi-step logic—not simple extraction or ticket classification.

```text
Work through the calculation step by step. Check the result.
Then return only:
Answer: <number>

Question: A customer has $100, spends $20 and $40, then receives a $35 refund.
How much remains?
```

Two related forms:

- **Zero-shot CoT**: add a reasoning instruction such as “work step by step,” with no examples.
- **Few-shot CoT**: provide examples that show both the intermediate approach and the final answer format.

CoT can improve difficult reasoning, but it increases latency and output-token cost. Do not treat a plausible written rationale as proof: validate calculations, policy decisions, and high-impact outputs with deterministic checks or authoritative tools. Some reasoning models use internal reasoning that is not fully returned to the user.

## 7. Turn a working prompt into a template {#templates}

A **prompt template** keeps a repeatable structure while replacing variables at runtime:

```text
Task:
Summarize the customer message in one sentence.

Rules:
- Preserve product names and error codes.
- Do not infer facts that are not present.

Customer message:
<message>
{{customer_message}}
</message>

Output:
Summary:
```

- Keep templates versioned and test them against representative examples.
- Delimit supplied data clearly; do not let it silently merge with instructions.
- Record the prompt version, model, inference parameters, and evaluation set so a changed result can be investigated.

## 8. Choose the simplest technique that fits

```text
Start with a clear instruction
          ↓
Does it work reliably?
     YES → stop
     NO
          ↓
Need examples?             → One-shot / few-shot
Need stronger boundaries?  → Explicit constraints and a fallback
Need structured reasoning? → Appropriate reasoning technique
Repeated production task?  → Versioned prompt template
```

The progression is a decision process, not a requirement to use every technique:

```text
Clear instruction → zero-shot → one-shot → few-shot → additional constraints / reasoning
```

| Need | Start with | Escalate when needed |
|---|---|---|
| Clear task and simple format | Zero-shot | Add an output example. |
| Exact labels, tone, or layout | One-shot or few-shot | Improve representative examples. |
| Multi-step calculation or logic | Zero-shot CoT | Few-shot CoT or deterministic verification. |
| Avoid a type of claim or content | Negative prompting plus a fallback | Guardrails and application validation. |
| Repeated production use | Versioned template and evaluation set | Prompt management and controlled rollout. |

## 9. Prompt engineering has clear limits

Prompt engineering guides model behaviour; it is not itself a security boundary.

```text
Prompt engineering
CAN:
✓ Explain the task
✓ Provide context
✓ Set behavioural constraints
✓ Provide examples
✓ Define output format
✓ Improve consistency

DOES NOT GUARANTEE:
✗ Authorization
✗ Factual correctness
✗ Deterministic output
✗ Protection against every jailbreak
✗ Application-level security
```

Use guardrails, access control, input validation, and output/tool validation where those properties matter. This page focuses only on designing the prompt itself.

## 10. Practical checklist

- Is the task specific, complete, and unambiguous?
- Is relevant context clearly delimited and kept separate from instructions?
- Is the desired output shape explicit?
- Are few-shot examples representative and worth their token cost?
- Is reasoning really needed, and are important results independently verified?
- Does a negative instruction have a useful fallback?
- Have you evaluated the prompt on representative inputs and recorded the prompt version, model, inference parameters, and evaluation set?

## 11. Security boundary

Treat user input, retrieved documents, and tool results as untrusted data. Delimiters and clear instructions help the model interpret that data, but they do **not** enforce security. Prompt injection, jailbreaks, authorization, and tool controls belong to the production security boundary in [AI Infrastructure and Evaluation](/study/aiInfrastructure#section-6-security).

## 12. Prompt engineering vs inference parameters

Prompt engineering changes **what we tell the model**. Inference parameters change **how its generation/decoding behaves**.

<div class="prompt-diagram prompt-flow" role="img" aria-label="Application builds prompt engineering inputs, then sends a request containing inference parameters to a foundation model">
  <div class="prompt-node"><strong>Application</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node prompt-node--accent"><strong>Prompt engineering</strong>Role · task · context · instructions · examples · constraints · output format</div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Model request</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node prompt-node--data"><strong>Inference parameters</strong>Temperature · top-p · top-k (where supported) · maximum output tokens</div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Foundation model</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node prompt-node--success"><strong>Response</strong></div>
</div>

For example:

```text
"Respond creatively and give several ideas."
        → Prompt instruction

temperature = 0.9
        → Inference configuration
```

They can influence similar observable behaviour, but operate at different layers. Temperature, top-p, top-k, logits, and sampling are explained in [AI Fundamentals](/study/aiFundamentals); support and permitted ranges depend on the chosen model/API.

## 13. Evaluate prompts against the actual objective

Prompt quality should be evaluated against what the application needs, not by how long or sophisticated the prompt looks. Useful dimensions include:

- accuracy;
- relevance;
- consistency;
- completeness;
- output-format compliance;
- latency; and
- token usage / cost.

```text
Prompt A
95% classification accuracy
500 input tokens

Prompt B
95% classification accuracy
120 input tokens

If other behaviour is equivalent,
Prompt B may be preferable for cost and latency.
```

Test representative inputs, including normal and edge cases, then refine the smallest part of the prompt that addresses the observed issue.

## 14. Exam recognition guide: if the question says X, think Y

| If the scenario says... | Think... |
|---|---|
| No examples are provided | **Zero-shot** |
| One example is provided | **One-shot** |
| Several examples demonstrate the task | **Few-shot** |
| Break a multi-step problem into reasoning steps | **Chain-of-thought** |
| Tell the model what it should not do | **Negative prompting / explicit constraint** |
| Reusable prompt containing variables | **Prompt template** |
| Untrusted input attempts to override application instructions | **Prompt injection** |
| Malicious instruction hidden in external content | **Indirect prompt injection** |
| User attempts to bypass intended model restrictions | **Jailbreaking** |
| Change randomness/creativity during generation | **Temperature** |
| Restrict generation by cumulative probability | **Top-p** |
| Keep a fixed number of likely next-token candidates | **Generation top-k** |
| Need reusable/versioned prompts in AWS | **Amazon Bedrock Prompt management** — see [AWS AI Services](/study/infrastructureAWSAiServices#section-2-bedrock) |
| Need actual authorization or security enforcement | **Not prompt engineering** |

## 15. Final mental model

<div class="prompt-diagram prompt-flow" role="img" aria-label="Final prompt engineering mental model from an application need to evaluation and improvement">
  <div class="prompt-node"><strong>User / application need</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node prompt-node--accent"><strong>Prompt engineering</strong>Task · context · constraints · examples · output contract</div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Prompt template</strong>Optional, when the prompt is reused.</div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Model request</strong>Inference parameters: temperature · top-p · etc.</div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Foundation model</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node prompt-node--success"><strong>Response</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Evaluate</strong></div>
  <div class="prompt-arrow">↓</div>
  <div class="prompt-node"><strong>Improve</strong></div>
  <div class="prompt-security"><strong>Prompt engineering guides behaviour; it does not replace security controls.</strong>Guardrails · authorization · input validation · output validation · tool permissions · application security</div>
</div>

## References

- [Amazon Bedrock: What is prompt engineering?](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-prompt-engineering.html)
- [Amazon Bedrock: Prompt engineering concepts](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-engineering-guidelines.html)
- [Amazon Bedrock: Design a prompt](https://docs.aws.amazon.com/bedrock/latest/userguide/design-a-prompt.html)
- [Amazon Bedrock: Prompt templates and examples](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-templates-and-examples.html)
- [Amazon Bedrock: Enhance model responses with model reasoning](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-reasoning.html)
- [Amazon Bedrock: Prompt management](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html)
- [Amazon Bedrock: Deploy a prompt using versions](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management-deploy.html)
- [Amazon Bedrock: Influence response generation with inference parameters](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-parameters.html)
