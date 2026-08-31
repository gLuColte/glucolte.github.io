---
title: AI Prompt Engineering
permalink: /study/aiPromptEngineering
---

# AI Prompt Engineering

Prompt engineering is how an application turns a user need into clear model input. It happens **before** the LLM request is tokenized. For what happens after text enters the model, see [AI Fundamentals](/study/aiFundamentals).

## 1. A prompt is an input contract

A useful prompt usually includes only what the model needs:

```text
role or task
+ relevant context or source text
+ clear instructions and limits
+ optional examples
+ current input
+ required output format
```

- Put the task and success criteria in plain language.
- Separate instructions, reference material, and user data with headings or delimiters.
- State the output shape: for example, a one-sentence answer, a table, or a schema.
- Treat user input and retrieved text as data, not trusted instructions.

## 2. Zero-shot, one-shot, and few-shot prompting {#shots}

A **shot** is an input → desired-output example inside the prompt.

| Technique | What the prompt contains | Best use |
|---|---|---|
| **Zero-shot** | Instructions only; no examples | A clear, familiar task where the format is simple. |
| **One-shot** | One example | A small formatting or classification cue. |
| **Few-shot** | Several representative examples | A task with a specific label set, tone, structure, or edge cases. |

Use the same task to see the difference:

**Zero-shot**

```text
Classify this support ticket as Urgent, General Inquiry, or Feedback.

Ticket: "My account was charged twice and I cannot log in."
Answer:
```

**Few-shot**

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
- Few-shot learning uses the labelled examples **in this request** to guide the output; it does not retrain the model or update its weights. Fine-tuning is the separate process that changes weights using a training dataset.
- For an obscure or changing technical framework, a few official code examples can ground format and syntax. Use retrieved/current official documentation and validation when factual freshness matters; examples alone do not make a model current.

## 3. Chain-of-thought (CoT) prompting {#chain-of-thought}

**Chain-of-thought prompting** asks a model to break a multi-step problem into intermediate reasoning steps before answering. It is most useful for maths, constraint checking, and multi-step logic—not simple extraction or classification.

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

## 4. Negative prompting and explicit boundaries {#negative-prompting}

**Negative prompting** says what the model must avoid. Pair it with a safe fallback, so the model knows what to do instead.

```text
Use only the supplied product documentation.
Do not invent product features, prices, or citations.
If the documentation does not answer the question, say: "I don't have enough information."
```

Negative prompting is helpful for style and behaviour, but it is not a security control. It cannot enforce authorization, stop all jailbreak attempts, or guarantee truth. Use guardrails, access control, input validation, and output/tool validation where those properties matter.

## 5. Prompt templates and output constraints {#templates}

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
- When an application needs machine-readable output, request a schema or use a provider's structured-output feature. Valid syntax does not guarantee factual, safe, or authorized content.

## 6. Choose the simplest technique that fits

| Need | Start with | Escalate when needed |
|---|---|---|
| Clear task and simple format | Zero-shot | Add an output example. |
| Exact labels, tone, or layout | One-shot or few-shot | Improve representative examples. |
| Multi-step calculation or logic | Zero-shot CoT | Few-shot CoT or deterministic verification. |
| Avoid a type of claim or content | Negative prompting plus a fallback | Guardrails and application validation. |
| Repeated production use | Versioned template and evaluation set | Prompt management and controlled rollout. |

## 7. Practical checklist

- Is the task specific, complete, and unambiguous?
- Is relevant context clearly delimited and kept separate from instructions?
- Is the desired output shape explicit?
- Are few-shot examples representative and worth their token cost?
- Is reasoning really needed, and are important results independently verified?
- Does a negative instruction have a useful fallback?
- Are the prompt version, model, inference parameters, and evaluation set recorded?

## References

- [Amazon Bedrock: What is prompt engineering?](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-prompt-engineering.html)
- [Amazon Bedrock: Prompt engineering concepts](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-engineering-guidelines.html)
- [Amazon Bedrock: Design a prompt](https://docs.aws.amazon.com/bedrock/latest/userguide/design-a-prompt.html)
- [Amazon Bedrock: Prompt templates and examples](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-templates-and-examples.html)
- [Amazon Bedrock: Enhance model responses with model reasoning](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-reasoning.html)
