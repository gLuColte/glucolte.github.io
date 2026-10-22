##### Understand the request and response {#section-2-1-inference}

<span id="211-choose-the-bedrock-api-and-capacity-mode"></span>

| API | Request shape | Response handling |
|---|---|---|
| Converse / ConverseStream | Shared messages/content structure | Message or incremental events, usage, stop reason |
| InvokeModel / streaming | Model-provider-specific JSON | Decode the provider's response/events |

**Converse SDK arguments:** `modelId` becomes an HTTP path parameter; the other fields form the body.

```json
{
  "modelId": "MODEL_OR_PROFILE_ID",
  "messages": [{"role": "user", "content": [{"text": "Summarize this evidence."}]}],
  "inferenceConfig": {"maxTokens": 256},
  "serviceTier": {"type": "default"}
}
```

`default` means Standard. Tier/model/API compatibility varies. A Prompt Management version ARN supplies its own documented prompt configuration. [Converse contract](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html).

##### Choose capacity separately from the API {#cross-region-profile}

{% include aws-service-options.md id="bedrock-capacity" %}

A cross-Region profile goes in `modelId`; the application stays in its source Region. Approve every possible inference destination and configure the required profile/model permissions. [Routing and IAM](https://docs.aws.amazon.com/bedrock/latest/userguide/geographic-cross-region-inference.html).

##### Prompt controls, caching, and routing {#section-2-2-capabilities}

<span id="model-prompt-controls"></span>
Version prompts, evaluate changes, and inspect `stopReason` when output truncates. Sampling parameters change generation behavior; they do not increase the context window.

<span id="routing-caching-capacity"></span>

| Reuse or route | Implementation note |
|---|---|
| Prompt cache | Reuses supported prefix processing; check model-specific checkpoints/expiry. |
| Application answer cache | Scope keys by tenant/permissions, evidence version, model/prompt, and expiry. |
| Model routing | Choose a supported managed pair or a measured escalation rule. |

A cache hit must still pass authorization and freshness checks. [Prompt caching](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html). Pricing variants remain in the corresponding cards.

##### Deliver the result and preserve state {#event-stream-controls}

Streaming must work end to end. API Gateway response streaming uses a supported **REST API** integration; WebSockets support later/bidirectional messages; AppSync supplies its own subscription contract. API keys/usage plans meter usage and do not authenticate users. [Streaming integrations](https://docs.aws.amazon.com/apigateway/latest/developerguide/response-transfer-mode.html).

<span id="section-9-3-data"></span>
<span id="section-12-5-security"></span>
Store scoped conversation/job state and idempotency keys separately from the model. DynamoDB TTL deletes asynchronously, so enforce logical expiry in the application.

<span id="speech-bot-interfaces"></span>
For fixed intents/slots use Lex; for text-to-speech use Polly. Their [cards](#aws-service-lex) show interface and engine choices.

<span id="aws-options-api-gateway"></span>
<span id="aws-options-appsync"></span>
<span id="aws-options-dynamodb"></span>
<span id="aws-options-prompt-features"></span>
<span id="aws-options-cloudfront"></span>
<span id="aws-options-speech"></span>

