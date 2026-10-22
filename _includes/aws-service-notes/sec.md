<span id="identity-access-guide"></span>
<span id="section-9-supporting-services"></span>
<span id="section-11-checklist"></span>
{% include aws-identity-decisions.html %}

<span id="identity-core-guide"></span>
{% include aws-identity-overview.html %}

<span id="identity-protocol-guide"></span>
{% include aws-identity-protocols.html %}

##### Private paths and data permissions {#section-9-1-entry}

<span id="private-inference"></span>
Bedrock model calls use the `bedrock-runtime` interface endpoint. Configure DNS, network access, and IAM/endpoint policies; a private route does not itself authorize the request. Lake Formation permissions apply through integrated engines. [Bedrock PrivateLink](https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html).

##### Safe content and redaction {#guardrails-controls}

Guardrails evaluates selected content policies; the application uses the returned block/mask action. Document and tool permissions remain separate. Coverage varies by policy/input type. [Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html).

<span id="pii-redaction"></span>
<span id="pii-example-caption"></span>

```text
Extract → detect sensitive spans → apply/verify redaction
        → sanitized prompt, index, and log destinations
```

<span id="source-audit"></span>
Macie discovers sensitive data in eligible S3 objects. Findings do not redact files; unsupported or unreadable objects need another path. [Macie coverage](https://docs.aws.amazon.com/macie/latest/user/discovery-supported-storage.html).

##### Retention, keys, and credentials {#retention-controls}

Set access, deletion, retention, and location rules for every copy: source, chunks/vectors, state, caches, and logs. Object Lock protects retained versions; Lifecycle manages transitions/expiry.

<span id="key-secret-controls"></span>
KMS manages encryption keys; Secrets Manager stores/rotates credentials. Neither replaces application authorization. [KMS and secret options](#aws-service-kms).

<span id="aws-options-cognito"></span>
<span id="aws-options-identity-cost"></span>
<span id="aws-options-authorization-analysis"></span>
<span id="aws-options-private-endpoints"></span>
<span id="aws-options-keys-secrets"></span>
<span id="aws-options-waf"></span>
<span id="aws-options-sensitive-content"></span>
<span id="aws-options-guardrail-tiers"></span>

