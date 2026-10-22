##### Choose the retrieval responsibility {#assistant-retriever-vector-store}

<span id="section-8-retrieval-choice"></span>
<span id="section-5-bedrock-kb"></span>
<span id="section-6-opensearch"></span>
<span id="section-7-kendra"></span>
Knowledge Bases can integrate supported backing stores: choosing OpenSearch does not require a wholly custom RAG pipeline. Measure retrieval before judging the generated answer. [Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html).

##### Extract and validate before indexing {#data-automation}

<span id="recognition-extraction"></span>
Textract extracts OCR/forms/tables; BDA uses supported standard outputs or custom blueprints. Validate extracted fields before writing business records or embeddings.

<span id="comprehend-sentiment"></span>
**Text example:** “Great battery, terrible screen.” Comprehend `DetectSentiment` describes the whole review; `DetectTargetedSentiment` describes individual entity mentions. [API comparison](https://docs.aws.amazon.com/comprehend/latest/dg/how-targeted-sentiment.html).

<span id="transcription-phi-pipeline"></span>
For audio, Transcribe speaker labels identify voices, not clinical roles. Comprehend Medical detects supported clinical entities/PHI; apply and verify redaction before downstream writes. See the [service cards](#aws-service-medical) for request/output shapes.

##### Keep evidence traceable and fresh {#source-lineage}

<span id="data-quality"></span>
<span id="glue-quality-redaction"></span>
Preserve source/version metadata on derived chunks. Use Glue quality rules to reject or quarantine bad data. Re-ingest updates and delete stale derived copies; an S3 event alone does not make the index current.

<span id="chunking-implementation"></span>
{% include aws-chunking-explorer.html %}

##### Knowledge Bases: ingestion and query shape {#kb-internals}

```text
Source → parse/chunk/embed → StartIngestionJob → inspect completion
Question → Retrieve → optional rerank → evidence → model
```

**Query fragment — customer-managed KB:** build the filter from verified backend identity; keep the user from supplying their own tenant scope.

```json
{
  "retrievalConfiguration": {
    "vectorSearchConfiguration": {
      "filter": {"equals": {"key": "tenantId", "value": "TRUSTED_TENANT_ID"}},
      "numberOfResults": 10
    }
  }
}
```

Store matching metadata during ingestion and enforce the same policy on tool APIs. Source S3 permissions do not protect indexed copies. Managed KB and customer-managed KB have different API/ACL contracts. [Query configuration](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-config.html), [KB types](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html).

##### Embeddings, ranking, and search tuning {#embedding-representations}

Use compatible embedding models/versions for documents and queries; changing them requires re-embedding. A reranker can reorder retrieved candidates but cannot recover missing evidence.

<span id="opensearch-hnsw-tuning"></span>
OpenSearch index/search parameters trade memory and query effort for recall. Benchmark with real queries before scaling. [k-NN tuning](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/knn.html).

<span id="kendra-search-analytics"></span>
For existing Kendra workloads, search feedback helps diagnose missing content and ranking. Check its [availability notice](https://docs.aws.amazon.com/kendra/latest/dg/kendra-availability-change.html) before considering a new application. Store capacity/pricing comparisons remain in each service card.

<span id="aws-options-s3-classes"></span>
<span id="aws-options-vector-stores"></span>
<span id="aws-options-aurora"></span>
<span id="aws-options-neptune"></span>
<span id="aws-options-kendra"></span>
<span id="aws-options-glue"></span>
<span id="aws-options-extraction"></span>
<span id="aws-options-language-analysis"></span>
<span id="aws-options-rekognition"></span>
<span id="aws-options-transcribe"></span>
<span id="aws-options-rag-cost"></span>
<span id="aws-options-opensearch-storage"></span>
<span id="aws-options-rds-postgres"></span>

