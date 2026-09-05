---
title: AI Agents
permalink: /study/aiAgents
---

# AI Agents

Use this page to understand systems in which a model chooses tools or next steps. The safest default is a deterministic workflow with narrowly bounded model decisions.

**Part 5 of 7:** [Knowledge bases](/study/aiKnowledgebases) → **AI Agents** → [Infrastructure and evaluation](/study/aiInfrastructure). Retrieval quality is already established before an agent uses retrieved evidence; this page focuses on runtime decisions and side effects.

## 1. LLM, tool use, workflow, and agent {#section-1-boundaries}

- **LLM**: produces a probabilistic response from supplied context.
- **LLM + tool**: proposes a typed operation; the application validates and executes it.
- **Workflow**: code defines states, transitions, retries, and approvals; a model may perform individual steps.
- **Agent**: a controller repeatedly asks a model what action to take, observes the result, updates state, and decides whether to continue.
- A single function call is tool use, not necessarily an agent.
- “Agentic” means the model has meaningful runtime discretion over action or sequence.

<div class="image-wrapper">
  <img src="./assets/ai_agent_architecture.png" alt="AI agent architecture" class="modal-trigger" data-caption="Bounded agent controller, model, state, tools, and approval">
  <div class="diagram-caption" data-snippet-id="agent-architecture-snippet">
    🧭 Bounded agent tool sequence
  </div>
  <script type="text/plain" id="agent-architecture-snippet">
@startuml
title Bounded agent tool loop
actor User
participant "Agent Controller" as Agent
participant Model
database "Durable State" as State
participant "Policy / Approval" as Policy
participant Tool
User -> Agent: Task + identity
Agent -> State: Load task state
loop Within step/time/cost limits
  Agent -> Model: Goal + permitted tools + observations
  Model --> Agent: Proposed action or final answer
  Agent -> Policy: Validate schema, authorization, risk
  alt Approved tool call
    Policy --> Agent: Allow
    Agent -> Tool: Execute with idempotency key
    Tool --> Agent: Bounded observation
    Agent -> State: Persist transition and result
  else Rejected or approval required
    Policy --> Agent: Reject / request approval
  end
end
Agent --> User: Result, partial result, or escalation
@enduml
  </script>
</div>

## 2. Deterministic versus agentic orchestration {#section-2-orchestration}

- Prefer deterministic workflows when:
  - business steps and transitions are known;
  - auditability and repeatability matter;
  - operations have financial, legal, or irreversible effects;
  - reliable retries and compensation are required;
  - strict latency and cost bounds exist.
- Consider an agent when:
  - input is open-ended;
  - useful tools cannot be selected using stable rules;
  - the path depends on observations discovered at runtime;
  - partial success and human escalation are acceptable.
- Strong hybrid pattern:
  - deterministic outer state machine;
  - model chooses among a small set of allowed next steps;
  - application validates every transition;
  - high-impact branches require approval.
- Avoid agents for simple classification, fixed API composition, known approval processes, or deterministic calculations.

## 3. Tool design and execution boundary {#section-3-tools}

- A tool needs:
  - narrow purpose and descriptive name;
  - typed input/output schema;
  - clear error categories;
  - timeout and payload limits;
  - least-privilege credentials;
  - idempotency and audit behaviour;
  - risk classification: read, reversible write, irreversible action.
- The controller must validate:
  - authenticated user and tenant;
  - permission for the exact resource and action;
  - required/allowed fields and enum values;
  - domain invariants such as account status and transaction limits;
  - freshness of data used for the decision;
  - whether human approval is required.
- Tool descriptions are part of the prompt and can be misunderstood.
- Do not expose broad tools such as unrestricted shell, SQL, HTTP, email, or file access when narrow domain operations are possible.
- Return bounded, structured observations; large raw responses increase cost and prompt-injection exposure.

## 4. Planning and execution loops {#section-4-planning}

- **Direct action**: model selects one tool, observes once, then answers.
- **Plan then execute**: model proposes a plan; controller validates and executes steps.
- **ReAct-style loop**: model alternates between action selection and observations.
- **State machine agent**: code constrains legal states while the model chooses permitted transitions.
- **Reflection/critique**: another model pass checks work:
  - can catch omissions;
  - is still probabilistic and correlated with the original model;
  - does not replace tests or business validation.
