##### AgentCore, agent loops, and tools {#section-3-agentcore}

AgentCore supplies modular hosting, tool connectivity, identity, memory, and policy capabilities. Choose components around the application rather than adopting every module. [Components](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html).

<span id="section-3-1-agentcore-boundary"></span>
**Runtime hosts code; Gateway connects tools; MCP defines tool interaction.** Strands/Agent Squad can supply agent-loop/routing logic. Tool APIs still enforce business permissions and validate arguments.

##### Durable workflows and approval {#step-functions-controls}

{% include aws-service-options.md id="step-functions" %}

Set `CreateStateMachine.type` to `STANDARD` or `EXPRESS` at creation; it cannot change later. Express uses `StartExecution` asynchronously or `StartSyncExecution` synchronously. [Creation contract](https://docs.aws.amazon.com/step-functions/latest/apireference/API_CreateStateMachine.html).

```text
Propose action → authenticated approval → SendTaskSuccess/Failure
              → workflow resumes → authorized, idempotent tool action
```

For callback approval use Standard with a protected task token and deadline. Lambda does not need to remain running during the wait. [Callback integration](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html#connect-wait-token).

##### Flows, compute, and event delivery {#bedrock-flow-wiring}

Bedrock Flows wires supported nodes and deterministic conditions. Pass the original inputs needed downstream and explicitly route malformed classifications. [Flow nodes](https://docs.aws.amazon.com/bedrock/latest/userguide/flows-nodes.html).

<span id="section-9-2-compute"></span>
Conventional Lambda invocations last up to 15 minutes. Reserved concurrency allocates/caps concurrency; Provisioned Concurrency warms environments. Neither reserves model capacity. [Lambda concurrency](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html).

<span id="event-delivery-controls"></span>

```text
S3 event → EventBridge rule → workflow
S3 event → SQS → paced worker → model/index
```

Enable/configure the chosen delivery path. Use filtered prefixes, bounded retries, visibility timeouts/DLQs, and idempotency to handle duplicate deliveries and avoid output-trigger loops. [S3 events](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html).

##### Worked sequence: maintenance diagnosis and approved mutation {#section-3-2-industrial-example}

Follow diagnosis → approval → authorized mutation:

<div class="image-wrapper">
  <img src="./assets/agentcore_industrial_maintenance_sequence.png" alt="Production industrial maintenance agent using Amazon Bedrock AgentCore" class="modal-trigger" data-caption="Industrial maintenance request through AgentCore with policy and human approval">
  <div class="diagram-caption" data-snippet-id="agentcore-industrial-sequence-snippet">
    🏭 Production AgentCore sequence: diagnose freely, mutate only with approval
  </div>
  <script type="text/plain" id="agentcore-industrial-sequence-snippet">
@startuml
title Industrial maintenance agent with Amazon Bedrock AgentCore
actor "Plant Engineer" as User
participant "App + Cognito\nAPI Gateway" as Edge
participant "AgentCore Runtime\nSupervisor Agent" as Runtime
participant "AgentCore Identity\nPolicy + Memory" as Controls
participant "Bedrock Model" as Model
participant "AgentCore Gateway\nBounded MCP Tools" as Gateway
participant "Knowledge + Plant Systems\nKB / OpenSearch / CMMS / SiteWise" as Systems
participant "Step Functions\nHuman Approval" as Approval
participant "CloudWatch / OTel\nCloudTrail" as Audit

User -> Edge: Ask about pump vibration
Edge -> Edge: Authenticate; derive user, role, plant
Edge -> Runtime: Request + trusted claims
Runtime -> Controls: Load plant-scoped memory and permissions
Controls --> Runtime: Context + allowed actions
Runtime -> Model: Instructions + evidence needs + tool schemas
Model --> Runtime: Proposed tool call
Runtime -> Controls: Authorize principal, plant, tool, arguments

alt Read-only diagnosis is permitted
  Controls --> Runtime: Permit
  Runtime -> Gateway: get_asset_health / search_manuals
  Gateway -> Systems: Authorized, validated request
  Systems --> Gateway: Telemetry / permitted evidence
  Gateway --> Runtime: Structured result + source IDs
else State-changing or high-impact action
  Controls --> Runtime: Require approval
  Runtime -> Approval: Proposed action + reason + scope
  Approval -> User: Request approval
  User --> Approval: Approve or reject
  Approval --> Runtime: Signed workflow decision
  Runtime -> Gateway: create_work_order + idempotency key
  Gateway -> Systems: Authorized business API call
  Systems --> Gateway: Work-order ID / rejection
  Gateway --> Runtime: Structured result
end

Runtime -> Model: Tool result; request grounded response
Model --> Runtime: Response draft
Runtime -> Controls: Store scoped summary, not plant record
Runtime -> Audit: Trace model, policy, retrieval, tool, outcome
Runtime --> Edge: Answer + evidence + action status
Edge --> User: Display result
@enduml
  </script>
</div>

The maintenance API must enforce the engineer's plant-level permissions and reconcile retries. A conversational memory is not an asset record, and an agent must not bypass industrial safety controls.

<span id="aws-options-agentcore"></span>
<span id="aws-options-bedrock-orchestration"></span>
<span id="aws-options-lambda"></span>
<span id="aws-options-eventbridge"></span>
<span id="aws-options-messaging"></span>

