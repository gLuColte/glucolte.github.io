##### Bedrock: model APIs and customization {#section-2-bedrock}

<span id="bedrock-map-caption"></span>
<span id="bedrock-customization"></span>
Bedrock supplies managed model APIs. Start with a prompt and authorized evidence; consider supported customization when evaluation shows a stable behavior gap. [Customization options](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-model-fine-tuning.html).

{% include aws-service-options.md id="bedrock-tiers" %}

##### SageMaker: choose how the model runs {#section-4-bedrock-sagemaker}

<span id="sagemaker-map-caption"></span>
<span id="41-sagemaker-ai-lifecycle-patterns"></span>
<span id="section-12-1-platforms"></span>
<span id="sagemaker-inference-options"></span>
Choose SageMaker when you need control over model artifacts, containers, GPU instances, or endpoint scaling.

{% include aws-service-options.md id="sagemaker-hosting" %}

##### From artifact to live endpoint {#sagemaker-adapter-lifecycle}

```text
Prepare → train/tune → evaluate → register + approve model package
        → CreateModel → CreateEndpointConfig → Create/UpdateEndpoint
        → wait until ready → test the actual application route
```

Version the model, adapter, tokenizer, and container together. Registration records a candidate; deployment loads it onto serving resources. Keep a compatible rollback. [Pipeline steps](https://docs.aws.amazon.com/sagemaker/latest/dg/build-and-manage-steps-types.html).

<span id="sagemaker-training-bias"></span>
**Capacity:** Spot training needs interruption recovery/checkpoints. Savings Plans discount eligible usage; training plans reserve specified capacity. Compare them in the [SageMaker card](#aws-service-sagemaker).

##### Development, features, and edge deployment {#sagemaker-canvas}

Canvas supports visual ML workflows; Data Wrangler/Processing prepares data. <span id="feature-store"></span>Feature Store's online store serves current features; its offline S3 store holds training history. Use point-in-time data to avoid leakage. [Feature Store](https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store.html).

<span id="edge-hosting"></span>
Neo compiles for supported targets. Outposts/Wavelength supplies infrastructure; check where every dependency and data flow runs. [Neo](https://docs.aws.amazon.com/sagemaker/latest/dg/neo.html).

##### Configuration and controlled rollout {#appconfig-routing}

```text
AppConfig: application → environment → configuration profile/version
Deploy → validate → gradual rollout → monitor / rollback
Runtime agent/API → retrieve configuration → apply settings
```

Parameter Store holds values; AppConfig controls rollout; Secrets Manager protects credentials; AWS Config evaluates resource configuration. Feature flags still need server-side entitlement checks. [AppConfig deployment](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-deploying.html).

##### Shared release standards {#shared-ai-components}

Package reusable infrastructure/runtime code, version it, and gate promotion on evaluation. Open the service cards for [configuration tiers](#aws-service-paramstore) and [pipeline/build modes](#aws-service-cicd).

<span id="aws-options-bedrock-custom-models"></span>
<span id="aws-options-sagemaker-training"></span>
<span id="aws-options-feature-store"></span>
<span id="aws-options-configuration"></span>
<span id="aws-options-delivery"></span>

