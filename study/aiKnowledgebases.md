---
title: AI Knowledge Bases and Retrieval
permalink: /study/aiKnowledgebases
tag:
  - retrieval-augmented generation (RAG)
  - embeddings
  - vector search
  - lexical search
  - hybrid search
  - HNSW
  - IVF
  - reranking
  - retrieval evaluation
  - embedding migration
  - context pruning
---

# AI Knowledge Bases and Retrieval

**RAG** stands for **retrieval-augmented generation**: retrieve relevant information, augment the model context, then generate an answer. It can supply current, specific evidence when the sources and retrieval pipeline are current and reliable.

**Part 4 of 7:** [Models and providers](/study/aiModels) → **Knowledge bases and retrieval** → [AI Agents](/study/aiAgents). This page owns the quality of evidence selection and RAG answers; agent-loop and platform-release metrics come later.

<aside class="technique-callout">
  <strong>Keep this distinction</strong>
  <span><strong>RAG ≠ Vector Database.</strong> A vector database is one component that may support semantic retrieval. RAG is the larger architecture: retrieve external evidence, place it in the model context, then generate an answer.</span>
</aside>

Use **Northstar Device Care** as the running example. Northstar has a knowledge base containing millions of policy chunks covering products, countries, warranty versions, and repair rules. We will repeatedly ask: **“Can I replace my worn-out iPhone battery in Australia?”** One policy might be about Apple battery service, but the important idea is the scale: the application must find a small, permitted shortlist before an expensive relevance judge and the LLM see anything. The application—not the LLM—finds permitted evidence and supplies it to the LLM.

<div class="rag-diagram" role="img" aria-label="RAG has two separate lifecycles: asynchronous ingestion and per-request query processing.">
<svg viewBox="0 0 1120 555" xmlns="http://www.w3.org/2000/svg" aria-labelledby="rag-lifecycle-title rag-lifecycle-desc">
  <title id="rag-lifecycle-title">RAG ingestion and query lifecycles</title>
  <desc id="rag-lifecycle-desc">A separated ingestion pipeline turns an Apple policy PDF into indexed vectors and metadata when documents change. A per-request query pipeline retrieves authorized evidence, reranks it, and gives it to an LLM for a cited answer.</desc>
  <defs><marker id="life-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <rect class="panel" x="20" y="20" width="525" height="515" rx="12"/><rect class="panel" x="575" y="20" width="525" height="515" rx="12"/>
  <text class="accent-text" x="45" y="53">INGESTION / INDEXING — ASYNCHRONOUS</text><text class="small" x="45" y="74">When documents are added or updated; not for every question.</text>
  <text class="accent-text" x="600" y="53">QUERY / RUNTIME — PER REQUEST</text><text class="small" x="600" y="74">The application retrieves evidence before the LLM answers.</text>
  <g>
    <rect class="node data" x="45" y="91" width="205" height="38" rx="8"/><text class="label" x="147" y="116" text-anchor="middle">1. Raw sources</text>
    <rect class="node process" x="45" y="145" width="205" height="38" rx="8"/><text class="label" x="147" y="170" text-anchor="middle">2. Parse / extract</text>
    <rect class="node process" x="45" y="199" width="205" height="38" rx="8"/><text class="label" x="147" y="224" text-anchor="middle">3. Structured document</text>
    <rect class="node process" x="45" y="253" width="205" height="38" rx="8"/><text class="label" x="147" y="278" text-anchor="middle">4. Section-aware chunking</text>
    <rect class="node data" x="45" y="307" width="205" height="38" rx="8"/><text class="label" x="147" y="332" text-anchor="middle">5. Chunks + metadata</text>
    <rect class="node process" x="45" y="361" width="205" height="38" rx="8"/><text class="label" x="147" y="386" text-anchor="middle">6. Embedding model</text>
    <rect class="node store" x="45" y="415" width="205" height="38" rx="8"/><text class="label" x="147" y="440" text-anchor="middle">7. Vectors</text>
    <rect class="node store" x="45" y="469" width="205" height="48" rx="8"/><text class="label" x="147" y="491" text-anchor="middle">8. Searchable index</text><text class="small" x="147" y="508" text-anchor="middle">/ vector store</text>
    <path class="line" d="M147 131V143 M147 185V197 M147 239V251 M147 293V305 M147 347V359 M147 401V413 M147 455V467" marker-end="url(#life-arrow)"/>
  </g>
  <g>
    <rect class="node data" x="292" y="96" width="225" height="73" rx="8"/><text class="label" x="404" y="119" text-anchor="middle">Apple policy PDF</text><text class="small" x="404" y="138" text-anchor="middle">Battery Service → Australia</text><text class="small" x="404" y="155" text-anchor="middle">→ Eligibility</text>
    <path class="soft-line" d="M250 122H290" marker-end="url(#life-arrow)"/>
    <rect class="node" x="292" y="192" width="225" height="101" rx="8"/><text class="mono" x="307" y="216">chunk: “qualifies below 80%…”</text><text class="small" x="307" y="241">product=iPhone · region=AU</text><text class="small" x="307" y="260">status=current</text><text class="small" x="307" y="279">section=Eligibility</text>
    <path class="soft-line" d="M404 170V190" marker-end="url(#life-arrow)"/>
    <rect class="node store" x="292" y="319" width="225" height="74" rx="8"/><text class="mono" x="307" y="344">[0.12, -0.47, 0.81, …]</text><text class="small" x="307" y="370">stored with its metadata</text>
    <path class="soft-line" d="M404 294V317" marker-end="url(#life-arrow)"/>
  </g>
  <g>
    <rect class="node data" x="600" y="96" width="205" height="46" rx="8"/><text class="label" x="702" y="124" text-anchor="middle">1. User question</text>
    <rect class="node process" x="600" y="165" width="205" height="46" rx="8"/><text class="label" x="702" y="193" text-anchor="middle">2. Query processing</text>
    <rect class="node process" x="600" y="234" width="205" height="46" rx="8"/><text class="label" x="702" y="262" text-anchor="middle">3. Retrieval</text>
    <rect class="node guard" x="600" y="303" width="205" height="46" rx="8"/><text class="label" x="702" y="331" text-anchor="middle">4. Authorization</text>
    <rect class="node rank" x="600" y="372" width="205" height="46" rx="8"/><text class="label" x="702" y="400" text-anchor="middle">5. Reranking (optional)</text>
    <rect class="node process" x="600" y="441" width="205" height="46" rx="8"/><text class="label" x="702" y="469" text-anchor="middle">6. Context assembly</text>
    <path class="line" d="M702 142V163 M702 211V232 M702 280V301 M702 349V370 M702 418V439" marker-end="url(#life-arrow)"/>
    <rect class="node" x="853" y="215" width="210" height="60" rx="8"/><text class="label" x="958" y="240" text-anchor="middle">Searchable index</text><text class="small" x="958" y="259" text-anchor="middle">retrieval layer searches it</text><path class="line" d="M807 257H850" marker-end="url(#life-arrow)"/>
    <rect class="node rank" x="853" y="408" width="210" height="60" rx="8"/><text class="label" x="958" y="433" text-anchor="middle">LLM</text><text class="small" x="958" y="452" text-anchor="middle">receives assembled evidence</text><path class="line" d="M807 464H850" marker-end="url(#life-arrow)"/>
    <rect class="node store" x="853" y="489" width="210" height="37" rx="8"/><text class="label" x="958" y="513" text-anchor="middle">7. Cited answer</text><path class="line" d="M958 469V487" marker-end="url(#life-arrow)"/>
  </g>