- Every loop needs hard budgets:
  - maximum steps and repeated actions;
  - wall-clock deadline;
  - input/output tokens;
  - tool calls and parallelism;
  - monetary spend;
  - maximum observation size.
- Termination outcomes should be explicit: completed, partial, needs approval, needs user input, failed safely, or budget exhausted.

## 5. State and memory {#section-5-memory}

- **Conversation state**: recent messages needed for the current interaction.
- **Task state**: goal, plan, current step, tool results, errors, and approvals.
- **Working memory**: temporary summaries or facts selected for the current reasoning loop.
- **Long-term memory**: durable preferences, facts, or past outcomes retrieved later.
- Durable memory requires:
  - source/provenance;
  - owner and tenant;
  - confidence and timestamp;
  - retention and deletion;
  - user correction;
  - access control;
  - versioning and conflict rules.
- A vector store is a retrieval mechanism, not inherently trustworthy memory.
- Do not save model inferences as user facts without validation or clear labelling.
- Persist state before and after side effects so retries can determine what occurred.

Business systems remain authoritative for orders, balances, entitlements, and asset state; agent memory never replaces them. Apply the [tool execution boundary](#section-3-tools) to memory writes as well.

## 6. MCP {#section-6-mcp}

- The Model Context Protocol standardizes how clients discover and use tools, resources, and prompts from servers.
- MCP improves interoperability; it does not create trust or authorization.
- Treat an MCP server as:
  - a network dependency;
  - a software supply-chain dependency;
  - a source of untrusted content;
  - a holder of potentially powerful credentials.
- Controls:
  - authenticate client and server;
  - allowlist servers and capabilities;
  - expose only required tools/resources;
  - keep credentials outside model-visible context;
  - validate tool arguments and returned content;
  - apply network egress restrictions;
  - pin/review versions and audit calls.
- A malicious resource may tell the model to ignore policy or exfiltrate data; instruction hierarchy alone is not an adequate defence.

## 7. Multi-agent systems {#section-7-multi-agent}

- Multiple agents are justified only when separate roles, permissions, models, contexts, or parallel work create measurable value.
- Possible patterns:
  - coordinator delegates bounded specialist tasks;
  - independent workers run safe read-only research in parallel;
  - reviewer checks an output against a separate rubric;
  - handoff routes work between different trust domains.
- Added costs:
  - duplicated work and context;
  - inconsistent plans;
  - more failure and retry paths;
  - larger attack surface;
  - difficult attribution and debugging;
  - latency and token multiplication.
- Do not create multiple personas when one workflow with clear functions is sufficient.

## 8. Failure modes and controls {#section-8-failures}

The earlier sections define tool validation, loop budgets, and memory controls. Handle failures that span those components explicitly:

| Failure | Recovery behaviour |
|---|---|
| Duplicate side effect after a timeout | Reconcile the durable execution record and idempotency key before retrying. |
| Partially completed task | Record completed steps; run defined compensation or escalate with the remaining work. |
| Conflicting state updates | Version transitions and use conditional/transactional writes; reconstruct from event history if needed. |
| Repeated state/action pair or exhausted budget | Terminate with a partial result or escalation, with the stop reason recorded. |
| Malicious tool observation | Reject unsafe actions at the tool boundary and preserve the observation for controlled investigation. |

For the full threat model and platform response, see [Infrastructure security](/study/aiInfrastructure#section-6-security).

## 9. Evaluation and observability {#section-9-evaluation}

Evaluate the **agent loop**, not retrieval or answer grounding again. For those RAG measurements, see [AI Knowledge Bases](/study/aiKnowledgebases#evaluation-does-the-system-retrieve-and-answer-well); for release gates and operational evaluation, see [AI Infrastructure and Evaluation](/study/aiInfrastructure#section-12-evaluation).

- Offline scenarios should test:
  - correct tool selection;
  - argument validity and semantic correctness;
  - permission denial;
  - tool timeout/error recovery;
  - loop termination;
  - prompt-injection resistance;
  - task completion within budget.
Record proposed action, policy/approval decision, execution result, state transition, and stop reason as spans in the [shared request trace](/study/aiInfrastructure#section-11-observability).

- Key metrics:
  - task completion rate;
  - tool success and invalid-argument rate;
  - average/p95 steps per task;
  - approval and escalation rate;
  - duplicate-action incidents;
  - cost and latency per completed task.

Continue to [AI Infrastructure and Evaluation](/study/aiInfrastructure) for the platform controls, tracing, and release process that operate around an agent.
