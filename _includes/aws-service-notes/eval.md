##### Evaluate before promotion {#bedrock-flows-evaluation}

Version the test set, prompt/model configuration, and candidate outputs. Evaluate retrieval separately from the answer, compare important cohorts with the baseline, then apply an explicit promote/halt gate.

| Question | Useful evaluation signal |
|---|---|
| Did retrieval find relevant evidence? | Context relevance / evidence coverage |
| Are claims supported by that evidence? | Faithfulness |
| Does the answer address the task correctly? | Correctness / completeness; references as required |
| Does it fit a subjective style or persona? | Human comparison with a shared rubric |

A faithful answer can repeat an incorrect source. Job completion means evaluation finished; inspect the report and thresholds. [Evaluation setup](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html), [RAG metrics](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-evaluation-metrics.html).

##### Correlate runtime evidence {#section-9-4-operations}

<span id="observability-map-caption"></span>
<span id="token-monitoring"></span>
Use shared request/version IDs across application, retrieval, model, and tools so their records can be investigated together.

<span id="invocation-diagnostics"></span>
**Illustrative invocation-log excerpt:**

```json
{
  "operation": "Converse",
  "modelId": "MODEL_ID",
  "input": {"inputTokenCount": 120},
  "output": {"outputTokenCount": 35}
}
```

Invocation logging is opt-in. Configure supported destinations, sensitive-content access, and retention before capture. [Log configuration and schema](https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html).

<span id="agent-trace-controls"></span>
AgentCore telemetry needs its documented setup; instrument application/tool calls as needed. Traces help explain execution but do not expose all hidden model reasoning. [AgentCore observability](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-configure.html).

<span id="cloudtrail-events"></span>
CloudTrail records supported API activity. Correlate it with application/source IDs when you need to know which evidence a user received. [Data-event coverage](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html).

##### Human review and model governance {#labeling-human-review}

Ground Truth creates training labels; A2I routes predictions for review. <span id="model-governance"></span>Model Cards document intended use/limits; Clarify supports bias/explanations; Model Monitor checks configured baselines. Review and drift findings require an explicit application/release response. Check the availability notices in these cards.

<span id="audit-manager"></span>
{% include aws-security-evidence.html %}

Audit Manager has restrictions on new setup; follow its [availability guidance](https://docs.aws.amazon.com/audit-manager/latest/userguide/audit-manager-availability-change.html). Evidence collection supports an audit; the customer still selects controls and resolves findings.

<span id="aws-options-evaluation"></span>
<span id="aws-options-cloudwatch-logs"></span>
<span id="aws-options-telemetry-cost"></span>
<span id="aws-options-cloudtrail"></span>
<span id="aws-options-config-audit"></span>
<span id="aws-options-security-findings"></span>