</svg>
</div>

## Building the Searchable Knowledge Base

Before a question can retrieve anything, source material needs to become searchable. This is one continuous pipeline:

For the vector-based implementation in this walkthrough: **Raw file → Parse → Structure → Chunk → Embed → Store / Index**. A lexical-only index does not require embedding.

### Parsing

Parsing converts a source format into a representation the application can reliably process. For the fictional Apple PDF, that means preserving the document, title, heading hierarchy, sections, paragraphs and tables, plus source, version, and ACL/security metadata.

The useful output is not merely a wall of text. It can retain a path such as `Battery Service > Australia > Eligibility`, alongside `product=iPhone`, `region=AU`, and `status=current`.

<aside class="technique-callout">
  <strong>Parser warning</strong>
  <span><strong>Embeddings cannot recover structure or text discarded by the parser.</strong> If a table, heading, version, or access rule is lost here, later stages have nothing reliable to search or enforce.</span>
</aside>

### Chunking

A full document is usually too large and too broad to retrieve as one unit. Chunking makes small evidence units that can be found, cited, and fit into a model’s context. The boundary matters: splitting a sentence can separate a condition from its qualification.

<div class="rag-diagram" role="img" aria-label="Bad chunking splits an Apple battery eligibility sentence; good section-aware chunking preserves its heading and complete rule.">
<svg viewBox="0 0 760 255" xmlns="http://www.w3.org/2000/svg" aria-labelledby="chunk-title chunk-desc">
  <title id="chunk-title">Why section-aware chunking helps</title><desc id="chunk-desc">A bad chunk boundary separates the phrase below 80 percent from its condition. A good chunk uses the Battery Service, Australia, Eligibility hierarchy and keeps the full rule together.</desc>
  <rect class="panel" x="18" y="18" width="350" height="219" rx="12"/><text class="accent-text" x="40" y="48">BAD — BOUNDARY LOSES THE RULE</text>
  <rect class="node guard" x="40" y="68" width="306" height="55" rx="8"/><text class="label" x="55" y="92">Chunk 1</text><text class="small" x="55" y="111">“An iPhone battery qualifies when capacity is below”</text>
  <rect class="node guard" x="40" y="146" width="306" height="55" rx="8"/><text class="label" x="55" y="170">Chunk 2</text><text class="small" x="55" y="189">“80%, subject to diagnostic checks.”</text>
  <rect class="panel" x="392" y="18" width="350" height="219" rx="12"/><text class="accent-text" x="414" y="48">GOOD — STRUCTURE TRAVELS WITH TEXT</text>
  <text class="label" x="420" y="80">Battery Service</text><text class="small" x="435" y="103">└── Australia</text><text class="small" x="450" y="126">└── Eligibility</text>
  <rect class="node store" x="414" y="145" width="306" height="65" rx="8"/><text class="small" x="429" y="171">“An iPhone battery qualifies when capacity is</text><text class="small" x="429" y="190">below 80%, subject to diagnostic checks.”</text>
</svg>
</div>

Common strategies are deliberately different tools:

- **Fixed-size:** split by length; simple and predictable.
- **Overlap:** repeat a little surrounding text to reduce boundary loss.
- **Section-aware:** respect headings and sections.
- **Semantic:** split where a topic changes.
- **Parent-child:** retrieve a small child chunk, then provide its larger parent context.

Section-aware chunking is often a strong default for policies because the heading path becomes both context and retrieval metadata. It is not automatically best: tables, transcripts, and long narrative text may need another approach.

