/* One connected architecture. Concepts expand in a panel anchored to their map layer. */
(() => {
  'use strict';
  const root = document.getElementById('genai-map');
  if (!root) return;
  const el = id => root.querySelector(`#gm-${id}`);
  const concepts = new Map();
  const add = (id, parent, title, summary, fields = {}) => concepts.set(id, {id, parent, title, summary, ...fields});
  add('system', null, 'Whole application', 'Prepare trusted knowledge ahead of time; retrieve permitted evidence and assemble context at runtime. The model lifecycle and four supporting pillars help coordinate, protect, evaluate, and monitor both flows.', {
    constraint:'Locate the failed responsibility, then state the requirement the solution must satisfy.',
    managed:'Use managed model, data, orchestration, and control capabilities where their contracts fit.',
    extension:'Look for a supported extension at the specific layer before replacing its pipeline.',
    ownership:'Own the unsupported gap, including its recovery, authorization, evaluation, and operations.',
    capability:'Choose a layer first. AWS services implement responsibilities; they are not the architecture itself.',
    clue:'Ask: where is the problem → what is the constraint → what is managed → is an extension supported → what must I own?',
    trap:'A custom requirement at one stage does not justify rebuilding the whole application.', read:'#how-to-think'
  });
  add('source','system','Source','Approved facts, media, and datasets enter here. Establish provenance, versions, permitted use, and update/delete behavior before creating derived copies.',{
    constraint:'Input modality, freshness, permission, and authoritative source version.',
    managed:'S3/object storage, databases, and supported data connectors provide source access and storage.',
    extension:'Pre-extract or adapt unsupported source formats/connectors while preserving provenance.',
    ownership:'Own unsupported connectors and source validation; carry source/version/ACL metadata into derived evidence.',
    capability:'Amazon S3, supported database/connectors, and authoritative business APIs.',
    clue:'“Private manuals change daily” points to current source evidence and synchronization, not memorizing facts in weights.',
    trap:'Changing a source object does not prove the index, cache, or generated answer was refreshed.',read:'#preprocessing'
  });
  add('preprocess','system','Preprocess','Convert or validate inputs before creating chunks, embeddings, datasets, or model requests. Preserve meaning rather than merely producing text.',{
    constraint:'Document structure, modality, schema quality, sensitive spans, and approved downstream format.',
    managed:'Supported extraction, transcription, ETL, and text-analysis capabilities perform bounded transformations.',
    extension:'Add validation, reconstruction, or verified redaction around supported outputs.',
    ownership:'Own domain-specific transformations and unsupported formats; quarantine failures before indexing or logging.',
    capability:'Textract, Transcribe, Glue/Data Quality, Comprehend, or supported Bedrock Data Automation.',
    clue:'“The PDF condition disappeared during extraction” is a parsing/preprocessing problem before retrieval.',
    trap:'Detection is not redaction, and accurate embeddings cannot restore missing extracted text.',read:'#preprocessing'
  });
  add('ingestion','system','Ingestion','Build searchable evidence: Parse → Chunk → Metadata → Embed → Index. This is preparation/synchronization work, not the per-question ranking path.',{
    constraint:'Preserve source meaning, useful evidence units, metadata, vector compatibility, and freshness.',
    managed:'Bedrock Knowledge Bases orchestrates supported ingestion, embedding, indexing, and source synchronization.',
    extension:'Knowledge Bases Lambda transformation supports custom chunking and chunk metadata under its contract.',
    ownership:'Own only unsupported ingestion behavior; a compatible extension can leave the remaining pipeline managed.',
    capability:'Bedrock Knowledge Bases ingestion with supported parsers, chunking, embedding model, and vector store.',
    clue:'“Custom chunk boundaries, managed retrieval retained” points to an ingestion extension.',
    trap:'A Lambda ingestion transformation does not control query-time ranking.',read:'#rag-trade-offs'
  });
  add('store','system','Knowledge store','Keep searchable chunks, vectors, metadata, and source references. A Knowledge Base coordinates RAG; its vector store holds/searches the indexed evidence.',{
    constraint:'Supported query/storage features, metadata filtering, scale, synchronization, and access boundaries.',
    managed:'Knowledge Bases integrates supported stores and offers managed retrieval/generation APIs.',
    extension:'Configure supported stores, metadata, retrieval options, and application-side context processing.',
    ownership:'Own custom retrieval only where the managed path lacks required behavior. Assess support before deciding.',
    capability:'Bedrock Knowledge Bases with OpenSearch or another supported vector store.',
    clue:'“OpenSearch is the backing store” does not say who owns the rest of RAG.',
    trap:'OpenSearch does not automatically mean custom RAG. A vector database is not an enterprise assistant.',read:'#rag-trade-offs'
  });
  add('user','system','User / API','Accept a request with trusted identity, its task, and an appropriate delivery contract. Carry scope and correlation through downstream stages.',{
    constraint:'Authenticated caller, tenant entitlement, request limits, private access, and interactive versus background completion.',
    managed:'API Gateway, identity/federation services, and eligible private service endpoints supply entry-point capabilities.',
    extension:'Application validation/router logic can enforce team entitlement, token admission, and model routes.',
    ownership:'Own business/data authorization and request policy that generic API throttles cannot express.',
    capability:'API Gateway + application adapter/router; Cognito or federation where appropriate.',
    clue:'“Several teams need common model policy” points to a shared gateway, not just direct invocation.',
    trap:'Authentication identifies the caller; it does not establish document or tool entitlement.',read:'#genai-gateway'
  });
  add('retrieval','system','Retrieval','Turn a question into permitted candidates, rank them, and select evidence for context. Query → query embedding → vector/lexical/hybrid → candidates → reranker → best context.',{
    constraint:'Evidence coverage, exact identifiers, access filters, ranking, and context budget.',
    managed:'Knowledge Bases Retrieve/RetrieveAndGenerate and supported store/search/reranking options cover configured retrieval behavior.',
    extension:'Compose supported retrieval calls, filters, reranking, or context selection when the combined path is insufficient.',
    ownership:'Own unsupported query/ranking policy at this layer, retaining managed ingestion where it still fits.',
    capability:'Knowledge Bases, supported OpenSearch lexical/vector/hybrid search, and supported Bedrock reranking.',
    clue:'Absent candidate → retrieval/earlier evidence boundary. Present but poorly ordered → reranking.',
    trap:'Reranking cannot recover material absent from its candidate input.',read:'#rag-trade-offs'
  });
  add('prompt','system','Prompt / context','System instructions + prompt template + user query + retrieved knowledge + conversation context become the model input. Keep untrusted data separate from governing instructions.',{
    constraint:'Clear task/rules, correct evidence, relevant conversation state, context size, and output contract.',
    managed:'Bedrock Prompt Management supplies reusable supported templates/configuration and versions; inference APIs accept context/messages.',
    extension:'Application context assembly supplies permitted evidence/history and supported structured-output configuration.',
    ownership:'Own evidence selection, authoritative state, prompt release gates, and semantic/business validation.',
    capability:'Prompt Management; Converse/ConverseStream or model-specific APIs with application-managed context.',
    clue:'“Right evidence, wrong answer” requires inspecting actual context and task instructions before assuming retrieval is broken.',
    trap:'A versioned prompt, valid JSON, or low temperature does not establish factual truth.',read:'#model-prompt-decisions'
  });
  add('model','system','Model','Invoke a compatible evaluated model using permitted context. Choose the hosting boundary by required controls, not by whether something is “custom.”',{
    constraint:'Model capability, customization support, latency/capacity, serving control, and approved processing Regions.',
    managed:'Bedrock abstracts eligible FM inference infrastructure; SageMaker AI offers managed ML training/hosting services with deeper controls.',
    extension:'Bedrock supports eligible customization/import; SageMaker supports compatible model/serving implementations.',
    ownership:'Take container/GPU/endpoint control when required, and accept its capacity/deployment responsibilities.',
    capability:'Amazon Bedrock for managed FM-centric integration; SageMaker AI when deeper ML/hosting control is decisive.',
    clue:'“Choose GPU family and serving container” points to hosting control. “Fine-tuned model” alone does not.',
    trap:'Custom does not automatically mean SageMaker. Bedrock also supports eligible customization.',read:'#hosting-decision'
  });
  add('response','system','Response','Deliver and validate the result under the caller’s contract. An answer, source citation, tool outcome, and durable job completion are different artifacts.',{
    constraint:'Complete versus incremental delivery, user waiting, background completion, and verified outcome.',
    managed:'Supported Bedrock synchronous/streaming calls and batch jobs supply model-operation contracts.',
    extension:'A streaming adapter forwards events; asynchronous application workers persist job state/results.',
    ownership:'Own end-to-end transport, safe partial-output handling, job reconciliation, and business outcome validation.',
    capability:'Converse / ConverseStream; asynchronous jobs/workers; supported Bedrock batch inference.',
    clue:'Earlier tokens while the user waits → streaming. Caller can leave → async; offline dataset → eligible batch.',
    trap:'Streaming is not asynchronous. A job acknowledgment is not completed business work.',read:'#inference-modes'
  });
  add('lifecycle','system','Model lifecycle','Select → Adapt/customize/train → Evaluate → Deploy/invoke → Monitor. This governs the configuration used by the runtime model, not a sequence repeated for every question.',{
    constraint:'Task/model fit, data quality, measured benefit, release safety, reproducibility, and rollback.',
    managed:'Bedrock provides supported model/customization/evaluation operations; SageMaker supplies broader ML lifecycle capabilities.',
    extension:'Version prompts, retrieval, datasets, tools, and supported model artifacts; add calibrated evaluations and approval gates.',
    ownership:'Own release criteria, custom training/serving needs, human accountability, and rollback verification.',
    capability:'Bedrock capabilities and/or SageMaker AI pipelines, training, governed artifacts, and endpoints according to the controls needed.',
    clue:'Change instructions, evidence, or weights deliberately; evaluate each against a held-out baseline.',
    trap:'A trained model or registered artifact is not proof of a safe, deployed, working release.',read:'#evaluation'
  });
  add('orchestration','system','Orchestration','Choose who controls progress across either data or runtime work: bounded code, explicit states, decoupled events, or model-selected actions.',{
    constraint:'Who chooses the next step? Duration, durability, waits, retries, approval, and coupling.',
    managed:'Lambda executes bounded tasks; Step Functions persists explicit workflows; EventBridge routes events; SQS buffers work.',
    extension:'Bounded model/tool calls can be composed into workflows; persistent compatible tool services can use ECS/Fargate.',
    ownership:'Own action authority, idempotency, rate control, and unsupported runtime/coordination logic.',
    capability:'Lambda | Step Functions | EventBridge / SQS | Bedrock Agents or an appropriate agent framework.',
    clue:'Known durable sequence + wait/approval → Step Functions. Model chooses next tool from observations → agent.',
    trap:'An agent framework does not replace durable workflow state or business authorization.',read:'#serverless-vs-containers'
  });
  add('security','system','Security / governance','Apply identity, access, isolation, encryption, network, safety, PII, and governance controls at the boundaries they protect—not as one final filter.',{
    constraint:'Caller/data/tool entitlement, sensitive copies, private paths, allowed Regions, retention, and content risk.',
    managed:'IAM/KMS, identity services, supported private endpoints, Guardrails, and data discovery/analysis supply distinct controls.',
    extension:'Application authorization/filtering, validation, redaction, and release/governance checks enforce workload-specific policy.',
    ownership:'Own tenant scope before context, transaction rules before writes, derived-copy handling, and unsupported policy checks.',
    capability:'Authentication + IAM/data authorization + isolation + KMS + network policy + appropriate safety/PII controls.',
    clue:'Tenant A must not retrieve tenant B’s documents → access/filtering before context.',
    trap:'Guardrails is not authorization. Private transport or encryption does not establish entitlement or approved residency.',read:'#security-controls'
  });
  add('evaluation','system','Evaluation / diagnosis','Measure evidence coverage, answer/task quality, safety, latency, and cost before releases and during operation. Diagnose backwards using observed boundary evidence.',{
    constraint:'Which quality failed, which cohort failed, and at what architecture boundary?',
    managed:'Supported Bedrock model/RAG evaluations supply automated/judge/human approaches; metrics/traces support operational evidence.',
    extension:'Add calibrated rubrics, expert labels, deterministic assertions, tool-outcome tests, and cohort gates.',
    ownership:'Own representative held-out datasets, metric interpretation, judge calibration, and release/rollback policy.',
    capability:'Recall/precision, faithfulness/correctness/relevance, safety, task success, first-token/total latency, and cost per successful outcome.',
    clue:'Missing evidence, noisy retrieval, and unsupported generated claims are different defects.',
    trap:'High average quality, a real citation, or low latency can hide a critical cohort or unsafe side effect.',read:'#evaluation'
  });
  add('observability','system','Observability','Collect the evidence needed for the question: trends, caller activity, interaction content, or time across request stages.',{
    constraint:'What happened, to which request/version/caller, at which stage—and what can be safely retained?',
    managed:'CloudWatch metrics/logs, CloudTrail events, supported invocation logging, and tracing capture different evidence.',
    extension:'Instrument spans and custom quality signals; correlate IDs and version attribution across application/model/tool stages.',
    ownership:'Own missing instrumentation, sanitized content policy, retention, delivery monitoring, and investigation queries.',
    capability:'CloudWatch | CloudTrail | Bedrock Model Invocation Logging | X-Ray / OpenTelemetry | agent/tool traces.',
    clue:'Who called → CloudTrail. Prompt/response → invocation logging. Trend → metrics. Slow stage → spans.',
    trap:'Enabling Lambda tracing does not expose every uninstrumented SDK hop or hidden model internal.',read:'#logging-boundary'
  });
  const sub = (id,parent,title,summary,clue,trap,fields={}) => add(id,parent,title,summary,{clue,trap,...fields});
  sub('source-documents','source','Documents / images','S3 manuals, PDFs, scans, and images need source/version identity and a supported parsing or native multimodal path.','Tables and scanned conditions must survive extraction.','A readable text file can still omit a material column or exception.');
  sub('source-databases','source','Databases / business records','Query current authoritative records through an authorized supported connector or business API.','Refund status is a live transaction fact, not a generic prompt example.','A correct source connection is not permission for every caller to every row.');
  sub('source-audio','source','Audio / media','Use supported native modalities or prepare transcripts/structured output for the chosen downstream path.','Choose the representation the selected model and retrieval path actually support.','Transcription is not compulsory for every supported audio-capable model.');
  sub('documents','preprocess','Documents / tables → Textract','Extract supported text, forms, and tables; reconstruct and validate relationships against the source.','Condition missing from extracted table → repair extraction before re-indexing.','Larger embeddings or chunks cannot restore a condition never extracted.',{capability:'Amazon Textract; supported advanced parsing / Bedrock Data Automation where the contract fits.'});
  sub('audio','preprocess','Speech → Transcribe','Prepare supported recordings as text when the downstream pipeline needs transcripts.','Preserve speaker turns and source references when they matter.','Speaker labels do not verify business roles.',{capability:'Amazon Transcribe, or a supported native audio/model path.'});
  sub('etl','preprocess','ETL / quality → Glue','Normalize approved formats, catalog data, and evaluate explicit schema/data rules before creating derived copies.','Invalid dataset records must fail or be quarantined before training/indexing.','A data-quality report is not automatically a deployment or ingestion gate.',{capability:'AWS Glue / Glue Data Quality plus explicit pipeline gating.'});
  sub('pii-text','preprocess','Text / PII → Comprehend','Locate supported entities or sensitive spans; apply and verify required redaction before indexing or logging.','Text-processing PII detection is a different boundary from S3 corpus discovery.','Detection does not itself sanitize every downstream copy.',{capability:'Amazon Comprehend plus verified application transformation.'});
  sub('parse','ingestion','Parse','Preserve headings, tables, qualifiers, identifiers, and source versions in the extracted evidence.','The condition is absent before chunking → fix parsing.','Do not diagnose chunking when the original meaning was already lost.',{constraint:'Correct source meaning and structure reach the chunker.'});
  sub('chunk','ingestion','Chunking','Create evidence units that balance focused matching, sufficient context, and token budget.','Small matching passage needs surrounding section → evaluate parent/child context.','Semantic or larger chunks are not universally better.',{constraint:'Preserve meaning while meeting retrieval quality and context-budget targets.'});
  sub('chunk-default','chunk','Default','Use the service’s default sentence-aware text splitting where representative retrieval tests show it fits.','Start simple when no measured boundary problem requires another strategy.','Default is not proof that table relationships or conditions survived.',{capability:'Bedrock Knowledge Bases default text chunking.'});
  sub('chunk-fixed','chunk','Fixed','Choose explicit token size/overlap to control predictable evidence units.','A condition split across boundaries may need overlap or another context strategy.','More overlap increases indexed material; larger chunks can add noise.',{capability:'Supported fixed-size Knowledge Bases chunking.'});
  sub('chunk-semantic','chunk','Semantic','Split supported text around meaning/topic changes; evaluate the resulting boundaries and additional cost.','Meaning boundaries may help a corpus with topic transitions.','Semantic chunking does not automatically provide parent substitution.',{capability:'Supported Knowledge Bases semantic chunking.'});
  sub('chunk-hierarchical','chunk','Hierarchical','Match child chunks and return broader parent context when the selected store/configuration supports it.','Focused child match needs surrounding section conditions.','Parent context costs tokens and may reduce the returned result count.',{capability:'Supported Knowledge Bases hierarchical chunking.'});
  sub('chunk-custom','chunk','Custom','Define domain-specific evidence boundaries when supported built-in strategies do not fit.','Custom chunking does not automatically require custom retrieval.','Check an extension contract before rebuilding ingestion.',{extension:'Knowledge Bases custom transformation can supply chunking logic.'});
  sub('transformation','chunk-custom','Lambda Transformation','A supported Knowledge Bases ingestion hook supplies custom chunks or chunk-level metadata, then returns output for managed processing.','Custom chunking / chunk metadata → supported ingestion extension.','This hook does not own query-time retrieval or reranking.',{managed:'Knowledge Bases retains supported embedding/indexing/retrieval responsibilities around the transformation.',extension:'Use the prescribed Lambda and intermediate-S3 contract; custom chunking uses the appropriate no-chunking configuration.',ownership:'Own and validate the transformation implementation, not the entire RAG pipeline.',capability:'Bedrock Knowledge Bases custom transformation with AWS Lambda.'});
  sub('metadata','ingestion','Metadata','Attach source/version references, searchable identifiers, and trusted access metadata to evidence.','Tenant filtering and freshness checks depend on reliable metadata.','User-supplied tenant text is not trusted authorization scope.',{constraint:'Useful, consistent metadata survives indexing and retrieval.'});
  sub('embed','ingestion','Embedding','Represent documents and queries in a compatible embedding space. Smaller vectors can reduce storage, but require retrieval-quality evaluation.','Document vector and query vector must have matching dimensions and compatible model/configuration.','More dimensions do not guarantee accuracy; matching size alone is not sufficient.',{constraint:'Compatible vectors and measured recall within storage/latency goals.',managed:'Supported Bedrock embedding models generate vectors; the vector store performs similarity search.',extension:'Select supported dimensions/configuration and rebuild affected vectors consistently.',ownership:'Own evaluation and migration consistency when changing embedding model or dimension.',capability:'Titan Text Embeddings V2 or another supported embedding model.'});
  sub('titan','embed','Titan Text Embeddings V2','Supported vector sizes are 256, 512, and 1,024 dimensions. Compare configurations on the same representative query set.','Keep document/query contracts compatible through an index migration.','Titan G1’s 1,536 dimensions are a different model contract.',{capability:'Amazon Titan Text Embeddings V2: 256D / 512D / 1024D.'});
  [256,512,1024].forEach(dim=>sub(`dim-${dim}`,'titan',`${dim}D`,`${dim}-dimensional V2 vectors are a supported configuration. Use compatible query vectors and measure recall, storage, and latency.`, 'Choose based on a measured quality target, not vector size alone.','An index accepting the vector does not prove it meets retrieval recall.'));
  sub('compatibility','embed','Document ↔ query compatibility','Document: 512D ↔ Query: 512D is dimension-compatible. Document: 1024D ↔ Query: 256D is not. Also preserve compatible model/configuration.','A query-only dimension change against the old index breaks the vector contract.','Do not mix embedding spaces just because both vectors have the same length.');
  sub('index','ingestion','Index / synchronize','Persist chunks, vectors, metadata, and source versions. Check completed updates/deletes and derived copies.','Source changed but old version retrieved → inspect ingestion/index freshness.','S3 modification alone does not prove a successful index update.',{constraint:'The intended current approved evidence is actually indexed and searchable.'});
  sub('knowledge-bases','store','Bedrock Knowledge Bases','Managed RAG coordinates supported source ingestion and retrieval with a supported backing store. Retrieve tests evidence separately; RetrieveAndGenerate combines the configured path.','A managed extension can leave the rest of RAG managed.','Knowledge Bases and its vector store are different responsibilities.');
  sub('vector-store','store','OpenSearch / vector stores','Store/search indexed vectors, text, and metadata under the selected integration contract.','A managed Knowledge Base can use OpenSearch as its backing store.','Naming OpenSearch does not imply a fully custom RAG pipeline.',{capability:'Supported OpenSearch/vector-store integration; verify store and search feature support.'});
  sub('query','retrieval','Query','Preserve intent, literal identifiers, and trusted scope when forming the retrieval request.','An equipment ID is not interchangeable with semantically similar products.','Normalizing away meaningful identifiers can destroy exact matching.');
  sub('query-embed','retrieval','Query embedding','Generate the query representation compatible with indexed document vectors.','Document/query dimensions and model space must remain compatible.','Changing the query model alone does not migrate the document index.',{capability:'The compatible embedding model/configuration used by the indexed corpus.'});
  sub('vector','retrieval','Vector / semantic','Find candidates by semantic similarity in a compatible vector space.','Meaning similarity helps paraphrases and concept queries.','Similar text is not proof of exact identifier match or permission.',{capability:'Supported vector retrieval through Knowledge Bases / the selected store.'});
  sub('bm25','retrieval','BM25 / lexical','Use literal terms and identifiers as retrieval signals; field configuration and tokenization still matter.','AX-1047 / SKU / policy code may need lexical matching or an exact field lookup.','A semantic similarity score alone can miss a literal identifier.',{capability:'OpenSearch lexical/BM25 or exact identifier lookup where configured.'});
  sub('hybrid','retrieval','Hybrid','Combine semantic and lexical signals where the selected store/API supports it, then evaluate candidate coverage and relevance.','The question contains both an exact asset ID and a semantic symptom.','Hybrid support and quality vary; it is not universally the best search.',{capability:'Supported hybrid retrieval configuration, for example eligible OpenSearch-backed paths.'});
  sub('candidates','retrieval','Candidates','Inspect the permitted evidence actually returned before reranking. Missing candidates may reflect indexing, freshness, filters, or query behavior.','Indexed and authorized source missing here → evaluate candidate recall and query/search.','A reranker cannot score a document absent from its input.',{constraint:'The required permitted evidence enters the candidate set.'});
  sub('reranker','retrieval','Reranker','Reorder existing candidates for relevance to the question before pruning context. This adds a ranking stage, not a new source-ingestion path.','Correct passage is present but placed below irrelevant candidates.','Reranking cannot restore text never parsed/indexed/retrieved.',{constraint:'The needed evidence is present but its ordering/selection is poor.',managed:'Supported Bedrock reranker models score supplied query/document candidates.',extension:'Use supported reranking configuration or compose a reranking call over collected candidates.',ownership:'Own unsupported ranking policy and its latency/cost evaluation, not unrelated ingestion.',capability:'Supported Bedrock reranking / ranking configuration.'});
  sub('best-context','retrieval','Best context','Select authorized relevant evidence within the context budget, preserving qualifications and source references.','Good candidate can still be lost by pruning or truncation before generation.','Top-ranked alone does not mean complete, permitted, or source-supported.');
  sub('system-instructions','prompt','System instructions','State task authority, behavior, boundaries, and insufficient-information handling.','Separate governing instructions from untrusted source passages.','A system instruction is not a deterministic access-control boundary.');
  sub('prompt-template','prompt','Prompt template','Version reusable task instructions, variables, and supported model configuration.','Reproducible prompt releases → Prompt Management.','Saving a version does not mean it passed evaluation.',{capability:'Bedrock Prompt Management plus application release/evaluation gates.'});
  sub('user-query','prompt','User query','Define the requested task clearly and preserve the question the evidence should answer.','Different label definitions or overlap policies create different classification tasks.','A persona cannot fill in an undefined decision rule.');
  sub('retrieved-knowledge','prompt','Retrieved knowledge','Supply selected permitted passages as evidence, keeping their identifiers and source conditions.','A cited passage must actually support the answer claim.','Treat document instructions as untrusted data rather than system authority.');
  sub('conversation','prompt','Conversation context','Supply relevant permitted history and authoritative state explicitly; trim within the context budget.','Converse accepts messages; the application owns the history it sends.','An inference call is not automatically a persistent conversation store.');
  sub('bedrock','model','Amazon Bedrock','Use eligible managed foundation models, inference APIs, customization, and supporting GenAI capabilities without choosing endpoint GPU fleets.','Managed FM-centric application integration fits without infrastructure selection.','Bedrock supports eligible customization; “custom weights” alone does not require SageMaker.',{capability:'Bedrock inference/customization/import features where supported.'});
  sub('sagemaker','model','SageMaker AI','Choose deeper ML training, serving-container, instance, endpoint, and lifecycle controls where they are decisive.','GPU family + serving container + endpoint autoscaling requirements.','More control adds ownership; do not choose it merely because a prompt or chunker is custom.',{managed:'SageMaker provides managed ML services while exposing supported training/hosting configuration.',ownership:'Own the model/container configuration, compatible artifacts, deployment, capacity, and validation.',capability:'SageMaker AI training and eligible hosted endpoint configurations.'});
  sub('sync','response','Synchronous','The caller waits for one complete bounded response.','Short complete answer needed before proceeding.','A larger timeout does not turn the path into durable background work.',{capability:'Supported Converse / InvokeModel and a bounded request path.'});
  sub('streaming','response','Streaming / ConverseStream','Expose incremental generated output while the caller stays connected; every transport hop must preserve streaming.','Need earlier visible tokens while the user waits.','Streaming does not imply background completion or lower total inference cost.',{capability:'ConverseStream / InvokeModelWithResponseStream with an eligible streaming transport.'});
  sub('async','response','Asynchronous','Return durable acceptance/job identity and finish later with persisted status/results and failure handling.','Caller can leave; accepted work must survive transient worker failures.','Acknowledged is not completed, and a queue does not by itself enforce token rate.',{capability:'SQS + paced Lambda/container workers + durable results; event/workflow patterns where appropriate.'});
  sub('batch','response','Batch','Process a supported offline dataset as a managed inference job and reconcile record-level results.','Many offline requests; no immediate live answer is needed.','Batch support, input format, economics, and completion semantics depend on the model/Region contract.',{capability:'Supported Bedrock batch inference over an approved S3 dataset.'});
  sub('select','lifecycle','Select','Compare supported model capability, modalities, context limits, quality, safety, latency, cost, and deployment requirements.','Choose with representative tasks and a held-out baseline.','A public benchmark rank does not establish fit for this workload.');
  sub('adapt','lifecycle','Adapt / customize / train','Change instructions, evidence, or weights according to the observed deficiency; these approaches can combine.','Missing current facts differs from unstable instructions or stable style needs.','RAG is not fine-tuning and neither is required for every model change.');
  sub('prompt-engineering','adapt','Prompt engineering','Clarify task, decision rules, examples, and supported output constraints before adding weight changes.','Policy ambiguity or a missing few-shot boundary.','A valid schema or low temperature cannot supply a missing fact.',{capability:'Versioned prompts, Prompt Management, supported schema controls, and evaluation.'});
  sub('rag','adapt','RAG','Retrieve current private evidence into context rather than relying on model weights to track updates.','Frequently changing source facts with attribution.','RAG still needs ingestion freshness, authorization, retrieval quality, and faithful context use.',{capability:'Knowledge Bases or a justified composed/custom retrieval layer.'});
  sub('fine-tuning','adapt','Fine-tuning','Use suitable labeled training data for an evaluated stable behavior/task need when supported prompting is insufficient.','Consistent domain behavior with a demonstrated quality gain.','Daily private-document refresh and citations are not implemented merely by changing weights.',{capability:'Eligible Bedrock model customization or SageMaker training according to support/control needs.'});
  sub('continued-pretraining','adapt','Continued pre-training','Adapt eligible models on suitable unlabeled domain text where the model/feature supports it; evaluate against the original baseline.','Domain adaptation differs from supervised instruction examples.','This option is model-specific and not a real-time source lookup.',{capability:'Supported continued pre-training or an appropriate controlled training workflow.'});
  sub('datasets','lifecycle','Datasets / splits','Version approved training/tuning data and separate representative held-out evaluation data with source/tool references.','Preserve expert labels and rare/critical cohorts.','Tuning on the held-out final test invalidates its independence.');
  sub('lifecycle-evaluate','lifecycle','Evaluate / human gates','Measure quality, correctness, faithfulness, safety, latency, and cost; use calibrated automated/judge checks and accountable human review where needed.','Critical regression blocks promotion even when averages improve.','Human review and automated evaluation complement each other; neither is automatically infallible.',{capability:'Supported Bedrock evaluations, deterministic checks, expert review, and approval workflows.'});
  sub('deploy','lifecycle','Deploy / invoke','Release a compatible approved model/prompt/retrieval configuration with version attribution and rollback.','Control serving infrastructure only when required.','A registered artifact does not automatically update an endpoint.');
  sub('capacity','deploy','Capacity / routing','Separate intermittent on-demand use, measured reserved capacity, and eligible cross-Region routing.','Stable demand and approved processing destinations are different constraints.','An inference profile does not independently fail over the source application or provide chosen GPU controls.',{capability:'Eligible on-demand / Provisioned Throughput / inference profiles; SageMaker endpoint capacity where required.',read:'#inference-modes'});
  sub('monitor','lifecycle','Monitor / improve','Correlate production versions and outcomes, turn failures into regressions, and roll back critical degradation.','Quality drift and failed tool outcomes need more than uptime metrics.','A monitoring chart does not itself generate calibrated quality scores.');
  sub('lambda','orchestration','One bounded task → Lambda','Run a bounded operation and externalize durable state. Split long waits into an appropriate workflow/job.','Short stateless adapter, validation, or lookup.','Warm execution memory is not a guaranteed persistent service lifecycle.',{capability:'AWS Lambda; provisioned concurrency targets initialization, reserved concurrency targets allocation/caps.'});
  sub('step-functions','orchestration','Known durable workflow → Step Functions','Developers define states, retries, branches, and approval waits. Bounded Bedrock/tool tasks can sit inside the workflow.','Known sequence + durable state + hours-long approval.','Model-selected autonomy is not needed just because a process is complex.',{managed:'Standard workflows retain execution state and support appropriate callback/recovery patterns.',extension:'Invoke bounded tasks and approved integrations under scoped roles.',ownership:'Own the explicit state definition, approval identity/deadline, and idempotent external actions.',capability:'AWS Step Functions Standard where the durability/integration contract fits.',read:'#step-functions'});
  sub('agents','orchestration','Model chooses next tool → Agent','The model reasons over observations to choose among permitted actions. Bound tools, time, iterations, tokens, and write authority.','The next tool cannot be expressed as a known fixed sequence.','Framework/runtime choice does not supply business authorization.',{capability:'Bedrock Agents or an appropriate framework such as Strands; eligible runtime/tool hosting as needed.'});
  sub('events','orchestration','Decouple / buffer → Events / SQS','EventBridge routes events to targets; SQS retains work for paced consumers. These can support ingestion or runtime jobs.','Independent event consumers differ from a worker buffer under a fixed model rate.','Queues do not automatically implement token-rate admission.',{capability:'EventBridge rules/targets; SQS with bounded/rate-controlled workers, retry/DLQ, and idempotency.',read:'#business-events'});
  sub('mcp','orchestration','Tool runtime / MCP hosting','Match each tool’s duration, dependencies, connection lifecycle, and compute needs. Use a persistent service only when it is required.','Long-lived compatible CPU service differs from a short DynamoDB lookup.','External session state alone does not force every handler into containers.',{capability:'Lambda for bounded handlers; eligible ECS/Fargate services for persistent CPU runtimes.'});
  sub('authentication','security','Authentication / IAM','Identify the caller and evaluate allowed AWS actions/resources using the applicable policies and explicit denies.','Who is calling differs from which customer record they may use.','An ingestion role’s source access is not every end user’s document permission.',{capability:'Cognito/federation + IAM; application/data authorization for business scope.'});
  sub('tenant','security','Tenant isolation / retrieval filtering','Derive scope from trusted identity; enforce permitted document access before context and business access before tool writes.','Tenant A must never receive tenant B’s passages.','A high similarity score or a Guardrail does not grant access.',{managed:'Supported store/Knowledge Base filters help enforce configured scope; identity APIs establish the caller.',extension:'Backend ACL checks and trusted metadata filters bind retrieval to caller entitlement.',ownership:'Own caller-to-document mapping, fail-closed metadata handling, and bypass-path tests.',capability:'IAM plus application/data authorization and supported retrieval filters.'});
  sub('kms','security','KMS / encryption','Protect source, intermediate, vector, result, state, and log copies with required encryption and key access.','Inventory derived copies rather than protecting only original S3 objects.','Encryption does not authorize a tenant or prove deletion.',{capability:'AWS KMS, service encryption configuration, TLS, and controlled key policies.'});
  sub('private-network','security','VPC / PrivateLink','Use eligible interface endpoints, private DNS, endpoint policies, and network controls for the required private API path.','API traffic must stay on the approved private path.','A private subnet alone is not a private service endpoint.',{capability:'Supported VPC endpoints / AWS PrivateLink and configured network/endpoint policies.'});
  sub('guardrails','security','Guardrails / content safety','Apply supported content, sensitive-information, and grounding policies at the interaction stages they cover.','Harmful content and unsupported claims need the appropriate safety check.','Guardrails is not authorization or a guarantee against every indirect/tool-result injection.',{capability:'Supported Amazon Bedrock Guardrails policies plus deterministic application checks.'});
  sub('pii','security','PII / sensitive copies','Locate where PII exists, choose discovery/detection/filtering for that location, and verify required transformation/retention.','S3 discovery → Macie; supported text pipeline → Comprehend; model interaction → Guardrails.','Detecting sensitive spans does not sanitize every index, log, or backup.',{capability:'Macie / Comprehend / Guardrails at their respective boundaries.'});
  sub('governance','security','Permission ceilings / residency / retention','Use applicable organizational/identity ceilings and approved processing destinations; manage retention and deletion of derived copies.','Local IAM allow cannot override an applicable explicit SCP deny.','Permission ceilings do not grant access; private encrypted transport does not establish residency.',{capability:'SCPs / permissions boundaries, supported endpoint/profile policy, configuration/audit controls.',read:'#retention-privacy'});
  sub('recall','evaluation','Recall / precision','Recall assesses required-evidence coverage; precision/relevance assesses retrieval noise. Inspect actual candidates/context as well as scores.','Missing relevant passage differs from too many irrelevant passages.','Good retrieval does not guarantee faithful generation.');
  sub('quality','evaluation','Correctness / faithfulness / relevance','Correctness compares with references, faithfulness checks source support, and relevance checks whether the response answers the question.','Correct evidence with an unsupported claim → faithfulness/context-use investigation.','A real citation or valid JSON does not prove source support.');
  sub('evaluators','evaluation','Automated / judge / human','Use deterministic checks for objective contracts, calibrated judges for semantic scale, and experts for labels/high-risk nuance.','Thousands of rubric-scored answers with a limited expert sample → calibrated judge plus targeted human review.','BLEU/ROUGE overlap is not semantic truth; judge scores can be biased or wrong.');
  sub('performance','evaluation','Safety / latency / cost','Assess critical cohorts, actual tool outcomes, first-token/total/queue latency, and tokens/cost per successful outcome.','Faster first text differs from lower total generation time.','The cheapest invocation can be expensive per successful task if it fails or retries.',{read:'#inference-modes'});
  sub('caching','evaluation','Repeated work / caching','Identify the reusable unit: exact scoped result, semantically equivalent answer, or supported identical prompt prefix.','Stable system prefix with new answers → prompt caching.','A prompt cache is not response reuse; response cache keys must include scope and version.',{capability:'Eligible Bedrock prompt caching; scoped application result caches where valid.',read:'#cost-patterns'});
  sub('rollout','evaluation','Release / rollout','Offline gates precede controlled exposure. Canary limits live exposure; A/B compares live outcomes; shadow compares isolated copied requests.','Candidate output must not reach users and writes must not occur → isolated shadow.','Hiding the candidate answer does not suppress production tool side effects.',{read:'#quality-gate-decisions'});
  sub('diagnostics','evaluation','Review / diagnose','Review a whole path forward to understand its responsibilities. Choose an observed symptom to investigate backwards through earlier boundaries.','Find the first demonstrated inconsistency using versioned inputs, metrics, traces, and actual outputs.','Do not debug training loss for a routing defect, rerank an absent chunk, or use Guardrails as tenant authorization.');
  sub('metrics','observability','CloudWatch metrics / alarms','Track token counts, latency distributions, throttles/errors, queue age, and emitted quality/outcome signals.','Operational threshold on InputTokenCount → metric alarm.','Cost Explorer analyzes billing and Budgets alerts; neither is this runtime metric alarm.',{capability:'CloudWatch metrics/alarms; configured custom application signals.'});
  sub('audit','observability','CloudTrail caller audit','Record required AWS API activity with the appropriate event coverage; correlate caller, time, and operation.','Who invoked or changed an AWS resource?','Caller audit events are not the complete model input/output record.',{capability:'AWS CloudTrail with required event coverage/selectors.'});
  sub('content-logs','observability','Invocation / application logging','Explicitly enable supported interaction-content logging where policy allows; protect destinations, retention, and sensitive inputs.','Need the actual prompt and answer rather than only the caller.','Logging is not enabled by assuming CloudTrail; logs can retain sensitive pre-masking input.',{capability:'Bedrock Model Invocation Logging to protected CloudWatch Logs / S3, plus scoped application/tool logs.'});
  sub('traces','observability','Spans / agent / tool traces','Instrument retrieval, model, and tool boundaries; retain relevant workflow/agent events and correlate them with request/version identity.','Which stage consumed eight seconds or caused the tool failure?','Uninstrumented stages and hidden model internals do not automatically become visible.',{capability:'X-Ray / OpenTelemetry, emitted agent traces, tool logs, and workflow history.'});
  sub('training-records','datasets','Training records / task format','Validate model-specific schemas, input/output alignment, labels, duplicate examples, and cohort coverage before a training job.','Clean task examples matter more than raw record count.','A successful schema check does not prove label correctness or prevent data leakage.',{capability:'Approved S3 datasets; Glue quality/preparation and model-specific validation.',read:'#preprocessing'});
  sub('training-config','fine-tuning','Training configuration','Verify the supported base model/method, tokenizer and sequence format, learning rate, epochs, batch configuration, and available compute.','Loss diverges after a learning-rate change → inspect the training configuration and data.','More epochs or a higher learning rate is not a universal fix.',{capability:'Eligible Bedrock customization settings or SageMaker training configuration.'});
  sub('training-runs','fine-tuning','Training / validation curves','Compare available training and validation metrics over time, plus held-out task outputs; retain the job, dataset, configuration, and checkpoint versions.','Training improves while held-out behavior worsens → investigate generalization, leakage, and overfitting.','Low training loss is not proof of useful or safe production behavior.',{capability:'Bedrock customization output metrics where available; SageMaker training logs/metrics.'});
  sub('checkpoint','fine-tuning','Checkpoint / generalization','Choose an artifact using independent task evaluation and critical-cohort gates, not merely the final epoch or lowest training loss.','Original model beats the tuned candidate on held-out tasks → stop promotion and inspect the adaptation/data.','A final training checkpoint is not automatically the best release.',{read:'#evaluation'});
  sub('lora','fine-tuning','LoRA / parameter-efficient tuning','Train low-rank adapter weights while the base weights remain frozen. An unmerged adapter still needs its compatible base model at inference.','Task adaptation with a smaller trainable artifact → evaluate supported LoRA.','LoRA is a fine-tuning technique, not RAG, a standalone foundation model, or a guarantee of higher quality.',{managed:'Eligible SageMaker customization and compatible serving capabilities support adapter workflows; check the selected model/runtime contract.',extension:'Use supported adapter training and serving integration rather than assuming arbitrary hot-swapping.',ownership:'Version and evaluate the adapter together with its base model, tokenizer, and serving configuration.',capability:'Supported LoRA training; compatible SageMaker adapter inference components where applicable.',read:'#wording-reflex'});
  sub('lora-rank','lora','Rank / scaling / dropout','Rank changes adapter capacity and resource use; scaling and dropout alter the training behavior. Tune with representative validation rather than a universal setting.','Insufficient adaptation capacity differs from memorization or bad labels.','Increasing rank does not repair wrong supervision and does not always improve generalization.');
  sub('lora-artifact','lora','Adapter / base compatibility','Track the exact base revision, adapter artifact, tokenizer/template, and supported serving format together. Check whether the adapter is merged or separately loaded.','Small adapter file exists, but the request behaves like the base → check loading and routing.','An adapter is not a complete model; matching a model-family name alone is insufficient.');
  sub('registry','deploy','Version / approval / Model Registry','Record approved versioned artifacts, metrics, lineage, and rollback targets. Keep approval separate from the explicit deployment action.','Approved model package, unchanged live output → inspect endpoint deployment and request routing.','Model Registry approval does not update an endpoint or load a LoRA adapter.',{capability:'SageMaker Model Registry plus a governed deployment workflow.',read:'#wording-reflex'});
  sub('lora-serving','deploy','LoRA serving / adapter routing','Deploy the compatible base and selected adapter through a supported runtime. Verify the adapter identity actually invoked, loading status, authorization, and version attribution.','Multiple task adapters share a base, but one tenant gets the wrong behavior → inspect adapter routing and access.','Generic endpoint updates, merged-model releases, and adapter inference components have different deployment contracts.',{capability:'Compatible SageMaker adapter inference components or supported container adapter serving.',read:'#wording-reflex'});
  sub('deployment-check','deploy','Verify live release / rollback','Check actual endpoint/component readiness and send a version-attributed smoke request through the real application route. Verify rollback restores a compatible full release.','Offline candidate passes but live behavior is old → inspect deployed identity and route.','Artifact registration or a completed update request is not proof that the intended version serves users.',{read:'#wording-reflex'});
  sub('generation-config','model','Generation / context configuration','Check actual token limits, stop sequences, sampling configuration, supported API fields, tokenizer/template, and context truncation.','Answer cuts off or differs from evaluation → inspect the actual inference payload/configuration.','Lower temperature does not repair missing knowledge, a wrong adapter, or lost context.',{read:'#model-prompt-decisions'});
  sub('quantization','model','Quantization / serving fit','Reduce weight precision where the model/runtime supports it; measure memory, latency, and critical task quality on the target serving configuration.','A memory footprint requirement points to serving/model representation, not chunk size.','Smaller weights are not automatically faster or equally accurate; adapter/runtime compatibility still matters.',{capability:'Supported model/runtime quantization with measured endpoint benchmarks.',read:'#cost-patterns'});
  sub('distillation','adapt','Distillation','Train an eligible smaller student from teacher-generated behavior using a supported workflow and representative tasks. Compare held-out quality, latency, and cost.','Reduce serving cost for a defined task while preserving measured quality.','Distillation is different from quantizing the same model or attaching a LoRA adapter.',{capability:'Eligible Bedrock distillation or a controlled SageMaker training workflow.',read:'#cost-patterns'});
  sub('admission','user','Token admission / queueing','Inspect accepted request/token volume, queue age, timeouts, quotas, and team scope; pace accepted work against the real model capacity.','429s or long queue waits under bursts → examine admission and capacity before tuning prompts.','API request throttles, worker concurrency, and billing alerts are not interchangeable token-budget controls.',{read:'#cost-patterns'});
  sub('tool-validation','agents','Tool arguments / business validation','Inspect the chosen tool and its parameters, caller scope, preconditions, approvals, and authoritative outcome. Reject invalid writes before execution.','Valid JSON but unauthorized or invalid action → deterministic authorization/business validation.','Schema conformance is not permission or transaction correctness.',{read:'#serverless-vs-containers'});
  sub('recovery','events','Retries / idempotency / reconciliation','Correlate retries and duplicate deliveries with durable work identity, execution state, DLQs, and the authoritative business record.','Timeout followed by duplicate payment → inspect idempotency and result reconciliation.','A model response or queue acknowledgment does not prove a side effect completed exactly once.',{read:'#step-functions'});
  const cards = [
    ['lifecycle','lifecycle','Select → Adapt/train → Evaluate → Deploy → Monitor','Bedrock / SageMaker • evaluated releases'],
    ['source','data','Approved inputs','S3 • documents • databases • media'],
    ['preprocess','data','Preserve meaning','Textract • Transcribe • Glue • Comprehend'],
    ['ingestion','data','Searchable evidence','Parse • chunk • embed • index'],
    ['store','data','Indexed knowledge','Bedrock KB / OpenSearch'],
    ['user','runtime','Trusted request','API Gateway • identity • admission'],
    ['retrieval','runtime','Find permitted evidence','Vector • lexical • hybrid • rerank'],
    ['prompt','runtime','Assemble context','Prompts • evidence • history'],
    ['model','runtime','Generate / reason','Bedrock / SageMaker AI'],
    ['response','runtime','Validate / deliver','Sync • stream • async • batch'],
    ['orchestration','controls','Who controls progress?','Lambda • workflows • events • agents'],
    ['security','controls','Trust at every boundary','IAM • KMS • isolation • Guardrails'],
    ['evaluation','controls','Quality and diagnosis','Recall • quality • safety • latency • cost'],
    ['observability','controls','Evidence of what happened','CloudWatch • CloudTrail • logs • spans']
  ];
  const majorIds = new Set(cards.map(card=>card[0]));
  const children = id => [...concepts.values()].filter(concept=>concept.parent===id);
  const lineage = id => {
    const result=[];
    for(let item=concepts.get(id);item;item=concepts.get(item.parent)) result.unshift(item);
    return result;
  };
  const field = (id,key) => {
    for(let item=concepts.get(id);item;item=concepts.get(item.parent)) if(item[key])return item[key];
    return '';
  };
  const major = id => lineage(id).find(item=>majorIds.has(item.id))?.id || null;
  let selected='system', mode='mental', zoom=1, diagnosing=false, managed=null, extension=null, panelOpen=false;
  let portrait=window.matchMedia('(max-width:600px)').matches;
  // Each route is a sequence of evidence boundaries; reverse it to investigate an outcome.
  const step=(id,label,evidence,rule)=>({id,label,evidence,rule});
  const diagnosticPaths={
    rag:{title:'RAG / evidence → answer',summary:'Find where approved evidence first disappeared, changed meaning, became inaccessible, or stopped supporting the answer.',steps:[
      step('source','Source','Compare the authoritative object, version, permission, and required passage with the failing question.','If the fact is absent or stale at source, downstream ranking cannot create it.'),
      step('preprocess','Preprocess','Compare extraction/transcription output against the original tables, qualifiers, and identifiers.','Repair missing meaning before changing vector size or model weights.'),
      step('parse','Parse','Inspect the actual text and structure entering the chunker.','An extraction defect is earlier than a chunk-boundary defect.'),
      step('chunk','Chunking','Inspect the units containing the answer and its exceptions; check boundaries and overlap.','Use a supported chunking strategy or ingestion extension before replacing RAG.'),
      step('metadata','Metadata','Inspect source/version identifiers and trusted ACL fields attached to each required chunk.','Similarity cannot compensate for missing access or freshness metadata.'),
      step('embed','Document embedding','Check embedding model, dimensions/configuration, and measured recall on this corpus.','Matching dimensions are necessary, but the embedding spaces must also be compatible.'),
      step('index','Index','Confirm the exact current chunk/vector/metadata exists and synchronization succeeded.','Missing chunk → investigate ingestion; a reranker cannot recreate it.'),
      step('query','Query / scope','Inspect the real query, meaningful IDs, trusted tenant scope, and filters sent downstream.','Do not remove exact identifiers or loosen authorization to improve recall.'),
      step('query-embed','Query embedding','Compare query-vector generation with the indexed document-vector contract.','Changing the query model alone does not migrate the index.'),
      step('candidates','Candidates','Inspect the permitted pre-rerank candidates and whether the required evidence is present.','Indexed and permitted but absent here → investigate search/filtering/recall.'),
      step('reranker','Reranking','Compare before/after ordering, candidate input, top-k, and any removed relevant passages.','Present but poorly ordered → ranking; absent from input → upstream.'),
      step('best-context','Context selection','Inspect final passages, parent context, qualifiers, citations, and token-budget pruning.','A good candidate can still be lost before it reaches the model.'),
      step('prompt','Prompt','Inspect the exact assembled messages, source separation, task rules, and context truncation.','Correct evidence plus unclear instructions is not solved by another vector database.'),
      step('model','Model','Compare outputs on the same verified context with the baseline and actual generation settings.','Only blame model capability after validating the input and output contract.'),
      step('response','Answer / validation','Compare individual claims and citations against supplied evidence and the user requirement.','A valid citation or JSON shape is not proof of faithfulness or correctness.')
    ],symptoms:[['index','Required chunk is absent from the index'],['candidates','Indexed, permitted chunk never enters candidates'],['reranker','Correct candidate is present but ordered badly'],['prompt','Correct evidence reaches the model; answer is wrong']]},
    prompt:{title:'Prompt / model answer quality',summary:'First define what a correct answer means. Choose a suitable model, supply clear instructions and relevant context, then generate and validate. Output checks verify both format and the original task rules; valid JSON alone is insufficient.',steps:[
      step('user-query','Task definition','Inspect label meanings, output requirements, ambiguity, and representative boundary cases.','A persona does not define missing business rules.'),
      step('select','Model / task fit','Compare baseline performance, supported modality, context budget, and task requirements.','A public benchmark or larger model is not proof of task fit.'),
      step('system-instructions','Instructions','Check instruction priority, untrusted-source separation, refusal/escalation rules, and examples.','Prompt instructions cannot replace deterministic authorization.'),
      step('prompt-template','Template version','Compare the evaluated template/variables with the deployed version and rendered payload.','A saved prompt version is not necessarily the version actually invoked.'),
      step('retrieved-knowledge','Evidence','Verify the selected knowledge contains the required facts and qualifications.','Missing current facts usually require evidence, not style fine-tuning.'),
      step('conversation','History / state','Inspect included turns, authoritative state, permission scope, and trimming.','An inference API does not automatically retain every earlier turn.'),
      step('generation-config','Generation settings','Inspect actual token limits, stop sequences, sampling, template, and model/API settings.','Cut-off output differs from hallucination; low temperature is not a truth guarantee.'),
      step('response','Output contract','Check semantic correctness, factual support, schema, and actual business outcome separately.','Valid JSON can still encode an incorrect or unauthorized action.')
    ],symptoms:[['user-query','Labels or decision boundaries are ambiguous'],['conversation','Model forgets a previous user fact'],['generation-config','Answer ends early or changes after deployment'],['retrieved-knowledge','Current private fact is missing from the answer'],['response','JSON is valid, but the category or business decision is wrong']]},
    training:{title:'Fine-tuning / training quality',summary:'Work from held-out task behavior back through the artifact, training configuration, records, and adaptation choice. Loss is evidence, not the final goal.',steps:[
      step('select','Base model / baseline','Compare representative tasks with the untuned model and supported customization methods.','Fine-tuning is not automatically better than a suitable baseline.'),
      step('adapt','Adaptation choice','State whether the gap is instructions, changing facts, stable behavior, or domain adaptation.','Prompting, RAG, supervised tuning, and continued pre-training solve different gaps.'),
      step('datasets','Splits / lineage','Inspect dataset versions, provenance, duplicates, leakage, and representative critical cohorts.','Training and final test data must remain independent.'),
      step('training-records','Records / labels','Inspect model-specific format, input/output alignment, labels, and sensitive content.','More incorrectly labeled examples can reinforce the defect.'),
      step('training-config','Training configuration','Compare supported base/method, tokenizer, length/truncation, learning rate, epochs, and batch settings.','A configuration change must be evaluated; more epochs is not a universal fix.'),
      step('fine-tuning','Training execution','Check job status, actual configuration/data, permissions, logs, and produced artifact identity.','A completed job proves execution, not the desired behavior.'),
      step('training-runs','Learning curves','Compare available training/validation curves with held-out outputs and critical cohorts.','Improving training loss with worsening validation may indicate overfitting; also check data/split defects.'),
      step('checkpoint','Checkpoint selection','Compare candidate checkpoints with the baseline using independent task and safety gates.','The final epoch or lowest training loss is not automatically the best checkpoint.'),
      step('lifecycle-evaluate','Held-out evaluation','Inspect correctness, safety, task success, regressions, and relevant latency/cost.','A critical regression blocks promotion even if average quality improves.'),
      step('registry','Approved artifact','Check exactly which artifact/configuration passed the gate and was approved.','Approval does not deploy it.'),
      step('deployment-check','Live identity','Send an attributed smoke request through the real route; compare with the offline candidate.','If offline passes but live fails, inspect routing/version/serving before retraining.'),
      step('monitor','Production behavior','Compare observed cohort failures, task mix, drift, and versions with held-out evaluation.','Production regression starts an investigation or rollback, not automatic retraining.')
    ],symptoms:[['training-runs','Training improves but validation degrades'],['training-records','Tuned model learns inconsistent labels'],['datasets','Excellent test score collapses on new examples'],['deployment-check','Offline candidate passes; production behaves like the old model']]},
    adapters:{title:'LoRA / adapter release',summary:'An adapter release depends on its compatible base, evaluated artifact, serving integration, and actual request route. Start from live behavior and verify each identity.',steps:[
      step('select','Compatible base','Identify the exact supported base model/revision, tokenizer, and serving runtime.','A same-family model name does not prove adapter compatibility.'),
      step('datasets','Task examples','Check the versioned examples and held-out cohorts used to train and evaluate this adapter.','Small adapter artifacts do not reduce the need for good supervision.'),
      step('lora-rank','LoRA configuration','Inspect rank/scaling/dropout and training settings against validation results.','Higher rank is not a cure for wrong labels or leakage.'),
      step('lora','Adapter training','Confirm the intended base remained frozen and the expected adapter artifact was produced.','LoRA changes adapter weights; it is not retrieval or a standalone model.'),
      step('lora-artifact','Artifact / base pairing','Check adapter/base versions, tokenizer/template, artifact format, and merged versus unmerged status.','An unmerged adapter needs its compatible base at inference.'),
      step('lifecycle-evaluate','Release gate','Evaluate the actual base+adapter pair with the intended inference configuration and cohorts.','Evaluating a different base or template invalidates the release comparison.'),
      step('registry','Version / approval','Inspect registered artifact, approval, lineage, and rollback pair.','Registry approval does not load or hot-swap the live adapter.'),
      step('lora-serving','Load / route adapter','Inspect deployed base/component, adapter readiness, actual selected identity, and tenant entitlement.','Use the supported adapter-serving contract; generic model registration is insufficient.'),
      step('deployment-check','Live smoke / rollback','Compare attributed live requests with the approved pair; verify rollback restores the pair and route.','Base-like output can be a loading/routing defect, not failed training.'),
      step('monitor','Live adapter behavior','Correlate outcomes with adapter/base versions, task cohorts, loading failures, and request scope.','Aggregate endpoint metrics can hide one broken adapter or tenant route.')
    ],symptoms:[['lora-artifact','Adapter fails to load against the selected base'],['lora-serving','Request behaves as if the adapter is absent'],['registry','Adapter is approved, but live endpoint did not change'],['lora-rank','Increasing rank did not improve held-out quality']]},
    serving:{title:'Inference / latency / cost',summary:'Separate queue wait, initialization, model generation, transport buffering, and repeated work before choosing a performance capability.',steps:[
      step('select','Task / model fit','Compare measured quality, token use, latency, and cost across suitable supported models.','A smaller/faster model must still meet the task quality target.'),
      step('quantization','Representation / runtime','Benchmark supported precision and serving settings with the actual hardware/runtime and quality gates.','Lower precision does not guarantee lower end-to-end latency.'),
      step('deployment-check','Serving identity','Verify the intended model/container/component/configuration is ready and receiving requests.','An endpoint being reachable does not identify the release it serves.'),
      step('capacity','Capacity / routing','Inspect demand, quotas, utilization, scaling, approved destinations, and selected capacity mode.','Cross-Region routing, reserved capacity, and application failover are different controls.'),
      step('admission','Admission / queue wait','Measure accepted token demand, throttles, queue age, worker pacing, and tenant budgets.','Concurrency limits do not express every token-rate requirement.'),
      step('caching','Repeated work','Inspect exact scoped result reuse, compatible embedding reuse, or supported prompt-prefix hits.','Prompt caching does not reuse the complete answer.'),
      step('generation-config','Generation work','Inspect context/output token counts, stop limits, and actual generation configuration.','Longer output can dominate total latency even when the first token is fast.'),
      step('traces','Stage timings','Separate queue, initialization, retrieval, model first-token/generation, and transport spans.','Optimize the measured bottleneck; an uninstrumented hop is not proven fast.'),
      step('response','Delivery contract','Check synchronous/streaming/background mode and buffering at every transport hop.','Streaming improves early delivery while the caller waits; it is not asynchronous completion.'),
      step('performance','User outcome / cost','Compare p95/first-token/total latency and cost per successful task across cohorts.','Low invocation cost can hide retries, failures, or poor task quality.')
    ],symptoms:[['admission','429s or long queue waits during bursts'],['response','Model streams, but browser receives one late response'],['traces','First token is fast, but total answer is slow'],['caching','Repeated prompt prefix incurs avoidable work']]},
    workflow:{title:'Agent / durable workflow / tools',summary:'Start from the authoritative business outcome. Trace validation, tool calls, state, retries, and the authority that chose each step.',steps:[
      step('user','Caller / requirement','Inspect trusted caller scope, requested business outcome, and job/delivery contract.','A natural-language request does not establish write authority.'),
      step('orchestration','Who chooses next?','Check whether transitions are known states, model-selected tools, or independently delivered events.','Complexity alone does not justify an agent.'),
      step('step-functions','Durable state / waits','Inspect applicable workflow history, state, retries, timeout, callback identity, and approval.','A model-generated plan is not durable execution state.'),
      step('agents','Tool choice','Inspect observations, allowed tools, chosen action, iteration/token limits, and scoped authority.','An agent framework does not grant permission or ensure correct business choices.'),
      step('tool-validation','Arguments / preconditions','Check parameter schema, tenant/business authorization, transaction rules, and required approval.','Valid JSON is not a valid or authorized transaction.'),
      step('mcp','Tool execution','Inspect tool logs, dependencies, runtime limits, errors, and the authoritative returned result.','A tool timeout does not prove its side effect failed.'),
      step('recovery','Recovery / duplicates','Check durable work identity, retries, DLQ, idempotency, and outcome reconciliation.','Repeated delivery must not cause a duplicate business write.'),
      step('response','Business outcome','Compare the claimed completion with the authoritative record and persisted job status.','A fluent answer or accepted job is not completed work.')
    ],symptoms:[['recovery','Retry causes a duplicate external write'],['tool-validation','Tool JSON is valid but the action is unauthorized'],['step-functions','Approval wait loses execution state'],['response','Agent claims success but business record is unchanged']]},
    security:{title:'Access / safety / sensitive copies',summary:'Identify the actual exposure boundary. Authorization, safety filtering, private transport, encryption, and retention protect different things.',steps:[
      step('authentication','Trusted identity','Inspect authentication context, effective roles/policies, and caller attribution.','Identity proves who called, not which tenant documents they may retrieve.'),
      step('tenant','Data / tool scope','Verify caller-to-resource entitlement, fail-closed metadata filters, and bypass paths before context or writes.','Guardrails cannot replace tenant authorization.'),
      step('private-network','Network path','Inspect actual DNS/endpoint/routing/policies and direct public bypass routes.','Private transport does not itself establish resource entitlement or allowed residency.'),
      step('kms','Encrypted copies','Check source, index, intermediate, job, and log encryption plus effective key access.','Encryption does not sanitize content or authorize a tenant.'),
      step('guardrails','Content / injection','Inspect untrusted document/tool inputs, applied safety checks, and deterministic output/business validation.','A content filter is not a transaction authorization boundary.'),
      step('pii','PII transformation','Check where sensitive spans exist and verify required masking/redaction actually happened.','Detection is not verified redaction.'),
      step('governance','Retention / destinations','Inventory source and derived copies, processing destinations, retention, deletion, and applicable policy ceilings.','Private encryption or not-used-for-training is not a complete residency/retention guarantee.'),
      step('content-logs','Observed exposure','Inspect safely scoped evidence of what reached users, tools, caches, and logs, with request/version identity.','Filtered output can coexist with sensitive pre-filter logs; protect every retained copy.')
    ],symptoms:[['tenant','Tenant A receives tenant B’s retrieved passage'],['content-logs','Masked answer is safe, but logs still contain PII'],['private-network','Private application still calls a public runtime path'],['governance','Deleted source content remains in derived copies']]}
  };
  const checkpointMeanings={
    source:'The original document or business record is the authority for the fact the assistant needs.',
    preprocess:'Preprocessing converts the original document, image, or audio into a usable representation without losing its meaning.',
    parse:'Parsing extracts text and structure, including table relationships, headings, and exceptions, before chunking.',
    chunk:'A chunk is a small searchable unit of a document. Its boundaries determine which facts and conditions stay together.',
    metadata:'Metadata describes a chunk: its source, version, identifiers, and which callers may access it.',
    embed:'A document embedding is a numeric representation used to find passages with related meaning.',
    index:'The index is the searchable copy of your chunks, vectors, and metadata. It can differ from the original source.',
    query:'The retrieval query carries the question, exact identifiers, and trusted access scope used to search the corpus.',
    'query-embed':'A query embedding represents the question numerically so it can be compared with document embeddings.',
    candidates:'Candidates are the passages the initial search actually returns. Only these passages are available to a downstream reranker.',
    reranker:'A reranker changes the order of passages already found by search, so the most useful evidence is selected first.',
    'best-context':'Context selection chooses which retrieved passages fit into the model request, including necessary conditions and source references.',
    prompt:'The prompt is the actual assembled request: instructions, the user question, evidence, and any conversation history.',
    model:'The model generates an answer from the context and settings it actually receives.',
    response:'The delivered result must satisfy the user’s request and be checked against evidence or the authoritative business outcome.',
    select:'Model selection means choosing a supported model that meets the actual task, quality, modality, latency, and cost requirements.',
    'user-query':'Task definition states exactly what to decide or produce, including the meaning of labels and boundary cases.',
    'system-instructions':'System instructions describe the task rules, authority boundaries, and how to handle insufficient or untrusted information.',
    'prompt-template':'A prompt template is the reusable, versioned structure into which the application inserts task-specific inputs.',
    'retrieved-knowledge':'Retrieved knowledge is the permitted source evidence included in the request to answer a question.',
    conversation:'Conversation context is the relevant earlier discussion and application state explicitly supplied with the current request.',
    'generation-config':'Generation settings control limits and behavior such as output length, stop sequences, and sampling. They do not establish factual truth.',
    adapt:'Adaptation chooses what needs changing: instructions, retrieved facts, model behavior, or domain learning.',
    datasets:'Dataset splits separate training examples, tuning/validation examples, and independent final tests. Lineage records where each version came from.',
    'training-records':'A training record pairs an input with the expected output or label. A label is the answer the model is being taught to produce.',
    'training-config':'Training configuration specifies how learning runs: supported method/base, data format, sequence length, learning rate, epochs, and batches.',
    'fine-tuning':'Fine-tuning trains a supported model on task examples to change learned behavior; it is separate from supplying facts through RAG.',
    'training-runs':'Learning curves show how training and, where available, validation error change as training progresses.',
    checkpoint:'A checkpoint is a saved training artifact. Different checkpoints can generalize differently even within the same training run.',
    'lifecycle-evaluate':'Held-out evaluation tests a candidate on representative examples it was not trained or tuned to memorize.',
    registry:'Artifact registration and approval record which version may be released. They do not perform the live deployment.',
    'deployment-check':'Live verification checks which model, adapter, prompt, and route actually serve a real application request.',
    monitor:'Production monitoring connects real task outcomes and failures to the versions and user groups that produced them.',
    'lora-rank':'LoRA rank controls the capacity of the small trainable adapter. Scaling and dropout also affect its training behavior.',
    lora:'LoRA learns small adapter weights while the base model stays frozen. The adapter modifies that compatible base model’s behavior.',
    'lora-artifact':'An unmerged LoRA adapter must be paired with the compatible base revision, tokenizer/template, and supported artifact format.',
    'lora-serving':'Adapter serving loads the intended base and adapter and routes each authorized request to the right pair.',
    quantization:'Quantization reduces the precision used to represent model weights. Its memory, speed, and quality effects depend on the serving setup.',
    capacity:'Capacity is the amount of inference work the configured service or endpoint can handle under its quotas and routing rules.',
    admission:'Admission controls which requests enter; queueing and worker pacing determine when accepted work reaches the model.',
    caching:'Caching reuses a specific kind of compatible work: an answer, an embedding, or a supported prompt prefix.',
    traces:'Stage timings measure where time was spent across queueing, initialization, retrieval, generation, and delivery.',
    performance:'Performance should be judged by usable outcomes: latency experienced by users, successful tasks, and the cost of producing them.',
    user:'The entry point establishes the caller, their permitted request, and whether they expect a live response or a durable background job.',
    orchestration:'Orchestration determines who controls the next action: explicit workflow states, model-selected tools, or event-driven workers.',
    'step-functions':'A durable workflow records progress through known steps, retries, timeouts, and approval waits.',
    agents:'An agent chooses tools using the task and observations, within the allowed actions and execution limits.',
    'tool-validation':'Tool validation checks arguments, caller permission, and business preconditions before an external action is allowed.',
    mcp:'Tool execution is the actual API or business operation. A returned error and the business record must be checked separately.',
    recovery:'Recovery reconciles uncertain results and retries. Idempotency prevents repeated delivery from repeating the same business action.',
    authentication:'Authentication establishes who is calling. Effective roles and policies determine their allowed AWS actions.',
    tenant:'Data and tool scope restrict the caller to the documents, records, and actions they are entitled to use.',
    'private-network':'A private network path uses the intended endpoint, DNS, routing, and policies rather than an unintended public route.',
    kms:'Encryption protects stored and transmitted copies; key policies determine who can use the encryption keys.',
    guardrails:'Content safety checks address harmful content and untrusted instructions. They are separate from document or transaction authorization.',
    pii:'PII handling detects sensitive personal information and applies the required verified masking, redaction, or retention rules.',
    governance:'Governance controls permitted processing locations, permission ceilings, retention, and deletion across original and derived copies.',
    'content-logs':'Exposure includes what reached users, tools, caches, and retained logs—not only the final answer shown on screen.'
  };
  const checkpointSymptoms={
    rag:{
      source:'The assistant gives an outdated policy, or the required fact is not present even in the current original document.',
      preprocess:'A scan or transcript looks readable, but a table column, exception, speaker turn, or identifier has disappeared.',
      parse:'The extracted text mixes table cells or drops headings, so the chunker receives an incomplete or misleading passage.',
      chunk:'The answer is split from its exception or section heading. A retrieved fragment looks correct but changes meaning without its neighbours.',
      metadata:'A passage has the wrong version or missing access tags; retrieval may return stale evidence or exclude permitted content.',
      embed:'Known paraphrases do not find their relevant documents, or the index rejects vectors after an embedding configuration change.',
      index:'The source contains the answer, but its corresponding current chunk is missing from the searchable index.',
      query:'Searching for an exact equipment ID returns similar products, or trusted access filters unexpectedly exclude the required document.',
      'query-embed':'Retrieval breaks or degrades after only the query embedding model or dimensions change; indexed documents still use the old settings.',
      candidates:'The right passage exists in the index and is permitted for this caller, but the initial search never returns it.',
      reranker:'The right passage was found, but less relevant passages rank above it. The answer may use the wrong evidence after selection.',
      'best-context':'The right passage is retrieved and ranked well, but it or its exception is removed to fit the model’s context budget.',
      prompt:'The needed evidence reaches the model, yet the answer ignores a condition, follows document instructions, or answers a different task.',
      model:'The verified request is complete and clear, but this model repeatedly fails the task while a suitable baseline handles it.',
      response:'The answer sounds plausible, but its claims are unsupported, its citations do not justify them, or it misses the requested result.'
    },
    prompt:{
      select:'The model struggles with the task or modality even on clear representative inputs; prompt changes do not resolve the limitation.',
      'user-query':'Similar examples receive inconsistent categories because nobody defined where one label ends and another begins.',
      'system-instructions':'The assistant invents an answer when evidence is missing or treats instructions inside a retrieved document as authoritative.',
      'prompt-template':'A tested prompt works offline, but the deployed application renders different instructions, variables, or examples.',
      'retrieved-knowledge':'The answer misses a current private fact because the supplied passages never contained that fact or its qualifying condition.',
      conversation:'The assistant forgets an earlier user fact because the relevant turn or application state was not included in the current request.',
      'generation-config':'The answer ends mid-sentence, stops at an unexpected string, or changes after deployment despite apparently identical instructions.',
      response:'The response fits the JSON schema but assigns the wrong category, invents a fact, or represents an invalid business action.'
    },
    training:{
      select:'The tuned model does not outperform the original model on the real task, or the selected base does not support the needed method.',
      adapt:'Weight changes fail to fix frequently changing facts or ambiguous instructions because those gaps required evidence or clearer task rules.',
      datasets:'Evaluation looks excellent on familiar examples but collapses on genuinely new cases or an underrepresented user group.',
      'training-records':'The tuned model learns inconsistent answers—for example, equivalent inputs are labeled “approve” in one record and “reject” in another.',
      'training-config':'Training becomes unstable or the model ignores important parts of examples after a learning-rate, length, or format change.',
      'fine-tuning':'The job fails, produces no usable artifact, or trains on a different dataset/configuration than the release was intended to use.',
      'training-runs':'Training error keeps falling while validation error or unseen-task failures increase: the model fits training examples without improving generalization.',
      checkpoint:'The last saved model performs worse on new examples than an earlier checkpoint or the original baseline.',
      'lifecycle-evaluate':'Average scores improve, but a critical safety case, task type, or user group regresses on independent examples.',
      registry:'The approved version does not match the artifact that passed evaluation, or the release lacks a clear compatible rollback target.',
      'deployment-check':'The candidate passes offline tests, but production still behaves like the old model or uses different inference settings.',
      monitor:'Quality falls after release for real users, particularly on inputs or cohorts unlike those in the evaluation set.'
    },
    adapters:{
      select:'The adapter cannot be used with the chosen base model or runtime, even though the model family name looks similar.',
      datasets:'The adapter learns the wrong task boundaries or fails a specialised cohort absent from its examples.',
      'lora-rank':'Increasing rank makes the adapter larger or more expensive, but held-out quality stays flat or gets worse.',
      lora:'The tuning job fails or produces an unexpected artifact; the assumed adapter-only training setup was not actually applied.',
      'lora-artifact':'Loading fails, or the adapter produces poor output when paired with a different base revision, tokenizer, or prompt format.',
      'lifecycle-evaluate':'The adapter passes one evaluation configuration but fails when combined with the actual base, template, or serving settings.',
      registry:'The new adapter is marked approved, yet users still receive the previous adapter’s behaviour because approval did not load it.',
      'lora-serving':'Requests behave like the unadapted base model or the wrong task adapter, despite a valid adapter artifact existing.',
      'deployment-check':'A live smoke request does not match the approved base/adapter pair, or rollback restores only part of the previous configuration.',
      monitor:'One adapter or tenant route degrades while overall endpoint health and average latency still look normal.'
    },
    serving:{
      select:'The application meets latency or price targets but fails the task, or a more expensive model adds no measured useful quality.',
      quantization:'The reduced-precision model fits memory but loses important task quality or shows no speed improvement on the target runtime.',
      'deployment-check':'The endpoint responds, but its output or timing differs from the intended model/container/configuration tested before release.',
      capacity:'Requests throttle or slow under load because demand exceeds available quota/capacity, or routing reaches an unapproved destination.',
      admission:'Users see 429 errors or long waits during bursts; accepted work accumulates faster than model capacity can process it.',
      caching:'Equivalent permitted work is repeated unnecessarily, or an incorrectly scoped cache returns stale or another tenant’s results.',
      'generation-config':'Answers generate far more tokens than needed, making total latency and cost high even when the first token arrives quickly.',
      traces:'The first token is fast but completion is slow, or total request time is high without evidence identifying which stage consumed it.',
      response:'The model emits tokens incrementally, but the browser receives one late response because a transport hop buffers them.',
      performance:'A cheap or fast invocation produces so many failed tasks or retries that users experience poor outcomes and higher total cost.'
    },
    workflow:{
      user:'The system accepts a request without verified scope, or returns a live success message for work that is still only queued.',
      orchestration:'A fixed approval process uses unpredictable model-selected actions, or a tool-selection task is forced into an unsuitable rigid sequence.',
      'step-functions':'A long approval wait loses progress, retries restart completed work, or a callback resumes the wrong execution.',
      agents:'The agent chooses an unsuitable tool, repeatedly loops, or attempts an action beyond the caller’s permitted scope.',
      'tool-validation':'The tool arguments are valid JSON, but the refund amount, account, permission, or transaction precondition is invalid.',
      mcp:'A tool times out or reports an error, but it is unclear whether the external business operation already completed.',
      recovery:'A retry or duplicate message creates a second payment, ticket, or other write for the same original request.',
      response:'The agent says the action succeeded, but the authoritative business record is unchanged or the durable job remains incomplete.'
    },
    security:{
      authentication:'The caller is unauthenticated, the effective identity differs from expectations, or an applicable policy denies the attempted AWS action.',
      tenant:'Tenant A receives tenant B’s passage or can request an action against a record it does not own.',
      'private-network':'An application in private subnets still invokes the public service endpoint, or a direct route bypasses the intended endpoint policy.',
      kms:'A required derived copy is unencrypted, or a supposedly authorised service cannot read it because key access is missing.',
      guardrails:'A harmful response or injected document/tool instruction reaches the model or an external action without the required checks.',
      pii:'Sensitive names or identifiers remain in an index, request, or result even though a detection job reported finding them.',
      governance:'Deleted source content remains in caches or indexes, retained copies outlive policy, or processing occurs in an unapproved location.',
      'content-logs':'The displayed answer masks personal information, but invocation logs, tool logs, or cached results still retain the original sensitive input.'
    }
  };
  let diagnosticPath='rag', checkpointId=null, diagnosisChoice='rag|review', reviewing=true;
  const currentPath=()=>diagnosticPaths[diagnosticPath];
  const currentTrace=()=>currentPath().steps;
  const traceIndex = () => {
    if(checkpointId){const exact=currentTrace().findIndex(item=>item.id===checkpointId);if(exact>=0)return exact;}
    const ids=lineage(selected).map(item=>item.id).reverse();
    for(const id of ids){const index=currentTrace().findIndex(item=>item.id===id);if(index>=0)return index;}
    return -1;
  };
  const positions = {
    wide:{lifecycle:[550,90],source:[110,300],preprocess:[310,300],ingestion:[510,300],store:[710,300],user:[110,520],retrieval:[310,520],prompt:[510,520],model:[710,520],response:[910,520],orchestration:[160,740],security:[420,740],evaluation:[680,740],observability:[940,740]},
    tall:{lifecycle:[300,80],source:[150,240],preprocess:[450,240],ingestion:[150,430],store:[450,430],user:[150,660],retrieval:[450,660],prompt:[450,850],model:[150,850],response:[300,1040],orchestration:[150,1300],security:[450,1300],evaluation:[150,1500],observability:[450,1500]}
  };
  const connections = {
    wide:[
      ['source','preprocess','M180 300 H240'],['preprocess','ingestion','M380 300 H440'],['ingestion','store','M580 300 H640'],
      ['store','retrieval','M710 360 V410 H310 V460'],['user','retrieval','M180 520 H240'],['retrieval','prompt','M380 520 H440'],
      ['prompt','model','M580 520 H640'],['model','response','M780 520 H840'],
      ['preprocess','lifecycle','M310 340 V260 H413 V155','lifecycle'],['lifecycle','model','M687 155 V235 H1025 V530 H710 V560','lifecycle']
    ],
    tall:[
      ['source','preprocess','M270 240 H330'],['preprocess','ingestion','M450 310 V335 H150 V360'],['ingestion','store','M270 430 H330'],
      ['store','retrieval','M450 500 V590'],['user','retrieval','M270 660 H330'],['retrieval','prompt','M450 730 V780'],
      ['prompt','model','M330 850 H270'],['model','response','M150 920 V944 H300 V970'],
      ['preprocess','lifecycle','M450 330 V210','lifecycle'],['lifecycle','model','M36 100 H16 V1010 H30','lifecycle']
    ]
  };
  const svgNS='http://www.w3.org/2000/svg';
  cards.forEach(([id,lane,role,service])=>{
    const button=document.createElement('button');
    button.type='button';button.className='gm-node';button.dataset.id=id;button.dataset.lane=lane;
    button.setAttribute('aria-controls','gm-panel');button.setAttribute('aria-pressed','false');
    const title=document.createElement('strong');title.textContent=concepts.get(id).title;
    const subtitle=document.createElement('span');subtitle.className='gm-role';subtitle.textContent=role;
    const aws=document.createElement('span');aws.className='gm-service';aws.textContent=service;
    button.append(title,subtitle,aws);button.addEventListener('click',()=>select(id));el('nodes').append(button);
  });
  const lifecycleSteps=[['select','Select'],['adapt','Customize / train'],['lifecycle-evaluate','Evaluate'],['deploy','Deploy / invoke'],['monitor','Monitor']];
  lifecycleSteps.forEach(([id,label])=>{
    const button=document.createElement('button');button.type='button';button.dataset.lifecycle=id;button.textContent=label;button.setAttribute('aria-controls','gm-panel');button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>select(id));el('lifecycle-steps').append(button);
  });
  function geometry(){
    const nextPortrait=window.matchMedia('(max-width:600px)').matches;
    if(nextPortrait!==portrait)zoom=1;
    portrait=nextPortrait;
    const width=portrait?600:1080,height=portrait?1800:940;
    const layout=positions[portrait?'tall':'wide'];
    const baseWidth=portrait?el('viewport').clientWidth:Math.max(760,el('viewport').clientWidth);
    const canvasWidth=baseWidth*zoom;
    el('canvas').style.setProperty('--gm-scale',String(canvasWidth/width));
    el('canvas').style.minWidth='0';el('canvas').style.width=`${canvasWidth}px`;el('canvas').style.height=`${canvasWidth*height/width}px`;
    el('viewport').style.maxHeight=zoom>1?(portrait?'65vh':'650px'):'';
    el('nodes').querySelectorAll('button').forEach(button=>{
      const [x,y]=layout[button.dataset.id];const nodeY=button.dataset.id==='lifecycle'?42:y+(portrait?160:100);button.style.left=`${x/width*100}%`;button.style.top=`${nodeY/height*100}%`;
    });
    el('lifecycle').style.left=`${(portrait?300:550)/width*100}%`;el('lifecycle').style.top=`${10/height*100}%`;
    el('connections').setAttribute('viewBox',`0 0 ${width} ${height}`);
    const frame=root.querySelector('.gm-scope-frame');
    Object.entries(portrait?{x:22,y:315,width:556,height:970}:{x:22,y:315,width:1016,height:375}).forEach(([name,value])=>frame.setAttribute(name,value));
    root.querySelector('.gm-scope-wire').setAttribute('d',portrait?'M300 1285 V1360 M150 1390 V1360 H450 V1390 M300 1360 V1560 M150 1590 V1560 H450 V1590':'M540 690 V750 M160 780 V750 H940 V780 M420 750 V780 M680 750 V780');
    const lanePositions=portrait?[17.2,40.33,72.89]:[34.05,57.37,75.85];
    ['data','runtime','controls'].forEach((lane,index)=>root.querySelector(`.gm-lane-${lane}`).style.top=`${lanePositions[index]}%`);
    const dataset=root.querySelector('.gm-edge-dataset'),deployment=root.querySelector('.gm-edge-model');
    dataset.style.top=portrait?'18%':'26%';dataset.style.left=portrait?'4%':'48%';
    deployment.style.top=portrait?'51.7%':'55.5%';deployment.style.right=portrait?'':'4.5%';deployment.style.left=portrait?'3%':'';
    if(portrait){dataset.style.writingMode='vertical-rl';deployment.style.writingMode='vertical-rl';}else{dataset.style.writingMode='';deployment.style.writingMode='';}
    el('edges').replaceChildren();
    connections[portrait?'tall':'wide'].forEach(([from,to,d,kind])=>{
      const path=document.createElementNS(svgNS,'path');path.classList.add('gm-edge');path.dataset.from=from;path.dataset.to=to;path.dataset.kind=kind||'flow';path.setAttribute('d',kind!=='lifecycle'?d.replace(/([MVH])([0-9]+)(?: ([0-9]+))?/g,(match,command,a,b)=>command==='H'?match:command==='V'?`V${Number(a)+(portrait?160:100)}`:`M${a} ${Number(b)+(portrait?160:100)}`):d);el('edges').append(path);
    });
    el('zoom-out').disabled=zoom<=0.75;el('zoom-in').disabled=zoom>=1.75;
    highlight();
  }
  function highlight(){
    const layer=major(selected);
    el('nodes').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.id===layer)));
    el('edges').querySelectorAll('path').forEach(path=>path.classList.toggle('is-active',path.dataset.from===layer||path.dataset.to===layer));
    const selectedIds=lineage(selected).map(item=>item.id);
    el('lifecycle').classList.toggle('is-active',layer==='lifecycle');
    el('lifecycle-steps').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(selectedIds.includes(button.dataset.lifecycle))));
    const pillarSelected=['orchestration','security','evaluation','observability'].includes(layer);
    root.querySelector('.gm-scope-frame').classList.toggle('is-active',pillarSelected);
    root.querySelector('.gm-scope-wire').classList.toggle('is-active',pillarSelected);
    renderDiagnostic();
  }
  function panToSelected(){
    const layer=major(selected);if(!layer)return;
    const button=el('nodes').querySelector(`[data-id="${layer}"]`);
    if(el('viewport').scrollWidth>el('viewport').clientWidth+2||el('viewport').scrollHeight>el('viewport').clientHeight+2){
      el('viewport').scrollTo({left:button.offsetLeft-el('viewport').clientWidth/2,top:button.offsetTop-el('viewport').clientHeight/2,behavior:'auto'});
    }
  }
  function tree(id,ancestors){
    const list=document.createElement('ul');
    children(id).forEach(item=>{
      const li=document.createElement('li');const button=document.createElement('button');button.type='button';button.dataset.concept=item.id;
      button.textContent=item.title;button.setAttribute('aria-pressed',String(item.id===selected));button.addEventListener('click',()=>{mode='study';select(item.id);});li.append(button);
      if(mode==='study'&&children(item.id).length){
        const details=document.createElement('details');details.open=ancestors.includes(item.id);
        const summary=document.createElement('summary');summary.textContent='Expand concepts';details.append(summary,tree(item.id,ancestors));li.append(details);
      }
      list.append(li);
    });
    return list;
  }
  function renderPanel(){
    const item=concepts.get(selected),path=lineage(selected),layer=major(selected);
    el('location').textContent=path.slice(1).map(item=>item.title).join(' → ')||'Whole application';
    el('breadcrumb').replaceChildren();
    path.forEach((item,index)=>{
      if(index){const separator=document.createElement('span');separator.textContent='›';separator.setAttribute('aria-hidden','true');el('breadcrumb').append(separator);}
      const button=document.createElement('button');button.type='button';button.textContent=item.id==='system'?'Whole map':item.title;button.addEventListener('click',()=>select(item.id));el('breadcrumb').append(button);
    });
    el('detail-title').textContent=item.title;el('summary').textContent=item.summary;
    el('subtree').replaceChildren();
    if(selected==='system'){
      const routes=[['embed','Ingestion → Embedding'],['reranker','Retrieval → Reranker'],['step-functions','Orchestration → Durable workflow']];
      routes.forEach(([id,label])=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{mode='study';select(id);});el('subtree').append(button);});
    }else{
      const owner=selected;
      if(children(owner).length)el('subtree').append(tree(owner,path.map(item=>item.id)));
    }
    el('model-references').hidden=!['lifecycle','model'].includes(layer);
    el('study-detail').hidden=mode!=='study';el('explore').hidden=mode==='study';
    el('reasoning').replaceChildren();
    const rows=[['Where is the problem?',path.slice(1).map(item=>item.title).join(' → ')||'Locate an architecture layer'],['What is the constraint?',field(selected,'constraint')],['What does AWS manage here?',field(selected,'managed')],['Is there a supported extension?',field(selected,'extension')],['Do I need custom ownership?',field(selected,'ownership')],['Which capability fits?',field(selected,'capability')]];
    rows.forEach(([label,text])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=text;el('reasoning').append(dt,dd);});
    el('clue').textContent=field(selected,'clue');el('trap').textContent=field(selected,'trap');
    el('reading').setAttribute('href',field(selected,'read'));
    const vectorIds=path.map(item=>item.id);el('vectors').hidden=!vectorIds.includes('embed');
    if(item.id.startsWith('dim-')){el('document-dim').value=item.id.slice(4);el('query-dim').value=item.id.slice(4);}
    vectorResult();
    el('ownership-context').textContent=`Apply the requirement to ${layer?concepts.get(layer).title:'one selected layer'}, then verify actual feature/model/store/Region support.`;
    ownershipResult();
    root.dataset.mode=mode;
    root.dataset.panelOpen=String(panelOpen);
    el('mental').setAttribute('aria-pressed',String(mode==='mental'));el('study').setAttribute('aria-pressed',String(mode==='study'));
    el('trace').hidden=!diagnosing;el('diagnose').setAttribute('aria-pressed',String(diagnosing));
    highlight();
  }
  function select(id){
    if(!concepts.has(id))return;
    selected=id;checkpointId=null;managed=null;extension=null;panelOpen=id!=='system';el('ownership').open=false;
    if(id==='diagnostics'){diagnosing=true;mode='study';}
    renderPanel();el('panel').scrollTop=0;panToSelected();
  }
  function vectorResult(){
    const documentDim=el('document-dim').value,queryDim=el('query-dim').value,match=documentDim===queryDim;
    el('vector-result').dataset.match=String(match);
    el('vector-result').textContent=`Document: ${documentDim}D ↔ Query: ${queryDim}D ${match?'✓ Dimension-compatible':'✗ Dimensions do not match'}`;
  }
  function ownershipResult(){
    root.querySelectorAll('[data-gm-managed]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.gmManaged===managed)));
    root.querySelectorAll('[data-gm-extension]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.gmExtension===extension)));
    el('extension-question').hidden=managed!=='no';
    let result='Custom requirement → managed support? → supported extension? → own only the remaining gap.';
    if(managed==='yes')result=`Use the managed capability. ${field(selected,'managed')}`;
    else if(managed==='no'&&extension==='yes')result=`Managed + supported extension. ${field(selected,'extension')} Keep unrelated stages managed.`;
    else if(managed==='no'&&extension==='no')result=`Own/customize this architecture layer. ${field(selected,'ownership')} Do not rebuild unrelated stages.`;
    else if(managed==='no')result='Check the supported extension contract for this layer before taking custom ownership.';
    el('ownership-result').textContent=result;
  }
  function renderDiagnostic(){
    const steps=currentTrace(),index=traceIndex(),item=steps[index];
    el('diagnostic-path').value=diagnosisChoice;
    el('path-summary').textContent=currentPath().summary;
    el('trace-steps').replaceChildren();
    el('trace-title').textContent=reviewing?'Review the path':'Diagnose backwards';
    el('direction-text').textContent=reviewing?'Follow the reasoning from inputs and task definition toward the result. Each card explains the stage and a failure to watch for.':'Start at the observed failure and move toward earlier causes. The arrows show investigation order, opposite to the forward review.';
    (reviewing?[...steps]:[...steps].reverse()).forEach(step=>{
      const button=document.createElement('button');button.type='button';button.textContent=step.label;button.dataset.checkpoint=step.id;
      button.setAttribute('aria-pressed',String(step===item));button.addEventListener('click',()=>selectCheckpoint(step.id));el('trace-steps').append(button);
    });
    el('upstream').textContent=reviewing?'Next stage →':'Check earlier cause →';
    el('upstream').disabled=reviewing?index<0||index>=steps.length-1:index<=0;
    el('checkpoint-title').textContent=item?item.label:'Select a checkpoint on this diagnostic path';
    el('checkpoint-meaning').textContent=item?checkpointMeanings[item.id]:'Choose a concept to understand what this boundary does.';
    el('checkpoint-symptom').textContent=item?checkpointSymptoms[diagnosticPath][item.id]:'Choose the failure you observed to see what it means and where to investigate.';
    el('checkpoint-evidence').textContent=item?item.evidence:'Choose an observed failure, then inspect the boundary evidence.';
    el('checkpoint-rule').textContent=item?item.rule:'This route is a set of checks, not a claim that every application uses every stage.';
    el('checkpoint-location').textContent=item?lineage(item.id).slice(1).map(concept=>concept.title).join(' → '):'Keep the overall architecture visible while investigating.';
  }
  function selectCheckpoint(id){
    select(id);checkpointId=id;panelOpen=false;root.dataset.panelOpen='false';renderDiagnostic();
  }
  function pathForSelection(){
    const ids=lineage(selected).map(item=>item.id),layer=major(selected);
    if(ids.includes('lora')||ids.includes('lora-serving'))return 'adapters';
    if(layer==='lifecycle')return 'training';
    if(layer==='prompt')return 'prompt';
    if(layer==='security')return 'security';
    if(layer==='orchestration')return 'workflow';
    if(['model','response','observability'].includes(layer)||['performance','caching'].includes(selected))return 'serving';
    return 'rag';
  }
  function setDiagnosticPath(id,entryId=null){
    diagnosticPath=id;diagnosing=true;mode='study';
    reviewing=!entryId||entryId==='review';
    const target=reviewing?currentTrace()[0].id:entryId;
    diagnosisChoice=`${id}|${reviewing?'review':target}`;
    selectCheckpoint(target);
  }
  Object.entries(diagnosticPaths).forEach(([id,path])=>{
    const group=document.createElement('optgroup');group.label=path.title;
    const overview=document.createElement('option');overview.value=`${id}|review`;overview.textContent=`${path.title} — review the whole path`;group.append(overview);
    path.symptoms.forEach(([entry,label])=>{const option=document.createElement('option');option.value=`${id}|${entry}`;option.textContent=`${path.title.split(' / ')[0]} — ${label}`;group.append(option);});
    el('diagnostic-path').append(group);
  });
  el('diagnostic-path').addEventListener('change',()=>{const [id,entry]=el('diagnostic-path').value.split('|');setDiagnosticPath(id,entry);});
  el('mental').addEventListener('click',()=>{mode='mental';diagnosing=false;select('system');});
  el('close-panel').addEventListener('click',()=>{panelOpen=false;root.dataset.panelOpen='false';});
  el('study').addEventListener('click',()=>{mode='study';renderPanel();});
  el('explore').addEventListener('click',()=>{mode='study';renderPanel();});
  el('diagnose').addEventListener('click',()=>{if(diagnosing){diagnosing=false;renderPanel();}else {setDiagnosticPath(pathForSelection());el('trace').scrollIntoView({block:'start',behavior:'auto'});}});
  el('upstream').addEventListener('click',()=>{const index=traceIndex(),next=index+(reviewing?1:-1);if(index>=0&&next>=0&&next<currentTrace().length)selectCheckpoint(currentTrace()[next].id);});
  el('zoom-in').addEventListener('click',()=>{zoom=Math.min(1.75,zoom+0.25);geometry();panToSelected();});
  el('zoom-out').addEventListener('click',()=>{zoom=Math.max(0.75,zoom-0.25);geometry();panToSelected();});
  el('fit').addEventListener('click',()=>{zoom=window.matchMedia('(max-width:600px)').matches?1:Math.min(1,el('viewport').clientWidth/760);geometry();el('viewport').scrollTo({left:0,top:0});});
  ['document-dim','query-dim'].forEach(id=>el(id).addEventListener('change',vectorResult));
  root.querySelectorAll('[data-gm-managed]').forEach(button=>button.addEventListener('click',()=>{managed=button.dataset.gmManaged;extension=null;ownershipResult();}));
  root.querySelectorAll('[data-gm-extension]').forEach(button=>button.addEventListener('click',()=>{extension=button.dataset.gmExtension;ownershipResult();}));
  root.querySelector('.gm-fallback').hidden=true;root.querySelector('.gm-interactive').hidden=false;
  renderPanel();geometry();
  let resizing=false;
  new ResizeObserver(()=>{if(resizing)return;resizing=true;requestAnimationFrame(()=>{geometry();resizing=false;});}).observe(el('viewport'));
})();