**Implementation boundary:** parent substitution is a retriever feature, not a universal property of a hierarchical document. Bedrock vector retrieval and Neptune GraphRAG differ here. A lost table layout needs a parser change before any chunking adjustment. See [Knowledge Bases configuration layers](/study/infrastructureAWSAiServices#kb-internals).

### Embeddings: representing meaning as vectors

During ingestion, an embedding model converts each prepared chunk's text to numbers. An **embedding** is a numerical representation useful for comparing semantic similarity—not a human-readable list of labels.

<div class="rag-diagram" role="img" aria-label="Two differently worded battery questions become nearby embedding vectors, illustrating semantic similarity.">
<svg viewBox="0 0 760 300" xmlns="http://www.w3.org/2000/svg" aria-labelledby="embed-title embed-desc">
  <title id="embed-title">Embedding intuition</title><desc id="embed-desc">Two phrases about battery replacement are passed through the same embedding model and become numerically similar vectors shown close together in a small vector space.</desc>
  <defs><marker id="embed-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <rect class="node data" x="28" y="35" width="270" height="56" rx="8"/><text class="small" x="163" y="59" text-anchor="middle">“Can I replace my worn-out battery?”</text>
  <rect class="node data" x="28" y="143" width="270" height="56" rx="8"/><text class="small" x="163" y="167" text-anchor="middle">“Battery replacement eligibility”</text>
  <rect class="node process" x="358" y="88" width="150" height="62" rx="8"/><text class="label" x="433" y="115" text-anchor="middle">Embedding</text><text class="small" x="433" y="134" text-anchor="middle">model</text>
  <path class="line" d="M300 63H355 M300 171H330V150H355" marker-end="url(#embed-arrow)"/>
  <rect class="panel" x="558" y="25" width="174" height="245" rx="12"/><text class="accent-text" x="575" y="51">VECTOR SPACE</text>
  <circle cx="620" cy="112" r="9" fill="#2563eb"/><text class="mono" x="575" y="137">[0.12, -0.47, 0.81, …]</text>
  <circle cx="647" cy="160" r="9" fill="#16a34a"/><text class="mono" x="575" y="185">[0.10, -0.45, 0.79, …]</text>
  <path class="soft-line" d="M620 112L647 160" stroke-dasharray="4 4"/><text class="small" x="575" y="226">similar meaning</text><text class="small" x="575" y="244">→ nearby vectors</text>
  <path class="line" d="M510 119H550" marker-end="url(#embed-arrow)"/>
</svg>
</div>

At query time, use a compatible model and its prescribed query/document encoding settings. Search compares vectors using a supported metric such as **cosine similarity**, **dot product**, or **Euclidean distance**. Match the metric and normalization to the model: these scores are not generally interchangeable. With unit-normalized vectors, dot product equals cosine similarity and squared Euclidean distance produces equivalent rankings. [Faiss metric guidance](https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances).

### Changing the embedding space {#embedding-migration}

A new visual style or vocabulary can reveal a domain coverage gap. First separate representation failure from missing ingestion, poor captions, incorrect filters, and low first-stage recall. Hybrid metadata matching can recover tagged items without changing the model. If the embedding model itself must adapt, use a supported customization path and evaluate held-out image–text or document–query pairs.

```text
New embedding version or dimension setting
                  ↓
Re-embed corpus → separate compatible index → evaluate recall + answers
                  ↑                                  ↓
        compatible query encoder            switch both together
                                            retain rollback pair
```

Do not mix unrelated model versions or dimensions in one similarity space. Re-embedding only new documents leaves the old catalogue incompatible unless the system explicitly maintains separate indexes and routing. Lower dimensions reduce raw vector bytes but can reduce retrieval quality; corpus size alone does not determine the right dimension. [Titan customization and dimension controls](/study/infrastructureAWSAiServices#bedrock-customization).

## How Can We Retrieve Relevant Information?

Retrieval is the act of finding evidence. Vector search is only one possible method.

| Method | Best At | Example |
| --- | --- | --- |
| Metadata / structured filter | Known attributes | `region=AU AND product=iPhone` |
| Lexical / BM25 | Exact words, IDs, errors | `POL-BAT-AU-2026` |
| Vector / semantic | Meaning despite different wording | “worn-out phone battery” |
| Hybrid | Exact + semantic requirements | policy ID + natural-language question |

<div class="rag-diagram" role="img" aria-label="Retrieval branches into metadata filtering, lexical BM25 search, and vector search, then combines candidates for optional reranking.">
<svg viewBox="0 0 760 310" xmlns="http://www.w3.org/2000/svg" aria-labelledby="retrieve-title retrieve-desc">
  <title id="retrieve-title">Retrieval methods can work together</title><desc id="retrieve-desc">Metadata filtering, lexical BM25, and semantic vector search produce candidates that can be combined in hybrid retrieval, reranked, and selected as the best chunks.</desc>
  <defs><marker id="retrieve-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <rect class="node process" x="285" y="20" width="190" height="46" rx="8"/><text class="label" x="380" y="49" text-anchor="middle">RETRIEVAL</text>
  <path class="line" d="M380 68V90H132V108 M380 90V108 M380 90H628V108" marker-end="url(#retrieve-arrow)"/>
  <rect class="node data" x="40" y="112" width="184" height="62" rx="8"/><text class="label" x="132" y="138" text-anchor="middle">Metadata</text><text class="small" x="132" y="157" text-anchor="middle">structured filter</text>
  <rect class="node process" x="288" y="112" width="184" height="62" rx="8"/><text class="label" x="380" y="138" text-anchor="middle">Lexical</text><text class="small" x="380" y="157" text-anchor="middle">BM25</text>
  <rect class="node store" x="536" y="112" width="184" height="62" rx="8"/><text class="label" x="628" y="138" text-anchor="middle">Vector</text><text class="small" x="628" y="157" text-anchor="middle">semantic search</text>
  <path class="line" d="M132 176V195H380V211 M380 176V211 M628 176V195H380" marker-end="url(#retrieve-arrow)"/>
  <rect class="node rank" x="285" y="215" width="190" height="42" rx="8"/><text class="label" x="380" y="242" text-anchor="middle">Hybrid candidates</text>
  <path class="line" d="M380 259V277" marker-end="url(#retrieve-arrow)"/><text class="small" x="400" y="276">optional reranker</text>
  <rect class="node store" x="285" y="282" width="190" height="25" rx="8"/><text class="label" x="380" y="300" text-anchor="middle">Best chunks</text>
</svg>
</div>

### Metadata filtering

If the application already knows structured attributes, filtering can dramatically reduce the search space:

~~~text
region = AU
product = iPhone
status = current
~~~

These example fields are **relevance filters**, not permission. `region=AU` may make a policy relevant. Authorization must instead use trusted caller identity and document ACLs or equivalent policy. A caller-supplied `user_has_access=true` flag is not proof of permission. Enforce access before evidence reaches a model, external reranker, or user-visible result.

### Lexical / BM25

Lexical search is best when the actual **word** matters: policy IDs, error codes, product names, exact phrases, and acronyms. Searching for `POL-BAT-AU-2026` should strongly favour that literal ID. Vector similarity may not be the best tool for this; lexical search is excellent.

BM25 ranks indexed terms; it does not by itself guarantee an exact identifier or phrase match. Tokenization/analyzers can split IDs and punctuation. Use a keyword field with an exact term filter for an identifier, or an appropriate phrase query for ordered text. [OpenSearch exact-term queries](https://docs.opensearch.org/latest/query-dsl/term/term/).

### Vector / semantic search

Vector search is best when **meaning** matters. A user might ask, “When will Apple service my worn-out battery?” while the policy says, “An iPhone battery qualifies for service when tested capacity is below 80%.” The words differ, but the intent is related. This is where embeddings help.

### Hybrid retrieval

Real systems often combine signals instead of betting on one technique. Metadata can constrain either or both searches; BM25 and vector search can each produce candidates; then a fusion method combines their ranks.

~~~text
BM25 candidates ────────┐
                        ├── Fuse / RRF ──→ Candidates
Vector candidates ──────┘
~~~

**Reciprocal Rank Fusion (RRF)** is a simple option: a result earns more credit when it ranks highly in either list, without requiring the BM25 and vector score scales to match. Hybrid retrieval can also combine normalized scores; RRF is one fusion method. [OpenSearch rank fusion](https://docs.opensearch.org/latest/search-plugins/search-pipelines/score-ranker-processor/).

## How Do We Search Millions of Vectors?

Now that vector search has a job, we can ask how it scales. Start with a **brute-force exact nearest-neighbour** baseline, which compares the query with every stored vector and selects the top K:

<div class="rag-diagram" role="img" aria-label="Exact nearest-neighbour search compares a query vector with every stored vector, scores similarities, sorts them, and returns Top K.">
<svg viewBox="0 0 760 145" xmlns="http://www.w3.org/2000/svg" aria-labelledby="exact-title exact-desc">
  <title id="exact-title">Exact nearest-neighbour search</title><desc id="exact-desc">Exact vector search compares a query against every stored vector, calculates similarity, sorts all results, and selects the top K. It is accurate but becomes expensive as the corpus grows.</desc>
  <defs><marker id="exact-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <rect class="node data" x="20" y="31" width="140" height="52" rx="8"/><text class="label" x="90" y="61" text-anchor="middle">Query vector</text>
  <rect class="node process" x="210" y="31" width="170" height="52" rx="8"/><text class="label" x="295" y="53" text-anchor="middle">Compare against</text><text class="small" x="295" y="72" text-anchor="middle">EVERY vector</text>
  <rect class="node process" x="430" y="31" width="135" height="52" rx="8"/><text class="label" x="497" y="61" text-anchor="middle">Similarity + sort</text>
  <rect class="node store" x="615" y="31" width="125" height="52" rx="8"/><text class="label" x="677" y="61" text-anchor="middle">Top K</text>
  <path class="line" d="M162 57H208 M382 57H428 M567 57H613" marker-end="url(#exact-arrow)"/><text class="small" x="380" y="118" text-anchor="middle">Accurate, but increasingly expensive as the corpus grows.</text>
</svg>
</div>

**ANN** means **Approximate Nearest Neighbour**. Methods such as HNSW and IVF reduce search work in exchange for possibly missing exact nearest neighbours. The speed/recall tradeoff depends on data and settings; it is not guaranteed to be small. Here, **ANN recall** means recovering neighbours from an exact-search baseline, which differs from retrieving documents a human judges relevant. Exact vector search is exact about the chosen metric, not about factual or semantic correctness. [Faiss index comparison](https://github.com/facebookresearch/faiss/wiki/Faiss-indexes).

<div class="rag-diagram" role="img" aria-label="Approximate nearest-neighbour search has HNSW graph navigation and IVF partitioning approaches.">
<svg viewBox="0 0 610 175" xmlns="http://www.w3.org/2000/svg" aria-labelledby="ann-title ann-desc">
  <title id="ann-title">Two ANN approaches</title><desc id="ann-desc">Approximate nearest-neighbour search can use HNSW to navigate a graph or IVF to search chosen partitions.</desc>
  <defs><marker id="ann-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <rect class="node rank" x="220" y="18" width="170" height="48" rx="8"/><text class="label" x="305" y="47" text-anchor="middle">ANN</text><path class="line" d="M305 68V88H145V104 M305 88H465V104" marker-end="url(#ann-arrow)"/>
  <rect class="node process" x="55" y="108" width="180" height="48" rx="8"/><text class="label" x="145" y="131" text-anchor="middle">HNSW</text><text class="small" x="145" y="148" text-anchor="middle">navigate graph</text>
  <rect class="node store" x="375" y="108" width="180" height="48" rx="8"/><text class="label" x="465" y="131" text-anchor="middle">IVF</text><text class="small" x="465" y="148" text-anchor="middle">partition / cluster</text>
</svg>
</div>

## HNSW: Navigate Through Neighbours

**HNSW** stands for **Hierarchical Navigable Small World**. Its mental model is: **navigate through vector space toward increasingly similar neighbours.** It is graph-based: upper layers make larger jumps, and lower layers refine the route.

<div class="rag-diagram" role="img" aria-label="A simplified HNSW hierarchy showing a query entering from an upper graph layer and navigating through neighbours toward a nearby candidate on layer zero.">
<svg viewBox="0 0 800 355" xmlns="http://www.w3.org/2000/svg" aria-labelledby="hnsw-title hnsw-desc">
  <title id="hnsw-title">HNSW navigates a graph</title><desc id="hnsw-desc">A query enters a sparse upper layer, follows edges toward more similar nodes, descends through layers, and reaches a close vector in the dense bottom layer.</desc>
  <defs><marker id="hnsw-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#2563eb"/></marker></defs>
  <text class="accent-text" x="35" y="43">HNSW — NAVIGATE</text><text class="small" x="35" y="64">Start coarse, then refine through closer neighbours.</text>
  <text class="label" x="35" y="118">Layer 2</text><path class="soft-line" d="M190 108H520"/><circle cx="190" cy="108" r="10" fill="#2563eb"/><circle cx="520" cy="108" r="10" fill="#2563eb"/>
  <text class="label" x="35" y="196">Layer 1</text><path class="soft-line" d="M150 186H280L430 186H610"/><circle cx="150" cy="186" r="10" fill="#64748b"/><circle cx="280" cy="186" r="10" fill="#64748b"/><circle cx="430" cy="186" r="10" fill="#64748b"/><circle cx="610" cy="186" r="10" fill="#64748b"/>
  <text class="label" x="35" y="274">Layer 0</text><path class="soft-line" d="M100 264H175L250 264H325L400 264H475L550 264H625L700 264"/><g fill="#64748b"><circle cx="100" cy="264" r="10"/><circle cx="175" cy="264" r="10"/><circle cx="250" cy="264" r="10"/><circle cx="325" cy="264" r="10"/><circle cx="400" cy="264" r="10"/><circle cx="475" cy="264" r="10"/><circle cx="550" cy="264" r="10"/><circle cx="625" cy="264" r="10"/></g><circle cx="700" cy="264" r="13" fill="#16a34a"/><text class="small" x="719" y="268">nearby</text>
  <path class="soft-line" d="M190 118V175 M520 118V175 M280 196V253 M610 196V253" stroke-dasharray="4 5"/>
  <circle class="step" cx="90" cy="90" r="13"/><text class="step-text" x="90" y="90">Q</text><path d="M103 92C140 91 160 100 180 105" stroke="#2563eb" stroke-width="3" fill="none" marker-end="url(#hnsw-arrow)"/><path d="M202 112C280 150 350 170 420 183" stroke="#2563eb" stroke-width="3" fill="none" marker-end="url(#hnsw-arrow)"/><path d="M440 190C520 225 600 250 688 262" stroke="#2563eb" stroke-width="3" fill="none" marker-end="url(#hnsw-arrow)"/>
  <text class="small" x="35" y="327">More search effort can improve recall; graph construction and memory use are trade-offs.</text>
</svg>
</div>

**Tune the stage that consumes resources:** `ef_search` changes query exploration; `ef_construction` changes graph-building effort; `m` changes connectivity and graph memory. More search effort can improve recall but adds latency. Shard distribution and available memory must support the index; adding shards without adding capacity can increase overhead. [OpenSearch HNSW controls](/study/infrastructureAWSAiServices#opensearch-hnsw-tuning).

## IVF: Find the Right Neighbourhood

**IVF** means **Inverted File Index**. Its mental model is: **find the right neighbourhood first, then search the houses.** It divides vector space into partitions (clusters), then searches the most promising ones.

<div class="rag-diagram" role="img" aria-label="IVF divides vectors into clusters, identifies query X as closest to Cluster C, then searches that and nearby partitions for Top K.">
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" aria-labelledby="ivf-title ivf-desc">
  <title id="ivf-title">IVF searches promising partitions</title><desc id="ivf-desc">Vectors are grouped into three partitions. Query X lies in or closest to Cluster C, so IVF searches Cluster C and nearby partitions rather than every vector.</desc>
  <defs><marker id="ivf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <text class="accent-text" x="35" y="42">IVF — DIVIDE AND CONQUER</text><text class="small" x="35" y="63">Partition the space, then search the likely neighbourhoods.</text>
  <g><rect class="panel" x="35" y="90" width="205" height="150" rx="12"/><text class="label" x="137" y="117" text-anchor="middle">Cluster A</text><g fill="#64748b"><circle cx="80" cy="150" r="7"/><circle cx="115" cy="160" r="7"/><circle cx="155" cy="147" r="7"/><circle cx="190" cy="174" r="7"/><circle cx="95" cy="202" r="7"/><circle cx="140" cy="194" r="7"/></g></g>
  <g><rect class="panel" x="298" y="90" width="205" height="150" rx="12"/><text class="label" x="400" y="117" text-anchor="middle">Cluster B</text><g fill="#64748b"><circle cx="345" cy="150" r="7"/><circle cx="385" cy="165" r="7"/><circle cx="430" cy="147" r="7"/><circle cx="465" cy="185" r="7"/><circle cx="350" cy="202" r="7"/><circle cx="410" cy="203" r="7"/></g></g>
  <g><rect class="node store" x="561" y="90" width="205" height="150" rx="12"/><text class="label" x="663" y="117" text-anchor="middle">Cluster C</text><g fill="#16a34a"><circle cx="610" cy="150" r="7"/><circle cx="650" cy="165" r="7"/><circle cx="700" cy="149" r="7"/><circle cx="725" cy="190" r="7"/><circle cx="615" cy="205" r="7"/><circle cx="675" cy="205" r="7"/></g><path d="M664 160L682 178M682 160L664 178" stroke="#e11d48" stroke-width="4"/><text class="small" x="691" y="176">Query X</text></g>
  <rect class="node data" x="48" y="281" width="160" height="46" rx="8"/><text class="label" x="128" y="309" text-anchor="middle">10,000,000 vectors</text><rect class="node process" x="295" y="281" width="198" height="46" rx="8"/><text class="label" x="394" y="309" text-anchor="middle">Find closest partitions</text><rect class="node store" x="580" y="281" width="170" height="46" rx="8"/><text class="label" x="665" y="301" text-anchor="middle">Search C + nearby</text><text class="small" x="665" y="318" text-anchor="middle">→ Top K</text><path class="line" d="M210 304H293 M495 304H578" marker-end="url(#ivf-arrow)"/>
</svg>
</div>

Searching more partitions (often called probes) generally improves recall, but costs more work. It is a knob, not a guarantee.

Neither index is universally better. Choose based on corpus size, latency and recall targets, update behaviour, memory budget, and the retrieval system around it.

IVF commonly needs representative data to train its partition centroids; HNSW builds a neighbour graph. Query-time search effort (`nprobe` for IVF, often `efSearch` for HNSW) is separate from index-construction settings. [Faiss index details](https://github.com/facebookresearch/faiss/wiki/Faiss-indexes).

## Reconnecting the Query-Time Pipeline

This is the retrieval layer’s final mental model. The LLM is downstream of retrieval; it does not independently search HNSW, IVF, or the vector store.

<div class="rag-diagram" role="img" aria-label="Query-time RAG pipeline from user question through query processing, constraints, BM25, vector ANN and structured retrieval, candidate fusion, reranking, context assembly, LLM and cited answer.">
<svg viewBox="0 0 850 690" xmlns="http://www.w3.org/2000/svg" aria-labelledby="query-title query-desc">
  <title id="query-title">Query-time retrieval pipeline</title><desc id="query-desc">A user question is processed and constrained by metadata and authorization. BM25, vector ANN, and structured retrieval form candidates which are fused, reranked, assembled as context, and passed to the LLM for a cited answer.</desc>
  <defs><marker id="query-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <rect class="node data" x="305" y="18" width="240" height="42" rx="8"/><text class="label" x="425" y="45" text-anchor="middle">1. User question</text><rect class="node process" x="305" y="85" width="240" height="42" rx="8"/><text class="label" x="425" y="112" text-anchor="middle">2. Query processing</text><rect class="node guard" x="270" y="152" width="310" height="50" rx="8"/><text class="label" x="425" y="178" text-anchor="middle">3. Metadata + authorization constraints</text><text class="small" x="425" y="194" text-anchor="middle">enforce access before context reaches the LLM</text><path class="line" d="M425 62V83 M425 129V150" marker-end="url(#query-arrow)"/>
  <path class="line" d="M425 204V225H150V244 M425 225V244 M425 225H700V244" marker-end="url(#query-arrow)"/>
  <rect class="node process" x="55" y="248" width="190" height="54" rx="8"/><text class="label" x="150" y="272" text-anchor="middle">BM25</text><text class="small" x="150" y="290" text-anchor="middle">exact words</text><rect class="node store" x="330" y="248" width="190" height="54" rx="8"/><text class="label" x="425" y="272" text-anchor="middle">Vector ANN</text><text class="small" x="425" y="290" text-anchor="middle">HNSW / IVF</text><rect class="node data" x="605" y="248" width="190" height="54" rx="8"/><text class="label" x="700" y="272" text-anchor="middle">Structured</text><text class="small" x="700" y="290" text-anchor="middle">API / SQL / filters</text>
  <path class="line" d="M150 304V330H425V350 M425 304V350 M700 304V330H425" marker-end="url(#query-arrow)"/><rect class="node rank" x="305" y="354" width="240" height="42" rx="8"/><text class="label" x="425" y="381" text-anchor="middle">4. Candidate fusion → Top K</text><rect class="node rank" x="305" y="421" width="240" height="42" rx="8"/><text class="label" x="425" y="448" text-anchor="middle">5. Reranking</text><rect class="node store" x="305" y="488" width="240" height="49" rx="8"/><text class="label" x="425" y="513" text-anchor="middle">Best 5–10 chunks</text><text class="small" x="425" y="530" text-anchor="middle">relevant, permitted evidence</text><rect class="node process" x="305" y="562" width="240" height="42" rx="8"/><text class="label" x="425" y="589" text-anchor="middle">6. Context assembly</text><rect class="node rank" x="305" y="629" width="240" height="42" rx="8"/><text class="label" x="425" y="656" text-anchor="middle">7. LLM → cited answer</text><path class="line" d="M425 398V419 M425 465V486 M425 539V560 M425 606V627" marker-end="url(#query-arrow)"/>
</svg>
</div>

For the battery policy, use `region=AU`, `product=iPhone`, and `status=current` to narrow results; verify the caller may access the policy; fuse lexical and semantic candidates; then send the best permitted excerpts, section paths, and citation IDs to the LLM.

### Worked example: searching millions of Northstar policies

Imagine Northstar stores **20 million policy chunks**. A customer asks the battery question. We do not send all 20 million chunks to a reranker or to Bedrock. Each stage has a different job:

<figure class="aws-architecture" aria-labelledby="northstar-retrieval-caption">
  <div class="aws-architecture__title">Northstar: find broadly, judge narrowly</div>
  <div class="aws-flow">
    <div class="aws-node aws-node--person"><strong>Question</strong><small>“Can I replace my worn-out iPhone battery in Australia?”</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--security"><strong>Scope + access</strong><small>region=AU · product=iPhone · current policy · caller ACL</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--storage"><strong>Fast retrieval</strong><small>BM25 + vector ANN + metadata<br>20M → Top 100 candidates</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--operations"><strong>Reranker</strong><small>Reads question + each candidate together<br>Top 100 → Top 8</small></div>
    <span class="aws-arrow" aria-hidden="true">→</span>
    <div class="aws-node aws-node--ai"><strong>Bedrock answer</strong><small>Only the best permitted chunks enter context<br>Answer with citations</small></div>
  </div>
  <figcaption id="northstar-retrieval-caption">Retrieval optimizes recall and speed; reranking spends more computation on a small shortlist; generation receives only the final evidence.</figcaption>
</figure>

| Stage | What Northstar does | Why it exists | Typical trade-off |
|---|---|---|---|
| **1. Scope and authorization** | Applies trusted filters such as country, product, version, and caller permissions | Prevents irrelevant or forbidden chunks from becoming candidates | Narrowing too aggressively can remove the correct policy; authorization must come from trusted identity/ACL data |
| **2. First-stage retrieval** | Runs metadata filters, lexical/BM25 search for exact policy IDs and terms, vector ANN for meaning, or hybrid search | Searches millions of chunks quickly and protects recall | It is fast, but its ranking is approximate and may include noisy candidates |
| **3. Candidate Top-K** | Keeps, for example, the best 100 candidates after fusion | Makes the expensive next step affordable | `K=5` may be too small and lose evidence; `K=1000` raises latency and cost |
| **4. Reranking** | Sends the question and each of the 100 candidates to a more expensive reranker | Judges the relationship between the exact question and each passage more deeply | Better relevance per candidate, but more compute, latency, and cost |
| **5. Context pruning** | Keeps the best 5–8 permitted chunks within the token budget | Prevents irrelevant text from reaching the generator | A threshold must be calibrated; reranker scores are not universal probabilities |
| **6. Generation** | Sends the final excerpts, metadata, and citation IDs to Bedrock | Produces a conversational answer grounded in selected evidence | The LLM cannot recover a policy that retrieval failed to find |

**The key distinction:** first-stage retrieval is the **fast librarian scanning the catalogue**; reranking is the **senior librarian reading the shortlisted books side by side**. We do not ask the senior librarian to read all 20 million books because that would be too slow and expensive. We also do not ask the fast catalogue search to make the final judgment because it is optimized for recall and speed, not deep passage-level relevance.

If the correct battery policy never appears in the Top 100, the reranker cannot recover it. If it appears at rank 73, reranking may move it into the final Top 8. If it is retrieved but the user is not authorized, it must be excluded before the passage reaches the reranker, model context, or answer.

## Reranking: Find Broadly, Judge Narrowly

First-stage vector/BM25 retrieval is a **fast candidate finder**. A reranker is a more expensive **relevance judge** that takes a question and a small candidate set, then reorders it.

<div class="rag-diagram" role="img" aria-label="Northstar reranking pipeline retrieves top 100 candidate chunks, reranks them, selects the best eight, and sends those to the language model.">
<svg viewBox="0 0 760 145" xmlns="http://www.w3.org/2000/svg" aria-labelledby="rerank-title rerank-desc">
  <title id="rerank-title">Reranking narrows Northstar candidates</title><desc id="rerank-desc">Northstar retrieves one hundred candidates quickly; a reranker evaluates them more deeply, selects the best eight, then the LLM receives those selected chunks.</desc>
  <defs><marker id="rerank-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <rect class="node data" x="20" y="31" width="120" height="52" rx="8"/><text class="label" x="80" y="61" text-anchor="middle">Question</text><rect class="node process" x="185" y="31" width="150" height="52" rx="8"/><text class="label" x="260" y="53" text-anchor="middle">Retrieve</text><text class="small" x="260" y="72" text-anchor="middle">Top 100</text><rect class="node rank" x="380" y="31" width="150" height="52" rx="8"/><text class="label" x="455" y="61" text-anchor="middle">Reranker</text><rect class="node store" x="575" y="31" width="165" height="52" rx="8"/><text class="label" x="657" y="53" text-anchor="middle">Best 8 → LLM</text><text class="small" x="657" y="72" text-anchor="middle">with citations</text><path class="line" d="M142 57H183 M337 57H378 M532 57H573" marker-end="url(#rerank-arrow)"/>
</svg>
</div>

A typical dense-retrieval system uses a **bi-encoder** to encode queries and chunks independently, allowing document vectors to be precomputed. A **cross-encoder** reranker reads a query and candidate together; this is usually too expensive for a large corpus, so it scores a shortlist. Other rerankers exist, and improved relevance must be measured. [Sentence Transformers retrieval and reranking](https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html).

<aside class="technique-callout">
  <strong>Ranking limit</strong>
  <span><strong>Reranking cannot recover a document that first-stage retrieval failed to retrieve.</strong> Improve recall before expecting reranking to fix missing evidence.</span>
</aside>

**Dynamic context pruning** keeps a broad candidate search, then drops low-relevance candidates after reranking and before prompt construction. Calibrate a score threshold and token budget against recall and answer quality; reranker scores are not universal probabilities. Summarizing every irrelevant chunk preserves noise in compressed form, while a recency-only window can discard an older but decisive source. [AWS reranking integration](/study/infrastructureAWSAiServices#kb-internals).

## Evaluation: Does the System Retrieve and Answer Well?

Evaluate retrieval and generation separately. A polished answer may still be based on poor evidence.

<div class="rag-diagram" role="img" aria-label="Evaluation separates retrieval quality metrics on top K chunks from generation quality metrics on the final answer.">
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" aria-labelledby="eval-title eval-desc">
  <title id="eval-title">Measure retrieval quality separately from generation quality</title><desc id="eval-desc">A question goes to a retriever. Retrieval quality is measured on the returned top K chunks using precision, recall, MRR and NDCG. The LLM makes an answer, which is measured for groundedness, relevance and correctness.</desc>
  <defs><marker id="eval-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#6b7280"/></marker></defs>
  <rect class="node data" x="310" y="20" width="180" height="44" rx="8"/><text class="label" x="400" y="48" text-anchor="middle">Question</text><rect class="node process" x="310" y="92" width="180" height="44" rx="8"/><text class="label" x="400" y="120" text-anchor="middle">Retriever</text><rect class="node store" x="310" y="164" width="180" height="44" rx="8"/><text class="label" x="400" y="192" text-anchor="middle">Top K chunks</text><path class="line" d="M400 66V90 M400 138V162" marker-end="url(#eval-arrow)"/>
  <rect class="panel" x="535" y="145" width="235" height="96" rx="10"/><text class="accent-text" x="552" y="170">RETRIEVAL QUALITY</text><text class="small" x="552" y="193">Precision@K · Recall@K</text><text class="small" x="552" y="214">MRR · NDCG</text><path class="line" d="M492 186H533" marker-end="url(#eval-arrow)"/>
  <rect class="node rank" x="310" y="255" width="180" height="44" rx="8"/><text class="label" x="400" y="283" text-anchor="middle">LLM</text><rect class="node" x="310" y="321" width="180" height="28" rx="8"/><text class="label" x="400" y="341" text-anchor="middle">Answer</text><path class="line" d="M400 210V253 M400 301V319" marker-end="url(#eval-arrow)"/>
  <rect class="panel" x="535" y="274" width="235" height="75" rx="10"/><text class="accent-text" x="552" y="298">GENERATION QUALITY</text><text class="small" x="552" y="321">Groundedness · relevance</text><text class="small" x="552" y="338">correctness</text><path class="line" d="M492 335H533" marker-end="url(#eval-arrow)"/>
</svg>
</div>

**Precision@K** and **Recall@K** are a good starting pair. Suppose the corpus contains four relevant battery-policy chunks, and the top five returned are:

~~~text
1. Relevant ✓
2. Relevant ✓
3. Irrelevant ✗
4. Relevant ✓
5. Irrelevant ✗
~~~

**Precision@5 = 3 / 5 = 60%** — *“Was the stuff I found actually relevant?”*

**Recall@5 = 3 / 4 = 75%** — *“Did I find the relevant stuff?”*

For the underlying TP/FP/FN definitions, F1, and why accuracy can mislead on imbalanced data, see [classification metrics](/study/aiInfrastructure#classification-metrics). Here, K is the number of retrieved results; it is unrelated to the model's next-token top-k sampling control. AWS-specific query and click trends are covered under [Kendra Search Analytics](/study/infrastructureAWSAiServices#kendra-search-analytics).

MRR rewards placing the first useful result early; NDCG also accounts for graded relevance and ranking position. Use retrieval and answer metrics together, but never substitute one for the other:

| Layer | Measure | What it reveals |
| --- | --- | --- |
| Retrieval | Precision@K, Recall@K, MRR, NDCG | Whether permitted, relevant evidence was found and ranked high enough. |
| Grounded answer | faithfulness/groundedness, citation entailment, source validity | Whether each answer claim is supported by the supplied evidence and valid citation. |
| Task answer | correctness, relevance, completeness, refusal/uncertainty, schema validity | Whether the user received an appropriate answer, including a safe no-answer when evidence is absent. |

- Include questions with no relevant document, stale documents, conflicting sources, exact identifiers, paraphrases, ACL denial, and tenant boundaries.
- Record source version, chunking/index configuration, embedding model, retrieval query/filters, candidate ranks, and final citations so a bad answer can be traced to the layer that failed.
- Keep document authorization separate from relevance: a perfect match that the caller may not access must never enter the context.

Agent task/tool metrics belong on [AI Agents](/study/aiAgents#section-9-evaluation). Release gates, human review, judge calibration, latency, and cost monitoring belong on [AI Infrastructure and Evaluation](/study/aiInfrastructure#section-12-evaluation).

## Check your understanding {#cheat-sheet}

- A policy ID is missing from results: would you inspect lexical retrieval, ANN search effort, or the answer prompt first?
- The relevant chunk is absent from the candidate set: can a reranker help?
- The right document was retrieved but its exception was lost: inspect the parser and chunk boundary before changing the generation model.
- The answer cites a real document that does not support its claim: inspect citation entailment and grounding, separately from retrieval recall.

Continue to [AI Agents](/study/aiAgents) for using evidence during tool execution. For AWS implementations, see [AWS AI Services](/study/infrastructureAWSAiServices#section-8-retrieval-choice).
